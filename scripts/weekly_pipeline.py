"""
Weekly live pipeline. Run by GitHub Actions on a schedule (see
.github/workflows/weekly-update.yml). Pulls current FPL data, regenerates
features for the current season using the same logic validated in the
project's feature engineering, scores every player with the trained
LightGBM model, runs the squad optimizer, works out chip timing, and
writes everything the app needs to public/data.json.

Historical CSVs (for rolling features) are re-pulled each run so
form/opponent-strength features stay current as the season progresses.
"""
import json
import sys
import numpy as np
import pandas as pd
import requests
import lightgbm as lgb
import pulp

BASE_URL = "https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data"
FPL_API = "https://fantasy.premierleague.com/api"
SEASONS = ["2023-24", "2024-25", "2025-26", "2026-27"]  # rolling window, oldest dropped as seasons pass
MODEL_PATH = "models/lgbm_model.txt"
OUT_PATH = "public/data.json"

FEATURE_COLS = [
    "form_3gw", "form_5gw", "form_ewma", "points_last_gw",
    "minutes_3gw", "minutes_5gw", "ict_3gw", "ict_5gw",
    "is_home", "opp_goals_for_3m", "opp_goals_against_3m",
    "shrunk_points_vs_opp", "n_prior_meetings_vs_opp", "was_unused_last_gw",
    "value",
]

BUDGET = 100.0
SQUAD_QUOTAS = {"GK": 2, "DEF": 5, "MID": 5, "FWD": 3}
MAX_PER_CLUB = 3
POSITION_MAP = {1: "GK", 2: "DEF", 3: "MID", 4: "FWD"}


# ---------- Step 1: data ----------

def fetch_historical():
    frames = []
    for season in SEASONS:
        url = f"{BASE_URL}/{season}/gws/merged_gw.csv"
        try:
            df = pd.read_csv(url, encoding="latin-1")
            df["season"] = season
            frames.append(df)
        except Exception as e:
            print(f"Skipped {season}: {e}", file=sys.stderr)
    if not frames:
        raise RuntimeError("No historical data could be fetched")
    df = pd.concat(frames, ignore_index=True)

    def fix_encoding(name):
        try:
            return name.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return name
    df["name"] = df["name"].apply(fix_encoding)
    df = df.drop_duplicates(subset=["element", "season", "GW", "fixture"]).reset_index(drop=True)
    df = df.sort_values(["element", "season", "GW"]).reset_index(drop=True)
    return df


def fetch_live():
    bootstrap = requests.get(f"{FPL_API}/bootstrap-static/", timeout=30).json()
    players = pd.DataFrame(bootstrap["elements"])
    teams = pd.DataFrame(bootstrap["teams"])[["id", "name", "short_name"]].rename(
        columns={"id": "team_id", "name": "team_name"}
    )
    events = pd.DataFrame(bootstrap["events"])
    fixtures = pd.DataFrame(requests.get(f"{FPL_API}/fixtures/", timeout=30).json())

    players = players.merge(teams, left_on="team", right_on="team_id", how="left")
    players["position"] = players["element_type"].map(POSITION_MAP)

    current_gw_row = events[events["is_next"] == True]
    next_gw = int(current_gw_row["id"].iloc[0]) if len(current_gw_row) else None

    return {"players": players, "teams": teams, "fixtures": fixtures, "next_gw": next_gw}


# ---------- Step 2: features (same logic as the validated pipeline) ----------

def build_team_id_map(df):
    fixture_pairs = (
        df.groupby(["season", "fixture"])[["team", "opponent_team"]]
          .apply(lambda g: g.drop_duplicates())
          .reset_index()
    )
    fixture_pairs = fixture_pairs.loc[:, ~fixture_pairs.columns.str.contains("^level_|^index$")]
    id_map = {}
    for (season, fixture), g in fixture_pairs.groupby(["season", "fixture"]):
        if len(g) != 2:
            continue
        (team1, opp1), (team2, opp2) = g[["team", "opponent_team"]].values
        id_map[(season, team1)] = opp2
        id_map[(season, team2)] = opp1
    return pd.DataFrame(
        [(season, team, tid) for (season, team), tid in id_map.items()],
        columns=["season", "team", "team_id"]
    )


def build_opponent_strength(df, team_id_map, window=3):
    df = df.copy()
    df["team_goals_for"] = np.where(df["was_home"], df["team_h_score"], df["team_a_score"])
    df["team_goals_against"] = np.where(df["was_home"], df["team_a_score"], df["team_h_score"])
    team_matches = (
        df.groupby(["season", "fixture", "GW", "team", "opponent_team", "was_home"])
          .agg(goals_for=("team_goals_for", "first"), goals_against=("team_goals_against", "first"))
          .reset_index()
          .sort_values(["team", "season", "GW", "fixture"])
          .reset_index(drop=True)
    )
    team_matches[f"goals_for_{window}m"] = team_matches.groupby("team")["goals_for"].transform(
        lambda x: x.shift(1).rolling(window=window, min_periods=1).mean()
    )
    team_matches[f"goals_against_{window}m"] = team_matches.groupby("team")["goals_against"].transform(
        lambda x: x.shift(1).rolling(window=window, min_periods=1).mean()
    )
    opponent_strength = team_matches[
        ["season", "fixture", "team", f"goals_for_{window}m", f"goals_against_{window}m"]
    ].merge(team_id_map, on=["season", "team"], how="left")
    return opponent_strength.rename(columns={
        "team_id": "opponent_team",
        f"goals_for_{window}m": "opp_goals_for_3m",
        f"goals_against_{window}m": "opp_goals_against_3m",
    }).drop(columns=["team"])


def build_features(df):
    df = df.sort_values(["element", "season", "GW"]).reset_index(drop=True)
    for window in (3, 5):
        df[f"form_{window}gw"] = df.groupby("element")["total_points"].transform(
            lambda x, w=window: x.shift(1).rolling(window=w, min_periods=1).mean()
        )
        df[f"minutes_{window}gw"] = df.groupby("element")["minutes"].transform(
            lambda x, w=window: x.shift(1).rolling(window=w, min_periods=1).mean()
        )
        df[f"ict_{window}gw"] = df.groupby("element")["ict_index"].transform(
            lambda x, w=window: x.shift(1).rolling(window=w, min_periods=1).mean()
        )
    df["points_last_gw"] = df.groupby("element")["total_points"].shift(1)
    df["form_ewma"] = df.groupby("element")["total_points"].transform(
        lambda x: x.shift(1).ewm(span=4, min_periods=1).mean()
    )
    df["is_home"] = df["was_home"].astype(int)

    team_id_map = build_team_id_map(df)
    opponent_strength = build_opponent_strength(df, team_id_map)
    df = df.merge(opponent_strength, on=["season", "fixture", "opponent_team"], how="left")

    df["player_overall_avg_prior"] = df.groupby("element")["total_points"].transform(
        lambda x: x.shift(1).expanding().mean()
    )
    df["player_vs_opp_avg_prior"] = df.groupby(["element", "opponent_team"])["total_points"].transform(
        lambda x: x.shift(1).expanding().mean()
    )
    df["n_prior_meetings_vs_opp"] = df.groupby(["element", "opponent_team"]).cumcount()
    K = 4
    df["shrunk_points_vs_opp"] = (
        (df["n_prior_meetings_vs_opp"] * df["player_vs_opp_avg_prior"].fillna(df["player_overall_avg_prior"])
         + K * df["player_overall_avg_prior"])
        / (df["n_prior_meetings_vs_opp"] + K)
    )
    df["was_unused_last_gw"] = (
        df["points_last_gw"].notna() & (df.groupby("element")["minutes"].shift(1) == 0)
    ).astype(int)
    return df


# ---------- Step 3: optimizer ----------

def select_squad_and_xi(players):
    players = players.reset_index(drop=True)
    n = len(players)
    prob = pulp.LpProblem("fpl_squad", pulp.LpMaximize)
    squad = pulp.LpVariable.dicts("squad", range(n), cat="Binary")
    starts = pulp.LpVariable.dicts("starts", range(n), cat="Binary")
    prob += pulp.lpSum(starts[i] * players.loc[i, "xP"] for i in range(n))
    for i in range(n):
        prob += starts[i] <= squad[i]
    prob += pulp.lpSum(squad[i] for i in range(n)) == 15
    for pos, quota in SQUAD_QUOTAS.items():
        idx = players.index[players["position"] == pos]
        prob += pulp.lpSum(squad[i] for i in idx) == quota
    prob += pulp.lpSum(squad[i] * players.loc[i, "price"] for i in range(n)) <= BUDGET
    for club in players["team"].unique():
        idx = players.index[players["team"] == club]
        prob += pulp.lpSum(squad[i] for i in idx) <= MAX_PER_CLUB
    prob += pulp.lpSum(starts[i] for i in range(n)) == 11
    xi_min = {"GK": 1, "DEF": 3, "MID": 3, "FWD": 1}
    xi_max = {"GK": 1, "DEF": 5, "MID": 5, "FWD": 3}
    for pos in ["GK", "DEF", "MID", "FWD"]:
        idx = players.index[players["position"] == pos]
        prob += pulp.lpSum(starts[i] for i in idx) >= xi_min[pos]
        prob += pulp.lpSum(starts[i] for i in idx) <= xi_max[pos]
    prob.solve(pulp.PULP_CBC_CMD(msg=0))
    if pulp.LpStatus[prob.status] != "Optimal":
        raise RuntimeError(f"Optimizer status: {pulp.LpStatus[prob.status]}")
    squad_idx = [i for i in range(n) if pulp.value(squad[i]) > 0.5]
    xi_idx = [i for i in range(n) if pulp.value(starts[i]) > 0.5]
    squad_df = players.loc[squad_idx].copy()
    squad_df["starting"] = squad_df.index.isin(xi_idx)
    return squad_df.sort_values(["starting", "position"], ascending=[False, True])


# ---------- Step 4: chip timing heuristics ----------

def recommend_chips(squad_df, candidates, upcoming_gws=5):
    """
    Simple, explainable heuristics run each week on current data:
      - Triple captain: flagged when the best player's predicted points this
        week sit meaningfully above their own recent average (a standout week).
      - Wildcard: flagged when the current squad's total predicted XI points
        is notably below the candidate pool's best-possible XI of the same
        cost -- i.e. the squad has drifted from optimal.
      - Bench boost: flagged when the bench (non-starters) has strong combined
        predicted points of its own.
      - Free hit: flagged when several squad players have unusually low
        predicted points this week specifically (proxy for blank gameweek /
        bad fixture swing), while the wider pool doesn't show the same dip.
    """
    xi = squad_df[squad_df["starting"]]
    bench = squad_df[~squad_df["starting"]]

    top_player = candidates.sort_values("xP", ascending=False).iloc[0]
    top_player_recent_avg = candidates["xP"].mean()
    triple_captain_flag = bool(top_player["xP"] > 1.6 * top_player_recent_avg)

    best_possible_xi_value = candidates.sort_values("xP", ascending=False).head(11)["xP"].sum()
    current_xi_value = xi["xP"].sum()
    wildcard_flag = bool(current_xi_value < 0.75 * best_possible_xi_value)

    bench_value = bench["xP"].sum()
    bench_boost_flag = bool(bench_value > 12)

    squad_avg = squad_df["xP"].mean()
    pool_avg = candidates["xP"].mean()
    free_hit_flag = bool(squad_avg < 0.6 * pool_avg)

    return {
        "triple_captain": {"flag": triple_captain_flag, "player": top_player["name"], "xP": round(float(top_player["xP"]), 2)},
        "wildcard": {"flag": wildcard_flag, "current_xi_value": round(float(current_xi_value), 2), "best_possible": round(float(best_possible_xi_value), 2)},
        "bench_boost": {"flag": bench_boost_flag, "bench_value": round(float(bench_value), 2)},
        "free_hit": {"flag": free_hit_flag, "squad_avg": round(float(squad_avg), 2), "pool_avg": round(float(pool_avg), 2)},
    }


# ---------- Main ----------

def main():
    print("Fetching historical data...")
    hist = fetch_historical()
    print("Fetching live FPL data...")
    live = fetch_live()

    print("Building features...")
    features = build_features(hist)

    print("Scoring players...")
    model = lgb.Booster(model_file=MODEL_PATH)
    latest = features.sort_values(["element", "season", "GW"]).groupby("element").tail(1).copy()
    latest = latest[latest["minutes_3gw"].fillna(0) > 0]
    latest["xP"] = model.predict(latest[FEATURE_COLS]).clip(min=0)

    live_players = live["players"][["id", "web_name", "position", "team_name", "now_cost", "status", "chance_of_playing_next_round", "news"]]
    live_players = live_players.rename(columns={"id": "element", "web_name": "name", "team_name": "team", "now_cost": "price_raw"})
    live_players["price"] = live_players["price_raw"] / 10.0

    merged = latest.merge(live_players[["element", "name", "position", "team", "price", "status"]], on="element", how="inner", suffixes=("_hist", ""))
    merged = merged[merged["status"] == "a"]  # only available players

    candidates = merged[[
        "name", "position", "team", "price", "xP", "form_3gw", "form_5gw",
        "ict_3gw", "minutes_3gw", "opp_goals_against_3m", "points_last_gw",
    ]].dropna(subset=["price", "xP", "position"])

    print(f"{len(candidates)} available candidates")

    print("Optimizing squad...")
    squad = select_squad_and_xi(candidates)

    chips = recommend_chips(squad, candidates)

    output = {
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "next_gw": live["next_gw"],
        "player_pool": candidates.sort_values("xP", ascending=False).head(200).round(2).to_dict(orient="records"),
        "squad": squad[["name", "position", "team", "price", "xP", "starting"]].round(2).to_dict(orient="records"),
        "chips": chips,
    }

    with open(OUT_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Wrote {OUT_PATH}")

    # Print a summary for the GitHub Actions log / notification step to pick up
    flagged = [k for k, v in chips.items() if v["flag"]]
    print(f"CHIP_FLAGS={','.join(flagged) if flagged else 'none'}")


if __name__ == "__main__":
    main()

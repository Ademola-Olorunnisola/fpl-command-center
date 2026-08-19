# FPL Command Center

A React web app for FPL squad planning, predictions, and chip strategy —
now with a weekly self-updating pipeline and push notifications for chip
timing.

## What's new: live automatic updates

- `scripts/weekly_pipeline.py` pulls fresh FPL data, regenerates features,
  scores every player with your trained model, re-optimizes the squad, and
  works out chip timing — writing everything to `public/data.json`.
- `.github/workflows/weekly-update.yml` runs that script automatically every
  Tuesday (editable), commits the updated data, and (if your deployment
  platform auto-deploys on push, e.g. Vercel) the live site picks it up
  within a minute or two.
- The app fetches `/data.json` at runtime. If it's not there yet (e.g. right
  after first deploy, before the workflow has run once), it falls back to
  the bundled snapshot data automatically — the app never breaks, it just
  shows a "bundled snapshot" notice until the first live update lands.
- A push notification fires (via ntfy.sh, free, no signup) whenever the
  model flags a chip — triple captain, wildcard, bench boost, or free hit —
  worth playing that gameweek.

## One-time setup

### 1. Push this to GitHub (if you haven't already)

```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fpl-command-center.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel (or Netlify)

Go to vercel.com, sign in with GitHub, "New Project", select the repo,
click Deploy. Auto-detects Vite, no config needed.

### 3. Set up push notifications (2 minutes, free, no signup)

1. Pick a private topic name only you know — e.g. `ademola-fpl-a91x` (make
   it hard to guess; anyone who knows it can see your notifications, since
   ntfy topics are public by name).
2. On your phone: install the **ntfy** app (iOS App Store / Google Play), or
   just visit `https://ntfy.sh/YOUR_TOPIC_NAME` in a browser and click
   Subscribe.
3. In your GitHub repo: Settings → Secrets and variables → Actions → New
   repository secret. Name it `NTFY_TOPIC`, value is your topic name from
   step 1.

That's it — the next scheduled run (or a manual trigger, see below) will
notify your phone if a chip is worth playing.

### 4. Let GitHub Actions push to the repo

The workflow needs permission to commit the updated `data.json` back to your
repo. This is usually on by default, but if the workflow fails with a
permissions error: Settings → Actions → General → Workflow permissions →
"Read and write permissions" → Save.

## Running it manually

You don't have to wait for the weekly schedule:
- On GitHub: go to the Actions tab → "Weekly FPL update" → "Run workflow"
- Locally: `pip install pandas numpy lightgbm pulp requests && python scripts/weekly_pipeline.py`
  (writes `public/data.json` locally — commit and push it, or just run
  `npm run dev` to preview with the fresh data before pushing)

## Changing the schedule

Edit the `cron` line in `.github/workflows/weekly-update.yml`. It's currently
`0 8 * * 2` (Tuesdays 08:00 UTC). https://crontab.guru helps if you want a
different day or time.

## Chip recommendation logic

The heuristics in `recommend_chips()` (in `scripts/weekly_pipeline.py`) are
intentionally simple and explainable — not a separately trained model:

- **Triple captain**: flagged when the top predicted player this week scores
  meaningfully above the pool's average (an outlier week).
- **Wildcard**: flagged when your current squad's predicted XI total is
  notably below the best possible XI at the same budget — a sign your squad
  has drifted from optimal.
- **Bench boost**: flagged when your bench's combined predicted points are
  strong enough to be worth playing.
- **Free hit**: flagged when your squad's average predicted points are much
  lower than the wider player pool's — a proxy for a bad fixture week.

These are starting heuristics, not a tuned model — treat the flags as a
prompt to look closer, not gospel. Feel free to tune the thresholds in that
function once you've seen a few weeks of real output.

## Original setup (local dev, manual data updates)

```
npm install
npm run dev
```

To manually swap in new predictions without the automated pipeline: replace
the `PLAYER_POOL` and `SEASON_SQUAD` constants near the top of `src/App.jsx`
(the fallback data used when `data.json` isn't present), commit, and push.

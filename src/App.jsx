import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Shield, Star, TrendingUp, Wallet, Users, Zap, RefreshCw, AlertCircle, Trophy, Info } from 'lucide-react';

const POS_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
const POS_COLOR = {
  GK: { bg: '#D8A93E', text: '#3A2A05' },
  DEF: { bg: '#4C8FD1', text: '#062038' },
  MID: { bg: '#3EBD8B', text: '#04261A' },
  FWD: { bg: '#E0684F', text: '#3A140B' },
};
const SQUAD_QUOTAS = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
const BUDGET = 100.0;
const MAX_PER_CLUB = 3;

function fmtPrice(p) { return `£${Number(p).toFixed(1)}m`; }
function fmtPts(p) { return Number(p).toFixed(2); }

const SEASON_SQUAD = [
  { name: "David Raya Martín", position: "GK", team: "Arsenal", price: 6.2, xP: 3.20, starting: true },
  { name: "Freddie Woodman", position: "GK", team: "Liverpool", price: 3.9, xP: 0.56, starting: false },
  { name: "Gabriel dos Santos Magalhães", position: "DEF", team: "Arsenal", price: 7.3, xP: 3.63, starting: true },
  { name: "Virgil van Dijk", position: "DEF", team: "Liverpool", price: 6.1, xP: 3.66, starting: true },
  { name: "James Tarkowski", position: "DEF", team: "Everton", price: 5.8, xP: 3.40, starting: true },
  { name: "Josh Acheampong", position: "DEF", team: "Chelsea", price: 3.7, xP: 1.28, starting: false },
  { name: "Sam Byram", position: "DEF", team: "Leeds", price: 3.7, xP: 0.61, starting: false },
  { name: "Bruno Borges Fernandes", position: "MID", team: "Man Utd", price: 10.4, xP: 5.53, starting: true },
  { name: "Dominik Szoboszlai", position: "MID", team: "Liverpool", price: 7.1, xP: 4.42, starting: true },
  { name: "Pascal Groß", position: "MID", team: "Brighton", price: 5.6, xP: 3.84, starting: true },
  { name: "Jérémy Doku", position: "MID", team: "Man City", price: 6.5, xP: 4.08, starting: true },
  { name: "Elliot Anderson", position: "MID", team: "Nott'm Forest", price: 5.7, xP: 3.78, starting: true },
  { name: "Erling Haaland", position: "FWD", team: "Man City", price: 14.7, xP: 7.39, starting: true },
  { name: "Ollie Watkins", position: "FWD", team: "Aston Villa", price: 8.7, xP: 4.68, starting: true },
  { name: "Mateus Mané", position: "FWD", team: "Wolves", price: 4.2, xP: 2.38, starting: false },
];

const PLAYER_POOL = [{"name": "Erling Haaland", "position": "FWD", "team": "Man City", "xP": 7.39, "form_3gw": 6.67, "form_5gw": 6.8, "ict_3gw": 9.33, "minutes_3gw": 60.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 14.7}, {"name": "Bruno Borges Fernandes", "position": "MID", "team": "Man Utd", "xP": 5.53, "form_3gw": 5.67, "form_5gw": 5.6, "ict_3gw": 12.4, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 14, "price": 10.4}, {"name": "Bukayo Saka", "position": "MID", "team": "Arsenal", "xP": 4.78, "form_3gw": 7.67, "form_5gw": 4.8, "ict_3gw": 8.5, "minutes_3gw": 71.33, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 10.0}, {"name": "Ollie Watkins", "position": "FWD", "team": "Aston Villa", "xP": 4.68, "form_3gw": 8.33, "form_5gw": 8.6, "ict_3gw": 10.47, "minutes_3gw": 70.0, "opp_goals_against_3m": 0.33, "last_gw_points": 13, "price": 8.7}, {"name": "Dominik Szoboszlai", "position": "MID", "team": "Liverpool", "xP": 4.42, "form_3gw": 8.0, "form_5gw": 6.0, "ict_3gw": 12.53, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 7.1}, {"name": "Matheus Santos Carneiro da Cunha", "position": "MID", "team": "Man Utd", "xP": 4.32, "form_3gw": 6.0, "form_5gw": 5.0, "ict_3gw": 9.5, "minutes_3gw": 85.0, "opp_goals_against_3m": 1.33, "last_gw_points": 0, "price": 8.1}, {"name": "J\u00e9r\u00e9my Doku", "position": "MID", "team": "Man City", "xP": 4.08, "form_3gw": 4.67, "form_5gw": 7.0, "ict_3gw": 10.3, "minutes_3gw": 65.33, "opp_goals_against_3m": 2.0, "last_gw_points": 1, "price": 6.5}, {"name": "Jarrod Bowen", "position": "FWD", "team": "West Ham", "xP": 4.02, "form_3gw": 2.0, "form_5gw": 3.6, "ict_3gw": 4.97, "minutes_3gw": 89.0, "opp_goals_against_3m": 0.67, "last_gw_points": 12, "price": 7.8}, {"name": "Bruno Guimar\u00e3es Rodriguez Moura", "position": "MID", "team": "Newcastle", "xP": 3.99, "form_3gw": 5.33, "form_5gw": 3.8, "ict_3gw": 7.63, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 6.9}, {"name": "Morgan Rogers", "position": "MID", "team": "Aston Villa", "xP": 3.92, "form_3gw": 5.0, "form_5gw": 5.2, "ict_3gw": 6.7, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.33, "last_gw_points": 0, "price": 7.3}, {"name": "Pascal Gro\u00df", "position": "MID", "team": "Brighton", "xP": 3.84, "form_3gw": 3.67, "form_5gw": 5.4, "ict_3gw": 7.73, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 5.6}, {"name": "Cole Palmer", "position": "MID", "team": "Chelsea", "xP": 3.81, "form_3gw": 1.33, "form_5gw": 1.2, "ict_3gw": 4.13, "minutes_3gw": 89.33, "opp_goals_against_3m": 0.67, "last_gw_points": 8, "price": 10.3}, {"name": "Elliot Anderson", "position": "MID", "team": "Nott'm Forest", "xP": 3.78, "form_3gw": 8.33, "form_5gw": 7.2, "ict_3gw": 7.17, "minutes_3gw": 75.0, "opp_goals_against_3m": 0.33, "last_gw_points": 2, "price": 5.7}, {"name": "Dominic Calvert-Lewin", "position": "FWD", "team": "Leeds", "xP": 3.74, "form_3gw": 6.67, "form_5gw": 5.6, "ict_3gw": 6.53, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.33, "last_gw_points": 2, "price": 5.8}, {"name": "Igor Thiago Nascimento Rodrigues", "position": "FWD", "team": "Brentford", "xP": 3.7, "form_3gw": 3.33, "form_5gw": 2.6, "ict_3gw": 6.27, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 2, "price": 7.2}, {"name": "Leandro Trossard", "position": "MID", "team": "Arsenal", "xP": 3.67, "form_3gw": 6.0, "form_5gw": 3.8, "ict_3gw": 7.9, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 6.6}, {"name": "Virgil van Dijk", "position": "DEF", "team": "Liverpool", "xP": 3.66, "form_3gw": 5.67, "form_5gw": 5.8, "ict_3gw": 6.6, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 6.1}, {"name": "Gabriel dos Santos Magalh\u00e3es", "position": "DEF", "team": "Arsenal", "xP": 3.63, "form_3gw": 7.67, "form_5gw": 6.2, "ict_3gw": 4.57, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.33, "last_gw_points": 1, "price": 7.3}, {"name": "Enzo Fern\u00e1ndez", "position": "MID", "team": "Chelsea", "xP": 3.59, "form_3gw": 7.67, "form_5gw": 5.4, "ict_3gw": 9.6, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.67, "last_gw_points": 1, "price": 6.5}, {"name": "Richarlison de Andrade", "position": "FWD", "team": "Spurs", "xP": 3.57, "form_3gw": 6.0, "form_5gw": 4.4, "ict_3gw": 8.37, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 2, "price": 6.5}, {"name": "Isma\u00efla Sarr", "position": "MID", "team": "Crystal Palace", "xP": 3.55, "form_3gw": 5.0, "form_5gw": 4.2, "ict_3gw": 7.97, "minutes_3gw": 70.0, "opp_goals_against_3m": 0.0, "last_gw_points": 1, "price": 6.4}, {"name": "Igor Jesus Maciel da Cruz", "position": "FWD", "team": "Nott'm Forest", "xP": 3.52, "form_3gw": 2.67, "form_5gw": 5.8, "ict_3gw": 6.1, "minutes_3gw": 70.0, "opp_goals_against_3m": 0.33, "last_gw_points": 2, "price": 5.9}, {"name": "Morgan Gibbs-White", "position": "MID", "team": "Nott'm Forest", "xP": 3.5, "form_3gw": 3.67, "form_5gw": 8.8, "ict_3gw": 5.77, "minutes_3gw": 36.67, "opp_goals_against_3m": 0.33, "last_gw_points": 9, "price": 7.6}, {"name": "William Osula", "position": "FWD", "team": "Newcastle", "xP": 3.47, "form_3gw": 8.0, "form_5gw": 7.0, "ict_3gw": 8.17, "minutes_3gw": 73.67, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 5.5}, {"name": "Mohamed Salah", "position": "MID", "team": "Liverpool", "xP": 3.45, "form_3gw": 0.33, "form_5gw": 2.4, "ict_3gw": 0.37, "minutes_3gw": 5.33, "opp_goals_against_3m": 1.67, "last_gw_points": 6, "price": 14.0}, {"name": "James Tarkowski", "position": "DEF", "team": "Everton", "xP": 3.4, "form_3gw": 6.0, "form_5gw": 4.4, "ict_3gw": 8.1, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 3, "price": 5.8}, {"name": "Dango Ouattara", "position": "MID", "team": "Brentford", "xP": 3.37, "form_3gw": 7.33, "form_5gw": 5.2, "ict_3gw": 7.23, "minutes_3gw": 67.0, "opp_goals_against_3m": 2.67, "last_gw_points": 2, "price": 5.6}, {"name": "Viktor Gy\u00f6keres", "position": "FWD", "team": "Arsenal", "xP": 3.35, "form_3gw": 6.33, "form_5gw": 4.2, "ict_3gw": 7.3, "minutes_3gw": 56.67, "opp_goals_against_3m": 2.33, "last_gw_points": 1, "price": 9.1}, {"name": "Cody Gakpo", "position": "MID", "team": "Liverpool", "xP": 3.34, "form_3gw": 3.33, "form_5gw": 3.4, "ict_3gw": 4.07, "minutes_3gw": 79.67, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 7.3}, {"name": "William Saliba", "position": "DEF", "team": "Arsenal", "xP": 3.33, "form_3gw": 6.33, "form_5gw": 5.8, "ict_3gw": 3.57, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 6.3}, {"name": "Mathys Tel", "position": "MID", "team": "Spurs", "xP": 3.27, "form_3gw": 5.33, "form_5gw": 3.6, "ict_3gw": 6.13, "minutes_3gw": 88.0, "opp_goals_against_3m": 2.67, "last_gw_points": 3, "price": 6.2}, {"name": "Bryan Mbeumo", "position": "MID", "team": "Man Utd", "xP": 3.27, "form_3gw": 3.33, "form_5gw": 3.2, "ict_3gw": 5.43, "minutes_3gw": 56.0, "opp_goals_against_3m": 1.33, "last_gw_points": 9, "price": 8.3}, {"name": "Jack Hinshelwood", "position": "MID", "team": "Brighton", "xP": 3.25, "form_3gw": 6.0, "form_5gw": 5.6, "ict_3gw": 7.53, "minutes_3gw": 85.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 5.2}, {"name": "Yankuba Minteh", "position": "MID", "team": "Brighton", "xP": 3.25, "form_3gw": 4.67, "form_5gw": 3.6, "ict_3gw": 6.4, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 1, "price": 5.5}, {"name": "Declan Rice", "position": "MID", "team": "Arsenal", "xP": 3.24, "form_3gw": 4.33, "form_5gw": 3.4, "ict_3gw": 3.73, "minutes_3gw": 81.0, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 7.2}, {"name": "Daniel Mu\u00f1oz Mej\u00eda", "position": "DEF", "team": "Crystal Palace", "xP": 3.24, "form_3gw": 3.0, "form_5gw": 3.0, "ict_3gw": 6.03, "minutes_3gw": 87.0, "opp_goals_against_3m": 0.0, "last_gw_points": 1, "price": 5.9}, {"name": "Valent\u00edn Castellanos", "position": "FWD", "team": "West Ham", "xP": 3.22, "form_3gw": 2.67, "form_5gw": 2.2, "ict_3gw": 7.17, "minutes_3gw": 64.67, "opp_goals_against_3m": 0.67, "last_gw_points": 8, "price": 5.5}, {"name": "Iliman Ndiaye", "position": "MID", "team": "Everton", "xP": 3.21, "form_3gw": 2.0, "form_5gw": 2.4, "ict_3gw": 5.13, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 6.3}, {"name": "David Raya Mart\u00edn", "position": "GK", "team": "Arsenal", "xP": 3.2, "form_3gw": 7.0, "form_5gw": 6.4, "ict_3gw": 1.23, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 6.2}, {"name": "Mikkel Damsgaard", "position": "MID", "team": "Brentford", "xP": 3.2, "form_3gw": 5.67, "form_5gw": 4.8, "ict_3gw": 5.27, "minutes_3gw": 82.67, "opp_goals_against_3m": 2.67, "last_gw_points": 1, "price": 5.6}, {"name": "Antoine Semenyo", "position": "MID", "team": "Man City", "xP": 3.2, "form_3gw": 4.33, "form_5gw": 3.6, "ict_3gw": 5.57, "minutes_3gw": 78.33, "opp_goals_against_3m": 2.0, "last_gw_points": 6, "price": 8.0}, {"name": "Kiernan Dewsbury-Hall", "position": "MID", "team": "Everton", "xP": 3.18, "form_3gw": 3.0, "form_5gw": 4.6, "ict_3gw": 5.17, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 5.3}, {"name": "Kai Havertz", "position": "FWD", "team": "Arsenal", "xP": 3.15, "form_3gw": 3.0, "form_5gw": 3.8, "ict_3gw": 4.5, "minutes_3gw": 31.67, "opp_goals_against_3m": 2.33, "last_gw_points": 4, "price": 7.3}, {"name": "Mateus Gon\u00e7alo Espanha Fernandes", "position": "MID", "team": "West Ham", "xP": 3.14, "form_3gw": 3.33, "form_5gw": 3.4, "ict_3gw": 5.63, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.67, "last_gw_points": 9, "price": 5.5}, {"name": "Enzo Le F\u00e9e", "position": "MID", "team": "Sunderland", "xP": 3.11, "form_3gw": 6.67, "form_5gw": 6.2, "ict_3gw": 7.03, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 5, "price": 4.8}, {"name": "Pedro Porro Sauceda", "position": "DEF", "team": "Spurs", "xP": 3.06, "form_3gw": 1.67, "form_5gw": 4.6, "ict_3gw": 6.67, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 10, "price": 5.2}, {"name": "Marcus Tavernier", "position": "MID", "team": "Bournemouth", "xP": 3.05, "form_3gw": 2.33, "form_5gw": 3.2, "ict_3gw": 5.93, "minutes_3gw": 84.0, "opp_goals_against_3m": 1.67, "last_gw_points": 10, "price": 5.3}, {"name": "Rodrigo 'Rodri' Hernandez Cascante", "position": "MID", "team": "Man City", "xP": 3.05, "form_3gw": 2.33, "form_5gw": 1.4, "ict_3gw": 2.17, "minutes_3gw": 30.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 6.3}, {"name": "Danny Welbeck", "position": "FWD", "team": "Brighton", "xP": 3.03, "form_3gw": 3.0, "form_5gw": 3.4, "ict_3gw": 5.0, "minutes_3gw": 73.0, "opp_goals_against_3m": 1.33, "last_gw_points": 1, "price": 6.3}, {"name": "Bernardo Mota Veiga de Carvalho e Silva", "position": "MID", "team": "Man City", "xP": 3.02, "form_3gw": 2.67, "form_5gw": 3.0, "ict_3gw": 3.2, "minutes_3gw": 74.33, "opp_goals_against_3m": 2.0, "last_gw_points": 1, "price": 6.2}, {"name": "Harvey Barnes", "position": "MID", "team": "Newcastle", "xP": 3.01, "form_3gw": 6.0, "form_5gw": 4.2, "ict_3gw": 6.47, "minutes_3gw": 41.67, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 6.1}, {"name": "Alexis Mac Allister", "position": "MID", "team": "Liverpool", "xP": 3.01, "form_3gw": 2.33, "form_5gw": 4.2, "ict_3gw": 3.1, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 6.1}, {"name": "Martin \u00d8degaard", "position": "MID", "team": "Arsenal", "xP": 3.01, "form_3gw": 2.33, "form_5gw": 2.4, "ict_3gw": 2.27, "minutes_3gw": 37.67, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 7.8}, {"name": "Eberechi Eze", "position": "MID", "team": "Arsenal", "xP": 2.99, "form_3gw": 3.0, "form_5gw": 3.4, "ict_3gw": 3.23, "minutes_3gw": 71.67, "opp_goals_against_3m": 2.33, "last_gw_points": 1, "price": 7.3}, {"name": "John McGinn", "position": "MID", "team": "Aston Villa", "xP": 2.99, "form_3gw": 3.67, "form_5gw": 3.6, "ict_3gw": 5.9, "minutes_3gw": 57.67, "opp_goals_against_3m": 0.33, "last_gw_points": 1, "price": 5.3}, {"name": "Rayan Cherki", "position": "MID", "team": "Man City", "xP": 2.93, "form_3gw": 2.0, "form_5gw": 2.8, "ict_3gw": 4.1, "minutes_3gw": 34.67, "opp_goals_against_3m": 2.0, "last_gw_points": 1, "price": 6.5}, {"name": "Gianluigi Donnarumma", "position": "GK", "team": "Man City", "xP": 2.91, "form_3gw": 5.0, "form_5gw": 4.4, "ict_3gw": 1.8, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 5.6}, {"name": "Adrien Truffert", "position": "DEF", "team": "Bournemouth", "xP": 2.91, "form_3gw": 6.67, "form_5gw": 6.6, "ict_3gw": 5.6, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 6, "price": 4.8}, {"name": "Nick Woltemade", "position": "FWD", "team": "Newcastle", "xP": 2.88, "form_3gw": 3.33, "form_5gw": 2.4, "ict_3gw": 4.7, "minutes_3gw": 44.67, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 6.7}, {"name": "Youri Tielemans", "position": "MID", "team": "Aston Villa", "xP": 2.86, "form_3gw": 2.67, "form_5gw": 2.4, "ict_3gw": 2.93, "minutes_3gw": 89.67, "opp_goals_against_3m": 0.33, "last_gw_points": 1, "price": 5.9}, {"name": "Granit Xhaka", "position": "MID", "team": "Sunderland", "xP": 2.86, "form_3gw": 5.33, "form_5gw": 3.8, "ict_3gw": 4.67, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 5.1}, {"name": "Mois\u00e9s Caicedo Corozo", "position": "MID", "team": "Chelsea", "xP": 2.84, "form_3gw": 2.0, "form_5gw": 2.0, "ict_3gw": 3.5, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.67, "last_gw_points": 2, "price": 5.7}, {"name": "Riccardo Calafiori", "position": "DEF", "team": "Arsenal", "xP": 2.84, "form_3gw": 5.0, "form_5gw": 3.0, "ict_3gw": 4.83, "minutes_3gw": 68.67, "opp_goals_against_3m": 2.33, "last_gw_points": 1, "price": 5.6}, {"name": "Adam Wharton", "position": "MID", "team": "Crystal Palace", "xP": 2.84, "form_3gw": 5.33, "form_5gw": 3.8, "ict_3gw": 7.03, "minutes_3gw": 70.0, "opp_goals_against_3m": 0.0, "last_gw_points": 1, "price": 5.0}, {"name": "Pedro Lomba Neto", "position": "MID", "team": "Chelsea", "xP": 2.82, "form_3gw": 1.67, "form_5gw": 1.8, "ict_3gw": 2.33, "minutes_3gw": 29.33, "opp_goals_against_3m": 0.67, "last_gw_points": 6, "price": 7.0}, {"name": "Curtis Jones", "position": "MID", "team": "Liverpool", "xP": 2.82, "form_3gw": 1.67, "form_5gw": 3.2, "ict_3gw": 3.47, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 10, "price": 5.4}, {"name": "Jordan Pickford", "position": "GK", "team": "Everton", "xP": 2.81, "form_3gw": 1.67, "form_5gw": 1.4, "ict_3gw": 2.7, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 5.6}, {"name": "Rayan Vitor Simpl\u00edcio Rocha", "position": "MID", "team": "Bournemouth", "xP": 2.81, "form_3gw": 6.67, "form_5gw": 6.2, "ict_3gw": 5.9, "minutes_3gw": 82.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 5.4}, {"name": "Marcos Senesi Bar\u00f3n", "position": "DEF", "team": "Bournemouth", "xP": 2.81, "form_3gw": 8.67, "form_5gw": 6.4, "ict_3gw": 3.93, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 5.2}, {"name": "Marc Cucurella Saseta", "position": "DEF", "team": "Chelsea", "xP": 2.8, "form_3gw": 2.0, "form_5gw": 1.8, "ict_3gw": 5.0, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.67, "last_gw_points": 1, "price": 6.1}, {"name": "Brian Brobbey", "position": "FWD", "team": "Sunderland", "xP": 2.8, "form_3gw": 3.33, "form_5gw": 2.8, "ict_3gw": 5.77, "minutes_3gw": 79.0, "opp_goals_against_3m": 1.67, "last_gw_points": 5, "price": 5.3}, {"name": "Sven Botman", "position": "DEF", "team": "Newcastle", "xP": 2.78, "form_3gw": 4.0, "form_5gw": 3.6, "ict_3gw": 4.43, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 3, "price": 4.9}, {"name": "Ryan Gravenberch", "position": "MID", "team": "Liverpool", "xP": 2.78, "form_3gw": 4.67, "form_5gw": 3.4, "ict_3gw": 4.83, "minutes_3gw": 81.67, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 5.4}, {"name": "Nordi Mukiele", "position": "DEF", "team": "Sunderland", "xP": 2.76, "form_3gw": 6.33, "form_5gw": 3.6, "ict_3gw": 4.97, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 4, "price": 4.6}, {"name": "Norberto Bercique Gomes Betuncal", "position": "FWD", "team": "Everton", "xP": 2.73, "form_3gw": 3.67, "form_5gw": 4.0, "ict_3gw": 4.33, "minutes_3gw": 68.0, "opp_goals_against_3m": 1.33, "last_gw_points": 1, "price": 5.1}, {"name": "Conor Gallagher", "position": "MID", "team": "Spurs", "xP": 2.73, "form_3gw": 4.33, "form_5gw": 3.8, "ict_3gw": 4.3, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 3, "price": 5.0}, {"name": "Ethan Ampadu", "position": "MID", "team": "Leeds", "xP": 2.73, "form_3gw": 4.67, "form_5gw": 5.2, "ict_3gw": 2.33, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.33, "last_gw_points": 3, "price": 4.9}, {"name": "Marc Gu\u00e9hi", "position": "DEF", "team": "Man City", "xP": 2.72, "form_3gw": 5.67, "form_5gw": 5.6, "ict_3gw": 2.67, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 5.1}, {"name": "Carlos Henrique Casimiro", "position": "MID", "team": "Man Utd", "xP": 2.71, "form_3gw": 1.67, "form_5gw": 4.4, "ict_3gw": 4.07, "minutes_3gw": 56.67, "opp_goals_against_3m": 1.33, "last_gw_points": 0, "price": 5.8}, {"name": "Phil Foden", "position": "MID", "team": "Man City", "xP": 2.71, "form_3gw": 4.67, "form_5gw": 3.0, "ict_3gw": 6.7, "minutes_3gw": 48.33, "opp_goals_against_3m": 2.0, "last_gw_points": 2, "price": 8.0}, {"name": "Senne Lammens", "position": "GK", "team": "Man Utd", "xP": 2.71, "form_3gw": 4.0, "form_5gw": 5.0, "ict_3gw": 2.33, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 6, "price": 5.1}, {"name": "Jo\u00e3o Victor Gomes da Silva", "position": "MID", "team": "Wolves", "xP": 2.69, "form_3gw": 2.67, "form_5gw": 2.6, "ict_3gw": 3.0, "minutes_3gw": 89.33, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 5.3}, {"name": "Randal Kolo Muani", "position": "FWD", "team": "Spurs", "xP": 2.69, "form_3gw": 1.67, "form_5gw": 1.4, "ict_3gw": 3.13, "minutes_3gw": 74.67, "opp_goals_against_3m": 2.67, "last_gw_points": 1, "price": 6.9}, {"name": "Jaidon Anthony", "position": "MID", "team": "Burnley", "xP": 2.69, "form_3gw": 4.67, "form_5gw": 3.6, "ict_3gw": 4.53, "minutes_3gw": 89.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 5.0}, {"name": "Bernd Leno", "position": "GK", "team": "Fulham", "xP": 2.68, "form_3gw": 2.67, "form_5gw": 5.0, "ict_3gw": 2.63, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.0, "last_gw_points": 6, "price": 5.0}, {"name": "Andr\u00e9 Trindade da Costa Neto", "position": "MID", "team": "Wolves", "xP": 2.67, "form_3gw": 2.0, "form_5gw": 2.2, "ict_3gw": 3.03, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.0, "last_gw_points": 4, "price": 5.2}, {"name": "Jo\u00e3o Maria Lobo Alves Palhares Costa Palhinha Gon\u00e7alves", "position": "MID", "team": "Spurs", "xP": 2.66, "form_3gw": 3.0, "form_5gw": 3.8, "ict_3gw": 2.33, "minutes_3gw": 82.67, "opp_goals_against_3m": 2.67, "last_gw_points": 12, "price": 5.5}, {"name": "Chris Wood", "position": "FWD", "team": "Nott'm Forest", "xP": 2.65, "form_3gw": 1.33, "form_5gw": 2.6, "ict_3gw": 0.8, "minutes_3gw": 36.67, "opp_goals_against_3m": 0.33, "last_gw_points": 2, "price": 7.1}, {"name": "Francisco Evanilson de Lima Barbosa", "position": "FWD", "team": "Bournemouth", "xP": 2.65, "form_3gw": 2.67, "form_5gw": 2.8, "ict_3gw": 2.6, "minutes_3gw": 69.67, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 6.6}, {"name": "Nathan Collins", "position": "DEF", "team": "Brentford", "xP": 2.65, "form_3gw": 3.33, "form_5gw": 3.6, "ict_3gw": 3.03, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 3, "price": 4.9}, {"name": "Ferdi Kad\u0131o\u011flu", "position": "DEF", "team": "Brighton", "xP": 2.64, "form_3gw": 3.0, "form_5gw": 5.0, "ict_3gw": 4.43, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 1, "price": 4.5}, {"name": "Mathias Jensen", "position": "MID", "team": "Brentford", "xP": 2.64, "form_3gw": 3.0, "form_5gw": 4.4, "ict_3gw": 3.57, "minutes_3gw": 80.67, "opp_goals_against_3m": 2.67, "last_gw_points": 2, "price": 4.9}, {"name": "Kobbie Mainoo", "position": "MID", "team": "Man Utd", "xP": 2.63, "form_3gw": 6.0, "form_5gw": 5.2, "ict_3gw": 4.7, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 4.7}, {"name": "Santiago Ignacio Bueno", "position": "DEF", "team": "Wolves", "xP": 2.63, "form_3gw": 4.33, "form_5gw": 3.6, "ict_3gw": 4.93, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.0, "last_gw_points": 2, "price": 4.4}, {"name": "Jan Paul van Hecke", "position": "DEF", "team": "Brighton", "xP": 2.63, "form_3gw": 3.33, "form_5gw": 4.4, "ict_3gw": 3.07, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 1, "price": 4.7}, {"name": "Florian Wirtz", "position": "MID", "team": "Liverpool", "xP": 2.63, "form_3gw": 1.0, "form_5gw": 2.6, "ict_3gw": 2.1, "minutes_3gw": 38.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 8.3}, {"name": "Amad Diallo", "position": "MID", "team": "Man Utd", "xP": 2.62, "form_3gw": 2.0, "form_5gw": 1.6, "ict_3gw": 2.63, "minutes_3gw": 69.67, "opp_goals_against_3m": 1.33, "last_gw_points": 7, "price": 6.2}, {"name": "Loum Tchaouna", "position": "MID", "team": "Burnley", "xP": 2.61, "form_3gw": 4.0, "form_5gw": 3.0, "ict_3gw": 6.37, "minutes_3gw": 87.0, "opp_goals_against_3m": 1.67, "last_gw_points": 5, "price": 4.8}, {"name": "James Garner", "position": "MID", "team": "Everton", "xP": 2.61, "form_3gw": 2.33, "form_5gw": 2.6, "ict_3gw": 5.77, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 4, "price": 5.2}, {"name": "Anton Stach", "position": "MID", "team": "Leeds", "xP": 2.6, "form_3gw": 5.0, "form_5gw": 3.0, "ict_3gw": 5.5, "minutes_3gw": 78.0, "opp_goals_against_3m": 2.33, "last_gw_points": 0, "price": 4.8}, {"name": "Jacob Ramsey", "position": "MID", "team": "Newcastle", "xP": 2.59, "form_3gw": 4.67, "form_5gw": 3.6, "ict_3gw": 3.73, "minutes_3gw": 40.0, "opp_goals_against_3m": 1.67, "last_gw_points": 4, "price": 5.3}, {"name": "Caoimh\u00edn Kelleher", "position": "GK", "team": "Brentford", "xP": 2.58, "form_3gw": 4.33, "form_5gw": 4.2, "ict_3gw": 3.3, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 6, "price": 4.8}, {"name": "Maxim De Cuyper", "position": "DEF", "team": "Brighton", "xP": 2.58, "form_3gw": 6.0, "form_5gw": 4.6, "ict_3gw": 7.7, "minutes_3gw": 62.0, "opp_goals_against_3m": 1.33, "last_gw_points": 0, "price": 4.3}, {"name": "Robin Roefs", "position": "GK", "team": "Sunderland", "xP": 2.58, "form_3gw": 4.0, "form_5gw": 2.6, "ict_3gw": 2.63, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 4.8}, {"name": "Zian Flemming", "position": "FWD", "team": "Burnley", "xP": 2.58, "form_3gw": 2.67, "form_5gw": 3.4, "ict_3gw": 3.5, "minutes_3gw": 81.33, "opp_goals_against_3m": 1.67, "last_gw_points": 9, "price": 5.3}, {"name": "Antonee Robinson", "position": "DEF", "team": "Fulham", "xP": 2.57, "form_3gw": 4.67, "form_5gw": 3.2, "ict_3gw": 5.07, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.0, "last_gw_points": 6, "price": 4.9}, {"name": "Tom\u00e1\u0161 Sou\u010dek", "position": "MID", "team": "West Ham", "xP": 2.57, "form_3gw": 1.67, "form_5gw": 3.6, "ict_3gw": 2.6, "minutes_3gw": 80.67, "opp_goals_against_3m": 0.67, "last_gw_points": 3, "price": 5.7}, {"name": "Bart Verbruggen", "position": "GK", "team": "Brighton", "xP": 2.56, "form_3gw": 3.33, "form_5gw": 3.6, "ict_3gw": 1.6, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 4.6}, {"name": "Adam Armstrong", "position": "FWD", "team": "Wolves", "xP": 2.55, "form_3gw": 2.0, "form_5gw": 2.0, "ict_3gw": 2.77, "minutes_3gw": 83.67, "opp_goals_against_3m": 2.0, "last_gw_points": 7, "price": 5.1}, {"name": "Junior Kroupi", "position": "FWD", "team": "Bournemouth", "xP": 2.54, "form_3gw": 5.33, "form_5gw": 5.2, "ict_3gw": 4.7, "minutes_3gw": 74.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 4.7}, {"name": "Rodrigo Bentancur", "position": "MID", "team": "Spurs", "xP": 2.54, "form_3gw": 3.0, "form_5gw": 3.4, "ict_3gw": 2.73, "minutes_3gw": 78.67, "opp_goals_against_3m": 2.67, "last_gw_points": 5, "price": 5.2}, {"name": "Luke Shaw", "position": "DEF", "team": "Man Utd", "xP": 2.54, "form_3gw": 4.67, "form_5gw": 6.0, "ict_3gw": 4.0, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 6, "price": 4.5}, {"name": "Yoane Wissa", "position": "FWD", "team": "Newcastle", "xP": 2.54, "form_3gw": 1.67, "form_5gw": 1.2, "ict_3gw": 0.37, "minutes_3gw": 15.33, "opp_goals_against_3m": 1.67, "last_gw_points": 0, "price": 7.3}, {"name": "Jean-Philippe Mateta", "position": "FWD", "team": "Crystal Palace", "xP": 2.53, "form_3gw": 2.33, "form_5gw": 2.0, "ict_3gw": 2.47, "minutes_3gw": 37.67, "opp_goals_against_3m": 0.0, "last_gw_points": 6, "price": 7.6}, {"name": "Omar Marmoush", "position": "MID", "team": "Man City", "xP": 2.53, "form_3gw": 5.0, "form_5gw": 3.2, "ict_3gw": 4.4, "minutes_3gw": 40.67, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 8.3}, {"name": "Ibrahima Konat\u00e9", "position": "DEF", "team": "Liverpool", "xP": 2.52, "form_3gw": 1.0, "form_5gw": 2.2, "ict_3gw": 1.73, "minutes_3gw": 84.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 5.4}, {"name": "Kyle Walker", "position": "DEF", "team": "Burnley", "xP": 2.52, "form_3gw": 1.33, "form_5gw": 1.0, "ict_3gw": 2.13, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 4.4}, {"name": "Calvin Bassey", "position": "DEF", "team": "Fulham", "xP": 2.52, "form_3gw": 1.67, "form_5gw": 3.4, "ict_3gw": 3.27, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.0, "last_gw_points": 6, "price": 4.4}, {"name": "Crysencio Summerville", "position": "MID", "team": "West Ham", "xP": 2.52, "form_3gw": 1.33, "form_5gw": 1.8, "ict_3gw": 3.6, "minutes_3gw": 89.0, "opp_goals_against_3m": 0.67, "last_gw_points": 6, "price": 5.4}, {"name": "Timothy Castagne", "position": "DEF", "team": "Fulham", "xP": 2.52, "form_3gw": 2.67, "form_5gw": 4.0, "ict_3gw": 4.8, "minutes_3gw": 87.33, "opp_goals_against_3m": 1.0, "last_gw_points": 8, "price": 4.3}, {"name": "\u0110or\u0111e Petrovi\u0107", "position": "GK", "team": "Bournemouth", "xP": 2.51, "form_3gw": 5.0, "form_5gw": 3.4, "ict_3gw": 1.6, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 3, "price": 4.6}, {"name": "Nick Pope", "position": "GK", "team": "Newcastle", "xP": 2.51, "form_3gw": 3.33, "form_5gw": 2.4, "ict_3gw": 4.03, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 2, "price": 5.0}, {"name": "Harry Maguire", "position": "DEF", "team": "Man Utd", "xP": 2.5, "form_3gw": 4.67, "form_5gw": 4.2, "ict_3gw": 2.7, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 6, "price": 4.4}, {"name": "Yehor Yarmoliuk", "position": "MID", "team": "Brentford", "xP": 2.5, "form_3gw": 4.33, "form_5gw": 4.0, "ict_3gw": 2.83, "minutes_3gw": 85.33, "opp_goals_against_3m": 2.67, "last_gw_points": 0, "price": 5.0}, {"name": "Abdukodir Khusanov", "position": "DEF", "team": "Man City", "xP": 2.48, "form_3gw": 2.67, "form_5gw": 4.4, "ict_3gw": 1.2, "minutes_3gw": 60.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 5.4}, {"name": "Hwang Hee-chan", "position": "MID", "team": "Wolves", "xP": 2.48, "form_3gw": 2.0, "form_5gw": 1.6, "ict_3gw": 2.17, "minutes_3gw": 55.33, "opp_goals_against_3m": 2.0, "last_gw_points": 1, "price": 5.6}, {"name": "Matheus Nunes", "position": "DEF", "team": "Man City", "xP": 2.48, "form_3gw": 2.67, "form_5gw": 3.0, "ict_3gw": 3.17, "minutes_3gw": 79.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 5.3}, {"name": "Matz Sels", "position": "GK", "team": "Nott'm Forest", "xP": 2.47, "form_3gw": 4.33, "form_5gw": 4.4, "ict_3gw": 4.33, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.33, "last_gw_points": 3, "price": 4.6}, {"name": "Michael Keane", "position": "DEF", "team": "Everton", "xP": 2.47, "form_3gw": 2.33, "form_5gw": 1.8, "ict_3gw": 4.3, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.33, "last_gw_points": 4, "price": 4.5}, {"name": "S\u00e1vio Moreira de Oliveira", "position": "MID", "team": "Man City", "xP": 2.46, "form_3gw": 3.67, "form_5gw": 2.4, "ict_3gw": 3.47, "minutes_3gw": 41.67, "opp_goals_against_3m": 2.0, "last_gw_points": 2, "price": 6.9}, {"name": "Emile Smith Rowe", "position": "MID", "team": "Fulham", "xP": 2.46, "form_3gw": 1.67, "form_5gw": 2.2, "ict_3gw": 2.4, "minutes_3gw": 66.67, "opp_goals_against_3m": 1.0, "last_gw_points": 3, "price": 5.6}, {"name": "Malick Thiaw", "position": "DEF", "team": "Newcastle", "xP": 2.45, "form_3gw": 2.0, "form_5gw": 1.8, "ict_3gw": 3.6, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 4.9}, {"name": "Kevin Danso", "position": "DEF", "team": "Spurs", "xP": 2.44, "form_3gw": 3.0, "form_5gw": 3.2, "ict_3gw": 3.83, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 8, "price": 4.2}, {"name": "Keane Lewis-Potter", "position": "DEF", "team": "Brentford", "xP": 2.43, "form_3gw": 4.33, "form_5gw": 4.0, "ict_3gw": 3.97, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 5, "price": 4.8}, {"name": "Kevin Schade", "position": "MID", "team": "Brentford", "xP": 2.43, "form_3gw": 2.0, "form_5gw": 2.2, "ict_3gw": 0.8, "minutes_3gw": 65.33, "opp_goals_against_3m": 2.67, "last_gw_points": 7, "price": 6.8}, {"name": "Sa\u0161a Luki\u0107", "position": "MID", "team": "Fulham", "xP": 2.43, "form_3gw": 2.33, "form_5gw": 3.0, "ict_3gw": 3.77, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.0, "last_gw_points": 0, "price": 4.9}, {"name": "Alex Scott", "position": "MID", "team": "Bournemouth", "xP": 2.41, "form_3gw": 3.67, "form_5gw": 3.2, "ict_3gw": 3.3, "minutes_3gw": 90.0, "opp_goals_against_3m": 1.67, "last_gw_points": 0, "price": 4.9}, {"name": "Yerson Mosquera Valdelamar", "position": "DEF", "team": "Wolves", "xP": 2.41, "form_3gw": 2.33, "form_5gw": 1.4, "ict_3gw": 2.67, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.0, "last_gw_points": 3, "price": 4.3}, {"name": "J\u00f8rgen Strand Larsen", "position": "FWD", "team": "Crystal Palace", "xP": 2.39, "form_3gw": 1.67, "form_5gw": 1.6, "ict_3gw": 1.83, "minutes_3gw": 51.33, "opp_goals_against_3m": 0.0, "last_gw_points": 2, "price": 5.8}, {"name": "Nico O'Reilly", "position": "DEF", "team": "Man City", "xP": 2.39, "form_3gw": 2.33, "form_5gw": 2.8, "ict_3gw": 2.87, "minutes_3gw": 60.0, "opp_goals_against_3m": 2.0, "last_gw_points": 0, "price": 5.3}, {"name": "Merlin R\u00f6hl", "position": "MID", "team": "Everton", "xP": 2.39, "form_3gw": 5.33, "form_5gw": 3.2, "ict_3gw": 3.07, "minutes_3gw": 85.33, "opp_goals_against_3m": 1.33, "last_gw_points": 2, "price": 5.0}, {"name": "Noah Sadiki", "position": "MID", "team": "Sunderland", "xP": 2.38, "form_3gw": 3.0, "form_5gw": 3.0, "ict_3gw": 3.03, "minutes_3gw": 79.0, "opp_goals_against_3m": 1.67, "last_gw_points": 1, "price": 4.9}, {"name": "Mateus Man\u00e9", "position": "FWD", "team": "Wolves", "xP": 2.38, "form_3gw": 5.0, "form_5gw": 3.6, "ict_3gw": 6.93, "minutes_3gw": 82.0, "opp_goals_against_3m": 2.0, "last_gw_points": 2, "price": 4.2}, {"name": "Micky van de Ven", "position": "DEF", "team": "Spurs", "xP": 2.38, "form_3gw": 1.33, "form_5gw": 2.2, "ict_3gw": 1.17, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 6, "price": 4.4}, {"name": "Brennan Johnson", "position": "MID", "team": "Crystal Palace", "xP": 2.36, "form_3gw": 1.67, "form_5gw": 1.6, "ict_3gw": 2.2, "minutes_3gw": 66.0, "opp_goals_against_3m": 0.0, "last_gw_points": 0, "price": 6.5}, {"name": "Mads Hermansen", "position": "GK", "team": "West Ham", "xP": 2.35, "form_3gw": 3.0, "form_5gw": 3.4, "ict_3gw": 3.03, "minutes_3gw": 90.0, "opp_goals_against_3m": 0.67, "last_gw_points": 7, "price": 4.2}, {"name": "Michael Kayode", "position": "DEF", "team": "Brentford", "xP": 2.32, "form_3gw": 2.0, "form_5gw": 3.0, "ict_3gw": 2.33, "minutes_3gw": 90.0, "opp_goals_against_3m": 2.67, "last_gw_points": 2, "price": 4.6}, {"name": "Callum Wilson", "position": "FWD", "team": "West Ham", "xP": 2.32, "form_3gw": 1.33, "form_5gw": 1.8, "ict_3gw": 1.57, "minutes_3gw": 40.0, "opp_goals_against_3m": 0.67, "last_gw_points": 5, "price": 5.8}, {"name": "Maxence Lacroix", "position": "DEF", "team": "Crystal Palace", "xP": 2.3, "form_3gw": 2.0, "form_5gw": 2.2, "ict_3gw": 3.6, "minutes_3gw": 80.0, "opp_goals_against_3m": 0.0, "last_gw_points": 0, "price": 5.2}, {"name": "Lewis Dunk", "position": "DEF", "team": "Brighton", "xP": 2.29, "form_3gw": 5.67, "form_5gw": 3.4, "ict_3gw": 4.27, "minutes_3gw": 60.67, "opp_goals_against_3m": 1.33, "last_gw_points": 1, "price": 4.5}];

function pickBestXI(squad) {
  const byPos = {
    GK: squad.filter(p => p.position === 'GK').sort((a, b) => b.xP - a.xP),
    DEF: squad.filter(p => p.position === 'DEF').sort((a, b) => b.xP - a.xP),
    MID: squad.filter(p => p.position === 'MID').sort((a, b) => b.xP - a.xP),
    FWD: squad.filter(p => p.position === 'FWD').sort((a, b) => b.xP - a.xP),
  };
  if (byPos.GK.length === 0) return null;
  let best = null;
  for (let d = 3; d <= 5; d++) {
    for (let m = 3; m <= 5; m++) {
      for (let f = 1; f <= 3; f++) {
        if (d + m + f !== 10) continue;
        if (byPos.DEF.length < d || byPos.MID.length < m || byPos.FWD.length < f) continue;
        const xi = [byPos.GK[0], ...byPos.DEF.slice(0, d), ...byPos.MID.slice(0, m), ...byPos.FWD.slice(0, f)];
        const total = xi.reduce((s, p) => s + p.xP, 0);
        if (!best || total > best.total) best = { xi, total, formation: `${d}-${m}-${f}` };
      }
    }
  }
  return best;
}

function clubCounts(squad) {
  const counts = {};
  squad.forEach(p => { counts[p.team] = (counts[p.team] || 0) + 1; });
  return counts;
}

function squadCost(squad) {
  return squad.reduce((s, p) => s + p.price, 0);
}

function canAdd(squad, player, budget) {
  if (squad.find(p => p.name === player.name)) return { ok: false, reason: 'Already in squad' };
  if (squad.length >= 15) return { ok: false, reason: 'Squad full (15/15)' };
  const posCount = squad.filter(p => p.position === player.position).length;
  if (posCount >= SQUAD_QUOTAS[player.position]) return { ok: false, reason: `${player.position} quota full (${SQUAD_QUOTAS[player.position]})` };
  const clubCount = squad.filter(p => p.team === player.team).length;
  if (clubCount >= MAX_PER_CLUB) return { ok: false, reason: `Max ${MAX_PER_CLUB} per club reached` };
  if (squadCost(squad) + player.price > budget + 1e-9) return { ok: false, reason: 'Over budget' };
  return { ok: true };
}

function greedyAutoFill(startingSquad, pool, budget) {
  let squad = [...startingSquad];
  const inSquad = new Set(squad.map(p => p.name));
  const candidates = pool.filter(p => !inSquad.has(p.name));

  for (const pos of ['GK', 'DEF', 'MID', 'FWD']) {
    const need = SQUAD_QUOTAS[pos] - squad.filter(p => p.position === pos).length;
    if (need <= 0) continue;
    const posCandidates = candidates
      .filter(p => p.position === pos)
      .sort((a, b) => (b.xP / b.price) - (a.xP / a.price));
    let added = 0;
    for (const p of posCandidates) {
      if (added >= need) break;
      const check = canAdd(squad, p, budget);
      if (check.ok) {
        squad.push(p);
        added++;
      }
    }
  }
  return squad;
}

function localSearchImprove(squad, pool, budget, iterations = 800) {
  let current = [...squad];
  let currentXI = pickBestXI(current);
  if (!currentXI) return current;

  for (let i = 0; i < iterations; i++) {
    const idx = Math.floor(Math.random() * current.length);
    const outgoing = current[idx];
    const samePos = pool.filter(p => p.position === outgoing.position && p.name !== outgoing.name);
    const candidate = samePos[Math.floor(Math.random() * samePos.length)];
    if (!candidate) continue;
    if (current.find(p => p.name === candidate.name)) continue;

    const withoutOutgoing = current.filter((_, i2) => i2 !== idx);
    const clubCount = withoutOutgoing.filter(p => p.team === candidate.team).length;
    if (clubCount >= MAX_PER_CLUB) continue;

    const newCost = squadCost(withoutOutgoing) + candidate.price;
    if (newCost > budget + 1e-9) continue;

    const trial = [...withoutOutgoing, candidate];
    const trialXI = pickBestXI(trial);
    if (trialXI && trialXI.total > currentXI.total) {
      current = trial;
      currentXI = trialXI;
    }
  }
  return current;
}

function optimizeSquad(pool, budget = BUDGET) {
  let squad = greedyAutoFill([], pool, budget);
  squad = localSearchImprove(squad, pool, budget, 1500);
  return squad;
}

function PlayerChip({ player, size = 'md', badge }) {
  const colors = POS_COLOR[player.position];
  const isSmall = size === 'sm';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      minWidth: isSmall ? 76 : 92, position: 'relative',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: -10, right: 4, background: '#D8A93E', color: '#3A2A05',
          borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 11, fontWeight: 700, border: '2px solid #0A1F1A',
        }}>{badge}</div>
      )}
      <div style={{
        background: '#F2EFE6', color: '#0A1F1A', borderRadius: 8, padding: isSmall ? '6px 8px' : '8px 10px',
        fontSize: isSmall ? 11 : 12, fontWeight: 700, textAlign: 'center', width: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.35)', lineHeight: 1.25,
      }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</div>
        <div style={{ fontSize: isSmall ? 9 : 10, fontWeight: 500, color: '#5F5E5A', marginTop: 2 }}>{player.team}</div>
      </div>
      <div style={{
        background: colors.bg, color: colors.text, fontSize: 10, fontWeight: 700,
        borderRadius: 5, padding: '2px 8px', display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <span>{fmtPrice(player.price)}</span>
        <span style={{ opacity: 0.7 }}>|</span>
        <span>{fmtPts(player.xP)} xP</span>
      </div>
    </div>
  );
}

function PitchView({ xi, bench, captain }) {
  const rows = { GK: [], DEF: [], MID: [], FWD: [] };
  xi.forEach(p => rows[p.position].push(p));

  return (
    <div>
      <div style={{
        background: 'linear-gradient(180deg, #1F5C3F 0%, #1A4E36 100%)',
        borderRadius: 12, padding: '28px 16px', position: 'relative',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 20}%`,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }} />
        ))}
        {['FWD', 'MID', 'DEF', 'GK'].map(pos => (
          <div key={pos} style={{
            display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap',
            marginBottom: 26, position: 'relative', zIndex: 1,
          }}>
            {rows[pos].map(p => (
              <PlayerChip key={p.name} player={p} badge={captain && p.name === captain.name ? 'C' : null} />
            ))}
          </div>
        ))}
      </div>
      {bench && bench.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9FB3AA', marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>Bench</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {bench.map(p => <PlayerChip key={p.name} player={p} size="sm" />)}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBar({ squad, xiResult, captain }) {
  const cost = squadCost(squad);
  const items = [
    { label: 'Squad cost', value: `${fmtPrice(cost)} / ${fmtPrice(BUDGET)}`, icon: Wallet },
    { label: 'Budget left', value: fmtPrice(BUDGET - cost), icon: TrendingUp },
    { label: 'Formation', value: xiResult ? xiResult.formation : '—', icon: Shield },
    { label: 'XI predicted pts', value: xiResult ? fmtPts(xiResult.total + (captain ? captain.xP : 0)) : '—', icon: Star },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} style={{ background: '#122B26', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9FB3AA', fontSize: 12, marginBottom: 6 }}>
            <Icon size={13} /> {label}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#F2EFE6' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function TabNav({ tab, setTab }) {
  const tabs = [
    { id: 'season', label: 'Season squad', icon: Trophy },
    { id: 'stats', label: 'Player stats', icon: TrendingUp },
    { id: 'builder', label: 'Squad builder', icon: Users },
    { id: 'chips', label: 'Chip strategy', icon: Zap },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: tab === id ? '#D8A93E' : '#9FB3AA',
            borderBottom: tab === id ? '2px solid #D8A93E' : '2px solid transparent',
            fontSize: 13, fontWeight: 600, transition: 'color 0.15s',
          }}
        >
          <Icon size={15} /> {label}
        </button>
      ))}
    </div>
  );
}

function PlayerStatsTab({ pool }) {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('xP');
  const [sortDir, setSortDir] = useState('desc');

  const teams = useMemo(() => Array.from(new Set(pool.map(p => p.team))).sort(), [pool]);
  const [teamFilter, setTeamFilter] = useState('ALL');

  const filtered = useMemo(() => {
    let rows = pool.filter(p => {
      if (posFilter !== 'ALL' && p.position !== posFilter) return false;
      if (teamFilter !== 'ALL' && p.team !== teamFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const va = a[sortKey] ?? -Infinity;
      const vb = b[sortKey] ?? -Infinity;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return rows;
  }, [pool, search, posFilter, teamFilter, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const columns = [
    { key: 'name', label: 'Player', width: '22%' },
    { key: 'team', label: 'Team', width: '14%' },
    { key: 'price', label: 'Price', width: '9%' },
    { key: 'xP', label: 'Predicted xP', width: '11%' },
    { key: 'form_3gw', label: 'Form (3gw)', width: '11%' },
    { key: 'ict_3gw', label: 'ICT (3gw)', width: '10%' },
    { key: 'minutes_3gw', label: 'Mins (3gw)', width: '11%' },
    { key: 'last_gw_points', label: 'Last GW', width: '9%' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#9FB3AA' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search player..."
            style={{
              width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
              background: '#122B26', color: '#F2EFE6', fontSize: 13, boxSizing: 'border-box',
            }}
          />
        </div>
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All positions</option>
          <option value="GK">GK</option>
          <option value="DEF">DEF</option>
          <option value="MID">MID</option>
          <option value="FWD">FWD</option>
        </select>
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All teams</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: '#122B26' }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                  textAlign: col.key === 'name' || col.key === 'team' ? 'left' : 'right',
                  padding: '10px 12px', color: '#9FB3AA', fontWeight: 600, cursor: 'pointer',
                  whiteSpace: 'nowrap', userSelect: 'none', width: col.width,
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label} {sortKey === col.key && <ArrowUpDown size={11} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.name} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '9px 12px', fontWeight: 600 }}>
                  <span style={{
                    display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                    background: POS_COLOR[p.position].bg, marginRight: 8,
                  }} />
                  {p.name}
                </td>
                <td style={{ padding: '9px 12px', color: '#9FB3AA' }}>{p.team}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{fmtPrice(p.price)}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', color: '#D8A93E', fontWeight: 700 }}>{fmtPts(p.xP)}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{p.form_3gw != null ? p.form_3gw.toFixed(2) : '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{p.ict_3gw != null ? p.ict_3gw.toFixed(1) : '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{p.minutes_3gw != null ? Math.round(p.minutes_3gw) : '—'}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right' }}>{p.last_gw_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: '#5F5E5A', marginTop: 8 }}>
        {filtered.length} of {pool.length} players shown · predictions from the model's held-out 2025-26 backtest
      </div>
    </div>
  );
}

const selectStyle = {
  padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
  background: '#122B26', color: '#F2EFE6', fontSize: 13,
};

function SquadBuilderTab({ pool, initialSquad }) {
  const [squad, setSquad] = useState(initialSquad.map(({ starting, ...rest }) => rest));
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [error, setError] = useState('');

  const xiResult = useMemo(() => pickBestXI(squad), [squad]);
  const captain = xiResult ? xiResult.xi.reduce((a, b) => (a.xP > b.xP ? a : b)) : null;
  const bench = squad.filter(p => !xiResult || !xiResult.xi.find(x => x.name === p.name));
  const cost = squadCost(squad);
  const counts = clubCounts(squad);

  const filteredPool = useMemo(() => pool.filter(p => {
    if (posFilter !== 'ALL' && p.position !== posFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.xP - a.xP), [pool, posFilter, search]);

  function addPlayer(p) {
    const check = canAdd(squad, p, BUDGET);
    if (!check.ok) { setError(check.reason); setTimeout(() => setError(''), 2500); return; }
    setSquad(s => [...s, p]);
  }

  function removePlayer(name) {
    setSquad(s => s.filter(p => p.name !== name));
  }

  function autoOptimize() {
    const optimized = optimizeSquad(pool, BUDGET);
    setSquad(optimized);
  }

  function resetSquad() {
    setSquad(initialSquad.map(({ starting, ...rest }) => rest));
  }

  return (
    <div>
      <SummaryBar squad={squad} xiResult={xiResult} captain={captain} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={autoOptimize} style={primaryBtnStyle}>
          <RefreshCw size={13} /> Auto-optimize squad
        </button>
        <button onClick={resetSquad} style={secondaryBtnStyle}>Reset to season squad</button>
        {error && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#E0684F', fontSize: 12 }}>
            <AlertCircle size={13} /> {error}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9FB3AA', marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Current squad ({squad.length}/15)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['GK', 'DEF', 'MID', 'FWD'].map(pos => (
              <div key={pos}>
                <div style={{ fontSize: 10.5, color: '#5F5E5A', fontWeight: 600, margin: '6px 0 4px' }}>
                  {pos} ({squad.filter(p => p.position === pos).length}/{SQUAD_QUOTAS[pos]})
                </div>
                {squad.filter(p => p.position === pos).map(p => (
                  <div key={p.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#122B26', borderRadius: 7, padding: '7px 10px', marginBottom: 4, fontSize: 12.5,
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: '#5F5E5A', marginLeft: 6 }}>{p.team}</span>
                      {captain && p.name === captain.name && (
                        <span style={{ marginLeft: 6, color: '#D8A93E', fontWeight: 700, fontSize: 10.5 }}>CAPTAIN</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#9FB3AA' }}>{fmtPrice(p.price)}</span>
                      <span style={{ color: '#D8A93E', fontWeight: 700 }}>{fmtPts(p.xP)}</span>
                      <button onClick={() => removePlayer(p.name)} style={{
                        background: 'none', border: 'none', color: '#E0684F', cursor: 'pointer', fontSize: 15, padding: 0,
                      }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#5F5E5A' }}>
            Clubs: {Object.entries(counts).map(([team, n]) => `${team} (${n})`).join(', ') || '—'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9FB3AA', marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Add players
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ flex: 1, padding: '7px 9px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.12)', background: '#122B26', color: '#F2EFE6', fontSize: 12.5, boxSizing: 'border-box' }}
            />
            <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ ...selectStyle, padding: '7px 9px', fontSize: 12.5 }}>
              <option value="ALL">All</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="MID">MID</option>
              <option value="FWD">FWD</option>
            </select>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
            {filteredPool.slice(0, 60).map(p => {
              const already = squad.find(s => s.name === p.name);
              return (
                <div key={p.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 12,
                  opacity: already ? 0.4 : 1,
                }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: '#5F5E5A', marginLeft: 6 }}>{p.team} · {p.position}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9FB3AA' }}>{fmtPrice(p.price)}</span>
                    <span style={{ color: '#D8A93E', fontWeight: 700 }}>{fmtPts(p.xP)}</span>
                    <button
                      disabled={!!already}
                      onClick={() => addPlayer(p)}
                      style={{
                        background: already ? 'transparent' : '#3EBD8B', color: already ? '#5F5E5A' : '#04261A',
                        border: 'none', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                        cursor: already ? 'default' : 'pointer',
                      }}
                    >{already ? 'Added' : '+ Add'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryBtnStyle = {
  display: 'flex', alignItems: 'center', gap: 6, background: '#D8A93E', color: '#3A2A05',
  border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
};
const secondaryBtnStyle = {
  background: 'transparent', color: '#9FB3AA', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
};

function ChipStrategyTab({ liveChips, pool }) {
  const [weeklyData, setWeeklyData] = useState(null);
  const [fileError, setFileError] = useState('');

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.trim().split('\n');
        const header = lines[0].split(',').map(h => h.trim());
        const nameIdx = header.indexOf('name');
        const gwIdx = header.indexOf('GW');
        const xpIdx = header.indexOf('xP');
        if (nameIdx === -1 || gwIdx === -1 || xpIdx === -1) {
          setFileError('CSV needs columns: name, GW, xP (one row per player per gameweek)');
          return;
        }
        const rows = lines.slice(1).map(line => {
          const cells = line.split(',');
          return { name: cells[nameIdx], GW: Number(cells[gwIdx]), xP: Number(cells[xpIdx]) };
        }).filter(r => r.name && !isNaN(r.GW) && !isNaN(r.xP));
        setWeeklyData(rows);
        setFileError('');
      } catch (err) {
        setFileError('Could not parse that file. Check the format matches: name, GW, xP');
      }
    };
    reader.readAsText(file);
  }

  const tripleCaptainPick = useMemo(() => {
    if (!weeklyData) return null;
    return weeklyData.reduce((best, r) => (!best || r.xP > best.xP ? r : best), null);
  }, [weeklyData]);

  const gwTotals = useMemo(() => {
    if (!weeklyData) return null;
    const byGW = {};
    weeklyData.forEach(r => { byGW[r.GW] = (byGW[r.GW] || 0) + r.xP; });
    return Object.entries(byGW).map(([gw, total]) => ({ gw: Number(gw), total })).sort((a, b) => a.gw - b.gw);
  }, [weeklyData]);

  return (
    <div>
      {liveChips && (
        <div style={{ ...cardStyle, marginBottom: 16, border: '1px solid rgba(216,169,62,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Zap size={16} color="#D8A93E" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>This week's live recommendation</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {Object.entries(liveChips).map(([key, v]) => (
              <div key={key} style={{
                background: v.flag ? 'rgba(216,169,62,0.15)' : '#0A1F1A', borderRadius: 8, padding: '8px 10px',
                border: v.flag ? '1px solid rgba(216,169,62,0.5)' : '1px solid transparent',
              }}>
                <div style={{ fontSize: 10.5, color: '#9FB3AA', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: v.flag ? '#D8A93E' : '#5F5E5A', marginTop: 2 }}>
                  {v.flag ? 'Play this week' : 'Hold'}
                </div>
                {v.player && <div style={{ fontSize: 11, color: '#9FB3AA', marginTop: 2 }}>{v.player} — {v.xP} xP</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Zap size={16} color="#D8A93E" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Triple captain</span>
          </div>
          <p style={{ fontSize: 12.5, color: '#9FB3AA', lineHeight: 1.6, marginTop: 0 }}>
            Best used on a nailed premium attacker with the highest single-gameweek predicted points —
            ideally in a double gameweek (two fixtures in one GW) against weak defenses. Don't burn it on
            a hunch; wait for a genuine outlier week in the model's predictions.
          </p>
          {tripleCaptainPick ? (
            <div style={{ background: '#0A1F1A', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#9FB3AA' }}>From your uploaded data</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{tripleCaptainPick.name} — GW{tripleCaptainPick.GW}</div>
              <div style={{ fontSize: 12, color: '#D8A93E', fontWeight: 700 }}>{fmtPts(tripleCaptainPick.xP)} predicted points</div>
            </div>
          ) : (
            <div style={{ fontSize: 11.5, color: '#5F5E5A', fontStyle: 'italic' }}>
              Upload multi-gameweek predictions below to get a specific recommendation.
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <RefreshCw size={16} color="#4C8FD1" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Wildcard</span>
          </div>
          <p style={{ fontSize: 12.5, color: '#9FB3AA', lineHeight: 1.6, marginTop: 0 }}>
            Best played when your squad's total predicted points drops relative to nearby gameweeks —
            usually triggered by a run of tough fixtures, injuries piling up, or a fixture swing making
            several currently-owned players' opponents much harder. Two wildcards are available per season
            (one per half); don't use the first one too early before form data is reliable.
          </p>
          {gwTotals ? (
            <div style={{ fontSize: 11.5, color: '#9FB3AA', marginTop: 10 }}>
              Lowest predicted gameweek in your data: <strong style={{ color: '#F2EFE6' }}>
                GW{gwTotals.reduce((a, b) => b.total < a.total ? b : a).gw}
              </strong> — a candidate window to consider the wildcard.
            </div>
          ) : (
            <div style={{ fontSize: 11.5, color: '#5F5E5A', fontStyle: 'italic' }}>
              Upload multi-gameweek predictions below to see your squad's projected points by week.
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Users size={16} color="#3EBD8B" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Bench boost</span>
          </div>
          <p style={{ fontSize: 12.5, color: '#9FB3AA', lineHeight: 1.6, marginTop: 0 }}>
            Only worth playing once your bench (all 4 non-starters) has decent predicted points of its own —
            typically after a wildcard has upgraded your squad depth. Check that all 15 players have a
            fixture that gameweek before using it.
          </p>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Shield size={16} color="#E0684F" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Free hit</span>
          </div>
          <p style={{ fontSize: 12.5, color: '#9FB3AA', lineHeight: 1.6, marginTop: 0 }}>
            Best saved for a single gameweek where your current squad is unusually disadvantaged — a
            blank gameweek (many of your players have no fixture) or a double gameweek you're poorly
            set up for. Squad reverts back the following week, so it's for one-off situations only.
          </p>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Info size={16} color="#9FB3AA" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Get personalized chip timing</span>
        </div>
        <p style={{ fontSize: 12.5, color: '#9FB3AA', lineHeight: 1.6, marginTop: 0 }}>
          Run <code style={{ background: '#0A1F1A', padding: '1px 5px', borderRadius: 4 }}>06_generate_predictions.py</code> across
          several upcoming gameweeks (once you've got live fixtures loaded), export a long-format CSV with
          columns <code style={{ background: '#0A1F1A', padding: '1px 5px', borderRadius: 4 }}>name, GW, xP</code>,
          and upload it here — this'll pinpoint your best triple-captain gameweek and flag the low-scoring
          week where a wildcard or free hit pays off most.
        </p>
        <input type="file" accept=".csv" onChange={handleFile} style={{ fontSize: 12, color: '#9FB3AA', marginTop: 6 }} />
        {fileError && <div style={{ color: '#E0684F', fontSize: 12, marginTop: 8 }}>{fileError}</div>}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#122B26', borderRadius: 10, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)',
};

function SeasonSquadTab({ squad, chips }) {
  const xi = squad.filter(p => p.starting);
  const bench = squad.filter(p => !p.starting);
  const captain = xi.reduce((a, b) => (a.xP > b.xP ? a : b));
  const xiResult = { total: xi.reduce((s, p) => s + p.xP, 0), formation: (() => {
    const d = xi.filter(p => p.position === 'DEF').length;
    const m = xi.filter(p => p.position === 'MID').length;
    const f = xi.filter(p => p.position === 'FWD').length;
    return `${d}-${m}-${f}`;
  })() };

  const flaggedChips = chips ? Object.entries(chips).filter(([, v]) => v.flag) : [];

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, background: '#122B26', borderRadius: 10,
        padding: '12px 16px', marginBottom: 16, border: '1px solid rgba(216,169,62,0.25)',
      }}>
        <Info size={15} color="#D8A93E" style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: '#9FB3AA', lineHeight: 1.6 }}>
          {chips
            ? 'Recommended squad from this week\'s live model run.'
            : 'Recommended opening squad for 2026/27, built from a snapshot run. Connect the weekly pipeline (see README) for live, auto-updating data.'}
        </div>
      </div>

      {flaggedChips.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(216,169,62,0.12)', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, border: '1px solid rgba(216,169,62,0.4)',
        }}>
          <Zap size={15} color="#D8A93E" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, color: '#F2EFE6' }}>
            <strong>Chip alert:</strong> {flaggedChips.map(([k]) => k.replace('_', ' ')).join(', ')} flagged this gameweek — see the Chip strategy tab.
          </div>
        </div>
      )}

      <SummaryBar squad={squad} xiResult={xiResult} captain={captain} />

      <div style={{ marginBottom: 8, fontSize: 12, color: '#9FB3AA' }}>
        Captain pick: <strong style={{ color: '#D8A93E' }}>{captain.name}</strong> ({fmtPts(captain.xP)} xP — highest in the XI, doubles to {fmtPts(captain.xP * 2)} if he plays)
      </div>

      <PitchView xi={xi} bench={bench} captain={captain} />
    </div>
  );
}

export default function FPLCommandCenter() {
  const [tab, setTab] = useState('season');
  const [liveData, setLiveData] = useState(null);
  const [liveStatus, setLiveStatus] = useState('loading');

  React.useEffect(() => {
    fetch('/data.json')
      .then(res => { if (!res.ok) throw new Error('no data.json yet'); return res.json(); })
      .then(json => { setLiveData(json); setLiveStatus('live'); })
      .catch(() => setLiveStatus('fallback'));
  }, []);

  const pool = liveData ? liveData.player_pool : PLAYER_POOL;
  const squad = liveData ? liveData.squad : SEASON_SQUAD;
  const chips = liveData ? liveData.chips : null;
  const generatedAt = liveData ? liveData.generated_at : null;

  return (
    <div style={{
      background: '#0A1F1A', minHeight: 500, borderRadius: 14, padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#F2EFE6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, background: '#3EBD8B', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Trophy size={18} color="#04261A" />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>FPL Command Center</div>
          <div style={{ fontSize: 11.5, color: '#5F5E5A' }}>
            {liveStatus === 'live' && generatedAt
              ? `Live predictions · updated ${new Date(generatedAt).toLocaleString()}`
              : 'Showing bundled snapshot data · live updates not connected yet'}
          </div>
        </div>
      </div>

      <TabNav tab={tab} setTab={setTab} />

      {tab === 'season' && <SeasonSquadTab squad={squad} chips={chips} />}
      {tab === 'stats' && <PlayerStatsTab pool={pool} />}
      {tab === 'builder' && <SquadBuilderTab pool={pool} initialSquad={squad} />}
      {tab === 'chips' && <ChipStrategyTab liveChips={chips} pool={pool} />}
    </div>
  );
}

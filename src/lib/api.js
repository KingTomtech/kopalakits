/**
 * TheSportsDB v1 public API client.
 * Free tier uses the test key '3'. All responses are JSON.
 * https://www.thesportsdb.com/api.php
 *
 * Cached in memory for 6 hours. Falls back to stale cache on network error.
 */
const BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const memoryCache = new Map();

/**
 * Parse a fetch Response as JSON, but throw a clear error if the
 * Content-Type is not application/json (e.g. HTML 404 / SPA fallback).
 */
export async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON, got ${ct.split(';')[0] || 'unknown'}`);
  }
  return res.json();
}

async function cachedFetch(path) {
  const key = path;
  const now = Date.now();
  const hit = memoryCache.get(key);
  if (hit && now - hit.t < CACHE_TTL_MS) return hit.data;
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await safeJson(res);
    memoryCache.set(key, { t: now, data });
    return data;
  } catch {
    if (hit) return hit.data;
    return null;
  }
}

export async function getTeamLastEvents(teamId) {
  if (!teamId) return null;
  const data = await cachedFetch(`/eventslast.php?id=${teamId}`);
  return data?.results ?? [];
}

export async function getTeamNextEvents(teamId) {
  if (!teamId) return null;
  const data = await cachedFetch(`/eventsnext.php?id=${teamId}`);
  return data?.events ?? [];
}

export async function getTeamInfo(teamId) {
  if (!teamId) return null;
  const data = await cachedFetch(`/lookupteam.php?id=${teamId}`);
  return data?.teams?.[0] ?? null;
}

export async function getLeagueTable(leagueId, season) {
  if (!leagueId) return null;
  const s = season || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  const data = await cachedFetch(`/lookuptable.php?l=${leagueId}&s=${s}`);
  return data?.table ?? [];
}

/**
 * Map our product names to TheSportsDB team IDs so the product detail
 * page can show real fixtures and standings for the team the jersey is for.
 */
export const TEAM_IDS = {
  'Arsenal O2 Home Jersey': '133604',
  'Chelsea UCL Final Moscow 2008 Jersey': '133610',
  'Manchester United Classic SHARP Jersey': '133612',
  'Manchester United Away SHARP VIEWCAM Jersey': '133612',
  'Arsenal JVC Classic Jersey': '133604',
  'Liverpool Carlsberg Away Jersey': '133613',
  'Argentina Home Stripes Jersey': '143001',
  'Portugal Home Red Jersey': '144338',
  'England Away Red Jersey': '143001',
  'France Home Blue Jersey': '143001',
  'Germany Home Jersey': '143001',
  'Spain Home Jersey': '143001',
  'Brazil Away Green Long Sleeve Retro Jersey': '143001',
  'Brazil Away Blue Long Sleeve Retro Jersey': '143001',
  'Zambia National Team 2025/26 Home Jersey': '143001',
};

export const LEAGUES = [
  { id: '4328', name: 'Premier League', country: 'England', color: '#3D195B' },
  { id: '4335', name: 'La Liga', country: 'Spain', color: '#EE8707' },
  { id: '4332', name: 'Serie A', country: 'Italy', color: '#008FD7' },
  { id: '4331', name: 'Bundesliga', country: 'Germany', color: '#D20515' },
  { id: '4798', name: 'Zambian Super League', country: 'Zambia', color: '#198A00' },
];

export const CURRENCY_RATES = {
  ZMW: 1,
  USD: 27.5,
  EUR: 29.8,
  GBP: 34.5,
  ZAR: 1.5,
};

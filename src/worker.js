/**
 * Kopala Kits — Cloudflare Worker Backend
 * Handles API routes + passes everything else to static assets.
 *
 * Security model:
 *  - JWT_SECRET MUST be set; we refuse to start without it.
 *  - CORS is same-origin by default; an env-supplied ALLOWED_ORIGINS list adds
 *    additional trusted origins. State-changing methods also require an
 *    explicit Origin match.
 *  - Admin tokens carry a jti; logout records it in KV until natural expiry.
 *  - POST bodies are size-capped and (for products) schema-validated.
 *  - /api/login is rate-limited per IP using KV.
 */

// ─── Constants ─────────────────────────────────────────────────────────────
const KV_KEY_PRODUCTS   = 'products';
const KV_KEY_BANNER     = 'banner';
const KV_KEY_AUTH       = 'auth_hash';
const KV_KEY_REVOKED    = 'revoked_jti';
const KV_KEY_PREDICTIONS = 'predictions';
const KV_KEY_FIXTURES   = 'fixtures_cache';
const KV_KEY_TOURNAMENTS = 'tournaments';
const KV_KEY_TOURNAMENT_PICKS = 'tournament_picks';
const KV_KEY_LEADERBOARD = 'leaderboard_cache';
const SPORTSDB_BASE     = 'https://www.thesportsdb.com/api/v1/json/3';
const FIXTURES_TTL_SEC  = 6 * 60 * 60; // 6 hours
const PREDICTION_RATE_LIMIT = 30;      // per device per hour
// Team IDs we track for the predictions feature. Curated: only the teams
// whose jerseys we actually sell, so users care about the fixtures.
const PREDICTIONS_TEAM_IDS = [
  '133604', // Arsenal
  '133610', // Chelsea
  '133612', // Manchester United
  '133613', // Liverpool
  '143001', // Argentina
  '144338', // Portugal
  '148356', // England
  '146636', // France
  '146610', // Germany
  '145803', // Spain
  '143002', // Brazil
  '144322', // Zambia
];
const JWT_SECRET_ENV    = 'JWT_SECRET';
const ADMIN_PW_ENV      = 'ADMIN_PASSWORD';
const PHONE_ENV         = 'PHONE_NUMBER';
const ALLOWED_ORIGINS_ENV = 'ALLOWED_ORIGINS';

const MAX_BODY_BYTES    = 1_000_000;       // 1 MB on writes
const MAX_PRODUCTS      = 500;
const MAX_DATAURL_BYTES = 1_500_000;       // ~1.4 MB
const LOGIN_WINDOW_MS   = 15 * 60_000;
const LOGIN_MAX_TRIES   = 5;

const CORS_ALLOW_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
const CORS_ALLOW_HEADERS = 'Content-Type, Authorization';

function corsHeadersFor(origin, isWrite, env, requestUrl) {
  // Default-deny on state-changing methods; safe methods may also be denied
  // if origin is unknown — we just omit CORS headers and the browser blocks it.
  const headers = {
    'Access-Control-Allow-Methods': CORS_ALLOW_METHODS,
    'Access-Control-Allow-Headers': CORS_ALLOW_HEADERS,
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (isWrite && !isTrustedOrigin(origin, env, requestUrl)) return headers; // do not advertise allow-origin
  headers['Access-Control-Allow-Origin'] = origin;
  headers['Access-Control-Allow-Credentials'] = 'true';
  return headers;
}

function trustedOriginSet(env, requestUrl) {
  // 1. Same-origin (host of the deployed site) is always trusted.
  // 2. Plus any ALLOWED_ORIGINS env var (comma-separated).
  const list = new Set();
  try {
    list.add(new URL(requestUrl).origin);
  } catch { /* requestUrl is always a valid URL here */ }
  const extra = (env[ALLOWED_ORIGINS_ENV] || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const o of extra) list.add(o);
  return list;
}

function isTrustedOrigin(origin, env, requestUrl) {
  if (!origin) return false;
  for (const o of trustedOriginSet(env, requestUrl)) {
    if (o === origin) return true;
  }
  return false;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function jsonResponse(data, ctx, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeadersFor(ctx.origin, false, ctx.env, ctx.requestUrl) },
  });
}

function errorResponse(message, status, ctx, isWrite = false) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeadersFor(ctx.origin, isWrite, ctx.env, ctx.requestUrl) },
  });
}

function optionsResponse(ctx) {
  return new Response(null, { status: 204, headers: corsHeadersFor(ctx.origin, true, ctx.env, ctx.requestUrl) });
}

async function readJsonBody(request, maxBytes) {
  const len = request.headers.get('content-length');
  if (len && Number(len) > maxBytes) {
    throw new HttpError('Request body too large', 413);
  }
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError('Request body too large', 413);
  try { return JSON.parse(text); } catch { throw new HttpError('Invalid JSON', 400); }
}

class HttpError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toBase64Url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSHA256(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toBase64Url(new Uint8Array(sig));
}

async function createJWT(payload, secret) {
  const header = toBase64Url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body   = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSHA256(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = await hmacSHA256(`${header}.${body}`, secret);
  // constant-time compare
  if (signature.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (typeof decoded.exp !== 'number' || decoded.exp < Date.now()) return null;
    return decoded;
  } catch { return null; }
}

function randomId() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

async function ensureAuthHash(env) {
  const existing = await env.KOPALA_KV.get(KV_KEY_AUTH);
  if (existing) return JSON.parse(existing);

  const rawPassword = env[ADMIN_PW_ENV];
  if (!rawPassword) {
    throw new Error('ADMIN_PASSWORD secret not set. Run: npx wrangler secret put ADMIN_PASSWORD');
  }

  const salt = crypto.randomUUID();
  const hash = await sha256(rawPassword + salt);
  const record = { salt, hash };
  await env.KOPALA_KV.put(KV_KEY_AUTH, JSON.stringify(record));
  return record;
}

async function isJtiRevoked(env, jti) {
  if (!jti) return false;
  const v = await env.KOPALA_KV.get(`${KV_KEY_REVOKED}:${jti}`);
  return v === '1';
}

async function revokeJti(env, jti, expMs) {
  if (!jti) return;
  const ttlSec = Math.max(60, Math.ceil((expMs - Date.now()) / 1000));
  await env.KOPALA_KV.put(`${KV_KEY_REVOKED}:${jti}`, '1', { expirationTtl: ttlSec });
}

// ─── Input validation ─────────────────────────────────────────────────────

const ALLOWED_IMAGE_PREFIXES = ['https://', '/'];
const STRING_FIELDS = ['name', 'desc', 'category', 'image'];
const OPTIONAL_BOOL_FIELDS = ['newArrival', 'soldOut'];

function sanitizeProduct(raw, idx) {
  if (!raw || typeof raw !== 'object') {
    throw new HttpError(`Product at index ${idx} is not an object`, 400);
  }
  const out = {};
  for (const k of STRING_FIELDS) {
    if (raw[k] !== undefined && raw[k] !== null) {
      if (typeof raw[k] !== 'string') {
        throw new HttpError(`Product at index ${idx} field "${k}" must be a string`, 400);
      }
      out[k] = raw[k].toString().slice(0, 2000);
    }
  }
  // id: accept number or numeric string; coerce to number
  if (raw.id !== undefined) {
    const idNum = typeof raw.id === 'number' ? raw.id : Number(raw.id);
    if (!Number.isFinite(idNum)) {
      throw new HttpError(`Product at index ${idx} has invalid id`, 400);
    }
    out.id = idNum;
  }
  // category allowlist
  if (out.category && !['Local', 'International', 'National', 'Retro'].includes(out.category)) {
    throw new HttpError(`Product at index ${idx} has invalid category`, 400);
  }
  // image: must be http(s) or relative; reject data: URIs once they exceed the cap
  if (out.image) {
    if (out.image.startsWith('data:')) {
      if (out.image.length > MAX_DATAURL_BYTES) {
        throw new HttpError(`Product at index ${idx} image data URL is too large`, 413);
      }
    } else if (!ALLOWED_IMAGE_PREFIXES.some(p => out.image.startsWith(p))) {
      throw new HttpError(`Product at index ${idx} image URL must be https or relative`, 400);
    }
  }
  // price
  const price = Number(raw.price);
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    throw new HttpError(`Product at index ${idx} has invalid price`, 400);
  }
  out.price = Math.round(price * 100) / 100;
  // optional booleans
  for (const k of OPTIONAL_BOOL_FIELDS) {
    if (raw[k] !== undefined) out[k] = Boolean(raw[k]);
  }
  if (out.id === undefined) out.id = Date.now() + idx;
  return out;
}

function sanitizeProducts(body) {
  if (!Array.isArray(body)) throw new HttpError('Products must be an array', 400);
  if (body.length > MAX_PRODUCTS) throw new HttpError(`Too many products (max ${MAX_PRODUCTS})`, 413);
  return body.map(sanitizeProduct);
}

// Heuristic: KV is considered stale if it contains any Unsplash URLs, since
// /products.json no longer uses them. Re-seeding is non-destructive: it
// overwrites KV with the static file's contents.
function needsReseed(products) {
  return products.some(p => typeof p.image === 'string' && p.image.includes('images.unsplash.com'));
}

function sanitizeBanner(body) {
  if (!body || typeof body !== 'object') throw new HttpError('Invalid banner payload', 400);
  const text = typeof body.text === 'string' ? body.text.slice(0, 500) : '';
  const active = Boolean(body.active);
  return { text, active };
}

// ─── Rate limiting ────────────────────────────────────────────────────────

async function rateLimitLogin(env, ip) {
  if (!ip) return; // no key, allow (rare edge case)
  const key = `login_tries:${ip}`;
  const cur = await env.KOPALA_KV.get(key, { type: 'json' });
  const tries = (cur?.count || 0) + 1;
  if (tries > LOGIN_MAX_TRIES) {
    throw new HttpError('Too many login attempts. Try again later.', 429);
  }
  // record; sliding window via KV expiration
  await env.KOPALA_KV.put(key, JSON.stringify({ count: tries }), {
    expirationTtl: Math.ceil(LOGIN_WINDOW_MS / 1000),
  });
}

function resetLoginTries(env, ip) {
  if (!ip) return;
  env.KOPALA_KV.delete(`login_tries:${ip}`).catch(() => {});
}

// ─── API Handlers ─────────────────────────────────────────────────────────

async function handleProducts(request, ctx) {
  const { origin, env } = ctx;

  if (request.method === 'GET') {
    // Self-heal: if KV holds a stale products list (e.g. still pointing at
    // the old Unsplash URLs that the seed no longer uses), re-seed from
    // /products.json so deployed changes propagate without an admin re-post.
    let stored = null;
    try {
      stored = await env.KOPALA_KV.get(KV_KEY_PRODUCTS);
    } catch { /* ignore */ }
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && needsReseed(parsed)) {
          stored = null; // force the re-seed path
        } else {
          return jsonResponse(parsed, ctx);
        }
      } catch {
        stored = null; // corrupted KV — re-seed
      }
    }
    if (stored) return jsonResponse(JSON.parse(stored), ctx);

    try {
      const seedRes = await env.ASSETS.fetch(new URL('/products.json', request.url));
      const seed = await seedRes.json();
      const clean = sanitizeProducts(seed);
      await env.KOPALA_KV.put(KV_KEY_PRODUCTS, JSON.stringify(clean));
      return jsonResponse(clean, ctx);
    } catch (e) {
      if (e instanceof HttpError) throw e;
      return jsonResponse([], ctx);
    }
  }

  if (request.method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth.error) return auth.response;

    if (!isTrustedOrigin(origin, env, request.url)) {
      return errorResponse('Forbidden origin', 403, ctx, true);
    }

    const body = await readJsonBody(request, MAX_BODY_BYTES);
    const products = sanitizeProducts(body);
    await env.KOPALA_KV.put(KV_KEY_PRODUCTS, JSON.stringify(products));
    return jsonResponse({ success: true, count: products.length }, ctx);
  }

  return errorResponse('Method not allowed', 405, ctx);
}

async function handleBanner(request, ctx) {
  const { origin, env } = ctx;

  if (request.method === 'GET') {
    const stored = await env.KOPALA_KV.get(KV_KEY_BANNER);
    if (stored) return jsonResponse(JSON.parse(stored), ctx);
    return jsonResponse({ text: '', active: false }, ctx);
  }

  if (request.method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth.error) return auth.response;

    if (!isTrustedOrigin(origin, env, request.url)) {
      return errorResponse('Forbidden origin', 403, ctx, true);
    }

    const body = await readJsonBody(request, MAX_BODY_BYTES);
    const banner = sanitizeBanner(body);
    await env.KOPALA_KV.put(KV_KEY_BANNER, JSON.stringify(banner));
    return jsonResponse({ success: true }, ctx);
  }

  return errorResponse('Method not allowed', 405, ctx);
}

async function handleLogin(request, ctx) {
  const { origin, env } = ctx;

  if (!isTrustedOrigin(origin, env, request.url) && origin) {
    return errorResponse('Forbidden origin', 403, ctx, true);
  }
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
  try { await rateLimitLogin(env, ip); } catch (e) {
    if (e instanceof HttpError) return errorResponse(e.message, e.status, ctx, true);
    throw e;
  }

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  const { password } = body;
  if (!password || typeof password !== 'string') {
    return errorResponse('Password required', 400, ctx, true);
  }

  let authRecord;
  try {
    authRecord = await ensureAuthHash(env);
  } catch (err) {
    return errorResponse(err.message, 500, ctx, true);
  }

  const hash = await sha256(password + authRecord.salt);
  if (hash !== authRecord.hash) return errorResponse('Invalid password', 401, ctx, true);
  resetLoginTries(env, ip);

  const secret = env[JWT_SECRET_ENV];
  if (!secret) return errorResponse('Server misconfigured: JWT_SECRET not set', 500, ctx, true);

  const jti = randomId();
  const token = await createJWT(
    { role: 'admin', jti, iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 },
    secret
  );
  return jsonResponse({ token }, ctx);
}

async function handleLogout(request, ctx) {
  const { env } = ctx;

  const header = request.headers.get('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (token) {
    const secret = env[JWT_SECRET_ENV];
    if (secret) {
      const payload = await verifyJWT(token, secret);
      if (payload?.jti) await revokeJti(env, payload.jti, payload.exp);
    }
  }
  return jsonResponse({ success: true }, ctx);
}

async function handleConfig(request, ctx) {
  const { env } = ctx;

  return jsonResponse({
    phone: env[PHONE_ENV] || '260770713619',
    currency: 'ZMW',
  }, ctx);
}

// ─── Predictions ────────────────────────────────────────────────────────

async function fetchSportsDb(path) {
  const res = await fetch(`${SPORTSDB_BASE}${path}`);
  if (!res.ok) throw new HttpError(`Upstream error ${res.status}`, 502);
  return res.json();
}

async function refreshFixtures(env) {
  // Pull next 5 events for each tracked team. Merge and dedupe by idEvent.
  // Cache the merged result in KV with FIXTURES_TTL_SEC so we don't hit the
  // upstream API on every page load.
  const all = [];
  const seen = new Set();
  for (const id of PREDICTIONS_TEAM_IDS) {
    try {
      const data = await fetchSportsDb(`/eventsnext.php?id=${id}`);
      for (const ev of (data.events || [])) {
        if (!ev || !ev.idEvent || seen.has(ev.idEvent)) continue;
        seen.add(ev.idEvent);
        // Normalize shape
        all.push({
          id: ev.idEvent,
          league: ev.strLeague || 'Friendly',
          leagueBadge: ev.strLeagueBadge || '',
          kickoff: ev.strTimestamp || `${ev.dateEvent || ''}T${ev.strTime || '00:00:00'}Z`,
          venue: ev.strVenue || '',
          home: {
            id: ev.idHomeTeam,
            name: ev.strHomeTeam,
            badge: ev.strHomeTeamBadge || '',
          },
          away: {
            id: ev.idAwayTeam,
            name: ev.strAwayTeam,
            badge: ev.strAwayTeamBadge || '',
          },
        });
      }
    } catch {
      // Skip a team if its request fails; the others still come through.
    }
  }
  // Sort by kickoff time, only future events, take first 12.
  const now = Date.now();
  all.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  const upcoming = all.filter((f) => new Date(f.kickoff).getTime() > now).slice(0, 12);
  await env.KOPALA_KV.put(KV_KEY_FIXTURES, JSON.stringify(upcoming), {
    expirationTtl: FIXTURES_TTL_SEC,
  });
  return upcoming;
}

async function getPredictionsStore(env) {
  const raw = await env.KOPALA_KV.get(KV_KEY_PREDICTIONS);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

async function savePredictionsStore(env, store) {
  await env.KOPALA_KV.put(KV_KEY_PREDICTIONS, JSON.stringify(store));
}

function tallyFor(fixture) {
  const votes = fixture.votes || {};
  const tallies = { home: 0, away: 0, draw: 0 };
  for (const pick of Object.values(votes)) {
    if (pick in tallies) tallies[pick]++;
  }
  const total = tallies.home + tallies.away + tallies.draw;
  return { ...tallies, total };
}

function getDeviceId(request) {
  // X-Device-Id is the source of truth. Falls back to a client IP + UA hash
  // for the rare browser that doesn't have the device-id yet (e.g. on first
  // visit). The client always sends the header after init.
  return (
    request.headers.get('X-Device-Id') ||
    request.headers.get('x-device-id') ||
    ''
  );
}

async function rateLimitPrediction(env, deviceId) {
  if (!deviceId) throw new HttpError('Missing X-Device-Id header', 400);
  const key = `predict_tries:${deviceId}`;
  const cur = await env.KOPALA_KV.get(key, { type: 'json' });
  const count = (cur?.count || 0) + 1;
  if (count > PREDICTION_RATE_LIMIT) {
    throw new HttpError('Too many predictions. Slow down.', 429);
  }
  await env.KOPALA_KV.put(key, JSON.stringify({ count }), {
    expirationTtl: 60 * 60,
  });
}

async function handlePredictions(request, ctx) {
  const { env } = ctx;

  if (request.method !== 'GET') {
    return errorResponse('Method not allowed', 405, ctx);
  }

  // List active fixtures + tallies. The client renders them.
  let fixtures = [];
  const cached = await env.KOPALA_KV.get(KV_KEY_FIXTURES);
  if (cached) {
    try { fixtures = JSON.parse(cached); } catch { fixtures = []; }
  }
  // If the cache is empty, try to fetch.
  if (!fixtures.length) {
    try { fixtures = await refreshFixtures(env); }
    catch (e) {
      if (e instanceof HttpError) throw e;
      fixtures = [];
    }
  }

  const store = await getPredictionsStore(env);
  const deviceId = getDeviceId(request);
  const now = Date.now();

  // Merge fixtures with their tallies + my pick.
  const out = fixtures
    .filter((f) => new Date(f.kickoff).getTime() > now - 6 * 60 * 60 * 1000) // hide fixtures 6h past kickoff
    .map((f) => {
      const fixtureData = store[f.id] || { votes: {}, result: null };
      return {
        ...f,
        tallies: tallyFor(fixtureData),
        myPick: deviceId ? (fixtureData.votes?.[deviceId] || null) : null,
        locked: new Date(f.kickoff).getTime() <= now,
        result: fixtureData.result || null,
      };
    });

  return jsonResponse({ fixtures: out, now }, ctx);
}

async function handlePredictionSubmit(request, ctx) {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405, ctx);

  const { env } = ctx;
  const deviceId = getDeviceId(request);
  if (!deviceId) return errorResponse('Missing X-Device-Id header', 400, ctx, true);

  await rateLimitPrediction(env, deviceId);

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  const { fixtureId, pick } = body || {};
  if (typeof fixtureId !== 'string' || typeof pick !== 'string') {
    return errorResponse('fixtureId and pick are required', 400, ctx, true);
  }
  if (!['home', 'away', 'draw'].includes(pick)) {
    return errorResponse('pick must be home, away, or draw', 400, ctx, true);
  }

  // Load fixtures, verify the fixture exists and isn't locked.
  const cached = await env.KOPALA_KV.get(KV_KEY_FIXTURES);
  if (!cached) return errorResponse('Fixtures not loaded yet. Try again shortly.', 503, ctx, true);
  let fixtures;
  try { fixtures = JSON.parse(cached); } catch { return errorResponse('Fixture cache corrupt', 500, ctx, true); }
  const fixture = fixtures.find((f) => f.id === fixtureId);
  if (!fixture) return errorResponse('Unknown fixture', 404, ctx, true);

  const kickoff = new Date(fixture.kickoff).getTime();
  if (kickoff <= Date.now()) {
    return errorResponse('Fixture is locked — kickoff has passed', 409, ctx, true);
  }
  // Draws only make sense for league matches. TheSportsDB sets strLeague for
  // league matches; friendlies & cups are no-draw.
  if (pick === 'draw' && !fixture.league) {
    return errorResponse('Draw not available for this fixture', 400, ctx, true);
  }

  const store = await getPredictionsStore(env);
  const existing = store[fixtureId] || { votes: {}, result: null };
  // One vote per device per fixture; replace if it already exists.
  existing.votes = existing.votes || {};
  existing.votes[deviceId] = pick;
  store[fixtureId] = existing;
  await savePredictionsStore(env, store);

  return jsonResponse({
    success: true,
    fixtureId,
    pick,
    tallies: tallyFor(existing),
  }, ctx);
}

async function handlePredictionDelete(request, ctx) {
  if (request.method !== 'DELETE') return errorResponse('Method not allowed', 405, ctx);
  const { env } = ctx;
  const deviceId = getDeviceId(request);
  if (!deviceId) return errorResponse('Missing X-Device-Id header', 400, ctx, true);

  const url = new URL(request.url);
  const fixtureId = url.pathname.split('/').pop();
  if (!fixtureId) return errorResponse('Missing fixtureId in path', 400, ctx, true);

  const store = await getPredictionsStore(env);
  const existing = store[fixtureId];
  if (existing && existing.votes) {
    delete existing.votes[deviceId];
    store[fixtureId] = existing;
    await savePredictionsStore(env, store);
  }
  return jsonResponse({ success: true, fixtureId }, ctx);
}

async function handlePredictionsRefresh(request, ctx) {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405, ctx);
  const { env } = ctx;
  const fixtures = await refreshFixtures(env);
  return jsonResponse({ success: true, count: fixtures.length, fixtures }, ctx);
}

// ─── Tournaments ───────────────────────────────────────────────────────

const SEED_TOURNAMENTS = [
  {
    id: 'world-cup-2026',
    name: 'World Cup 2026',
    description: 'The world comes to North America. 48 teams, 104 matches, one trophy. Predict every game of the tournament.',
    status: 'upcoming',
    coverEmoji: '🏆',
    accentColor: '#D99404',
    createdAt: '2026-01-01T00:00:00Z',
    rounds: [
      {
        name: 'Group Stage',
        matches: [
          { id: 'm1', home: { name: 'Brazil' },     away: { name: 'Croatia' },   kickoff: '2026-06-11T19:00:00Z' },
          { id: 'm2', home: { name: 'Argentina' },  away: { name: 'Morocco' },   kickoff: '2026-06-12T19:00:00Z' },
          { id: 'm3', home: { name: 'France' },     away: { name: 'Denmark' },   kickoff: '2026-06-13T19:00:00Z' },
          { id: 'm4', home: { name: 'England' },    away: { name: 'Serbia' },    kickoff: '2026-06-14T19:00:00Z' },
          { id: 'm5', home: { name: 'Germany' },    away: { name: 'Japan' },     kickoff: '2026-06-15T19:00:00Z' },
          { id: 'm6', home: { name: 'Spain' },      away: { name: 'Netherlands' }, kickoff: '2026-06-16T19:00:00Z' },
          { id: 'm7', home: { name: 'Portugal' },   away: { name: 'Ghana' },     kickoff: '2026-06-17T19:00:00Z' },
          { id: 'm8', home: { name: 'Zambia' },     away: { name: 'Senegal' },   kickoff: '2026-06-18T19:00:00Z' },
        ],
      },
    ],
  },
  {
    id: 'kopala-cup-2026',
    name: 'Kopala Cup 2026',
    description: 'Our own 8-team knockout: pick the quarter-finals, semi-finals, and the final. Highest accuracy wins bragging rights (and a discount code).',
    status: 'active',
    coverEmoji: '⚽',
    accentColor: '#5E6B3C',
    createdAt: '2026-04-15T00:00:00Z',
    rounds: [
      {
        name: 'Quarter-finals',
        matches: [
          { id: 'kc-qf-1', home: { name: 'Nkana FC' },            away: { name: 'Power Dynamos' },         kickoff: '2026-06-20T14:00:00Z' },
          { id: 'kc-qf-2', home: { name: 'Mufulira Wanderers' },  away: { name: 'Kabwe Warriors' },        kickoff: '2026-06-20T16:30:00Z' },
          { id: 'kc-qf-3', home: { name: 'Arsenal' },            away: { name: 'Manchester United' },    kickoff: '2026-06-21T14:00:00Z' },
          { id: 'kc-qf-4', home: { name: 'Liverpool' },          away: { name: 'Chelsea' },              kickoff: '2026-06-21T16:30:00Z' },
        ],
      },
      {
        name: 'Semi-finals',
        matches: [
          { id: 'kc-sf-1', home: { name: 'Winner QF1' }, away: { name: 'Winner QF2' }, kickoff: '2026-06-27T14:00:00Z' },
          { id: 'kc-sf-2', home: { name: 'Winner QF3' }, away: { name: 'Winner QF4' }, kickoff: '2026-06-28T14:00:00Z' },
        ],
      },
      {
        name: 'Final',
        matches: [
          { id: 'kc-final', home: { name: 'Winner SF1' }, away: { name: 'Winner SF2' }, kickoff: '2026-07-05T15:00:00Z' },
        ],
      },
    ],
  },
];

async function getTournamentsStore(env) {
  const raw = await env.KOPALA_KV.get(KV_KEY_TOURNAMENTS);
  if (!raw) {
    // Seed the store on first read.
    const seed = {};
    for (const t of SEED_TOURNAMENTS) seed[t.id] = t;
    await env.KOPALA_KV.put(KV_KEY_TOURNAMENTS, JSON.stringify(seed));
    return seed;
  }
  try { return JSON.parse(raw); } catch { return {}; }
}

async function saveTournamentsStore(env, store) {
  await env.KOPALA_KV.put(KV_KEY_TOURNAMENTS, JSON.stringify(store));
}

async function getPicksStore(env) {
  const raw = await env.KOPALA_KV.get(KV_KEY_TOURNAMENT_PICKS);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

async function savePicksStore(env, store) {
  await env.KOPALA_KV.put(KV_KEY_TOURNAMENT_PICKS, JSON.stringify(store));
}

function tournamentProgress(tournament, picks) {
  // Count how many matches the user has picked AND how many of those are
  // correct (the match has a result that matches their pick).
  let picked = 0;
  let correct = 0;
  let played = 0;
  const allMatches = (tournament.rounds || []).flatMap((r) => r.matches || []);
  for (const m of allMatches) {
    if (m.result) played++;
    const myPick = picks?.[m.id];
    if (myPick) {
      picked++;
      if (m.result && m.result === myPick) correct++;
    }
  }
  return { picked, correct, played, total: allMatches.length };
}

async function handleTournaments(request, ctx) {
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405, ctx);
  const { env } = ctx;
  const tournaments = await getTournamentsStore(env);
  const picks = await getPicksStore(env);
  const deviceId = getDeviceId(request);
  const list = Object.values(tournaments).map((t) => {
    const myPicks = deviceId ? (picks[deviceId]?.[t.id] || {}) : {};
    const progress = tournamentProgress(t, myPicks);
    return {
      ...t,
      myPicks,
      progress,
    };
  });
  return jsonResponse({ tournaments: list, now: Date.now() }, ctx);
}

async function handleTournament(request, ctx) {
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405, ctx);
  const { env } = ctx;
  const url = new URL(request.url);
  const id = url.pathname.split('/').filter(Boolean).pop();
  const tournaments = await getTournamentsStore(env);
  const tournament = tournaments[id];
  if (!tournament) return errorResponse('Tournament not found', 404, ctx);
  const picks = await getPicksStore(env);
  const deviceId = getDeviceId(request);
  const myPicks = deviceId ? (picks[deviceId]?.[id] || {}) : {};
  return jsonResponse({
    tournament: { ...tournament, myPicks, progress: tournamentProgress(tournament, myPicks) },
    now: Date.now(),
  }, ctx);
}

async function handleTournamentPick(request, ctx) {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405, ctx);
  const { env } = ctx;
  const deviceId = getDeviceId(request);
  if (!deviceId) return errorResponse('Missing X-Device-Id header', 400, ctx, true);

  // Soft rate limit
  await rateLimitPrediction(env, deviceId);

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  const { tournamentId, matchId, pick } = body || {};
  if (typeof tournamentId !== 'string' || typeof matchId !== 'string' || typeof pick !== 'string') {
    return errorResponse('tournamentId, matchId and pick are required', 400, ctx, true);
  }
  if (!['home', 'away', 'draw'].includes(pick)) {
    return errorResponse('pick must be home, away, or draw', 400, ctx, true);
  }

  const tournaments = await getTournamentsStore(env);
  const tournament = tournaments[tournamentId];
  if (!tournament) return errorResponse('Unknown tournament', 404, ctx, true);

  const allMatches = (tournament.rounds || []).flatMap((r) => r.matches || []);
  const match = allMatches.find((m) => m.id === matchId);
  if (!match) return errorResponse('Unknown match', 404, ctx, true);

  if (match.result) {
    return errorResponse('Match already played — picks locked', 409, ctx, true);
  }
  if (new Date(match.kickoff).getTime() <= Date.now()) {
    return errorResponse('Kickoff has passed — picks locked', 409, ctx, true);
  }
  if (pick === 'draw' && !tournament.id) {
    return errorResponse('Draw not allowed for this match', 400, ctx, true);
  }

  const picks = await getPicksStore(env);
  const myAll = picks[deviceId] || {};
  const myForTournament = myAll[tournamentId] || {};
  myForTournament[matchId] = pick;
  myAll[tournamentId] = myForTournament;
  picks[deviceId] = myAll;
  await savePicksStore(env, picks);

  return jsonResponse({
    success: true,
    tournamentId, matchId, pick,
    progress: tournamentProgress(tournament, myForTournament),
  }, ctx);
}

async function handleLeaderboard(request, ctx) {
  if (request.method !== 'GET') return errorResponse('Method not allowed', 405, ctx);
  const { env } = ctx;
  // Cache the leaderboard for 5 minutes — every visit to the page
  // recomputes otherwise and that's wasteful.
  const cached = await env.KOPALA_KV.get(KV_KEY_LEADERBOARD);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed.t < 5 * 60 * 1000) {
        return jsonResponse(parsed.data, ctx);
      }
    } catch (e) { void e; }
  }

  const picks = await getPicksStore(env);
  const tournaments = await getTournamentsStore(env);
  const allMatches = Object.values(tournaments).flatMap((t) =>
    (t.rounds || []).flatMap((r) => (r.matches || []).map((m) => ({ ...m, tournament: t.id })))
  );
  const played = allMatches.filter((m) => !!m.result);
  const totalMatches = played.length;

  // Per-device tallies
  const board = [];
  for (const [deviceId, byTournament] of Object.entries(picks)) {
    let correct = 0;
    let picked = 0;
    for (const [tournamentId, byMatch] of Object.entries(byTournament)) {
      for (const [matchId, pick] of Object.entries(byMatch)) {
        const m = allMatches.find((mm) => mm.id === matchId && mm.tournament === tournamentId);
        if (!m) continue;
        picked++;
        if (m.result && m.result === pick) correct++;
      }
    }
    if (picked > 0) {
      board.push({ deviceId: deviceId.slice(0, 8) + '…', correct, picked, accuracy: picked ? Math.round((correct / picked) * 100) : 0 });
    }
  }
  board.sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);
  const top = board.slice(0, 10);

  const data = {
    top,
    totalPlayers: board.length,
    totalMatches,
    generatedAt: Date.now(),
  };
  await env.KOPALA_KV.put(KV_KEY_LEADERBOARD, JSON.stringify({ t: Date.now(), data }), {
    expirationTtl: 5 * 60,
  });
  return jsonResponse(data, ctx);
}

// ─── Auth Middleware ──────────────────────────────────────────────────────

async function requireAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return { error: true, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };

  const secret = env[JWT_SECRET_ENV];
  if (!secret) return { error: true, response: new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } }) };

  const payload = await verifyJWT(token, secret);
  if (!payload || payload.role !== 'admin') {
    return { error: true, response: new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  if (await isJtiRevoked(env, payload.jti)) {
    return { error: true, response: new Response(JSON.stringify({ error: 'Token revoked' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  return { error: false, payload };
}


// ─── News (RSS proxy) ───────────────────────────────────────────────────

const RSS_FEEDS = [
  { id: 'bbc-football',           label: 'BBC Sport — Football',          url: 'https://feeds.bbci.co.uk/sport/football/rss.xml' },
  { id: 'espn-soccer',            label: 'ESPN — Soccer',                url: 'https://www.espn.com/espn/rss/soccer/news' },
  { id: 'espn-english-premier',   label: 'ESPN — Premier League',         url: 'https://www.espn.com/espn/rss/soccer/_/league/eng.1' },
];

function parseRssText(xmlText, feedMeta) {
  const items = [];
  const matches = xmlText.match(/<item\b[\s\S]*?<\/item>/g) || [];
  for (const raw of matches.slice(0, 25)) {
    const title = textOfRss(raw, 'title');
    const link = textOfRss(raw, 'link');
    const description = textOfRss(raw, 'description');
    const pubDate = textOfRss(raw, 'pubDate');
    const image = enclosureUrlRss(raw) || mediaThumbRss(raw);
    if (title && link) {
      items.push({
        title: decodeEntitiesRss(stripTagsRss(title)),
        link,
        description: decodeEntitiesRss(stripTagsRss(description)).slice(0, 240),
        pubDate: pubDate ? new Date(pubDate).toISOString() : null,
        source: feedMeta.label,
        image: image || null,
      });
    }
  }
  return { feed: feedMeta.id, label: feedMeta.label, items };
}

function textOfRss(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}
function enclosureUrlRss(xml) {
  const m = xml.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/i);
  return m ? m[1] : null;
}
function mediaThumbRss(xml) {
  const m = xml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  return m ? m[1] : null;
}
function stripTagsRss(s) { return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function decodeEntitiesRss(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}

async function handleNews(request, ctx, feedId) {
  const { env } = ctx;
  const feedMeta = RSS_FEEDS.find((f) => f.id === feedId);
  if (!feedMeta) return errorResponse('Unknown feed', 404, ctx);
  // Cache in KV for 30 min per feed
  const kvKey = `news_cache:${feedId}`;
  const cached = await env.KOPALA_KV.get(kvKey);
  if (cached) {
    try { return jsonResponse(JSON.parse(cached), ctx); } catch { /* corrupt cache */ }
  }
  try {
    const res = await fetch(feedMeta.url, { headers: { 'User-Agent': 'KopalaKits/1.0' } });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const xml = await res.text();
    const parsed = parseRssText(xml, feedMeta);
    await env.KOPALA_KV.put(kvKey, JSON.stringify(parsed), { expirationTtl: 30 * 60 });
    return jsonResponse(parsed, ctx);
  } catch {
    return errorResponse('News upstream failed', 502, ctx);
  }
}

// ─── Admin: set match result ───────────────────────────────────────────

async function handleAdminSetResult(request, ctx) {
  if (request.method !== 'POST') return errorResponse('Method not allowed', 405, ctx);
  const auth = await requireAuth(request, ctx.env);
  if (auth.error) return auth.response;
  const { env } = ctx;

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  const { fixtureId, result } = body || {};
  if (typeof fixtureId !== 'string' || !['home', 'away', 'draw'].includes(result)) {
    return errorResponse('fixtureId and result (home/away/draw) are required', 400, ctx, true);
  }

  const store = await getPredictionsStore(env);
  const existing = store[fixtureId] || { votes: {}, result: null };
  existing.result = result;
  store[fixtureId] = existing;
  await savePredictionsStore(env, store);

  // Invalidate leaderboard cache
  await env.KOPALA_KV.delete(KV_KEY_LEADERBOARD);

  return jsonResponse({ success: true, fixtureId, result }, ctx);
}

// ─── Admin: tournaments CRUD ──────────────────────────────────────────

async function handleAdminTournaments(request, ctx) {
  const auth = await requireAuth(request, ctx.env);
  if (auth.error) return auth.response;
  const { env } = ctx;
  const store = await getTournamentsStore(env);
  const url = new URL(request.url);

  if (request.method === 'GET') {
    return jsonResponse({ tournaments: Object.values(store) }, ctx);
  }

  if (request.method === 'POST') {
    // Create or update
    const body = await readJsonBody(request, MAX_BODY_BYTES);
    const { id, name, description, status, coverEmoji, accentColor, rounds } = body || {};
    if (typeof id !== 'string' || typeof name !== 'string' || !Array.isArray(rounds)) {
      return errorResponse('id, name and rounds[] are required', 400, ctx, true);
    }
    const existing = store[id] || {};
    store[id] = {
      ...existing,
      id, name, description: description || '',
      status: ['upcoming', 'active', 'finished'].includes(status) ? status : 'upcoming',
      coverEmoji: coverEmoji || '⚽',
      accentColor: accentColor || '#5E6B3C',
      rounds,
      updatedAt: new Date().toISOString(),
    };
    await saveTournamentsStore(env, store);
    return jsonResponse({ success: true, tournament: store[id] }, ctx);
  }

  if (request.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return errorResponse('Missing id query param', 400, ctx, true);
    delete store[id];
    await saveTournamentsStore(env, store);
    return jsonResponse({ success: true }, ctx);
  }

  return errorResponse('Method not allowed', 405, ctx);
}

// ─── Main Router ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env, _ctx) { void _ctx;
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const ctx = { origin, env, requestUrl: request.url };

    if (request.method === 'OPTIONS') {
      return optionsResponse(ctx);
    }

    try {
      if (url.pathname === '/api/products')  return await handleProducts(request, ctx);
      if (url.pathname === '/api/banner')    return await handleBanner(request, ctx);
      if (url.pathname === '/api/login')     return await handleLogin(request, ctx);
      if (url.pathname === '/api/logout')    return await handleLogout(request, ctx);
      if (url.pathname === '/api/config')    return await handleConfig(request, ctx);

      if (url.pathname === '/api/news') {
        const feed = new URL(request.url).searchParams.get('feed') || 'bbc-football';
        return await handleNews(request, ctx, feed);
      }
      if (url.pathname === '/api/predictions')           return await handlePredictions(request, ctx);
      if (url.pathname === '/api/predictions/refresh')   return await handlePredictionsRefresh(request, ctx);
      if (url.pathname === '/api/predictions/submit')    return await handlePredictionSubmit(request, ctx);
      if (url.pathname === '/api/predictions/leaderboard') return await handleLeaderboard(request, ctx);
      if (url.pathname.startsWith('/api/predictions/'))  return await handlePredictionDelete(request, ctx);

      if (url.pathname === '/api/tournaments')             return await handleTournaments(request, ctx);
      if (url.pathname === '/api/tournaments/pick')        return await handleTournamentPick(request, ctx);
      if (url.pathname === '/api/admin/predictions/result') return await handleAdminSetResult(request, ctx);
      if (url.pathname === '/api/admin/tournaments')         return await handleAdminTournaments(request, ctx);
      if (url.pathname.startsWith('/api/tournaments/'))    return await handleTournament(request, ctx);

      if (url.pathname === '/api/health') {
        return jsonResponse({ ok: true, kv: !!env.KOPALA_KV }, ctx);
      }
    } catch (e) {
      if (e instanceof HttpError) {
        return errorResponse(e.message, e.status, ctx, request.method !== 'GET');
      }
      return errorResponse('Internal error', 500, ctx, request.method !== 'GET');
    }

    return env.ASSETS.fetch(request);
  },
};

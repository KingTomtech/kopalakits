/**
 * Kopala Kits — Cloudflare Worker Backend
 * Handles API routes + passes everything else to static assets
 */

// ─── Constants ─────────────────────────────────────────────────────────────
const KV_KEY_PRODUCTS = 'products';
const KV_KEY_BANNER   = 'banner';
const KV_KEY_AUTH     = 'auth_hash';
const JWT_SECRET_ENV  = 'JWT_SECRET';
const ADMIN_PW_ENV    = 'ADMIN_PASSWORD';
const PHONE_ENV       = 'PHONE_NUMBER';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple JWT: header.payload.signature
async function createJWT(payload, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = await hmacSHA256(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = await hmacSHA256(`${header}.${body}`, secret);
  if (signature !== expected) return null;
  try {
    const decoded = JSON.parse(atob(body));
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function hmacSHA256(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// On first boot, hash and store the admin password in KV
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

// ─── API Handlers ─────────────────────────────────────────────────────────

async function handleProducts(request, env) {
  if (request.method === 'GET') {
    const stored = await env.KOPALA_KV.get(KV_KEY_PRODUCTS);
    if (stored) return jsonResponse(JSON.parse(stored));

    // Seed from static products.json on first visit
    try {
      const seedRes = await env.ASSETS.fetch(new URL('/products.json', request.url));
      const seed = await seedRes.json();
      await env.KOPALA_KV.put(KV_KEY_PRODUCTS, JSON.stringify(seed));
      return jsonResponse(seed);
    } catch {
      return jsonResponse([]);
    }
  }

  if (request.method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth.error) return auth.response;

    const body = await request.json();
    if (!Array.isArray(body)) return errorResponse('Products must be an array', 400);

    await env.KOPALA_KV.put(KV_KEY_PRODUCTS, JSON.stringify(body));
    return jsonResponse({ success: true, count: body.length });
  }

  return errorResponse('Method not allowed', 405);
}

async function handleBanner(request, env) {
  if (request.method === 'GET') {
    const stored = await env.KOPALA_KV.get(KV_KEY_BANNER);
    if (stored) return jsonResponse(JSON.parse(stored));
    return jsonResponse({ text: '', active: false });
  }

  if (request.method === 'POST') {
    const auth = await requireAuth(request, env);
    if (auth.error) return auth.response;

    const body = await request.json();
    await env.KOPALA_KV.put(KV_KEY_BANNER, JSON.stringify(body));
    return jsonResponse({ success: true });
  }

  return errorResponse('Method not allowed', 405);
}

async function handleLogin(request, env) {
  const { password } = await request.json().catch(() => ({}));
  if (!password) return errorResponse('Password required', 400);

  let authRecord;
  try {
    authRecord = await ensureAuthHash(env);
  } catch (err) {
    return errorResponse(err.message, 500);
  }

  const hash = await sha256(password + authRecord.salt);
  if (hash !== authRecord.hash) return errorResponse('Invalid password', 401);

  const secret = env[JWT_SECRET_ENV] || env[ADMIN_PW_ENV] || 'kopala-fallback-secret';
  const token = await createJWT(
    { role: 'admin', iat: Date.now(), exp: Date.now() + 24 * 60 * 60 * 1000 },
    secret
  );

  return jsonResponse({ token });
}

async function handleLogout(request, env) {
  return jsonResponse({ success: true });
}

async function handleConfig(request, env) {
  return jsonResponse({
    phone: env[PHONE_ENV] || '260770713619',
    currency: 'ZMW',
  });
}

// ─── Auth Middleware ──────────────────────────────────────────────────────

async function requireAuth(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return { error: true, response: errorResponse('Unauthorized', 401) };

  const secret = env[JWT_SECRET_ENV] || env[ADMIN_PW_ENV] || 'kopala-fallback-secret';
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.role !== 'admin') {
    return { error: true, response: errorResponse('Invalid or expired token', 401) };
  }
  return { error: false, payload };
}

// ─── Main Router ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // API routes
    if (url.pathname === '/api/products') {
      return handleProducts(request, env);
    }
    if (url.pathname === '/api/banner') {
      return handleBanner(request, env);
    }
    if (url.pathname === '/api/login') {
      return handleLogin(request, env);
    }
    if (url.pathname === '/api/logout') {
      return handleLogout(request, env);
    }
    if (url.pathname === '/api/config') {
      return handleConfig(request, env);
    }

    // Health check
    if (url.pathname === '/api/health') {
      return jsonResponse({ ok: true, kv: !!env.KOPALA_KV });
    }

    // Everything else → static assets
    return env.ASSETS.fetch(request);
  },
};

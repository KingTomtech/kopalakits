# Kopala Kits — secrets & env

Set the following with `wrangler secret put <NAME>` (one-time, per environment):

- `ADMIN_PASSWORD`   — initial admin password. Used once on first deploy to
  bootstrap the salted SHA-256 hash in KV (`auth_hash`). After that, change
  the password by deleting the KV key and redeploying with a new secret.
- `JWT_SECRET`       — 32+ byte random string. Required. Used to sign admin
  JWTs and to verify the `jti` revocation list. Rotate by setting a new
  secret; existing tokens will be invalidated on next request.
- `PHONE_NUMBER`     — optional override for the WhatsApp number returned
  from `/api/config`. Defaults to `260770713619`.

Optional, in `vars` (or `wrangler secret put ALLOWED_ORIGINS`):

- `ALLOWED_ORIGINS`  — comma-separated list of CORS allowlist entries in
  addition to the deployed site's own origin. Use only if a separate admin
  frontend needs to talk to this Worker.

## GitHub image hosting (admin uploads)

Product images are committed to the GitHub repo at `public/kit-img/` via
the GitHub Contents API when you upload from the admin dashboard. After a
commit, the next `wrangler deploy` ships the new file to Cloudflare's
ASSETS binding and the URL is served at `https://kopala.zingati.app/kit-img/<file>`.

Required secrets:

- `GITHUB_TOKEN`     — **fine-grained** personal access token from
  `github.com/settings/tokens?type=beta`. Permissions: **Contents: Read
  and write**, scoped **only** to `KingTomtech/kopalakits`. Never use a
  classic PAT or a token with broader scope — it would let the worker
  push to any repo you own.
- `GITHUB_REPO`      — `KingTomtech/kopalakits` (literal).
- `GITHUB_BRANCH`    — `main` (default if unset).

To rotate: revoke the old token at GitHub → Settings → Developer settings
→ Personal access tokens, then `wrangler secret put GITHUB_TOKEN` with a
fresh one. No code change needed.

If the secrets are missing, `/api/admin/upload-image` returns a 503 with
a clear "GitHub upload is not configured" message — product CRUD still
works for products that don't need a new image.

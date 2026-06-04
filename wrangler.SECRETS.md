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

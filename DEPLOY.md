# Production deploy (VPS + Docker Compose + Caddy)

## Architecture

```
Internet
   │
   ▼
 Caddy (:80/:443)  ← automatic Let's Encrypt TLS
   ├─ /*                 → React SPA (/srv)
   ├─ /api/*             → backend:8000
   ├─ /health*           → backend:8000
   └─ storage.$DOMAIN/*  → minio:9000 (presigned resumes)
         │
         ├── backend (FastAPI, migrations + admin seed on start)
         ├── db (Postgres 16, internal only)
         └── minio (S3 API, internal + public storage subdomain)
```

## One-time host setup

1. Install Docker Engine + Compose plugin on Ubuntu/Debian.
2. Clone this repo onto the server.
3. Create DNS records (both must point at the server):
   - `A` / `AAAA` → `$DOMAIN`
   - `A` / `AAAA` → `storage.$DOMAIN`
4. Allow inbound **80/tcp**, **443/tcp**, and preferably **443/udp**.

```bash
# Example UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

## Deploy

```bash
./deploy/bootstrap.sh          # creates .env.prod (mode 600) + data dirs
nano .env.prod                 # set DOMAIN, ACME_EMAIL, strong secrets
./deploy/up.sh                 # build + start
```

Equivalent manual command:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## Required `.env.prod` values

| Variable | Purpose |
|----------|---------|
| `DOMAIN` | Public hostname (no `https://`) |
| `ACME_EMAIL` | Let's Encrypt account email |
| `POSTGRES_*` | Database credentials |
| `SECRET_KEY` | JWT signing key (`openssl rand -hex 32`) |
| `MINIO_ROOT_*` | Object storage credentials |
| `SEED_ADMIN_*` | First admin user (change password after login) |

## Default admin

After first boot (unless `SEED_ADMIN=false`):

- Email: `admin@multistackhire.com` (or `SEED_ADMIN_EMAIL`)
- Password: value of `SEED_ADMIN_PASSWORD`

Sign in at `https://$DOMAIN/login`.

## Useful commands

```bash
# Logs
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f caddy backend

# Restart after code pull
git pull
./deploy/up.sh

# Stop
docker compose -f docker-compose.prod.yml --env-file .env.prod down

# Wipe data volumes (destructive)
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
```

## Permissions checklist

- `.env.prod` is `600` (owner read/write only) — `bootstrap.sh` / `up.sh` enforce this
- Backend container runs as UID `10001` (`appuser`), not root
- Postgres / MinIO / Caddy data use Docker named volumes (not world-readable host paths)
- DB and MinIO ports are **not** published on the host in production
- Only Caddy exposes `80` / `443`

## Notes

- Frontend is built with `VITE_API_URL=/api` so the browser stays same-origin; Caddy proxies `/api` to FastAPI.
- **CV storage / scoring** uses the internal Docker hostname `minio:9000` (`MINIO_ENDPOINT`). Object keys like `resumes/...` are stored on the user row — not local filesystem paths.
- **Presigned browser links** (optional “open in tab” flows) use `https://storage.$DOMAIN` via `MINIO_PUBLIC_ENDPOINT`. DNS for `storage.$DOMAIN` is required for those links; authenticated API proxies (`GET /api/v1/candidate/resume`, ranking resume proxy) work without the browser talking to MinIO directly.
- Keep `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` equal to `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`. Compose forces this for the backend. **Do not rotate MinIO root credentials** without recreating the `minio_data` volume (`down -v`), or uploads will fail with AccessDenied against the old volume identity.
- CORS is set to `https://$DOMAIN` only for this compose stack.
- Dev stack remains `docker compose up` (see root `docker-compose.yml`).

## Verify CV upload after deploy

1. `curl -sS https://$DOMAIN/health/storage` — expect `"status":"ok"` and your bucket name.
2. Sign in as a candidate → Profile → upload a PDF resume.
3. Backend logs should show `[minio] put_object ok ... object=resumes/...` and `[cv] upload stored ...`.
4. Trigger scoring (`POST /api/v1/ranking/score/me` or recruiter Rank Candidates). Logs should show `[cv] downloading resume` / `[cv] pipeline complete`. Response `cv_features` should be non-zero, or `errors` should include an explicit `CV Parser: ...` line (not a silent empty CV).
5. Preview via Profile **Preview** (authenticated blob) to confirm retrieval.

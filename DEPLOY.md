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
- Resume downloads use `https://storage.$DOMAIN` via `MINIO_PUBLIC_ENDPOINT`.
- CORS is set to `https://$DOMAIN` only for this compose stack.
- Dev stack remains `docker compose up` (see root `docker-compose.yml`).

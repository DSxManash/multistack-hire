#!/usr/bin/env bash
# Prepare the host for a production deploy (permissions + env file).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Multistack Hire production bootstrap"

if [[ ! -f .env.prod ]]; then
  cp .env.prod.example .env.prod
  chmod 600 .env.prod
  echo "Created .env.prod (mode 600). Edit DOMAIN, ACME_EMAIL, and all secrets before deploying."
else
  chmod 600 .env.prod
  echo ".env.prod already exists — permissions set to 600."
fi

# Ensure deploy scripts are executable
chmod +x deploy/bootstrap.sh deploy/up.sh 2>/dev/null || true
chmod +x backend/entrypoint.sh

# Local data dirs used if you bind-mount instead of named volumes (optional)
mkdir -p deploy/data/caddy deploy/data/postgres deploy/data/minio
chmod 700 deploy/data
chmod 700 deploy/data/caddy deploy/data/postgres deploy/data/minio

echo
echo "Next steps:"
echo "  1. Edit .env.prod (DOMAIN, ACME_EMAIL, passwords, SECRET_KEY)"
echo "  2. Point DNS A/AAAA records for \$DOMAIN and storage.\$DOMAIN at this server"
echo "  3. Open firewall ports 80/tcp and 443/tcp (and 443/udp for HTTP/3)"
echo "  4. Run:  ./deploy/up.sh"
echo
echo "Default admin after boot: admin@multistackhire.com / (SEED_ADMIN_PASSWORD)"

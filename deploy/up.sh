#!/usr/bin/env bash
# Build and start the production stack.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.prod ]]; then
  echo "Missing .env.prod — run ./deploy/bootstrap.sh first" >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env.prod
set +a

: "${DOMAIN:?DOMAIN is required in .env.prod}"
: "${ACME_EMAIL:?ACME_EMAIL is required in .env.prod}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required in .env.prod}"
: "${SECRET_KEY:?SECRET_KEY is required in .env.prod}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required in .env.prod}"

if [[ "$SECRET_KEY" == "change-me-with-openssl-rand-hex-32" ]]; then
  echo "Refuse to deploy with placeholder SECRET_KEY — generate one with: openssl rand -hex 32" >&2
  exit 1
fi

chmod 600 .env.prod

echo "==> Building and starting production stack for https://${DOMAIN}"
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build "$@"

echo
echo "==> Services"
docker compose -f docker-compose.prod.yml --env-file .env.prod ps

echo
echo "App:      https://${DOMAIN}"
echo "Storage:  https://storage.${DOMAIN}"
echo "Health:   https://${DOMAIN}/health"
echo "Login:    https://${DOMAIN}/login"
echo "Admin:    ${SEED_ADMIN_EMAIL:-admin@multistackhire.com}"

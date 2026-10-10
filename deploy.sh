#!/usr/bin/env bash
# Déploie SweetTools sur le VPS (ssh alias "sweettols" dans ~/.ssh/config).
#
#   ./deploy.sh          API + boutique
#   ./deploy.sh api      API seulement
#   ./deploy.sh site     boutique seulement
#
# La boutique est construite ici (le VPS n'a que 1 Go de RAM) avec
# frontend/.env.production.local, puis envoyée dans /var/www/sweettols.
# Le .env de l'API vit uniquement sur le serveur (/opt/sweettools/api/.env).
set -euo pipefail
cd "$(dirname "$0")"
HOST=sweettols
WHAT=${1:-all}

if [[ $WHAT == all || $WHAT == api ]]; then
  echo "→ API"
  # .data/ et uploads/ restent ceux du serveur
  tar -C backend --exclude=node_modules --exclude='.env*' --exclude=.data \
      --exclude=uploads --exclude=test -czf - . |
    ssh "$HOST" 'tar -xzf - -C /opt/sweettools/api &&
      cd /opt/sweettools/api && npm ci --omit=dev --no-audit --no-fund --silent &&
      pm2 restart sweettools-api --update-env >/dev/null && pm2 save >/dev/null'
  # la connexion à Atlas prend quelques secondes
  for _ in {1..15}; do
    curl -fsS https://api.sweettols.com/health >/dev/null 2>&1 && { echo "  API OK"; break; }
    sleep 2
  done
fi

if [[ $WHAT == all || $WHAT == site ]]; then
  echo "→ Boutique"
  (cd frontend && node scripts/sync-catalogue.mjs --strict && npx next build)
  tar -C frontend/out -czf - . |
    ssh "$HOST" 'rm -rf /var/www/sweettols.new && mkdir -p /var/www/sweettols.new &&
      tar -xzf - -C /var/www/sweettols.new &&
      rm -rf /var/www/sweettols.old && mv /var/www/sweettols /var/www/sweettols.old &&
      mv /var/www/sweettols.new /var/www/sweettols && chown -R nginx:nginx /var/www/sweettols'
  curl -fsS -o /dev/null https://sweettols.com/ && echo "  Boutique OK"
fi

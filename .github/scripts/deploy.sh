#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Build + deploy local/staging con PM2
# Uso: bash deploy/deploy.sh [full|quick|build-only] [local|staging|production]
# =============================================================================
set -euo pipefail

DEPLOY_MODE="${1:-full}"
ENVIRONMENT="${2:-local}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "${GREEN}🚀 Deploy CardBuy — Modo: ${DEPLOY_MODE} | Entorno: ${ENVIRONMENT}${NC}"
echo "  Directorio: ${ROOT_DIR}"
echo "  Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

cd "$ROOT_DIR"

# --- Carga variables de entorno ---
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs) 2>/dev/null || true
elif [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true
fi

# =============================================================================
# MODO FULL: install + migrate + build + restart
# =============================================================================
if [ "$DEPLOY_MODE" = "full" ]; then
  echo "📦 Instalando dependencias..."
  pnpm install --frozen-lockfile

  echo "🗄️  Ejecutando migraciones de base de datos..."
  cd packages/db
  pnpm prisma migrate deploy || {
    echo "${YELLOW}⚠️  Migración falló — abortando deploy${NC}"
    exit 1
  }
  cd "$ROOT_DIR"

  echo "🔨 Generando Prisma client..."
  pnpm db:generate

  echo "🏗️  Building..."
  pnpm build || {
    echo "${RED}❌ Build falló — abortando deploy${NC}"
    exit 1
  }
fi

# =============================================================================
# MODO BUILD-ONLY: solo build sin restart
# =============================================================================
if [ "$DEPLOY_MODE" = "build-only" ]; then
  echo "🏗️  Building (sin restart)..."
  pnpm build || {
    echo "${RED}❌ Build falló${NC}"
    exit 1
  }
  echo "${GREEN}✅ Build completado${NC}"
  exit 0
fi

# =============================================================================
# RESTART PM2 (full o quick)
# =============================================================================
PM2_APP_NAME="cardbuy-web"
if [ "$ENVIRONMENT" = "staging" ]; then
  PM2_APP_NAME="cardbuy-web-staging"
fi

echo "♻️  Reiniciando PM2: ${PM2_APP_NAME}..."

if pm2 list | grep -q "$PM2_APP_NAME"; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  echo "  App no existe en PM2 — iniciando nueva instancia..."
  pm2 start deploy/ecosystem.config.js --env "$ENVIRONMENT"
fi

pm2 save

# =============================================================================
# HEALTH CHECK POST-DEPLOY
# =============================================================================
echo ""
echo "🏥 Health check post-deploy..."
sleep 5  # Espera a que el servidor arranque

PORT=3000
[ "$ENVIRONMENT" = "staging" ] && PORT=3010

MAX_RETRIES=10
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/api/health" --max-time 5 || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "${GREEN}✅ Deploy exitoso — Health check OK (HTTP 200)${NC}"
    echo "  URL: http://localhost:${PORT}"
    break
  fi
  RETRY=$((RETRY + 1))
  echo "  Intento ${RETRY}/${MAX_RETRIES} — HTTP ${STATUS}..."
  sleep 3
done

if [ $RETRY -eq $MAX_RETRIES ]; then
  echo "${RED}❌ Health check falló después de ${MAX_RETRIES} intentos${NC}"
  echo "  Ejecuta: pm2 logs ${PM2_APP_NAME}"
  exit 1
fi

echo ""
echo "📋 Estado de PM2:"
pm2 list

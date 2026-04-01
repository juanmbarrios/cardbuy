#!/usr/bin/env bash
# =============================================================================
# setup-local.sh — Primer setup del entorno de desarrollo local
# Ejecutar una vez al clonar el proyecto: bash scripts/setup-local.sh
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}════════════════════════════════════════${NC}"
echo "${BLUE}  CardBuy — Setup de desarrollo local   ${NC}"
echo "${BLUE}════════════════════════════════════════${NC}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# --- 1. Verifica prerequisitos ---
echo "1️⃣  Verificando prerequisitos..."

command -v node >/dev/null 2>&1 || { echo "${RED}❌ Node.js no encontrado. Instala Node.js >= 20${NC}"; exit 1; }
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
[ "$NODE_VERSION" -ge 20 ] || { echo "${RED}❌ Node.js >= 20 requerido (tienes v${NODE_VERSION})${NC}"; exit 1; }
echo "  ${GREEN}✅ Node.js $(node --version)${NC}"

command -v pnpm >/dev/null 2>&1 || { echo "${YELLOW}⚠️  pnpm no encontrado. Instalando...${NC}"; npm install -g pnpm@9; }
echo "  ${GREEN}✅ pnpm $(pnpm --version)${NC}"

command -v docker >/dev/null 2>&1 || { echo "${RED}❌ Docker no encontrado. Instala Docker Desktop${NC}"; exit 1; }
echo "  ${GREEN}✅ Docker $(docker --version | awk '{print $3}' | tr -d ',')${NC}"

command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || {
  echo "${RED}❌ docker-compose no encontrado${NC}"; exit 1;
}
echo "  ${GREEN}✅ Docker Compose disponible${NC}"

# --- 2. Variables de entorno ---
echo ""
echo "2️⃣  Configurando variables de entorno..."

if [ ! -f "apps/web/.env.local" ]; then
  cp apps/web/.env.local.example apps/web/.env.local
  echo "  ${GREEN}✅ apps/web/.env.local creado${NC}"
else
  echo "  ${YELLOW}⚠️  apps/web/.env.local ya existe — sin cambios${NC}"
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ${GREEN}✅ .env creado${NC}"
  echo "  ${YELLOW}⚠️  Edita .env con tus valores antes de continuar${NC}"
else
  echo "  ${YELLOW}⚠️  .env ya existe — sin cambios${NC}"
fi

# --- 3. Servicios Docker ---
echo ""
echo "3️⃣  Iniciando servicios Docker (PostgreSQL + Redis + MinIO)..."
docker-compose -f infra/docker-compose.yml up -d

echo "  Esperando a que los servicios arranquen..."
sleep 5

# Verifica que PostgreSQL responde
RETRIES=0
until docker-compose -f infra/docker-compose.yml exec -T postgres pg_isready -U cardbuy 2>/dev/null || [ $RETRIES -ge 10 ]; do
  RETRIES=$((RETRIES + 1))
  echo "  Esperando PostgreSQL... (${RETRIES}/10)"
  sleep 3
done

echo "  ${GREEN}✅ Servicios Docker activos${NC}"

# --- 4. Dependencias ---
echo ""
echo "4️⃣  Instalando dependencias..."
pnpm install
echo "  ${GREEN}✅ Dependencias instaladas${NC}"

# --- 5. Base de datos ---
echo ""
echo "5️⃣  Configurando base de datos..."
cd packages/db
pnpm prisma generate
pnpm prisma db push --accept-data-loss
cd "$ROOT_DIR"
echo "  ${GREEN}✅ Schema de base de datos aplicado${NC}"

# --- 6. Labels de GitHub ---
echo ""
echo "6️⃣  Creando labels de GitHub..."
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  bash scripts/setup-labels.sh
  echo "  ${GREEN}✅ Labels creados${NC}"
else
  echo "  ${YELLOW}⚠️  gh CLI no autenticado — ejecuta manualmente: bash scripts/setup-labels.sh${NC}"
fi

# --- Resumen ---
echo ""
echo "${GREEN}════════════════════════════════════════${NC}"
echo "${GREEN}  ✅ Setup completado                    ${NC}"
echo "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "  Próximos pasos:"
echo "  ${BLUE}1.${NC} pnpm dev          → Inicia Next.js en http://localhost:3000"
echo "  ${BLUE}2.${NC} pnpm db:studio    → Abre Prisma Studio"
echo "  ${BLUE}3.${NC} docker-compose -f infra/docker-compose.yml logs -f → Ver logs"
echo ""
echo "  MinIO Console: http://localhost:9001 (cardbuy_minio / minio_secret_123)"

#!/usr/bin/env bash
# =============================================================================
# health-check.sh — Verifica el estado de los endpoints críticos
# =============================================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
VERBOSE="${2:-false}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0
PASSED=0

check_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${url}" --max-time 10 || echo "000")

  if [ "$STATUS" = "$expected_status" ]; then
    echo "${GREEN}✅ ${name}${NC} — HTTP ${STATUS}"
    PASSED=$((PASSED + 1))
  else
    echo "${RED}❌ ${name}${NC} — HTTP ${STATUS} (esperado: ${expected_status})"
    FAILED=$((FAILED + 1))
  fi
}

echo "🏥 CardBuy Health Check — ${BASE_URL}"
echo "$(date '+%Y-%m-%d %H:%M:%S')"
echo "─────────────────────────────────"

# Endpoints a verificar
check_endpoint "API Health" "/api/health" "200"
check_endpoint "Homepage" "/" "200"

echo "─────────────────────────────────"
echo "Resultado: ${PASSED} OK | ${FAILED} FALLÓ"

if [ $FAILED -gt 0 ]; then
  echo "${RED}⚠️  Hay ${FAILED} endpoints con problemas${NC}"
  exit 1
else
  echo "${GREEN}✅ Todos los endpoints responden correctamente${NC}"
fi

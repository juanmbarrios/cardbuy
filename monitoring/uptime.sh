#!/usr/bin/env bash
# =============================================================================
# uptime.sh — Health checks locales continuos
# Uso: bash monitoring/uptime.sh [url_base]
# =============================================================================
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
bash .github/scripts/health-check.sh "$BASE_URL"

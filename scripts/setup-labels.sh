#!/usr/bin/env bash
# =============================================================================
# setup-labels.sh — Crea todos los labels del proyecto en GitHub
# Ejecutar una vez: bash scripts/setup-labels.sh
# Requiere: gh auth login
# =============================================================================
set -euo pipefail

REPO="${REPO:-juanmbarrios/cardbuy}"

echo "🏷️  Creando labels en ${REPO}..."

create_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  gh label create "$name" \
    --repo "$REPO" \
    --color "$color" \
    --description "$description" \
    --force \
    2>/dev/null && echo "  ✅ $name" || echo "  ⚠️  $name (ya existe o error)"
}

echo ""
echo "── Flujo de trabajo ──────────────────"
create_label "ai-implement"          "8957e5" "Solicita implementación asistida por agente"
create_label "ai-generated"          "8957e5" "PR generado con asistencia IA — requiere revisión humana"
create_label "in-progress"           "fbca04" "En desarrollo activo"
create_label "skip-review"           "e4e669" "Omite validaciones automáticas"
create_label "possible-duplicate"    "e4e669" "Posible duplicado detectado automáticamente"
create_label "needs-security-review" "b60205" "PR con hallazgos de seguridad — revisar antes de mergear"
create_label "blocked"               "d93f0b" "Bloqueada por dependencia externa"
create_label "waiting-credentials"   "c5def5" "Esperando credenciales o accesos"

echo ""
echo "── Estimación ────────────────────────"
create_label "estimate-XS"  "0e8a16" "Esfuerzo < 1 hora"
create_label "estimate-S"   "5ebeff" "Esfuerzo 1–3 horas"
create_label "estimate-M"   "fbca04" "Esfuerzo 3–8 horas"
create_label "estimate-L"   "e4711e" "Esfuerzo 1–2 días"
create_label "estimate-XL"  "b60205" "Esfuerzo > 2 días"

echo ""
echo "── Área técnica ──────────────────────"
create_label "backend"   "0075ca" "Backend / API / base de datos"
create_label "frontend"  "cfd3d7" "Frontend / UI / componentes"
create_label "infra"     "e4e669" "Infraestructura / CI-CD / deploy"
create_label "mobile"    "d93f0b" "Mobile-first / responsive / PWA"

echo ""
echo "── Dominio TCG Marketplace ───────────"
create_label "marketplace"   "8957e5" "Core del marketplace (búsqueda, catálogo, conversión)"
create_label "seller-tools"  "0075ca" "Herramientas para vendedores (inventario, shop, analytics)"
create_label "trust-safety"  "b60205" "Confianza y seguridad (KYC, fraude, disputas, bans)"
create_label "logistics"     "f9d0c4" "Logística y envíos (tracking, carriers, embalaje)"
create_label "pricing"       "fef2c0" "Pricing e histórico de precios (market price, watchlist)"
create_label "seo"           "bfd4f2" "SEO programático (slugs, meta, sitemap, structured data)"
create_label "community"     "d4c5f9" "Comunidad (foros, reviews, reputación, posts)"

echo ""
echo "✅ Labels creados en ${REPO}"
echo ""
echo "Verifica en: https://github.com/${REPO}/labels"

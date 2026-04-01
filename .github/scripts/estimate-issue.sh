#!/usr/bin/env bash
# =============================================================================
# estimate-issue.sh — Estimación heurística XS/S/M/L/XL sin API de IA
# Sistema de scoring por keywords y complejidad del contexto TCG
# =============================================================================
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN no definido}"
: "${ISSUE_NUMBER:?ISSUE_NUMBER no definido}"
: "${ISSUE_TITLE:?ISSUE_TITLE no definido}"
: "${REPO:?REPO no definido}"
ISSUE_BODY="${ISSUE_BODY:-}"

FULL_TEXT="$ISSUE_TITLE $ISSUE_BODY"
SCORE=0
REASONS=()

echo "📊 Estimando issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}"

# =============================================================================
# SISTEMA DE SCORING
# =============================================================================

# --- Complejidad alta (+2 puntos) ---
HIGH_COMPLEXITY_KEYWORDS=(
  "arquitectura" "architecture" "auth" "authentication" "autorización" "authorization"
  "pago" "payment" "stripe" "checkout" "escrow"
  "kyc" "kyb" "identidad" "verificación" "verification"
  "antifraude" "fraude" "fraud" "riesgo" "risk"
  "migración" "migration" "migrate"
  "websocket" "realtime" "tiempo real"
  "grading" "psa" "bgs" "cgc"
  "integración" "integration" "webhook"
  "redis" "cache" "caching" "invalidación"
  "search" "elasticsearch" "full.text" "índice" "index"
  "pricing.engine" "market.price" "histórico" "historical"
  "refactor" "reestructurar" "restructure"
  "seguridad" "security" "xss" "csrf" "sql.injection"
  "multi.tenant" "multivendor"
  "logistics" "carrier" "tracking.api"
)

for kw in "${HIGH_COMPLEXITY_KEYWORDS[@]}"; do
  if echo "$FULL_TEXT" | grep -qiE "$kw"; then
    SCORE=$((SCORE + 2))
    REASONS+=("Alta complejidad detectada: \`$kw\`")
    break
  fi
done

# --- Complejidad media (+1 punto) ---
MEDIUM_COMPLEXITY_KEYWORDS=(
  "endpoint" "api.route" "route" "controller"
  "componente" "component" "modal" "drawer" "dialog"
  "filtro" "filter" "búsqueda" "search.bar" "facet"
  "formulario" "form" "validación" "validation" "zod"
  "email" "notificación" "notification" "alert"
  "seller" "vendedor" "inventario" "inventory"
  "listing" "anuncio" "publicar" "publish"
  "orden" "order" "carrito" "cart"
  "buyer" "comprador" "purchase"
  "precio" "price" "discount" "descuento"
  "tabla" "table" "lista" "list" "grid" "paginación" "pagination"
  "upload" "imagen" "image" "foto" "photo" "storage"
  "seo" "meta" "sitemap" "canonical" "slug"
  "responsive" "mobile" "viewport" "breakpoint"
  "test" "tests" "testing" "vitest" "jest" "e2e"
)

for kw in "${MEDIUM_COMPLEXITY_KEYWORDS[@]}"; do
  if echo "$FULL_TEXT" | grep -qiE "$kw"; then
    SCORE=$((SCORE + 1))
    REASONS+=("Complejidad media: \`$kw\`")
    break
  fi
done

# --- Modificadores adicionales ---

# Fuerza XL si el título lo dice explícitamente
if echo "$ISSUE_TITLE" | grep -qiE "^\[(XL|epic|módulo|module|sistema|system)\]"; then
  SCORE=$((SCORE + 10))
  REASONS+=("Marcado explícitamente como issue grande/épica")
fi

# +1 si tiene más de 5 criterios de aceptación
CRITERIA_COUNT=$(echo "$ISSUE_BODY" | grep -cE "^\s*-\s*\[" || echo 0)
if [ "$CRITERIA_COUNT" -gt 5 ]; then
  SCORE=$((SCORE + 1))
  REASONS+=("${CRITERIA_COUNT} criterios de aceptación → mayor alcance")
fi

# +1 si menciona tests como requerimiento
if echo "$ISSUE_BODY" | grep -qiE "test(s)? (escritos|actualizados|requeridos)|coverage|cobertura"; then
  SCORE=$((SCORE + 1))
  REASONS+=("Requiere tests → esfuerzo adicional estimado")
fi

# +1 si afecta múltiples capas (frontend + backend + DB)
LAYERS=0
echo "$FULL_TEXT" | grep -qiE "frontend|componente|page|ui" && LAYERS=$((LAYERS + 1))
echo "$FULL_TEXT" | grep -qiE "backend|api|endpoint|service" && LAYERS=$((LAYERS + 1))
echo "$FULL_TEXT" | grep -qiE "database|schema|prisma|migra|tabla" && LAYERS=$((LAYERS + 1))
if [ "$LAYERS" -ge 2 ]; then
  SCORE=$((SCORE + 1))
  REASONS+=("Afecta múltiples capas (${LAYERS}/3): frontend + backend + DB")
fi

# +1 si menciona múltiples juegos TCG
TCG_GAMES_COUNT=$(echo "$FULL_TEXT" | grep -oiE "pokemon|magic|yugioh|yu-gi-oh|one.piece|lorcana|dragon.ball|flesh.and.blood|digimon|vanguard" | sort -u | wc -l)
if [ "$TCG_GAMES_COUNT" -ge 2 ]; then
  SCORE=$((SCORE + 1))
  REASONS+=("Afecta ${TCG_GAMES_COUNT} juegos TCG → más casos de prueba")
fi

# --- Body muy corto → penalización (issue mal definida) ---
if [ ${#ISSUE_BODY} -lt 100 ]; then
  SCORE=2
  REASONS=("Issue con descripción muy breve — estimación conservadora. Define mejor los criterios para una estimación más precisa.")
fi

# =============================================================================
# DETERMINA TALLA
# =============================================================================

if [ "$SCORE" -le 0 ]; then
  ESTIMATE="XS"
  ESTIMATE_LABEL="estimate-XS"
  ESTIMATE_DESC="< 1 hora"
  ESTIMATE_COLOR="0e8a16"
  ESTIMATE_EXAMPLES="Cambio de texto, config trivial, fix de typo, variable de entorno"
elif [ "$SCORE" -le 1 ]; then
  ESTIMATE="S"
  ESTIMATE_LABEL="estimate-S"
  ESTIMATE_DESC="1–3 horas"
  ESTIMATE_COLOR="5ebeff"
  ESTIMATE_EXAMPLES="Endpoint simple, componente pequeño, ajuste de estilo, fix con solución clara"
elif [ "$SCORE" -le 3 ]; then
  ESTIMATE="M"
  ESTIMATE_LABEL="estimate-M"
  ESTIMATE_DESC="3–8 horas"
  ESTIMATE_COLOR="fbca04"
  ESTIMATE_EXAMPLES="Feature completa con tests, nuevo formulario con validación, integración simple"
elif [ "$SCORE" -le 5 ]; then
  ESTIMATE="L"
  ESTIMATE_LABEL="estimate-L"
  ESTIMATE_DESC="1–2 días"
  ESTIMATE_COLOR="e4711e"
  ESTIMATE_EXAMPLES="Integración nueva (Stripe, KYC), módulo con múltiples componentes, refactor significativo"
else
  ESTIMATE="XL"
  ESTIMATE_LABEL="estimate-XL"
  ESTIMATE_DESC="> 2 días"
  ESTIMATE_COLOR="b60205"
  ESTIMATE_EXAMPLES="Arquitectura nueva, módulo complejo (pricing engine, antifraude), sistema multi-componente"
fi

echo "📏 Estimación: ${ESTIMATE} (${ESTIMATE_DESC}) — Score: ${SCORE}"

# =============================================================================
# APLICA LABEL
# =============================================================================

# Elimina labels de estimación previos
for old_label in "estimate-XS" "estimate-S" "estimate-M" "estimate-L" "estimate-XL"; do
  gh issue edit "$ISSUE_NUMBER" \
    --repo "$REPO" \
    --remove-label "$old_label" \
    2>/dev/null || true
done

# Aplica el nuevo label (crea si no existe)
gh label create "$ESTIMATE_LABEL" \
  --repo "$REPO" \
  --color "$ESTIMATE_COLOR" \
  --description "Esfuerzo estimado: $ESTIMATE_DESC" \
  2>/dev/null || true

gh issue edit "$ISSUE_NUMBER" \
  --repo "$REPO" \
  --add-label "$ESTIMATE_LABEL"

# =============================================================================
# COMENTA JUSTIFICACIÓN
# =============================================================================

REASONS_MD=""
if [ ${#REASONS[@]} -gt 0 ]; then
  REASONS_MD="**Factores detectados:**"$'\n'
  for reason in "${REASONS[@]}"; do
    REASONS_MD+="- ${reason}"$'\n'
  done
fi

COMMENT=$(cat << EOF
## 📊 Estimación automática: **${ESTIMATE}** (${ESTIMATE_DESC})

**Score heurístico:** ${SCORE} puntos

${REASONS_MD}

**Ejemplos de este tamaño en el contexto TCG:**
${ESTIMATE_EXAMPLES}

| Talla | Tiempo | Cuándo usarla |
|-------|--------|---------------|
| XS | < 1h | Config, texto, fix trivial |
| S | 1–3h | Endpoint simple, componente pequeño |
| M | 3–8h | Feature completa con tests |
| L | 1–2 días | Integración nueva, refactor significativo |
| XL | > 2 días | Módulo complejo, arquitectura nueva |

> *Estimación heurística automática — ajusta en planning si es necesario.*
> *Para refinar: añade más criterios de aceptación o usa \`/estimate\` en el chat.*
EOF
)

gh issue comment "$ISSUE_NUMBER" \
  --repo "$REPO" \
  --body "$COMMENT"

echo "✅ Label ${ESTIMATE_LABEL} aplicado y comentario publicado."

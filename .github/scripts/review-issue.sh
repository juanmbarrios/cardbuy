#!/usr/bin/env bash
# =============================================================================
# review-issue.sh — Valida la estructura de una issue y comenta feedback
# Sin API de IA: usa reglas heurísticas y validaciones deterministas
# =============================================================================
set -euo pipefail

# --- Variables de entorno requeridas ---
: "${GH_TOKEN:?GH_TOKEN no definido}"
: "${ISSUE_NUMBER:?ISSUE_NUMBER no definido}"
: "${ISSUE_TITLE:?ISSUE_TITLE no definido}"
: "${REPO:?REPO no definido}"
ISSUE_BODY="${ISSUE_BODY:-}"

# --- Colores para logs ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 Revisando issue #${ISSUE_NUMBER}: ${ISSUE_TITLE}"

# =============================================================================
# VALIDACIONES
# =============================================================================

ISSUES_FOUND=()
SUGGESTIONS=()
SCORE=0

# 1. Título demasiado corto
TITLE_LEN=${#ISSUE_TITLE}
if [ "$TITLE_LEN" -lt 10 ]; then
  ISSUES_FOUND+=("❌ **Título demasiado corto** (${TITLE_LEN} chars). El título debe describir claramente el problema o feature.")
elif [ "$TITLE_LEN" -lt 20 ]; then
  SUGGESTIONS+=("⚠️ El título podría ser más descriptivo.")
else
  SCORE=$((SCORE + 1))
fi

# 2. Tiene descripción (body no vacío)
if [ -z "$ISSUE_BODY" ] || [ ${#ISSUE_BODY} -lt 50 ]; then
  ISSUES_FOUND+=("❌ **Sin descripción** o demasiado breve. Añade contexto, motivación y comportamiento esperado.")
else
  SCORE=$((SCORE + 1))
fi

# 3. Tiene criterios de aceptación
if echo "$ISSUE_BODY" | grep -qiE "criterios|acceptance criteria|criterios de aceptaci"; then
  SCORE=$((SCORE + 2))
elif echo "$ISSUE_BODY" | grep -qE "^\s*-\s*\["; then
  # Tiene checkboxes aunque no diga "criterios"
  SCORE=$((SCORE + 1))
  SUGGESTIONS+=("💡 Considera agrupar los checkboxes bajo una sección **### Criterios de aceptación**.")
else
  ISSUES_FOUND+=("❌ **Sin criterios de aceptación**. Añade checkboxes verificables con \`- [ ] criterio\`.")
fi

# 4. Detecta si es una issue TCG con entidades sin definir
TCG_KEYWORDS="carta|card|set|expansi|seller|buyer|listing|orden|order|precio|price|kyc|kyb|wallet|shipping|tracking|dispute|grading"
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "$TCG_KEYWORDS"; then
  if ! echo "$ISSUE_BODY" | grep -qiE "entidad|modelo|schema|tabla|endpoint|componente|ruta|route"; then
    SUGGESTIONS+=("💡 Esta issue parece afectar al dominio TCG. Considera especificar: entidades afectadas (Card, Listing, Order...), endpoints o componentes UI involucrados.")
  fi
fi

# 5. Tiene consideraciones técnicas o archivos mencionados
if echo "$ISSUE_BODY" | grep -qiE "consideracion|technical|archivo|file|componente|endpoint|schema|migra"; then
  SCORE=$((SCORE + 1))
else
  SUGGESTIONS+=("💡 Añade una sección **### Consideraciones técnicas** con archivos o componentes que se verán afectados.")
fi

# 6. Tipo de issue en el título (Feature, Bug, Chore, etc.)
if echo "$ISSUE_TITLE" | grep -qiE "^\[?(feat|feature|bug|fix|chore|refactor|docs|security|perf|seo|data)\]?"; then
  SCORE=$((SCORE + 1))
else
  SUGGESTIONS+=("💡 Considera añadir un prefijo al título: \`[Feature]\`, \`[Bug]\`, \`[Chore]\`, \`[Security]\`, \`[SEO]\`, \`[Data]\`.")
fi

# 7. Issue muy larga (>3000 chars → probablemente hay que descomponerla)
if [ ${#ISSUE_BODY} -gt 3000 ]; then
  SUGGESTIONS+=("⚠️ Esta issue es muy larga. Considera descomponerla en issues más pequeñas usando \`/breakdown-requirements\` en el chat.")
fi

# =============================================================================
# DETECCIÓN DE ÁREA / LABELS SUGERIDOS
# =============================================================================

SUGGESTED_LABELS=()

if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "frontend|componente|ui|ux|página|page|modal|form|diseño|css|tailwind|mobile"; then
  SUGGESTED_LABELS+=("frontend")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "api|backend|endpoint|route|service|prisma|database|migration|schema"; then
  SUGGESTED_LABELS+=("backend")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "docker|ci\/cd|deploy|server|infra|nginx|pm2|workflow|action"; then
  SUGGESTED_LABELS+=("infra")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "seo|meta|sitemap|canonical|slug|structured.data|schema.org|programático"; then
  SUGGESTED_LABELS+=("seo")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "seller|shop|tienda|inventario|listing|vendedor"; then
  SUGGESTED_LABELS+=("seller-tools")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "kyc|kyb|fraude|fraud|antifraude|verificaci|identidad|trust|safety|dispute|ban|sanción"; then
  SUGGESTED_LABELS+=("trust-safety")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "envío|shipping|tracking|logística|carrier|paquete|correos|mrw|seur"; then
  SUGGESTED_LABELS+=("logistics")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "precio|price|pricing|histórico|market|tcgplayer|cardmarket|watchlist"; then
  SUGGESTED_LABELS+=("pricing")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "comunidad|community|post|forum|rating|review|reputación|foro"; then
  SUGGESTED_LABELS+=("community")
fi
if echo "$ISSUE_TITLE $ISSUE_BODY" | grep -qiE "mobile|responsive|app|ios|android|pwa|viewport"; then
  SUGGESTED_LABELS+=("mobile")
fi

# =============================================================================
# GENERA COMENTARIO
# =============================================================================

# Determina el estado general
if [ ${#ISSUES_FOUND[@]} -eq 0 ] && [ "$SCORE" -ge 4 ]; then
  STATUS_ICON="✅"
  STATUS_TEXT="Issue bien estructurada"
elif [ ${#ISSUES_FOUND[@]} -eq 0 ]; then
  STATUS_ICON="⚠️"
  STATUS_TEXT="Issue aceptable — hay mejoras posibles"
else
  STATUS_ICON="🔴"
  STATUS_TEXT="Issue necesita mejoras antes de implementar"
fi

# Construye el cuerpo del comentario
COMMENT_FILE=$(mktemp)
cat > "$COMMENT_FILE" << 'HEREDOC_MARKER'
HEREDOC_MARKER

cat >> "$COMMENT_FILE" << EOF
## ${STATUS_ICON} Revisión automática de issue

**Estado:** ${STATUS_TEXT} (puntuación: ${SCORE}/6)

EOF

if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
  echo "### Problemas encontrados" >> "$COMMENT_FILE"
  echo "" >> "$COMMENT_FILE"
  for issue in "${ISSUES_FOUND[@]}"; do
    echo "$issue" >> "$COMMENT_FILE"
    echo "" >> "$COMMENT_FILE"
  done
fi

if [ ${#SUGGESTIONS[@]} -gt 0 ]; then
  echo "### Sugerencias de mejora" >> "$COMMENT_FILE"
  echo "" >> "$COMMENT_FILE"
  for suggestion in "${SUGGESTIONS[@]}"; do
    echo "$suggestion" >> "$COMMENT_FILE"
    echo "" >> "$COMMENT_FILE"
  done
fi

if [ ${#SUGGESTED_LABELS[@]} -gt 0 ]; then
  LABELS_STR=$(IFS=", "; echo "${SUGGESTED_LABELS[*]}")
  echo "### Labels sugeridos" >> "$COMMENT_FILE"
  echo "" >> "$COMMENT_FILE"
  echo "\`${LABELS_STR}\`" >> "$COMMENT_FILE"
  echo "" >> "$COMMENT_FILE"
fi

cat >> "$COMMENT_FILE" << 'EOF'
### Estructura recomendada para issues CardBuy

```
## [Tipo] Título descriptivo (máx 70 chars)

### Descripción
Contexto, motivación y comportamiento esperado.

### Criterios de aceptación
- [ ] Criterio verificable 1
- [ ] Criterio verificable 2
- [ ] Tests escritos

### Consideraciones técnicas
- Archivos/componentes afectados
- Entidades TCG involucradas (Card, Listing, Order...)
- Posibles riesgos o dependencias
```

> *Revisión automática generada por CardBuy Bot — sin API de IA*
EOF

# Publica el comentario
gh issue comment "$ISSUE_NUMBER" \
  --repo "$REPO" \
  --body-file "$COMMENT_FILE"

# Aplica labels sugeridos si hay
if [ ${#SUGGESTED_LABELS[@]} -gt 0 ]; then
  for label in "${SUGGESTED_LABELS[@]}"; do
    gh issue edit "$ISSUE_NUMBER" \
      --repo "$REPO" \
      --add-label "$label" \
      2>/dev/null || true
  done
fi

rm -f "$COMMENT_FILE"

echo "${GREEN}✅ Revisión completada — Score: ${SCORE}/6${NC}"
if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
  echo "${RED}❌ Problemas: ${#ISSUES_FOUND[@]}${NC}"
fi
if [ ${#SUGGESTIONS[@]} -gt 0 ]; then
  echo "${YELLOW}💡 Sugerencias: ${#SUGGESTIONS[@]}${NC}"
fi

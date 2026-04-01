#!/usr/bin/env bash
# =============================================================================
# review-pr.sh — Valida estructura y calidad de un PR (sin API de IA)
# Genera un informe de revisión estructurado con checklist automático
# =============================================================================
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN no definido}"
: "${PR_NUMBER:?PR_NUMBER no definido}"
: "${PR_TITLE:?PR_TITLE no definido}"
: "${REPO:?REPO no definido}"
PR_BODY="${PR_BODY:-}"
BASE_BRANCH="${BASE_BRANCH:-main}"
HEAD_BRANCH="${HEAD_BRANCH:-}"

echo "🔍 Revisando PR #${PR_NUMBER}: ${PR_TITLE}"

# =============================================================================
# OBTIENE EL DIFF
# =============================================================================

DIFF=$(git diff "origin/${BASE_BRANCH}...HEAD" 2>/dev/null | head -c 20000 || echo "")
DIFF_LINES=$(echo "$DIFF" | wc -l)
DIFF_FILES=$(git diff --name-only "origin/${BASE_BRANCH}...HEAD" 2>/dev/null || echo "")
FILES_COUNT=$(echo "$DIFF_FILES" | grep -c "." || echo 0)

echo "  Archivos modificados: ${FILES_COUNT}"
echo "  Líneas de diff: ${DIFF_LINES}"

# =============================================================================
# VALIDACIONES DEL PR
# =============================================================================

ISSUES=()
WARNINGS=()
POSITIVES=()
SECURITY_FLAGS=()
SCORE=0

# 1. Título sigue Conventional Commits
if echo "$PR_TITLE" | grep -qE "^(feat|fix|chore|refactor|docs|test|perf|style|ci|build|revert)(\(.+\))?: .{5,}"; then
  POSITIVES+=("✅ Título sigue Conventional Commits correctamente")
  SCORE=$((SCORE + 1))
else
  ISSUES+=("❌ **Título no sigue Conventional Commits**: usa \`feat:\`, \`fix:\`, \`chore:\`, \`refactor:\`, etc.")
fi

# 2. Tiene descripción en el body del PR
if [ -z "$PR_BODY" ] || [ ${#PR_BODY} -lt 50 ]; then
  ISSUES+=("❌ **PR sin descripción** o demasiado breve. Rellena el template del PR.")
else
  POSITIVES+=("✅ PR tiene descripción")
  SCORE=$((SCORE + 1))
fi

# 3. Checklist del template rellenada
UNCHECKED=$(echo "$PR_BODY" | grep -cE "^\s*-\s*\[\s*\]" || echo 0)
CHECKED=$(echo "$PR_BODY" | grep -cE "^\s*-\s*\[x\]" || echo 0)

if [ "$UNCHECKED" -gt 0 ] && [ "$CHECKED" -eq 0 ]; then
  WARNINGS+=("⚠️ El checklist del PR no ha sido marcado. Complétalo antes de pedir revisión.")
elif [ "$CHECKED" -gt 0 ]; then
  POSITIVES+=("✅ Checklist parcialmente completado (${CHECKED} ✓, ${UNCHECKED} pendientes)")
  SCORE=$((SCORE + 1))
fi

# 4. Referencia a issue
if echo "$PR_BODY" | grep -qiE "(closes|fixes|resolves|ref)\s*#[0-9]+"; then
  ISSUE_REF=$(echo "$PR_BODY" | grep -oiE "(closes|fixes|resolves|ref)\s*#[0-9]+" | head -1)
  POSITIVES+=("✅ Referencias a issue: \`${ISSUE_REF}\`")
  SCORE=$((SCORE + 1))
else
  WARNINGS+=("⚠️ No se encontró referencia a issue (\`Closes #N\`, \`Fixes #N\`). Si resuelve una issue, añádela.")
fi

# 5. Tamaño del PR
if [ "$FILES_COUNT" -gt 20 ]; then
  WARNINGS+=("⚠️ **PR muy grande** (${FILES_COUNT} archivos). Considera dividirlo en PRs más pequeños.")
elif [ "$FILES_COUNT" -gt 10 ]; then
  WARNINGS+=("⚠️ PR con muchos archivos (${FILES_COUNT}). Verifica que todos los cambios son necesarios en este PR.")
else
  POSITIVES+=("✅ Tamaño de PR razonable (${FILES_COUNT} archivos)")
  SCORE=$((SCORE + 1))
fi

# 6. Detecta archivos sensibles en el diff
SENSITIVE_PATTERNS=(
  "\.env$" "\.env\." "secrets?" "credentials?" "password" "passwd"
  "api[_-]?key" "secret[_-]?key" "private[_-]?key" "token"
  "stripe.*sk_live" "stripe.*pk_live"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if echo "$DIFF_FILES" | grep -qiE "$pattern" || echo "$DIFF" | grep -qiE "=\s*['\"]?[A-Za-z0-9_\-]{20,}['\"]?"; then
    SECURITY_FLAGS+=("🔒 **Posible exposición de credenciales** — revisa que no hay secrets en el diff")
    break
  fi
done

# 7. Detecta patrones de seguridad problemáticos en el código
SECURITY_PATTERNS=(
  "eval\s*\(" "dangerouslySetInnerHTML" "innerHTML\s*=" "__html"
  "sql.*\+.*req\." "query.*\+.*params\." "exec\s*\(.*req\."
  "console\.log.*password\|console\.log.*secret\|console\.log.*token"
  "process\.env\.[A-Z_]+[^}]" # variables de entorno sin validar
)

for pattern in "${SECURITY_PATTERNS[@]}"; do
  if echo "$DIFF" | grep -qE "$pattern"; then
    SECURITY_FLAGS+=("🔒 **Patrón de seguridad detectado**: \`$pattern\` — requiere revisión manual")
    break
  fi
done

# 8. Detecta si hay tests en el PR
if echo "$DIFF_FILES" | grep -qiE "\.(test|spec)\.(ts|tsx|js|jsx)$"; then
  POSITIVES+=("✅ El PR incluye tests")
  SCORE=$((SCORE + 1))
elif echo "$DIFF_FILES" | grep -qiE "\.(ts|tsx|js|jsx)$"; then
  WARNINGS+=("⚠️ Cambios en código sin tests detectados. Considera añadir tests para los nuevos cambios.")
fi

# 9. Rama hacia develop (no directamente a main)
if [ "$BASE_BRANCH" = "main" ] && echo "$HEAD_BRANCH" | grep -qvE "^(hotfix|release)/"; then
  WARNINGS+=("⚠️ PR directamente hacia \`main\`. Considera usar \`develop\` como rama base salvo hotfixes.")
fi

# 10. Detecta migraciones de Prisma
if echo "$DIFF_FILES" | grep -qiE "prisma/migrations/"; then
  WARNINGS+=("⚠️ **Migración de base de datos detectada**. Verifica que es reversible y se ha probado en desarrollo.")
fi

# =============================================================================
# DETERMINA VEREDICTO
# =============================================================================

if [ ${#SECURITY_FLAGS[@]} -gt 0 ]; then
  VERDICT="🔴 **Requiere revisión de seguridad antes de mergear**"
  gh issue edit "$PR_NUMBER" \
    --repo "$REPO" \
    --add-label "needs-security-review" \
    2>/dev/null || true
elif [ ${#ISSUES[@]} -gt 0 ]; then
  VERDICT="🔴 **Requiere cambios** antes de aprobar"
elif [ ${#WARNINGS[@]} -gt 2 ]; then
  VERDICT="⚠️ **Aprobado con sugerencias** — revisar warnings antes de mergear"
else
  VERDICT="✅ **Listo para revisión humana**"
fi

# =============================================================================
# GENERA COMENTARIO
# =============================================================================

{
  echo "## 🔍 Revisión automática de PR #${PR_NUMBER}"
  echo ""
  echo "**Veredicto:** ${VERDICT}"
  echo ""
  echo "**Resumen:** ${FILES_COUNT} archivos modificados | Score: ${SCORE}/6"
  echo ""

  if [ ${#SECURITY_FLAGS[@]} -gt 0 ]; then
    echo "### 🔒 Alertas de seguridad"
    echo ""
    for flag in "${SECURITY_FLAGS[@]}"; do
      echo "- $flag"
    done
    echo ""
  fi

  if [ ${#POSITIVES[@]} -gt 0 ]; then
    echo "### Aspectos positivos"
    echo ""
    for positive in "${POSITIVES[@]}"; do
      echo "- $positive"
    done
    echo ""
  fi

  if [ ${#ISSUES[@]} -gt 0 ]; then
    echo "### Problemas a resolver"
    echo ""
    for issue in "${ISSUES[@]}"; do
      echo "- $issue"
    done
    echo ""
  fi

  if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo "### Puntos de atención"
    echo ""
    for warning in "${WARNINGS[@]}"; do
      echo "- $warning"
    done
    echo ""
  fi

  echo "### Checklist de revisión humana"
  echo ""
  echo "- [ ] El código hace lo que la issue pedía"
  echo "- [ ] No hay credenciales o datos sensibles en el diff"
  echo "- [ ] Los tests existen y cubren los casos principales"
  echo "- [ ] No hay efectos secundarios no intencionados"
  echo "- [ ] Las entidades TCG afectadas (Card, Listing, Order...) están correctamente manejadas"
  echo "- [ ] Los errores son manejados apropiadamente"
  echo ""
  echo "> *Revisión automática generada por CardBuy Bot — para revisión profunda usa \`/pr-review ${PR_NUMBER}\` en el chat.*"
} > /tmp/pr-review-comment.md

gh pr comment "$PR_NUMBER" \
  --repo "$REPO" \
  --body-file "/tmp/pr-review-comment.md" \
  2>/dev/null || \
gh issue comment "$PR_NUMBER" \
  --repo "$REPO" \
  --body-file "/tmp/pr-review-comment.md"

echo "✅ Revisión de PR publicada — Score: ${SCORE}/6"
[ ${#SECURITY_FLAGS[@]} -gt 0 ] && echo "🔒 ALERTAS DE SEGURIDAD: ${#SECURITY_FLAGS[@]}"

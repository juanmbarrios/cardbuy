#!/usr/bin/env bash
# =============================================================================
# detect-duplicates.sh — Detección heurística de issues duplicadas
# Sin API de IA: usa similitud de palabras clave (Jaccard coefficient)
# =============================================================================
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN no definido}"
: "${REPO:?REPO no definido}"
POST_SUMMARY="${POST_SUMMARY:-false}"

echo "🔍 Detectando issues duplicadas en ${REPO}..."

# Obtiene todas las issues abiertas
ISSUES_JSON=$(gh issue list \
  --repo "$REPO" \
  --state open \
  --limit 200 \
  --json number,title,body,labels \
  2>/dev/null || echo "[]")

ISSUE_COUNT=$(echo "$ISSUES_JSON" | python3 -c "import json,sys; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo 0)
echo "  Issues abiertas: ${ISSUE_COUNT}"

if [ "$ISSUE_COUNT" -lt 2 ]; then
  echo "✅ Menos de 2 issues abiertas — nada que comparar."
  exit 0
fi

# =============================================================================
# ALGORITMO DE SIMILITUD (Python inline — disponible en ubuntu-latest)
# =============================================================================

DUPLICATES_FOUND=$(python3 << 'PYTHON_EOF'
import json
import sys
import re
import os

# Lee las issues
issues_json = os.environ.get('ISSUES_JSON', '[]')
try:
    issues = json.loads(issues_json)
except:
    print("[]")
    sys.exit(0)

# Stop words en español e inglés
STOP_WORDS = {
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'de', 'del',
    'en', 'a', 'que', 'se', 'es', 'por', 'con', 'para', 'al', 'lo', 'su', 'sus',
    'le', 'me', 'te', 'si', 'no', 'ya', 'hay', 'ser', 'estar', 'the', 'a', 'an',
    'and', 'or', 'of', 'in', 'to', 'for', 'is', 'it', 'be', 'as', 'at', 'this',
    'by', 'from', 'with', 'that', 'are', 'on', 'not', 'have', 'but', 'we', 'our',
    'can', 'will', 'all', 'would', 'there', 'their', 'what', 'if', 'one', 'which',
    'do', 'add', 'create', 'update', 'fix', 'change', 'añadir', 'crear', 'actualizar',
    'implementar', 'agregar', 'modificar', 'mejorar'
}

# Palabras clave TCG con peso extra (x2)
TCG_KEYWORDS = {
    'card', 'carta', 'listing', 'anuncio', 'seller', 'vendedor', 'buyer', 'comprador',
    'order', 'orden', 'price', 'precio', 'pricing', 'kyc', 'kyb', 'dispute', 'disputa',
    'fraud', 'fraude', 'tracking', 'shipping', 'envío', 'grading', 'condition', 'condición',
    'watchlist', 'pokemon', 'magic', 'yugioh', 'lorcana', 'onpiece', 'dragonball',
    'marketplace', 'community', 'comunidad', 'review', 'rating', 'reputación'
}

def tokenize(text):
    if not text:
        return set()
    text = text.lower()
    text = re.sub(r'[^a-z0-9áéíóúñü\s]', ' ', text)
    tokens = set()
    for word in text.split():
        if len(word) > 2 and word not in STOP_WORDS:
            tokens.add(word)
            # Peso doble para keywords TCG
            if word in TCG_KEYWORDS:
                tokens.add(f"_tcg_{word}")
    return tokens

def jaccard_similarity(set_a, set_b):
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0

# Construye tokens para cada issue
issue_tokens = []
for issue in issues:
    text = f"{issue.get('title', '')} {issue.get('body', '') or ''}"
    skip_review = any(l.get('name') == 'skip-review' for l in issue.get('labels', []))
    if not skip_review:
        issue_tokens.append({
            'number': issue['number'],
            'title': issue['title'],
            'tokens': tokenize(text)
        })

# Compara pares
duplicates = []
for i in range(len(issue_tokens)):
    for j in range(i + 1, len(issue_tokens)):
        a = issue_tokens[i]
        b = issue_tokens[j]
        similarity = jaccard_similarity(a['tokens'], b['tokens'])
        if similarity >= 0.35:  # threshold 35%
            duplicates.append({
                'issue_a': a['number'],
                'issue_b': b['number'],
                'title_a': a['title'],
                'title_b': b['title'],
                'similarity': round(similarity * 100)
            })

# Ordena por similitud descendente
duplicates.sort(key=lambda x: x['similarity'], reverse=True)
print(json.dumps(duplicates[:20]))  # máx 20 pares
PYTHON_EOF
)

export ISSUES_JSON
DUPLICATES_FOUND=$(python3 << 'PYTHON_EOF'
import json, sys, re, os

issues_json = os.environ.get('ISSUES_JSON', '[]')
try:
    issues = json.loads(issues_json)
except:
    print("[]")
    sys.exit(0)

STOP_WORDS = {
    'el','la','los','las','un','una','y','o','de','del','en','a','que','se','es',
    'por','con','para','al','lo','su','sus','le','me','te','si','no','ya','hay',
    'the','an','and','or','of','in','to','for','is','it','be','as','at','this',
    'by','from','with','that','are','on','not','have','but','we','our','can','will',
    'all','would','there','their','what','if','one','which','do','add','create',
    'update','fix','change','añadir','crear','actualizar','implementar','agregar',
    'modificar','mejorar'
}

TCG_KEYWORDS = {
    'card','carta','listing','anuncio','seller','vendedor','buyer','comprador',
    'order','orden','price','precio','pricing','kyc','kyb','dispute','disputa',
    'fraud','fraude','tracking','shipping','envio','grading','condition',
    'watchlist','pokemon','magic','yugioh','lorcana','marketplace','community',
    'comunidad','review','rating','reputacion'
}

def tokenize(text):
    if not text:
        return set()
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = set()
    for word in text.split():
        if len(word) > 2 and word not in STOP_WORDS:
            tokens.add(word)
            if word in TCG_KEYWORDS:
                tokens.add(f"_tcg_{word}")
    return tokens

def jaccard(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)

issue_tokens = []
for issue in issues:
    text = f"{issue.get('title','')} {issue.get('body','') or ''}"
    skip = any(l.get('name') == 'skip-review' for l in issue.get('labels',[]))
    if not skip:
        issue_tokens.append({'number':issue['number'],'title':issue['title'],'tokens':tokenize(text)})

dups = []
for i in range(len(issue_tokens)):
    for j in range(i+1, len(issue_tokens)):
        a, b = issue_tokens[i], issue_tokens[j]
        sim = jaccard(a['tokens'], b['tokens'])
        if sim >= 0.35:
            dups.append({'issue_a':a['number'],'issue_b':b['number'],'title_a':a['title'],'title_b':b['title'],'similarity':round(sim*100)})

dups.sort(key=lambda x: x['similarity'], reverse=True)
print(json.dumps(dups[:20]))
PYTHON_EOF
)

echo "  Pares similares encontrados: $(echo "$DUPLICATES_FOUND" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)"

# =============================================================================
# PROCESA RESULTADOS
# =============================================================================

PAIRS_COUNT=$(echo "$DUPLICATES_FOUND" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)

if [ "$PAIRS_COUNT" -eq 0 ]; then
  echo "✅ No se detectaron issues duplicadas."
  exit 0
fi

# Comenta y aplica labels para cada par
echo "$DUPLICATES_FOUND" | python3 << PYTHON_PROCESS
import json, subprocess, os, sys

data = json.loads('''$DUPLICATES_FOUND''')
repo = os.environ.get('REPO', '')
gh_token = os.environ.get('GH_TOKEN', '')

for pair in data:
    issue_a = pair['issue_a']
    issue_b = pair['issue_b']
    title_a = pair['title_a']
    title_b = pair['title_b']
    similarity = pair['similarity']

    # Comenta en la issue más reciente (número mayor)
    target = max(issue_a, issue_b)
    other = min(issue_a, issue_b)

    comment = f"""## ⚠️ Posible duplicado detectado

Esta issue tiene un **{similarity}% de similitud** con la issue **#{other}**:

> *{title_a if target == issue_b else title_b}*

**Si es un duplicado:** cierra esta issue con el comentario: \`Duplicado de #{other}\`
**Si NO es un duplicado:** elimina el label \`possible-duplicate\` de esta issue.

> *Detección automática semanal — sin API de IA*"""

    env = {**os.environ, 'GH_TOKEN': gh_token}

    # Añade label
    subprocess.run([
        'gh', 'issue', 'edit', str(target),
        '--repo', repo,
        '--add-label', 'possible-duplicate'
    ], capture_output=True, env=env)

    # Publica comentario
    subprocess.run([
        'gh', 'issue', 'comment', str(target),
        '--repo', repo,
        '--body', comment
    ], capture_output=True, env=env)

    print(f"  Marcada: #{target} ~ #{other} ({similarity}%)")

PYTHON_PROCESS

# Resumen final
if [ "$POST_SUMMARY" = "true" ]; then
  SUMMARY_BODY="## Resumen de detección de duplicados — $(date '+%Y-%m-%d')

Se encontraron **${PAIRS_COUNT}** pares de issues similares.

Revisa las issues con el label \`possible-duplicate\` y decide cuáles cerrar."

  gh issue create \
    --repo "$REPO" \
    --title "[Mantenimiento] Duplicados detectados — $(date '+%Y-%m-%d')" \
    --body "$SUMMARY_BODY" \
    --label "skip-review" \
    2>/dev/null || true
fi

echo "✅ Detección de duplicados completada — ${PAIRS_COUNT} pares marcados."

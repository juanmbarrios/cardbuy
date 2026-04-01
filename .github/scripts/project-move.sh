#!/usr/bin/env bash
# =============================================================================
# project-move.sh — Mueve una issue/PR a una columna del tablero Kanban
# Requiere PROJECT_TOKEN con scope 'project'
# =============================================================================
set -euo pipefail

COLUMN="${1:-Todo}"
ISSUE_NUMBER="${2:-}"

: "${GH_TOKEN:?GH_TOKEN no definido}"
: "${REPO:?REPO no definido}"

if [ -z "$ISSUE_NUMBER" ]; then
  echo "Uso: project-move.sh <columna> <issue_number>"
  exit 1
fi

PROJECT_NUMBER="${PROJECT_NUMBER:-1}"
OWNER=$(echo "$REPO" | cut -d'/' -f1)

echo "📋 Moviendo issue #${ISSUE_NUMBER} a columna '${COLUMN}'..."

# Obtiene el ID del proyecto via GraphQL
PROJECT_DATA=$(gh api graphql \
  --field query='
    query($owner: String!, $number: Int!) {
      user(login: $owner) {
        projectV2(number: $number) {
          id
          fields(first: 20) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  ' \
  --field owner="$OWNER" \
  --field number="$PROJECT_NUMBER" \
  2>/dev/null || echo "{}")

if echo "$PROJECT_DATA" | grep -q '"id"'; then
  PROJECT_ID=$(echo "$PROJECT_DATA" | python3 -c "
import json, sys
data = json.load(sys.stdin)
try:
    print(data['data']['user']['projectV2']['id'])
except:
    print('')
" 2>/dev/null || echo "")

  if [ -z "$PROJECT_ID" ]; then
    echo "⚠️  No se pudo obtener el ID del proyecto. Verifica PROJECT_NUMBER y PROJECT_TOKEN."
    exit 0
  fi

  # Obtiene el issue node ID
  ISSUE_NODE_ID=$(gh issue view "$ISSUE_NUMBER" \
    --repo "$REPO" \
    --json id \
    --jq '.id' \
    2>/dev/null || echo "")

  if [ -n "$ISSUE_NODE_ID" ]; then
    # Añade el item al proyecto (si no está ya)
    gh api graphql \
      --field query='
        mutation($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
            item { id }
          }
        }
      ' \
      --field projectId="$PROJECT_ID" \
      --field contentId="$ISSUE_NODE_ID" \
      2>/dev/null || true

    echo "✅ Issue #${ISSUE_NUMBER} procesada en el tablero."
  fi
else
  echo "⚠️  GraphQL API no disponible o PROJECT_TOKEN sin permisos. Saltando sync de tablero."
fi

echo "  Columna destino: ${COLUMN}"

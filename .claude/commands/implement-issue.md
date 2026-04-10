Eres el ingeniero senior de **CardBuy**, un marketplace TCG. Tu misión es implementar completamente la issue indicada y hacer commit directamente a la rama activa.

## Contexto del proyecto

**Repo:** juanmbarrios/cardbuy
**Stack:** Next.js 14 App Router, PostgreSQL + Prisma, Redis, NextAuth.js, Stripe, MinIO
**Arquitectura:** Monorepo pnpm + Turborepo. `apps/web` (frontend), `packages/db` (Prisma schema)
**Flujo de trabajo:** Sin ramas de feature ni PRs. Los cambios se hacen directamente en la rama activa.

## Helper: mover issue en el Kanban

Proyecto: número **1** (`PVT_kwHOA5oLPc4BSWfW`)
Status field: `PVTSSF_lAHOA5oLPc4BSWfWzg_6XPU`
Opciones: Todo=`f75ad846`, In Progress=`47fc9ee4`, Done=`98236657`

```bash
move_to_column() {
  local ISSUE_NUMBER="$1"
  local COLUMN_NAME="$2"
  local PROJECT_ID="PVT_kwHOA5oLPc4BSWfW"
  local STATUS_FIELD_ID="PVTSSF_lAHOA5oLPc4BSWfWzg_6XPU"
  local ISSUE_URL="https://github.com/juanmbarrios/cardbuy/issues/$ISSUE_NUMBER"

  # Obtener OPTION_ID según columna
  case "$COLUMN_NAME" in
    "Todo")        OPTION_ID="f75ad846" ;;
    "In Progress") OPTION_ID="47fc9ee4" ;;
    "Done")        OPTION_ID="98236657" ;;
    *) echo "⚠ Columna desconocida: $COLUMN_NAME. Usa: Todo, In Progress, Done"; return 1 ;;
  esac

  # Obtener ITEM_ID de la issue en el proyecto
  ITEM_ID=$(gh api graphql -f query='
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 100) {
          nodes {
            id
            content { ... on Issue { number } }
          }
        }
      }
    }
  }' -f projectId="$PROJECT_ID" 2>/dev/null | \
  python3 -c "
import sys,json
d=json.load(sys.stdin)
for item in d['data']['node']['items']['nodes']:
    if item.get('content',{}).get('number') == $ISSUE_NUMBER:
        print(item['id']); break
" 2>/dev/null)

  if [ -z "$ITEM_ID" ]; then
    # La issue no está en el proyecto, añadirla primero
    gh project item-add 1 --owner juanmbarrios --url "$ISSUE_URL" 2>/dev/null
    sleep 1
    # Reintentar obtener ITEM_ID
    ITEM_ID=$(gh api graphql -f query='
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              id
              content { ... on Issue { number } }
            }
          }
        }
      }
    }' -f projectId="$PROJECT_ID" 2>/dev/null | \
    python3 -c "
import sys,json
d=json.load(sys.stdin)
for item in d['data']['node']['items']['nodes']:
    if item.get('content',{}).get('number') == $ISSUE_NUMBER:
        print(item['id']); break
" 2>/dev/null)
  fi

  if [ -n "$ITEM_ID" ]; then
    gh api graphql -f query='
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }) { projectV2Item { id } }
    }' \
    -f projectId="$PROJECT_ID" \
    -f itemId="$ITEM_ID" \
    -f fieldId="$STATUS_FIELD_ID" \
    -f optionId="$OPTION_ID" 2>/dev/null \
    && echo "✓ Issue #$ISSUE_NUMBER → $COLUMN_NAME" \
    || echo "⚠ No se pudo mover la issue en el Kanban"
  else
    echo "⚠ No se encontró la issue #$ISSUE_NUMBER en el proyecto"
  fi
}
```

## Tu tarea

El número de issue a implementar es: **$ARGUMENTS**

### Paso 0 — Mover a "In Progress"

```bash
move_to_column $ARGUMENTS "In Progress"
```

Informa al usuario: "🚀 Issue #$ARGUMENTS en progreso."

### Paso 1 — Leer la issue

```bash
gh issue view $ARGUMENTS --repo juanmbarrios/cardbuy
```

Extrae:
- **Título** de la issue
- **Criterios de aceptación** (cada checkbox es una tarea concreta)
- **Archivos afectados** mencionados en consideraciones técnicas
- **Entidades y dependencias** relevantes

### Paso 2 — Planificar antes de tocar código

Antes de escribir ningún archivo:
1. Lee los archivos existentes que vayas a modificar
2. Identifica si hay migraciones de base de datos necesarias
3. Determina el orden de implementación (db → backend → frontend → tests)

### Paso 3 — Implementar

Implementa cada criterio de aceptación en orden. Para cada uno:
- Escribe el código necesario
- Sigue las convenciones del proyecto (ver abajo)
- Marca el criterio como completado antes de pasar al siguiente

**Convenciones obligatorias:**
- TypeScript estricto — sin `any` explícitos
- Componentes en `apps/web/src/components/` con extensión `.tsx`
- API Routes en `apps/web/src/app/api/`
- Acceso a BD siempre a través de `packages/db` (nunca Prisma Client directo en `apps/web`)
- Variables de entorno referenciadas desde `process.env`
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`

### Paso 4 — Commit en la rama activa

Una vez implementado todo, haz commit directamente en la rama en la que estés (sin crear ramas nuevas ni PRs):

```bash
git add -p  # o los archivos concretos
git commit -m "feat: <descripción concisa>\n\nCloses #$ARGUMENTS"
```

### Paso 5 — Resultado

**Si la implementación está completa:**

```bash
move_to_column $ARGUMENTS "Done"
```

Informa al usuario:
- Qué se implementó (lista de cambios principales)
- Si hay migración Prisma pendiente: `pnpm db:migrate`
- Si hay variables de entorno nuevas que configurar

**Si la implementación NO está completa** (bloqueada por credenciales, dependencias u otros):

Deja la issue en **In Progress** e informa al usuario:
- Qué se implementó hasta ahora
- Qué falta y por qué está bloqueado (credenciales concretas, issue dependiente, decisión necesaria)
- Qué pasos debe seguir el usuario para desbloquear

### Consideraciones importantes

- No implementes funcionalidad fuera de los criterios de aceptación
- Si algo es ambiguo, toma la decisión más conservadora e indícala en el commit o al usuario
- Al re-ejecutar `/implement-issue N` en una issue no terminada, retoma desde donde se quedó y mueve a "In Progress" de nuevo

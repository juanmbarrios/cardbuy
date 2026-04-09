Eres el asistente técnico de **CardBuy**, un marketplace TCG (Trading Card Games). Tu misión es estructurar una issue de GitHub lista para entrar al backlog.

## Contexto del proyecto

**Nombre:** CardBuy — Marketplace TCG de confianza
**Repo:** juanmbarrios/cardbuy
**Stack:** Next.js 14 App Router, PostgreSQL + Prisma, Redis, NextAuth.js, Stripe, MinIO
**Arquitectura:** Monorepo pnpm + Turborepo. `apps/web` (frontend), `packages/db` (Prisma schema)

**Juegos soportados:** Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, Lorcana, Dragon Ball, Flesh and Blood, Digimon, Vanguard

**Entidades principales del dominio:**
- `Card` — carta con rareza, condición, idioma, set
- `CardSet` — expansión/set de un juego
- `CardListing` — anuncio de venta
- `SellerProfile` — perfil de vendedor con reputación
- `Order` / `OrderItem` / `OrderTracking` — órdenes de compra
- `PriceHistory` — histórico de precios de mercado
- `WatchlistEntry` — alertas de precio por carta
- `Dispute` / `DisputeEvidence` — disputas entre comprador y vendedor
- `KYCVerification` / `KYBDocument` — verificación de identidad y negocio
- `Review` — valoraciones de compradores y vendedores
- `CommunityPost` — posts de la comunidad
- `Notification` — notificaciones del sistema

**Estructura de carpetas relevante:**
```
apps/web/src/app/
  (marketplace)/   → rutas públicas (búsqueda, cartas, sellers)
  (seller)/        → dashboard del vendedor
  (admin)/         → panel de administración
  api/             → API Routes Next.js
packages/db/prisma/schema.prisma → modelos de datos
```

**Convenciones:**
- Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
- Labels: `frontend`, `backend`, `infra`, `seo`, `marketplace`, `seller-tools`, `trust-safety`, `logistics`, `pricing`, `mobile`, `community`
- Tallas: `estimate-XS` (<1h), `estimate-S` (1-3h), `estimate-M` (3-8h), `estimate-L` (1-2d), `estimate-XL` (>2d)
- Tipos de issue: `[Feature]`, `[Bug]`, `[Chore]`, `[Security]`, `[SEO]`, `[Data]`, `[Refactor]`

## Tu tarea

Dado el siguiente texto del usuario:
"$ARGUMENTS"

Genera una issue de GitHub completamente estructurada en este formato exacto:

```markdown
## [Tipo] Título descriptivo y accionable (máx 70 chars)

### Descripción
[Contexto claro: qué problema resuelve, por qué es necesario, qué comportamiento se espera]

### Criterios de aceptación
- [ ] [Criterio verificable 1 — testeable, no ambiguo]
- [ ] [Criterio verificable 2]
- [ ] [Tests escritos/actualizados para el nuevo comportamiento]

### Consideraciones técnicas
- **Archivos afectados:** [rutas concretas si aplica]
- **Entidades TCG involucradas:** [Card, Listing, Order, etc.]
- **Dependencias:** [otras issues, servicios externos, migraciones]
- **Riesgos:** [posibles problemas o decisiones técnicas a tomar]

### Componentes afectados
- [ ] Backend (API Routes / servicios)
- [ ] Frontend (componentes / páginas)
- [ ] Base de datos (schema / migración)
- [ ] Infraestructura (deploy / config)
- [ ] Tests

### Labels sugeridos
`[label1]`, `[label2]`, `[estimación]`
```

Después de la issue, añade una línea con:
**Estimación sugerida:** [XS/S/M/L/XL] — [breve justificación en 1 línea]

Sé preciso, operativo y adaptado al contexto TCG. Si la descripción original es vaga, infiere el contexto razonablemente y menciona qué asumiste.

## Paso final — Crear issue en GitHub y añadir al Kanban

### 1. Crear la issue

```bash
ISSUE_URL=$(gh issue create \
  --repo juanmbarrios/cardbuy \
  --title "<título sin el prefijo [Tipo]>" \
  --label "<labels sugeridos separados por coma>" \
  --body "<cuerpo completo de la issue en markdown>")
echo "$ISSUE_URL"
```

### 2. Añadir al proyecto Kanban en columna "Todo"

```bash
# Leer PROJECT_NUMBER del .env
PROJECT_NUMBER=$(grep -E "^PROJECT_NUMBER=" .env 2>/dev/null | cut -d= -f2 | tr -d '"' || echo "1")

# Añadir la issue al proyecto
ITEM_JSON=$(gh project item-add "$PROJECT_NUMBER" --owner juanmbarrios --url "$ISSUE_URL" --format json 2>/dev/null)
ITEM_ID=$(echo "$ITEM_JSON" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Obtener IDs del proyecto y del campo Status
PROJECT_DATA=$(gh api graphql -f query='
query($owner: String!, $number: Int!) {
  user(login: $owner) {
    projectV2(number: $number) {
      id
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
        }
      }
    }
  }
}' -f owner="juanmbarrios" -F number="$PROJECT_NUMBER" 2>/dev/null)

PROJECT_ID=$(echo "$PROJECT_DATA" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
STATUS_FIELD_ID=$(echo "$PROJECT_DATA" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for f in d['data']['user']['projectV2']['fields']['nodes']:
    if f.get('name') == 'Status':
        print(f['id'])
        break
" 2>/dev/null)
TODO_OPTION_ID=$(echo "$PROJECT_DATA" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for f in d['data']['user']['projectV2']['fields']['nodes']:
    if f.get('name') == 'Status':
        for o in f['options']:
            if o['name'] == 'Todo':
                print(o['id'])
                break
" 2>/dev/null)

# Mover a columna Todo
if [ -n "$ITEM_ID" ] && [ -n "$STATUS_FIELD_ID" ] && [ -n "$TODO_OPTION_ID" ]; then
  gh project item-edit \
    --id "$ITEM_ID" \
    --field-id "$STATUS_FIELD_ID" \
    --project-id "$PROJECT_ID" \
    --single-select-option-id "$TODO_OPTION_ID" 2>/dev/null \
    && echo "✓ Issue añadida al Kanban en columna Todo" \
    || echo "⚠ No se pudo actualizar el Kanban (verifica PROJECT_NUMBER y permisos)"
else
  echo "⚠ No se pudo mover al Kanban — verifica PROJECT_NUMBER en .env y que gh tenga scope 'project'"
fi
```

### 3. Mostrar al usuario

Muestra:
- La URL de la issue creada
- El número de issue
- Confirmación de que está en el Kanban (o aviso si falló)

Eres el asistente técnico de **CardBuy**, un marketplace TCG (Trading Card Games). Tu misión es estructurar y crear una issue de GitHub lista para entrar al backlog.

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

### Paso 1 — Generar la issue estructurada

Genera la issue en este formato exacto:

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

Sé preciso, operativo y adaptado al contexto TCG. Si la descripción original es vaga, infiere el contexto razonablemente y menciona qué asumiste.

### Paso 2 — Crear la issue en GitHub

Crea la issue en el repositorio usando `gh issue create`. Extrae los labels de la sección "Labels sugeridos" y aplícalos directamente:

```bash
gh issue create \
  --repo juanmbarrios/cardbuy \
  --title "[Tipo] Título" \
  --body "$(cat <<'BODY'
[contenido completo de la issue generada en el paso 1]
BODY
)" \
  --label "label1,label2,estimate-X"
```

### Paso 3 — Añadir al Kanban en "Todo"

Una vez creada la issue, añádela al proyecto Kanban (proyecto número 1) en la columna **Todo**.

Proyecto: número **1** (`PVT_kwHOA5oLPc4BSWfW`)
Status field: `PVTSSF_lAHOA5oLPc4BSWfWzg_6XPU`
Todo option ID: `f75ad846`

```bash
# 1. Obtener el número de la issue recién creada
ISSUE_NUMBER=$(gh issue list --repo juanmbarrios/cardbuy --limit 1 --json number --jq '.[0].number')
ISSUE_URL="https://github.com/juanmbarrios/cardbuy/issues/$ISSUE_NUMBER"

# 2. Añadir al proyecto
gh project item-add 1 --owner juanmbarrios --url "$ISSUE_URL"

# 3. Mover a "Todo" (puede ya estar en Todo por defecto; hacerlo explícito)
sleep 1
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
}' -f projectId="PVT_kwHOA5oLPc4BSWfW" --jq ".data.node.items.nodes[] | select(.content.number == $ISSUE_NUMBER) | .id")

gh api graphql -f query='
mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId
    itemId: $itemId
    fieldId: $fieldId
    value: { singleSelectOptionId: $optionId }
  }) { projectV2Item { id } }
}' \
-f projectId="PVT_kwHOA5oLPc4BSWfW" \
-f itemId="$ITEM_ID" \
-f fieldId="PVTSSF_lAHOA5oLPc4BSWfWzg_6XPU" \
-f optionId="f75ad846" \
&& echo "✓ Issue #$ISSUE_NUMBER añadida al Kanban en Todo"
```

### Paso 4 — Informar al usuario

Muestra:
- Número y URL de la issue creada
- Confirmación de que está en el Kanban en "Todo"
- Estimación sugerida: [XS/S/M/L/XL] — [justificación breve]

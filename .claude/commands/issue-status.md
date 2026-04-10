Eres el asistente técnico de **CardBuy**. Tu misión es informar del estado actual de una issue que está en progreso y determinar si puede implementarse de inmediato o requiere configuración previa.

## Contexto del proyecto

**Repo:** juanmbarrios/cardbuy
**Stack:** Next.js 14 App Router, PostgreSQL + Prisma, Redis, NextAuth.js, Stripe, MinIO
**Arquitectura:** Monorepo pnpm + Turborepo. `apps/web` (frontend), `packages/db` (Prisma schema)

## Tu tarea

El número de issue a analizar es: **$ARGUMENTS**

### Paso 1 — Leer la issue

```bash
gh issue view $ARGUMENTS --repo juanmbarrios/cardbuy
```

Extrae:
- Título y descripción
- Criterios de aceptación y cuáles parecen completados (busca commits o PRs relacionados)
- Dependencias declaradas en "Consideraciones técnicas"
- Labels de la issue

### Paso 2 — Analizar el estado actual

Comprueba si hay trabajo ya hecho para esta issue:

```bash
# Buscar commits relacionados
git log --oneline --all | grep -i "#$ARGUMENTS\|issue-$ARGUMENTS" | head -20

# Buscar archivos que puedan corresponder a los criterios
gh issue view $ARGUMENTS --repo juanmbarrios/cardbuy --json body --jq '.body'
```

### Paso 3 — Verificar requisitos de implementación

Comprueba cada uno de estos puntos y anota si está listo (✓), falta (✗) o es parcial (⚠):

**Variables de entorno críticas** (según el stack que requiera la issue):
```bash
# Comprobar .env.local en apps/web
cat apps/web/.env.local 2>/dev/null | grep -v "^#" | grep -v "^$"
```

- [ ] `DATABASE_URL` — PostgreSQL disponible
- [ ] `REDIS_URL` — Redis disponible (si la issue usa carrito, sesiones o caché)
- [ ] `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — Auth disponible (si la issue toca autenticación)
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe disponible (si la issue toca pagos)
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth Google (si la issue toca login social)

**Dependencias de otras issues:**
- Revisa si la issue menciona "Depends on #N" o "Bloqueada por #N"
- Si hay dependencias, comprueba su estado: `gh issue view N --repo juanmbarrios/cardbuy --json state,title`

**Migraciones de base de datos:**
- Si la issue requiere cambios de schema, comprueba si hay migraciones pendientes:
```bash
ls packages/db/prisma/migrations/ 2>/dev/null | tail -5
```

### Paso 4 — Informe al usuario

Presenta un resumen claro con este formato:

---

**Issue #$ARGUMENTS — [Título]**

**Estado en Kanban:** In Progress (o el estado actual)

**Criterios de aceptación:**
- [✓/✗/⚠] Criterio 1
- [✓/✗/⚠] Criterio 2
...

**Requisitos de entorno:**
| Requisito | Estado | Nota |
|-----------|--------|------|
| PostgreSQL | ✓/✗ | ... |
| Redis | ✓/✗/N/A | ... |
| Stripe | ✓/✗/N/A | ... |
| ... | | |

**Dependencias de issues:**
- [✓ Issue #N completada / ✗ Issue #N pendiente / Ninguna]

**Conclusión:**

- ✅ **Lista para implementar** — Ejecuta `/implement-issue $ARGUMENTS`
- ⚠ **Implementación parcial posible** — [describe qué se puede hacer y qué no]
- ✗ **Bloqueada** — [describe qué falta exactamente y cómo resolverlo]

---

# CardBuy — Marketplace TCG

Infraestructura de marketplace para Trading Card Games centrada en descubrimiento, confianza, reputación y pago protegido.

**Juegos:** Pokémon · Magic: The Gathering · Yu-Gi-Oh! · One Piece · Lorcana · Dragon Ball · Flesh and Blood · Digimon · Vanguard

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 App Router |
| Base de datos | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Auth | NextAuth.js v5 |
| Pagos | Stripe + Stripe Connect |
| Storage | MinIO (local) / Cloudflare R2 (producción) |
| Monorepo | pnpm workspaces + Turborepo |
| Deploy | PM2 |

---

## Inicio rápido

```bash
git clone https://github.com/juanmbarrios/cardbuy.git
cd cardbuy
bash scripts/setup-local.sh
pnpm dev
```

Abre http://localhost:3000

---

## Comandos útiles

```bash
pnpm dev              # Next.js con hot reload
pnpm build            # Build de producción
pnpm db:studio        # Prisma Studio (UI de la base de datos)
pnpm db:migrate       # Aplica migraciones pendientes
bash monitoring/uptime.sh  # Health check local
```

---

## Sistema de automatización

Este proyecto incluye un sistema completo de automatización operativa. Ver [docs/automation/](docs/automation/).

**Comandos slash disponibles en el chat:**

| Comando | Para qué |
|---------|----------|
| `/new-issue [descripción]` | Genera una issue estructurada para CardBuy |
| `/breakdown-requirements [doc]` | Descompone requisitos en issues implementables |
| `/estimate [descripción]` | Estima el esfuerzo con desglose y riesgos |
| `/pr-review [número]` | Revisión profunda de un PR |
| `/commit` | Genera mensaje de commit semántico |
| `/standup` | Resumen de actividad del día |
| `/check-todos` | Auditoría de deuda técnica |
| `/detect-duplicates` | Detecta solapamientos en el backlog |

---

## Estructura del proyecto

```
cardbuy/
├── apps/web/          # Next.js 14 App Router
├── packages/db/       # Prisma schema + client
├── packages/types/    # TypeScript types compartidos
├── .github/
│   ├── workflows/     # GitHub Actions (8 workflows)
│   ├── scripts/       # Scripts bash heurísticos
│   └── ISSUE_TEMPLATE/
├── .claude/commands/  # Comandos slash para Claude Code
├── docs/automation/   # Documentación del sistema
├── infra/             # Docker Compose
├── deploy/            # PM2 ecosystem
└── scripts/           # Scripts de setup local
```

---

## Licencia

Privado — todos los derechos reservados.

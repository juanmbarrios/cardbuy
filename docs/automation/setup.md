# Setup del sistema de automatización

## Primera vez en un entorno nuevo

### 1. Clonar y setup local

```bash
git clone https://github.com/juanmbarrios/cardbuy.git
cd cardbuy
bash scripts/setup-local.sh
```

Este script hace automáticamente:
- Verifica Node.js >= 20, pnpm, Docker
- Crea `.env` y `apps/web/.env.local` desde los ejemplos
- Levanta Docker (PostgreSQL + Redis + MinIO)
- Instala dependencias con pnpm
- Aplica el schema de Prisma
- Crea los labels de GitHub (si `gh` está autenticado)

### 2. Autenticar GitHub CLI

```bash
gh auth login
# Selecciona: GitHub.com → HTTPS → Authenticate with browser
```

### 3. Crear labels en GitHub

```bash
bash scripts/setup-labels.sh
```

Verifica en: https://github.com/juanmbarrios/cardbuy/labels

### 4. Configurar secrets en GitHub

Ve a: https://github.com/juanmbarrios/cardbuy/settings/secrets/actions

| Secret | Valor | Para qué |
|--------|-------|----------|
| `GH_TOKEN` | PAT con `repo` + `issues` | Comentarios automáticos en issues/PRs |
| `PROJECT_TOKEN` | PAT con `project` + `repo` | Sync del tablero Kanban |

**Cómo crear el PAT:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. `GH_TOKEN`: scopes `repo`, `write:discussion`
3. `PROJECT_TOKEN`: scopes `project`, `repo`

### 5. Crear el tablero Kanban en GitHub Projects

1. Ve a https://github.com/juanmbarrios?tab=projects
2. Crea un proyecto nuevo → "Board" view
3. Añade las columnas: `Todo`, `In Progress`, `In Review`, `Blocked`, `Waiting for Credentials`, `Waiting for Review`, `Done`
4. Ve al proyecto y anota el número en la URL: `github.com/users/juanmbarrios/projects/[NÚMERO]`
5. En el repo, ve a Settings → Secrets → Variables y crea una variable `PROJECT_NUMBER` con ese número

### 6. Iniciar el servidor local

```bash
# Opción 1: desarrollo con hot reload
pnpm dev

# Opción 2: producción local con PM2
pnpm build
pm2 start deploy/ecosystem.config.js
```

Verificar: http://localhost:3000/api/health → `{"status": "ok"}`

---

## Workflow diario

```bash
# Inicio del día
pnpm dev                    # arranca el servidor
/standup                    # en el chat: resumen de actividad

# Crear una issue
/new-issue [descripción]    # en el chat: genera issue estructurada
# → copiar en GitHub Issues

# Trabajar en una issue
git checkout feat/issue-N   # rama creada automáticamente al añadir label ai-implement
# ... trabajar ...
/commit                     # en el chat: genera mensaje de commit

# Antes de abrir un PR
/pr-review                  # en el chat: revisión previa
git push origin feat/issue-N
gh pr create --fill

# Revisión semanal
/detect-duplicates          # en el chat: detecta solapamientos en el backlog
/check-todos                # en el chat: audita deuda técnica
```

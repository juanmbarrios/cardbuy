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

El token necesita los scopes: `repo`, `project`, `write:discussion`.
Si ya tienes sesión pero faltan scopes:

```bash
gh auth refresh -s project
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
3. Añade exactamente estas columnas (en este orden):
   - `Todo`
   - `In Progress`
   - `In Review`
   - `Blocked`
   - `Waiting for Credentials`
   - `Waiting for Review`
   - `Done`
4. Anota el número en la URL: `github.com/users/juanmbarrios/projects/[NÚMERO]`
5. Añade `PROJECT_NUMBER=[NÚMERO]` a tu `.env` local

### 6. Iniciar el servidor local

```bash
docker compose -f infra/docker-compose.yml up -d   # base de datos
pnpm dev                                             # servidor Next.js
```

Verificar: http://localhost:3000

---

## Workflow de issues (con skills de Claude Code)

### Crear una issue nueva

```
/new-issue descripción de lo que quieres implementar
```

Claude:
1. Genera la issue estructurada con criterios de aceptación
2. La sube al repo con `gh issue create`
3. La añade automáticamente al Kanban en columna **Todo**
4. Muestra la URL de la issue

### Implementar una issue

```
/implement-issue N
```

Claude:
1. Mueve la issue a **In Progress** en el Kanban
2. Lee la issue y planifica
3. Implementa todos los criterios de aceptación
4. Abre una PR apuntando a `develop`
5. Mueve la issue al estado final según el resultado:

| Resultado | Columna Kanban |
|-----------|---------------|
| PR creada, todo correcto | **In Review** |
| Faltan API keys o secrets | **Waiting for Credentials** |
| Depende de otra issue sin completar | **Blocked** |
| Necesita decisión del usuario | **Waiting for Review** |

### Reintentar una issue bloqueada

Si una issue quedó en Blocked, Waiting for Credentials, etc., una vez resuelto el bloqueo:

```
/implement-issue N
```

Claude retoma la implementación y vuelve a mover la issue a **In Progress**.

### Flujo completo de una issue

```
Todo → In Progress → In Review → (merge PR) → Done
```

El paso de **In Review → Done** lo hace el desarrollador manualmente al mergear la PR en GitHub.

---

## Otros comandos útiles

```bash
# Inicio del día
/standup                    # resumen de actividad reciente

# Revisión de código antes de PR
/pr-review                  # revisión de la PR actual

# Revisión semanal del backlog
/detect-duplicates          # detecta issues solapadas
/check-todos                # audita deuda técnica (TODO/FIXME en código)

# Commit estructurado
/commit                     # genera mensaje de commit según cambios staged
```

---

## Notas de configuración

- `PROJECT_NUMBER` debe estar en `.env` para que el Kanban funcione automáticamente
- Si `gh` no tiene el scope `project`, ejecuta `gh auth refresh -s project`
- Las columnas del Kanban deben llamarse exactamente como se indica en el paso 5 (sensible a mayúsculas)

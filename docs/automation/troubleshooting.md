# Troubleshooting

## GitHub Actions

### El workflow no se ejecuta
**Causa más común:** GitHub Actions deshabilitado en el repositorio.
**Solución:** Settings → Actions → General → Allow all actions → Save.

### Error "GH_TOKEN not found" o "Resource not accessible by integration"
**Causa:** El secret `GH_TOKEN` no está configurado o no tiene los permisos correctos.
**Solución:**
1. Settings → Secrets and variables → Actions → New repository secret
2. Nombre: `GH_TOKEN`, Valor: tu PAT con scopes `repo` y `write:discussion`
3. Si falla al comentar en issues: verifica que el PAT tiene `issues: write`

### El tablero Kanban no se actualiza
**Causa:** `PROJECT_TOKEN` sin scope `project` o `PROJECT_NUMBER` incorrecto.
**Solución:**
1. Verifica el PAT en GitHub → Settings → Developer settings
2. El número del proyecto está en la URL: `github.com/users/juanmbarrios/projects/N`
3. Configura como variable de Actions: `PROJECT_NUMBER = N`

### El workflow de deploy falla en el build
**Causa más común:** Lockfile desactualizado (`pnpm-lock.yaml` no sincronizado).
**Solución:** Ejecuta `pnpm install` localmente y commitea el `pnpm-lock.yaml` actualizado.

### `detect-duplicates.yml` no encuentra Python
**Causa:** Python3 no disponible en el runner (muy raro en `ubuntu-latest`).
**Solución:** Añadir step `uses: actions/setup-python@v5` antes del script.

---

## Scripts locales

### `setup-local.sh` falla en "Esperando PostgreSQL"
**Causa:** Docker no arrancó correctamente o el puerto 5432 está ocupado.
**Solución:**
```bash
docker-compose -f infra/docker-compose.yml down
lsof -i :5432  # ver qué ocupa el puerto
docker-compose -f infra/docker-compose.yml up -d
```

### `prisma db push` falla con "Connection refused"
**Causa:** PostgreSQL no está corriendo o `DATABASE_URL` incorrecta.
**Solución:**
```bash
# Verifica que Docker está corriendo
docker-compose -f infra/docker-compose.yml ps

# Verifica la URL en .env o apps/web/.env.local
# Debe ser: postgresql://cardbuy:cardbuy_secret@localhost:5432/cardbuy_dev
```

### `pnpm dev` falla con "Cannot find module @cardbuy/db"
**Causa:** Packages no construidos en el monorepo.
**Solución:**
```bash
pnpm install
cd packages/db && pnpm prisma generate && cd ../..
pnpm dev
```

---

## Health Check

### Health check falla después del deploy
**Causa:** El servidor tarda más de 30 segundos en arrancar.
**Solución:** Aumenta `MAX_RETRIES` en `deploy.sh` o el `sleep` inicial.

### `/api/health` devuelve 500
**Causa:** Fallo de conexión a PostgreSQL o Redis.
**Solución:**
```bash
# Verifica servicios Docker
docker-compose -f infra/docker-compose.yml ps
docker-compose -f infra/docker-compose.yml logs postgres
docker-compose -f infra/docker-compose.yml logs redis
```

---

## Claude Code / Comandos slash

### El comando `/new-issue` no aparece
**Causa:** Los archivos `.claude/commands/` no están en el directorio raíz del proyecto.
**Solución:** Verifica que Claude Code está abierto desde `c:\Users\USUARIO\Desktop\cardbuy`.

### El comando genera contenido incorrecto o genérico
**Causa:** El contexto del proyecto en el archivo `.md` está desactualizado.
**Solución:** Edita `.claude/commands/new-issue.md` y actualiza la sección "Contexto del proyecto" con los cambios recientes del stack o las entidades.

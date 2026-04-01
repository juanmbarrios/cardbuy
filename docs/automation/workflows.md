# Referencia de Workflows

## Resumen

| Workflow | Trigger | Input | Output |
|----------|---------|-------|--------|
| `issue-review.yml` | Issue abierta | — | Comentario con revisión + labels |
| `issue-estimate.yml` | Issue abierta/editada | — | Label `estimate-X` + comentario |
| `implement-issue.yml` | Label `ai-implement` | — | Rama `feat/issue-N` + comentario |
| `pr-review.yml` | PR abierto/actualizado | — | Comentario de revisión |
| `detect-duplicates.yml` | Lunes 09:00 / manual | `post_summary_issue` | Labels `possible-duplicate` |
| `project-sync.yml` | Issue/PR events | — | Tablero actualizado |
| `deploy.yml` | Push main/develop / manual | `deploy_mode`, `environment` | Build + deploy |
| `health-check.yml` | Cada hora / manual | — | Issue de alerta si falla |

---

## issue-review.yml

**Trigger:** `issues.opened` (excepto si tiene label `skip-review`)

**Qué hace el script `review-issue.sh`:**
1. Valida longitud del título (>10 chars)
2. Verifica que tiene descripción (>50 chars)
3. Detecta criterios de aceptación (`- [ ]` o sección "criterios")
4. Detecta si es una issue TCG sin especificar entidades
5. Detecta consideraciones técnicas
6. Detecta tipo de issue en el título (`[Feature]`, `[Bug]`, etc.)
7. Determina labels sugeridos por keywords del dominio
8. Publica comentario con score, problemas y sugerencias
9. Aplica los labels sugeridos automáticamente

**Score:** 0-6 puntos. < 4 → issue necesita mejoras.

---

## issue-estimate.yml

**Trigger:** `issues.opened` y `issues.edited` (excepto `skip-review`)

**Algoritmo de scoring:**
- +2 pts: keywords de alta complejidad (arquitectura, auth, pago, kyc, migración, etc.)
- +1 pt: keywords de complejidad media (endpoint, componente, filtro, email, etc.)
- +1 pt: más de 5 criterios de aceptación
- +1 pt: tests mencionados como requerimiento
- +1 pt: afecta múltiples capas (frontend + backend + DB)
- +1 pt: afecta múltiples juegos TCG
- Fuerza XL: título con `[XL]`, `[Epic]`, `[Sistema]`

**Tallas:**
- 0 pts → XS (<1h)
- 1 pt → S (1-3h)
- 2-3 pts → M (3-8h)
- 4-5 pts → L (1-2d)
- 6+ pts → XL (>2d)

---

## implement-issue.yml

**Trigger:** `issues.labeled` con label `ai-implement`

**Lo que hace (SIN API de IA):**
1. Crea rama `feat/issue-{N}-{slug}` desde `develop` (o `main`)
2. Cambia label `ai-implement` → `in-progress`
3. Mueve issue a "In Progress" en el tablero
4. Publica comentario con instrucciones para continuar en el chat

**Lo que NO hace:** implementar el código. Eso lo hace el desarrollador asistido por Claude Code en el chat.

---

## pr-review.yml

**Trigger:** `pull_request` opened/synchronize/ready_for_review (no drafts, no Dependabot)

**Validaciones del script `review-pr.sh`:**
1. Título sigue Conventional Commits
2. Body tiene descripción (>50 chars)
3. Checklist marcado
4. Referencia a issue (`Closes #N`)
5. Tamaño del PR (<10 archivos = OK, >20 = warning)
6. Archivos sensibles (`.env`, secrets, credenciales)
7. Patrones de seguridad (`eval`, `dangerouslySetInnerHTML`, SQL injection)
8. Presencia de tests
9. Base branch (`main` directo = warning)
10. Migraciones de Prisma detectadas

**Si hay hallazgos de seguridad:** aplica label `needs-security-review`

---

## detect-duplicates.yml

**Trigger:** Cron lunes 08:00 UTC (09:00 Madrid) + `workflow_dispatch`

**Algoritmo:** Jaccard coefficient entre bags-of-words de títulos + bodies
- Threshold: 35% similitud
- Keywords TCG tienen peso doble
- Issues con `skip-review` se excluyen
- Máximo 20 pares reportados

---

## deploy.yml

**Modos:**
- `full` (defecto): install + migrate + build + PM2 restart
- `quick`: solo PM2 restart
- `build-only`: solo build sin restart

**Health check post-deploy:** 10 reintentos × 3 segundos = 30 segundos máximo de espera.

**Para activar deploy remoto:** descomentar el step SSH en el workflow y configurar `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` como secrets.

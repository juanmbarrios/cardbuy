## Descripción

<!-- ¿Qué hace este PR? ¿Por qué es necesario? 2-3 líneas de contexto. -->

## Issue relacionada

Closes #<!-- número de issue -->

## Tipo de cambio

- [ ] `feat` — nueva funcionalidad
- [ ] `fix` — corrección de bug
- [ ] `chore` — mantenimiento / config
- [ ] `refactor` — refactorización sin cambio de comportamiento
- [ ] `docs` — documentación
- [ ] `test` — tests
- [ ] `perf` — mejora de rendimiento
- [ ] `ci` — CI/CD / GitHub Actions

## Cambios realizados

<!-- Lista concisa de los cambios. Cita archivos concretos si es útil. -->

- 
- 

## Capturas / evidencia (si aplica)

<!-- Screenshots, logs, o output de tests si el cambio es visual -->

## Checklist pre-merge

### Código
- [ ] El código hace lo que la issue pedía
- [ ] No hay código comentado ni debugging innecesario (`console.log`, etc.)
- [ ] Los errores son manejados correctamente (no swallowed)
- [ ] TypeScript sin errores (`pnpm typecheck`)
- [ ] Sin warnings de lint (`pnpm lint`)

### Tests
- [ ] Tests escritos para el nuevo comportamiento
- [ ] Tests existentes no rotos (`pnpm test`)
- [ ] Edge cases cubiertos

### Seguridad
- [ ] Sin credenciales, secrets o tokens en el diff
- [ ] Inputs validados con Zod (en endpoints de API)
- [ ] Sin SQL injection via Prisma raw queries
- [ ] Cambios en auth/pagos/KYC revisados con especial atención

### Base de datos
- [ ] No aplica / No hay cambios de schema
- [ ] Migración de Prisma creada y probada
- [ ] Migración es reversible
- [ ] Datos existentes no afectados

### TCG / Negocio
- [ ] Entidades TCG (Card, Listing, Order...) manejadas correctamente
- [ ] Condiciones, rarezas e idiomas considerados donde aplica
- [ ] Flujo de seller/buyer no roto

### Deploy
- [ ] Compatible con el entorno local (Docker + pnpm dev)
- [ ] Variables de entorno nuevas documentadas en `.env.example`
- [ ] Sin breaking changes que requieran coordinación

## Notas para el revisor

<!-- Algo que el revisor debe saber, decisiones tomadas, alternativas descartadas, etc. -->

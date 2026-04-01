# Modelo operativo — CardBuy

## Filosofía

Este sistema está diseñado para un **equipo de una persona** que trabaja de forma sistemática con asistencia de Claude Code como agente integrado en el chat. La automatización elimina fricción en las partes mecánicas (estructura de issues, estimaciones, revisiones de PR); el juicio estratégico y la implementación son del desarrollador asistido por el agente.

---

## Ciclo de vida de una feature

### 1. Requisitos → Issues

```
Tienes una idea o un documento con requisitos
          ↓
/breakdown-requirements [documento o descripción]
          ↓
Claude descompone en 5-15 issues con estimaciones y dependencias
          ↓
Copias cada issue en GitHub Issues (o la creas directamente con /new-issue)
          ↓
GitHub Actions valida la estructura y asigna estimación automática
          ↓
Issues aparecen en columna "Todo" del Kanban
```

### 2. Issues → Implementación

```
Seleccionas la siguiente issue del backlog
          ↓
Añades label "ai-implement"
          ↓
GitHub Actions crea la rama feat/issue-N automáticamente
          ↓
git checkout feat/issue-N
          ↓
Pides la implementación en el chat: "implementa la issue #N"
          ↓
Claude Code lee la issue y el código, implementa los cambios
          ↓
/commit → mensaje de commit semántico
          ↓
git push + gh pr create
```

### 3. PR → Merge → Deploy

```
PR abierto → GitHub Actions valida estructura y seguridad
          ↓
/pr-review [número] en el chat → revisión profunda
          ↓
Revisas y apruebas el PR
          ↓
Merge a develop → deploy automático (build + PM2 restart + health check)
          ↓
Issue → Done en el Kanban
```

---

## Rutina semanal

| Día | Actividad |
|-----|-----------|
| Lunes | GitHub Actions detecta duplicados automáticamente a las 09:00 |
| Lunes | `/standup` para ver el estado del proyecto |
| Lunes | Revisar issues con label `possible-duplicate` |
| Miércoles | `/check-todos` para auditar deuda técnica |
| Viernes | Cerrar issues completadas, limpiar backlog |

---

## Cuándo usar qué

### Usa GitHub Actions (automático)
- Validación de estructura de issues → siempre automático
- Estimación heurística → siempre automático (ajusta manualmente en planning)
- Revisión de PR → siempre automático como primera pasada
- Detección de duplicados → automático semanal

### Usa comandos slash en el chat
- Cuando necesitas comprensión semántica real (estimaciones complejas, revisiones profundas)
- Cuando quieres generar una issue bien estructurada antes de crearla en GitHub
- Para descomponer documentos de requisitos grandes
- Para el standup diario y auditoría de TODOs

### No uses implementación automática para
- Cambios de arquitectura o decisiones de negocio
- Código de pagos (Stripe), KYC/KYB, autenticación
- Migraciones de datos complejas
- Issues sin criterios de aceptación claros

---

## Labels y su uso

### Para gestión del flujo
| Label | Quién lo pone | Cuándo |
|-------|--------------|--------|
| `ai-implement` | Tú (manualmente) | Cuando la issue está bien definida y quieres iniciar implementación |
| `in-progress` | GitHub Actions | Al añadir `ai-implement` |
| `blocked` | Tú | Cuando hay una dependencia externa que impide continuar |
| `waiting-credentials` | Tú | Cuando necesitas un secret o acceso que no tienes |
| `skip-review` | Tú | Para issues administrativas que no necesitan validación |
| `possible-duplicate` | GitHub Actions | Detección automática semanal |
| `needs-security-review` | GitHub Actions | Al detectar patrones de seguridad en un PR |

### Para estimación (automáticos, ajustables)
`estimate-XS`, `estimate-S`, `estimate-M`, `estimate-L`, `estimate-XL`

### Para área de negocio (automáticos por keywords)
`marketplace`, `seller-tools`, `trust-safety`, `logistics`, `pricing`, `seo`, `community`, `frontend`, `backend`, `infra`, `mobile`

---

## Columnas del Kanban y sus triggers

| Columna | Se mueve aquí cuando |
|---------|---------------------|
| **Todo** | Issue creada o reabierta |
| **In Progress** | Label `in-progress` añadido |
| **In Review** | PR abierto que referencia la issue |
| **Blocked** | Label `blocked` añadido |
| **Waiting for Credentials** | Label `waiting-credentials` |
| **Waiting for Review** | PR pasa de draft a ready |
| **Done** | PR mergeado o issue cerrada manualmente |

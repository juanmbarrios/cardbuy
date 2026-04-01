# Sistema de Automatización — CardBuy

## Qué es este sistema

CardBuy implementa un sistema de automatización operativa para la gestión del producto y el desarrollo. Está inspirado en el documento de referencia *IA en la Gestión de Proyectos con GitHub*, pero **adaptado completamente para funcionar sin APIs de IA externas ni modelos locales**.

La inteligencia operativa del sistema proviene de:
- **Scripts heurísticos** (scoring por keywords, validaciones deterministas)
- **Plantillas y convenciones** (issues estructuradas, PR templates)
- **GitHub Actions** (automatizaciones en el repositorio)
- **Claude Code como agente integrado en el chat** (para las partes que requieren comprensión semántica)

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ FLUJO DE TRABAJO CARDBUY                                        │
│                                                                 │
│  Requisito → /breakdown-requirements → Issues en GitHub        │
│                           │                                     │
│                 Issue creada                                    │
│                    │         │                                  │
│               [auto]         [auto]                             │
│           Review issue    Estimación XS/S/M/L/XL               │
│                    │                                            │
│              label: ai-implement                                │
│                    │                                            │
│               [auto] Crea rama feat/issue-N                     │
│                    │                                            │
│         Implementación asistida por chat                        │
│                    │                                            │
│               git push → PR abierto                             │
│                    │                                            │
│               [auto] Review PR (checklist + validación)         │
│                    │                                            │
│           Revisión humana → Merge                               │
│                    │                                            │
│         [auto] Deploy local (PM2 + health check)               │
│                    │                                            │
│           Tablero → Issue → Done                                │
│                                                                 │
│  Skills locales (chat): /standup /estimate /check-todos         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Módulos del sistema

| Módulo | Tipo | Descripción |
|--------|------|-------------|
| Revisión de issues | Automático | Valida estructura y sugiere labels al crear una issue |
| Estimación | Automático | Asigna `estimate-XS/S/M/L/XL` por scoring heurístico |
| Preparación de rama | Automático | Crea `feat/issue-N` al añadir label `ai-implement` |
| Revisión de PRs | Automático | Valida checklist, conventional commits, seguridad |
| Detección de duplicados | Automático (semanal) | Jaccard similarity sobre títulos y bodies |
| Sync Kanban | Automático | Mueve issues entre columnas por eventos de labels/PR |
| Deploy | Automático (push) | Build + PM2 restart + health check |
| Health check | Automático (hourly) | Ping a endpoints críticos |
| `/new-issue` | Chat | Genera issue estructurada con contexto TCG |
| `/breakdown-requirements` | Chat | Descompone documento en issues implementables |
| `/estimate` | Chat | Estimación detallada con desglose y riesgos |
| `/pr-review` | Chat | Revisión profunda de PR con análisis semántico |
| `/commit` | Chat | Mensaje de commit siguiendo Conventional Commits |
| `/standup` | Chat | Resumen diario de actividad |
| `/check-todos` | Chat | Auditoría de deuda técnica |
| `/detect-duplicates` | Chat | Análisis semántico del backlog |

---

## Diferencias con el sistema original (PerfumesDupes)

| Módulo original | Dependía de | Reemplazado por |
|----------------|-------------|-----------------|
| Revisión de issue | Claude API | Script heurístico (`review-issue.sh`) |
| Estimación | Claude API | Scoring por keywords (`estimate-issue.sh`) |
| Implementación | Claude CLI | Agente en chat + rama automática |
| Revisión de PR | Claude API | Validaciones deterministas (`review-pr.sh`) |
| Detección duplicados | Claude API | Jaccard similarity Python (`detect-duplicates.sh`) |
| Skills `/new-issue` etc. | Claude Code CLI | Comandos slash nativos de Claude Code |

---

## Requisitos del sistema

### Local (para desarrollo)
- Node.js >= 20
- pnpm >= 9
- Docker Desktop
- GitHub CLI (`gh auth login`)
- Claude Code (para comandos slash)

### GitHub (para automatizaciones)
- Repositorio: `juanmbarrios/cardbuy`
- Secret `GH_TOKEN` — PAT con scopes: `repo`, `issues`, `pull_requests`
- Secret `PROJECT_TOKEN` — PAT con scopes: `project`, `repo` (para Kanban)
- Variable `SERVER_URL` — URL del servidor (cuando haya deploy remoto)

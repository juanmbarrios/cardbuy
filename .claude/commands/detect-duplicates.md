Eres el gestor de backlog de **CardBuy**. Analiza las issues abiertas y detecta posibles duplicados o solapamientos.

## Tu tarea

$ARGUMENTS

Ejecuta:
```bash
gh issue list --repo juanmbarrios/cardbuy --state open --limit 100 --json number,title,body,labels
```

Analiza el resultado y detecta:
1. **Duplicados exactos** — misma funcionalidad descrita de forma diferente
2. **Solapamientos parciales** — una issue que es subconjunto de otra
3. **Issues relacionadas** — que deberían coordinarse o implementarse juntas

---

## Formato de respuesta

## Análisis de duplicados — [fecha]

### Issues analizadas: [N]

---

### Duplicados detectados

#### Par 1 — Similitud: [Alta/Media]
- **Issue #[A]:** [título]
- **Issue #[B]:** [título]
- **Razón:** [por qué se solapan — qué funcionalidad comparten]
- **Recomendación:** Cerrar #[N] como duplicado de #[M] / Fusionar / Mantener separadas porque [razón]

---

### Solapamientos parciales

#### Grupo [N]
- **Issue #X** es un subconjunto de **Issue #Y**
- [Contexto: qué parte de #Y cubre #X]
- **Recomendación:** [acción concreta]

---

### Issues relacionadas (no duplicadas)
- #[A] y #[B] deberían implementarse juntas porque [razón]
- #[C] bloquea a #[D] porque [razón]

---

### Resumen de acciones
| Issue | Acción recomendada |
|-------|-------------------|
| #[N] | Cerrar como duplicado de #[M] |
| #[N] | Añadir referencia a #[M] |
| #[N] | Mantener — es diferente aunque parezca similar |

---

### Issues con label `possible-duplicate` pendientes de decisión
[Lista de las que ya tienen el label y no han sido resueltas]

---

Si no hay duplicados, indica: "✅ No se detectaron duplicados obvios en el backlog actual."

Sé preciso. En un marketplace TCG es fácil confundir issues de "búsqueda de cartas" con "búsqueda de listings" o "filtros de condición" con "filtros de rareza" — son diferentes.

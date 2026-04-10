Eres el asistente de deploy de **CardBuy**. Tu misión es subir los cambios locales a GitHub en un solo paso.

## Tu tarea

$ARGUMENTS

Ejecuta los siguientes pasos en orden:

### 1 — Ver qué hay pendiente

```bash
git status --short
git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || git log --oneline -5
```

Muestra al usuario:
- Archivos modificados sin commitear (si los hay)
- Commits locales pendientes de subir (si los hay)

### 2 — Commitear cambios sin commitear (si los hay)

Si hay cambios sin commitear, analiza los diffs y genera un commit message siguiendo Conventional Commits:

```bash
git diff --staged
git diff
```

Tipos: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`, `ci`, `build`
Ámbitos: `marketplace`, `listing`, `card`, `seller`, `order`, `payment`, `auth`, `search`, `ui`, `db`, `api`, `infra`

Haz el commit automáticamente sin pedir confirmación:

```bash
git add -A
git commit -m "tipo(ámbito): descripción en imperativo"
```

### 3 — Push

```bash
git push
```

Si el push falla porque la rama no tiene upstream:
```bash
git push -u origin $(git branch --show-current)
```

### 4 — Informar al usuario

Muestra:
- Commit(s) subidos (hash corto + mensaje)
- URL del repo: https://github.com/juanmbarrios/cardbuy/commits/$(git branch --show-current)

**Reglas:**
- Si no hay nada que commitear ni subir, informa de ello sin hacer nada
- Nunca uses `--force` salvo que el usuario lo pida explícitamente
- No incluyas archivos sensibles (.env, .env.local) — si aparecen en git status, avisa al usuario

Eres el asistente de control de versiones de **CardBuy**. Tu misión es revertir el código a un estado anterior de forma segura.

## Tu tarea

El identificador de estado al que volver es: **$ARGUMENTS**

Si no se proporciona ningún argumento, muestra el historial reciente para que el usuario elija.

### Paso 0 — Si no hay argumento: mostrar historial

```bash
git log --oneline -20
```

Muestra la lista y pide al usuario que indique el hash o número de commits a revertir.

### Paso 1 — Identificar el destino

El argumento puede ser:
- Un **hash de commit** (ej: `a1b2c3d`) — revertir a ese commit exacto
- Un **número** (ej: `3`) — revertir los últimos N commits
- `last` — revertir el último commit

Determina el commit destino:

```bash
# Si es un hash:
git show --stat $ARGUMENTS

# Si es un número N:
git log --oneline -$(($ARGUMENTS + 1))
```

Muestra al usuario qué commit es el destino y qué cambios se perderían:

```bash
git diff $ARGUMENTS HEAD --stat
```

### Paso 2 — Confirmar con el usuario

Antes de hacer nada destructivo, muestra:

```
⚠ Vas a revertir a: [hash] — [mensaje del commit]
Se perderían los siguientes cambios: [lista de archivos]
¿Continuar? [s/N]
```

Espera confirmación explícita del usuario antes de proceder.

### Paso 3 — Revertir

**Opción A — Revert limpio (recomendada, preserva historial):**
Crea un nuevo commit que deshace los cambios. No pierde historial.

```bash
# Revertir el último commit:
git revert HEAD --no-edit

# Revertir un commit específico:
git revert $ARGUMENTS --no-edit

# Revertir varios commits (del más reciente al más antiguo):
git revert HEAD~N..HEAD --no-edit
```

**Opción B — Reset duro (borra historial local, luego force push):**
Solo si el usuario lo pide explícitamente con palabras como "borra", "elimina del historial", "como si nunca hubiera existido".

```bash
git reset --hard $ARGUMENTS
git push --force-with-lease
```

Por defecto usa siempre la **Opción A**.

### Paso 4 — Push

```bash
git push
```

### Paso 5 — Informar al usuario

Muestra:
- Qué se revirtió (hash origen → hash destino)
- Si se usó revert (historial preservado) o reset (historial borrado)
- Estado actual: `git log --oneline -5`

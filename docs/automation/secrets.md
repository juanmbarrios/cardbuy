# Gestión de Secrets y Variables de Entorno

## Secrets de GitHub Actions

Configura en: https://github.com/juanmbarrios/cardbuy/settings/secrets/actions

| Secret | Obligatorio | Scopes PAT | Para qué |
|--------|-------------|------------|----------|
| `GH_TOKEN` | Sí | `repo`, `write:discussion` | Comentar en issues/PRs, crear labels, gestionar ramas |
| `PROJECT_TOKEN` | Para Kanban | `project`, `repo` | Sync del tablero GitHub Projects v2 |

**Variables de entorno de Actions:**

| Variable | Ejemplo | Para qué |
|----------|---------|----------|
| `SERVER_URL` | `https://cardbuy.com` | Health check remoto (cuando haya servidor) |
| `PROJECT_NUMBER` | `1` | Número del tablero Kanban |

---

## Variables de entorno de la aplicación

### Obligatorias para arrancar

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NEXTAUTH_SECRET=min_32_chars
NEXTAUTH_URL=http://localhost:3000
```

### Opcionales por módulo

| Variable | Módulo | Cuándo configurar |
|----------|--------|-------------------|
| `STRIPE_SECRET_KEY` | Pagos | Antes de implementar checkout |
| `STRIPE_PUBLISHABLE_KEY` | Pagos (frontend) | Antes de implementar checkout |
| `STRIPE_WEBHOOK_SECRET` | Webhooks Stripe | Al configurar webhooks |
| `STRIPE_CONNECT_CLIENT_ID` | Seller onboarding | Al implementar Stripe Connect |
| `RESEND_API_KEY` | Emails transaccionales | Al implementar notificaciones email |
| `POKEMON_TCG_API_KEY` | Sync datos Pokémon | Al implementar sync de cartas |
| `MAXMIND_ACCOUNT_ID` | Antifraude GeoIP | Al implementar detección de fraude |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Analytics | Al configurar Google Analytics |

---

## Cómo generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Seguridad

- **Nunca** commitear `.env` al repositorio
- `.env.example` y `.env.local.example` SÍ van al repositorio (sin valores reales)
- En producción: usar las variables de entorno del servidor, no `.env`
- Rotación de PATs: revisar y rotar cada 90 días
- El `GH_TOKEN` tiene acceso de escritura al repo — trátalo como una credencial crítica

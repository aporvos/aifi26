# AIFI26 app

Cronograma no oficial para AIFI26 · 21 mayo 2026, Hotel Hilton Buenos Aires.

## Stack
Astro 5 · TypeScript · CSS custom · Cloudflare Pages.

## Dev
```bash
bun install
bun run dev          # http://localhost:4321
bun run test         # vitest unit tests (56 tests)
bun run check        # astro type check
bun run build        # static build to dist/
bun run preview      # serve the build locally
```

## Estructura
```
src/
├── data/        sesiones · speakers · categorias · avisos (JSON)
├── lib/         now · conflicts · ics · url-favorites (pure logic + tests)
├── styles/      tokens.css (paleta aifi.lat + spacing + motion)
├── layouts/     Layout.astro base
├── components/  Ticker · ModeToggle · RoomBadge · CategoryBadge · SessionCard · AvisoBanner · AppStateBanner
├── pages/       index · ahora · dia · mi-dia · sobre · speakers · sesion/[id] · categoria/[slug]
└── types.ts
public/
├── og.svg          # OpenGraph image (SVG, 1200x630)
├── favicon.svg
├── _headers        # Cloudflare Pages cache + security headers
└── _redirects      # Cloudflare Pages legacy redirects
tests/              vitest specs (now · conflicts · url-favorites)
```

## Rutas
- `/` — landing, redirige según hora BA al modo correcto
- `/ahora` — modo Ahora con trading floor (3 tracks scrolleables, now line en tiempo real)
- `/dia` — modo Día completo con filter pills por categoría
- `/mi-dia` — favoritos del usuario con detección de conflictos y prompt de import
- `/sesion/[id]` — detalle de sesión con speakers, LinkedIn CTA, ICS, share
- `/speakers` — lista alfabética con cross-referencing (× N sesiones)
- `/categoria/[slug]` — track temático por categoría (6 categorías)
- `/sobre` — about page

## Source of truth
Los datos viven en `aifi26-agenda-con-linkedin.md` (markdown editorial) y se traducen manualmente a `src/data/sesiones.json` + `src/data/speakers.json`. Si el MD cambia, regenerá los JSON a mano.

Banner editable en `src/data/avisos.json` para avisos in-day sin redeploy de UI (commit + push = live en <60s).

## Comportamiento por estado del evento

- **Pre-evento** (antes 08:00 del 21 may BA): `/` redirige a `/dia`. Banner cyan con countdown.
- **Durante evento** (08:00-17:30 del 21 may BA): `/` redirige a `/ahora`. Trading floor live con now-line móvil.
- **Post-evento** (después 17:30 del 21 may BA): `/` redirige a `/dia`. Banner gris "modo archivo". `/mi-dia` se oculta del toggle.

Timezone hardcoded en `America/Argentina/Buenos_Aires` — ignora la hora del dispositivo del usuario.

## Deploy a Vercel

### Opción A · CLI (rápido, 2 minutos)

```bash
# Instalar Vercel CLI globalmente (una sola vez)
bun add -g vercel

# Login (abre browser, autoriza con GitHub)
vercel login

# Deploy
vercel              # primer deploy: te pregunta nombre, scope, link
vercel --prod       # deploy a producción
```

Te asigna una URL tipo `aifi26-abc123.vercel.app`. En el primer deploy, Vercel detecta Astro automáticamente desde `vercel.json`.

### Opción B · GitHub (recomendado para iteración continua)

1. Crear repo en GitHub y pushear este proyecto.
2. https://vercel.com → "Add new..." → "Project" → Import el repo.
3. Vercel detecta Astro y aplica `vercel.json`. Click "Deploy".
4. `git push origin main` = preview deploy automático.

### Custom domain

1. En el dashboard del project → Settings → Domains
2. Agregar el dominio que tengas (ej: `aifi26.app`)
3. Vercel te da los DNS records para configurar en tu registrar

### Analytics

Activar **Vercel Analytics** y **Speed Insights** gratis en Settings → Analytics. Sin cookies, GDPR-safe en plan free.

### Config ya incluida

- `vercel.json` con build command, output, security headers (HSTS, Referrer-Policy, etc), cache long-immutable para `/_astro/*`, redirects de paths legacy.
- Framework: `astro`. Build: `bun run build`. Output: `dist/`.

### Deploy alternativo · Cloudflare Pages

También está listo para Cloudflare Pages (ver `wrangler.toml`, `public/_headers`, `public/_redirects`). Si preferís CF:

```bash
bunx wrangler pages deploy dist --project-name=aifi26
```

## Tests

```bash
bun run test
```

56 unit tests cubren:
- `lib/now.ts` — timezone, grace, ending-soon, current/next per sala, count active
- `lib/conflicts.ts` — overlap detection con casos reales del cronograma
- `lib/url-favorites.ts` — round-trip, dedupe, share URL build/parse

## Smoke test mobile (recomendado antes del 21)

Antes del evento, validar en celular real (no DevTools):
1. Conectarse a **datos móviles** (no WiFi de casa).
2. Abrir cada ruta y medir tiempo a primer paint.
3. `/ahora` → verificar que el trading floor scrollea con el dedo, que "now line" aparece en posición correcta.
4. `/dia` → tocar filter pills, verificar transitions.
5. `/mi-dia` → marcar 3 favoritos en `/dia`, ver conflictos.
6. Compartir mi día via `navigator.share` → ver el preview en WhatsApp/LinkedIn.
7. Click LinkedIn deep-link en un speaker → debe abrir la app nativa.
8. Exportar `.ics` → abrir en Google Calendar / Apple Calendar.

## Autor
[Gonzalo Arribere](https://www.linkedin.com/in/gonzaloarribere/) · proyecto independiente, no oficial del evento.

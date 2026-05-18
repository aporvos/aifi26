# AIFI26 — Estado del proyecto

> Cronograma no-oficial para AIFI 2026 · 21 mayo 2026 · Hotel Hilton BA.
> Side project con vida útil ~2 semanas. AIFI27 no está en scope.

## Live

- **Deploy**: Vercel (auto desde `git push` a `main`)
- **Repo**: https://github.com/aporvos/aifi26
- **Stack**: Astro 5 (output static) · TypeScript · Bun · CSS custom · counterapi.dev · Vercel Web Analytics

```bash
bun install
bun run dev      # http://localhost:4321
bun run build    # dist/ static
bun run test     # 56 vitest tests
bun run check    # astro type check (debe estar 0/0/0)
```

## Decisiones cerradas (no re-discutir)

| Decisión | Razón |
|---|---|
| Astro 5 SSG, no SSR/hybrid | Cero backend, cabe en static |
| Sin login, favoritos en localStorage | Time-boxed, sin DB |
| URL `?s=ids` para compartir Mi día | Cross-device sin servidor |
| Timezone hardcoded `America/Argentina/Buenos_Aires` | Robusto contra device clock |
| Counter público via counterapi.dev | Zero infra · "visto por N asistentes" en footer |
| Vercel Web Analytics + Speed Insights | Métrica privada para el autor |
| Sin OG image PNG · sólo SVG (`/og.svg`) | OpenAI gen no aplicable (sin org-verified) |
| Sin AI gen de cualquier tipo | Audiencia detecta slop |
| Categorías: badge + filtro `/dia` + página `/categoria/[slug]` | Opción C accepted en CEO review |
| `/` redirige siempre a `/ahora` | Default consistente |
| `/ahora` muestra timeline completo pre-evento (no empty state) | Decisión explícita del user |
| `/mi-dia` usa mini-calendario (no lista) | Opción C accepted en UX review |
| Conflict resolver side-by-side en `/mi-dia` | Pieza fuerte de UX, no cambiar |
| Botón hero "Exportar a calendario" en `/mi-dia` | CTA principal |

## Paleta + tipografía (oficial aifi.lat)

```
--bg:     #0d0d14    --bg-elev:    #1a1923    --bg-card: #1c1c2b
--fg:     #f7f7f8    --fg-soft:    #adb8d5    --fg-muted: #8f94a1
--cyan:   #0fb3fc    --blue:       #5b8cff    --magenta:  #fb4aa8
--sala-pacifico = --blue · --sala-atlantico-b = --cyan · --sala-atlantico-c = --magenta
```

Fuentes: **Bricolage Grotesque** (display) · **DM Sans** (body) · **Inter Tight** italic (acentos)

`#1331f4` (azul original aifi.lat) NO usar — falla WCAG sobre dark bg. Usar `#5b8cff`.

## Rutas

- `/` redirect → `/ahora`
- `/ahora` timeline vertical, 3 columnas (salas), tiempo bajando, now-line cyan durante evento
- `/dia` cronograma completo con filtros sala+categoría, flip cards
- `/mi-dia` stats + conflict resolver + mini-calendario + botón hero export
- `/sesion/[id]` 28 detalles dinámicos (LinkedIn deep-link, ICS, share, fav)
- `/speakers` 52 alfabéticos con `× N sesiones` cross-ref
- `/categoria/[slug]` 6 tracks temáticos (respeta categoryAlt)
- `/sobre` about page

## Patterns críticos · gotchas

**Time override para QA**: `?now=2026-05-21T11:00:00-03:00` funciona en `/ahora` + Ticker. En prod (sin query) usa `new Date()`. NO sacar este código.

**Astro CSS scoping vs `innerHTML`**: si renderizás HTML dinámico con JS, los estilos scoped NO aplican (los elementos no tienen `data-astro-cid-X`). Usar `<style is:global>` para esos selectores. Ver `/mi-dia` `.mc-*` styles.

**Double-binding en handlers**: cada `setupFoo()` debe checkear `if (btn.dataset.wired === '1') return; btn.dataset.wired = '1';` antes de `addEventListener`. Astro re-ejecuta scripts en `astro:page-load` (View Transitions). Sin el flag, los handlers se duplican y los clicks "cancelan" entre sí.

**Pre-event en `/ahora`**: timeline visible siempre. Hero usa `.is-soft` class para countdown chico (no protagonista). NO marcar past/live/ending en slots. NO mostrar now-line.

**Post-event en `/ahora`**: timeline oculto. Mostrar `#post-event` section. Status pill dot estático (`.static` class).

**Source de datos**: `aifi26-agenda-con-linkedin.md` es la fuente editorial. Los JSON en `src/data/` (sesiones, speakers, categorias, avisos) son derivados a mano. Si cambia el MD → regenerar JSON manualmente.

**Banner editable** sin redeploy de UI: `src/data/avisos.json` con `[{tipo, texto, desde?, hasta?}]`. Push → live en <60s.

## Tests

`tests/now.test.ts` · `tests/conflicts.test.ts` · `tests/url-favorites.test.ts` — 56 specs. **NO eliminar**. Si tocás `lib/now.ts` o `lib/conflicts.ts`, los tests son la red de seguridad.

## TODOs vivos · post-evento

- (P3) Search bar en `/speakers` — 52 personas, scroll largo
- (P3) Alphabetical jump A-B-C lateral en `/speakers`
- (P3) Undo en remove/clear actions con toast
- (P3) Print stylesheet para `/mi-dia`
- (P3) VTIMEZONE component en ICS para compat Outlook estricto
- (P3) Service worker offline

## Archivos de configuración

- `vercel.json` — build cmd, output, headers, redirects
- `wrangler.toml` + `public/_headers` + `public/_redirects` — alternativo Cloudflare Pages (no en uso pero listo)
- `astro.config.mjs` — output static, trailingSlash never
- `tsconfig.json` — extends astro/tsconfigs/strict
- `vitest.config.ts` — globals false, environment node

## Iterar

```bash
# editar lo que sea
git add -A
git commit -m "fix/feat: ..."
git push                # → Vercel deploy automático en ~60s
```

## Contexto humano

- Autor: **Gonzalo Arribere** · gonzaloarribere@gmail.com · https://linkedin.com/in/gonzaloarribere/
- Audiencia: C-level/director innovación de banco/fintech argentina, founders, VCs.
- Estrategia personal: vehículo de branding personal. La calidad del último 5% importa más que features adicionales.

## Artefactos en `~/.gstack/projects/aifi26/`

- `gonza-main-design-20260517-233537.md` — design doc completo (Status: COMPLETE)
- `gonza-main-eng-review-test-plan-20260517-235000.md` — test plan
- `ceo-plans/2026-05-18-aifi26-app.md` — CEO plan + scope decisions
- `designs/dia-completo-20260517/` — 4 mockups HTML iniciales (3 descartados + Variant D trading floor aprobado)

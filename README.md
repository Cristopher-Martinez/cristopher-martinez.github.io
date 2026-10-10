# Portfolio

Source for my portfolio and engineering log. Astro, static output, bilingual.

## Running it

```bash
pnpm install
pnpm dev                # development
pnpm build && pnpm preview   # the artefact that actually ships
pnpm check              # typecheck
pnpm measure            # budget gate, two templates, ~2 min
pnpm measure:all        # budget gate, full sweep, ~12 min
```

## Decisions worth knowing about

**Measurement runs against the production build, never the dev server.** `astro
dev` serves unbundled, unminified code with unprocessed images; its Lighthouse
score is inflated and describes no real site. Every number in this repo comes
from `pnpm preview`.

**The budget is a gate, not a dashboard.** `lighthouserc.json` asserts Core Web
Vitals and transfer sizes, and CI fails when they regress. It has caught a
missing meta description, a 3.51:1 contrast ratio in 11px text, and a heading
level skipped from `h1` to `h3` — none of which are visible by looking.

Note that size budgets measure **transferred** bytes. A negative test built from
repetitive data compresses to nothing and sails through; use incompressible data
to prove the gate still bites.

**Content schemas encode what the content has to prove.** A log entry without an
outcome is rejected at build time, because an entry that stops at "and then I
built it" reads as marketing. A project marked `live` must carry the URL
it is live at.

**Both languages are first-class.** English serves from `/`, Spanish from
`/es/`, each page emits reciprocal `hreflang` alternates plus `x-default`, and
the language switcher links to the same page rather than sending readers back to
the home page.

**Zero JavaScript ships by default.** The theme toggle is an inline script that
runs before first paint so a stored choice never flashes the wrong theme. There
are no hydrated islands at present; React is configured for when one is
justified.

## Layout

```
src/
  content/          projects and log entries, markdown, per language
  content.config.ts Zod schemas — the build fails on invalid entries
  i18n/ui.ts        typed string table and route helpers
  layouts/          document shell: meta, hreflang, no-flash theme script
  components/       page sections and the shared chrome
  styles/           tokens (three theme states) and base styles
```

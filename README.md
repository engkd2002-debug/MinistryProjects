# Syrian National Research Platform

A working **Phase 3 Geographic Research Explorer** on the Phase 2 Arabic-first frontend foundation. Explore the supplied SVG geography, connected sample records, filters and visualization layers in both themes and languages. Research Operations, comparison, dashboards and governance workflows remain later phases. All research counts describe the original synthetic sample, not official national statistics.

## Run and preview

Use Node **24.19.0** (`.nvmrc`), npm 11, or a compatible Node version ≥22.12.

```bash
cd /workspace/MinistryProjects
npm ci
npm run dev
```

Open `http://localhost:5173` in your development machine's browser, or forward port **5173** from the cloud workspace. The app starts in Arabic and follows system appearance until you choose light or dark. Use the globe and appearance controls in the header.

- `/explorer` — fully interactive Geographic Explorer, map-linked records and read-only previews.
- `/research` — Research Operations structural preview.
- `/insights` — Research Insights structural preview.
- `/governance/quality` and the supporting navigation — existing operational areas, clearly labeled as future workflows.
- `/dev/design-system` — **development-only** interactive component showcase; use this to review typography, controls, themes, layers, feedback and motion. This route and its page code are excluded from production builds.

In Explorer, **Filters** and “Set research context” open the connected filter panel. Search, geographic/research facets, years, researcher, keyword and category/value update one URL-backed query for map, record list and summaries. Year ranges apply after validation. Queries survive navigation, refresh and history. Prototype `#gov=...&q=...` links migrate once to canonical URL queries.

Select a boundary to filter, inspect a bubble for context, or zoom to cities and up to 12 illustrative record markers per city. Drag/wheel and the +/−/reset controls work; focus the canvas for arrow keys, +/− and Home. **Layers & legend** exposes concentration, zero-match distribution, inferred shared-name links, count thresholds and explicitly simulated visibility. The viewer defaults to published sample records; other demo roles include all sample statuses. Unknown locations stay unplotted and remain available in Matching records. The full legend explains that zero matches do not prove absent research.

The in-memory map viewport/layers/thresholds survive workspace navigation, but reset on reload. Shared links transfer ordinary filters only, not local data, demo visibility or map settings.

## Commands

```bash
npm run typecheck       # Strict TypeScript
npm test                # Domain, persistence, component, preference and routing integration checks
npm run test:e2e         # Chromium interactions, responsive checks, axe scans and screenshots
npm run build           # TypeScript + optimized production bundle
npm run preview         # Serve the production build on port 4173
npm run format          # Format new source, tests and configuration
npm run format:check
```

Browser tests use `/usr/bin/chromium` when available in this workspace. Elsewhere run `npx playwright install chromium`; the config falls back to the Playwright browser. `CHROMIUM_PATH` can explicitly select another executable. The browser suite starts Vite itself or reuses the running port 5173 server. Test traces are kept on failure; final evidence is under `docs/evidence/phase-3/` (Phase 2 historical evidence remains intact). Tests do not require a backend, credentials or remote fonts.

For a production static host, serve `dist/` and configure an SPA fallback to `index.html`. `npm run preview` is a local build check, not a production hosting service. Do not publish or deploy automatically.

## Architecture

```text
src/app/                 bootstrap composition, routing, navigation and shell
src/domain/              typed records, filtering, visibility, metric and SVG contracts
src/data/                repository interfaces, source adapters and versioned local snapshots
src/data/demo/           hash-pinned original synthetic fixture; not live or official data
src/features/explorer/   map workspace, filters, layers, context, gestures and session state
src/features/workspaces/ structural previews for operations, insights and supporting areas
src/features/showcase/   development-only design-system review
src/shared/ui/           accessible, domain-independent interface components
src/shared/query/        URL codec integration, query context and shell intent context
src/shared/theme/        system/explicit appearance and guarded local preferences
src/shared/i18n/         Arabic/English messages and formatting
src/shared/tokens/       semantic light/dark colors, typography, spacing and motion
src/shared/motion/       reusable direction-aware transitions
```

URL parameters are the canonical filter state. React contexts handle shell intents, preferences and persistent-in-session map presentation; URL state remains the sole filter authority. No extra store or map library was needed. Component styles use namespaced CSS rather than CSS Modules; semantic tokens and module ownership prevent workspace-specific palettes. Form libraries and spreadsheet dependencies are deferred to the phases that implement those workflows.

Research records, geometry, reference dictionaries and synonyms were extracted from the original HTML using `scripts/extract-fixtures.cjs`. It verifies the source SHA-256 before extraction. Canonical fixtures are isolated from presentation; the Explorer and record dataset are lazy-loaded; lightweight geographic extent/reference data support the shared shell/session. The snapshot repository reports malformed/unavailable storage and unknown schema versions instead of silently replacing data or claiming a successful save. Authoring/import commands and real API adapters are not implemented.

The demo visibility functions and visibility selector are **not authorization**. The frontend contains no login, authenticated session, backend, institutional permission policy or durable audit service. Supporting route placeholders do not enforce production access.

## Design, themes and localization

The palette combines deep navy, research teal and restrained cyan with independent semantic surface/text/action/feedback/data tokens. IBM Plex Sans Arabic and Inter are bundled locally. Read [design-system documentation](docs/07-design-system.md) and [motion conventions](docs/08-motion-and-interactions.md).

`index.html` resolves appearance and locale before the React bootstrap. `ThemeProvider` supports system/light/dark, listens for system changes, and persists explicit preference in `snrp.preferences`; failed persistence is reported. Add colors to the semantic token layer, never individual component hex values.

Arabic is the default. Use `useI18n().t()` with centralized stable message keys, CSS logical properties, and `bdi`/direction isolation for mixed content. `formatNumber`/`formatDate` use `Intl`. Language changes preserve component state and query IDs. Do not translate source research content automatically.

To extend the component library:

1. Compose existing `shared/ui` patterns before creating a new primitive.
2. Keep domain rules and data access outside the component.
3. Use semantic tokens and localized labels; expose disabled/loading/error and focus states.
4. Support keyboard, both directions, narrow layouts and reduced motion.
5. Add a development showcase specimen and a meaningful interaction test.

Motion durations live in tokens; shared patterns cover feedback, disclosures, drawers, dialogs and route entrances. Reduced motion overrides animation. The map uses the shared 380 ms timing token for cancellable viewport transitions and immediate reduced-motion updates. Charts remain deferred. Map tokens use separate `--map-*` semantic values for each theme; do not mirror SVG geography for RTL.

## Scope and validation

Read the [Phase 1 index](docs/README.md), [48-feature traceability matrix](docs/07-functional-traceability-matrix.md), [Phase 2 implementation report](docs/09-phase-2-implementation-report.md), [Explorer architecture](docs/10-geographic-explorer-architecture.md), [interaction specification](docs/11-geographic-interaction-specification.md) and [Phase 3 implementation report](docs/12-phase-3-implementation-report.md). The matrix retains all later features; foundation delivery does not mark complete workflows finished.

Known boundaries: map previews do not include full record detail/related records, profiles, comparisons, authoring, assisted search, analytics, import/export or governance actions. Only supplied city/governorate coordinates are used; record dots and shared-name curves are illustrative. No institution pins, basemap tiles, official boundary verification or coverage registry are provided. Custom definition/reference editors and legacy prototype data migration remain later work. Local fixtures and client visibility rules are not a production data/security system. Automated accessibility checks supplement, and do not replace, screen-reader and cross-browser review. Official branding, boundary provenance, data rights and institutional policy remain unresolved as documented in Phase 1.

**Phase 3 stops here. Phase 4 requires a new instruction.**

## GitHub Pages deployment

The application supports a static repository-hosted build. `.github/workflows/pages.yml` validates and builds each push to **main**, then deploys the artifact through GitHub Pages. The repository must have **Settings → Pages → Source: GitHub Actions** enabled, with Pages available on its existing visibility/plan. The workflow does not change repository visibility.

For this existing remote, the build uses `PAGES_BASE_PATH=/MinistryProjects/`. Vite prefixes assets, React Router uses the same basename, and generated `404.html` redirects deep links through the root before restoring their original clean path/query/hash. This supports `/MinistryProjects/explorer` refreshes without replacing browser routing with hash routing.

```bash
PAGES_BASE_PATH=/MinistryProjects/ npm run build
PAGES_BASE_PATH=/MinistryProjects/ node scripts/prepare-pages.mjs
PAGES_BASE_PATH=/MinistryProjects/ node scripts/verify-pages.mjs
```

The verifier emulates GitHub Pages locally; passing it is **not** proof of a live deployment. See [deployment status and prerequisites](docs/13-github-pages-deployment.md). Future pushes to `main` deploy the latest successful build; failed builds do not replace the last deployment. No alternate hosting or visibility change is automatic.

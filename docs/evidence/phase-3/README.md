# Phase 3 validation evidence

Final application validation: 55 unit/component/integration tests, 34 Chromium browser tests, 17 axe scans with zero reported violations, and six built-production checks. See [the implementation report](../../12-phase-3-implementation-report.md) for commands, scope, limitations and screenshot descriptions.

- `browser-results.json`: final full 34-test Playwright run (19 Explorer + 15 foundation regressions).
- `geographic-accessibility.json`: seven Explorer overlay/mobile scans.
- `foundation-regression/accessibility-results.json`: ten shared map/shell/showcase scans in both languages/themes.
- `production-results.json`: built application checks on port 4173; reproducible with `node scripts/verify-explorer-production.mjs` after starting preview.
- `production-*.png`: animation-stable production screenshots, including Arabic light/dark and compact context.
- `responsive-*.png`, `context-*.png`, `01`–`06` screenshots: interactive-browser visual evidence.
- `foundation-regression/`: regression screenshots from the preserved Phase 2 component/shell tests, captured against the Phase 3 application. Original Phase 2 evidence is untouched.

Counts in screenshots describe the original synthetic fixture/current query. They are not official research statistics. Axe is automated evidence, not full accessibility certification. The PRD was not used to add functional scope.

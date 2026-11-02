# Phase 3 implementation report — Geographic Research Explorer

Implemented on 2 November 2026 in the existing React/TypeScript/Vite application. Phase 2 shell, shared UI, themes, localization, query codec and repository are preserved. **Phase 4 has not started.** Nothing was published or deployed.

## Launch and review

```bash
cd /workspace/MinistryProjects
npm ci
npm run dev
```

Forward **5173**, then open **`/explorer`** (`http://localhost:5173/explorer`). Arabic is the default; the header globe switches languages. Appearance supports light, dark and system with the existing persistence/first-paint behavior. The development component showcase remains `/dev/design-system`.

For the built application:

```bash
npm run build
npm run preview
# Forward 4173 and open http://localhost:4173/explorer
node scripts/verify-explorer-production.mjs
```

The production evidence script expects port 4173 already running; `SNRP_PREVIEW_URL` can select another local preview and `CHROMIUM_PATH` another Chromium executable. Dev and built preview were both exercised. Forwarding/preview is not publication.

A useful review sequence: inspect a governorate bubble, compare its contextual count with the complete list, use Show matching records, return to Map and zoom into cities/record dots. Open Filters to combine geography, years and researcher/keyword. Open Layers & legend to review concentration, distribution/zero-match shading, name links, manual thresholds and explicitly simulated visibility. Test reset-map separately from national overview and clear-all-filters.

## Delivered functional scope

| Area | Implemented behavior |
|---|---|
| Map data | Exact original 14 SVG boundaries and supplied reference coordinates; deterministic original synthetic records. No new geography or records. |
| Navigation | Captured pointer/touch pan, pointer-centered wheel, +/− buttons, reset/Home, physical arrow keys and directional controls; original three zoom levels. |
| Selection | Governorate click/Enter/Space toggle and highlight; blank map clears geography only; national/city breadcrumbs; explicit geographic focus. |
| Bubbles | Source relative square-root count sizing, 120-pass collision layout, deterministic coincident-anchor repair, leader anchors, counts and localized labels. |
| Context | Current-query count, top-three universities/specialties, available cities, inspect versus explicit filter/drill, close/Escape; desktop rail/tablet drawer/mobile bottom sheet. |
| Records | Up to 12 illustrated dots per city at record zoom, keyboard/pointer previews, matching list in batches of 25 and accurate remaining count. |
| Query | Connected ordinary text search, linked exact facets, effective researcher/co-researcher input, keyword/type, OR multi-years, validated inclusive range and six supplied category/value dimensions. |
| State | One URL query across map/list/context/summary; dependent city reconciliation, labeled removable chips, history/refresh/navigation and honest clipboard behavior. In-session viewport/layers/thresholds survive workspace navigation. |
| Analysis | Five disclosed summaries calculated from actual filtered records; concentration, matching-count distribution, qualified zero/unavailable encodings and top-15 inferred shared-name links plus accessible table. |
| Presentation | Complete light/dark semantic map tokens; Arabic/English and RTL/LTR; responsive layouts; shared motion tokens and immediate reduced-motion viewport changes. |
| Integrity | Published-only viewer default, guarded preview, unlocated record accounting, loading/error/retry and unavailable `—`; no silent reseeding of corrupt saved data. |

Full geographic groups **F17–F23 and the map portion of F24** are delivered. Shared/map discovery portions of F06–F13/F15–F16 are usable here. F14 is deferred. F20's activation opens a useful limited read-only preview rather than a placeholder; full F25 remains Phase 4. The [traceability matrix](07-functional-traceability-matrix.md#phase-3-delivery-annotation--2-november-2026) preserves all 48 audited groups and records remaining work.

## Significant design and architecture decisions

1. **Map-led composition with progressive disclosure.** A flexible canvas, compact commands and contextual rail replace the original layout. Filters/layer explanations are on demand; five summaries sit below the map. Small screens use a genuine modal context surface and usable map rather than shrinking all desktop regions.
2. **Inspection differs from filtering.** Bubble activation previews a current-query location; an explicit action selects its geography. Boundary selection filters immediately. This preserves source behavior while making query changes predictable.
3. **Query is the sole result authority.** Domain predicates feed every map, list, summary, facet and context. Compound geographic/range updates commit atomically. Navigation preserves ordinary URL filters, while map presentation has a separate documented session lifetime.
4. **Location integrity comes before apparent coverage.** Supplied geometry/anchors are retained exactly. Missing cities no longer silently become governorate coordinates at city zoom. Unplotted records remain reachable. Zero-match hatching and unavailable dots express different facts, and neither implies national research absence.
5. **Reused foundation without new dependencies.** A lazy route, small renderer/layer/control modules, pure geographic selectors and a typed repository keep presentation separate from domain/data. Existing shared components provide overlays, disclosures, form states and feedback. The viewport animator updates SVG attributes with cancellable frames rather than rebuilding React every frame.
6. **No production identity fiction.** Role selection is explicitly simulated, defaults to viewer, and uses the same visibility predicate everywhere. The client bundle includes synthetic fixtures; this is not security or authorization.
7. **Restricted record preview.** Map users can read enough to identify a record and follow existing keyword/source behavior. Full details, related records, entity profiles, comparisons and editing remain separate future modules.

Scalability seams, selector contracts, state lifetimes and file responsibilities are detailed in [the architecture](10-geographic-explorer-architecture.md). Exact reset, overlay, filter and input contracts are in [the interaction specification](11-geographic-interaction-specification.md).

## Differences from the prototype and Phase 1 handoff

- Preserved source geographic functions and data; replaced the original visual layout/CSS completely using the Phase 2 design system.
- Added keyboard pan/reset/zoom equivalents, Space activation and genuine single-pointer touch support; improved focus preservation and compact navigation/context behavior.
- Default visibility is viewer rather than the source's initial admin. Other original simulated roles remain available. No unpublished record is rendered through viewer map/list/preview paths.
- Repaired the source's inert researcher field with the already-tested Phase 2 predicate. Both supplied governorate-language names are searchable so interface language changes do not silently change matches.
- One multi-year control replaces contradictory single/multi-year presentations. Ranges and manual thresholds validate before commit. Selected unavailable facet values remain visible.
- Missing/unrecognized cities stay unplotted instead of inheriting governorate anchors. The complete list preserves access; no coordinates are fabricated.
- Zero-match distribution uses hatching instead of an alarming gap color. Unavailable data uses a distinct dotted encoding; coverage remains explicitly unknown everywhere. No rankings, priorities or policy recommendations are introduced.
- Clipboard success waits for the actual promise; failure displays fallback guidance. Only ordinary filters are shared.
- Phase 1's temporary record-ID handoff is now a guarded limited preview; this is a documented implementation choice within the map-related record interaction, not completion of full Operations/detail workflows.
- The six supplied category definitions are available. Custom values already present in query/data are supported, but the custom definition/reference registry/editor and legacy browser-store migration remain Phase 6. No PRD-only capability was added.

## Validation performed

| Check | Result / evidence |
|---|---|
| Strict TypeScript | `npm run typecheck` passed. |
| Unit/component/integration | `npm test`: **55/55 passed**, six files. Includes all Phase 2 tests plus geographic integrity, aggregation, collision, name inference, viewport math, bilingual query stability and atomic history drill-down. |
| Browser interactions/regressions | `npx playwright test`: **34/34 passed**, zero skipped/flaky/failed. **19 Explorer tests + 15 Phase 2 regressions**. [Machine-readable report](evidence/phase-3/browser-results.json). |
| Browser scope | Selection/toggle/drill, all exact facets and category hydration, OR-years/range validation, independent researcher predicate, map/list parity, 25→50 pagination, zoom in/out/reset/wheel anchor, pointer pan, keyboard/Space/Escape/focus, touch pan/tap, all overlays/thresholds, role IDs, refresh/navigation, clipboard rejection, corrupt/empty/incomplete data. |
| Responsive / localization / appearance | 390, 768, 1280 and 1920 px, both directions and themes; a dedicated cross-breakpoint context regression; no horizontal document overflow; compact panels and stacked fields. Existing preference/no-flash/reduced-motion regressions pass. |
| Automated accessibility | **17 scans, zero reported violations** across map/shell/showcase, filters, settings, preview, dialogs and Arabic mobile context. WCAG 2 A/AA, 2.1 AA and 2.2 AA axe rules. [7 geographic scans](evidence/phase-3/geographic-accessibility.json), [10 foundation scans](evidence/phase-3/foundation-regression/accessibility-results.json). |
| Production | `npm run build` passed. Built app on 4173 passed **6 production checks**, including exact published record identifiers, deep-query/source counts, bilingual themes, context/layer interaction, dev-showcase exclusion and zero runtime/console errors. [Report](evidence/phase-3/production-results.json). |
| Formatting | `npm run format:check` passed. |
| Source/scope review | Original fixtures/geometry preserved; no runtime dependency added, backend, new coordinates, research data, official counts, PRD-only features or later workspace commands implemented. |

The build emits two benign Zod dependency comment/annotation notices; it completes successfully. Chromium browser and production checks collected no application runtime or console errors. Earlier runs found grouped year formatting, ambiguous test selectors and a title-based visibility assertion; years now use ungrouped formatting and visibility checks use unique source IDs. The final full run passes. Automated checks do not establish screen-reader or all-browser certification.

## Screenshot and visual review evidence

Screenshots are actual running application captures, not mockups. Screenshot helpers finish finite animations to avoid capturing a transition halfway through. Functional motion is separately exercised by interaction/reduced-motion tests.

| State | Evidence |
|---|---|
| Arabic light, production | [National overview](evidence/phase-3/production-ar-light.png) |
| English light, production | [Location context](evidence/phase-3/production-context-en-light.png) |
| Arabic dark, production | [Distribution and context](evidence/phase-3/production-ar-dark.png) |
| English light layers | [Concentration, distribution and shared-name links](evidence/phase-3/03-layers-en-light.png) |
| English dark layers | [Concentration, distribution and shared-name links](evidence/phase-3/04-layers-en-dark.png) |
| Record zoom | [City record markers](evidence/phase-3/02-record-level-en-light.png) |
| Mobile | [390 px Arabic dark](evidence/phase-3/responsive-390-ar-dark.png), [English light context](evidence/phase-3/context-390-en-light.png), [production Arabic dark context](evidence/phase-3/production-context-390-ar-dark.png) |
| Tablet | [768 px English light](evidence/phase-3/responsive-768-en-light.png), [production Arabic dark context](evidence/phase-3/production-context-768-ar-dark.png) |
| Laptop / wide desktop | [1280 px Arabic dark](evidence/phase-3/responsive-1280-ar-dark.png), [1920 px English light](evidence/phase-3/responsive-1920-en-light.png) |
| Data integrity states | [Valid empty query](evidence/phase-3/05-empty-en-light.png), [unavailable saved data](evidence/phase-3/06-unavailable-en-light.png) |

Visual review inspected the national overview, all-layer dark view, record zoom, mobile/RTL dark state, tablet overview and compact contextual surface. Controls and labels remain reachable, map geometry is not mirrored, and dialogs/panels remain within viewport bounds. Initial transition-timed evidence was refreshed with animation-stable production captures. Review also caught and fixed an unsolicited context-modal opening when resizing; inspection now survives behind an explicit compact context action.

## Known limitations and readiness for Phase 4

- All records are synthetic browser-local demo data; supplied boundaries/anchors are not independently verified. Coverage, actual institutional locations and researcher identities are unresolved. Shared-name edges are explicitly heuristic.
- Map rings sample the first 12 records per city. All matching records remain accessible in the list. No institution pins, basemap, new hierarchy or pinch interaction has been added.
- Geometry and collision are synchronous and sized for the supplied 14/22 aggregate groups. Larger datasets need indexing/worker/API work and bounded rendering. New-node/overlay reveals and viewport motion are animated; count/layout updates remain direct rather than animating misleading intermediate values.
- Map view settings are session-only. Ordinary filter URLs do not transfer local records or demo roles. Saved-data recovery, custom definition/reference editing and original prototype store migration require later explicit work; failed reads do not destroy data.
- Full research detail, related records, university/specialty profiles, 2–8 comparison and authoring are **Phase 4**. Assisted/synonym search also remains Phase 4, with dictionary editing later. Dashboard charts/drill/print are **Phase 5**. Governance, imports/exports, custom definitions, references and handover artifacts are **Phase 6**. Integrated validation remains **Phase 7**.
- Validation used Chromium and real Chromium touch events. Safari/Firefox, real-device usability and manual screen-reader testing remain unverified. Official branding/data rights/policies remain the Phase 1 open questions.

**Ready for Phase 4 review and implementation under a new instruction.** The Explorer is functional; the remaining modules have clear query/repository/record-ID integration seams. No functional map group is blocked. Deferred full detail/profile portions remain explicitly tracked instead of being claimed complete.

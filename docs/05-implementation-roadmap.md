# 05 — Implementation roadmap

Status: Phase 1 handoff; no application implementation authorized in this phase. Follow the [feature inventory](01-feature-inventory.md), [traceability matrix](07-functional-traceability-matrix.md), [IA](02-information-architecture.md), [UX contracts](03-ux-architecture.md), and [technical architecture](04-technical-architecture.md) together. HTML is the current capability ceiling; PRD priority labels and its internal “Phase 2/3” labels do **not** define this roadmap. Phase numbers below belong to this request.

## Delivery rules

- Preserve the observable successful outcomes in F01–F48, not the original single-page composition or accidental defects. Implement the proposed remedies explicitly identified in the inventory; do not silently promote a partial capability into a more advanced workflow.
- Use the original deterministic synthetic dataset and reference dictionaries as fixtures. Label them sample data. No new national statistics, verified researcher identities, reporting coverage, institutional policies, or backend services.
- Every feature has one owning module and a phase in the matrix. Cross-workspace behavior is tested against one query result, rather than three independent implementations.
- Browser roles remain an explicitly labeled demo. Consistent client guards improve the demonstration but cannot establish authorization. No production readiness claim follows from this roadmap.
- Keep each phase reviewable and runnable. A phase passes only when its measurable criteria pass; record failed, skipped and unrun checks separately. Stop after the requested phase. Phase 2 requires a new instruction.

## Phase 1 — Product Discovery, Functional Audit & Architecture

**Dependencies:** two supplied sources and current repository inspection.

**Deliverables:** this documentation set, immutable source copies, extracted PRD text, complete control/function inventory, proposed module responsibilities, source-to-phase matrix, bounded runtime evidence, scope exclusions and open decisions.

**Completion:** every inline/dynamic event family is covered by the matrix; implemented/simulated/partial/visual-only outcomes are distinguished; current defects have explicit dispositions; PRD-only capabilities are excluded; foundation tasks below can be executed without rediscovering the product scope. Browser evidence is supplemental to source coverage, not a claim that every path has been manually tested.

## Phase 2 — Design System & Application Foundation

**Goal:** establish reusable visual and technical infrastructure before complete workspaces. This document defines the work; it does not start it.

**Dependencies:** Phase 1 accepted as the scope baseline; resolve any architecture changes explicitly. Empty repository means no existing framework to preserve. Use the frontend stack in document 04 unless a new repository inspection reveals an appropriate existing stack.

**Execution sequence:**

1. Inspect current Git state and instructions again; preserve new user files. Scaffold the recommended TypeScript frontend and lock dependencies; record runtime and package-manager versions and reproducible install/check commands. Do not add an API server, database, identity provider, or external AI integration.
2. Extract fixture data, reference dictionaries, geometry/projection, normalizer, filter/search/aggregation formulas into typed modules, keeping the archived HTML unchanged. Pin one deterministic seed snapshot for tests. Define and validate the legacy-to-domain adapter and repository interfaces; no implicit seeding over existing user data.
3. Define semantic token contracts for typography, space, density, surfaces, text, borders, interactive/focus, statuses and chart/map encodings. Supply light/dark values, Arabic and Latin font fallbacks, logical sizing and reduced-motion behavior. Official branding remains provisional; do not invent a ministry endorsement. Tokens are the Phase 2 design work, not Phase 1 screens.
4. Build the shared primitives and exercise them in a development-only gallery: buttons, links, labeled text/select/number/date controls, checkbox, chips, disclosure, tabs/navigation, badges, alert/toast, table, empty/loading/error states, dialog, contextual panel, comparison tray skeleton. Native semantics first; keyboard, focus restoration, error association and RTL must be demonstrated.
5. Build shell and placeholder routes for Explorer, Research, Insights and permitted supporting operations. Add shared query serialization/hydration, navigation/history handling, locale/theme preferences, demo-role context, and bounded persistence/migrations. Workspace placeholders must say they are not implemented, not display fabricated metrics.
6. Wire a deterministic in-memory/local repository implementation behind adapters, with explicit seed/reset policy, corrupt-storage/quota errors and a safe no-write fallback. Isolate raw HTML field names in the adapter. No actual imports, record editor, analytics workspace or full map UI required yet.
7. Establish unit/component/browser checks and CI commands. Test pure filtering and derived counts as the substrate for the next phases; test intended corrections rather than reproducing F.res's no-op or viewer visibility leakage. Document any policy decision used.

**Deliverables:** reproducible frontend project, typed domain and fixture adapters, semantic tokens, accessible shared component gallery, shell/routes, query/persistence/preferences infrastructure, quality scripts, short developer handoff, and feature-matrix progress annotations. No complete workspaces or new product capabilities.

**Measurable exit criteria:**

- Frozen-lock install, production build, type checking and selected tests pass in a fresh process; commands and their results are recorded.
- Three primary route placeholders navigate using keyboard; query survives navigation, refresh, back/forward and URL hydration. Selecting/removing/clearing a query filter yields identical selectors for all three consumers in unit tests.
- Default Arabic/RTL and English/LTR operate in the shell; switching locale or theme twice does not lose source strings, change IDs or clear filters. Mixed-direction title/URL text and keyboard focus remain legible in both themes.
- Dialog traps focus while open, Escape closes it, and focus returns to trigger; drawers/disclosures expose state. Component gallery exercises loading, empty, error, success and disabled states with accessible names.
- At 390px, 768px and 1440px the shell has no unintended page-level horizontal overflow; a table may scroll in its own labeled region. At 200% zoom primary navigation and dismissal remain reachable.
- Unit tests cover Arabic normalization, query codec unknown/invalid values, year union/intersection, single facets, custom category equality, role visibility, deterministic seed, repository parse failure and storage failure. No test bypasses permission checks by mutating UI state.
- Sample-data and role-simulation labels are visible. No full future module, backend, institution-type filter, external search or production auth is introduced.

## Phase 3 — Geographic Research Explorer

**Dependencies:** Phase 2 selectors, shell, filters, tokens, accessibility primitives and typed record-open navigation contract. Full detail rendering belongs to Phase 4. Phase 3 verifies that a dot emits the correct accessible record ID and navigates to an honestly labeled temporary destination; it does not claim the complete record-reading journey works yet. Phase 4 must replace that temporary destination and Phase 7 verifies the integrated outcome.

**Deliverables:** SVG geometry/projection adapter; pan, wheel/button zoom and reset; governorate selection; city grouping and record dots; cluster summary/show matching research; live count legend/editable thresholds; heat, observed zero-count shading and name-matched collaboration overlays; year controls; map equivalent controls using the existing filtered record/geography data; contextual detail handoff. Existing capabilities F17–F24 and shared F08/F11/F16, not new institution pins or tiles.

**Completion:** thresholds `<2`, `<4.5`, `>=4.5` reproduce the three detail levels; 14 prototype regions appear; city/project data reconcile with the same query and visible records. Select/deselect governorate, open cluster/show research, pan/reset, toggle each overlay, adjust thresholds and emit the correct record-open intent from a dot all produce testable outcomes. Explain displaced bubbles, supplied unverified location coordinates, name-based edges and maximum 12 displayed dots per cluster; all matching records remain accessible through the record-results contract (full results delivered in Phase 4). Empty-map state removes stale legends. Keyboard equivalents and narrow-layout behavior pass. No claim of official boundary accuracy or research absence; Phase 3 is a module milestone, not complete discovery delivery.

## Phase 4 — Research Operations Workspace

**Dependencies:** Phase 2; cross-workspace geography wiring from Phase 3; data mutation invalidation contract. Build read/search/detail first, then comparison/profiles/editor.

**Deliverables:** live text search and linked facets, range/type/keyword/year/category controls, working researcher control as the documented defect correction, filter chips/reset, local synonym-based ranked search with explanations/examples/clear, paged-by-25 results, details/related records/keyword/source links, global university/specialty profiles, persistent-in-session 2–8 comparison tray/matrix, create/edit form and local audit append. Shared components support governance later.

**Completion:** query/list/map/count parity; independent and combined filters work; displayed zero matches remain zero rather than reverting silently; no-match assisted-search correction is explicit. Show more reveals next 25; 2–8 comparison bounds and 12 comparison fields behave correctly and differences have text equivalents. Comparison survives workspace changes but removes inaccessible records after role changes; details recheck visibility. Profile scope is labeled and filter action returns to the shared query. Add/edit saves every supported field including custom values and refreshes consumers; cancel leaves records unchanged; required fields and storage errors are visible. Form/source-link injection risks have validation tests. URL reconstructs the ordinary query; assisted-search/share limitations are disclosed until their documented serialization remedy is implemented.

## Phase 5 — Research Insights Dashboard

**Dependencies:** Phase 2 selectors and visualization primitives, Phase 3/4 shared navigation and detail/filter outcomes.

**Deliverables:** scoped KPI definitions, yearly counts, five distribution groups, governorate comparison table, governorate × specialty observed-count matrix, existing chart-to-query drill, print report. No growth forecast, normalized institutional ranking, coverage calculation, or opportunity score.

**Completion:** sums/counts reconcile with the authorized fixture result; top-N truncation and distinct-name counting are visible. Six clickable dimensions (year, university, specialty, governorate, type, branch) set canonical filters and reach matching results. Gap-matrix cells remain counts, with no invented click behavior or opportunity inference; governorate comparison remains a read-only table. All chart values have accessible text/table equivalents, empty datasets are intelligible, Arabic/English/light/dark are readable, printed output contains scope and sample-data caveat. No official-statistic claim.

## Phase 6 — Existing Governance & Data Operations

**Dependencies:** Phase 4 editor/details/query invalidation, Phase 5 completeness explanations, Phase 2 parser/repository boundaries and role checks. Can be broken into 6A import/export, 6B governance/reference operations without changing scope.

**Deliverables:** CSV/template and locally bundled optional Excel parser; four-step persisted staging/mapping/validation/review/commit; warnings inclusion, admin add-university option; filtered CSV/JSON/XLSX export; category definitions and existing value entry; quality/completeness report; suspected duplicate pairs; nonpublished queue and comment/reject/publish controls; visible permission matrix/local audit exports; synonym editing/save/reset/export; university addition/dictionary; SQL/reference/project handoff downloads.

**Completion:** fixtures with clean/warning/error rows give expected counts and line numbers. Error rows never commit; warnings obey review choice; zero eligible rows are explained; commit is explicit, not a file-selection side effect. Reload resumes uncommitted mapping; discard clears only staging; local writes fail visibly. Do not describe repeat uploads as idempotent: duplicate warnings are advisory, duplicates can be included. Role switching cannot bypass UI guards via retained dialogs/selections. Rejection without reason fails; successful changes append local audit and invalidate all affected selectors. Preserve the six existing status values and observed demo actions; any narrower policy requires an explicit decision, not an invented official lifecycle. Exports open and match intended record scope; JSON vs tabular field differences and handoff lossiness are documented. Schema download is text only, never a database installation. Quality score is field presence, duplicates are candidates with no merge/delete. Category metadata types do not imply newly implemented type-specific editors without the decision in document 06.

## Phase 7 — Comprehensive Validation & Handoff

**Dependencies:** Phases 2–6 integrated, all matrix rows implemented or explicitly blocked. No silent deletion of features to pass validation.

**Deliverables:** source-to-implementation evidence for every matrix row; unit/integration/end-to-end results; Arabic/English × light/dark × supported viewport review; keyboard and screen-reader review of primary tasks; regression/import/export/security tests; build/run guide; limitations and production boundary.

**Completion:** all required matrix outcomes verified including filters shared between three workspaces, mutation refresh, visibility changes, comparison cap, imports, every governance tab/download, share failures, storage failures and malformed files. Check Chromium, Firefox and WebKit where available; record unavailable engines. Establish a measured demo performance baseline (dataset size, hardware, viewport and timing recorded); PRD 100k/SLO targets are future planning, not claimed evidence. Confirm original source copies unchanged, no secrets/official-looking fabricated data, no backend calls implied. A reviewer can reproduce the demo with documented commands. Demo delivery is distinct from a production release.

## Later evolution — architectural seams, not scheduled scope

| Extension | Seam already planned | Prerequisite before implementation |
|---|---|---|
| More sections | Route/module registry and shared shell | User-approved capability and ownership |
| Research sectors/institution types | Reference adapter; university compatibility mapping | Verified taxonomy, actual data, revised schema/aggregation basis |
| More fields/facets | Typed filter and field registry, domain selectors | Validation and migration rules, equality semantics |
| More visualizations | Pure aggregate selectors, chart/table adapters | Metric definition and traceable input |
| Larger datasets | Async repository interface and aggregate boundary | Measured load; paginated/aggregate API, worker/index design |
| Real permissions/workflows | Capability boundary and transition service | Identity provider, server authorization, institutional policy |
| APIs/databases | Replace demo repository implementation | Backend contract, migrations, persistence/privacy/security review |
| Consistent UI at scale | Semantic tokens, primitives, locale bundles, contract tests | Component ownership/versioning and regression evidence |

These seams do not authorize backend, authentication, sectors or analytical expansion in Phases 2–7.

## Phase 3 implementation note

Phase 3 has been implemented under the user’s explicit request. See [the report](12-phase-3-implementation-report.md) and the matrix delivery annotation. The map record-ID handoff now opens a useful guarded read-only preview instead of an empty temporary route; full detail, profiles, comparison, editing and assisted search remain Phase 4. Ordinary filters and map-linked results are available for geographic exploration; this does not mark the Operations workspace complete. Stop before Phase 4.

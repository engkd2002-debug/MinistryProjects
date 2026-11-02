# 04 — Technical architecture and sustainability

Phase 1 specification, 2 November 2026. No application or backend is implemented by this document. Read with the [inventory](01-feature-inventory.md), [state and navigation contracts](02-information-architecture.md), [UX rules](03-ux-architecture.md), [roadmap](05-implementation-roadmap.md), and [traceability matrix](07-functional-traceability-matrix.md).

## 1. Evidence, constraints and stack decision

Repository inspection found an existing Git checkout at `/workspace/MinistryProjects`, an unborn `work` branch, no commits, no application files, dependency manifests, lockfiles, CI configuration, framework pins, or `AGENTS.md`. The attached prototype is a standalone HTML document with inline CSS/JavaScript, native SVG, native `<dialog>`, FileReader, Blob downloads and localStorage. It optionally loads SheetJS 0.20.3 from `cdn.sheetjs.com` (HTML L107). There is no existing suitable application stack to preserve or migrate.

The recommended next-phase stack is:

| Layer | Recommendation | Reason and boundary |
| --- | --- | --- |
| Build/runtime | Vite, React, strict TypeScript; active Node LTS compatible with chosen Vite; one committed package lock | A frontend demo needs no SSR/server framework. Typed components and domain functions replace the prototype's coupled global variables. Pin exact compatible versions in Phase 2 rather than claiming installation now. |
| Navigation | React Router | Three workspaces and supporting operational routes need browser history and addressable context. |
| Shared client state | Small Zustand store for cross-workspace transient selection/preferences; typed URL codec for query state | Separate filter truth from viewport, dialogs and comparison. Do not duplicate filters in competing stores. |
| Forms/validation | React Hook Form with Zod schemas | Structured record forms, import mapping and adapter-boundary validation share explicit validation results. Browser validation complements domain rules. |
| UI | CSS custom properties and CSS Modules; accessible headless dialog/popover primitives where needed | Reusable RTL-aware tokens without inheriting the HTML layout. Semantic HTML first; a primitive library does not establish accessibility by itself. |
| Localization | i18next/react-i18next with Arabic and English message catalogs | Stable keys, plural rules and formatting replace destructive pipe-delimited translation. |
| Mapping | React-managed native SVG initially, behind a renderer interface | Retains the demonstrated vector geometry, progressive governorate/city aggregates and overlays without inventing tile services or institution geolocation. |
| Visualizations | Semantic HTML/SVG charts with shared aggregation selectors; optional narrowly imported D3 utilities only if needed | Existing charts are counts, distributions, a timeline and a matrix. A large chart framework is unnecessary initially. |
| Spreadsheet I/O | Bundled, pinned SheetJS distribution from its authoritative source; validated CSV parser | Removes a runtime CDN dependency. Record the trusted distribution/source and license decision during Phase 2; add, pin and validate the actual spreadsheet parser/writer with import/export in Phase 6. Do not install it merely to populate the foundation. Never substitute the old similarly named registry version without checking. CSV remains a supported fallback. |
| Verification | Vitest, Testing Library, Playwright and axe-core; typecheck/build in CI | Domain correctness, integrated interactions, downloads and browser accessibility require different checks. |

Do not add a backend, database, GIS server, search service, real authentication, embeddings, WebSockets, analytics tracking or a user-facing component workbench simply because the PRD describes them. A development-only component gallery is a Phase 2 validation artifact. Introduce additional dependencies only for a traced current capability or a measured foundation need. No dependency was installed in Phase 1.

The PRD's §16 architecture is useful strategic guidance. Its release requirements, API sketches and “AI implementation contract” are reference content, not authority to expand the user-authorized HTML-only demo scope.

## 2. Application boundaries and dependency direction

Use a modular monolith frontend. Feature modules depend on shared domain/data contracts; domain code never imports React, routing, browser storage or UI components. Route components compose features. Features must not reach into another feature's internal components or mutate its state.

```text
src/
  app/                       # providers, router, shell, route manifest, error boundaries
  domain/
    research/                # record types, normalization, filtering, related matching
    geography/               # IDs, projection, aggregation, map contracts
    taxonomy/                # reference entities and custom-field definitions
    analysis/                # metrics, quality, duplicate and collaboration algorithms
    governance/              # demo role policy and transition validation
    imports/                 # staging, mapping, row diagnostics and commit plan
  data/
    contracts/               # repositories and serializable DTOs
    demo/                    # exact supplied fixture adapter and seed metadata
    local/                   # schema-versioned persistence, migrations, storage failures
    adapters/                # file parsers, spreadsheet writer, download, clipboard
  features/
    explorer/                # map renderer, layers, geographic summary
    research/                # results, record preview/detail, profiles, compare
    authoring/               # create/edit form
    insights/                # timeline, distributions, governorate table, zero matrix
    data-operations/          # import wizard, results export
    governance/              # review, quality, duplicate candidates, audit, role reference
    configuration/           # synonyms, university references, custom fields, handoff pack
  shared/
    ui/                      # primitives and composable accessible patterns
    query/                   # canonical filter codec, reducer/actions, selectors
    i18n/                    # message catalogs and formatters
    tokens/                  # semantic tokens, themes, density, motion
    utilities/               # infrastructure-neutral helpers only
```

Avoid a generic `utils.ts` containing product rules. `research` owns the meaning of matching and relatedness; `analysis` owns metric formulas; `imports` owns preview/commit eligibility. Views consume these decisions, not reimplement them.

Shared components: application shell, workspace navigation, scope summary, filter controls/chips, accessible combobox/select, field/error summary, button/icon button, table/overflow region, record link/preview, comparison tray, chart frame with data alternative, drawer, dialog, tabs, toast/live region, empty/error/loading state and demo-data notice. Business-specific tables remain in features and compose these primitives.

## 3. Routing and navigation

Recommended route families (new organization, existing capabilities only):

| Route family | Responsibility |
| --- | --- |
| `/explorer` | Geographic view, layers, viewport, summary and link to matching records |
| `/research` | Query, linked facets, result list and comparison tray |
| `/research/:recordId` | Addressable detail; contextual drawer when opened from a workspace; full-page fallback on direct entry |
| `/research/compare` | Two to eight selected records, existing field matrix and differences |
| `/research/profiles/universities/:id`, `/research/profiles/specialties/:id` | Existing university/specialty summaries, not new institution directory |
| `/research/new`, `/research/:recordId/edit` | Existing local create/edit capability |
| `/insights` | Existing metric views and filter drill-through |
| `/research/import`, `/research/export` | Staged upload and scoped download within Research Operations; export may be a route-backed dialog |
| `/governance/:section` | Existing quality, duplicate candidates, queue, roles/audit, synonyms, dictionary and handoff sections |

Specific static routes must resolve before `:recordId`. Route guards use the demo policy to control presentation; the demo selector must be labeled “Demo role,” not login/account authentication. A route guard cannot protect data that is already in the browser.

Retain a background location for contextual detail and restore focus/scroll on close. A direct detail link has its own page fallback. `Back` reverses navigation/filter changes predictably. Hash links from the supplied prototype can be parsed once through a legacy codec; do not require continued use of ambiguous raw display names in new URLs.

## 4. Domain and data models

Treat the HTML as evidence of actual data, not an idealized normalized schema. Preserve an immutable source fixture and map it into typed domain objects. Maintain reversible mappings for export compatibility. A field's presence does not make its contents verified.

| Entity/value | Actual HTML representation | Proposed domain treatment |
| --- | --- | --- |
| Research record | `P`: `id`, `rid`, `title`, `title_en`, `abs`, `abs_en`, `researcher`, `co`, `gov`, `city`, `uni`, `faculty`, `dept`, `spec`, `branch`, `type`, `year`, `status`, `kw`, `url`, `ex`, `audit` (L128–135, L304–306) | Stable internal `RecordId`, distinct human-facing `researchId`, localized content, nullable fields, reference IDs where resolvable, raw legacy values retained when unresolved. Do not synthesize missing abstracts/translations. |
| Academic affiliation | One university name, faculty, department per record | Single current affiliation; university display remains the current demo type. A reference schema can later add organization types without introducing hospital/lab UI or fixtures now. |
| Contributors | Main researcher text plus comma/Arabic-comma separated co-researchers | Ordered `ContributorName[]` with role and original text. Names are not unique identities; no ORCID or verified profile invented. |
| Geography | 14 `GOVS`, 22 `CITIES`, projected SVG `GEO` paths, record gov/city labels (L109, L116–117) | Immutable governorate ID; explicit city ID and governorate relation; coordinates carry `source: supplied-prototype`, verification unknown. Academic-location aggregation only; no inferred fieldwork sites. |
| Taxonomy | `UNIS`, `SPEC`, `TYPES`, `CATS`; custom values in `p.ex` (L118–120, L133, L276–277) | Separate versioned university/specialty/branch/type catalogs. Custom-field metadata includes code, label, description, declared type and allowed suggestions. Current values remain strings. |
| Status | `draft`, `entered`, `review`, `approved`, `published`, `rejected` (L121) | Closed status union plus explicit unknown-value diagnostic at import/storage boundary. Actual queue transitions are narrower than the six-state label sequence. |
| Audit entry | Date-only string, role/name text, action string; array per record | Preserve as editable local demo history. Structured event type may include action code and comment for new demo events; no claim of verified actor, immutable log or legal proof. |
| Synonym concept | `CON` pairs of concept and term arrays (L312–324, L354–355) | Typed concepts; normalization and matching separate from labels. No trained model or remote AI request. |
| Import batch | `STG`: filename, headers, raw rows, column map (L282–308) | Stage ID, schema version, mapping, row diagnostics and commit plan; only staged data persists until explicit commit. |
| Analysis result | `SM`: record, numeric score, string reasons | Record ID + score + reason codes; parsed constraints captured with query snapshot. Recompute after data/role changes. |

Reference identifiers in `refs()` (L328–333) are generated from array positions, not a persistent identity service. Freeze a checked-in ID mapping for the supplied fixture; allocate IDs once when adding a local university. Do not regenerate IDs by sort order. Leave unknown references explicit and surface quality warnings instead of inventing links.

Custom field declarations currently offer select/text/number/date/multi, but `openForm()` renders every custom value as a text input with datalist (L269). Metadata storage and value filtering are demonstrated; strict typed/multi-value authoring is not. The initial adapter must accept the actual string representation. Enforcing new field semantics is a separately documented correction decision, not a silent migration.

## 5. Canonical query, derived data and state ownership

The existing HTML combines `F`, `SM`, `CMP`, map globals and mutable `P`. `upd()` rebuilds almost every surface and writes URL hash/localStorage (L138–153, L216–218). Replace this with explicit ownership:

| State | Owner/lifetime | Contract |
| --- | --- | --- |
| Canonical filters | Typed URL query, parsed once into query store | `q`; scalar governorate/city/university/specialty/branch/type; `years[]`; year bounds; keyword substring; one category/value pair; researcher input documented as an existing no-op, with the explicit repair default in Q02 and Phase 4. Preserve the actual scalar facets; do not add PRD multi-select sectors/status filters. |
| Assisted search | Shared session store; not initially serialized in share links | User-submitted query and deterministic interpretation; results intersect ordinary filters. Preserve the source sharing boundary and disclose it (Q08); encoding the assisted query requires an explicit later decision. Never serialize cached scores as truth. Clear assisted search independently or with reset-all. |
| Comparison | Shared session store | Ordered unique record IDs, max eight, enabled at two. Retain across workspace/filter changes; revalidate visibility on role change. |
| Record data/references | Repository snapshot with revision | Mutations produce a new revision; all selectors recompute from that revision. |
| Theme/locale/demo role | Versioned local preferences | Persist explicitly, independent of query; role affects accessible subset. All are browser-local demonstration preferences. |
| Map viewport/layers/thresholds | Explorer view state | Separate from data query. Filter reset does not implicitly imply viewport reset; explicit map reset does. Preserve across workspace navigation in session. |
| Import/form state | Feature session; saved stage in persistence | Draft form must not overwrite catalog until Save; import has explicit commit. Navigate away with dirty-state warning. |
| Dialogs, hover, collapsed groups, loading/error | Local feature state | Never embedded in product data or stored as authoritative query state. |

Build one selection pipeline: `validated snapshot → role-visible records → ordinary filters → optional assisted-search intersection/rank → canonical result set → map/list/insight selectors`. Counts and export use exactly this result set. Facet options exclude their own facet predicate while retaining all others; preserve and clearly show selected unavailable values. Search normalizes Arabic orthography/diacritics like `nz()` (L140), without modifying display/source text. Whitespace query terms use AND substring matching; year selections are OR within the field and AND with inclusive year bounds (L143–152).

Important exceptions/defects must remain visible in the backlog:

- `F.res` is written by the researcher/co-researcher input but is never tested in `match()` (L143–151, L201–204). It is not a working independent researcher filter. The documented Q02 default and Phase 4 backlog connect it as an explicit defect repair with tests; ordinary text search already searches contributor names. Keep the source defect and repaired behavior distinguishable in acceptance evidence.
- `smart()` is deterministic Arabic-oriented synonym/rule matching. A zero-match assisted search currently resets `SM=null` and reveals ordinary results (L326). Proposed UX keeps the zero-result state and reports it; this corrects misleading feedback within the existing search capability.
- `profile()` uses all role-visible matching university/specialty records, ignoring current `F` (L255–260). Preserve an explicitly labeled “all accessible records” profile scope, with the existing action applying that entity to the current query. Do not silently show filtered figures under an all-records label.
- Governance quality/duplicates/review operate on all `P` (L340–347), not the discovery subset. Label operational scope and restrict presentation using the demo policy.
- Current hash parsing happens only on initialization (L383); it does not restore state on browser hash navigation. The new router must handle URL changes as state input and avoid history-update loops.

Use discriminated actions such as `setGovernorate`, `setFacet`, `toggleYear`, `setYearRange`, `clearFilter`, `resetAll`, `submitAssistedQuery`, `setDemoRole`. The reducer clears dependent city selection on governorate changes. A query parser validates allowed keys, reference IDs, year values and sizes; unsupported values generate a recoverable notice. Share only reproducible query state; local edited data cannot be reconstructed by another user's URL. Comparison/record links do not imply access to another browser's local catalog.

## 6. Data access, persistence and operations

Define interfaces in `data/contracts`, with a local demo implementation now. Recommended contracts: obtain research snapshot, get visible record, create/update record, apply an allowed demo transition, load/save references and synonyms, stage/validate/commit imports, and read local audit. Phase 2 establishes the contracts and local snapshot/persistence substrate; authoring commands become executable in Phase 4 and import/governance commands in Phase 6. Accept `QuerySpec` and `DemoAccessContext`, return typed results with revision, source kind and diagnostics. File parsing/downloads are separate adapters, not methods on view components.

Components receive view models or call feature hooks; they must not read localStorage, invoke SheetJS, inspect `P`, manipulate DOM or calculate permission policy directly. Repository functions and pure selectors can be synchronous internally, but feature hooks should expose pending/success/error contracts suitable for an asynchronous adapter later. Do not mock a working server endpoint or claim API integration.

Use versioned storage keys and validated envelopes (`schemaVersion`, `revision`, `savedAt`, `data`). Load errors, unknown schema versions, quota failures and denied storage produce explicit recovery/read-only states. Never toast “Saved” after a failed storage write; current `sv()` silently swallows failures (L113). Keep last valid data; do not replace corrupted data with a fresh seed without user-visible recovery. Persist all related changes in a single coherent envelope where practical; a partial import cannot claim full completion.

The exact 150 seeded records are synthetic (`mkSeed`, deterministic seed 11, L128–132). Preserve them as supplied examples with a visible “Sample dataset” notice; store fixture version, not official national freshness. Do not manufacture new institutional counts, verification marks or coverage denominators. Keep role/privacy warnings in exported demo data documentation.

Mutation semantics:

- Create/edit currently require title and main researcher; import errors currently require title, recognized governorate and four-digit supplied year, while other problems can be warnings (L272–275, L286–290). Quality `REQ` differs again (L334–335). Model these three rule sets explicitly; do not silently make every quality warning a blocking validation error.
- Import mapping/preview/commit uses first XLSX worksheet or CSV/TSV parsing. Retain clean/warning/error classification, include-warning choice, imported status choice, admin-only add-university option, resume/discard and generated batch audit. Revalidate immediately before commit against current revision. A repeated new upload is not idempotent in the HTML; the local prototype only warns about duplicates, so do not claim transactional server/idempotency guarantees.
- Escape displayed values; validate URL schemes to `http:`/`https:` before rendering source links. HTML escaping alone does not block `javascript:` URLs (L253).
- CSV/XLSX output must treat untrusted cell values as data and protect against spreadsheet formula interpretation. Preserve Unicode/BOM behavior and quote delimiters/newlines. File size/row limits and parse failures must be explicit configurable implementation limits, never silently truncate committed records.
- JSON `exportData()` currently serializes entire records, including local audit/status/custom values (L309–310). Define exact demo format and disclosure; a production public export would require a server-authorized projection, which is future work.

## 7. Demo permissions and review transitions

Centralize `can(context, action, record?)` for UI consistency and invoke it in local command handlers as a defense against accidental UI paths. This remains a simulation: users possess the data and can alter JavaScript/localStorage or switch the role selector. Never describe it as security, institutional scoping or authenticated users.

Actual prototype checks: viewer discovery shows published records only (`visible`, L142); editor/admin create/import; admin/reviewer governance; admin custom-category creation; editor/admin edit; admin/reviewer direct approve/publish. The documented `PERM` table (L338) is not executable enforcement. In particular, opening the governance shell gives reviewers synonym editing; queue transitions are offered broadly inside it (L348–355), and direct form status options can bypass the narrated linear workflow. These discrepancies require explicit decisions recorded in [open questions](06-open-questions-and-assumptions.md).

A safe demo default is central consistent presentation aligned with the displayed permission matrix, with exceptions documented, while retaining all demonstrated actions somewhere authorized. Do not add user accounts, organizational ownership, reviewer assignment, draft submissions dashboard, change-diff review or policy rules absent from HTML. Preserve the demonstrated queue actions to `review`, `published` and `rejected` (rejection reason required), plus approved/published status values used in the form. The narrative six-step sequence is not proof of an enforced state machine.

Every detail, related link, profile, comparison, aggregate and export must derive from the current accessible snapshot. Changing demo role removes inaccessible comparison selections and closes inaccessible records. Current `openDet()` and `openCompare()` directly search `P` without visibility recheck (L229, L251); this is a confirmed simulation weakness, not a production entitlement design. Future APIs must enforce authorization independently at every endpoint, but implementing them is outside the demo scope.

## 8. Map integration

Separate three layers: geographic source data/projection; pure aggregation/layout; interactive renderer. `GEO` is a supplied projected SVG boundary set, not a verified official map source. Record its SHA-256 provenance through the sources manifest; geographic authority, license and coordinate accuracy remain open. Do not add external geocoding or replace boundaries with invented shapes.

Preserve actual map behavior (L154–198): viewport zoom/pan/reset; governorate boundaries; levels at zoom ratios `<2`, `<4.5`, and `≥4.5`; governorate then city groups; displaced bubbles with anchor leader lines; top 12 record dots per city at deepest zoom; editable three thresholds controlling four colors; density blur; count-shading/zero mode; optional collaboration curves; cluster summary with top three universities/specialties and “Show projects.” Dots are radial layout around city clusters, not exact research locations. Bubble positions can be displaced, so never imply their visual centers are surveyed coordinates. University positions in collaboration derive from their reference city's coordinates (`upt`, L184).

Renderer props should be immutable: geometry dataset, viewport, aggregate nodes, available layers, thresholds, selection and locale/theme. Renderer events are intents: governorate selected, cluster inspected, matching records requested, record opened, viewport changed. The map does not own global filtering or call the research repository.

Keep geometry spatial coordinates unchanged under RTL; mirror controls/layout only. Bound zoom consistently, support keyboard buttons, preserve focus through redraw, and expose the same geography via list/table controls. Use ResizeObserver rather than rebuilding the full SVG for every window event. Memoize geometry and aggregates; isolate collision work and avoid the prototype's 120 pairwise relaxation passes on every unrelated update. Keep the original demonstration at its modest scale; evaluate a Web Worker or alternative renderer only after profiling larger candidate datasets.

Count-shading/“gap” and density layers show the current dataset, not national research absence or opportunity. Collaboration is a text-name coincidence heuristic (`collabLinks`, L185), not verified coauthorship. Preserve the demonstration with qualified labels. Verified author identities, organization map pins and evidence-qualified gap models remain future capabilities.

## 9. Metrics and visualization contracts

Each view consumes a common `AnalysisSnapshot` containing dataset revision, query summary, demo access context, record count, metric definitions and generated-at time. This time is local computation time, not a claim of source freshness. Reuse the selectors for chart and accessible data table to prevent divergence.

Preserve exact demonstrated metrics and their scope:

- `renderKpi()` (L208–213): result count, distinct university names, distinct raw main/co-researcher name strings, distinct governorates and latest year. The researcher count is not a deduplicated person registry.
- `renderDash()` (L238–245): year counts, top nine universities/specialties/governorates, top eight types/branches, top seven governorates with record and university counts; governorate × specialty zero matrix across the reference governorates and union of reference/current specialties.
- Profiles (L255–260): all-visible-record count, distinct main researcher names only, year extent, unweighted completeness mean, top five distributions, latest five records, name-derived university collaboration partners. Do not force profile and KPI author totals to agree when their definitions differ.
- Quality (L334–342): fraction present across nine `REQ` fields; explicit issues include unrecognized university/city affiliation, 1990–2026 year check, missing English title and short abstract. The hard-coded 2026 cutoff is prototype data logic, not national policy; expose a named demo rule/version and require a decision before changing it to current year.
- Duplicate candidates (L336, L343): normalized title token Jaccard ≥0.85 plus same university OR same main researcher. Human inspection only; no merge/delete/resolution workflow is implemented.

Chart interactions dispatch filter actions and navigate to matching research; the matrix and governorate comparison table currently have no drill-down. Do not imply every chart cell is interactive. Distinguish active controls from read-only metrics. Add textual difference indicators and legends so color is supplemental. Print uses the Insights view and print-specific CSS; wait for render completion instead of the current arbitrary 300 ms delay (L369).

## 10. Design system, theme, localization, responsive layout and motion

Token hierarchy: primitive palette/spacing/type scale → semantic surface/text/border/action/status/data tokens → component tokens only where justified. All workspace components use semantic tokens; chart palettes, focused map regions and status indicators participate in light/dark themes. Do not copy the prototype's fixed layout or raw hard-coded overlay colors as design rules. Specify focus/hover/selected/disabled/error states, contrast and print appearance in Phase 2.

Theme preference is `light` or `dark` to preserve the demonstrated switch; stored separately from the data. Supporting operating-system defaults can be an implementation convenience, not an additional user-facing settings module. Set the chosen theme before first paint, handle unavailable storage and preserve readable chart/zero-cell contrast in both modes. Respect `prefers-reduced-motion` regardless of theme.

Language is Arabic-first, English-switchable. Set document `lang`/`dir`, use CSS logical properties and `bdi`/explicit LTR isolation for URLs, IDs and English fragments. Keep domain IDs and values independent of translated labels. Titles choose supplied English then fallback to original; do not fabricate translations. Preserve entered names and university labels if no English source exists. Format numbers/dates with `Intl`; document the numeral choice as a configurable presentation default, not a new preference screen. Avoid the current `lang()` mutation of already-translated option text (L378–380), which loses the alternate label on subsequent toggles.

Responsive contract: one shell, same actions/state on all sizes; viewport/container-driven compositions rather than separate mobile business logic. Map and result list may alternate in a small-screen workspace while retaining selection/viewport. Filters become a labeled drawer; detail uses a full-height sheet/page; compare and data tables have explicit overflow and persistent row labels. Chart tables remain available without hover. No hidden desktop-only import or governance action. Specific breakpoint values are chosen from content fit in Phase 2 and tested with Arabic, long English titles, zoomed text and the widest existing comparison.

Motion is a small shared token set for entrance/exit, disclosure and selection. Animate transforms/opacity, not numerically interpolated research claims. Reduced motion removes nonessential movement and map zoom animation. No autoplay timeline, animated stories or invented insight transitions. Focus and live-region announcements follow completed state changes, not animation timing.

## 11. Error handling and verification architecture

Use route/workspace error boundaries for unexpected render failures and typed recoverable errors for data operations. Error states identify scope and retain the last valid query. Local storage unavailable → explicit unsaved/read-only warning; parse error → filename/row diagnostics; invalid row → uncommitted; unavailable spreadsheet dependency → CSV fallback; clipboard rejection → visible copy fallback, not false success (current `bShare`, L372); missing/inaccessible record → explanation and return path; unknown reference → displayed raw value plus diagnostic, not a crash. Never swallow rejected promises or show raw exception data that contains private file content.

Testing is feature-driven rather than mirroring components:

| Level | Required meaningful cases |
| --- | --- |
| Domain | Arabic normalization, AND search, linked facet exclusion, OR years plus range intersection, role-visible counts, assisted rank/reasons and zero-match behavior; related top-four rule; comparison bounds and differences; metric formulas and duplicate threshold boundaries. |
| Data/import | Quote/newline/BOM/Arabic-comma CSV cases, first-worksheet XLSX, mapping omissions, unknown geography, warnings toggle, duplicate warnings, commit-only mutation, resume/discard, storage failures and schema-version recovery, Unicode exports and formula/link safety. |
| Integration | Same query yields equal map/list/insight counts; mutating data invalidates selectors; all filters reset including assisted query; role change revalidates detail/compare/export; profiles show explicit all-visible scope; route Back/Forward restores query. |
| Browser | Governorate→city→records flow; search→detail→profile→filter; select 2–8→compare; authoring save/error; import stages with actual download/upload; dashboard drill-through and print; each governance action, synonym persistence, university/custom-field addition, handoff downloads; theme/locale round trips. |
| Accessibility | Keyboard-only main tasks, focus return/trap, SVG/non-map parity, headings/landmarks, toast announcements, chart tables, reduced motion, RTL/LTR at narrow widths and enlarged text; automated axe plus manual checks. |
| Baseline performance | Supplied 150-record fixture, repeated filter/zoom interactions, long titles and 8-column comparison; profile before adding workers/virtualization. Larger workloads are exploratory measurements, not unverified production SLOs. |

Phase 2 establishes test infrastructure and foundation checks without building complete workspaces. Later phases add meaningful tests for their actual capabilities. Use deterministic source fixtures with explicit sample labeling; store test downloads/current-run results separately from product data. CI must include build, strict typecheck, domain/integration checks and representative browser flows. Document failing, skipped and unrun outcomes separately; accessibility tooling is not WCAG certification.

## 12. Expansion paths without current scope expansion

| Future change | Extension seam | What remains unimplemented now |
| --- | --- | --- |
| New platform sections | Route manifest, workspace shell contracts, lazy-loaded feature entry points | No empty menu items or speculative pages. |
| Additional research categories/attributes | Versioned catalogs/custom-field definitions; filter registry with typed predicates and serialization | No new sectors, filters or hard-coded national classifications. |
| Broader institution types | Reference entity ID and optional type/hierarchy metadata; adapters preserve current university label | No hospital/lab inventories, coordinates or profiles. |
| More charts | Analysis selector + metric metadata + shared chart/table frame | No invented metrics, forecasts, funding or opportunity scores. |
| Larger datasets | Query/repository boundary, derived selectors, worker-ready pure analysis, renderer boundary | No assertion that all-browser filtering or quadratic duplicate checks scale nationally. Server pagination/aggregates and indexed search require a later implementation. |
| Real APIs/databases | Replace local repositories with authenticated API adapters; DTO/domain mapping; request cancellation and revision-aware results | No working endpoints, database deployment or migration system. HTML `sqlPack()` is a downloadable draft string, not a deployed schema. |
| Real permissions/workflows | Central action vocabulary and policy boundary, structured future transitions | No authentication, institutional scope, immutable audit, multi-user concurrency or legal approval mechanism. Backend must enforce every operation later. |
| Consistent design evolution | Semantic tokens, shared patterns, locale catalogs, module ownership and tests | No one-off workspace themes or duplicated domain formulas. |

Before crossing into production: define approved institution/researcher identities, geographic source rights, public-field projection, source provenance/rights, workflow authority, backend authorization, audit integrity, data retention and measurement methodology. Those are future design/security/data decisions, not blockers to the clearly labeled local demo foundation. The existing SQL download can be preserved as a handoff artifact while explicitly marking it unreviewed and incompatible with claims of deployed infrastructure.

## 13. Phase 2 implementation contract

The next session can independently establish the foundation by following [Phase 2 in the roadmap](05-implementation-roadmap.md): initialize the selected stack; pin dependencies and tools; create the module boundaries; preserve source fixtures; define typed models, query codec and selectors; introduce versioned local repository interfaces; implement shell/primitives/tokens/RTL/theme patterns and foundation tests. It must not silently expand into the complete map, workspaces, dashboard or governance implementation.

Exit evidence: build/typecheck pass; domain/query fixtures validate; both locales and themes render the foundation; route history and error states work; module imports obey boundaries; storage errors are observable; sample-data and demo-role labels are present. A design review and the outstanding assumptions determine later feature work. Phase 2 is recommended and specified here, not started or authorized automatically.

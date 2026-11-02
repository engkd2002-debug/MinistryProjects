# UX architecture and behavior contracts

Phase 1 · decisions for later implementation; no screens designed here.

## Evidence, status and scope

The current baseline is the [preserved HTML](sources/syria-research-observatory_v2_prototype.html), with exact handlers documented in the [feature inventory](01-feature-inventory.md) and [traceability matrix](07-functional-traceability-matrix.md). Source line numbers below refer to that file. The PRD's principles of shared query, accessible Arabic, evidence before spectacle and explicit uncertainty guide these decisions. Its additional metrics, identity models and policies are not current requirements.

**Observed** means visible in source behavior; **proposed** means a same-scope UX/engineering improvement for implementation. Accessibility and responsive recommendations below are acceptance goals, not claims that the supplied prototype complies. Runtime evidence is documented separately by the main audit.

## Decision record

| Decision | Reasoning | Consequence and scope guard |
| --- | --- | --- |
| UX-01 · Three stable primary experiences | Exploration, record work and analysis require different attention; the current map/dashboard takeover obscures orientation | Route changes replace task context while retaining the query. No new overview module or extra product functionality is needed. |
| UX-02 · One canonical research query | `upd()` already updates list/KPIs/map/dashboard from shared `F`/`cur()` | Every primary experience shows the same active constraints and result count; profile/governance exceptions must be labelled. |
| UX-03 · Separate query, viewport, record focus and comparison | Current `F`, `V`, detail modal and `CMP` represent different intentions | Map zoom never changes query; opening detail never clears comparison; filtering never silently deletes selections. |
| UX-04 · Geographic summaries lead to research | Cluster details are useful orientation before a user commits to filtering | Bubble click previews; “Show projects” applies scope and leads to Operations. Governorate path click continues to directly filter. |
| UX-05 · Counts describe registered demo records | Seed records, gap cells and researcher-name links do not establish national facts | Label dataset/scope, disclose formulas/limits, distinguish zeros from unknown coverage. Do not add invented coverage percentages. |
| UX-06 · Contextual detail with a route-capable equivalent | Reusing one modal for records/profiles/edit/governance loses task and return context | Reusable detail content can appear in a contextual panel and full route. Import/edit use focused tasks; no stack of nested dialogs. |
| UX-07 · Transparent local smart assistance | `smart()` is synonym/keyword scoring, not AI retrieval; it intersects canonical results | Explain matching and active scope. Do not represent scores as confidence or scientific quality. |
| UX-08 · Role simulation remains explicit | UI disabling and local role storage are bypassable and inconsistently applied | Fix internal visibility leaks and label demo roles; do not imply login, institutional scoping or server security. |
| UX-09 · Semantic, bilingual interaction primitives | Source uses clickable headings/divs/SVG dots and partial translations | Build keyboard/focus/label behavior once in the foundation and reuse across all modules. Arabic and English change presentation, not identity. |
| UX-10 · Feedback reflects completed operations | Source claims clipboard success without awaiting and swallows storage errors | Confirm actual outcome; preserve input and offer retry when an operation fails. Do not silently substitute data or formats. |

## Information hierarchy and cognitive load

Use a consistent task hierarchy: workspace title and purpose → query scope/count → primary content → contextual detail/actions → advanced tools. Research titles and useful metadata take precedence over administrative identifiers in scan views; identifiers remain available in detail/comparison/export. Record status and local-save meaning are explicit where authoring/review is involved.

Filters need human-readable labels rather than raw state keys. A chip identifies its field and value; its removal button says which constraint it removes. The current source gives removal buttons only `aria-label="x"` (L213), so the new primitive must provide meaningful names. Preserve user input while recalculating dependent facets rather than recreating a focused field and moving the caret. Counts and result updates must not trigger repeated visual jumps or excessively verbose announcements on every keystroke.

Advanced facets, category filtering, smart assistance, overlays and reference administration are separate disclosure groups. Opening a disclosure does not apply a filter. The prototype's filter “Apply” mainly refreshes and collapses controls while inputs already apply live (L364–366); proposed behavior is consistently live application with a clearly labelled close/done control, or explicitly draft-and-apply if chosen later. Do not show an Apply button that falsely suggests uncommitted state. Default recommendation: retain live filtering and remove this ambiguity without changing filter logic.

## Navigation, orientation and return behavior

Primary navigation uses the exact three experience names from [information architecture](02-information-architecture.md). Provide a visible active destination, semantic page heading and a predictable browser back/forward contract. Route navigation moves focus to the new main heading; switching context within a workspace preserves meaningful focus. Changes to query are reflected in the address consistently; text typing should replace the current history entry, while a deliberate navigation/drill-down may create one. The source sets `location.hash` in `upd()` and has no hash-change listener (L216, L383); browser history restoration is a proposed robustness improvement, not existing behavior.

Detail/profile/comparison opened from research or a map keeps its return query, scroll and viewport. A route opened directly has a clear destination to the parent workspace. A missing/inaccessible record receives an explicit state; do not fall back to an arbitrary record. Following related research replaces the current detail context with a back path rather than opening another modal. Close returns focus to its invoker if that element still exists, otherwise to the relevant result or main heading.

Supporting governance routes carry their own title and all-records scope. The research query can remain stored but must not appear to filter governance tables. The current `gov()` uses `P` directly; profiles and related research use all role-visible records (L250, L255, L340–346). Keep these deliberate scope distinctions visible.

## Map interaction contracts

1. **Selection and preview are different.** Governorate path click toggles the governorate query and clears city; bubble click previews a summary; “Show projects” commits that node's geographic query. The map background clears geographic filters; provide an explicit clear-geography control with the same semantics for non-pointer users. It must not clear specialty/year/search.
2. **Viewport has independent controls.** Zoom buttons/wheel and pan change `V` only. Reset viewport returns to national extent and leaves query intact. Display current grouping level. Do not automatically pan on every query keystroke; use explicit geographic drill-down for the source's fit-to-governorate behavior.
3. **Coordinates require careful labels.** `nodes()` uses governorate reference points/city coordinates; a collision loop moves bubbles and draws anchor lines (L161–179). Level-3 dots orbit city bubbles and show only the first 12 records. Label these as grouped record access, not exact research locations. Institution-specific verified geospatial data is absent.
4. **Legend meaning stays stable.** Bubble size denotes relative record count in the current view; thresholds control colors. State current thresholds and ranges; reject negative/non-finite/unordered threshold input with an inline message rather than allowing contradictory legends. This is input integrity for an existing control, not a new metric.
5. **Overlays stay optional and independent.** Density is a blurred visual count proxy; gaps color governorates by current counts; collaboration reflects shared normalized names across universities and excludes same-location/unknown-location edges. Explain these limits beside the mode. Never call gaps “research absence,” links verified co-authorship, or heat geographic scientific quality.
6. **Pointer and keyboard alternatives agree.** Governorate/city selectors and research results provide access without map gestures. Interactive paths/bubbles need button-like semantics, names, current selection and Enter/Space activation; record dots need accessible record names and keyboard activation. The current dots have `tabindex` and a click handler but no key handler (L179). Keep decorative geometry out of the accessibility tree.
7. **Do not trap touch/scroll.** Contain map gestures within its surface; preserve document scroll outside it. Zoom controls provide an alternative to wheel/pinch. A new pinch gesture is not required by verified scope; existing pointer panning and buttons must work reliably on touch targets.

## Discovery, smart search and filters

Canonical filter constraints combine as intersections. Basic text search normalizes Arabic variants and requires all whitespace-separated terms in its indexed fields (`match`, L143–151). Do not silently change it to fuzzy/semantic matching. Multi-year choices are one constraint; a year range intersects those choices. Show contradictory ranges/years clearly, validate range bounds and retain a route to clear the offending constraint.

Linked facets must retain selected values visibly even when the current combination yields zero records. Changing governorate clears an incompatible city with brief feedback; changing another facet must not silently drop unrelated constraints. Built-in/custom category filters keep category identity separate from selected value. The researcher's standalone field is currently inert because `F.res` is never read by `match`; label this as a source defect in implementation planning. Enabling its advertised main/co-researcher filter is a bounded repair proposal, not a verified feature. Do not silently add all PRD canonical-filter fields.

Smart assistance is a separate mode with explicit query, parse summary and candidate explanations. Its results intersect other filters and sort by the source's score. An English interface does not make the Arabic-heavy parser fully bilingual. The existing examples remain examples, not new claims about supported language understanding. Display local matching and ranking limitations.

The current no-candidate handler sets `SM=null`, so the page returns to ordinary results despite a “No matches” toast (L326). Proposed repair: keep an explicit empty smart result set and show “No smart-search matches; clear assisted search to return to ordinary results,” without automatically broadening the query. An empty parse/explanation clears with the query. The source's parsed constraints are explanatory strings, not independently editable structured chips; editable semantic parsing is excluded.

Results load in 25-record increments. Preserve loaded count and scroll on return from detail; query changes start at the first increment. “Show more” has a clear remaining count and appends without stealing focus. No free-form sorting requirement is introduced; ordinary source order and smart rank remain the two existing order modes.

## Record details, profiles and comparison

Detail presents the existing title(s), main/co-researchers, academic/geographic metadata, type/year/status, custom values, abstracts, keywords, optional URL, related records and audit entries. Missing English titles fall back to Arabic; missing optional fields show an explicit unavailable value, never fabricated content. An optional research/PDF URL opens safely in a new context with that behavior communicated; it is a link, not hosted full text. Record status is registration workflow metadata, not peer-review/scientific validity.

University and specialty profiles expose their existing aggregate count, unique main-researcher count, period, completeness, top categories, latest five records and university collaboration partners where present (`profile`, L255–260). Profile “researchers” differs from the global KPI that includes co-researcher strings; disclose the definition. A university profile is derived from the research dataset and reference city, not an authoritative institutional directory. Profile filter action modifies the same research query.

Comparison maintains 0–8 selected authorized records across all three experiences. Minimum two records enables opening. Off-query selections remain visibly marked so filtering does not lose work; role changes remove inaccessible IDs before rendering and report the removal. The source does not recheck `visible()` in `openCompare` or `openDet`, so this is an essential same-scope repair, not production authorization.

The matrix retains the source's 12 comparison fields and difference count. Use row/column headers and sticky identifier context for horizontal scrolling. Difference indicators include a text/semantic cue; color alone is insufficient. On narrow viewports use an independently scrollable matrix or sequential record columns with the same fields and selection; do not reduce the limit to two. No methodological quality scoring, ranking or export of comparison is invented.

## Dashboards and analytical interpretation

Every chart states measure (registered record count), dimension, current query and top-N truncation. Directly label values and provide readable data text/table alternatives. The year series contains observed years; do not invent interpolated years or growth values. The governorate comparison counts projects and distinct university strings. The matrix spans reference governorates and configured/discovered specialties, so zeros may result from filtering as well as the demo dataset.

Only existing bar/year targets drill down. Their accessible labels identify the resulting constraint. Selecting one updates the canonical query and leads to matching research; returning to Insights preserves that constraint. Static governorate rows and matrix cells have no invented click action. A completeness percentage belongs to the existing profile/governance calculations; it must not become a scientific quality or reporting-coverage indicator.

Print report contains the same current dashboard values, scope and demo disclosure. Do not print interactive controls or rely on hover to reveal essential values. Report generation does not imply PDF download: the existing action invokes the browser print facility.

## Forms, governance and data-heavy operations

Use consistent labelled fields, required cues, inline validation and a persistent task title. The source save gate only requires title/main researcher and defaults year; displayed dictionary requirements are stricter (L261–275, L333–337). Do not claim an approved national submission policy. Keep a clear distinction between blocking form validation, import validation and quality warnings; unresolved policy remains in [open questions](06-open-questions-and-assumptions.md).

Custom categories store name, description, declared type and allowed values, but all render as text inputs with datalist suggestions (L269, L276–277). Preserve this current capability and metadata; typed/date/multiple-value enforcement is an unresolved enhancement rather than a working form feature. Labels should not promise selection/type validation that is not performed.

Import is a four-stage task with an explicit local commit boundary: file → column mapping → validation → review/commit. This is not a claim that the source has transactional persistence. Show current stage, filename/row count, accepted/warning/excluded totals and return actions. Preserve mapping on Back. Stage validation does not write records. Confirmation clearly states which warning records and import status are included. Prevent double commit while local saving completes; preserve staging/input if failure occurs. Display actual first-sheet limitation for Excel, map aliases, and file/parser errors; staging is browser-local and has storage limits. Discarding a saved staging batch requires clear intent and feedback because it removes recoverable work. Do not add a background ingestion service.

Export states whether it covers filtered research, all audit entries, references or handoff records. Files with different scopes must not share a misleading generic “export current results” label. Confirm actual filename/format. Spreadsheet-library failure leaves CSV/JSON available, with an explicit notice. Imported or external text must render as text and external links use validated schemes; users should not be exposed to executable markup or dangerous formula interpretation through routine exports.

Review queue preserves the source's actions (send to review; approve/publish; reject with reason). It must not advertise a strictly enforced draft→entered→review→approved→published lifecycle when any non-published row can take these actions. Show before/after status and reason requirement. A backend workflow and institution-level policy remain future work. The duplicate tool identifies candidate pairs only; no merge, deletion or resolved-state control exists. Synonym reset affects local search behavior; explain its effect before reset. University additions append references; editing/removing references is outside the source.

## Shared states and feedback

| State | Required behavior for existing capability | Evidence limit/guard |
| --- | --- | --- |
| Initializing/loading | Keep shell orientation, identify records/geometry or file parsing as loading, disable only dependent actions, announce completion once | Current data is mostly synchronous; asynchronous-ready behavior is foundation robustness, not a new API. |
| No matching research | Show active query/count=0 and targeted clear actions; map/chart empty states use the same scope | Do not regenerate seed data or remove constraints to manufacture results. |
| Zero map/matrix count | “No registered records in this dataset and filter scope” | Reporting coverage is unknown; no opportunity/absence verdict. |
| Missing optional content | Mark unavailable link, English text, profile dates or relation as absent | Never generate missing abstracts/statistics. |
| Inaccessible/missing record | Explain that it is unavailable in current demo role/data; offer return to workspace | Do not expose hidden metadata through comparison, URL or stale panels. |
| Invalid form/mapping/range | Keep entered values; identify field and correction; focus first blocking error on attempted submit | Warnings and blocking errors remain distinct. |
| Malformed local storage | Explain inability to load stored local data and offer deliberate recovery | No silent overwrite/reset of edited research. |
| Local storage write failure | Preserve unsaved form/staging in memory, announce save failed, allow retry/export where available | A toast cannot claim durable save. No cloud backup implied. |
| Clipboard failure | Await write outcome; give retry or manually selectable link | Source reports success even if rejected. |
| Library/font/network failure | Keep HTML-supported local functions available; identify unavailable XLSX support and actual fallbacks | No claim that external resources were verified offline. |
| Successful mutation/import/export | Announce actual result, record/batch/count where present; update dependent views once | Distinguish browser-local completion from server persistence/publication. |

## Accessibility and keyboard contract

Target WCAG 2.2 AA for the implemented demo experience, validated through automated and manual checks; this is a project quality goal, not a certification or an institutional policy. Use native buttons, links, selects and labels before custom interaction roles. Replace clickable headings with buttons inside headings and expose `aria-expanded`/`aria-controls`. Lists, tables and page landmarks have semantic structure; form help/error text is programmatically associated.

Keyboard flows cover navigation → filters → research → comparison → detail → return; map zoom/geographic choices; all import stages; review actions; synonym/reference tools; language/theme. No action depends on hover, drag, color or an unlabeled icon. Visible focus must meet contrast and remain unobscured by sticky bars/trays. Space and Enter activate button-like targets; Escape closes the top dismissible dialog/panel only and returns focus, rather than unexpectedly closing an underlying workspace.

Modal dialogs have labelled purpose, initial focus, focus containment, Escape behavior and return focus. Nonmodal contextual panels do not trap focus; their close control is discoverable. Dirty task dismissal must make loss clear without routine confirmation on read-only panels. Polite live regions announce result counts and operation completion; urgent errors use appropriate alerts. Avoid announcing every chart cell or toast repeatedly. Test screen readers in both interface directions, keyboard-only use, 200% text zoom and 400% browser zoom/reflow; charts and map geometry need textual equivalents.

## Arabic RTL and English LTR

Arabic is the first-run interface language. Use `lang` and `dir` at document level and logical CSS properties; reverse shell reading order and appropriate directional icons, while keeping geographic geometry north-oriented and numerical chart axes meaningful. English titles/abstracts, URLs, IDs, dates and mixed-script names use appropriate `dir`, `bdi` or isolation; do not mirror map coordinates or decimal strings. No arbitrary translation of record data or institution names is performed.

Keep stable translation keys and domain values independent. Store translation resources, not destructively translated option text. The source's role labels are translated in place and lose their bilingual alternatives after switching (L379), while governance/tab/dictionary content and smart explanations remain partially Arabic. The new foundation must support complete **interface** translations for existing controls, validation, metadata labels, empty states and accessible names, with content-language fallback disclosed. Persist language and light/dark preference independently; neither resets task progress.

Use `Intl` for display formatting with an explicitly selected locale; preserve machine-readable years/IDs/export values. Decide numeral preference with the product owner rather than hardcoding an official standard. Type should remain readable at Arabic line heights and at long English labels; no clipped primary actions.

## Responsive behavior

Define behavior by content pressure, not a device list. Wide layouts may show filters/content/context together; intermediate widths collapse secondary controls; narrow widths expose one primary content task with filter/detail disclosures and a clear route between map and research. This is a behavioral contract, not a screen layout prescription. Preserve identical query/action semantics at every width.

Maps retain usable height and controls without forcing a user through the entire result list first, unlike the source's small-screen stacking (L75). Filters and forms support touch-sized targets and single-column reading where needed. Comparison and wide analytical/governance tables scroll within labelled regions with persistent headers/context; other page content reflows without horizontal scrolling. Dialogs become full-viewport task surfaces where their content cannot fit. Action bars must not cover the last record, field or keyboard focus. Soft keyboard opening must leave focused inputs and save/next actions reachable.

## Theme and motion consistency

Semantic color roles cover surface, text, border, focus, interaction, selected, warning, error, success and chart series. Every theme must preserve contrast, distinguish selection from hover and retain text equivalents for status/differences. Hardcoded light backgrounds and invalid source CSS color concatenations are not reusable design tokens. Chart/map colors must maintain the same meanings between themes; gap/error colors cannot imply scientific validity.

Motion explains state change only: modest panel transitions, clear active navigation and restrained map updates. Respect `prefers-reduced-motion`, preserve focus and avoid animation on initial chart values that obscures actual counts. The source has no time-playback feature; motion architecture must not add one. Never animate a zero/empty condition into apparently meaningful data.

## Cross-workspace acceptance examples

- Select governorate and years in Explorer; Operations and Insights show identical canonical result counts. Opening/closing detail preserves map viewport and those filters.
- Compare two records, change specialty so one is off-query, and change workspace; both authorized selections remain visibly identified. Switch to viewer; unpublished selections and their detail are no longer rendered.
- Apply a university from its profile; research query changes. Reopen profile and clearly see its all-visible-records scope, not an unexplained mismatch with filtered counts.
- Run an unmatched smart query; the proposed empty state remains empty until cleared. No ordinary records are presented as smart matches.
- Change language/theme midway through import mapping; values, stage and selected columns remain. Labels/focus remain usable in both directions.
- Clear all filters; smart assistance clears, comparison and preferences remain. Reset map; query remains. Clear comparison; query remains.
- Simulate failed clipboard/storage/XLSX loading; feedback names the actual failed operation and no false success is shown.

Phase 2 implements and validates these shared primitives/state contracts using small fixtures. Complete Explorer, Operations, Insights and supporting workflows follow in their designated phases; none is implemented in Phase 1.

# Geographic interaction specification — Phase 3

This is the implemented behavior contract for `/explorer`, not a proposal for new scope. See [architecture](10-geographic-explorer-architecture.md) and [traceability](07-functional-traceability-matrix.md).

## Orientation and selection

The map is the dominant content region. A compact command row exposes Filters and Layers & legend. Scope chips stay visible above it. Map/list presentation is available inside the same region; a context rail on desktop becomes an explicitly opened drawer on tablet and bottom sheet on mobile. The result summary is disclosed below the map rather than dominating it with national-looking metrics.

| Action | Query effect | View / context effect |
|---|---|---|
| Select governorate path with pointer, Enter or Space | Toggle `gov`, clear `city`; preserve all other dimensions | Persistent selected boundary and refreshed location context; no automatic zoom. |
| Click blank SVG background | Clear `gov/city` only | Dismiss context; preserve viewport and other filters. |
| Inspect count bubble with pointer, Enter or Space | None | Preview location's matching count, top-three university/specialty strings and available cities. |
| Select a city in context | None | Inspect that city within the current query. |
| Show matching records | Atomically select inspected governorate/city | Focus location, show the matching-record list and close compact context. |
| Zoom to this location | None | Focus supplied governorate anchor at width `1000/2.6`, or city anchor at `1000/4.8`; preserve filters. |
| Close location context / Escape | None | Dismiss transient context; selected boundary/query remain. Overlay Escape first dismisses the active overlay. |
| National overview breadcrumb | Clear `gov/city` only | Reset national viewport and return to map. Other query dimensions survive. |
| Governorate breadcrumb above selected city | Clear `city` only | Keep governorate and other dimensions. |
| Reset map view / Home on canvas | None | Return to source national extent; layers and thresholds survive. |
| Clear all filters | Clear ordinary query dimensions | Keep viewport/layers/thresholds/visibility/theme/language. |

A previewed bubble is intentionally separate from query selection. Its badge states current filters apply; it never presents all-location totals while the map uses a restricted query. Nongeographic filter edits recompute the panel in place. A geographic URL change reconciles context to that selection. Closing a panel never silently clears filters.

## Viewport and input

- Plus/minus buttons use factor 1.5; wheel uses 1.25/0.8 around the pointer. Clamp width to 40–1040; preserve viewport aspect and pointer position. Reversed UI direction never reverses geography.
- Pointer drag starts after movement exceeds 4 px; captured pointer keeps the gesture coherent. Dragging suppresses an accidental geographic click. Touch uses the same pointer path, with `touch-action: none` on the map only. Pinch/multitouch zoom was not in the source and is not added.
- Focus the canvas and use physical arrow keys to pan 15% of viewport width/height; `+`, `=`, `−`, and Home provide keyboard zoom/reset. A disclosure opens direction buttons for mouse/touch users. West/east remain physical in both languages.
- All governorate, bubble and sample-record controls have descriptive names and keyboard activation. Off-viewport anchors/markers are removed from sequential tab order. A complete record list and geographic selectors provide alternatives to spatial interaction.
- Detail levels follow ratio `1040/width`: governorates <2; cities <4.5; records ≥4.5. The live level indicator cannot retain an obsolete label after empty filtering. Switching list/map preserves viewport and filters.
- Resizing recomputes screen-relative bubble layout; it does not reset zoom, geographic query or layers. Crossing the context-layout breakpoint closes the modal presentation while retaining the inspected location behind its explicit compact context button; resizing never opens a modal automatically. Bubble leaders explain any displacement from reference anchors.

## Filters and navigation state

The filter drawer explains live changes. Ordinary text, exact governorate/city/institution/specialty/branch/type selectors, researcher/co-researcher substring and keyword update the canonical URL immediately. “Done” closes the drawer; it does not commit a hidden second query. A year-range draft applies only after four-digit, ordered-bound validation. Multiple years are OR within years and AND with other filters, including range. Category/value is exact matching, not a separate result universe.

Linked facets exclude their own dimension while computing options; the current selected value remains available even at zero results. Only governorate/city dependency is automatically reconciled; the app does not invent institutional hierarchy rules. Chips identify each dimension and remove the corresponding canonical filter; removing governorate also removes city. Explicit category removal clears its value.

Both Arabic and English governorate labels are indexed by text search. Changing interface language therefore preserves the same matching IDs. This deliberately repairs the prototype's language-dependent governorate search. Researcher filtering repairs the audited inert control using the Phase 2 predicate; it does not replace or overwrite ordinary search. There is no assisted/AI search in Phase 3.

Workspace navigation carries ordinary query state. Refresh restores the query and browser preferences, while viewport/layers/thresholds start a fresh map session. Copy filtered link awaits clipboard success and reports rejection honestly. It promises filter transfer only; local records, demo role, viewport, layers and thresholds are not shared.

## Context and records

Location counts and top-three values come from exactly the same query-visible records as the map. Empty institution/specialty strings are not ranked as institutions or categories. City counts require supplied names, governorate membership and usable coordinates. Unknown cities remain explicitly unplotted and accessible in the complete list.

Matching records reveal 25 at a time with remaining count; changing record IDs resets the display batch. Enter/click opens a read-only preview with ID, localized title/abstract with original-language fallback, main researcher, institution, year, specialty, type, registered location and keywords. Keyword activation updates the ordinary keyword query and closes the preview. Safe HTTP(S) source links open separately. No edit, publication, profile, related-record, comparison or audit workflow is exposed.

The preview resolves against the current filtered/role-visible record set on every render. Losing visibility displays unavailable content rather than stale metadata. A record dot is an illustration, and at most 12 per city are displayed; it does not represent a verified institution or research-site coordinate.

## Layers and interpretation

| Encoding | Meaning | Required qualification |
|---|---|---|
| Bubble area/radius | Source square-root count sizing relative to current largest group | Numeric labels are actual matching counts; positions may be displaced. |
| Four bubble colors | Count class based on automatic or custom thresholds | No quality, need, priority or policy rank. |
| Concentration overlay | Illustrative blurred counts at supplied aggregate anchors | Not statistical density or fieldwork locations. |
| Positive distribution fill | Current governorate count relative to maximum | Based only on current browser dataset/query/role. |
| Hatched region | Ready dataset has no matching record in that governorate | Does not establish absent research; coverage remains unknown. |
| Dotted unavailable region | Repository loading/failed, counts unknown | Never converted into a zero count. |
| Curved university links | Distinct normalized name strings occurring under both university names | Inference only; known distinct city anchors, top 15 distant pairs. Accessible table available. |

Threshold fields reject zero, negative, fractional, nonfinite, duplicate or descending entries. Valid changes update colors only. “Use automatic thresholds” restores data-derived classes. Layer and legend explanations remain available when results are empty, while data-dependent layers and nodes disappear.

## Motion and responsive behavior

Map viewport transitions use 380 ms, ease-out, cancellable from the current displayed viewport. Direct drag has no added easing. Governorate selection/color changes use shared short tokens; marker/overlay reveals are opacity-based. Context uses the existing 260 ms direction-aware panel transition; mobile bottom sheets enter vertically. Captured evidence waits for both SVG viewport motion and finite CSS animations.

With reduced motion, viewport changes are immediate, CSS animations/transitions are suppressed by the existing token/media-query system, and every result/state remains understandable without animation. Infinite decorative motion is absent.

Desktop ≥1200 px uses a fixed-width context rail beside a flexible map. Below 1200 px context uses a modal drawer, with a persistent context action below the map. At ≤599 px it becomes a bounded bottom sheet, with independent scrolling, focus containment, Escape and focus restoration. Navigation follows the Phase 2 responsive shell. Filters remain a full-height logical-end drawer with stacked narrow fields. Map controls retain usable size and separation; the map is never proportionally shrunk into a desktop miniature.

## Data states and feedback

Loading shows an explicit loading indicator over unavailable geometry and no numbers. Repository failure shows `—`, a retry action and a statement that unavailable information is not zero activity; saved data is untouched. Valid empty results offer clear-all recovery and avoid an absence-of-research claim. Incomplete locations report unplotted counts and remain in the list. Summary's latest year is `—` for empty/unavailable results, never an invented year.

Counts are always identified as synthetic sample/query counts, not official national statistics. Demo role selection explicitly says it is local visibility rather than authentication. The default viewer sees published sample records; the other original roles expose all sample statuses. Clipboard and persistence failures are reported without optimistic success.

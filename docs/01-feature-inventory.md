# Phase 1 — Verified functional inventory

> React delivery status: the original audit below is preserved. See the [Phase 3 traceability annotation](07-functional-traceability-matrix.md#phase-3-delivery-annotation--2-november-2026) and [implementation report](12-phase-3-implementation-report.md) for the implemented Explorer.

## Authority, evidence and reading rules

The attached **HTML is the sole authority for current demo capability**. The PRD supplies design and architecture context only. No screen, application component or backend is implemented by this document. The target navigation is a proposal, not a requirement to retain the source layout.

Audited source: [preserved HTML](sources/syria-research-observatory_v2_prototype.html), SHA-256 `3ec5d7338ce583e643ec3d1c7fec0566a0238959abcd451e42a29af9c88da44c`. References below use original, one-based **HTML line numbers plus function/control names**; long minified data lines remain unchanged. All source scripts, inline event properties, generated controls, lifecycle wiring and data dependencies were inspected. Static source verification establishes what code attempts; browser observations are separately documented in [runtime results](evidence/runtime-results.json), produced by the [audit harness](evidence/runtime-audit.cjs), with screenshots under [evidence](evidence/). A browser/native dialog/download that was not executed must not be reported as tested merely because a handler exists.

The [functional traceability matrix](07-functional-traceability-matrix.md) maps **all 48 feature groups**, including nonworking controls and sub-actions, to owners, implementation phases and observable acceptance checks. It is the implementation coverage checklist. Preserve user capabilities and intent; correct documented defects rather than reproducing misleading behavior. Those corrections are same-scope UX/engineering work, not new services.

Status vocabulary:

- **Functional (local):** an actual client-side action/transformation exists. This does not imply authenticated access, durable multi-user storage, authoritative data or successful external network delivery.
- **Simulated:** useful demo interaction exists but stands in for a production mechanism, such as an identity or approval authority.
- **Partial:** a handler exists but has important missing paths, inconsistent state or incomplete semantics.
- **Visual-only:** presented information/decorations have no action; do not invent one.

Role notation: **A** administrator, **R** reviewer, **E** editor, **V** viewer. These are editable browser values, defaulting to A (`ROLE`, L113); they are not verified users. “All” means all four demo roles can reach that surface through normal controls unless noted. `visible(p)` (L142) limits V to published records; all other roles see every status. Normal button gating is described separately from bypassable underlying functions.

## Data and state baseline

| Item | Verified source behavior | Implication |
| --- | --- | --- |
| Seed | `mkSeed`, L127–131 creates 150 deterministic records using seed 11, 17 topic templates and 2019–2026 years; randomly assigned names, institutions, types and statuses. | All displayed counts, trends, connections and gaps describe demo records. None are official Syrian statistics or measured research coverage. |
| Reference dictionaries | 14 `GOVS`, 22 `CITIES`, 15 initial `UNIS`; six `SPEC` specialty groups with branches; seven `TYPES`; six `STAT` values, L116–124. `uextra` appends local universities (L125). | These are prototype dictionaries, not complete official registers. Geography contains embedded SVG paths/projection (`GEO`, L109), not a live geospatial service. |
| Record model | `id`, `rid`, `title`, `title_en`, `abs`, `abs_en`, `researcher`, `co`, `gov`, `city`, `uni`, `faculty`, `dept`, `spec`, `branch`, `type`, `year`, `status`, `kw`, `url`, `ex`, `audit`, L130, L264–274, L306. | Names and comma-separated strings stand in for relational researcher/institution/keyword identities. Record ID generation is local and not collision-safe across users. |
| Filters | `F0`, `F`, `match`, `cur`, L138–152: exact facets, multi-year, inclusive range, keyword substring, category and all-word free-text intersection. Smart result set `SM` intersects and reranks the filter result. | All discovery consumers should share one defined query result; current researcher field is not applied. |
| Persisted | `srm2_` localStorage keys: `projects`, `cats`, `F`, `lang`, `role`, `dark`, `uextra`, `stg`, `syn`, L112–135, L216, L282, L313, L355, L370, L376. | Browser and origin scoped. Writes silently fail; no synchronization, migrations, encryption, server storage, recovery or conflict resolution exists. |
| Transient | `SM`, `CAT` (defaults city), `HEAT`, `GAP`, `COL`, `TH`, `V`, `PG`, `CMP`, panel/dialog visibility, L139,154,157,225. | A shared link/reload does not restore these. Data and role differences between browsers change results for the same link. |
| Downloads | Blob downloads through `dl`; SheetJS CDN for Excel, L107,308–310,375. | CSV works locally; Excel depends on external library availability. SQL/reference files are generated handover artifacts, never an active backend. |

## Platform and shared discovery

### F01 — Disclosure, modal and feedback infrastructure

- **User action / entry / trigger:** all roles expand overview, smart search, advanced and category groups by their heading; open contextual workflows; use dialog ×/native Escape; dismiss map information or dashboard with Escape. Success/error messages use a transient toast.
- **Input → output / dependencies:** headings mutate `.open`; `open(title, html)` replaces the contents of a single native `dialog`; `toast` displays text for 2.6 seconds. No nested dialog stack, route or return history exists.
- **Status:** functional local infrastructure; accessibility is partial. Clickable headings are not buttons and lack keyboard/expanded semantics. Toast has no live-region role. Replacing a detail with a profile/form loses the prior context. Native dialog behavior is not full focus-management evidence.
- **Same-scope improvement:** use reusable accessible disclosures, one coordinated contextual panel/dialog host, explicit back/close behavior, focus return and announced feedback; keep dismissal from also closing an unrelated workspace.
- **Source:** L87–105; `open`, `#dX` L247; `toast` L248; `.fr>h3` L363; document Escape L381.

### F02 — Arabic/English switching

- **Action / roles / entry:** all; header `#langB` toggles `LANG` and document `lang`/`dir`, regenerates filters/list/map/dashboard and translates `[data-i]` labels, titles with `title_en`, governorates and known cities.
- **Data / dependencies:** bilingual pipe-delimited strings, `t`, `ttl`, `gName`, `cName`; localStorage `lang`. English missing content falls back to Arabic. Existing open dialogs are not regenerated.
- **Status:** partial. Role option labels are destructively translated from their current text (L379), so switching languages cannot reliably restore both languages. Specialty/institution names, governance tabs, reasons and many form values stay Arabic; stored filter values are not translated. `fKw` placeholder remains mixed. This is not full English localization.
- **Improvement:** stable message IDs/dictionaries, deliberate data fallbacks, locale-aware formatting, `dir` isolation for IDs/links, refresh open context safely without discarding edits.
- **Source:** L81,113–114,134,136,376,378–385.

### F03 — Light/dark theme

- **Action / roles / entry:** all; `#darkB` toggles body `.dark`, sun/moon icon and saved `dark`; reload restores it.
- **Data / dependencies:** CSS custom properties and hardcoded dark selectors; no system-theme listener.
- **Status:** functional local toggle; visual coverage partial because many literal light colors and several invalid color concatenations such as `var(--card)fffee` remain in source CSS.
- **Improvement:** semantic tokens with both theme values, stable accessible theme label/state; validate map, warnings, tables and dialogs in both themes. Do not add an automatic theme mode as an existing capability.
- **Source:** L6,16,39,62–63,68–72; `dk`, `#darkB` L370.

### F04 — Demo role selection and visibility

- **Action / roles / entry:** all can choose A/R/E/V in `#roleS`. Buttons gate add/import to A/E, governance to A/R, custom category to A; detail edit A/E and publish A/R. V discovery hides unpublished records.
- **Data / dependencies:** mutable `ROLE`, `roles`, `visible`; persisted browser choice; no login, accounts or institution restriction.
- **Status:** simulated and inconsistent. Underlying mutations do not authorize; governance tabs share A/R access even where matrix claims admin-only management (synonyms). Previously selected comparison IDs survive switching to V; `openCompare` and `openDet` do not apply `visible`, exposing unpublished records via retained IDs. The displayed permission matrix is not enforcement.
- **Improvement:** conspicuous demo-role label; one centralized capability/visibility policy applied to queries, details and selections. Preserve role experiences without implying authentication. Production authorization is deferred.
- **Source:** L113,142,229,251,253–254,264,298,338,347–358,376–377.

### F05 — Saved browser state and filter hash

- **Action / roles / entry:** all; change any filter, reload, or open a URL with recognized hash keys. Every `upd` saves `F` and writes nonempty fields to URL hash; initialization merges saved F then hash.
- **Data / dependencies:** localStorage wrappers swallow parsing/write failures; URLSearchParams accepts known F keys. No `hashchange` listener; browser Back/Forward is not a coherent navigation model.
- **Status:** partial. Filter control hydration is incomplete: persisted q/range/keyword values filter data while static inputs may appear blank; `CAT` resets to city even when F.cat differs. Smart query, comparisons, map position/layers, role and data are absent from the URL. Seed projects are initially generated rather than automatically saved until a mutation.
- **Improvement:** typed query serialization/hydration, canonical state derived into every control, explicit separation of session preferences and shareable query. Surface storage failure. Do not promise cross-browser data synchronization.
- **Source:** L112,132,138–139,201–218,225,282,383–385.

### F06 — Share current filter URL

- **Action / roles / entry:** all; click toolbar `#bShare` to call Clipboard API with `location.href` and show copied toast.
- **Input → output:** current URL, containing F hash, to clipboard. Depends on secure-context/permission/browser support. No hosted result snapshot or server share entity.
- **Status:** partial: success is reported before the clipboard promise settles; asynchronous rejection is not caught. F-only URL omits smart-search result state and local records; receiver's role/storage affect results.
- **Improvement:** await copy result, show a selectable URL fallback and explain what a link restores; serialize only the agreed non-sensitive discovery state. Never claim identical results from independent demo stores.
- **Source:** `upd` L216; `#bShare` L372; hash read L383.

### F07 — Comprehensive text search

- **Action / roles / entry:** all; type in `#q`; filtering is immediate, ANDing whitespace-separated terms after Arabic normalization.
- **Input → output / dependencies:** title/title_en, main/co-researchers, institution, specialty, branch, keywords, Arabic abstract, city and current-language governorate label; feeds `cur` and all discovery consumers. Does not search English abstract, ID, URL, faculty or department.
- **Status:** functional local search. No request/loading/backend relevance engine; includes-substring matching can be noisy and current-language governorate indexing changes matching after language switch.
- **Improvement:** communicate searchable fields and active query; debounce expensive renders while retaining same semantics; one reusable normalized matcher; preserve input caret/focus and query context.
- **Source:** `nz` L140; `match` L143–151; `#q` L364.

### F08 — Linked facet selectors

- **Action / roles / entry:** all; expand advanced filters and select governorate, city, university, specialty, branch or one year through generated `#s_*` controls.
- **Input → output:** matching records supply each selector's options excluding its own facet; exact equality filters intersect. Governorate change clears city only if the chosen pair has no matching record anywhere in P.
- **Status:** functional local facets with partial consistency: option availability excludes smart search `SM`; most dependent values are not cleared when invalid, and empty results can hide selected options. A multi-year F.yr value cannot be represented by single `#s_yr`.
- **Improvement:** keep selected values visible, show zero-result options where needed, adopt a single year-selection contract shared with F11; explain dependencies. Do not invent institution hierarchy enforcement absent from source.
- **Source:** `FS`, `buildSel` L200–204; `match` L145–147; `upd` L216–218.

### F09 — Researcher / co-researcher field (nonworking)

- **Action / roles / entry:** all; type into `#s_res` inside advanced filters.
- **Input → output / dependencies:** handler stores `F.res`, renders a filter chip and writes it into hash/localStorage. **`match` never reads `F.res`; results do not change.** `F.q=F.q` is a no-op.
- **Status:** partial/nonfunctional filtering despite visible state. This must not be described as implemented researcher filtering.
- **Improvement:** retain the demonstrated control's intended researcher/co-researcher substring behavior with an explicit acceptance test, or clearly mark unavailable pending that same-scope repair. Do not silently map it into global search and overwrite a separate query.
- **Source:** L138,143–151; `#s_res.oninput` L202; chips L211–213.

### F10 — Advanced range, type and keyword controls

- **Action / roles / entry:** all; `#fAdvB` reveals year-from/year-to, `#fType`, `#fKw`; inputs apply immediately. `#fApply` refreshes and collapses advanced filters.
- **Input → output:** inclusive numeric year bounds; exact Arabic type; normalized substring over `kw`. Intersects facets, F.yr and smart results.
- **Status:** functional local; partial form behavior. Apply suggests staged filters despite live mutation. No range ordering/year-domain validation; `#fClear` leaves some static fields visually filled despite clearing F. Empty years/coercion differ from record validation.
- **Improvement:** choose clearly live filter behavior and use a close action, retain inclusive semantics, validate reversed bounds with actionable messaging, bind every visible field to shared query.
- **Source:** L92–93,147–148,364–366,379.

### F11 — Multi-year selector

- **Action / roles / entry:** all; open `#yrH`, toggle year buttons, clear using `#yrClr`; selected buttons expose `aria-pressed`.
- **Input → output:** comma-separated F.yr; OR within chosen years, AND with other filter dimensions. Option list preserves already chosen years and excludes F.yr when finding available ones.
- **Status:** functional local; selection conflicts with single-year facet visual state and range intersection is unexplained.
- **Improvement:** use one reusable multi-year component everywhere, explain combined range intersection, keyboard-accessible disclosure, stable selection label. Keep year availability tied to actual fixture/query evidence.
- **Source:** L101,146,200–204,220–223.

### F12 — Category-based exploration

- **Action / roles / entry:** all; choose a category button in `#catB` then a value in `#catV`. Initial categories are city, university, specialty, branch, year and main researcher; saved custom categories join the same list.
- **Input → output / dependencies:** transient `CAT`, F.cat/F.catv; exact string equality via `val`; values derive from matched records excluding category constraint. No multi-select category filtering.
- **Status:** functional local, partial hydration after reload. Category selection itself sets F.cat but no constraint until a value. Main researcher category equality works independently from broken F09.
- **Improvement:** describe categories as alternate facets rather than separate record universes; keep category key and displayed selection consistent; expose custom categories progressively.
- **Source:** L132,139,141,149,214–215; F29 defines custom fields.

### F13 — Active filter chips and resets

- **Action / roles / entry:** all; remove individual chip; `#fClear` clears filters and smart result set; toolbar `#bRst` also blanks range/keyword static inputs and toasts.
- **Input → output:** F key set to empty; removing catv also clears cat. `SM=null` on clear-all; comparison IDs, map viewport/layers, category selection, legend thresholds and some smart-search text/parsed labels survive.
- **Status:** partial: “all” means query filters, not all UI state; F.res chip appears despite ignored matching; individual gov removal does not clear city. Plain raw-value chips lack dimension labels.
- **Improvement:** standardize reset query behavior, label chips with dimension and localized value, reconcile dependent filters and smart-search presentation, leave explicitly separate view controls alone.
- **Source:** L211–213,236,364; F0 L138.

### F14 — Experimental local smart search

- **Action / roles / entry:** all; expand smart panel, type query then Search, click one of four Arabic examples, or Clear.
- **Input → output:** normalizes Arabic, recognizes selected Arabic year phrases, university/governorate names, type terms and specialty/branch names; synonym concepts and literal terms score title/kw/abs/spec/branch. `SM` holds ranked `{p,s,why}`; parse explanation and per-card reasons displayed. “After” excludes boundary year; “before” currently includes it.
- **Status:** simulated intelligence with functional local heuristic, not embeddings, AI service or scientific judgement. Zero-match SM is reset to null, so a no-match toast can leave all other-filter results visible. Geography-only/year-only queries can have zero relevance score. English example placeholder overstates English parsing; stored SM is not recomputed after data/synonym changes.
- **Improvement:** label heuristic and score meaning, keep a real zero-result state, expose interpreted constraints/reasons without pretending semantic understanding, invalidate/recompute ranking when inputs change. Same search capability, no model/API added.
- **Source:** L88–89; CON/STOP and `smart` L312–326; `cur` L152; reasons L206.

### F15 — Result browsing, details entry and pagination

- **Action / roles / entry:** all; read matching cards, activate card by pointer/Enter, and `#more` to reveal another 25 records. Compare buttons stop pointer event bubbling.
- **Input → output / dependencies:** `cur()`, `PG`, `ttl`, role visibility, optional SM relevance/explanations; result count announces changes with `aria-live`.
- **Status:** functional local; every `upd` resets page to one. Card keyboard handlers can also receive bubbled Enter from child buttons. Default order is P order rather than a user-selectable sort. No record table view or sorting control exists.
- **Improvement:** semantic record links/buttons with isolated compare actions, maintain reading position and selected IDs through filtering, clear empty-state recovery. Do not add a sorting/table requirement from the PRD alone.
- **Source:** L96,205–207,216–217,225–228.

### F16 — Summary counts and overview

- **Action / roles / entry:** all; inspect automatically updated header KPIs and expandable overview.
- **Input → output:** current matching records produce project count, distinct universities, distinct main/co researcher strings, distinct governorates and latest year. Overview states current versus visible total.
- **Status:** functional local derived display, not a click-through feature. Researcher uniqueness is literal text; profile counts use main researchers only (F26), so “researchers” metrics differ. `new Set(a.map(p=>p.uni))` also counts a blank university as a distinct institution: the runtime minimal-record creation changes the KPI from 15 to 16 without adding a university. Overview copy implies clicking bubbles directly filters, whereas bubbles open an information card.
- **Improvement:** state fixture provenance, current filter coverage and exact counting definitions; use consistent labels for all versus main researchers, and exclude absent institution values from distinct-university counts as a documented repair. Avoid interpreting counts as national performance.
- **Source:** L208–213; profile L256–257.

## Geographic exploration

### F17 — Pan, zoom and geographic levels

- **Action / roles / entry:** all; drag map, wheel zoom at pointer, use `#zi`, `#zo`, or `#zr` to restore initial viewport; resize redraws map.
- **Input → output / dependencies:** SVG viewBox `V`; projected lon/lat via `GEO.p`; levels change at zoom 2 and 4.5. Governorate then city groups; project level retains city clusters and adds sample dots. Drag threshold suppresses click.
- **Status:** functional local geographic navigation, with no basemap tiles/live GIS. Keyboard provides zoom buttons but no keyboard pan; touch has pointer drag but no explicit pinch handling. Point locations are representative city/governorate anchors, not research-site coordinates.
- **Improvement:** explicit level/context label, accessible non-map result equivalence, stable viewport fit and keyboard pan. Keep map module independent of research aggregation and do not add new layers/data.
- **Source:** L97–99,156–163,180,191–198,218,382.

### F18 — Governorate selection and map clear

- **Action / roles / entry:** all; click or Enter a governorate SVG path to toggle F.gov and clear F.city; click empty SVG background clears both and closes info.
- **Input → output:** selected-region appearance and shared query regeneration; all result-dependent outputs change. Selection does not automatically zoom.
- **Status:** functional local. Background clear has no explicit label/action affordance; Enter supported but not Space. All SVG content is recreated on filters, potentially losing focus.
- **Improvement:** announce governorate selection, expose equivalent clear in query chips, preserve keyboard focus and selected state. Separate viewport reset from geographic-filter reset.
- **Source:** L167,195; `upd` L216–218.

### F19 — Aggregate bubbles and context drill-through

- **Action / roles / entry:** all; click/Enter bubble to open `#info`; close ×/Escape or choose `#iGo` Show projects.
- **Input → output:** current node records; count, top three universities and specialties. Show projects sets gov and city (if city node), closes info and recenters at governorate zoom 2.6.
- **Status:** functional local. Bubble coordinates are displaced by collision avoidance and joined to real anchor with leader lines; they are not precise site coordinates. Information panel may be stale after other state changes. Its content is not a modal and lacks coordinated focus semantics.
- **Improvement:** explicitly distinguish aggregate/anchor, display active aggregate context, refresh/dismiss stale context, preserve query and predictable return focus.
- **Source:** `nodes` L161–163; collision/leader L171–178; `showInfo` L188–190; zoom-to L218.

### F20 — Project dots at high zoom

- **Action / roles / entry:** all; zoom to level 3 then click a small dot to open record detail.
- **Input → output:** **only first 12 records per city aggregate** become orbiting dots, with Arabic title tooltip. Full result list remains the complete discovery route.
- **Status:** partial. Positions are radial illustrations around a city, not record coordinates; dots are tab-focusable but have no key handler or accessible record label. No indication that larger groups are sampled.
- **Improvement:** label sample/aggregate limit and provide explicit full-list route, make dots keyboard-operable and name them. Do not infer buildings, institutions or exact field sites.
- **Source:** L159,161–163,179; `openDet` L251.

### F21 — Bubble size/color legend and threshold editing

- **Action / roles / entry:** all; inspect legend and edit three numeric thresholds at `#leg [data-th]`.
- **Input → output:** auto thresholds derive from maximum aggregate count; manual `TH` replaces them until reload. Bubble radius scales with square root of count; colors select one of four classes. Legend redraw follows map render.
- **Status:** functional local with partial validation. Threshold order/range is not checked; changing query/level can make manual thresholds inappropriate. With no nodes, early return leaves prior legend/level display stale.
- **Improvement:** explain count classes, require ascending positive thresholds, label manual versus automatic mode, synchronize empty-map legend. Retain editable thresholds rather than invent a classification editor.
- **Source:** L160,169–183.

### F22 — Heat-density overlay

- **Action / roles / entry:** all; `#bHeat` toggles HEAT/on style and rerenders.
- **Input → output:** blurred circles at undisplaced aggregate anchors, radius relative to current maximum; colors use F21 thresholds. Layer is transient and filter-dependent.
- **Status:** functional local visualization, not a statistically estimated geographic density or official heat surface; no independent legend/unit.
- **Improvement:** call it an illustrative concentration overlay, keep bubble/heat count meaning clear and provide readable theme-specific layers.
- **Source:** L84,166,174,371.

### F23 — Research-gap choropleth

- **Action / roles / entry:** all; `#bGap` toggles GAP and a legend-like toast.
- **Input → output:** filtered record counts per governorate fill zero-count regions red and nonzero relative teal intensity.
- **Status:** functional local visualization. Zero means no **current demo result**, not evidence of absent research. Bubble-class legend does not explain this different encoding; filters can create artificial gaps.
- **Improvement:** persistent filtered-data disclaimer and separate encoding label; show zero/no-data distinction only if actual source supports it. No priority ranking/policy conclusion may be invented.
- **Source:** L166–167,368.

### F24 — Inferred collaboration links

- **Action / roles / entry:** all; toggle `#bCol`; inspect SVG connection tooltip. University profile also lists up to five inferred partners.
- **Input → output:** normalized researcher names (titles stripped) map to university sets; edge weight counts shared name identities. Map excludes near-colocated universities and draws top 15 distant pairs.
- **Status:** simulated collaboration inference with working local algorithm. Name collisions and affiliation assumptions can create false links; not verified institutional collaborations. Map paths have tooltip only and no action.
- **Improvement:** consistently label “shared researcher-name matches,” disclose inference and limits; keep tooltip accessible. Do not claim networks, partnerships or author disambiguation services beyond source.
- **Source:** `upt`, `collabLinks`, `collabDraw` L184–187; L256,258; `#bCol` L368.

## Research operations and contextual exploration

### F25 — Research record detail, keywords, related records and external link

- **Action / roles / entry:** all visible result cards/map dots/profile/duplicate or quality links open detail; keyword button applies F.kw and closes dialog; related card replaces detail; optional Link/PDF opens URL in a new tab.
- **Input → output:** complete descriptive fields, custom extras, Arabic/optional English abstracts, keywords, up to four related records, per-record audit entries and role-dependent actions. Related ranking: same specialty +2, university +1, keyword intersection +1.5, threshold 2.
- **Status:** functional local content with partial access/navigation. `openDet` has no visibility guard. Related Arabic titles remain Arabic in EN. Link is stored URL only; no PDF upload/viewer, DOI lookup or full-text service. Escaping does not restrict URL schemes.
- **Improvement:** one detail model shared across entry points; safe http(s) links, reliable back/close, clear missing data and fixture provenance, consistent permissions. Keep heuristic related suggestions visibly explainable.
- **Source:** `related` L250; `openDet`, `#eEdit`, `#ePub`, `.kwb`, `[data-r]`, `[data-pf]` L251–254.

### F26 — University and specialty contextual profiles

- **Action / roles / entry:** all; detail University profile or Specialty profile; open latest record, or `#pfF` Filter observatory.
- **Input → output:** **all role-visible records for that exact entity**, ignoring current F; counts, unique main researchers, year span, nine-field completeness average, top five distributions/latest projects, university city and inferred partners.
- **Status:** functional local profiles. Row bars look clickable but have no filter handlers; profile scope silently differs from current result query. Name strings are entity identity; no standalone researcher/institution directory.
- **Improvement:** show scope “all visible demo records for …,” make only true actions interactive, preserve return context; reuse profile query/aggregate logic independent of layout.
- **Source:** L253–260; `score` L333–334; collaboration L185.

### F27 — Record selection and side-by-side comparison

- **Action / roles / entry:** all; compare buttons on result cards toggle CMP; selection bar opens Compare for 2–8 records, Clear empties selection, ninth selection shows max toast.
- **Input → output:** twelve fixed rows: university/faculty/department/specialty/branch/type/main researcher/year/governorate/city/keywords/abstract. Row is marked different if any value differs; **all cells of that row** receive the `df` class. Modal width expands, table scrolls with sticky first column.
- **Status:** functional local comparison with partial scope control. CMP survives filters but not reload; no per-column remove or comparison export. Role-switch leak described F04. Selected filtered-out records remain with little explanation; Arabic abstract shown even EN. Light-theme difference highlighting is broken: `.ct td.df{background:var(--card)3bf}` (L63) is invalid CSS, confirmed by [comparison capture](evidence/04-comparison.png); dark CSS supplies a valid override (L72).
- **Improvement:** persistent selection visibility across primary experiences, out-of-filter labels, role-prune inaccessible IDs, accessible table semantics and explicit difference meaning. Do not add comparison analytics or exports as requirements.
- **Source:** L60–63,206–207,225–235.

### F28 — Create and edit research records

- **Action / roles / entry:** A/E `#bAdd`; detail `#eEdit`; fill modal and Save. City list changes with governorate; university and specialty have suggestion datalists. A can choose any defined status; E options disable approved/published.
- **Input → output:** source record fields and custom values; title/main researcher required; numeric year defaults 2026; local ID/rid generated on creation. Edit mutates object, appends audit; create prepends. Save updates all current query consumers and localStorage.
- **Status:** functional local CRUD subset (**create/read/update only**). No delete, file attachment, unsaved guard or server validation. Required hints/dictionary claims exceed enforcement. Existing rid is not regenerated after changing year/gov. E can modify published data and freely select other status options; approval policy is simulated.
- **Improvement:** shared explicit validators and field errors, preserve stable record identity, safe links/year bounds, mark suggestions versus controlled fields and warn before discarding changes. Do not invent stricter official validation policies.
- **Source:** `slug` L249; `openForm` L261–275; gating L253,264,377.

### F29 — Add custom category/field definition

- **Action / roles / entry:** A `#bCat`; enter name/description, choose select/text/number/date/multi, provide values, Save.
- **Input → output:** timestamp key, label, description, type, values, custom flag appended to CATS; available in category filters and research form `ex` fields, saved locally.
- **Status:** partial. Name-only validation; all types are rendered as **plain text inputs with datalists** (no number/date/multi semantics), metadata does not enforce values/types. No category edit/delete/reorder.
- **Improvement:** retain metadata and honestly define supported editing semantics; typed field rendering/validation may fulfill demonstrated intent but must be a named same-scope repair. No taxonomy management suite or sector ontology is implied.
- **Source:** L269,276–277; CATS/val L132,141; category filtering L214–215.

### F30 — Import file selection and template

- **Action / roles / entry:** A/E `#bImp` → wizard step 1; choose .csv/.xlsx/.xls, or download template.csv. File cancel is a no-op; CSV reads UTF-8; Excel first sheet only.
- **Input → output:** local file rows; CSV parser handles quoted commas/tabs/newlines, escaped quotes and BOM; SheetJS parses Excel to row arrays. Empty/header-only file gives toast; successful stage moves to mapping.
- **Status:** functional local CSV; Excel dependency-contingent/partial. No malformed CSV/parse/FileReader error handling or file-size limit; unavailable Excel library prompts use CSV. No upload or server ingestion.
- **Improvement:** explain accepted encoding/first worksheet, file errors and safe limits, retain local-only claim. Use pinned packaged Excel library in implementation rather than silently depending on CDN.
- **Source:** L106–107,279–285,293,300–301,375.

### F31 — Staging, mapping, resume, discard and back/next

- **Action / roles / entry:** A/E; resume saved batch or discard at step 1; adjust each field→header mapping at step 2; back/next through four stages.
- **Input → output:** STG `{name, headers, rows, map}` persisted in `stg`; autoMap matches normalized Arabic/English aliases; mapping mutations saved. Discard removes only staged batch, not research data.
- **Status:** functional local wizard. No uniqueness check on mapped source columns; selected blank mappings become undefined. Back from mapping to file preserves stage. No row editing, multi-file batches or persistent import history beyond audit notes.
- **Improvement:** stable step semantics, preview mapping and required fields, explain browser-storage scope and confirmation boundary, preserve staged choices when recovering from errors.
- **Source:** HM/TF/autoMap L279,282–285; `wz`, navigation, `#wRes/#wDel`, `[data-m]`, `#wBack/#wNext` L291–303.

### F32 — Import validation and duplicate warnings

- **Action / roles / entry:** A/E; step 3 displays clean/warning/error totals and up to 80 erroneous/warning rows; Next goes to review.
- **Input → output:** missing title, unknown governorate, non-four-digit nonempty year are errors; city mismatch, unknown university, missing abstract/keywords, exact normalized title+researcher duplicate existing/in-file are warnings. Governorate accepts ID/AR/EN names; other reference matching mostly AR.
- **Status:** functional local validation, partial policy. Main researcher is not required here despite manual form; 4-digit impossible years pass, English city can warn; warning duplicate records can still be imported. This exact-identity rule differs from fuzzy governance duplicates.
- **Improvement:** explicit shared field policy and per-path rule differences, retain excluded versus warning rows, state display cap and full totals; do not silently drop warning records or invent auto-merge.
- **Source:** `build` L286–290; step counts/table L295–298; REQ/issues L333–335 for contrasting quality rules.

### F33 — Import review and commit

- **Action / roles / entry:** A/E step 4 chooses entered/review status (A additionally draft), include warnings toggle (default checked), A-only add-unknown-universities toggle, Confirm.
- **Input → output:** excludes errors and optionally warnings, creates local IDs/rids, prepends records, adds batch/file audit entry, optionally dictionary entries with city fallback; clears STG, saves P/CATS, updates query and toasts count/batch ID.
- **Status:** functional local commit, simulated approval language. No server transaction/rollback/idempotency; warning duplicates are additive, not updates. All-error batch may “succeed” with zero imported. Storage write failure is swallowed and may still clear stage/report success.
- **Improvement:** preview exact import count/status/dictionary effects, disable no-op commit, explicit atomic local transaction/error reporting. Preserve confirmation boundary; do not introduce backend ingest jobs.
- **Source:** L298,303–307; `save` L135; `sv` L112.

### F34 — Export current results

- **Action / roles / entry:** all; `#bExp` opens CSV/XLSX/JSON choices; choose format to download current `cur()` results.
- **Input → output:** CSV/XLSX use 17 HM columns (localized governorate label but largely Arabic reference names); JSON includes full record objects **including status, audit and ex**. XLSX without library silently becomes CSV; closes dialog and toasts count.
- **Status:** functional local CSV/JSON; partial XLSX/fallback semantics. Not a complete round-trip: CSV/XLSX omit IDs/status/audit/custom extras while JSON is not an accepted import format. Spreadsheet-formula text is not neutralized. V published-record JSON still includes internal fields contrary to dictionary's “internal” labels.
- **Improvement:** truthful actual format, clear field scope/provenance and formula-safe spreadsheet output; reconcile documented public/internal fields before production, without inventing official access policy. Export must use same permission-filtered result selector.
- **Source:** L279,308–310,337,374; `cur` L152.

## Research insights

### F35 — Dashboard distributions

- **Action / roles / entry:** all; `#bDash` toggles dashboard overlay; Escape closes it. Filters update its content while open.
- **Input → output:** `cur()` produces year timeline; top nine universities/specialties/governorates; top eight types/branches. Bars are normalized to local maximum with raw counts displayed; no independent date comparison or computed growth metric.
- **Status:** functional local analytical view. Top-N truncation lacks an “other” total; dashboard inherits hidden filters/smart results, and opening obscures map. No chart library, predictive analytics or real-time data pipeline. The [dashboard capture](evidence/03-insights.png) clips the first timeline panel: chart nodes exist in DOM, so this is a panel-sizing/overflow risk, not absence of the timeline algorithm.
- **Improvement:** explicit query/provenance/scope and chart denominators, consistent axis/label/empty behavior; shared aggregate selectors, standalone experience instead of map overlay. Do not add PRD charts without HTML evidence.
- **Source:** `bars` L238; `renderDash` L241–245; `#bDash` L367; Escape L381.

### F36 — Dashboard chart drill-to-results

- **Action / roles / entry:** all; click year or distribution row; writes matching F key then closes dashboard and refreshes discovery.
- **Input → output:** yr/uni/spec/gov/type/branch exact value, replacing that dimension but keeping all other F/SM. No multi-select chart gesture.
- **Status:** functional local pointer drill; generated div bars are not keyboard-operable or semantically buttons. No obvious return-to-insights context/history.
- **Improvement:** make drill controls keyboard-accessible and announce destination; encode query in navigation so returning preserves insight scope. Do not turn read-only F37 cells into new drill features by inference.
- **Source:** L238,242–245.

### F37 — Governorate comparison table and gap matrix

- **Action / roles / entry:** all; inspect dashboard governorate table and matrix; scroll wide matrix. **Neither has a click/drill handler.**
- **Input → output:** up to seven governorates ranked by current project count with distinct university counts; matrix includes all 14 GOVS × union of six default and observed specialties, raw counts and zero/red versus relative nonzero teal.
- **Status:** functional local derived data, visual-only cells. A zero is no current matching fixture records, not absence of research. Governorate table is not the record comparison workflow F27. Completeness/coverage uncertainty is not modeled.
- **Improvement:** explain top-seven truncation, scope and zero meaning, accessible headings/table alternatives/color-independent numeric labels; preserve read-only scope.
- **Source:** `gapMatrix` L239–240; `renderDash` L244–245.

### F38 — Print report

- **Action / roles / entry:** all; toolbar `#bPrint` opens dashboard if needed and after 300ms invokes native `window.print`.
- **Input → output:** browser print CSS hides sidebar/map controls and prints banner/dashboard. Browser controls destination/PDF; no generated report/PDF service.
- **Status:** functional browser invocation; output fit, pagination and native print success require runtime/manual verification. Fixed timeout is not a readiness signal; filters/data provenance not included as a complete report header.
- **Improvement:** explicit print-only query/provenance headings, wait for stable content and validate page breaks; state clearly that browser print supplies output.
- **Source:** L74; `#bPrint` L369.

## Supporting governance and data operations

### F39 — Governance workspace entry and tabs

- **Action / roles / entry:** A/R `#bGov`; seven buttons switch quality, duplicates, queue, roles/audit, synonyms, dictionary/references and “Phase 3 package”.
- **Input → output:** `gov(tab)` replaces shared dialog; defaults quality. Uses **all P**, ignoring current discovery F and SM. Tabs are named buttons, not accessible tab semantics; most labels remain Arabic in English.
- **Status:** functional local container; production administration is simulated. “Phase 2/3” labels in source describe the prototype author's history, **not this project's roadmap phases**.
- **Improvement:** supporting operational workspace with explicit global-data scope and capability-checked subroutes; preserve context when opening records and returning to issues/queue.
- **Source:** L327,340–352,361,377.

### F40 — Data quality review

- **Action / roles / entry:** A/R governance quality; inspect overall and per-university completeness/issues; click one of first 30 problem records for detail.
- **Input → output:** score = nonempty count across nine REQ fields /9; issues flag unknown university, city/governorate mismatch, year outside 1990–2026, REQ missing, English title missing, nonempty abstract under 25 chars. Shows all-record counts and university averages sorted by weakest completeness.
- **Status:** functional local heuristic, not scientific research quality or official publication readiness. Completeness may be 100% yet record has issues. Only first 30 issue records listed, no paging/filtering/inline correction.
- **Improvement:** name “metadata completeness,” distinguish it from validity/quality of science, disclose rule version/fixed year and display cap; link to existing edit flow and return to prior context.
- **Source:** REQ/score/issues L333–335; quality L341–343; detail entry L352.

### F41 — Suspected duplicate review

- **Action / roles / entry:** A/R governance duplicates; inspect count and first 40 candidate pairs, follow either rid link to detail.
- **Input → output:** normalized title words longer than two characters, Jaccard >=.85 and same university OR exact researcher string; O(n²) over all P. Shows percentage and metadata.
- **Status:** functional local candidate detection; no merge/delete/resolve/ignore action or verified duplicate verdict. Source explicitly calls for human review and future server execution at scale.
- **Improvement:** disclose heuristic/cap, label candidates and preserve selected pair when returning from detail; move expensive computation behind a pure service/worker boundary when needed, without implementing server dedup now.
- **Source:** `dups` L336; duplicates tab L344; `[data-o]` L352.

### F42 — Review/approval queue actions

- **Action / roles / entry:** A/R governance queue; for every nonpublished record, enter optional comment then To review, Approve & publish, or Reject. Reject requires a nonempty reason.
- **Input → output:** status set directly to review/published/rejected, audit appended with role/date/comment; save, update and rerender queue. Published items disappear from queue; rejected can be acted on again.
- **Status:** simulated governance with working local mutations. Displayed draft→entered→review→approved→published flow is **not enforced**: any nonpublished status jumps directly; approved state has no separate queue action. No assignment, notification, ownership, multi-step authorization or immutable audit.
- **Improvement:** truthful demo transition labels and centralized same-scope transition logic; distinguish required rejection reason and show success with resulting status. Production workflow policy remains an open question, not invented.
- **Source:** STAT L121; queue copy/actions L345–346; mutations L353.

### F43 — Publish directly from record detail

- **Action / roles / entry:** A/R detail of any nonpublished record → `#ePub` Approve & publish.
- **Input → output:** p.status published; local audit role/date/action appended; save, close detail and update views. No comment, confirmation or validation prerequisite.
- **Status:** simulated authority with actual local mutation; bypasses queue stages and source quality checks. `approved` and `published` are collapsed by this action.
- **Improvement:** reuse F42 command/policy/result feedback across entry points; show that publication affects only this browser demo and V visibility. No real public dissemination exists.
- **Source:** L253–254.

### F44 — Audit trail and permission matrix inspection/export

- **Action / roles / entry:** all see per-record audit in details; A/R roles/audit tab reads ten permission rows and downloads audit-log.csv or permissions.json.
- **Input → output:** flattened P.audit entries with rid/date/by/action; literal PERM matrix values serialized to JSON. Matrix contains no editable permission control. `by` is role string, not actor identity; date is UTC day only.
- **Status:** functional local exports/read-only matrix and simulated audit. Data dictionary calls audit internal but details show it to V on published records. Log can be modified via localStorage; source explicitly denies legal weight.
- **Improvement:** accurate demo wording, one capability policy feeding both displayed matrix and controls, deliberate public/internal field treatment. Immutable auditing/users/actual permissions administration are future backend concerns.
- **Source:** L130,253–254,274,306,338,347,356–357.

### F45 — Synonym dictionary editing

- **Action / roles / entry:** A/R via governance synonyms; edit concept/terms, Add concept, Save, export synonyms.json or Reset defaults.
- **Input → output:** terms split on comma/Arabic comma/newline; blank concept removed; CON updated on Add/Save/Export; Save persists; Reset restores CON0 and persists. Smart search reads CONN(). No delete button; blank-name save effectively removes a concept.
- **Status:** functional local with partial access/save semantics. R may edit although displayed matrix reserves dictionary management for A. Export commits edits in memory without persisting; navigating away before Save loses DOM edits. Active SM results are not recomputed.
- **Improvement:** coherent save/dirty state and capability gates, safe reset confirmation, invalidate derived ranking when dictionary version changes. Do not infer learned synonyms/AI administration.
- **Source:** CON/CON0/CONN L312–314; tab L348; rdS/actions L354–355.

### F46 — Data dictionary, reference inspection and university addition

- **Action / roles / entry:** A/R inspect static field metadata and university ID/city/count table; A fills new university name/city and Add. Empty/exact duplicate name rejected.
- **Input → output:** `UNIS` and `uextra` append a pair; IDs generated by current array position (`rid('U',i)`), counts use all P. No university edit/delete, city creation, institution type editor or relational validation.
- **Status:** functional local university addition; dictionary tables visual-only documentation. “Stable IDs” are positional and not globally durable if dictionaries are reordered/merged. Dictionary required/public/reference claims exceed actual form/import/visibility enforcement.
- **Improvement:** separate observed field contract from aspirational metadata; assign immutable demo entity IDs in data layer while preserving legacy export mapping; make add permissions consistent and refresh dependent selectors.
- **Source:** L118,125; `refs` L328–332; FIELDS L337; tab L349; `#nuS` L358.

### F47 — Backend handover artifact downloads

- **Action / roles / entry:** A/R governance package → schema.sql, reference_data.json, projects_with_ids.json. Permission JSON is F44.
- **Input → output:** SQL string describes proposed PostgreSQL tables/view/indexes; refs() serializes dictionaries; project export maps universe P to university/city IDs plus subset of fields. Does not honor F/SM. Undefined unresolved IDs may be omitted by JSON; many descriptive/custom/audit fields not included in ID-mapped export.
- **Status:** functional local downloads of **draft artifacts**, not a working database/API/authentication system, migration, complete lossless export or schema validation. SQL comments and “Phase 3” language are source content, not execution instructions or roadmap authority.
- **Improvement:** label artifact version/completeness and validate serialization; retain SQL as a reference download, separate from domain/API contracts. Do not run schema or create backend now.
- **Source:** `refs` L328–332; `sqlPack` L339; package L350; downloads L359–360.

### F48 — Responsive layout and reduced-motion accommodation

- **Action / roles / entry:** all; browser width and reduced-motion preference automatically adjust source layout/transition behavior.
- **Input → output:** 1100px narrower sidebar/banner; <=820px stacked document, fixed-height map/sidebar and single-column dashboard; prefers-reduced-motion removes CSS transitions. No user layout mode, panel resize or map/list switch exists.
- **Status:** partial responsive demonstration. Mobile map follows a long sidebar, comparison and operational tables need horizontal scroll, controls remain dense. Reduced-motion does not define focus/navigation behavior; full accessibility is unverified.
- **Improvement:** new task-based responsive composition, maintain map/result/detail equivalence and focus order; scroll tables in bounded named regions; define touch targets, reflow/zoom and motion tokens. Do not preserve original layout as target.
- **Source:** L21–76, particularly L66,75–76; resize hook L382.

## Cross-cutting risk register and scope boundary

| Risk | Evidence | Required treatment within demo |
| --- | --- | --- |
| Unauthorized data exposure on role switch | `CMP` retains IDs; comparison/details omit visibility guard, L225–235,251. | Centralize visibility and prune selection; call roles simulation, never authentication. |
| Misleading success and stale state | Clipboard promise L372; silent storage L112; zero smart hits reset SM L326; static inputs not hydrated L383–385. | Bind UI to one state contract, distinguish errors/zero/success, validate storage/download/copy behavior. |
| Overclaiming geographic/national meaning | Generated 150 records, L128–131; map aggregate/illustrated dots L161–179; inferred links L185; zero-based gap encodings L167,240. | Persistent demo provenance; neutral labels for concentration, shared-name links and filtered absence. |
| Contradictory metadata/permissions | FIELDS/PERM L337–338 vs form/import/actions. | Treat displayed tables as documentation to reconcile, not approved institutional policy. |
| Unsafe or non-roundtrip data operations | URL scheme unchecked L253; CSV cells quote-only L310/356; differing manual/import/quality validation; positional refs L328–332. | Validate links, formula-safe spreadsheet encoding, explain export fields, immutable identifiers and explicit adapter validation. |
| Scale/performance | Every keystroke rerenders SVG/list; collision iterations L172; duplicate all-pairs L336; all data in localStorage. | Separate selectors/services, memoization and bounded work; defer real API/database/server enforcement. |

### Explicitly absent from current functional scope

There is **no** authentication/login, user provisioning, institutional membership enforcement, backend/API/database connection, server-side permission policy, immutable/legal audit, researcher identity service/ORCID lookup, DOI lookup, PDF upload/storage/reader, real semantic embeddings, model calls, external bibliographic integrations, automated publication ingest, verified collaboration graph, official coverage statistics, notification system, record delete, duplicate merge/resolve, bulk approval, custom-field edit/delete, university edit/delete, new-city/governorate management, interactive gap-matrix cells, chart growth/prediction metrics or persistent cross-user shared state. Source export strings may mention future tables/services; that is not a backend implementation. PRD-only scope is separated in [open questions and assumptions](06-open-questions-and-assumptions.md).

## Runtime corroboration and evidence limits

A fresh Chromium context loaded the original attachment over a local server; remote dependencies were deliberately blocked for a repeatable offline baseline. There were **27 behavioral probes** and **10 captured states**. Some domain checks invoked original functions directly, so they establish behavior of those functions, not UI reachability, secure authorization or a complete end-user journey. See exact inputs/outcomes in [runtime-results.json](evidence/runtime-results.json); the [harness](evidence/runtime-audit.cjs) is audit tooling, not platform application code.

| Source conclusion | Current-run corroboration | Limit |
| --- | --- | --- |
| Fixture provenance and dictionary cardinality | 150 records; 140 published, six draft, three review, one approved; 14 governorates, 22 cities, 15 universities. | Demo generation only; subsequent mutation probes deliberately alter only this ephemeral browser context. |
| Query engine | `شمسي` returned 12; DAM returned 57; impossible F.res left 150; counts/hash updated for q. | Does not prove every facet/normalization combination. |
| Map levels/context/layers | City/project levels, dot population, cluster Show projects, three layer toggles and edited threshold exercised. | Geometry accuracy, pinch and keyboard-equivalence not independently certified. |
| Insights | Eight panels, chart targets and matrix cells present; year drill changed query and closed insights. | Timeline panel visibly clipped; native print dialog/output not exercised. |
| Smart search | `الطاقة الشمسية` matched 29 with score/reason; impossible query reverted to 150 with a no-results toast. | Heuristic demonstration, not semantic accuracy evaluation. |
| Comparison/role defect | Eight-record cap enforced; after switching to V, retained unpublished selection remained in comparison. | Demonstrates local leak; does not establish any server vulnerability because no server exists. |
| Import/create/workflow | Error/warning classification, zero-row commit, required rejection reason, direct publish and create required-field checks exercised; create persisted. | No comprehensive malformed-file/failure-recovery suite; native file-picker handling not fully journey-tested. |
| Custom field/type defect | A number-typed category rendered a text input. | Other custom types follow same static rendering path; not separately exercised. |
| Data output | Actual CSV download occurred; requested XLSX became CSV with XLSX unavailable. | Successful Excel-library path, JSON/package/audit exports and spreadsheet safety remain source-inspected. |
| Persistence/navigation and language | Back changed hash without hydrating q; EN/LTR + dark activated while role labels stayed Arabic. | Full AR/EN round-trip, focus/screen-reader and storage quota recovery not certified. |
| Narrow viewport | At 390px document/map widths were 390px. | No horizontal document overflow at that sample does not establish complete responsive accessibility or task usability. |

Screenshots support bounded visual observations, not full functional proof: [01 Explorer AR](evidence/01-explorer-ar.png), [02 detail](evidence/02-record-detail.png), [03 insights](evidence/03-insights.png), [04 comparison](evidence/04-comparison.png), [05 import entry](evidence/05-import-entry.png), [06 import validation](evidence/06-import-validation.png), [07 quality](evidence/07-governance-quality.png), [08 queue](evidence/08-governance-queue.png), [09 English/dark](evidence/09-english-dark.png), [10 narrow layout](evidence/10-mobile.png). They document the prototype, **not proposed screens**. Unexercised clipboard failures, true XLSX path, native print, full keyboard/focus/screen-reader behavior, malformed files, quota failures and external research links remain explicit validation work.

### Audit closure checklist

- Every static interactive control in L81–106 is assigned an inventory ID and traceability row.
- Every generated handler in map/filter/result/detail/profile/form/import/dashboard/governance functions is mapped; infrastructure handlers, keydown, pointer/wheel, resize, persistence and hash initialization are included.
- Read-only tables, inference overlays and unsupported intentions are labeled; visible controls were not assumed to work.
- Current defects are distinct from proposed same-scope repairs; no PRD-only behavior is promoted to current requirements.
- These documents do not start Phase 2. Runtime execution evidence and remaining coverage limits must accompany static conclusions.

# Information architecture

Phase 1 · proposed organization, not screen design or application implementation.

## Scope and decision basis

The [preserved HTML](sources/syria-research-observatory_v2_prototype.html) establishes functionality. Function names and line numbers below refer to that unchanged file. The PRD informs the three-experience model, shared context and progressive disclosure; its proposed features do not enter scope by being placed in navigation. See the [feature inventory](01-feature-inventory.md), [traceability matrix](07-functional-traceability-matrix.md) and [open questions](06-open-questions-and-assumptions.md).

The prototype combines tools in one header, filters/results in a narrow sidebar, a map, a dashboard overlay, and one reused modal. This is an implementation arrangement, not a reliable task hierarchy. The proposed architecture separates spatial exploration, research work and analytical interpretation while preserving one research query. Governance and data tools receive explicit supporting locations instead of competing with public exploration.

## Proposed navigation and ownership

These are conceptual route contracts for later implementation, not existing prototype URLs. Label translation is required; URL paths can remain language-neutral. `/` redirects to `/explorer` for the demo. An additional overview/home module is not required.

| Level | Area and proposed route | Responsibility | Existing source |
| --- | --- | --- | --- |
| Primary | Geographic Research Explorer · `/explorer` | Geographic selection, pan/zoom, geographic summaries and map overlays | `nodes`, `renderMap`, `showInfo`, `zoom`, `collabDraw`, L159–198 |
| Primary | Research Operations Workspace · `/research` | Canonical discovery, results, comparison, detail, profiles and authoring | `match`, `cur`, `renderList`, `openCompare`, `openDet`, `profile`, `openForm`, L143–152, L205–235, L250–275 |
| Primary | Research Insights Dashboard · `/insights` | Existing record distributions, timeline, governorate comparison, gap matrix and print report | `renderDash`, `gapMatrix`, `#bPrint`, L238–245, L369 |
| Supporting | Governance · `/governance/:section` | Quality, duplicate candidates, review queue, role/audit information, synonyms and reference administration | `gov`, L340–361 |
| Supporting task | Data operations · `/research/import`, `/research/export` | Staged file import and current-query export | `wz`, `exportData`, `#file`, L280–310, L374–375 |
| Contextual | Record · `/research/:id`; comparison · `/research/compare`; university/specialty profile · `/research/profiles/:kind/:key` | Reusable record and profile experiences with a return context | `openDet`, `openCompare`, `profile` |
| Supporting subsection | Data model and handoff · `/governance/dictionary`, `/governance/handoff` | Existing dictionary, reference list and downloadable SQL/JSON handoff artifacts | `FIELDS`, `refs`, `sqlPack`, `gov('dict'/'pack')`, L329–360 |

Route matching must put reserved words such as `compare`, `import`, `export`, and `profiles` before the dynamic record route. Profile keys must be safely encoded and resolved through the data layer; display-name strings must not become component identity assumptions.

Governance remains a secondary navigation destination for the demo reviewer/admin modes. Import is available from Operations for editor/admin; export is available to every mode. Record creation is a contextual Operations action for editor/admin. Category creation belongs with reference administration for admin, and its resulting fields are used by Operations. The demo role selector stays an explicitly labelled demonstration control, not an account menu or authentication flow. No account management, login, institution membership, deletion or additional organizational types are introduced.

## Shared shell and cross-experience tools

| Region or control | Purpose | Rules |
| --- | --- | --- |
| Product identity and primary navigation | Orientation | Stable names for all three experiences; active destination and page heading agree. Preserve sanctioned identity assets only after the branding question is resolved; official endorsement is not established by an embedded logo. |
| Query context | Make shared scope visible | Search summary, active filter chips, current visible result count and clear-all action. Each count is labelled as demo/current dataset and current query, not national coverage. |
| Search access | Discover work from any experience | Opens/focuses the same discovery controls; it does not create a second search implementation. |
| Language and appearance | Arabic/English and light/dark | Persist preferences independently of query; do not reset map, query, comparison or task progress. |
| Demo role | Exercise current permission simulation | Recompute visible records and sanitize open records/comparison on role change. Explicitly state that this is client-side simulation. |
| Comparison selection | Carry research choices between experiences | Shared 0–8-record tray; opening comparison requires at least two visible records. Filtering does not silently clear selections. |
| Share current filters | Existing share function with honest boundaries | Share canonical filters. Smart-search state is not represented by the prototype's hash; do not promise identical rankings, demo data edits, role or viewport restoration. |
| Contextual actions | Keep tools close to their task | Map options in Explorer, print in Insights, import/export/create in Operations, administrative exports in Governance. |

The shared shell is not a fourth overview workspace. The current five KPIs can be reused as query context where useful; repeating all five everywhere is unnecessary. Their definitions remain the current formulas and must not become new metrics.

## 1. Geographic Research Explorer

**Purpose and user needs.** Understand where currently visible research records are registered, select a geographic scope, and move from spatial summaries to the corresponding research. Readers need discoverability; editors and reviewers use the same map with their broader demo-visible dataset. Geographic association is the record's governorate/city, not verified research fieldwork or an institution location directory.

**Included functionality.** Fourteen governorate SVG paths; count bubbles grouped by governorate then city; three zoom-dependent levels; up to 12 record dots per city cluster at the most detailed level; pointer pan, wheel/button zoom and viewport reset; geographic selection and clear; cluster information with top three universities/specialties and “Show projects”; editable color thresholds; density overlay; record-count gap coloring; name-matched inter-university collaboration overlay; existing year selection; shared search/filter access. Source: L159–198, L220–223, L368, L371. No institution pins, basemap switching, geolocation, boundary editing, temporal playback or verified opportunity layer is added.

**Hierarchy and main content regions.** A persistent spatial content region owns viewport and map interaction. Query context is adjacent to it; a contextual geographic summary opens after a cluster is selected. A compact route to matching research exposes the list workflow without requiring a dashboard takeover. Search/results are linked content, not an administrative panel stacked above the map.

**Secondary controls.** Zoom in/out, reset viewport, current level indicator, overlay controls, legend/thresholds, year filter and geographic summary dismissal. Advanced map options are a disclosure group; available modes remain independent toggles. Reset viewport must stay distinct from clear geographic selection and clear all filters.

**Flows.**

1. Select a governorate → update `gov`, clear incompatible `city` → map, count and linked research agree → open matching research in Operations.
2. Select a count bubble → inspect its existing count/top categories → choose “Show projects” → apply governorate and optionally city → navigate with the same query.
3. Zoom across levels → preserve query while regrouping visualization → inspect record dot → reuse record detail → return to same viewport.
4. Toggle density, gaps or collaboration → inspect legend and interpretation note → turn overlay off without changing research query.
5. Select one or more years → update the same `yr` selection used by Operations and Insights; clearing years removes only this constraint.

**State/dependencies.** Read canonical query, visibility, demo records and geographic references; own viewport, zoom level, overlay toggles and thresholds. “Selected summary” is transient UI state, not an independent persistent filter. Query changes refresh or dismiss stale summaries. Bubbles displaced to avoid collisions retain anchor lines; their displaced centers and orbiting dots cannot be interpreted as exact research coordinates. Collaboration depends on university→city lookup and normalized researcher-name coincidence; it is a demonstration inference.

**Progressive disclosure.** Start with bubbles, level and basic map actions. Reveal summary on selection; advanced legend thresholds and explanatory overlay details on demand. Detailed dots are supplementary access to the same records, not proof that all records have individual map coordinates. Keep a text selection/results equivalent available without panning or precision clicking.

## 2. Research Operations Workspace

**Purpose and user needs.** Find relevant studies, inspect their metadata, compare selected records, explore university/specialty profiles, and perform existing authoring/data tasks in the applicable demo role.

**Included functionality.** Comprehensive normalized text search; linked geographic/university/specialty/branch/year facets; year range, type and keyword filters; built-in/custom category-value filtering; local smart-search examples/query/explanations; results in 25-record increments; detail with related records, keyword links and optional external source link; university and specialty profiles; compare 2–8 records across 12 fields; create/edit research; staged CSV/Excel import; filtered CSV/XLSX/JSON export. Source: L137–152, L200–235, L250–326. The standalone researcher field is visible but inert in `match`; its status must remain explicit until the documented repair decision is accepted. No table-sort control, arbitrary sort selector, saved searches, annotations, bulk editing or record deletion exists.

**Hierarchy and main content regions.** Discovery controls lead to a research results region and contextual record area. The comparison tray is a selection workspace, independent of the current record preview. Authoring/import are focused tasks within Operations; replacing the results content while a task is active is preferable to stacking several modals. Profiles are derived views of records, not independently editable institutional records.

**Secondary controls.** Advanced facets and category filtering are initially collapsed; smart assistance has a distinct explanatory entry point; per-record compare, full comparison, remove/clear selections; load more; detail links; create/edit; import and export. Keep export's scope/count adjacent to format selection. Show category creation through authorized reference administration rather than public filter controls.

**Flows.**

1. Enter a query → see active constraints/count → refine linked facets → open record → follow related record or profile → return to the same results and scroll.
2. Open smart search → choose an existing example or submit text → see locally parsed concepts/constraints and per-result reasons → combine its candidates with canonical filters → clear smart assistance independently.
3. Select 2–8 records → open comparison → inspect the same 12 metadata rows and highlighted differences → return with selections intact. A ninth selection reports the limit; one selection cannot open comparison.
4. Open university/specialty profile from detail → inspect its role-visible aggregate/latest records → “Filter the observatory” sets the appropriate canonical facet → return to matching research.
5. Editor/admin creates or edits a record → validate the prototype-supported inputs → save locally → refresh results, counts and audit display. A save is not a server submission or durable national registration.
6. Choose import → select/resume batch → map columns → inspect errors/warnings → review status and warning inclusion → explicitly confirm → import accepted records once → update local catalog. Back and resume retain staging state.
7. Export → show current authorized/query result count → choose CSV/XLSX/JSON → report actual format and successful generation. XLSX fallback must be disclosed rather than silently presented as Excel success.

**State/dependencies.** Shared query and visibility; `SM`-equivalent smart candidate/rank state; demo records and custom fields; current increment/scroll; selected detail/profile; comparison IDs; draft form; staged batch. Profiles currently aggregate **all role-visible records** for that university/specialty, ignoring the research query (`profile`, L255–260); label this scope explicitly instead of implying that all summaries use the current filters. Related records also use all role-visible records, not the current query (`related`, L250). Authoring/import invalidate derived selectors across all three experiences.

**Progressive disclosure.** Keep common query and results first. Group advanced criteria, explain local smart matching only when used, reveal profile/related content from detail, and use a dedicated comparison route for a wide matrix. An import stage exposes only the decisions relevant to that stage. Administrative reference lists never become prerequisites for reading research.

## 3. Research Insights Dashboard

**Purpose and user needs.** Understand the composition of the same visible/query result set and use existing analytical drill-down to return to research. Readers and analysts are usage descriptions, not a new access role.

**Included functionality.** Projects by year; top universities, specialties, governorates, research types and branches; governorate comparison table; governorate×specialty count/gap matrix; existing five query KPIs; print report. Bar/year selections filter research using the existing six dimensions. Source: L208–213, L238–245, L369. The governorate comparison table and gap cells are static outputs in the source; do not silently turn them into filter controls. No new growth rates, benchmarks, forecasts, confidence scores, policy recommendations or dashboard builder is introduced.

**Hierarchy and main content regions.** Query summary and metric definitions precede distributions. Timeline and categorical distributions form an analytical content region; the governorate comparison and gap matrix form deeper comparative content. Print is an Insights action, replacing the prototype's global print entry point without losing the behavior.

**Secondary/contextual controls.** Shared filters, print report, existing bar/year drill-down, explanatory metric/limit text and standard expandable details. Top-N limits must be visible (university/specialty/governorate bars up to 9; type/branch up to 8; governorate table up to 7). “Top” means highest registered-record count in this scope, not institution quality.

**Flows.**

1. Enter from another experience → see unchanged query, count and counts by dimension → inspect values with text/table equivalents.
2. Activate an existing year/category bar → set the corresponding query constraint → navigate to matching research and preserve a return route to Insights. This replaces the existing close-overlay-and-show-results behavior, not its filter meaning.
3. Inspect zero cells → read “0 registered records in the current dataset/filter scope” → change filters if needed. Zero is not a recommendation or proof of missing science.
4. Print → generate the current analytical report with query, demo data disclosure and values; printing does not clear filters.

**State/dependencies.** Read the same query/visibility result selector as Explorer and Operations. Aggregations must be pure derivations from records; no independent dashboard sample data. Profile and governance scopes remain separately labelled. Dashboard activation must not reset Explorer viewport or comparison selection.

**Progressive disclosure.** Offer metric definitions and top-N limits where needed; allow the wide matrix to scroll independently and provide readable row/column headers. Do not make every analytical panel a modal or give each chart an unrelated filtering model.

## Supporting governance and data operations

Governance contains seven existing subsections; their grouping below is task organization, not new functional scope.

| Group/subsection | Existing behavior and needs | Main/contextual content | Scope and boundary |
| --- | --- | --- | --- |
| Review · queue | Inspect all non-published records; send to review, approve/publish, reject with mandatory reason | Queue, existing status, comment and actions; record detail context | `gov('queue')`, L345–353. Prototype does not enforce the advertised sequential lifecycle; preserve actual actions, label simulation and leave formal transition policy unresolved. |
| Quality · quality | Completeness and issue counts by university, first 30 problem records | Summary, university table and record links | All local records, not current query. Completeness checks metadata presence, not scientific merit. |
| Quality · duplicate candidates | Review suspected pairs; open either record | Candidate count, similarity, paired records | First 40 pairs displayed; no merge/delete/resolve action exists. |
| Administration · roles/audit | Inspect permission table; download audit CSV and permission JSON | Display matrix and exports | No user/role assignment management or immutable audit store. Current matrix and handlers disagree; see inventory. |
| Administration · synonyms | Add/edit/save/export/reset local concept dictionary | Concept/term rows and actions | Feeds smart matching. Existing reviewer access must be documented; admin-only enforcement cannot be assumed from matrix text. |
| Administration · dictionary/categories | Read field dictionary/reference universities, append university, add custom category definition | Read-only schema/reference tables; existing append forms | University append has admin UI gate; category definition has admin entry gate. Other institution types and full reference CRUD are future possibilities only. |
| Handoff | Download proposed SQL, reference JSON, projects-with-IDs JSON | Artifact description and download actions | Files are generated client-side; they do not provision a database or call an API. The prototype's “Phase 3” label is historical, not this roadmap's Phase 3. |

Global research query remains visible as retained context when appropriate, but supporting governance content explicitly states that it covers all local records. Avoid making a filter look operative on a table that ignores it. Returning to research restores the previous query. Record links from governance carry a return destination to their subsection; editing may remain unavailable in reviewer mode even when reviewing records is available.

## Canonical state and navigation contract

The technical implementation is defined in [technical architecture](04-technical-architecture.md); these rules define its user-visible meaning.

| State | Navigation behavior | Refresh/sharing behavior |
| --- | --- | --- |
| Canonical filters `q,gov,city,uni,spec,branch,yr,yf,yt,type,kw,cat,catv` | Shared across the three primary experiences; query changes update counts, research and map/insights derivations together | URL encodes validated filter state. Prototype recognizes only its `F` keys, including ineffective `res`; retain compatibility intentionally, not by blindly accepting arbitrary keys. |
| Researcher text `res` | Visible prototype control has no filtering effect | Document 06 Q02 and Phase 4 select the default: repair the advertised main/co-researcher filter with a test. Do not claim it works in the source; keep it explicitly unavailable until repaired. |
| Smart query/candidates | Retain in the running session across experience changes; clear through dedicated action | Source shares only `F`, not smart query/ranking. Sharing must explain this limit unless its extension is separately accepted. |
| Selected geography | Filter is canonical; focused/previewed cluster is transient | Do not serialize transient hover/focus as a filter. |
| Map viewport/overlays/thresholds | Retain within running session when leaving Explorer | No cross-browser URL restoration promise; current source does not share/persist these. |
| Comparison IDs | Retain across query changes and experience navigation; show off-query selections | Session selection; role change removes inaccessible IDs and closes inaccessible detail. No promise of persistence across reload. |
| Record/profile context | Read-only preview/full route returns to origin query, scroll and map viewport | Contextual routes are proposed navigation, not existing HTML deep-link behavior. Resolve missing/inaccessible IDs safely. |
| Form/import task | Do not discard on unrelated shell action without clear feedback; import staging can resume | Source persists import staging; unsaved form recovery across reload is not established and is not a required new feature. |
| Language/theme | Independent of query and task | Persist user preferences locally; language change updates labels and direction without changing domain IDs. |
| Demo role/local records | Demo role recalculates visibility; mutation recalculates derived data | Browser-local, user editable and non-production; never included as privileged state in share links. |

“Clear all filters” clears canonical filters and smart assistance, not theme, language, comparison, map options or stored records. “Reset map” changes only viewport. “Clear comparison” changes only selection. Invalid parent-child facets must either be removed with feedback or retained visibly as a contradictory zero-result query; no invisible constraints are allowed. The recommended default is to clear incompatible city when governorate changes, matching the source's governorate handling, and never silently broaden unrelated filters.

## Expandability without premature modules

Each primary/supporting area owns its route segment, selectors and feature components; shared entities/queries live below them. New sections can later register navigation metadata and feature routes without modifying map or record components. Reference entities and taxonomy metadata should be extensible in the data layer, but current UI supports only the HTML's universities, specialties, branches and custom fields. Institution-sector layers, saved views, verified opportunities, user management and new workflows are excluded until separately authorized. This keeps navigation open to growth while making the current implementation finite.

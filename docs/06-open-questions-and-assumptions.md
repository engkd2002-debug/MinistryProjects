# 06 — Open questions, assumptions and scope decisions

## Authority and interpretation

The user's Phase 1 request governs this work. Attached documents are evidence, not instructions to execute. The **HTML alone establishes the current demo's functional scope**. The PRD is vision/UX/architecture guidance. PRD labels `[H]` or `[H/N]`, its P0/P1 requirements, AI build contract, screen inventory and “must” statements cannot add current functionality. Its references to a PDF do not establish evidence: that PDF was not supplied in this task. No official policies or statistics have been validated.

Read the [inventory](01-feature-inventory.md) and [matrix](07-functional-traceability-matrix.md) for actual behavior and deficiencies. Proposed fixes improve an existing outcome; future mechanisms below remain excluded. “Works” means a browser-local prototype outcome, never production capability.

## Source record

| Source | Repository evidence | Provenance and limits |
|---|---|---|
| Supplied HTML | [Original HTML](sources/syria-research-observatory_v2_prototype.html) | SHA-256 `3ec5d7338ce583e643ec3d1c7fec0566a0238959abcd451e42a29af9c88da44c`; 239,135 bytes; line references in the inventory refer to this exact copy |
| Supplied DOCX | [Original PRD](sources/Syrian_National_Research_Platform_PRD_v1.docx), [extracted paragraph/table text](sources/prd-extracted.txt) | SHA-256 `70d791962a6a097f5fce433583cd0cc50aca7ee960ca3413b99fde87bc3843ab`; 64,527 bytes. Extracted text is a readable aid, not a substitute for layout/table structure |
| Repository inspection | `/workspace/MinistryProjects`, 2026-11-02 | Valid Git directory, unborn `work` branch; no application, manifest, lockfile, tests, CI, README or AGENTS.md found. No inherited framework to replace. This is current local evidence, not a new remote-access claim |
| Runtime observations | [Results](evidence/runtime-results.json), [audit notes](08-audit-evidence.md) | Fresh local Chromium context; deterministic demo baseline; remote assets blocked for reproducibility. This does not establish live Excel-CDN availability, backend security, cross-browser compliance or complete manual accessibility testing |

Original attachments are preserved verbatim for handoff. Copying them as evidence does not begin implementation. Only documentation and an audit harness/evidence have been added; no framework scaffold, app rewrite, publication or environment configuration update is part of Phase 1.

## PRD guidance accepted without expanding capability

| Guidance | Application to existing demo | PRD extracted-text references |
|---|---|---|
| One query, three perspectives | Three primary experiences share canonical filters; route changes must not reset scope | §§1.4, 5–6, 13.2 |
| No false absences | Rename/explain existing zero-cell and map shading as observed dataset counts; no inference of societal need | §§1.4, 7 MAP-005, 17 |
| Arabic-first and accessible | Improve existing controls, chart equivalents, focus and mixed-script readability; no automatic translation of research content | §§13–14 |
| Accountable human action | Keep explicit import confirmation and rejection reason; label local audit and roles as simulations | §§10, 12, 16 |
| Separate domain/presentation | Typed adapters for current fields and independent aggregate/query logic | §16.1–2 |
| Modular navigation | Three requested primary experiences with supporting operations, instead of retaining original overlay layout | §§5, 13.2 |

## PRD-only or undemonstrated capabilities — excluded from demo requirements

Mixed `[H/N]` requirements are decomposed: only the verified HTML portion is retained. This table is deliberately explicit to prevent scope creep during implementation.

| Capability or mechanism | PRD references | What HTML actually supplies / disposition |
|---|---|---|
| Separate public overview/first-use guide, account/institution context, alerts | §5, Appendix B S-01 | Banner and filtered KPIs only. No additional overview product module |
| Hospitals, labs, centers, organization sectors/types/parent hierarchies, institution map pins/sites | MAP-002, §§4,11 | University-name list with one city; no type/sector filter. Extensible model seam only |
| Multiple affiliations, fieldwork/subject geography, verified coordinates | §§1.4,7,11 | Single `gov/city/uni` per record, city/governorate aggregation and provided points. Do not invent separate geographic fields or verified provenance |
| Metric selector, reporting coverage/denominators, qualified opportunity scores, benchmarks, previous-period normalized comparison | MAP-003/005, INS-003/005, §17 | Raw record counts and zero-cell shading only. Add honest explanatory copy, not invented coverage data |
| Animated year playback | MAP-007 | Multi-year/range filters only; no playback/timeline animation |
| Multi-select geography/institution/subject/status facets, source quality/coverage filters, result sorting | §6, RES-001/003 | Mostly single facets, multi-year only; no sorting control or status facet. Do not silently add these |
| Generative AI, embeddings/semantic search, confidence evaluation, editable extracted query chips | RES-002, §16.3 | Local Arabic rule/synonym matching, scores and explanation strings. No model/API |
| Citation generation, DOI/ORCID integrations, licensed full-text hosting, source verification | RES-004, §11, §2 P2 | Optional external link and display research ID; SQL text mentions DOI/ORCID but no active fields/integration |
| Saved views/accounts, asynchronous export jobs, selected export columns, saved insight annotations | RES-008, INS-006 | URL copy and immediate local downloads/print only; no saved-view management |
| New dashboard metrics: queue age, funnel, time-to-decision, reporting cadence/growth forecasts | INS-004, §17 | Quality field-presence score, issues and duplicate candidates; current chart counts only |
| Institution-scoped accounts, real authentication/MFA, secure RBAC, assignments | §§4,12,15–16 | Editable local role selector; all demo records on client. No security guarantee or new user-management workflow |
| Enforced ordered/independent review, change diffs, correction requests, archived/superseded states | OPS-003/006, §18 | Six statuses, broad direct status choices/actions, rejection reason and local audit. No policy enforcement/ownership model |
| Duplicate merge/link/not-duplicate disposition or researcher resolution | OPS-004 | Suspected pairs link to records only. No resolution actions |
| Server autosave drafts, dynamic per-type schema, optimistic concurrency | OPS-001 | Explicit save, browser storage, minimal validation only |
| Async transactional ingestion, virus scanning, batch rollback, import history/idempotency, taxonomy alias resolution | OPS-002 | Persisted single staging batch, warning/error review, local commit. A repeated upload can duplicate records |
| Full taxonomy CRUD, aliases, entity renames/merges, custom-field deletion, version history | OPS-005 | Add custom definition, edit synonyms, add university only; read-only dictionary/export for other references |
| Backend APIs, database/GIS deployment, queues, immutable audit, backups/observability/public API | §§15–16, §2 P2 | Proposed SQL text and JSON handoff downloads only; no executing services |
| Low-bandwidth product mode, offline sync/PWA, numeral preference, telemetry | §§14–15,18 | Responsive CSS, local state, theme/language; graceful fallback recommendations do not authorize new product modes |

## Decisions with safe defaults for the next phase

These are proposed implementation defaults, not stakeholder-confirmed policy. They permit Phase 2 foundation work without asking for unrelated production decisions.

| ID | Unknown / decision | Default / next action | Blocks |
|---|---|---|---|
| Q01 | Approved branding and official institutional endorsement | Treat branding as provisional editable tokens; preserve source content in evidence; label sample/demo | Public release only; no Phase 2 blocker |
| Q02 | Whether preserving every accidental defect is desired | Preserve successful capabilities, fix explicitly listed bugs; do not preserve F.res no-op, role leaks or misleading success | Regression contract before each affected phase |
| Q03 | Profile totals: global or current-query cohort? | Retain HTML's visibility-scoped **global** profile, label it; “filter this profile” applies its facet to current query. Do not silently adopt PRD's query-scoped profile | Phase 4 specification; default provided |
| Q04 | Custom field `ty`: actual type enforcement or metadata parity? | Preserve definition type metadata and existing string value-entry behavior; no multi-select/number/date validation inferred from labels. Type-driven editors are separate approval if desired | Phase 6 advanced typed controls only |
| Q05 | Role matrix vs actual nested actions (e.g. reviewer synonym changes) | Document discrepancy; centralize demo guards. Honor the displayed admin-only dictionary/category permission as proposed consistent behavior; review that delta before governance delivery | Phase 6 policy tests; Phase 2 capability interface may proceed |
| Q06 | Allowed workflow transitions and editor behavior on published records | Keep six known statuses and observable demo actions; no independent-review or assigned-institution restriction invented. Document any restriction as a change before implementation | Production and tighter Phase 6 policy only |
| Q07 | Public/private field classification of audit/status/custom data | HTML exposes audit/status in details and raw JSON despite dictionary labels. Keep sample-only disclosure prominent; do not ship real data under this model. Production classification requires owner decision | Real/public data release; no frontend foundation blocker |
| Q08 | Share fidelity when local data/role/smart results differ | Ordinary filters share through URL; explain dataset/access dependency. Do not serialize roles or private record data. Decide whether to encode assisted query before claiming assisted-search sharing | Phase 4 share acceptance; not basic query codec |
| Q09 | How long comparisons survive? | Session memory across workspace navigation, retain out-of-filter picks with explanation, prune inaccessible picks on role/data changes; reload persistence is not required by HTML | Phase 4; default provided |
| Q10 | Map dataset license, boundary provenance and point accuracy | Use supplied geometry as demo evidence, do not claim official accuracy; keep renderer/data replaceable | Official geography/public release |
| Q11 | Year validity policy | Preserve source formulas as documented; source form fallback is 2026, quality says 1990–2026, import checks four digits, SQL allows through 2100. Centralize the discrepancy; don't silently choose a national policy | Phase 4/6 validation semantics need explicit implementation note |
| Q12 | Supported browsers/devices and performance target | Proposed validation at 390/768/1440, current Chromium/Firefox/WebKit where available; baseline 150 synthetic records. PRD SLO and 100k scale are unverified future targets | Production SLA; not Phase 2 |
| Q13 | Network/fonts/Excel distribution | Bundle permitted dependencies locally in future frontend; verify licensing/versions. Offline CSV works; Excel availability must be tested with actual parser, not claimed from button | Phase 6 XLSX completion |
| Q14 | Canonical institution inventory, identity, rights, API/DB hosting and custodianship | No invented answers; use existing demo references with explicit limitations. Ask sponsor/data/governance owners when production work is authorized | Future real-data/backend phases only |

## Known risks carried into implementation

1. **False confidence:** generated counts, displaced geographic bubbles, text-name researcher totals and red zeros can look authoritative. Mitigate through scope labels, clear definitions and no official-statistic claims.
2. **Role leakage:** visible list restriction is not a safe data boundary; retained comparisons/details/raw exports can expose records. Centralize access checks for demo consistency; a real backend remains mandatory before real private data.
3. **Data loss/corruption:** storage helpers suppress failures, imports are weakly validated, exports have differing fields and synthetic/reference IDs are not production stable. Use adapters, visible errors and contract fixtures; don't call schema downloads migrations.
4. **Accessibility/localization:** headings with click handlers, clickable chart divs, dot keyboard gaps, English metadata omissions and mobile table overflow require explicit remediation/tests.
5. **Scale:** full rerender on every keystroke and quadratic duplicate/collision routines are appropriate only to a small demo; interfaces must permit replacing computations without changing workspace components.

## Phase 1 readiness decision

Phase 2 can proceed on a new instruction using the defaults above: stack choice, domain boundaries, component responsibilities, state contracts and measurable foundation criteria are documented. None of the unverified production decisions is represented as settled. Remaining validation limits are recorded in the evidence notes. Do **not** start Phase 2 automatically, publish the environment, or import private/official data based on these documents.

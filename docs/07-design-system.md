# Phase 2 — Design system

This document describes the implemented frontend foundation. It supplements, and does not replace, [the Phase 1 traceability matrix](07-functional-traceability-matrix.md). See the [implementation report](09-phase-2-implementation-report.md) for validation evidence and outstanding limits.

## Design decisions and current boundary

The new identity is a restrained research workspace: an abstract geometric mark, a stable navigation rail, quiet surfaces, compact controls and clear contextual orientation. It does not reproduce the prototype's map/sidebar/toolbar layout or imply official institutional endorsement. Border radii are 4/8/12px; outlines and space separate content more often than shadows. Cards are composable surfaces rather than a mandatory container around every paragraph.

The Phase 2 brief explicitly supplies the visual direction and asks for implementation without another selection checkpoint. That direction governs this redesign. The original HTML remains a functional reference, not a visual target. The same brief explicitly authorizes **system theme preference**, extending Phase 1's light/dark-only baseline. This is a bounded, documented requirement update; no PRD-only product capability is introduced.

Three actual routed structural views establish Explorer, Research Operations and Insights. Supporting audited areas have structural destinations. They disclose their delivery phase; the foundation does not pretend to supply a complete map, research catalog, metrics dashboard, comparison or governance workflow. Decorative spatial artwork has no research-data meaning. The internal showcase uses component/state specimens, an em dash for an unconnected metric, and an empty visualization frame—not invented records or statistics.

## Token architecture

The source of truth is [`src/shared/tokens/tokens.css`](../src/shared/tokens/tokens.css). Component colors consume semantic custom properties; change the token layer rather than introducing a separate palette in a feature stylesheet.

| Layer | Implemented tokens and purpose |
|---|---|
| Identity references | `--brand-navy: #0F172A`, `--brand-teal: #0C9488`, `--brand-cyan: #38BDF8`; reference swatches, not automatic text/action colors |
| Canvas and surfaces | `--bg`, `--surface`, `--surface-raised`, `--surface-subtle`, `--nav-bg`; layered light and navy dark surfaces |
| Text | `--text`, `--text-secondary`, `--text-muted`; meaning and hierarchy rather than individual screen colors |
| Action | `--accent`, `--accent-hover`, `--accent-soft`, `--accent-ink`, `--on-accent`; filled actions, selection and selected text |
| Structure and focus | `--border`, `--border-strong`, `--focus`; keyboard focus is a visible outline with spacing from the target |
| Feedback | `--success`, `--warning`, `--danger`, `--info` and corresponding soft surfaces; text and icons accompany color |
| Layers | `--overlay`, `--shadow-sm`, `--shadow-lg`; raised context and modal separation |
| Geographic/visualization seams | `--geo-low/mid/high/empty`, `--chart-1` through `--chart-5`; theme-adaptive future encodings, not implemented research metrics |
| Spatial illustration | `--canvas-bg`, `--canvas-line`, `--canvas-accent`, `--canvas-label`; explicitly illustrative foundation artwork |
| Type, spacing and shape | `--font-*`, `--space-*`, `--radius-*`, navigation width and content-width tokens |
| Motion | Semantic duration/easing variables documented in [motion and interactions](08-motion-and-interactions.md) |

The light action color is deliberately darker (`#087E74`) than the teal identity reference (`#0C9488`) to support legible white action text. Dark mode uses a lighter teal action (`#5DD4C4`) with dark foreground (`--on-accent: #0B2528`) rather than white text on the same palette. Navy surfaces, muted text, borders, overlays and feedback colors have independent dark values; dark mode is not a color inversion. Cyan is an accent reference, not a default body-text color. Token intent does not itself establish complete contrast compliance; inspect the rendered states and test new combinations.

## Typography and language

**IBM Plex Sans Arabic** is bundled at 400/500/600 for Arabic. Its clear structure, readable small labels and stable line rhythm suit scientific terminology and dense metadata. **Inter**, also bundled at 400/500/600, provides a compatible Latin voice. Local `@fontsource` assets avoid a runtime font-CDN requirement. System fallbacks remain available during loading or asset failure.

Arabic is the initial language; `useI18n()` updates document `lang`, `dir` and title. English changes the shared presentation, not the application or domain identifiers. Translation resources are centralized in `src/shared/i18n/messages.ts` and `showcase.ts`; components request stable keys. The hook provides `formatNumber` and `formatDate` using `Intl`. It does not translate research content or invent missing English titles.

Use CSS logical properties for margins, borders and panel placement. Use `bdi`/explicit direction for research identifiers, mixed-language titles and URLs; do not reverse map coordinates. Only genuinely directional icons receive the `directional-icon` class. The showcase includes a mixed-script specimen so both directions can be evaluated without fabricated research content.

## Theme initialization and preferences

[`index.html`](../index.html) runs a small pre-paint preference bootstrap before application assets: it reads `snrp.preferences`, resolves `system` with `prefers-color-scheme`, sets `data-theme`, and establishes language/direction. Theme CSS is linked directly from the HTML head as a render-blocking stylesheet, so development and production do not wait for the React module to style the initial canvas. The React `ThemeProvider` exposes `preference`, resolved theme and `setTheme`; it listens for system changes while system mode is selected. Explicit light/dark choices override system preference and are saved locally. The appearance popover provides light, dark and system choices with selected states.

Preference reads/writes are guarded. Failed writes keep the current in-memory appearance and produce a visible shell warning instead of claiming durable persistence. Preferences are browser-local; there is no account synchronization. A malformed preference value falls back safely. Theme behavior uses one set of components and semantic tokens; do not create separate light/dark component implementations.

## Shared component APIs

Import from `src/shared/ui`. Root providers supply theme, localization and toast context.

| Family | Implemented components and key contract |
|---|---|
| Actions | `Button` variants `primary/secondary/ghost/danger`, `size`, `loading`, native disabled state and optional icon; `IconButton` requires an accessible `label` |
| Forms | `Input`, `Select`, `Textarea`; `Field` associates label, hint/error and invalid state with its control; `Checkbox` uses native semantics; controlled `Switch` exposes `aria-checked` |
| Context and state | `Badge`, `Alert`, `Spinner`, `Skeleton`, `EmptyState`, `FilterChip`; distinguish unavailable, loading, error and actual success |
| Layout | `Card`, `Panel`, `Section`, `Divider`, `ResponsiveColumns`; compose task-specific layouts without domain logic |
| Disclosure/navigation | `Disclosure` uses native details/summary; `Tabs` uses Radix keyboard-aware tabs; `Tooltip` supplements an already named control |
| Layers | Controlled `Dialog` and `Drawer` accept `open`, `onOpenChange`, title, optional description/footer and trigger; `Popover` accepts a trigger, label and short contextual content |
| Data primitives | `Table` accepts caption, columns and rows with semantic headers; `Metric`, `ChartFrame`, `Legend`, `ComparisonIndicator` are presentation components, not analytics/selection engines |
| Notifications | `ToastProvider` and `useToast().notify(message, tone)`; shared timed/dismissible announcements, no mutation implied by displaying a toast |

Example field composition:

```tsx
<Field label={t('query')} hint={t('queryHelp')} error={error}>
  <Input value={query} onChange={event => setQuery(event.target.value)} />
</Field>
```

Pass a trigger to controlled dialog/drawer patterns when available so the overlay can restore focus naturally. Keep read-only panels nonmodal when no blocking decision is required. A table is currently a table primitive: sorting, pagination and row actions are not silently supplied. A comparison indicator is not the Phase 4 comparison workflow. A chart frame does not generate a chart or animate statistical values.

## Shell, responsive composition and extension

`app/navigation.ts` declares destinations separately from rendering. The desktop rail makes primary workspaces stable and supporting tools progressively available. It can collapse from 252px to an 80px icon rail; medium desktop uses a 220px expanded rail. Below 960px the layout uses a modal navigation drawer rather than shrinking the desktop rail. Tooltips/labels preserve collapsed destination names. Main content is bounded by `--content-max`; narrow layouts reflow, and wide tables scroll inside their own regions.

Routing uses React Router and retains canonical URL query context between workspaces. Theme and language are independent from query state. Navigation does not authenticate a user: all current content is a clearly labeled foundation/demo. Supporting destination visibility is not production permission enforcement.

To add a component: choose an existing pattern first; add the smallest reusable implementation under `shared/ui`; consume semantic tokens and localization; supply keyboard/focus/error/disabled behavior; add a bilingual showcase specimen and meaningful tests. Keep product predicates, data adapters and metrics out of components. New features compose these primitives under feature-owned routes without reaching into sibling feature internals.

## Internal review surface and limits

Run `npm run dev` and open `/dev/design-system`. The route and lazy page import are gated by `import.meta.env.DEV`; production navigation and routes exclude this review surface. It demonstrates typography, identity references, surfaces, controls, form validation, layers, feedback, empty/loading states, tabular structures and motion in the active global language/theme.

No backend, real authorization, official branding approval, full research workflow or actual analytical chart is implemented here. Automated and browser findings belong in [the Phase 2 report](09-phase-2-implementation-report.md); this document records contracts, not an accessibility certification or unexecuted test results.

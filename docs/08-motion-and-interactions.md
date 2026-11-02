# Phase 2 — Motion and interaction conventions

This describes the actual shared motion foundation and its intended use in later modules. It preserves [Phase 1 UX contracts](03-ux-architecture.md) and does not replace [the original audit evidence](08-audit-evidence.md). Validation results are recorded in [the implementation report](09-phase-2-implementation-report.md).

## Purpose and implementation locations

Motion links a user action with a change of context. It does not imply data freshness, statistical significance or progress that has not occurred. Transforms and opacity handle contextual entrances; size transitions are limited to navigation/disclosure layouts where they explain a change. There are no spring/bounce effects, animated research values or automatic map stories.

- `shared/tokens/tokens.css`: semantic durations, easing and reduced-motion override.
- `shared/motion/index.tsx` and `motion.css`: `motionTokens`, reusable `MotionRegion`, direction-aware icons and region entrance.
- `shared/ui/ui.css`: control feedback, layer entrance/exit, disclosure, loading and selection behaviors consuming those tokens.
- `app/shell.css`: navigation collapse, responsive composition, selected navigation and theme/control presentation.
- `features/showcase/showcase.css`: internal replay specimen; it uses the same timing/easing contract.

## Timing contract

| Token | Normal duration | Implemented or reserved behavior |
|---|---|---|
| `--motion-fast` / `feedback` | 140ms | Button/input states, switch thumb, tab/tooltip feedback and directional icon changes |
| `--motion-dialog` / `dialog` | 180ms | Dialog fade/scale, popover, overlay fade and tab content entrance |
| `--motion-disclosure` / `disclosure` | 220ms | Disclosure indicator/body and supported intrinsic-size transitions |
| `--motion-panel` / `panel` | 260ms | Contextual drawer, shell rail width, shared region entrance and notification entrance |
| `--motion-theme` / `theme` | 200ms | Understated shell background, text and border changes after initial theme resolution |
| `--motion-map` / `map` | 380ms | Reserved for future geographic transitions; no functioning map animation in Phase 2 |
| `--motion-chart` / `chart` | 450ms | Reserved for future visualization changes; no animated research values in Phase 2 |

The standard easing is `cubic-bezier(.2,.65,.3,1)`; an exit easing token is available for later usage. Looping spinner/skeleton cycles are progress-state cues, distinct from the transition durations above. Keep durations semantic and centralized when adding animations; the TypeScript timing export must stay aligned with CSS tokens.

## Navigation and orientation

Active navigation uses color/background and a small state indicator; it does not move the entire interface. Desktop rail expansion changes its grid column over the panel duration. At the mobile breakpoint navigation is a drawer with modal semantics rather than an overlaid miniature sidebar. The shared region entrance translates content by only 5px while fading in; it should run on a meaningful context entrance, not on every query keystroke.

Route/query state remains independent from animation. Do not clear a filter or remount a draft form simply to replay an entrance. A transition must not delay canonical state updates or become the only sign that navigation occurred. Workspace orientation uses titles and active destinations whether motion is enabled or not.

## Drawers, dialogs and popovers

The Radix-backed layer components share open/close state, labels, focus containment and Escape dismissal. Supply a visible trigger where possible; closing restores focus to that trigger or the captured invoking element. Backdrop separation is semantic and theme-aware. Content has a bounded, scrollable body with reachable dismissal/footer actions.

Drawers are placed at the **logical inline end**: right in English LTR, left in Arabic RTL. Their slide offset changes sign with `dir`; geography itself never mirrors. The entrance/exit combines a small horizontal displacement and fade over 260ms. Narrow screens can use the same panel at full available width; there is no separate mobile business logic.

Dialogs use restrained opacity and scale from `.98` over 180ms, centered in the viewport. Popovers use their Radix transform origin and short fade/scale; tooltips use the fast duration. A tooltip is supplementary information, never a substitute for a control's accessible name or a container for an essential action. Overlay close behavior must not also dismiss an unrelated underlying task.

## Expand/collapse, controls and feedback

`Disclosure` uses native details/summary. Its indicator rotates and its body enters with the disclosure duration. Intrinsic-height animation is progressively enhanced using `interpolate-size`/`::details-content` where supported; other browsers retain functional native disclosure and content feedback without relying on an unavailable height-animation feature.

Buttons use subtle color/border changes and a 1px pressed translation; switches move their thumb with direction-aware transforms. Focus is a visible outline independent of hover. Disabled/loading actions cannot trigger their command. Loading status is communicated semantically as well as visually; a skeleton is decorative and must accompany a meaningful loading state in real workflows.

Alerts distinguish error, warning, information and success using text/icon plus semantic color. Notifications announce an actual UI outcome and are dismissible. A form validation specimen announces only that validation succeeded; it does not say a research record was saved. Later data commands must await their real result before success feedback, preserving the Phase 1 correction to optimistic clipboard/storage messages.

## Theme transition and initialization

The pre-paint bootstrap resolves theme before the application mounts; it does not animate from an incorrect starting palette. `theme-ready` enables gentle shell color transitions after initial resolution. Component interactive color changes use the same semantic palette and their feedback duration. The theme preference can be light, dark or system, as explicitly required by the Phase 2 brief; the system option extends Phase 1's earlier baseline.

Avoid a full-screen wipe, temporary contrasting overlay, spinning icon or coordinated chart replay on theme changes. Changing appearance must preserve query, navigation and open-task state. Language changes affect layout direction and labels, not data identity or ranking.

## Reduced motion and performance

`prefers-reduced-motion: reduce` takes precedence over the motion system. Root semantic duration variables become zero, smooth scrolling is removed, and shared layer/control/loading animations are disabled or reduced to an imperceptible single frame. The showcase replay also disables its entrance. Focus, labels, selected states, visibility and operations remain meaningful without movement.

Keep geometry/static layout separate from animated presentation. Do not repeatedly animate numbers, continuously rerender an SVG to simulate a transition, or animate every table cell when a filter changes. Reserve map/chart tokens now; actual zoom, pan, cluster and visualization transitions require later feature implementation and performance validation with real component inputs.

## Review and extension checklist

1. Choose the existing semantic duration and component pattern before adding a new animation.
2. Confirm start/end state meaning and keyboard/focus behavior without animation.
3. Verify RTL/LTR transform direction, theme appearance and narrow-screen scrolling.
4. Use transforms/opacity for entrances and a restrained size transition only when spatially useful.
5. Check reduced motion; no essential information or action may depend on motion.
6. Add a reproducible interaction test or browser evidence for the behavior being introduced.

The internal `/dev/design-system` route provides actual dialog, drawer, popover, disclosure, tab, switch, notification and motion replay interactions. Complete map and dashboard animations are deliberately deferred. This document makes no claim that cross-browser, assistive-technology or performance testing has been completed beyond the evidence in the Phase 2 report.

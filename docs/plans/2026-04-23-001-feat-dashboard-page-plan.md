---
title: "feat: Angular Dashboard page matching public/ mockup"
type: feat
status: active
date: 2026-04-23
origin: public/ControlHub.html (+ public/pages-1.jsx, public/shell.jsx, public/styles.css, public/data.jsx, public/images/dashboard.png)
---

# feat: Angular Dashboard page matching public/ mockup

## Overview

Port the ControlHub Dashboard page from the React/HTML mockup under `public/` into the Angular 21 app under `src/`, pixel-close to `public/images/dashboard.png`. Build it with Angular Material components, Tailwind v4 utilities, Angular CDK a11y primitives, and **ngx-charts** for all data visualizations (line, donut, sparkline). Scope is the Dashboard page and just enough app shell (sidebar + topbar + route) to render it in place; other pages (Users, Roles, etc.) are out of scope.

## Problem Frame

The existing mockup in `public/` is a static React UMD prototype (`ControlHub.html`) that is not wired to the Angular app in `src/`. The Angular project is scaffolded (`src/app/app.ts`, empty `app.routes.ts`, Tailwind v4 pre-configured in `src/styles.css`) but renders nothing. We need a real Angular Dashboard route that visually matches the mockup so the rest of the admin can be built on top of it.

## Requirements Trace

- R1. A `/dashboard` route renders the Dashboard page as the default landing route, matching `public/images/dashboard.png` in layout, typography, spacing, and color.
- R2. Page contains: greeting header with range/export actions, 4 KPI cards with sparklines, a "Growth & usage" line chart with 30d/90d/1y toggle, a "Traffic mix" donut with legend, a "Recent activity" feed, and an "Alerts" feed.
- R3. Implemented with Angular Material components where a Material equivalent exists (buttons, icons, cards-as-container, chip-ish badges, menu for range picker), Tailwind v4 utilities for layout/spacing, and `@angular/cdk/a11y` for accessibility (focus management, live region for async updates, skip-link).
- R4. App shell (sidebar + topbar) is scaffolded at a fidelity sufficient to frame the Dashboard; full interactivity (theme toggle wiring, notifications drawer) is deferred.
- R5. Uses Angular 21 idioms: standalone components, `signal`/`computed`, new control flow (`@for`, `@if`), `inject()`.
- R6. Design tokens from `public/styles.css` are ported into a **dedicated system-colors CSS variable layer** (`--sys-*`) so every surface — Angular Material, Tailwind, and ngx-charts — reads from the same source of truth. Semantic colors (accent, good, warn, danger, info), neutrals (ink-1..5, bg, bg-elev, bg-sunken), lines (line-1..3), radii, and shadows all live behind `--sys-*` variables. **Light mode only** in this plan — dark-mode values are not ported.
- R6b. Charts (line + donut + sparkline) are rendered with **ngx-charts**, themed via the `--sys-*` color variables so the palette stays consistent when light/dark tokens change.
- R7. Keyboard-navigable and screen-reader-usable: focusable nav items, labelled landmarks, announced range changes, non-decorative SVG charts have text alternatives.

## Scope Boundaries

- No backend — data is a static in-memory fixture mirroring `public/data.jsx` (`ACTIVITY`, `NOTIFICATIONS`).
- Charts use ngx-charts out-of-the-box; we do not fork or restyle ngx-charts internals beyond what the public theme API (color scheme, CSS variables) allows.
- **Light mode only.** Dark-mode CSS tokens are not ported. The theme toggle button in the topbar is visual-only (does nothing when clicked).
- No Tweaks panel, no notifications drawer, no user profile drawer.
- Topbar search input is styled but non-functional.

### Deferred to Separate Tasks

- Other pages (Users, Roles, Resources, Orders, Analytics, Tickets, Notifications, Audit, Settings, Auth): separate plans per page.
- Dark mode + theme toggle + persistence: separate plan. Will add a `[data-theme="dark"]` override block to `system-colors.css` and wire the topbar toggle at that time.
- Real data sources / API integration: separate plan.
- Replacing ngx-charts with a different library (ECharts, Recharts-for-Angular, etc.): separate plan.

## Context & Research

### Relevant Code and Patterns

- `public/images/dashboard.png` — **visual source of truth**; the Angular output must match this screenshot.
- `public/pages-1.jsx` (lines 6–131, `DashboardPage`) — structure, KPI definitions, chart series, donut segments, feed bindings.
- `public/shell.jsx` (lines 196–314) — reference-only for chart inputs (series shape, donut segments, label cadence). Rendering is handled by ngx-charts in the Angular port.
- `public/shell.jsx` (lines 3–119) — `NAV` groups and `TITLES` map for sidebar + topbar.
- `public/styles.css` — design tokens (`--accent`, `--ink-1..5`, `--bg*`, `--line-1..3`, `--good/warn/danger/info`, radii, shadows, transitions). Ported into the `--sys-*` system-color layer (see Unit 1); Tailwind v4 `@theme` references them.
- `public/data.jsx` — `ACTIVITY`, `NOTIFICATIONS` arrays; copy into a TS fixture.
- `src/app/app.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts` — Angular 21 standalone scaffold to extend.
- `src/styles.css` — already imports Tailwind v4 (`@import 'tailwindcss'`); extend with design-token `@theme` and port selected component CSS from `public/styles.css`.

### Institutional Learnings

- None found in `docs/solutions/` (directory does not exist yet).

### External References

- Angular Material v21 installation via `ng add @angular/material` — pulls in `@angular/cdk` automatically (includes `@angular/cdk/a11y`).
- Tailwind v4 `@theme` directive for mapping CSS variables to Tailwind tokens (keeps oklch design tokens usable as `bg-sys-accent`, `text-sys-ink-1`, etc.).
- Angular CDK a11y primitives used here: `LiveAnnouncer`, `cdkTrapFocus` (not needed for this page but wired in shell), `FocusMonitor`, `A11yModule`.
- **@swimlane/ngx-charts** (Angular 21 compatible release) — used for `<ngx-charts-line-chart>`, `<ngx-charts-pie-chart>` (donut via `[doughnut]="true"`), and sparklines. ngx-charts reads colors from a `customColors` array and ambient CSS variables on its host, so the `--sys-*` layer drives chart palette directly.

## Key Technical Decisions

- **ngx-charts for all charts.** Rationale: requester chose it. ngx-charts is Angular-native, supports the line + donut + sparkline cases we need, has built-in a11y (ARIA roles on SVG), and accepts a `customColors` palette so we can drive it from our `--sys-*` tokens. Accept ~150 KB added bundle weight.
- **Dedicated `--sys-*` system-colors CSS variable layer (light mode only).** Rationale: single source of truth shared by Angular Material theme, Tailwind `@theme`, and ngx-charts `customColors`. Naming convention: `--sys-color-{semantic}` (accent, good, warn, danger, info, plus `-soft`, `-ink`, `-border` variants), `--sys-ink-{1..5}`, `--sys-bg`, `--sys-bg-elev`, `--sys-bg-sunken`, `--sys-bg-muted`, `--sys-bg-hover`, `--sys-line-{1..3}`, `--sys-shadow-{xs,sm,md,lg}`, `--sys-radius-{xs,sm,md,lg,xl,full}`, `--sys-font-{sans,display,mono}`. Values are the light theme from `public/styles.css`. Names are chosen so a future dark-mode plan only needs to add a `[data-theme="dark"]` override block — no consumer change.
- **Angular Material, used selectively.** Rationale: we want Material's `MatButton`, `MatIconButton`, `MatIcon`, `MatMenu` (range picker), `MatDivider`, `MatRipple`. We do **not** use `MatCard` for the dashboard cards because the mockup's card styling (soft shadow, 16px radius, custom head/body density) differs meaningfully — a plain `<section class="ch-card">` with our tokens is cleaner than overriding Material. Icons will use Material Symbols via `MatIcon` `registerFontClassAlias`, which replaces the inline `Ico` SVG set.
- **Tailwind v4 for layout, `--sys-*` variables for color/tokens.** Rationale: grid/flex/spacing/typography are faster in Tailwind utilities; the oklch palette lives in one place (the `--sys-*` layer) and is exposed to Tailwind via `@theme`. Avoids duplicating the palette in two places.
- **`@angular/cdk/a11y`** interpreted as "Angular Aria." Rationale: there is no package literally named "Angular Aria"; the CDK's a11y module is the canonical ARIA/accessibility toolkit in the Angular ecosystem. If the requester meant something else, call it out — nothing in this plan is hard to swap.
- **Signals + new control flow everywhere.** Rationale: Angular 21 idiom; `@for (k of kpis(); track k.lbl)` + `computed()` for derived alert count.
- **Dashboard component owns chart sub-components as private standalone children** (not exported library components yet). Rationale: YAGNI — we only have one consumer. Promote to `shared/` the second time they are used.
- **Shell (Sidebar + Topbar) is a layout component**, not part of the Dashboard page. Rationale: future pages will reuse it via a layout route.

## Open Questions

### Resolved During Planning

- "Angular Aria": resolved as `@angular/cdk/a11y` (stated assumption; easy to revise).
- Card primitive: resolved as custom `<section class="ch-card">` rather than `MatCard` (see Key Decisions).
- Icon source: resolved as Material Symbols via `MatIcon` (not the custom `Ico` SVG set in `public/icons.jsx`). Keeps a single icon system.

### Deferred to Implementation

- Exact Material Symbols names per icon (e.g., `dashboard`, `group`, `shield_person`, `inventory_2`, `receipt_long`, `insights`, `support_agent`, `notifications`, `history`, `settings`, `lock`) — confirm during implementation by scanning Material Symbols.
- Whether the sparkline needs responsive width or the mockup's fixed 72×28 is sufficient inside the KPI card — decide once the card is rendered at real widths.
- Whether to use Tailwind v4 `@theme` or plain CSS vars for color tokens — Tailwind v4 supports both; pick whichever is cleaner after the first card lands.

## Output Structure

```
src/
  app/
    app.ts                              (modified: shell layout + router outlet)
    app.html                            (modified)
    app.css                             (modified)
    app.config.ts                       (modified: provideAnimations)
    app.routes.ts                       (modified: dashboard route + redirect)
    core/
      system-colors.css                 (new: --sys-* variables, light mode only)
      chart-theme.ts                    (new: helpers that read --sys-* at runtime for ngx-charts customColors)
    layout/
      shell/
        shell.ts                        (new: sidebar + topbar + <router-outlet/>)
        shell.html
        shell.css
      sidebar/
        sidebar.ts                      (new)
        sidebar.html
        sidebar.css
        nav.data.ts                     (new: NAV groups)
      topbar/
        topbar.ts                       (new)
        topbar.html
        topbar.css
    pages/
      dashboard/
        dashboard.ts                    (new: DashboardPage)
        dashboard.html
        dashboard.css
        dashboard.spec.ts               (new)
        fixtures.ts                     (new: ACTIVITY, ALERTS, KPIS, SERIES, DONUT_DATA)
        components/
          kpi-card/
            kpi-card.ts                 (new: wraps ngx-charts sparkline)
            kpi-card.html
            kpi-card.css
          feed-list/
            feed-list.ts                (new)
            feed-list.html
            feed-list.css
src/styles.css                          (modified: import system-colors.css, @theme)
```

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
App (standalone root)
 └─ ShellComponent (layout; holds a11y landmarks: <aside role=navigation>, <header role=banner>, <main>)
     ├─ SidebarComponent   (NAV groups, active-item signal)
     ├─ TopbarComponent    (title/crumb from route data, search, actions)
     └─ <router-outlet/>
         └─ DashboardComponent
             ├─ Page header  (greeting + range MatMenu + Export MatButton)
             ├─ KPI grid     (4× KpiCardComponent, each wraps <ngx-charts-line-chart> in sparkline mode)
             ├─ Row 2        (<ngx-charts-line-chart>  |  <ngx-charts-pie-chart [doughnut]=true> + legend)
             └─ Row 3        (FeedListComponent "Recent activity" | FeedListComponent "Alerts")
```

Page-level responsive behavior: 12-column CSS Grid via Tailwind (`grid-cols-12`). KPI row is `grid-cols-4` at ≥1280px, collapses to 2 then 1; the two main content rows each use `grid-cols-12` with a `col-span-8 / col-span-4` split to match the mockup screenshot.

Chart a11y: ngx-charts emits accessible SVG out of the box (tooltips, legend-as-list). We supplement with an ambient `<h3>` card title and `LiveAnnouncer.announce()` emits "Showing last 30 days" on range change.

## Implementation Units

- [ ] **Unit 1: Install Material + CDK + ngx-charts, wire animations, author the `--sys-*` system-colors layer**

**Goal:** Install Angular Material, CDK, and ngx-charts; register animations; author the single `--sys-*` system-colors CSS layer that all downstream surfaces (Material theme overrides, Tailwind `@theme`, ngx-charts palettes) will consume.

**Requirements:** R3, R6, R6b

**Dependencies:** None

**Files:**
- Modify: `package.json` (added by `ng add` + explicit `npm install @swimlane/ngx-charts d3`)
- Modify: `src/app/app.config.ts`
- Create: `src/app/core/system-colors.css`
- Create: `src/app/core/chart-theme.ts`
- Modify: `src/styles.css`
- Modify: `src/index.html` (Material Symbols + Google Fonts links from `public/ControlHub.html` head)

**Approach:**
- Run `ng add @angular/material` (accept defaults; we'll override colors via `--sys-*`).
- `npm install @swimlane/ngx-charts d3` (ngx-charts requires d3 as a peer). Verify the installed ngx-charts version supports Angular 21; if not, pin to the latest compatible release.
- Add `provideAnimations()` to `app.config.ts` (ngx-charts also depends on this).
- Author `src/app/core/system-colors.css` with a single `:root` block defining every `--sys-*` variable (see Key Technical Decisions for the naming convention: `--sys-color-accent`, `--sys-color-accent-soft`, `--sys-color-good`, `--sys-color-warn`, `--sys-color-danger`, `--sys-color-info` + their `-soft/-ink/-border` forms; `--sys-ink-1..5`; `--sys-bg`, `--sys-bg-elev`, `--sys-bg-sunken`, `--sys-bg-muted`, `--sys-bg-hover`; `--sys-line-1..3`; `--sys-shadow-xs/sm/md/lg`; `--sys-radius-xs/sm/md/lg/xl/full`; `--sys-font-sans/display/mono`). Values come verbatim from the light-mode block in `public/styles.css` (lines 1–69). Dark-mode overrides are deferred to a later plan.
- In `src/styles.css`: keep `@import 'tailwindcss'`, add `@import './app/core/system-colors.css'`, and add a Tailwind v4 `@theme` block mapping `--sys-*` to Tailwind tokens (e.g., `--color-sys-accent: var(--sys-color-accent)`, `--color-sys-ink-1: var(--sys-ink-1)`, `--color-sys-bg-elev: var(--sys-bg-elev)`, `--radius-sys-md: var(--sys-radius-md)`). Add a base rule `html { font-family: var(--sys-font-sans); background: var(--sys-bg); color: var(--sys-ink-1); }`.
- Also in `src/styles.css`, override Angular Material's design tokens to read from `--sys-*` (e.g., `--mat-sys-primary: var(--sys-color-accent); --mat-sys-surface: var(--sys-bg-elev); --mat-sys-on-surface: var(--sys-ink-1);` etc.), scoped under `html`.
- `chart-theme.ts` exports helpers for ngx-charts consumers: `chartColors(keys: string[])` returns a `customColors` array of `{ name, value }` where `value` is the *resolved* color from `getComputedStyle(document.documentElement).getPropertyValue('--sys-color-...')`. Also exports a `domainPalette` with the four canonical hues used for the donut (accent / good / warn / info) and a single-color helper for the line chart and sparklines.
- Copy the Google Fonts `<link>` tags and add a Material Symbols `<link>` to `src/index.html`.

**Patterns to follow:**
- `public/styles.css` lines 1–110 for the exact oklch values.

**Test scenarios:**
- Happy path: a small spec renders a host div, calls `chartColors(['Direct','Search','Referral','Email'])`, and asserts each returned `value` is a non-empty oklch string matching the light-mode palette.
- Edge case: `chartColors([])` returns `[]` without throwing.
- Robustness: `chartColors` re-reads CSS variables on each call (no internal cache), so a future dark-mode plan can flip `data-theme` and charts will recolor on next render. Assert via a spec that temporarily rewrites a `--sys-*` variable at runtime and confirms the next `chartColors()` call returns the new value.

**Verification:**
- `ng build` succeeds.
- A throwaway `<div class="bg-sys-bg-elev text-sys-ink-1">` in `app.html` renders with the warm neutral palette from the mockup.
- A smoke `<ngx-charts-pie-chart>` with dummy data picks up the accent/good/warn/info hues from `--sys-*` via `customColors`.

- [ ] **Unit 2: App shell — Sidebar + Topbar + router outlet**

**Goal:** Introduce a `ShellComponent` that renders Sidebar, Topbar, and `<router-outlet>`, matching the mockup's chrome. Wire the default route to redirect to `/dashboard`.

**Requirements:** R1, R4, R5, R7

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/layout/shell/shell.{ts,html,css}`
- Create: `src/app/layout/sidebar/sidebar.{ts,html,css}`
- Create: `src/app/layout/sidebar/nav.data.ts`
- Create: `src/app/layout/topbar/topbar.{ts,html,css}`
- Modify: `src/app/app.ts`, `src/app/app.html`, `src/app/app.css`
- Modify: `src/app/app.routes.ts`

**Approach:**
- `nav.data.ts` ports `NAV` from `public/shell.jsx` lines 3–25 (groups: Overview / People / Operations / Support / System; ids, labels, Material Symbol names, optional badges).
- `SidebarComponent`: standalone; signals for `collapsed` and `currentId` (input); renders a `<nav aria-label="Primary">` with `<ul>` grouped by section. Each item is a `<a routerLink ... routerLinkActive>` with `MatIcon` + label + optional badge. Collapse button uses `MatIconButton` + `MatTooltip`. Keyboard: native focus works; use `cdkMonitorSubtreeFocus` lightly for visual focus ring parity with mockup.
- `TopbarComponent`: standalone; inputs for `title` and `crumb`, both from route data; search uses a plain `<input>` styled with Tailwind; theme/notifications/profile buttons are `MatIconButton` with `aria-label`. Avatar block is a simple styled element.
- `ShellComponent` composes both with a CSS grid: `[sidebar] [main]` columns; `<main id="content" tabindex="-1">` wrapping `<router-outlet>`. Include a skip-link (`<a href="#content" class="sr-only focus:not-sr-only">Skip to content`) — classic CDK a11y pattern.
- `app.routes.ts`: single parent route with `component: ShellComponent` and children `{ path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent), data: { title: 'Dashboard', crumb: 'Home · Overview' } }` plus `{ path: '', pathMatch: 'full', redirectTo: 'dashboard' }`.
- `TopbarComponent` reads `ActivatedRoute` data for title/crumb so future pages plug in with no topbar change.

**Patterns to follow:**
- `public/shell.jsx` lines 27–119 for visual structure (class names → Tailwind utilities + scoped CSS).
- Mockup image for proportions: sidebar width ≈ 240px, topbar height ≈ 56px.

**Test scenarios:**
- Happy path: Navigating to `/` redirects to `/dashboard` and the Dashboard nav item carries `aria-current="page"`.
- Happy path: Topbar title and crumb read `"Dashboard"` and `"Home · Overview"` when on `/dashboard`.
- Edge case: Clicking the collapse button sets an `aria-expanded` attribute on the sidebar toggle and hides labels (visual class change).
- A11y: The `<nav>` has `aria-label="Primary"`, the `<main>` is focusable via skip-link, and nav items are reachable by Tab in document order.

**Verification:**
- Visiting `/` renders the shell with Sidebar on the left, Topbar on top, and an empty main area that will later host the Dashboard.
- Keyboard-only: Tab sequence is skip-link → topbar actions → sidebar nav → main; no focus traps.

- [ ] **Unit 3: Fixture shapes + ngx-charts data adapters**

**Goal:** Define fixture data in the shapes ngx-charts expects, plus tiny adapters that convert our domain data to ngx-charts `series`/`results` inputs. No chart components are authored — the Dashboard consumes `<ngx-charts-line-chart>` and `<ngx-charts-pie-chart>` directly in Unit 6.

**Requirements:** R2, R5, R6b

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/pages/dashboard/fixtures.ts`
- Create: `src/app/pages/dashboard/chart-data.ts`

**Approach:**
- `fixtures.ts` exports typed constants (copied/reshaped from `public/pages-1.jsx` lines 8–17 and 68–73 + `public/data.jsx`):
  - `KPIS: KpiDef[]` — label, value, delta, dir, meta, spark (number[]), tone ('accent'|'good'|'warn'|'info').
  - `GROWTH_SERIES_RAW` — two number arrays (signups + WAU) plus `DAYS` labels, from `public/pages-1.jsx` lines 13–17.
  - `TRAFFIC_MIX_RAW` — four `{ label, value, tone }` entries (Direct/Search/Referral/Email → accent/good/warn/info).
  - `ACTIVITY` and `ALERTS` — from `public/data.jsx`.
- `chart-data.ts` exports three adapters:
  - `toLineSeries(raws: { name: string; data: number[] }[], labels: string[]): Series[]` → ngx-charts `[{ name, series: [{ name: label, value }] }]`.
  - `toPieResults(raw: { label; value }[]): Result[]` → ngx-charts `[{ name, value }]`.
  - `toSparkSeries(data: number[]): Series[]` → single series shape for `<ngx-charts-line-chart>` in compact mode (used inside KPI card, Unit 4).
- No component files here — ngx-charts components are consumed directly where used. This keeps the indirection minimal.

**Patterns to follow:**
- ngx-charts docs for `Series` and `Result` shapes.
- `public/pages-1.jsx` lines 8–73 for the raw values.

**Test scenarios:**
- Happy path: `toLineSeries([{ name: 'Signups', data: [1,2,3] }, { name: 'WAU', data: [4,5,6] }], ['a','b','c'])` returns two series, each with three `{ name, value }` points.
- Edge case: mismatched lengths (labels shorter than data) truncates to the shortest — document the behavior and assert.
- Happy path: `toPieResults([{ label: 'Direct', value: 4820 }, ...])` returns four results preserving order.
- Happy path: `toSparkSeries([12,15,14])` returns a single series with three points.

**Verification:**
- Specs pass under `vitest`.
- Data adapters produce inputs that render without errors when piped into a smoke `<ngx-charts-line-chart>` and `<ngx-charts-pie-chart>`.

- [ ] **Unit 4: KPI card (wraps ngx-charts sparkline)**

**Goal:** Build a reusable `KpiCardComponent` that composes an `<ngx-charts-line-chart>` in compact sparkline mode.

**Requirements:** R2, R5, R6, R6b

**Dependencies:** Unit 3

**Files:**
- Create: `src/app/pages/dashboard/components/kpi-card/kpi-card.{ts,html,css}`

**Approach:**
- `KpiCardComponent` inputs: `{ label; value; delta; dir: 'up'|'down'; meta; spark: number[]; tone: 'accent'|'good'|'warn'|'info' }`. Template follows `public/pages-1.jsx` lines 33–43: label, bold value (tabular-nums), delta with up/down `mat-icon`, meta line, sparkline in the top-right corner. Delta turns green for `up` and red for `down` via `--sys-color-good`/`--sys-color-danger` classes.
- Sparkline is `<ngx-charts-line-chart>` with `[view]="[72, 28]"`, axes hidden (`[xAxis]=false [yAxis]=false`), legend hidden, no grid, no ref lines, `[autoScale]=true`, `[curve]="curveMonotoneX"`, and `[customColors]="colors()"` where `colors()` is a computed signal that calls `chartColors(['spark'])` from `chart-theme.ts` and substitutes the tone color for the single series name `'spark'`.
- The series input comes from `toSparkSeries(spark)` in `chart-data.ts`.
- Card container is a plain `<section class="ch-card">` (class defined in `dashboard.css` or a shared card style, consuming `--sys-bg-elev`, `--sys-line-1`, `--sys-shadow-sm`, `--sys-radius-lg`).

**Patterns to follow:**
- `public/pages-1.jsx` lines 32–44.
- Mockup screenshot for KPI row proportions and the muted meta-text color.

**Test scenarios:**
- Happy path: renders label, formatted value, and meta string exactly as passed.
- Happy path: `dir='up'` applies an `.up` class and shows an up arrow icon; `dir='down'` shows a down arrow and `.down` class.
- Edge case: `spark=[]` skips the ngx-charts element entirely (conditional `@if (spark.length > 0)`) and does not throw.
- A11y: delta has `aria-label` like `"up 8.2% versus last 30 days"` so screen readers get the full comparison; the sparkline chart is marked `aria-hidden="true"` because the numeric value and delta already communicate the trend.

**Verification:**
- Rendered in isolation, the card matches the mockup's "Active users 4,218 +8.2%" tile (spacing, typography weight 550, sparkline tinted with `--sys-color-accent`).

- [ ] **Unit 5: Feed list for Recent activity + Alerts**

**Goal:** Build a single `FeedListComponent` that renders both the activity feed and the alerts feed with slightly different visual affordances.

**Requirements:** R2, R5

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/pages/dashboard/components/feed-list/feed-list.{ts,html,css}`

**Approach:**
- Inputs: `{ items: FeedItem[]; variant?: 'activity' | 'alerts' }` where `FeedItem = { icon: string; title: string; subtitle?: string; time: string; tone?: 'default'|'danger'|'accent' }`.
- Template mirrors `public/pages-1.jsx` lines 94–126: each row has a rounded icon tile on the left (colored by `tone`), primary text with bold spans, optional subtitle, and muted time line.
- `alerts` variant renders each row as a `<button type="button" cdkMonitorElementFocus>` so it is focusable and announces itself (future drawer hookup); `activity` rows are non-interactive `<li>`.
- `<ul role="list">` wrapper inside a `ch-card`.

**Patterns to follow:**
- `public/pages-1.jsx` lines 93–127.

**Test scenarios:**
- Happy path (activity): renders N `<li>` items with icon, title, time; no button role.
- Happy path (alerts): renders N `<button>` rows; first row has tone `danger` (styled with `--danger-soft` background, `--danger` icon).
- Edge case: empty `items` array renders a single "No items yet" empty state (small muted text).
- A11y: the wrapping `<ul>` has `role="list"`; each alert button has an accessible name from title + time.

**Verification:**
- Activity feed matches the mockup's left column ("Recent activity — Actions across your workspace"); Alerts feed matches the right column ("Alerts — Requires attention") including the red tile for "Unusual spike in failed logins".

- [ ] **Unit 6: DashboardComponent — compose the page**

**Goal:** Assemble all building blocks into the Dashboard page, matching `public/images/dashboard.png`.

**Requirements:** R1, R2, R3, R5, R7

**Dependencies:** Units 2, 3, 4, 5

**Files:**
- Create: `src/app/pages/dashboard/dashboard.{ts,html,css}`
- Create: `src/app/pages/dashboard/dashboard.spec.ts`

**Approach:**
- Standalone component; imports `MatButtonModule`, `MatIconModule`, `MatMenuModule`, `MatDividerModule`, `A11yModule`, `NgxChartsModule` (from `@swimlane/ngx-charts`), plus `KpiCardComponent` and `FeedListComponent`.
- State via signals: `range = signal<'30d'|'90d'|'1y'>('30d')`, a `computed()` helper for the chart title suffix, and `lineSeries = computed(() => toLineSeries(GROWTH_SERIES_RAW, DAYS))` / `pieResults = computed(() => toPieResults(TRAFFIC_MIX_RAW))`. Range selection goes through a `MatMenu` opened by the "Last 30 days" button.
- Chart palettes come from `chart-theme.ts`: `lineColors = computed(() => chartColors(['Signups','WAU']))` maps to `--sys-color-accent` + `--sys-color-info`; `pieColors = computed(() => chartColors(['Direct','Search','Referral','Email']))` maps to accent/good/warn/info.
- Inject `LiveAnnouncer` and call `announce(`Showing last ${range()}`)` when the range changes.
- Page structure (Tailwind utilities with scoped CSS for card/token specifics):
  1. Greeting header: `<h1>Good morning, Amelia</h1>` + subtitle, with range MatMenu button and Export MatButton aligned right.
  2. KPI grid: `<div class="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">` with 4 `<app-kpi-card>`.
  3. Row: `grid grid-cols-12 gap-4` → `col-span-8` "Growth & usage" card containing `<ngx-charts-line-chart [results]="lineSeries()" [customColors]="lineColors()" [xAxis]="true" [yAxis]="true" [gradient]="false" [showGridLines]="true" [curve]="curveMonotoneX" [autoScale]="true" [legend]="false">`; `col-span-4` "Traffic mix" card containing `<ngx-charts-pie-chart [results]="pieResults()" [doughnut]="true" [arcWidth]="0.35" [customColors]="pieColors()" [labels]="false" [legend]="false">` plus a custom legend `<ul>` beside it (matches the mockup's labeled list with counts).
  4. Row: same 8/4 split → `<app-feed-list variant="activity">` and `<app-feed-list variant="alerts">`.
- Cards reuse the `ch-card` class from Unit 4.
- Page-level `<h1>` matches the mockup's bold display weight; the topbar's smaller "Dashboard" title still renders above via the shell.
- Chart sizing: both charts use ngx-charts' default responsive mode (fill parent). Set fixed heights on their wrapping divs (`h-64` for line, `h-48` for pie) to match the mockup.

**Patterns to follow:**
- `public/pages-1.jsx` lines 19–131 for structure.
- `public/images/dashboard.png` for final visual fidelity — this is the acceptance target.

**Test scenarios:**
- Happy path: route `/dashboard` renders 4 KPI cards, one line chart, one donut, two feed lists.
- Happy path: opening the range menu and selecting "90d" updates the button label to "Last 90 days" and triggers a `LiveAnnouncer` announcement (spy on `announce`).
- Edge case: with an empty `ALERTS` fixture, the Alerts feed renders its empty state and the page still lays out cleanly.
- A11y: `<h1>` exists exactly once on the page; range-picker button has `aria-haspopup="menu"`; Export button has a visible label.
- Integration: KPI card `dir='down'` (Active sessions, −3.1%) renders with the red delta class end-to-end.

**Verification:**
- Visual: side-by-side with `public/images/dashboard.png`, layout proportions, spacing, typography, and color accents match within a small tolerance (no hard-coded px targets — eyeball parity).
- `ng build` passes; `vitest` suite passes; no console a11y warnings from Angular.
- Keyboard-only walkthrough: Tab reaches every interactive element; range menu opens with Enter/Space, selections announce.

## System-Wide Impact

- **Interaction graph:** `app.routes.ts` becomes non-empty; `AppComponent` now hosts the shell instead of a placeholder. Anything that assumed the root renders only a `<router-outlet>` needs to be aware of the wrapping shell.
- **Error propagation:** None — UI-only, static data.
- **State lifecycle risks:** None — no persistence.
- **API surface parity:** No exported types yet; all new components are page-local.
- **Integration coverage:** Router + shell + dashboard chain is exercised by Unit 6's spec.
- **Unchanged invariants:** Tailwind v4 pipeline (`@import 'tailwindcss'`), Angular 21 standalone bootstrap in `src/main.ts`, existing `angular.json` build config — none of these change.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Material's default theme fights our `--sys-*` tokens (e.g., MatButton background looks off). | Override Material's `--mat-sys-*` CSS variables in `src/styles.css` to point at `--sys-*` (`--mat-sys-primary: var(--sys-color-accent)`, `--mat-sys-on-surface: var(--sys-ink-1)`, etc.). |
| Tailwind v4 `@theme` syntax mismatch with chosen Tailwind version. | Tailwind v4.1 is in `package.json`; verify `@theme` block during Unit 1 and fall back to referencing `--sys-*` directly via arbitrary values (`bg-[var(--sys-bg-elev)]`) if needed. |
| Material Symbols not loading (blocked CDN, etc.). | Use `@angular/material` icon registry to register an SVG fallback, or self-host the font — decided at implementation time in Unit 1. |
| Visual drift from the screenshot. | Unit 6 verification explicitly compares against `public/images/dashboard.png`; keep the mockup's `styles.css` open while tuning. |
| ngx-charts doesn't ship a version compatible with Angular 21 yet. | Check compatibility in Unit 1 before committing to the install. Fallbacks: (a) use the latest release and accept a peer-dependency warning if the API is unchanged, (b) pin Angular to the version ngx-charts supports, or (c) fall back to hand-rolled SVG (the math from `public/shell.jsx` is still available). Decide in Unit 1 so downstream units aren't blocked. |
| ngx-charts' default styling (axis ticks, gridlines, tooltips) doesn't match the mockup's soft aesthetic. | Override ngx-charts CSS selectors in `dashboard.css` using `--sys-ink-4` for ticks, `--sys-line-1` for gridlines, `--sys-bg-elev` + `--sys-shadow-md` for tooltips. ngx-charts classes are stable and well-documented. |
| ngx-charts adds ~150 KB to the bundle. | Accepted cost for richer interactivity (tooltips, hover states) than hand-rolled SVG would give. Revisit only if bundle size becomes a product concern. |
| `customColors` uses raw resolved strings, which locks the chart palette at the moment `computed()` runs. | Not a concern for this plan (light mode only). When the future dark-mode plan lands, the theme toggle will flip a signal that invalidates the consuming `computed()` so ngx-charts re-renders with the new palette. Noted for that plan. |

## Documentation / Operational Notes

- Update `README.md` with a "Run the app" section once the dashboard is live (`npm start`, open `http://localhost:4200/dashboard`).
- No rollout, monitoring, or migration concerns.

## Sources & References

- Origin mockup HTML: `public/ControlHub.html`
- Dashboard page source: `public/pages-1.jsx` (lines 6–131)
- Shell + chart primitives: `public/shell.jsx`
- Design tokens: `public/styles.css`
- Fixture data: `public/data.jsx`
- Visual target: `public/images/dashboard.png`
- Angular scaffold: `src/app/app.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/styles.css`
- Angular Material v21 + CDK a11y (external)
- Tailwind v4 `@theme` (external)

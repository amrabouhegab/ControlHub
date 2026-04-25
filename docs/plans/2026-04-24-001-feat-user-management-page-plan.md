---
title: "feat: Angular User Management page matching public/ mockup"
type: feat
status: active
date: 2026-04-24
origin: docs/brainstorms/2026-04-24-user-management-page-requirements.md
---

# feat: Angular User Management page matching public/ mockup

## Overview

Port the ControlHub **User Management** page from the React mockup (`public/pages-1.jsx` `UsersPage`, lines 133–370) into the Angular 21 app under `src/`, pixel-close to `public/images/user-management.png`. Adds a `/users` route inside the existing shell, renders a searchable/sortable/filterable user table with multi-select bulk actions, row status toggle, right-side detail drawer, and an invite-user dialog. Mutations are kept in an injectable signal-backed store, persisted to `localStorage`, and hydrated from the seed fixture in `public/data.jsx` `USERS`. No new third-party libraries — composes primitives already installed by the Dashboard plan.

## Problem Frame

The Dashboard is live and the sidebar's "User Management" entry currently routes nowhere. The React mockup and the screenshot both fully specify the page. The origin requirements doc resolved full-parity scope and in-memory + `localStorage` persistence for mutations. This plan translates that into Angular 21 units that reuse the shell, `--sys-*` tokens, Angular Material selectively, and CDK overlays.

## Requirements Trace

- R1. A `/users` child route under `ShellComponent` renders the User Management page with route data `{ title: 'User Management', crumb: 'People · Users' }`; the sidebar's "User Management" item shows `aria-current="page"` when active (see origin: Scope > Route + Sidebar state).
- R2. Page header renders `<h1>User Management</h1>`, a subtitle of the form `{N} people, {A} active. Manage roles, status, and access across the workspace.`, and right-aligned `Import CSV` (visual-only) and `Invite user` (opens dialog) actions (see origin: Page header).
- R3. A toolbar card above the table provides: search input (filters by name or email), Role filter chip (cycles `All → Admin → Operations → Support → Viewer`), Status filter chip (cycles `All → active → inactive → pending`). When ≥1 row is selected, contextual actions `Email` (visual-only), `Change role` (popover with four roles), and `Deactivate` (bulk-sets `status='inactive'`) appear right-aligned along with a `{N} selected` indicator.
- R4. The table renders columns `(checkbox) · User · Role · Status · Department · Last seen · Actions`, with click-to-sort on User / Role / Status / Department / Last seen (visual direction indicator), default sort Last seen descending. Row Actions cell contains a status toggle, a view-icon button (opens drawer), and an overflow `…` icon button (visual-only menu). Clicking the user name also opens the drawer.
- R5. Status chip colors match the mockup: `active` green, `inactive` neutral, `pending` warn. Role displays as a neutral chip.
- R6. Pager shows `Showing X–Y of Z`, numbered buttons, prev/next. 5 rows per page so the seed fixture (12 users) displays the "1 2 3" state visible in the screenshot. Default page = 1; any filter/search change resets to page 1.
- R7. A right-side detail drawer opens on user-name click or view-icon click. Shows large avatar, name, role · department, status + optional MFA chip, a details grid (User ID, Email, Joined, Last seen, Sessions), a Recent activity list filtered from the existing `AUDIT` fixture by actor name, and footer buttons `Close` + `Edit user` (visual-only). Escape and overlay click close it. Focus traps while open and returns to the invoking control on close.
- R8. An "Invite a new user" dialog opens from the header action. Fields: First name, Last name, Work email (required, must contain `@`), Role, Department, Personal note, and a pre-checked "Require MFA enrollment on first login" checkbox. `Send invitation` appends a new row with `status='pending'`, `lastSeen='never'`, `joined=today`, generated `id` and `h` (avatar hue 1..7) and closes the dialog. `Cancel` closes with no changes.
- R9. Empty state: when filters match zero rows, the table body renders a centered "No users match your filters" block with a `Clear filters` button.
- R10. `USERS` is hydrated from `localStorage` on first load (falling back to the seed fixture in `public/data.jsx`); every mutation (toggle, bulk deactivate, change role, invite) writes back. A tiny `Reset demo data` link in the pager row restores the seed fixture.
- R11. Keyboard-only flow: skip-link → topbar → sidebar → main → toolbar → row checkboxes/actions → pager. Drawer and dialog trap focus and restore it on close. Filter/result-count changes announce via `LiveAnnouncer`.
- R12. Implementation uses Angular 21 idioms: standalone components, signals + `computed`/`effect`, new control flow (`@for`, `@if`), `inject()`, and reads tokens from the existing `--sys-*` layer.

## Scope Boundaries

- `Import CSV` button is rendered and does nothing when clicked.
- Bulk `Email` action is rendered and does nothing when clicked.
- Row overflow `…` menu opens an empty `MatMenu` (placeholder) — menu items deferred.
- Drawer's `Edit user` button is visual-only; no edit form exists in this plan.
- No dark mode — inherits light-mode-only stance.
- No responsive polish below ~1024px; desktop is the visual target.
- No server integration, no auth.

### Deferred to Separate Tasks

- **Edit-user form** (drawer or dedicated page): separate plan.
- **Roles & Permissions page**: separate plan; drawer's role link is plain text for now.
- **Audit Logs page**: separate plan; drawer's activity list stays inline.
- **CSV import pipeline**: separate plan.
- **Overflow `…` menu contents** (Reset password / Copy ID / Send email): separate plan or ad-hoc.
- **Responsive / mobile layout** (<1024px): separate plan.

## Context & Research

### Relevant Code and Patterns

- `public/pages-1.jsx` lines 133–370 — **behavioral source of truth** (`UsersPage`, sort, filter, pager, drawer, modal).
- `public/images/user-management.png` — **visual source of truth**; layout, spacing, chip density, pager state.
- `public/shell.jsx` lines 121–193 — reference for `Drawer`, `Modal`, `StatusChip` semantics (classes, close behavior, chip color mapping). Rendering uses Angular Material / CDK equivalents in this port.
- `public/data.jsx` lines 3–15 — `USERS` seed fixture (id, name, email, role, status, lastSeen, dept, joined, h, mfa, sessions).
- `public/data.jsx` — `AUDIT` (for drawer's Recent activity) and `ROLES` (for role-chip filter list).
- `public/styles.css` — `.chip`, `.chip.good/.warn/.danger/.info`, `.dt` table styles, `.pager`, `.filter-chip`, `.avatar`, `.toggle` — port the relevant visual treatments into the page's scoped CSS using `--sys-*` tokens.
- `src/app/layout/shell/shell.ts` + `src/app/app.routes.ts` — shell already exists from the Dashboard plan; extend the routes table.
- `src/app/layout/sidebar/nav.data.ts` — already contains `{ id: 'users', label: 'User Management', icon: 'group' }`; no change.
- `src/app/pages/dashboard/components/feed-list/feed-list.ts` — reference for ch-card composition, `@for` / `@if` idioms, signal inputs, and `role="list"` conventions.
- `src/app/pages/dashboard/components/kpi-card/kpi-card.ts` — reference for standalone component scaffolding and `--sys-*` consumption.
- `src/app/core/system-colors.css` — consumes `--sys-color-good`, `--sys-color-warn`, `--sys-ink-{1..5}`, `--sys-bg-elev`, `--sys-line-1`, `--sys-radius-lg`, etc.

### Institutional Learnings

- `docs/solutions/` not populated yet — none to apply.

### External References

- Angular Material v21 `MatDialog` (invite-user dialog), `MatMenu` (Change-role popover; row overflow placeholder), `MatSlideToggle` (row status toggle), `MatCheckbox` (header + row selection, Require-MFA checkbox), `MatFormField` + `MatInput` (dialog form), `MatSelect` (Role/Department selects), `MatIcon` + `MatIconButton` (toolbar and row actions), `MatTooltip` (icon-button labels).
- Angular CDK overlays for the right-side drawer: prefer `CdkConnectedOverlay` / `OverlayModule` — `MatDrawer` pulls in the `MatSidenav` container which the shell already handles differently; rolling a small overlay-backed drawer is cheaper than retrofitting the shell. Alternative: `@angular/material/bottom-sheet` is wrong shape; `MatDialog` with custom position config gives a side-anchored panel with built-in focus trap — this is the chosen primitive (see Key Decisions).
- `@angular/cdk/a11y` `LiveAnnouncer` for filter/result announcements; focus trap comes for free inside `MatDialog`.

## Key Technical Decisions

- **User store is a single `UsersStore` service (providedIn `'root'`)** owning `users = signal<User[]>()`, with `computed` selectors for filtered/sorted/paged views and explicit mutation methods (`toggleStatus`, `bulkSetStatus`, `bulkSetRole`, `invite`, `resetToDemo`). Rationale: centralizes the localStorage adapter in one place; components stay dumb; future server swap replaces one file. One `effect()` watches `users()` and writes JSON to `localStorage` under a namespaced key (`ch.users.v1`). Hydration happens in the constructor: read the key, validate shape lightly, fall back to the seed fixture on any parse error.
- **Drawer is rendered via `MatDialog` with a right-anchored position config**, not a custom overlay or `MatDrawer`. Rationale: `MatDialog` already provides focus trap, escape-to-close, scroll lock, and focus restoration, all of which we need. A right-aligned position and a tall-narrow `width` / `maxHeight` config give the same visual result as the mockup's side panel. Keeps the shell untouched.
- **Invite dialog also uses `MatDialog`.** Rationale: standard use; reuses the same overlay infrastructure.
- **Reactive Forms for the invite dialog.** Rationale: two required fields with validation (name, email-with-@) plus four selects and a textarea is where template-driven forms start to bite; `FormGroup` + `Validators.required` + `Validators.pattern(/@/)` is cleaner. Reuse the same pattern in any future edit form.
- **Chips, avatars, and table density are scoped CSS in the page's `.css` file (not shared yet),** built on `--sys-*` tokens. Rationale: YAGNI — only this page consumes them today; promote to `src/app/shared/` the second time they are used. Exception: `StatusChip` is extracted as a tiny standalone component because it is used in both the table and the drawer (two consumers already).
- **Pager at 5 rows per page** to reproduce the screenshot's "1 2 3" state from the existing 12-user fixture. Rationale: avoids inflating the seed fixture just for a visual tell; filter/search still feel realistic.
- **Sorting and filtering are entirely derived `computed()` chains** from the store's signal. Rationale: single source of truth; automatically reactive to mutations; no manual "refilter" plumbing.
- **`LiveAnnouncer` announces the visible result count** whenever filters/search change (debounced in `effect()` via `toSignal` on the search input — or simpler: announce only on chip clicks and empty-state transitions). Rationale: avoids chattiness while preserving a11y parity with the Dashboard.

## Open Questions

### Resolved During Planning

- **Seed count vs. per-page (origin open question):** resolved as 5 per page with the existing 12 rows → three pages (visually matches the "1 2 3" pager).
- **Reset demo data placement (origin open question):** resolved as a small muted link in the pager row (`Reset demo data`) on the far right, visible only when `localStorage` is non-empty. Cheap, discoverable, out of the main toolbar.
- **Bulk Change-role UI (origin open question):** resolved as a `MatMenu` anchored to the `Change role` button with the four roles listed; selecting one calls `bulkSetRole(selectedIds, role)` and clears the selection.
- **Row overflow `…` menu (origin open question):** resolved as an empty `MatMenu` placeholder to preserve column composition without implementing deferred actions. The button is still focusable and labeled for a11y.
- **Drawer primitive:** `MatDialog` with right-anchor position config (see Key Decisions).
- **Invite "Send" behavior:** appends a `status='pending'` row (origin decided).

### Deferred to Implementation

- Exact `Material Symbols` names per toolbar/row icon (expected candidates: `search`, `filter_list`, `upload`, `person_add`, `mail`, `edit`, `delete`, `visibility`, `more_horiz`, `chevron_left`, `chevron_right`, `check`, `shield`, `close`). Confirm when authoring.
- Whether the search input debounces its filter (50 ms vs. immediate). Default to immediate; add debouncing only if typing feels laggy with 12 rows.
- Whether avatar hue `h` (1..7) maps to deterministic `--sys-*` colors or to the existing tokens used by `public/styles.css` `.avatar[data-h]`. Port whatever the mockup renders; decision is styling-only.
- Whether to validate email with `Validators.email` (RFC-shaped) or the lighter `Validators.pattern(/@/)` specified in requirements. Start lighter; upgrade if it feels inadequate.

## Output Structure

```
src/
  app/
    pages/
      users/
        users.ts                              (new: UsersPageComponent)
        users.html
        users.css
        users.spec.ts                         (new)
        users.store.ts                        (new: UsersStore service + User types)
        users.store.spec.ts                   (new)
        fixtures.ts                           (new: seed USERS + AUDIT slice)
        components/
          status-chip/
            status-chip.ts                    (new: standalone)
            status-chip.html
            status-chip.css
          users-table/
            users-table.ts                    (new: standalone)
            users-table.html
            users-table.css
          user-detail-drawer/
            user-detail-drawer.ts             (new: MatDialog content)
            user-detail-drawer.html
            user-detail-drawer.css
          invite-user-dialog/
            invite-user-dialog.ts             (new: MatDialog content)
            invite-user-dialog.html
            invite-user-dialog.css
    app.routes.ts                             (modified: add /users child route)
```

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
UsersPageComponent (route /users)
 ├─ header             ( <h1>, subtitle, Import CSV (visual), Invite user button )
 ├─ <section ch-card>
 │    ├─ toolbar       ( search input, Role chip, Status chip, selection indicator + bulk actions )
 │    ├─ <app-users-table [rows]="pagedUsers()" [sort]="sort()" [selection]="selection()" ... />
 │    └─ pager         ( "Showing X–Y of Z" + numbered buttons + prev/next + Reset demo link )
 └─ (overlays opened via MatDialog)
      ├─ UserDetailDrawerComponent   (right-anchored dialog: avatar block, details grid, recent activity from AUDIT)
      └─ InviteUserDialogComponent    (centered dialog: reactive form, "Send invitation" appends pending row)

UsersStore (root service)
 ├─ users = signal<User[]>(...)                    // hydrated from localStorage
 ├─ search / roleFilter / statusFilter / sort = signal(...)
 ├─ selection = signal<Set<UserId>>(...)
 ├─ filtered = computed( apply search + role + status )
 ├─ sorted   = computed( order filtered by sort.key/dir )
 ├─ paged    = computed( slice sorted by page/perPage )
 ├─ effect(() => writeToLocalStorage(users()))     // persistence
 └─ methods: toggleStatus, bulkSetStatus, bulkSetRole, invite, resetToDemo
```

Data flow is one-directional: toolbar and table emit intents (search, chip click, sort, check, toggle) into the store; store recomputes derived signals; table + pager re-render from derived signals. Overlays (drawer, dialog) are opened imperatively from the page component via `inject(MatDialog)` and receive their data as `MatDialogRef` inputs.

## Implementation Units

- [ ] **Unit 1: `UsersStore` service + `User` types + `localStorage` persistence + seed fixture**

**Goal:** Stand up a dependency-free signal-backed store for users that hydrates from `localStorage`, falls back to the seed fixture, and persists mutations. No UI yet.

**Requirements:** R10, R12, and the data layer behind R3/R4/R6/R8

**Dependencies:** None (Dashboard plan units already bootstrapped the app).

**Files:**
- Create: `src/app/pages/users/users.store.ts`
- Create: `src/app/pages/users/fixtures.ts`
- Create: `src/app/pages/users/users.store.spec.ts`

**Approach:**
- `fixtures.ts` exports `SEED_USERS: User[]` copied verbatim from `public/data.jsx` lines 3–15, and `SEED_AUDIT` as the subset of `public/data.jsx` `AUDIT` needed for the drawer (actor + action + target + time).
- Types: `type UserId = string;` `type Role = 'Admin'|'Operations'|'Support'|'Viewer';` `type Status = 'active'|'inactive'|'pending';` `interface User { id: UserId; name: string; email: string; role: Role; status: Status; lastSeen: string; dept: string; joined: string; h: number; mfa: boolean; sessions: number; }` `type SortKey = 'name'|'role'|'status'|'dept'|'lastSeen';` `type SortDir = 'asc'|'desc';`
- `UsersStore` (`@Injectable({ providedIn: 'root' })`) holds: `users`, `search`, `roleFilter` (`Role|'all'`), `statusFilter` (`Status|'all'`), `sort` (`{ key: SortKey; dir: SortDir }`), `page` (number), `perPage` = 5, `selection` (`Set<UserId>`).
- Constructor hydrates from `localStorage.getItem('ch.users.v1')` inside a `try/catch`; on any error or missing key, uses `SEED_USERS`.
- One `effect()` writes `users()` to `localStorage` whenever it changes. Writes are JSON.stringify'd; no migrations yet (bump the key to `v2` if shape ever changes).
- Derived `computed()` signals: `filtered`, `sorted`, `paged`, `totalPages`, `activeCount`. Sorting `lastSeen` uses a secondary map (e.g., "2m" < "12m" < "1h" < "4h" < "1d"…); document the mapping as a private `lastSeenRank(s: string): number` helper.
- Mutation methods: `toggleStatus(id)`, `bulkSetStatus(ids, status)`, `bulkSetRole(ids, role)`, `invite(draft: InviteDraft)` (generates `id = 'u_' + random6`, `h = 1..7`, `joined = today ISO date`, `status='pending'`, `lastSeen='never'`, `mfa = draft.requireMfa`, `sessions=0`), `resetToDemo()` (reassigns seed and wipes selection). Every mutation also calls `selection.set(new Set())` when that row was removed or status changed in a way that invalidates the set membership.
- Page-related helpers: on any filter/search/sort change, `page.set(1)` via an `effect()` watching those signals.

**Patterns to follow:**
- `src/app/pages/dashboard/fixtures.ts` for the typed-constants idiom.
- Existing `inject()` + signal usage across `src/app/pages/dashboard/dashboard.ts`.

**Test scenarios:**
- Happy path: construct with no `localStorage` → `users()` equals `SEED_USERS` and `activeCount()` equals the count of `SEED_USERS` with `status==='active'`.
- Happy path: `toggleStatus('u_8f2a')` flips Amelia Chen's status to `inactive`, writes to `localStorage`, and a fresh `UsersStore` rehydrates with the toggled status.
- Happy path: `invite({ firstName:'Jamie', lastName:'Park', email:'j@p.io', role:'Support', dept:'Customer Success', requireMfa:true, note:'' })` appends a user whose `status==='pending'`, `lastSeen==='never'`, `id` starts with `u_`, and `joined` is today's ISO date.
- Happy path: sort = `{ key:'name', dir:'asc' }` → `sorted()[0].name` is alphabetically first among filtered rows.
- Happy path: `search.set('felix')` → `filtered().length === 1` and matches `Felix Aranda`.
- Happy path: `roleFilter.set('Admin')` + `statusFilter.set('active')` returns only active admins.
- Edge case: corrupt `localStorage` payload (`'not json'`) → constructor falls back to `SEED_USERS` without throwing.
- Edge case: `bulkSetRole([], 'Viewer')` is a no-op; `users()` reference does not change.
- Edge case: changing `search` while on page 3 resets `page()` to 1.
- Integration: `effect` writes to `localStorage` after each mutation — assert by stubbing `localStorage.setItem` (spy) and performing a `toggleStatus`; the spy is called exactly once with the `ch.users.v1` key.

**Verification:**
- Spec suite passes.
- Opening Chrome DevTools on the live app (after Unit 6) shows `ch.users.v1` in Application → Local Storage; toggling a row updates the JSON instantly.

---

- [ ] **Unit 2: `StatusChipComponent` (shared primitive, two consumers)**

**Goal:** Extract the `StatusChip` from `public/shell.jsx` lines 171–193 into a small standalone component used by the table row and the drawer.

**Requirements:** R5, R7

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/pages/users/components/status-chip/status-chip.ts`
- Create: `src/app/pages/users/components/status-chip/status-chip.html`
- Create: `src/app/pages/users/components/status-chip/status-chip.css`

**Approach:**
- Single `status` input: `'active' | 'inactive' | 'pending' | 'paid' | ... `. Mapping table matches `public/shell.jsx` exactly. Initially only the user statuses are in use; keep the other keys in the map so the chip is reusable on future pages (Orders, Tickets) without change.
- Template: `<span class="chip chip-{{tone}}"><span class="dot"></span>{{label}}</span>`.
- CSS uses `--sys-color-good`, `--sys-color-good-soft`, `--sys-color-good-ink` for `tone='good'`; `--sys-color-warn-*` for warn; `--sys-color-danger-*` for danger; `--sys-color-info-*` for info; `--sys-ink-2` / `--sys-bg-muted` for neutral.
- `aria-label` is the `label` string (default `status` text).

**Patterns to follow:**
- `src/app/pages/dashboard/components/kpi-card/` for scaffolding.
- `public/styles.css` `.chip` rules for exact spacing and dot sizing (translate to `--sys-*`).

**Test scenarios:**
- Happy path: `status='active'` renders text `Active` and applies a class containing `good`.
- Happy path: `status='pending'` renders text `Pending` and a warn tone.
- Edge case: unknown status string (e.g., `'foo'`) renders the raw string and a neutral tone.
- Integration: host component binds `status()` as a signal input; changing the signal updates the rendered text reactively.

**Verification:**
- Visual parity with `public/images/user-management.png` chips (`Active` green pill, `Pending` amber pill, `inactive` neutral pill).

---

- [ ] **Unit 3: `UsersTableComponent` — header, rows, sort, selection, bulk-selection toolbar bindings**

**Goal:** Build the data table: columns, sort, multi-select, row status toggle, row actions, empty state. Does NOT own the toolbar search/filter chips (those are composed at the page level) but emits/accepts selection so the page can render the selection toolbar.

**Requirements:** R4, R5, R9, R11, R12

**Dependencies:** Units 1, 2

**Files:**
- Create: `src/app/pages/users/components/users-table/users-table.ts`
- Create: `src/app/pages/users/components/users-table/users-table.html`
- Create: `src/app/pages/users/components/users-table/users-table.css`

**Approach:**
- Standalone component; `input()` signals: `rows: User[]`, `sort: { key: SortKey; dir: SortDir }`, `selection: Set<UserId>`. `output()` events: `sortChange`, `selectionChange`, `toggleStatus(id)`, `openUser(id)`.
- Template: native `<table>` with Tailwind + scoped CSS for density, alternating row hover (`--sys-bg-hover`), header font weight, sticky-ish header (no sticky for now).
- Header cells for sortable columns are `<button type="button">` elements with `aria-sort` of `ascending` / `descending` / `none`; clicking toggles direction via `sortChange.emit`.
- Selection checkbox column uses `MatCheckbox`. Header checkbox is checked when `selection.size === rows.length && rows.length > 0` and indeterminate when `0 < size < length` (via `indeterminate` input).
- Row cells: avatar + name/email stack, role chip (`<span class="chip">`), `<app-status-chip [status]="u.status">`, department (muted), last seen (muted, tabular nums). Clicking the name emits `openUser.emit(u.id)`.
- Actions cell (right-aligned flex): `MatSlideToggle` bound to `u.status === 'active'`, emitting `toggleStatus.emit(u.id)` on change; `MatIconButton` with `visibility` icon emitting `openUser.emit(u.id)`; `MatIconButton` with `more_horiz` icon opening a `MatMenu` that contains one disabled/ghost item (placeholder per origin).
- Empty body: `@if (rows.length === 0)` renders a full-width cell with a muted icon, title `No users match your filters`, description, and a `Clear filters` button that emits `sortChange.emit({ key:'lastSeen', dir:'desc' })` is **not** what clears filters — the Clear button is owned by the page component (Unit 6); the table just emits `clearFilters()`.
- CSS: translate `public/styles.css` `.dt` rules (padding, borders, `--sys-line-1`, `--sys-ink-*`) into scoped styles. Checkbox column width fixed at ~36px; actions column width ~120px and `text-align: right`.

**Patterns to follow:**
- `public/pages-1.jsx` lines 219–274 for structure and class names.
- `src/app/pages/dashboard/components/feed-list/feed-list.ts` for standalone + signal-input + event-output idioms.

**Test scenarios:**
- Happy path: passing 3 rows renders 3 `<tr>` in `<tbody>` plus 1 `<tr>` in `<thead>`; column count is 7.
- Happy path: clicking the `User` header emits `sortChange` with `{ key:'name', dir:'asc' }` when previously sorted by something else, and toggles to `desc` when clicked again.
- Happy path: selecting the header checkbox with 3 rows emits `selectionChange` with a set of all 3 ids.
- Happy path: clicking a row's slide toggle emits `toggleStatus` with the row id exactly once.
- Happy path: clicking the name cell or view-icon emits `openUser` with the row id.
- Edge case: `rows=[]` renders the empty state and does not render `<tr>` rows.
- Edge case: `selection` set containing an id not in `rows` does not break the "all checked" logic — header checkbox computes based on ids present in `rows` only.
- A11y: header sort buttons have `aria-sort`; checkbox column has a hidden `<label>` for "Select row"; action `MatIconButton`s have `aria-label` + `MatTooltip`.
- Integration: two rows, `sort={ key:'name', dir:'asc' }` — assert row order in the DOM matches the passed `rows` order (the parent sorts; the table just renders).

**Verification:**
- Visual match with the screenshot for row density, avatar size, chip styling, action column alignment, hover affordance.
- Keyboard: Tab reaches header sort buttons → first row checkbox → row slide toggle → view icon → overflow menu → next row; no focus traps.

---

- [ ] **Unit 4: `UserDetailDrawerComponent` (opens via `MatDialog` right-anchored)**

**Goal:** Build the right-side drawer that shows full user details plus recent activity, opened by the page when the table emits `openUser`.

**Requirements:** R7, R11, R12

**Dependencies:** Units 1, 2

**Files:**
- Create: `src/app/pages/users/components/user-detail-drawer/user-detail-drawer.ts`
- Create: `src/app/pages/users/components/user-detail-drawer/user-detail-drawer.html`
- Create: `src/app/pages/users/components/user-detail-drawer/user-detail-drawer.css`

**Approach:**
- Standalone component injected with `MAT_DIALOG_DATA: { user: User }` and `MatDialogRef`.
- Layout matches `public/pages-1.jsx` lines 294–330: large avatar (`--sys-radius-full`, hue-colored per `user.h`), name (18px / weight 550), `role · dept` (muted small), row of chips: `<app-status-chip>` + optional `<span class="chip good"><mat-icon>shield</mat-icon> MFA</span>` when `user.mfa`.
- Details grid: two-column CSS grid with `grid-template-columns: 120px 1fr`, rows: User ID (mono), Email, Joined, Last seen, Sessions (`{n} active`).
- Recent activity: `@for (a of activity(); track a.id)` where `activity = computed(() => SEED_AUDIT.filter(x => x.actor === user.name).slice(0, 4))`. Each row is an icon + action text + timestamp, styled similar to the dashboard's FeedListComponent rows but inline (do not depend on FeedListComponent — copy the minimal styles; extract later if a third consumer appears).
- Dialog is opened by the page with a position config `{ position: { right: '0' }, width: '420px', height: '100vh', panelClass: 'ch-side-dialog', hasBackdrop: true }` and global `panelClass` CSS that removes default `MatDialog` padding + adds the card look (`--sys-bg-elev`, no top/bottom margin, sharp vertical extent). Focus trap + Esc + backdrop click come from `MatDialog` for free.
- Footer: fixed inside the panel — `Close` (MatButton, closes ref) and `Edit user` (MatButton primary, visual-only, `disabled="false"` but click does nothing).

**Patterns to follow:**
- `public/pages-1.jsx` lines 287–333 for structural reference.
- Angular Material `MatDialog` config docs for right-anchor position; fall back to a custom overlay if the panel class cannot be coerced to full-height (see Risks).

**Test scenarios:**
- Happy path: opens with a user whose `mfa=true` — both the status chip and the `MFA` chip render.
- Happy path: clicking `Close` calls `MatDialogRef.close()`.
- Happy path: pressing `Escape` closes the dialog and returns focus to the invoking control (covered by `MatDialog` defaults; assert by spying on `dialogRef.close` in a test harness).
- Edge case: user with no audit entries renders the "No recent activity" muted line instead of an empty list.
- Edge case: user's `sessions = 0` renders `0 active`.
- A11y: dialog has an accessible `aria-label` of `User details — {name}`; focus moves inside on open.

**Verification:**
- Visually matches the mockup's drawer dimensions and typography. Opening multiple users in sequence works (no state leak).

---

- [ ] **Unit 5: `InviteUserDialogComponent` (reactive form, `MatDialog` centered)**

**Goal:** Build the invite-user dialog with client-side validation; on success, ask the store to append a pending row.

**Requirements:** R8, R11, R12

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/pages/users/components/invite-user-dialog/invite-user-dialog.ts`
- Create: `src/app/pages/users/components/invite-user-dialog/invite-user-dialog.html`
- Create: `src/app/pages/users/components/invite-user-dialog/invite-user-dialog.css`

**Approach:**
- Standalone component; imports `ReactiveFormsModule`, `MatDialogModule`, `MatFormFieldModule`, `MatInputModule`, `MatSelectModule`, `MatCheckboxModule`, `MatButtonModule`, `MatIconModule`.
- `form = inject(FormBuilder).group({ firstName: ['', Validators.required], lastName: ['', Validators.required], email: ['', [Validators.required, Validators.pattern(/@/)]], role: ['Support' as Role], dept: ['Customer Success'], note: [''], requireMfa: [true] })`.
- Template mirrors `public/pages-1.jsx` lines 342–366: two-column field rows (`.g-2` becomes `grid grid-cols-2 gap-3`), full-width email, role + department selects, full-width note textarea, MFA checkbox with muted caption.
- Dialog opens via `MatDialog` with default config. Title bar: `Invite a new user`, subtitle `They'll receive an email invitation valid for 7 days.`.
- Footer buttons: `Cancel` (closes with undefined) and `Send invitation` (disabled until form is valid; on click closes with `form.value`).
- Submission wiring is owned by the page component (Unit 6): `dialogRef.afterClosed().subscribe(v => v && store.invite(v))`.

**Patterns to follow:**
- Angular Material reactive-forms dialog examples.
- `public/pages-1.jsx` lines 335–367 for field layout and copy.

**Test scenarios:**
- Happy path: with all required fields filled, `Send invitation` is enabled and closes the dialog with the form value.
- Edge case: empty `firstName` keeps the button disabled and shows a required error on blur.
- Edge case: email `without-at-sign` is invalid; `email@example.com` is valid.
- Edge case: pressing `Escape` closes without emitting.
- A11y: labels are associated via `MatFormField`; the checkbox has a visible, clickable label.

**Verification:**
- The dialog visually matches the mockup (stacked fields, two-column name row, textarea, checkbox).

---

- [ ] **Unit 6: `UsersPageComponent` — compose everything + register `/users` route**

**Goal:** Assemble the header, toolbar, table, pager, and overlay triggers into the page, wire it to `UsersStore`, and add the `/users` child route.

**Requirements:** R1, R2, R3, R6, R9, R10, R11, R12

**Dependencies:** Units 1, 2, 3, 4, 5

**Files:**
- Create: `src/app/pages/users/users.ts`
- Create: `src/app/pages/users/users.html`
- Create: `src/app/pages/users/users.css`
- Create: `src/app/pages/users/users.spec.ts`
- Modify: `src/app/app.routes.ts`

**Approach:**
- `app.routes.ts`: add child `{ path: 'users', loadComponent: () => import('./pages/users/users').then(m => m.UsersPageComponent), data: { title: 'User Management', crumb: 'People · Users' } }` to the existing shell route, in order after `dashboard`.
- `UsersPageComponent`: standalone; `inject(UsersStore)`, `inject(MatDialog)`, `inject(LiveAnnouncer)`. Imports `MatButtonModule`, `MatIconModule`, `MatCheckboxModule`, `MatMenuModule`, `MatTooltipModule`, `UsersTableComponent`.
- Template structure matches Overview diagram:
  1. **Header row**: `<h1>User Management</h1>` + subtitle (`computed(() => `${store.users().length} people, ${store.activeCount()} active. Manage roles, status, and access across the workspace.`)`), right-aligned `Import CSV` (MatButton, no handler) + `Invite user` (MatButton primary, opens `InviteUserDialog`).
  2. **Toolbar card** (`<section class="ch-card">`): search `<input>` with a leading `mat-icon` (bound to `store.search()` via an `(input)` handler calling `store.search.set($event.target.value)`), Role filter chip (`<button>` cycling through `['all','Admin','Operations','Support','Viewer']`), Status chip (`['all','active','inactive','pending']`). Right side: when `store.selection().size > 0`, render `<span>{n} selected`, bulk `Email` (visual), `Change role` (opens `MatMenu` with 4 role items), `Deactivate` (MatButton danger; calls `store.bulkSetStatus(ids, 'inactive')`).
  3. **Table**: `<app-users-table [rows]="store.paged()" [sort]="store.sort()" [selection]="store.selection()" (sortChange)="store.sort.set($event)" (selectionChange)="store.selection.set($event)" (toggleStatus)="store.toggleStatus($event)" (openUser)="openDrawer($event)" (clearFilters)="clearFilters()">`.
  4. **Pager**: `<div class="pager">` with `Showing X–Y of Z` text computed from `store.filtered().length` and `store.page()`, then prev (`chevron_left` icon button disabled at page 1), numbered buttons `@for (p of pages())`, next (`chevron_right` disabled at last page), and a far-right muted `Reset demo data` link (visible when `localStorage.getItem('ch.users.v1') != null`) that calls `store.resetToDemo()`.
- `openDrawer(id)` finds the user by id from `store.users()` and calls `this.dialog.open(UserDetailDrawerComponent, { data: { user }, position: { right: '0' }, width: '420px', height: '100vh', panelClass: 'ch-side-dialog' })`.
- `openInvite()` opens `InviteUserDialogComponent`; on `afterClosed`, if a value is emitted, calls `store.invite(value)` and announces `User invited` via `LiveAnnouncer`.
- Filter-chip click announces the new count: `LiveAnnouncer.announce(`Showing ${store.filtered().length} users`)`.
- `ch-side-dialog` global CSS (in `src/styles.css`) strips default dialog padding and removes the top/left offset so the panel hugs the right edge; apply only to that panelClass.
- `users.css` contains: `.ch-card` (if not already shared), toolbar layout, filter-chip styling (rounded, `--sys-bg-muted` default, `--sys-color-accent-soft` when active), pager styling (`.pg-btn`, `.pg-btn.on`), empty-state icon treatment.

**Patterns to follow:**
- `public/pages-1.jsx` lines 178–286 for the full page composition.
- `src/app/pages/dashboard/dashboard.ts` for page-component idioms (inject, signals, overlay opening).
- `src/app/pages/dashboard/dashboard.css` for `ch-card` shape.

**Test scenarios:**
- Happy path (integration): route `/users` renders the page with `<h1>User Management</h1>`, a toolbar, a table of 5 users (first page), and a pager showing `Showing 1–5 of 12` with 3 page buttons.
- Happy path (integration): typing `amelia` in the search input narrows the table to one row (Amelia Chen) and the pager reads `Showing 1–1 of 1`.
- Happy path (integration): clicking the Role chip cycles its label `All → Admin → Operations → Support → Viewer → All`.
- Happy path (integration): clicking the header checkbox selects all visible rows; the selection toolbar shows `5 selected` and `Deactivate` button is visible. Clicking `Deactivate` flips all 5 rows' status and clears selection.
- Happy path (integration): clicking the `Invite user` button, filling the form with `Jamie / Park / j@p.io`, and submitting adds a row with `status='pending'` to `store.users()`; after navigating away and back, the row is still there (localStorage persistence).
- Happy path (integration): clicking a user's name opens the drawer with that user's details.
- Edge case: clearing all filters via the empty-state `Clear filters` button resets search, role, status, and page.
- Edge case: when `selection().size === 0`, the bulk action toolbar section is absent from the DOM.
- Edge case: `Reset demo data` link is hidden until at least one mutation has happened; clicking it wipes the localStorage key and the table reverts to the seed.
- A11y: `<h1>` appears exactly once on the page; the Role and Status chips have `aria-label` like `Filter by role: Admin`; the search input has an associated label (visible or `aria-label`).
- Integration: `LiveAnnouncer` is called with a message containing the new count whenever a filter chip is clicked (spy on `announce`).

**Verification:**
- Side-by-side with `public/images/user-management.png`: header, toolbar, row density, chip styling, pager layout, and selection toolbar match within small tolerance.
- Keyboard-only flow completes the entire happy path (navigate to `/users`, filter, select, deactivate, invite, view drawer, close) with visible focus rings at every step.
- `ng build` passes; `vitest` suite passes; no console a11y warnings from Angular/Material.
- Navigating to `/` redirects to `/dashboard`; clicking the sidebar's "User Management" navigates to `/users` and the sidebar entry shows `aria-current="page"`.

## System-Wide Impact

- **Interaction graph:** `app.routes.ts` gains one child route; nothing else shifts. `ShellComponent`, `SidebarComponent`, `TopbarComponent` are unchanged — the topbar already reads `data.title` and `data.crumb`.
- **Error propagation:** The only failure mode is `localStorage` being disabled (Safari private mode) — hydration + write both wrapped in `try/catch`; UI falls back to in-memory state.
- **State lifecycle risks:** A stale `ch.users.v1` payload after schema changes would desynchronize types vs. data. Mitigation: bump the key to `v2` on any shape change; loader validates minimal field presence and falls back on mismatch.
- **API surface parity:** No exported types consumed by other pages yet. The `User` type stays page-local; promote to `src/app/shared/` when a second consumer appears.
- **Integration coverage:** The full route + store + table + overlays chain is exercised by Unit 6's spec (an end-to-end-ish Angular test-bed spec, not a true e2e).
- **Unchanged invariants:** Tailwind v4 pipeline, Angular 21 standalone bootstrap, existing `provideAnimations()`, Dashboard route, and `--sys-*` token layer are untouched.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `MatDialog` cannot be coerced into a full-height right-edge panel with `position.right + height: 100vh` on all browsers (some browsers honor `position` but keep a top margin). | If the panel-class CSS approach leaves a visible gap, switch to a thin custom overlay using `@angular/cdk/overlay` (`Overlay.create({ positionStrategy: globalPositionStrategy.right('0').top('0'), scrollStrategy }) ` + a `CdkPortal`) within Unit 4 — mechanical swap, same component content. |
| `localStorage` quota or availability — writes can throw in Safari private mode or when quota is exceeded. | Wrap both read and write in `try/catch`; silently fall back to in-memory state and log a single console warning. Do not block UI. |
| `localStorage` payload drifts from the `User` interface after a future edit-user feature lands. | Version the key (`ch.users.v1`) and validate minimum field presence on hydration; bump version on shape changes. Called out in Unit 1. |
| `lastSeen` sort is string-based in the seed fixture (`'2m ago'`, `'1h ago'`, `'never'`), which naive lexicographic sort gets wrong. | Unit 1's `lastSeenRank` helper defines explicit ordering (never < weeks < days < hours < minutes). Document the mapping in the helper comment. |
| Filter-chip cycle + search simultaneously could confuse users — no visible "clear" chip until empty state. | Acceptable for this plan. The empty-state `Clear filters` button covers recovery. Revisit if users complain. |
| Visual drift from screenshot (chip colors, row hover, pager button shape). | Unit 6 verification explicitly compares against `public/images/user-management.png`; keep `public/styles.css` open while tuning. |
| Angular Material's default `MatSlideToggle` color is the primary; our primary is the accent, but the mockup's row toggle looks neutral/accent. | Theme the toggle via Material's color input (`color="accent"`) or scoped CSS overriding `--mat-slide-toggle-*` tokens to read from `--sys-color-accent`. Decide in Unit 3. |

## Documentation / Operational Notes

- Update `README.md` with `/users` in the app's feature list once the Dashboard README section exists.
- No rollout, monitoring, or migration concerns.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-24-user-management-page-requirements.md](../brainstorms/2026-04-24-user-management-page-requirements.md)
- Behavioral source: `public/pages-1.jsx` lines 133–370
- Visual target: `public/images/user-management.png`
- Helpers referenced: `public/shell.jsx` lines 121–193 (`Drawer`, `Modal`, `StatusChip`)
- Seed fixtures: `public/data.jsx` `USERS` (lines 3–15), `AUDIT`, `ROLES`
- Design tokens: `src/app/core/system-colors.css`
- Shell host: `src/app/layout/shell/shell.ts`, `src/app/app.routes.ts`
- Prior plan: `docs/plans/2026-04-23-001-feat-dashboard-page-plan.md`
- Angular Material v21 `MatDialog`, `MatMenu`, `MatSlideToggle`, `MatCheckbox`, `MatFormField`, reactive forms (external)
- `@angular/cdk/a11y` `LiveAnnouncer` (external)

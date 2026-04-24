---
title: "User Management page — requirements"
type: feature
status: ready-for-planning
date: 2026-04-24
origin: public/images/user-management.png (+ public/pages-1.jsx `UsersPage`, public/data.jsx `USERS`)
related: docs/plans/2026-04-23-001-feat-dashboard-page-plan.md
---

# User Management page — requirements

## Summary

Port the ControlHub **User Management** page from the React/HTML mockup in `public/` into the Angular 21 app under `src/`, matching `public/images/user-management.png`. The page renders inside the existing shell (sidebar + topbar) on a new `/users` route and reuses the `--sys-*` design-token layer, Angular Material selectively, and the patterns established by the Dashboard plan. Full mockup parity: searchable/sortable/filterable user table with multi-select bulk actions, row status toggle, detail drawer, and invite-user modal. Mutations are in-memory with `localStorage` persistence so edits survive reload.

## Problem Frame

The Dashboard is live. The sidebar's "User Management" nav item currently routes nowhere — clicking it is a dead end. The React mockup in `public/pages-1.jsx` (`UsersPage`, lines 133–370) and fixture `USERS` in `public/data.jsx` already define the complete page, and the screenshot confirms the target. We need an Angular route that visually and behaviorally matches so the admin feels real beyond the Dashboard.

## Users & Value

- **Primary user:** an admin exploring or demoing ControlHub. They expect a working users table — searchable, sortable, filterable — with realistic drill-down and edit affordances.
- **Value:** extends the "this product is real" impression past the Dashboard; unlocks future pages (Roles & Permissions) that link from the user drawer.

## Scope

### In scope

- **Route:** `/users` added as a child of the shell layout, with route data `{ title: 'User Management', crumb: 'People · Users' }`.
- **Sidebar state:** the "User Management" nav item shows `aria-current="page"` when active. No change to `nav.data.ts` structure.
- **Page header:** `<h1>User Management</h1>`, subtitle `{N} people, {A} active. Manage roles, status, and access across the workspace.`, and right-aligned actions `Import CSV` (visual-only) and `Invite user` (opens modal).
- **Toolbar card:** search input (filters by name or email), Role filter chip (cycles `All → Admin → Operations → Support → Viewer`), Status filter chip (cycles `All → active → inactive → pending`). When ≥1 row is selected, three contextual actions appear on the right of the toolbar: `Email` (visual-only), `Change role` (opens a small picker), `Deactivate` (sets `status='inactive'` on every selected row).
- **Table:** columns `(checkbox) · User · Role · Status · Department · Last seen · Actions`. Rows render avatar+name+email, role chip, status chip (active=green, inactive=neutral, pending=warn), department, last-seen text. Row Actions cell: status toggle switch, "view" icon button (opens drawer), overflow `…` icon button (menu is visual-only for now). Sort is click-to-sort on User / Role / Status / Department / Last seen headers with a visual direction indicator. Default sort: Last seen descending.
- **Pager:** 10 rows per page. Shows `Showing X–Y of Z` and numbered page buttons with prev/next. The fixture has 12 users, so the pager naturally displays 2 pages; a few more seed rows will be added to mirror the "1 2 3" state visible in the screenshot (see Open Questions).
- **Detail drawer** (right-side slide-in): opens on row click or view-icon click. Shows large avatar, name, role · department, status chip, optional MFA chip, details grid (User ID, Email, Joined, Last seen, Sessions), and recent activity list filtered from the existing `AUDIT` fixture by actor name. Footer buttons: `Close`, `Edit user` (visual-only).
- **Invite-user modal:** title `Invite a new user`, subtitle `They'll receive an email invitation valid for 7 days.`, fields First name / Last name / Work email / Role / Department / Personal note / "Require MFA enrollment on first login" checkbox. `Send invitation` appends a new row with `status='pending'`, `lastSeen='never'`, today's date as `joined`, and the chosen role/department, then closes the modal. `Cancel` closes with no changes. Minimal validation: name and email required; email must contain `@`.
- **Empty state:** when filters match zero rows, the table body shows the mockup's "No users match your filters" state with a `Clear filters` button.
- **Persistence:** the `USERS` array is hydrated from `localStorage` on first load (falling back to the seed fixture) and written back whenever a mutation occurs (toggle, bulk deactivate, change role, invite). A small `Reset to demo data` action is available — see Open Questions.

### Out of scope

- **Wiring `Import CSV`, bulk `Email`, and the row overflow `…` menu to real behavior.** Import CSV is rendered as a button and does nothing when clicked. Same for the bulk Email action and the `…` menu. Called out in the page's empty footer-note or left silent.
- **Editing a user inline or via the drawer.** The drawer's `Edit user` button is visual-only in this plan — editing is deferred.
- **Server sync, API integration, auth.** Entirely client-side.
- **Roles & Permissions page, Audit page, Authentication page.** Separate plans. The drawer's "Recent activity" section reads from the existing `AUDIT` fixture without linking out.
- **Dark mode.** Inherits the light-mode-only stance from the Dashboard plan.
- **Responsive refinement below ~1024px.** The table targets desktop widths matching the screenshot; mobile polish is a separate plan.
- **CSV export of the table.** Not shown in the mockup.

## Success Criteria

- Navigating to `/users` renders the page pixel-close to `public/images/user-management.png` — layout, typography, colors, table density, chip styles, pager — within small eyeball tolerance.
- All interactive behaviors above work end-to-end on the in-memory store: search narrows results as you type, filter chips cycle, sort headers toggle direction, multi-select bulk Deactivate updates rows, row toggle flips status, drawer opens/closes, invite adds a pending row.
- Edits persist across a full page reload via `localStorage`; `Reset to demo data` restores the seed fixture.
- Keyboard-only flow works: skip-link → topbar → sidebar → main → toolbar → row checkboxes and actions → pager. Drawer traps focus while open and returns focus to the invoking control on close. The invite modal does the same. Status chips and sort directions have accessible labels.
- `ng build` and the unit test suite pass with no new console a11y warnings.

## Non-Goals / Explicit Rejections

- No attempt to reconcile pagination with server-side filtering — all sort/filter is client-side over the in-memory list.
- No optimistic-UI complexity — because there is no server, mutations are synchronous.
- No accessibility features beyond what Angular Material + CDK a11y give us by default (focus trap in overlays, announced live regions for filter/result count changes).

## Key Decisions Resolved

1. **Full mockup parity**, not a trimmed MVP. User selected this option.
2. **In-memory + `localStorage` persistence** for mutations. User selected this option. The drawer's `Edit user` button remains visual-only because the mockup has no edit form.
3. **Invite modal *does* add a pending row** on Send, even though the React mockup's Send button is a no-op. Rationale: with persistence enabled, actually appending the row is more coherent with "full mockup parity" and gives the demo a visible result. If undesirable, trivial to revert to close-only.
4. **Drawer's Recent activity** reuses the existing `AUDIT` fixture filtered by actor name, matching the React mockup exactly. No new fixture needed.
5. **Row Actions `…` menu** is rendered but its menu is empty/visual-only in this plan. Keeps the column composition identical to the screenshot without introducing behaviors that are out of scope.

## Open Questions (for planning)

- **Seed-row count for the "1 2 3" pager state.** The screenshot shows a 3-page pager; the current `USERS` fixture has 12 entries (2 pages at 10/page). Planning should either (a) lower the per-page count to, say, 5 (3 pages with 12 entries), or (b) add ~18 more realistic seed users. Pick whichever reads more believably; implementation-level, not product-level.
- **Reset to demo data affordance.** Placement: dev-only keyboard shortcut, small text button in the toolbar, or a menu item under the existing overflow `…`. Lean toward a tiny footer link (`Reset demo data`) to keep the header clean; planning can decide.
- **Change-role bulk action UI.** The mockup shows the button but not the picker. Simplest: a small popover menu with the four roles; clicking one updates all selected rows. Planning owns the exact primitive (`MatMenu` vs. inline select).
- **Row overflow `…` menu contents.** Could surface "Reset password" / "Send email" / "Copy ID" as visual-only items, or remain a dead button. Planning decision.

## Dependencies

- **Dashboard plan infrastructure is a prerequisite.** This plan assumes Units 1–2 of `docs/plans/2026-04-23-001-feat-dashboard-page-plan.md` are complete (shell, sidebar, topbar, `--sys-*` tokens, Angular Material + CDK + Tailwind v4 wiring).
- No new third-party libraries expected beyond what the Dashboard pulls in; Angular Material already provides `MatCheckbox`, `MatSlideToggle`, `MatMenu`, `MatDialog`, `MatBottomSheet` / Drawer primitives, form-field controls, and overlay/focus-trap utilities.

## Sources & References

- Visual target: `public/images/user-management.png`
- React source of truth: `public/pages-1.jsx` `UsersPage` (lines 133–370), `Drawer` + `Modal` helpers in `public/shell.jsx`, `StatusChip` helper (search `public/shell.jsx`).
- Fixture: `public/data.jsx` `USERS` (lines 3–15), `AUDIT` (for drawer activity), `ROLES` (for filter chip label list).
- Design tokens: `src/app/core/system-colors.css` (`--sys-*` layer authored by the Dashboard plan).
- Shell host: `src/app/layout/shell/shell.ts` and `src/app/app.routes.ts` (extend with `/users` child route).
- Sidebar nav entry already exists: `src/app/layout/sidebar/nav.data.ts` → `{ id: 'users', label: 'User Management', icon: 'group' }`.

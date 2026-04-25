---
title: "Roles & Permissions page — requirements"
type: feature
status: ready-for-planning
date: 2026-04-25
origin: public/images/roles-permissions_*.png (+ public/pages-1.jsx `RolesPage`, public/data.jsx `ROLES`/`PERMISSIONS`/`ROLE_MATRIX`)
related: docs/plans/2026-04-24-001-feat-user-management-page-plan.md
---

# Roles & Permissions page — requirements

## Summary

Port the ControlHub **Roles & Permissions** page from the React/HTML mockup in `public/` into the Angular 21 app under `src/`, matching the five `public/images/roles-permissions_*.png` screenshots (one per built-in role). The page renders inside the existing shell on a new `/roles` route and reuses the `--sys-*` design-token layer, Angular Material selectively, and the patterns established by the Dashboard and User Management plans. Full mockup parity: a left-side role list and a right-side cross-role permission matrix where every checkbox toggle commits immediately and persists to `localStorage`. Role lifecycle controls (New role, Duplicate role, Delete role, per-role Duplicate, per-role trash) are fully wired so adding/removing/cloning a role updates both the left list and the matrix columns end-to-end.

## Problem Frame

The Dashboard and User Management pages are live. The sidebar's "Roles & Permissions" nav item (`src/app/layout/sidebar/nav.data.ts:7`) currently routes to `/roles`, which 404s — clicking it is a dead end. The React mockup in `public/pages-1.jsx` `RolesPage` (lines 372–471) and the fixtures `ROLES`, `PERMISSIONS`, `ROLE_MATRIX` in `public/data.jsx:18-66` already define the complete page, and the five screenshots (one per role) confirm the target layout. We need an Angular route that visually and behaviorally matches so the next nav item past User Management is no longer a dead end and the "this product is real" impression continues.

## Users & Value

- **Primary user:** an admin exploring or demoing ControlHub. They expect to see the full role roster, understand at a glance what each role can do, and be able to flip a checkbox or spin up a new role without page reloads or save-button friction.
- **Value:** completes the People navigation group; gives the demo a visible "policy" surface that the Users page already implies exists; unlocks future flows where a user's role chip can deep-link here.

## Scope

### In scope

- **Route:** `/roles` added as a child of the shell layout, with route data `{ title: 'Roles & Permissions', crumb: 'People · Access control' }`.
- **Sidebar state:** the "Roles & Permissions" nav item shows `aria-current="page"` when active. No change to `nav.data.ts`. The current `src/app/layout/sidebar/sidebar.html` only toggles the `active` CSS class via `routerLinkActive`; this plan must also add `ariaCurrentWhenActive="page"` to the `<a>` so the attribute actually appears in the DOM. (Reviewer note: the previous version of this bullet incorrectly claimed the attribute was already provided by `routerLinkActive` alone.)
- **Page header:** `<h1>Roles & Permissions</h1>`, subtitle `Control what each role can see and do. Changes apply to all users with that role immediately.`, and right-aligned actions: an "Unsaved changes" chip (warn tone, dot + label) shown only when the matrix is dirty, then `Duplicate role` (outline, copy icon, clones the currently-selected role) and `New role` (primary blue, plus icon, opens new-role modal). The chip placement matches `public/images/roles-permissions_adminstartor.png` — to the immediate left of `Duplicate role`.
- **Two-column body:** left card `260px`, right card fills, `gap: 16px`, top-aligned — mirrors the React layout `gridTemplateColumns: '260px 1fr'`.
- **Role list (left card):** card-head `Roles`. Each row: a vertical color-bar (background sourced from `--sys-color-{accent|info|good|warn|danger}` per `r.color`), the role name, a muted line `{N} {user|users} · {M} permissions` where `M` is the **live** count from the matrix (recomputes when toggles flip), and a chevron-right glyph (decorative, no interactive meaning beyond the row's own click target). Selected row gets a subtle sunken background + `1px` outline (use `--sys-bg-sunken` and `--sys-line-1` from `src/app/core/system-colors.css` — note the `--sys-` prefix; the React mockup's unprefixed token names do not exist in this codebase). Click selects; keyboard-accessible (Enter/Space). Default selection: first role (`admin`).
- **Role detail (right card):**
  - card-head left: `<h3>{role.name}</h3>` + muted subtitle = `role.description`.
  - card-head right: `Duplicate` (outline, sm) + a red trash icon button. The trash button is **hidden for built-in roles** (admin/ops/support/viewer/billing), shown only for user-created roles — matches the React `activeRole !== 'admin'` rule but extended to all five seeds since they're all "built-in".
  - card body: the **permission matrix** (see next).
- **Permission matrix table:** sticky header row `Permission | {first word of every role.name}` — the role columns update as roles are added/removed. Body groups permissions by the six sections from `PERMISSIONS` (Users, Roles, Resources, Orders, Analytics, System), each opened by a tan/cream section-header row spanning the table width and rendering the section name in small caps. Each permission row shows the human label (e.g. "View users") on top and the slug (`users.view`) in muted monospace below. Each role column for that row renders a styled checkbox bound to **a draft copy of** `matrix[roleId].has(permKey)`. Toggling updates the **draft matrix only** and marks the page dirty — nothing is written to `localStorage` and no other consumer sees the change until the user clicks `Save changes`. The live `{M} permissions` count under each role in the left list reads from the **draft** matrix so the count updates as the user toggles (gives instant feedback while the commit is still pending). **Signal-update discipline:** every toggle (and every lifecycle mutation) must replace the top-level draft-matrix object reference and the affected role's inner `Set` (mirrors the React mockup's `n[roleId] = new Set(n[roleId])` pattern at `public/pages-1.jsx:382-390` and the immutable-update pattern in `src/app/pages/users/users.store.ts`); in-place `Set.add` / `Set.delete` will not trip Angular signal subscribers and the live `{M} permissions` count will go stale.
- **Save / Discard footer:** when (and only when) the draft matrix differs from the committed matrix, render a sticky footer at the bottom of the right card with `Discard` (outline, secondary) on the left of the right-aligned button group and `Save changes` (primary blue, check icon) on the right. Layout, copy, and tone match `public/images/roles-permissions_adminstartor.png`. `Save changes` writes the current draft matrix to the committed matrix and to `localStorage`; `Discard` reverts the draft to the committed matrix; both clear the dirty state and hide the footer + the "Unsaved changes" chip.
- **New role modal:** title `Create a new role`, subtitle `Permissions start empty — toggle them on in the matrix.`, fields **Name** (required), **Description** (optional, textarea), **Color** (single-select swatch picker bound to `--sys-color-{accent|info|good|warn|danger}`). `Create role` appends to `ROLES`, seeds the new role's matrix entry as an empty `Set`, persists, selects the new role on close. **Validation:** name is `trim()`-ed before checks, must be ≥2 visible chars (rejects whitespace-only), and must be **case-insensitively unique** against `current ROLES` and against the four hardcoded `Role` literal-union values in `src/app/pages/users/fixtures.ts` (so a custom role named `admin` cannot collide with the seed `Administrator` or with the Users page's role vocabulary). `Cancel` closes with no changes. (The React mockup's "Clone permissions from" dropdown is intentionally omitted — Duplicate already covers cloning, and the dual-path created a redundant code branch and contradicted the modal's "Permissions start empty" subtitle.)
- **Role ID generation:** new and duplicated roles get IDs from a `randomId()` helper matching the precedent in `src/app/pages/users/users.store.ts:36-38` (e.g. `r_8f2a`). Seed roles keep their human-readable slugs (`admin`, `ops`, `support`, `viewer`, `billing`) for screenshot fidelity. The `id` is the matrix key and is never displayed.
- **Duplicate role behavior:** both header `Duplicate role` and per-role-card `Duplicate` clone the **currently-selected** role: copies its matrix set into a new `Set`, allocates a fresh `randomId()`, names it `{Original name} (copy)` (incrementing `(copy 2)`, `(copy 3)`, … on collision under the same case-insensitive rule), reuses the source `color`, sets `users: 0`, persists, then auto-selects the clone.
- **Delete role behavior:** trash icon on the right card head. Opens a small confirm overlay (`Delete role "{name}"? This cannot be undone.`). On confirm, removes the role from `ROLES` and the matrix, persists, falls back to selecting the previous role in the list (or the first if there's no previous). The trash control is suppressed entirely on built-in seeds.
- **Persistence:** runtime shape `Record<RoleId, Set<string>>` for both the committed matrix and the draft matrix; on the storage boundary, persist the **committed** matrix only as `{ schemaVersion: 1, roles: RoleRecord[], matrix: Record<RoleId, string[]> }` under storage key `ch.roles.v1` (mirrors the `ch.users.v1` precedent in `src/app/pages/users/users.store.ts:4`). Hydrate from `localStorage` on first load (falling back to the seed fixture in `public/data.jsx`) and rewrite **only when `Save changes` is clicked or when a lifecycle mutation (New/Duplicate/Delete) commits**. Lifecycle mutations commit immediately because they are explicit user intents with their own confirmations; they do not flow through the draft-matrix dirty state. **Hydration error handling** mirrors the Users store at `src/app/pages/users/users.store.ts:45-62, 125-132`: parse error → seed fallback; unknown role IDs in stored matrix → silently dropped (orphan keys removed); permission keys in stored matrix that no longer exist in `PERMISSIONS` → silently dropped (handles future fixture removals); persist-side `try/catch` swallows quota-exceeded so a full-storage browser doesn't crash the page. The `RolesStore` exposes a `resetToDemo()` method matching the Users store's API at line 176; the in-page affordance for invoking it is deferred — see Open Questions.
- **User counts:** the muted `{N} users` text reads from a per-role `users` field that comes from the seed and is **not** recomputed from the (separate) Users page. New / duplicated roles start at `0 users`. This avoids cross-page coupling and matches the React mockup, where the count is just metadata on the role. (Honest framing: this is a demo-time choice that accepts mockup numbers diverging from the real `USERS` array; a future plan that makes role chips deep-link to this page should reconsider in tandem with referential integrity — see Out of scope.)

### Out of scope

- **Wiring permission changes to anything else.** Toggling `users.delete` for the `viewer` role does not affect what viewers can do elsewhere in the demo — there is no enforcement layer, no route guards, no Users-page filtering by current viewer's perms. The page is a faithful editor for the matrix data structure, period.
- **Audit-log entry on permission change.** The React mockup quietly drops audit lines when matrices change; not implementing here. The existing `AUDIT` fixture already includes one such entry, which is enough to look real on the (separate) Audit page.
- **Editing a role's name/description/color after creation.** Once a custom role exists, the only mutations are the matrix and delete. Renaming is deferred. (The screenshots never show a role-edit modal.)
- **Reordering roles** in the left list or in the matrix columns. Order is fixture order, with new roles appended.
- **Server sync, API integration, auth.** Entirely client-side, like Users.
- **Per-permission descriptions / tooltips** beyond the slug. The mockup shows label + slug only.
- **Dark mode.** Inherits the light-mode-only stance from the Dashboard / Users plans.
- **Responsive refinement below ~1024px.** The matrix targets desktop widths matching the screenshots; mobile polish is a separate plan.
- **Cross-page deep-links** from a user's role chip to the matching role. Trivial follow-up; not in this plan.

## Success Criteria

- Navigating to `/roles` renders the page pixel-close to `public/images/roles-permissions_*.png` for every selected role — layout, typography, color-bar accents, card chrome, section header rows, checkbox styling, button styles — within small eyeball tolerance.
- Selecting a role on the left updates the right card's title + subtitle and the trash-icon visibility, but the matrix table stays a unified cross-role view (every role column visible at all times).
- Toggling any checkbox immediately updates the cell, the muted "{M} permissions" count under the role in the left list, and the underlying `localStorage` payload — verified by reload.
- `New role`, both `Duplicate` controls, and the trash icon all produce the documented effects end-to-end (matrix columns add/remove, role list updates, selection moves sensibly, persistence holds).
- Edits and lifecycle changes survive a full page reload via `localStorage`. (`RolesStore.resetToDemo()` is implemented and tested; surfacing it in the UI is a follow-up — see Open Questions.)
- Keyboard-only flow works: skip-link → topbar → sidebar → main → page-action buttons → role-list rows (Up/Down/Enter) → matrix checkboxes (Tab + Space). The new-role modal traps focus while open and returns focus to its invoking control on close. The delete-confirm overlay does the same.
- `ng build` and the unit test suite pass with no new console a11y warnings.

## Non-Goals / Explicit Rejections

- No optimistic-UI complexity — because there is no server, mutations are synchronous.
- No accessibility features beyond what Angular Material + CDK a11y give us by default (focus trap in overlays, announced live regions for toggle / role-add / role-delete events).
- No attempt to enforce permissions anywhere else in the app — this page edits a data structure, not a policy engine.

### Invariant (load-bearing)

- **`ROLES` is never empty by construction.** Decision 4 (built-ins non-deletable) guarantees ≥5 roles at all times. No empty-list UI is authored — if a future plan loosens built-in suppression, the empty state must be added together with hardening every load-bearing access of `selectedRole.name` / `.description` against `roles.length === 0`.

## Key Decisions Resolved

1. **Full mockup parity** with both the screenshots and the React `RolesPage` source, except where the two disagree — see decisions 2 and 5.
2. **Dirty-state draft matrix + Save/Discard footer + "Unsaved changes" chip**, ported faithfully from the React mockup `RolesPage` at `public/pages-1.jsx:380-389, 462-467`. **Reverses an earlier resolution** that called for immediate-write on toggle: the user pointed at `public/images/roles-permissions_adminstartor.png` (note: misspelled filename, distinct from the other five clean-state shots), which clearly shows the dirty-state chrome. Toggles update a draft matrix only and mark the page dirty; `Save changes` commits to the live matrix and to `localStorage`; `Discard` reverts the draft. The live `{M} permissions` count under each role reads from the **draft** so the user gets instant visual feedback while the commit is still pending. Lifecycle mutations (New / Duplicate / Delete) bypass the draft and commit immediately because they have their own explicit confirmations.
3. **Wire every role lifecycle control** — `New role`, header `Duplicate role`, per-role-card `Duplicate`, per-role-card trash. User selected this option. Lifecycle changes update the left list, the matrix columns, the selection, and `localStorage` in one synchronous step.
4. **Built-in roles are non-deletable.** All five seed roles (admin, ops, support, viewer, billing) hide the trash icon. Only roles created via `New role` or `Duplicate` show the trash. This is a slight extension of the React rule (`activeRole !== 'admin'` only), justified because the seeds anchor the demo's "real org" feeling and accidentally deleting them would silently break the screenshot baseline.
5. **User counts are static metadata, not derived.** The `{N} users` text under each role in the left list reads from the role record, not from the Users page's `USERS` array. Avoids a cross-store dependency and matches the React mockup's behavior. New roles start at `0 users`.
6. **Permission count under each role IS live.** The `{M} permissions` text recomputes from the matrix on every toggle. This is the small but satisfying feedback loop that proves the page is real, and it's already how the React mockup behaves.
7. **Header `Duplicate role` and per-role-card `Duplicate` do the same thing** (clone the currently-selected role). Two entry points to one verb is consistent with the screenshots and keeps the model simple. If they ever diverge in intent (e.g. header opens a "duplicate as…" modal), revisit.

## Open Questions (for planning)

- **Reset to demo data affordance.** Same question the Users plan left open. Lean toward a tiny footer link on the page (`Reset demo data`) so the affordance is shared in spirit with the Users page even though the actual reset is per-store. Planning to decide placement and whether the two pages share a single "reset everything" button somewhere global.
- **Color picker primitive in the New role modal.** Native radio swatches, `MatChipListbox`, or a small custom row. Planning to choose; all three are cheap.
- **Confirm-delete primitive.** `MatDialog` (consistent with the planned Invite-user modal) vs. a smaller inline popover anchored to the trash icon. Lean toward `MatDialog` for accessibility consistency, but inline reads lighter visually.
- **Matrix horizontal-scroll threshold.** The matrix has 6 fixed columns today; with N custom roles it can grow wide. Decide whether to pin the Permission column on horizontal scroll, set a max number of visible role columns, or just let the page scroll. Cheap to defer until it bites.
- **Discrepancy between fixture user counts and the screenshots.** Fixture says ops=8 / support=14 / viewer=22 / billing=2 users; some screenshots show smaller numbers (e.g. "6 users", "12 users", "1 user"). Treat the **fixture as source of truth** (matches the precedent the User Management plan set) and let the screenshots' specific numbers go. Flagged here so reviewers don't read it as a bug.
- **Should the matrix-table column header use `r.name.split(' ')[0]`** (React's behavior — "Operations Manager" → "Operations", "Support Agent" → "Support") or the full role name? React truncation keeps the header narrow; full name aids clarity for custom roles that might not have a useful first word. Lean React-style truncation for built-ins, full name for custom; planning can decide.

## Dependencies

- **User Management plan units 1–4 are a prerequisite (or at minimum the shell + token layer).** Specifically the `--sys-*` token layer in `src/app/core/system-colors.css`, the shell + sidebar in `src/app/layout/`, and the `localStorage`-store pattern established in `src/app/pages/users/users.store.ts` (which the new `roles.store.ts` should mirror).
- No new third-party libraries expected. Angular Material already provides `MatCheckbox`, `MatDialog` (for new-role + delete-confirm), `MatIcon`, `MatButton`, and overlay/focus-trap utilities.

## Sources & References

- Visual targets (clean state): `public/images/roles-permissions_adminintration.png`, `public/images/roles-permissions_operations_manager.png`, `public/images/roles-permissions_support_agent.png`, `public/images/roles-permissions_viewer.png`, `public/images/roles-permissions_billing.png`.
- Visual target (dirty state): `public/images/roles-permissions_adminstartor.png` (note: misspelled filename, **distinct from `_adminintration.png`**) — shows the "Unsaved changes" chip in the page header and the sticky `Discard` / `Save changes` footer below the matrix.
- React source of truth: `public/pages-1.jsx` `RolesPage` (lines 372–471), including the dirty-state Save/Discard footer at lines 462–467 — ported faithfully (see Decision 2).
- Fixtures: `public/data.jsx` `ROLES` (lines 18–24), `PERMISSIONS` (lines 26–58), `ROLE_MATRIX` (lines 60–66).
- Design tokens: `src/app/core/system-colors.css` (`--sys-*` layer authored by the Dashboard plan).
- Shell host: `src/app/layout/shell/shell.ts` and `src/app/app.routes.ts` (extend with `/roles` child route alongside the existing `/users`).
- Sidebar nav entry already exists: `src/app/layout/sidebar/nav.data.ts:7` → `{ id: 'roles', label: 'Roles & Permissions', icon: 'shield' }`.
- Precedent for store + persistence + per-page conventions: `src/app/pages/users/users.store.ts`, `src/app/pages/users/users.ts`, `src/app/pages/users/fixtures.ts`.

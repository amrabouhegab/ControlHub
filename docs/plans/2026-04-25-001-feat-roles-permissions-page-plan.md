---
title: "feat: Angular Roles & Permissions page matching public/ mockup"
type: feat
status: active
date: 2026-04-25
origin: docs/brainstorms/2026-04-25-roles-permissions-page-requirements.md
---

# feat: Angular Roles & Permissions page matching public/ mockup

## Overview

Port the ControlHub **Roles & Permissions** page from the React mockup (`public/pages-1.jsx` `RolesPage`, lines 372–471) into the Angular 21 app under `src/`, pixel-close to the six `public/images/roles-permissions_*.png` screenshots (five clean states + one dirty state — `roles-permissions_adminstartor.png`, note misspelled filename). Adds a `/roles` route inside the existing shell, renders a left role list (with live draft-permission counts) plus a right cross-role permission matrix. **Matrix toggles update a draft matrix only and mark the page dirty** — no `localStorage` write, no other-consumer change — until the user clicks `Save changes` in a sticky footer at the bottom of the matrix card; `Discard` reverts the draft. An "Unsaved changes" warn chip appears in the page header next to the action buttons whenever the draft differs from the committed matrix. Wires every role lifecycle control end-to-end: `New role` (modal), `Duplicate role` (header + per-card), `Delete role` (per-card trash, confirm dialog) — each commits immediately to both the live matrix and `localStorage`, bypassing the dirty-state machinery because each has its own explicit confirmation. Composes only the Angular Material primitives the User Management plan already installed; no new third-party libraries.

## Problem Frame

The Dashboard and User Management pages are live. The sidebar's "Roles & Permissions" entry (`src/app/layout/sidebar/nav.data.ts:7`) currently routes to `/roles`, which 404s — clicking it is a dead end. The React mockup, the five screenshots, and the seed fixtures (`ROLES`, `PERMISSIONS`, `ROLE_MATRIX` in `public/data.jsx:18-66`) all fully specify the page. The origin requirements document resolved full-parity scope, immediate-write persistence on toggles, and full lifecycle wiring. This plan translates that into Angular 21 units that mirror the precedent set by `src/app/pages/users/users.store.ts` and the Dashboard's `--sys-*` token layer.

## Requirements Trace

- R1. A `/roles` child route under `ShellComponent` renders the Roles & Permissions page with route data `{ title: 'Roles & Permissions', crumb: 'People · Access control' }`; the sidebar's "Roles & Permissions" item shows `aria-current="page"` when active (see origin: Scope > Route + Sidebar state).
- R2. Page header renders `<h1>Roles & Permissions</h1>`, the subtitle `Control what each role can see and do. Changes apply to all users with that role immediately.`, and a right-aligned action group: an "Unsaved changes" warn chip (dot + label) shown only when `RolesStore.dirty()` is true, then `Duplicate role` (outline, copy icon, clones the currently-selected role) and `New role` (primary, plus icon, opens new-role dialog). Chip placement matches `public/images/roles-permissions_adminstartor.png`: immediately to the left of `Duplicate role` (see origin: Page header).
- R3. A two-column body (`260px` left card + flex right card, `gap: 16px`, top-aligned) renders the role list and the permission matrix (see origin: Two-column body).
- R4. The role list shows each role with a vertical color-bar (`--sys-color-{accent|info|good|warn|danger}` per `r.color`), the role name, a muted line `{N} {user|users} · {M} permissions` where `M` is the **live** count from the matrix (recomputes on every toggle), and a decorative chevron-right glyph. Selected row gets a subtle sunken background plus `1px` outline (`--sys-bg-sunken` + `--sys-line-1`). Default selection is the first role (`admin`) (see origin: Role list).
- R5. The right card head shows the selected role's name + description; right-side actions are `Duplicate` (outline, sm) and a red trash icon button. The trash icon is hidden for built-in seeds (admin, ops, support, viewer, billing) and visible only for user-created roles (see origin: Role detail + Decision 4).
- R6. The permission matrix renders six section groupings (Users, Roles, Resources, Orders, Analytics, System) from `PERMISSIONS`, each opened by a tan/cream section-header row spanning the full table width. Each permission row shows the human label + a muted monospace slug. Each role column for that row renders a `MatCheckbox` bound to `RolesStore.draftMatrix()[roleId].has(permKey)`. Toggling updates the **draft matrix only** (not the committed matrix, not `localStorage`), marks the store dirty, and immediately recomputes the live `{M} permissions` count under each role in the left list (so the user sees the count change while the commit is pending). Nothing else observes the change until the user commits via the Save/Discard footer — see R6b (see origin: Permission matrix + Key Decisions below).
- R6b. **Save / Discard footer.** When and only when `RolesStore.dirty()` is true, render a sticky footer at the bottom of the matrix card with a right-aligned button group: `Discard` (outline, secondary) on the left of the group and `Save changes` (primary blue, check icon) on the right. Background `--sys-bg-sunken`, top border `--sys-line-1`. Layout, copy, and tone match `public/images/roles-permissions_adminstartor.png`. `Save changes` calls `RolesStore.commit()` (writes the draft matrix to the committed matrix and to `localStorage`); `Discard` calls `RolesStore.discard()` (reverts the draft to the committed matrix); both clear the dirty state and remove the footer + the "Unsaved changes" chip.
- R7. The matrix table has a sticky **first column** (`Permission`) under horizontal overflow so role columns can scroll independently when N > visible width. Column header for each role uses the **full role name** (not the React mockup's `name.split(' ')[0]` truncation) — clearer for custom roles, equally readable for built-ins (see origin: Open Question on column header truncation, resolved here).
- R8. New-role dialog: title `Create a new role`, subtitle `Permissions start empty — toggle them on in the matrix.`, fields **Name** (required, ≥2 visible chars after `trim`, case-insensitively unique against the current `ROLES` and against the four `Role` literal-union values in `src/app/pages/users/fixtures.ts:2`), **Description** (optional textarea), **Color** (single-select swatch row over the five `--sys-color-*` tokens). `Create role` appends to `ROLES`, seeds an empty matrix entry, persists, selects the new role, closes (see origin: New role modal).
- R9. Duplicate role behavior: both the header `Duplicate role` and the per-role-card `Duplicate` clone the currently-selected role — copies its matrix Set into a fresh Set, allocates a new `randomId()`, names it `{Original name} (copy)` (incrementing `(copy 2)`, `(copy 3)`, … on case-insensitive collision), reuses the source `color`, sets `users: 0`, persists, then auto-selects the clone (see origin: Duplicate role behavior + Decision 7).
- R10. Delete role behavior: the per-card trash button opens a confirm dialog (`Delete role "{name}"?` body `This cannot be undone.` with `Cancel` and a primary `Delete` button). On confirm, removes the role from `ROLES` and from the matrix, persists, falls back to selecting the previous role (or the first if none) (see origin: Delete role behavior).
- R11. Persistence: runtime shape `Record<RoleId, Set<string>>` for both the **committed** matrix and the **draft** matrix; on the storage boundary, persist the **committed** matrix only as `{ schemaVersion: 1, roles: RoleRecord[], matrix: Record<RoleId, string[]> }` under storage key `ch.roles.v1` (mirrors the `ch.users.v1` precedent). Hydrate on first load with seed fallback; `draftMatrix` initializes to a deep clone of the committed matrix. Hydration drops orphan role IDs and orphan permission keys from a stored matrix; `try/catch` swallows quota errors. `RolesStore.commit()` writes the draft → committed → `localStorage`; `RolesStore.discard()` reverts the draft to the committed; lifecycle mutations (`createRole`, `duplicateRole`, `deleteRole`) commit immediately to both committed and `localStorage` and also resync the draft (see "Lifecycle vs. dirty state" decision below). `RolesStore.resetToDemo()` restores the seed (see origin: Persistence).
- R12. Live permission count under each role reads from the **draft** matrix (so it updates as the user toggles, before commit). Both the draft-toggle path and the lifecycle-commit path depend on **immutable matrix replacement**: every mutation must replace the top-level matrix object reference and clone the affected role's inner `Set`; in-place `Set.add` / `Set.delete` will not trip Angular signal subscribers (see origin: Permission matrix + Decision 6).
- R13. Schema upgrade policy on a future `PERMISSIONS` change: when build N+1 adds a new permission key and a returning user has stored matrix with `schemaVersion: 1`, **built-in seed roles are unioned with the seed `ROLE_MATRIX`** (so `admin` automatically gains the new permission) and **custom roles stay opt-in** (start without it; the user must toggle to grant). Resolves the schema-migration P1 finding from document review.
- R14. Sidebar `aria-current="page"` is provided by adding `ariaCurrentWhenActive="page"` to the existing `routerLinkActive` binding in `src/app/layout/sidebar/sidebar.html` — the current template only toggles the CSS class. This plan modifies one line in that template.
- R15. Keyboard-only flow: skip-link → topbar → sidebar → main → page-action buttons → role-list rows (Up/Down/Enter to select) → matrix checkboxes (Tab + Space to toggle, sequential tab order, row-major). Both dialogs trap focus and restore it on close. Toggle/role-add/role-delete announce concise messages via `LiveAnnouncer`.
- R16. Implementation uses Angular 21 idioms: standalone components, signals + `computed`/`effect`, new control flow (`@for`, `@if`), `inject()`, and reads tokens from the existing `--sys-*` layer.

## Scope Boundaries

- No enforcement layer — toggling `users.delete` for `viewer` does not affect what viewers can do anywhere else in the app.
- No audit-log entry on permission change. The existing `AUDIT` fixture already includes a sample line; the Audit Logs page is separate.
- No editing of a role's name, description, or color after creation. Only matrix and delete are mutable on existing roles.
- No reordering of roles in the list or matrix columns (fixture order, new roles appended).
- No per-permission tooltips beyond the slug.
- No dark mode (inherits the project stance).
- No responsive polish below ~1024px (matches Users plan's stance).
- No cross-page deep-link from a Users-page role chip to this page (trivial follow-up).
- No empty-list state for `roles.length === 0` — the built-in suppression rule (R5 / origin Decision 4) is a load-bearing invariant that guarantees `≥ 5` roles at all times.

### Deferred to Separate Tasks

- **Roles enforcement layer** (route guards, perm-gated UI): separate plan; this page edits the data structure only.
- **Audit log entries** for permission changes: separate plan; included with the Audit page.
- **Edit-role form** (rename / re-color / re-describe): separate plan.
- **Cross-page deep-link** from `User.role` chip to the matching Roles page row: separate plan, blocked on the dangling-ref question (see Open Questions).
- **Shared `DemoStore<T>` primitive + global "Reset all demo data" affordance**: defer until the third per-page store lands (Resources page is next likely).
- **Responsive / mobile layout** (<1024px): separate plan.

## Context & Research

### Relevant Code and Patterns

- `public/pages-1.jsx` lines 372–471 — **behavioral source of truth** (`RolesPage`, including its dirty-state Save/Discard footer at lines 462–467 and `dirty` signal at lines 380–389 that this plan ports faithfully; see Key Decisions).
- `public/images/roles-permissions_*.png` (6 files: 5 clean-state + 1 dirty-state) — **visual source of truth**. The five clean shots are one per built-in role (`_adminintration.png`, `_operations_manager.png`, `_support_agent.png`, `_viewer.png`, `_billing.png`). The single dirty-state shot `roles-permissions_adminstartor.png` (note: different misspelling — `adminstartor` vs. `adminintration`) shows the "Unsaved changes" header chip and the sticky `Discard` / `Save changes` footer at the bottom of the matrix card.
- `public/data.jsx` lines 18–24 (`ROLES`), 26–58 (`PERMISSIONS`), 60–66 (`ROLE_MATRIX`) — seed fixtures.
- `src/app/pages/users/users.store.ts` — **store pattern source of truth**: `signal` + `computed` + `effect` shape, `try/catch`-wrapped `localStorage` adapter, `randomId()` helper at line 36, `resetToDemo()` semantics at line 176, `hasPersistedOverrides` flag at line 113. The `RolesStore` mirrors this structure with matrix-specific additions.
- `src/app/pages/users/users.ts` + `users.html` + `users.css` — page-component composition idioms (header + toolbar + table + pager + dialog overlays), `LiveAnnouncer` usage, `inject()` patterns.
- `src/app/pages/users/components/invite-user-dialog/` — `MatDialog` content + `ReactiveFormsModule` precedent for the new-role dialog.
- `src/app/pages/users/fixtures.ts` lines 1–4 — `Role` literal-union (`'Admin' | 'Operations' | 'Support' | 'Viewer'`) which the new-role uniqueness check must also reject (see R8).
- `src/app/layout/sidebar/sidebar.html` lines 21–22 — only modification outside `pages/roles/`: add `ariaCurrentWhenActive="page"` to the existing `routerLinkActive` binding.
- `src/app/layout/sidebar/nav.data.ts:7` — already contains `{ id: 'roles', label: 'Roles & Permissions', icon: 'shield' }`; no change.
- `src/app/app.routes.ts` — extend with the `/roles` child route after `/users`.
- `src/app/core/system-colors.css` — token source for `--sys-color-{accent|info|good|warn|danger}` and their `-soft` / `-ink` siblings, plus `--sys-bg-sunken`, `--sys-line-1`, `--sys-ink-{1..5}`, `--sys-radius-lg`. Note: the React mockup's unprefixed token names (`--accent`, `--bg-sunken`, `--line-1`) do not exist in this codebase — always translate to the `--sys-*` namespace.
- `public/styles.css` — visual reference for `.matrix` table density, `.chip` styles, section-header row tone.

### Institutional Learnings

- `docs/solutions/` not populated yet — none to apply.

### External References

- Angular Material v21 `MatDialog` (new-role dialog, delete-confirm dialog), `MatCheckbox` (matrix cells), `MatIcon` + `MatIconButton` (header actions, role-card actions, trash, color swatches), `MatButton` (header + dialog + Save/Discard footer buttons), `MatTooltip` (icon-button labels), `MatFormField` + `MatInput` (new-role form fields).
- `@angular/cdk/a11y` `LiveAnnouncer` for save / discard / add / delete announcements; focus trap comes for free inside `MatDialog`.

## Key Technical Decisions

- **Roles matrix runtime shape is `Record<RoleId, Set<string>>`; storage shape is the array form `Record<RoleId, string[]>` wrapped in `{ schemaVersion: 1, roles, matrix }` under `ch.roles.v1`.** Rationale: `Set` semantics (membership check, no dupes) match the React mockup and keep `toggle` O(1); arrays are required at the `JSON.stringify` boundary. Mirrors the `ch.users.v1` precedent exactly. Schema version exists from day one so future permission additions can run a deterministic upgrader (see R13).
- **Dirty-state draft matrix + Save/Discard footer + "Unsaved changes" header chip.** Reverses an earlier resolution (and the document-review P0 with it): the React mockup at `public/pages-1.jsx:380-389, 462-467` was the intended pattern all along, and the dirty-state screenshot at `public/images/roles-permissions_adminstartor.png` confirms it (the file was missed in the initial review because of its misspelled name vs. `_adminintration.png`). Toggles update a draft matrix only; commit happens on `Save changes` or is reverted on `Discard`. Live `{M} permissions` counts read from the draft so the user gets instant visual feedback while the commit is still pending. Implementing as draft + commit also auto-resolves the document-review P0 about misclicks on destructive cells: a stray click on `users.delete` for `Administrator` is a draft-only change until the user commits, and `Discard` is the recovery affordance.
- **Lifecycle vs. dirty state.** `createRole`, `duplicateRole`, and `deleteRole` commit immediately and bypass the draft/Save flow. Rationale: each has its own explicit confirmation surface (a modal for create, a confirm dialog for delete; duplicate has no confirm but is a single explicit click), so wrapping them in dirty-state would create awkward double-commits ("did the role appear?" + "did I save?"). On commit-to-storage from a lifecycle mutation, the draft matrix is also resynced — adding a new role seeds an empty draft entry for it, deleting a role removes the draft entry. If the user had pending matrix-toggle changes and then triggers a lifecycle mutation, those toggle changes stay in the draft (they apply to the still-existing roles); only the changed role's entry is added/removed.
- **Lifecycle controls (New / Duplicate / Delete) all persist via `RolesStore` and survive reload.** Both Duplicate entry points (header + per-card) call the same `RolesStore.duplicateRole(roleId)` method per origin Decision 7; the redundancy is faithful to the screenshots and is a 4-line cost.
- **Confirm-delete uses `MatDialog`** for consistency with the new-role dialog (and the invite-user dialog from the User Management plan), getting focus trap + escape-to-close + focus restoration for free. An anchored popover would be visually lighter but inconsistent and would require manual a11y plumbing.
- **Color swatch picker in the new-role dialog is a native `<button role="radio">` group** over the five `--sys-color-*` tokens (16×16 swatches with a 2-px border + an inner check icon when selected). Rationale: `MatChipListbox` is overkill for five static options; native radio semantics give arrow-key navigation for free; matches the dot-on-bar visual language of the role list.
- **Matrix is a native `<table>`** with `aria-sort`-style attributes (no sort here yet, but reserved). Sequential tab order through checkboxes is acceptable at the current ~6 col × ~20 row scale; `role="grid"` with arrow-key navigation would be over-engineering for a demo of this size. The `Permission` first column is `position: sticky; left: 0` so it stays visible when role columns overflow horizontally.
- **No shared `DemoStore<T>` primitive yet.** The User Management plan owns one store, this plan adds a second; the carrying cost of two parallel stores is small. Defer extraction until a third per-page store is added (Resources page is next).
- **Single `RolesStore` (`providedIn: 'root'`)** owns `roles = signal<RoleRecord[]>()`, `committedMatrix = signal<Record<RoleId, Set<string>>>()`, `draftMatrix = signal<Record<RoleId, Set<string>>>()`, `selectedRoleId = signal<RoleId>(...)`, plus `computed` selectors: `activeRole`, `permCountsById` (reads `draftMatrix` so counts update live), and `dirty = computed(() => !matricesEqual(committedMatrix(), draftMatrix()))`. Mutation methods: `togglePermission(roleId, permKey)` (mutates **draft only**, no persist), `commit()` (writes `draftMatrix` → `committedMatrix` and to `localStorage`), `discard()` (reverts `draftMatrix` to deep clone of `committedMatrix`), `createRole(draft)`, `duplicateRole(sourceId)`, `deleteRole(id)` (each mutates `roles` + `committedMatrix` + `draftMatrix` together and persists immediately), `selectRole(id)`, `resetToDemo()`. Every committing mutation calls a private `persist()` helper that serializes the current `(roles, committedMatrix)` pair to `localStorage`. One `effect()` is **not** used for persistence — explicit `persist()` calls inside each commit method give the dirty/commit/discard flow tighter control.
- **Sidebar template gets one one-line edit** to add `ariaCurrentWhenActive="page"` to the `<a routerLinkActive="active">` element. The previous (User Management) plan claimed this attribute was already present — it isn't; document-review caught it; we fix it here so both pages benefit.

## Open Questions

### Resolved During Planning

- **Recovery affordance for matrix toggles (document review P0):** resolved as the React mockup's dirty-state Save/Discard footer + "Unsaved changes" header chip, ported faithfully. Discovered that `public/images/roles-permissions_adminstartor.png` (misspelled filename) shows this state exactly. The user explicitly required this pattern for any matrix/batch checkbox surface — toggles must batch into a draft and commit only on Save. Auto-resolves the original P0 (misclicks are draft-only until Save) without a snackbar.
- **Reset to demo data placement (origin open question):** resolved as a small muted link rendered at the bottom-right of the right card (below the matrix), visible only when `RolesStore.hasPersistedOverrides() === true`. Mirrors the Users page's pager-row link in spirit (small, discoverable, out of the main toolbar).
- **Color picker primitive (origin open question):** resolved as a native `<button role="radio">` swatch row of the five `--sys-color-*` tokens. Lightweight, arrow-key accessible, no extra Material module.
- **Confirm-delete primitive (origin open question):** resolved as `MatDialog` for a11y consistency with `MatDialog`-based new-role and invite-user dialogs.
- **Matrix horizontal-scroll threshold (origin open question):** resolved as `overflow-x: auto` on the matrix wrapper with the `Permission` column `position: sticky; left: 0`. Triggers naturally when N roles exceeds visible width.
- **Matrix column header truncation (origin open question):** resolved as **full role name** (override the React mockup's `name.split(' ')[0]`). Cleaner for custom roles; the built-in seeds ("Operations Manager", "Support Agent") fit fine.
- **Schema migration policy (document review P1):** resolved as built-ins union with seed, custom roles stay opt-in. Implemented in the hydration path (Unit 1).
- **Two Duplicate entry points (document review P2):** resolved as keep both per origin Decision 7. They share one store method.
- **Per-page localStorage compounding (document review P1):** resolved as defer extraction to the third store (Resources). Two parallel stores have minimal carrying cost; three is the inflection point.
- **Dangling User.role references on delete (document review P0):** resolved as **accept and document**. Today, custom roles cannot be assigned to users from any flow (the Users page's invite + bulk-set-role only offer the four built-in `Role` literals, and built-ins are non-deletable). The dangling-ref scenario is structurally unreachable from this plan. The future "extend bulk-set-role to custom roles" plan must handle it then — captured below in Deferred to Implementation as a guard the future flow needs to add.
- **Fixture vs. screenshot user-count discrepancy (origin open question):** fixture wins (matches User Management plan precedent). Screenshots' specific numbers (e.g., "12 users", "1 user") are stale rendering data, not a contract.
- **Drawer/dialog semantics:** new-role and confirm-delete are both standard centered `MatDialog` instances; no right-anchored side panel needed (unlike the Users page's drawer).

### Deferred to Implementation

- Exact `Material Symbols` names per icon (expected candidates: `add`, `content_copy`, `delete`, `chevron_right`, `check`). Confirm when authoring; substitute equivalents if any are missing from the installed icon font.
- Whether to add a route guard / `beforeunload` warning when `dirty()` is true. Default: no guard — the chip + footer are the visible cue, the demo cost of losing pending toggles is small, and adding a guard adds a confirmation surface that is awkward in single-page navigation. Revisit if the page graduates from demo to production or if user testing shows accidental nav loss.
- Whether the "(copy 2)" / "(copy 3)" rename loop has an upper bound. Default: no bound — practically the user will not duplicate the same source 99 times. Add a guard later only if it bites.
- Whether new-role validation also rejects names that begin with whitespace after `trim` (impossible by construction since `trim` removes it). Keep the trim → length → uniqueness pipeline straightforward.
- When the future cross-page flow extends `bulkSetRole` to custom roles, that plan must add either (a) a guard in `deleteRole` blocking deletion when any user references the role's name, or (b) a reassign-or-cancel dialog. Captured here as a forward-looking note; not implemented in this plan.

## Output Structure

```
src/
  app/
    pages/
      roles/
        roles.ts                                 (new: RolesPageComponent)
        roles.html
        roles.css
        roles.spec.ts                            (new)
        roles.store.ts                           (new: RolesStore service + Role/Permission types)
        roles.store.spec.ts                      (new)
        fixtures.ts                              (new: SEED_ROLES, SEED_PERMISSIONS, SEED_ROLE_MATRIX)
        components/
          role-list/
            role-list.ts                         (new: standalone)
            role-list.html
            role-list.css
          permission-matrix/
            permission-matrix.ts                 (new: standalone)
            permission-matrix.html
            permission-matrix.css
          new-role-dialog/
            new-role-dialog.ts                   (new: MatDialog content)
            new-role-dialog.html
            new-role-dialog.css
          confirm-delete-dialog/
            confirm-delete-dialog.ts             (new: MatDialog content)
            confirm-delete-dialog.html
            confirm-delete-dialog.css
    layout/
      sidebar/
        sidebar.html                             (modified: add ariaCurrentWhenActive="page")
    app.routes.ts                                (modified: add /roles child route)
```

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
RolesPageComponent (route /roles)
 ├─ header                ( <h1>, subtitle, [@if dirty] "Unsaved changes" chip, Duplicate role (header), New role )
 ├─ <section class="ch-grid"> 260px / 1fr
 │    ├─ <app-role-list [roles]="store.roles()" [activeId]="store.selectedRoleId()" [counts]="store.permCountsById()" (select)="store.selectRole($event)" />
 │    └─ <section class="ch-card matrix-card">
 │          ├─ card-head    ( {role.name}, {role.description}, Duplicate (per-card), trash (if !builtIn) )
 │          ├─ <app-permission-matrix [roles]="store.roles()" [sections]="SECTIONS" [draftMatrix]="store.draftMatrix()" (toggle)="store.togglePermission($event.roleId, $event.permKey)" />
 │          ├─ [@if dirty] sticky footer  ( Discard → store.discard()  |  Save changes → store.commit() )
 │          └─ Reset demo data link  ( visible when store.hasPersistedOverrides() )
 └─ (overlays opened via MatDialog)
      ├─ NewRoleDialogComponent       ( reactive form, name+desc+color; on close: store.createRole(draft) )
      └─ ConfirmDeleteDialogComponent ( "Delete role {name}?"; on confirm: store.deleteRole(id) )

RolesStore (root service)
 ├─ roles = signal<RoleRecord[]>(...)                       // hydrated from localStorage
 ├─ committedMatrix = signal<Record<RoleId, Set<string>>>() // source of truth; persisted; seed-union for built-ins (R13)
 ├─ draftMatrix = signal<Record<RoleId, Set<string>>>()     // ephemeral; init = deep clone of committed; mutated by every toggle
 ├─ selectedRoleId = signal<RoleId>('admin')
 ├─ hasPersistedOverrides = signal(false)
 ├─ activeRole = computed(() => roles().find(r => r.id === selectedRoleId()))
 ├─ permCountsById = computed(() => Object.fromEntries(roles().map(r => [r.id, draftMatrix()[r.id]?.size ?? 0])))  // reads draft → live count
 ├─ dirty = computed(() => !matricesEqual(committedMatrix(), draftMatrix()))
 └─ methods:
     - togglePermission(roleId, permKey)   // mutates draftMatrix only; no persist
     - commit()                             // committedMatrix ← draftMatrix; persist; clears dirty
     - discard()                            // draftMatrix ← deep clone of committedMatrix; clears dirty
     - createRole, duplicateRole, deleteRole // mutate roles + committedMatrix + draftMatrix together; persist immediately
     - selectRole, resetToDemo
```

Data flow is one-directional: child components emit intents (`select`, `toggle`); the page wires them into store mutations; the store recomputes derived signals; child components re-render from the new signal values. **Toggles update the draft matrix only** — no persistence, no other-page effect — until the user clicks `Save changes`. The `dirty` computed signal drives both the header chip and the sticky footer. Dialogs are opened imperatively from the page via `inject(MatDialog)`.

## Implementation Units

- [ ] **Unit 1: `RolesStore` service + `Role` / `Permission` types + draft/committed matrix + `localStorage` persistence + seed fixture**

**Goal:** Stand up a dependency-free signal-backed store for roles + permission matrix that maintains a separate **draft** matrix (mutated by every checkbox toggle) and a **committed** matrix (the source of truth that persists to `localStorage`); exposes `commit()` / `discard()` to reconcile them and a `dirty` computed signal driving the footer + chip; lifecycle mutations (create/duplicate/delete) commit immediately. No UI yet.

**Requirements:** R6, R8, R9, R10, R11, R12, R13, R16

**Dependencies:** None (Users plan units already bootstrapped the app and established the precedent).

**Files:**
- Create: `src/app/pages/roles/roles.store.ts`
- Create: `src/app/pages/roles/fixtures.ts`
- Create: `src/app/pages/roles/roles.store.spec.ts`

**Approach:**
- `fixtures.ts` exports `SEED_ROLES: RoleRecord[]` (transcribed from `public/data.jsx:18-24`), `SEED_PERMISSIONS: PermissionSection[]` (from `public/data.jsx:26-58`), and `SEED_ROLE_MATRIX: Record<RoleId, ReadonlySet<string>>` (from `public/data.jsx:60-66`, converting each plain array into a `Set`).
- Types: `type RoleId = string;` `type RoleColor = 'accent'|'info'|'good'|'warn'|'danger';` `interface RoleRecord { id: RoleId; name: string; description: string; users: number; color: RoleColor; builtIn?: boolean; }` `interface PermissionItem { k: string; label: string; }` `interface PermissionSection { section: string; items: PermissionItem[]; }` `interface PersistedShape { schemaVersion: 1; roles: RoleRecord[]; matrix: Record<RoleId, string[]>; }` `interface CreateRoleDraft { name: string; description: string; color: RoleColor; }`.
- The five seed roles are marked `builtIn: true` in `SEED_ROLES`. Custom roles created via `createRole` / `duplicateRole` get `builtIn: false` (or omit the field). The trash icon's visibility (R5) keys off this flag.
- `RolesStore` (`@Injectable({ providedIn: 'root' })`) holds: `roles = signal<RoleRecord[]>(...)`, `committedMatrix = signal<Record<RoleId, Set<string>>>(...)` (source of truth, persisted), `draftMatrix = signal<Record<RoleId, Set<string>>>(...)` (initialized to a deep clone of `committedMatrix`; mutated by every checkbox toggle; never persisted directly), `selectedRoleId = signal<RoleId>('admin')`, `hasPersistedOverrides = signal(this.readPersistedFlag())`.
- `randomId()` matches the Users store's pattern (`src/app/pages/users/users.store.ts:36-38`) but with `r_` prefix: `'r_' + Math.random().toString(36).slice(2, 8)`. Used by `createRole` and `duplicateRole`.
- `cloneMatrix(src): Record<RoleId, Set<string>>` private helper — `Object.fromEntries(Object.entries(src).map(([id, set]) => [id, new Set(set)]))`. Used by `discard()`, by lifecycle mutations to keep draft and committed in sync, and by the deep-clone seed initializer.
- `matricesEqual(a, b): boolean` private helper — same key set on both sides + each role's `Set` has the same size and `[...a[id]].every(k => b[id].has(k))`. Used by the `dirty` computed signal.
- Hydration helper `hydrate()` returns `{ roles, matrix }` (the matrix here is the **committed** matrix; the constructor then deep-clones it into `draftMatrix`):
  - On parse error or missing key → `{ roles: [...SEED_ROLES], matrix: cloneSeedMatrix() }`.
  - On valid parse: read stored `roles` and `matrix`. For each stored role, if its `id` matches a seed role's `id`, also union the seed permissions for that role into the stored set (this is R13 — built-ins automatically gain new permissions added in seed). For each stored permission key, drop it if it's not present in `SEED_PERMISSIONS`'s flattened key set (orphan-key removal). For each role-id in stored `matrix` that's not present in stored `roles`, drop the entry (orphan-role removal).
- Constructor: `const { roles, matrix } = hydrate(); this.roles.set(roles); this.committedMatrix.set(matrix); this.draftMatrix.set(this.cloneMatrix(matrix));`.
- `persist()` is a private method called explicitly by `commit()` and by every lifecycle mutation method. Wraps `localStorage.setItem('ch.roles.v1', JSON.stringify({ schemaVersion: 1, roles: roles(), matrix: serializeMatrix(committedMatrix()) }))` in `try/catch`; on success sets `hasPersistedOverrides.set(true)`. `serializeMatrix` converts `Set` → `string[]`. **Toggles do not call `persist()`** — only `commit()` and lifecycle mutations do.
- Mutation methods:
  - `togglePermission(roleId, permKey): void` — **mutates `draftMatrix` only**. Replaces the whole `draftMatrix` object reference, clones the affected role's `Set`, adds or removes the key. Does NOT touch `committedMatrix` and does NOT call `persist()`. The `dirty` computed will become `true` on the first divergence.
  - `commit(): void` — `committedMatrix.set(cloneMatrix(draftMatrix()))`; then `persist()`. After this, `dirty` computes back to `false`. No-op (early return) when `!dirty()`.
  - `discard(): void` — `draftMatrix.set(cloneMatrix(committedMatrix()))`. After this, `dirty` computes back to `false`. Does not persist (nothing changed on the storage boundary). No-op when `!dirty()`.
  - `createRole(draft: CreateRoleDraft): RoleId` — generates `id = randomId()`, appends `{ id, name: draft.name.trim(), description: draft.description?.trim() ?? '', users: 0, color: draft.color, builtIn: false }` to `roles()`, seeds `committedMatrix()[id] = new Set()` AND `draftMatrix()[id] = new Set()` (immutable replacement on both), calls `selectRole(id)`, calls `persist()`, returns the new id. Bypasses the dirty-state machinery — adding the new role's empty entry to both matrices keeps them equal, so `dirty` stays whatever it was before (any prior toggle changes are preserved in the draft).
  - `duplicateRole(sourceId): RoleId` — finds source role; computes a unique name via `nextCopyName(sourceName)` helper that increments `(copy)` → `(copy 2)` → `(copy 3)` under case-insensitive collision against current role names; allocates `id = randomId()`; appends `{ id, name, description: source.description, users: 0, color: source.color, builtIn: false }`; **clones source's _committed_ matrix Set** into both `committedMatrix()[id] = new Set(committedMatrix()[sourceId])` AND `draftMatrix()[id] = new Set(committedMatrix()[sourceId])`; calls `selectRole(id)`; calls `persist()`; returns id. Note: the duplicate is seeded from the committed matrix (the saved truth), not from any pending draft of the source — this avoids "duplicate captured permissions I haven't saved yet" surprises.
  - `deleteRole(id): void` — guard: throw if `roles().find(r => r.id === id)?.builtIn === true` (defensive — UI hides the trash for built-ins, but the store is the safety net). Removes the role from `roles()`, deletes both `committedMatrix()[id]` AND `draftMatrix()[id]` (immutable replacement on both). If `selectedRoleId() === id`, picks a new selection: previous index in the original `roles()` array, or the first role if the deleted role was at index 0. Calls `persist()`.
  - `selectRole(id): void` — guard: throw or no-op if id not in `roles()`. Updates `selectedRoleId.set(id)`. Does not persist (selection is ephemeral, not stored).
  - `resetToDemo(): void` — `localStorage.removeItem('ch.roles.v1')`, `roles.set([...SEED_ROLES])`, `committedMatrix.set(cloneSeedMatrix())`, `draftMatrix.set(cloneSeedMatrix())`, `selectedRoleId.set('admin')`, `hasPersistedOverrides.set(false)`.
- `nameIsAvailable(candidateName, excludingId?): boolean` — exposed helper used by the new-role dialog's validator. Trims, lowercases, compares against current `roles()` (excluding `excludingId` if supplied) and against `['Admin', 'Operations', 'Support', 'Viewer']` (the Users page's `Role` literal-union from `src/app/pages/users/fixtures.ts:2`).
- Computed: `activeRole = computed(() => roles().find(r => r.id === selectedRoleId()) ?? roles()[0])`. `permCountsById = computed(() => { const m = draftMatrix(); return Object.fromEntries(roles().map(r => [r.id, m[r.id]?.size ?? 0])); })` — **reads `draftMatrix` so the live count under each role updates as the user toggles, before commit (R12)**. `dirty = computed(() => !this.matricesEqual(committedMatrix(), draftMatrix()))` — drives both the page-header "Unsaved changes" chip and the sticky `Save / Discard` footer in Unit 7.

**Patterns to follow:**
- `src/app/pages/users/users.store.ts` lines 4, 36–43, 45–62, 113, 125–132, 176–187 — storage key, `randomId`, hydrate-with-fallback, `hasPersistedOverrides` flag, persist with `try/catch`, `resetToDemo` semantics.
- `src/app/pages/users/fixtures.ts` for the typed-constants idiom.

**Test scenarios:**
- Happy path: construct with no `localStorage` → `roles()` equals `SEED_ROLES`, `committedMatrix()['admin'].size === 19` (count from SEED_ROLE_MATRIX), `draftMatrix()['admin'].size === 19`, `committedMatrix()['admin'] !== draftMatrix()['admin']` (distinct Set instances — proves deep clone), `dirty() === false`, `selectedRoleId() === 'admin'`, `hasPersistedOverrides() === false`.
- Happy path (toggle is draft-only): `togglePermission('viewer', 'res.create')` → `draftMatrix()['viewer'].has('res.create') === true`, `committedMatrix()['viewer'].has('res.create') === false` (committed unchanged), `permCountsById()['viewer']` increases by 1 (count reads draft), `dirty() === true`, `hasPersistedOverrides() === false` (no persist on toggle), `localStorage.getItem('ch.roles.v1') === null`. The `draftMatrix` object reference is new (immutable replacement, not in-place mutation).
- Happy path (toggle off again clears dirty): after the toggle above, call `togglePermission('viewer', 'res.create')` again → `draftMatrix()` deep-equals `committedMatrix()`, `dirty() === false`, no persist happened.
- Happy path (commit): toggle two cells, then call `commit()` → `committedMatrix()` deep-equals the post-toggle `draftMatrix()`, `dirty() === false`, `hasPersistedOverrides() === true`, `localStorage.getItem('ch.roles.v1')` contains the new permission keys; a fresh `RolesStore` rehydrates with both matrices reflecting the saved state.
- Happy path (commit no-op when clean): construct fresh, immediately call `commit()` → `hasPersistedOverrides()` stays `false`, no `localStorage` write (assert via spy).
- Happy path (discard): toggle two cells, then call `discard()` → `draftMatrix()` deep-equals `committedMatrix()`, `dirty() === false`, `committedMatrix()` and `localStorage` unchanged from initial seed state.
- Happy path (discard no-op when clean): call `discard()` on a clean store → no signal updates fire (subscribers don't re-run; assert with an `effect` counter).
- Happy path (`createRole`): `createRole({ name: 'Auditor', description: 'Read-only audit access', color: 'info' })` → `roles().length === 6`, the new role's `id` starts with `r_`, `committedMatrix()[newId].size === 0`, `draftMatrix()[newId].size === 0`, `selectedRoleId() === newId`, `dirty() === false` (both matrices got the new entry, so they stay equal), `hasPersistedOverrides() === true`, `localStorage` updated.
- Happy path (lifecycle does not clobber pending toggle): toggle `viewer / res.create` (draft only, dirty); then `createRole({...Auditor...})` → `dirty()` stays `true` (the viewer toggle is preserved in the draft), `draftMatrix()['viewer'].has('res.create') === true`, `committedMatrix()['viewer'].has('res.create') === false`, the new Auditor role exists in both matrices with empty sets.
- Happy path (`duplicateRole`): `duplicateRole('admin')` → new role named `Administrator (copy)`, `committedMatrix()[newId]` has the same 19 keys as `committedMatrix()['admin']` (distinct Set instance), `draftMatrix()[newId]` is also a distinct Set with the same 19 keys, `users === 0`, `color === 'accent'`, `selectedRoleId() === newId`, `dirty() === false`, `hasPersistedOverrides() === true`.
- Happy path (`duplicateRole` seeds from committed, not draft): toggle one cell on `admin` (now in draft only); call `duplicateRole('admin')` → the new role's permission set has 19 keys (the committed count), NOT 20 — proving duplicate reads from `committedMatrix`. The `admin` draft toggle is still pending in `draftMatrix['admin']`.
- Happy path: `duplicateRole('admin')` twice → second clone is `Administrator (copy 2)`. Third → `Administrator (copy 3)`.
- Happy path (`deleteRole`): `deleteRole(newId)` after creating → role removed from `roles()`, removed from both `committedMatrix()` and `draftMatrix()`, selection falls back to the previously-selected role; if the deleted role was the active one and at the end of the list, selection moves to the role at the previous index. `hasPersistedOverrides() === true`.
- Edge case: corrupt `localStorage` payload (`'not json'`) → constructor falls back to seed without throwing; both matrices initialize from the seed.
- Edge case: stored matrix contains an orphan permission key (`{matrix: {admin: ['users.view', 'made.up.key']}}`) → after hydrate, `committedMatrix()['admin']` does not include `made.up.key`.
- Edge case: stored matrix contains an orphan role id (`{matrix: {ghost_role: ['users.view']}}`) and stored roles does not include it → after hydrate, `committedMatrix()['ghost_role']` is undefined.
- Edge case (R13 schema upgrade): stored matrix for `admin` lacks a key that exists in `SEED_ROLE_MATRIX['admin']` (simulate by writing `{ schemaVersion: 1, roles: SEED, matrix: { admin: ['users.view'] } }` directly to `localStorage`, then constructing) → after hydrate, `committedMatrix()['admin']` includes every key from `SEED_ROLE_MATRIX['admin']` (built-ins are unioned with seed); `draftMatrix()['admin']` mirrors it (same 19 keys); `dirty() === false`. For a custom role (`builtIn: false`) in the same scenario, the stored set is preserved as-is (no union).
- Edge case: `nameIsAvailable('Administrator')` returns false; so does `nameIsAvailable('  administrator  ')` after trim.
- Edge case: `nameIsAvailable('Admin')` returns false because it collides case-insensitively with the Users-page literal `'Admin'`.
- Edge case: `nameIsAvailable('A')` returns true syntactically (length check is the dialog validator's job, not the store's), but is rejected by the dialog form validator (covered by Unit 5).
- Edge case: `deleteRole('admin')` (a built-in) throws; assert.
- Edge case: `selectRole('does_not_exist')` is a no-op + `console.warn`; assert no state change.
- Edge case: `resetToDemo()` after multiple mutations → `roles()`, `committedMatrix()`, and `draftMatrix()` all deep-equal the seed, `dirty() === false`, `hasPersistedOverrides() === false`, `localStorage.getItem('ch.roles.v1') === null`.
- Integration: `togglePermission` followed by reading `permCountsById()` shows the new count immediately (proves the live-count signal recompute path reads `draftMatrix` — R12).
- Integration (`dirty` toggles cleanly): start clean → `dirty() === false`; toggle once → `dirty() === true`; `commit()` → `dirty() === false`; toggle once → `dirty() === true`; `discard()` → `dirty() === false`.

**Verification:**
- Spec suite passes.
- After Unit 7 ships, opening Chrome DevTools shows `ch.roles.v1` in Application → Local Storage; toggling a checkbox does NOT update the JSON; clicking `Save changes` flushes the pending draft to the JSON. Clicking `Discard` reverts the draft without touching the JSON.

---

- [ ] **Unit 2: Sidebar `aria-current` correction**

**Goal:** Add `ariaCurrentWhenActive="page"` to the sidebar nav `<a>` so the attribute is actually present in the DOM when a route is active. Fixes the false claim from the previous (User Management) plan.

**Requirements:** R14

**Dependencies:** None.

**Files:**
- Modify: `src/app/layout/sidebar/sidebar.html`

**Approach:**
- Locate the `<a class="sb-item" [routerLink]="..." routerLinkActive="active" ...>` block (lines 21–30 in the current file).
- Add `ariaCurrentWhenActive="page"` as a binding on the same element. This is a built-in input on the `RouterLinkActive` directive (Angular 16+) that toggles the `aria-current` attribute when the link is active.

**Patterns to follow:**
- Angular `RouterLinkActive.ariaCurrentWhenActive` documentation.

**Test scenarios:**
- Test expectation: none — pure markup change covered transitively by Unit 7's integration test (which asserts `aria-current="page"` is present on the active sidebar item when navigated to `/roles`).

**Verification:**
- Inspecting the sidebar in DevTools while on `/users` or `/dashboard` shows `aria-current="page"` on the matching `<a>`. Repeat for `/roles` once Unit 7 ships.

---

- [ ] **Unit 3: `RoleListComponent` (left card)**

**Goal:** Build the left-side role list — selectable rows with color bar, name, live `{users · permissions}` line, and chevron. No mutations; emits `select(id)`.

**Requirements:** R3, R4, R15, R16

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/pages/roles/components/role-list/role-list.ts`
- Create: `src/app/pages/roles/components/role-list/role-list.html`
- Create: `src/app/pages/roles/components/role-list/role-list.css`

**Approach:**
- Standalone component; signal `input()`s: `roles: RoleRecord[]`, `activeId: RoleId`, `counts: Record<RoleId, number>` (passed in from the page so the live count is reactive). `output()`: `select(id: RoleId)`.
- Template: a `ch-card` with `card-head` `<h3>Roles</h3>`. Body is `<ul role="list">` with one `<li>` per role.
- Each row: `<button type="button" role="option" [attr.aria-selected]="r.id === activeId" (click)="select.emit(r.id)">` containing a `<span class="role-bar role-bar--{{r.color}}">` (background = `var(--sys-color-{color})`), a column with `<span class="role-name">{{r.name}}</span>` + `<span class="role-meta">{{r.users}} {{r.users === 1 ? 'user' : 'users'}} · {{counts[r.id] ?? 0}} permissions</span>`, and a `<mat-icon>chevron_right</mat-icon>` glyph (decorative, `aria-hidden="true"`).
- Selected state: the row gets `class="active"` when `r.id === activeId`. CSS: `.active { background: var(--sys-bg-sunken); border: 1px solid var(--sys-line-1); }`. Inactive rows: `border: 1px solid transparent` (so layout doesn't shift on selection).
- Keyboard: each `<button>` is a tab stop; Enter/Space triggers click natively. Up/Down arrow keys are owned by the host page (Unit 7) which can implement roving tabindex if desired — start without it; revisit if a11y review wants it.

**Patterns to follow:**
- `src/app/pages/users/components/users-table/users-table.ts` for standalone + signal-input + event-output idioms.
- `public/pages-1.jsx` lines 408–421 for visual structure.

**Test scenarios:**
- Happy path: with 5 roles passed in, renders 5 `<li>` rows; the row matching `activeId` gets the `active` class.
- Happy path: clicking a row emits `select` with that role's id exactly once.
- Happy path: each row's color bar has the inline style or class corresponding to `r.color`.
- Happy path: the `{users · permissions}` line uses `counts[r.id]` and is reactive — changing the input updates the rendered text.
- Edge case: `r.users === 1` renders `1 user`; `r.users === 0` renders `0 users` (plural).
- Edge case: missing entry in `counts` (key absent for a role) renders `0 permissions` instead of crashing.
- A11y: each row button has `aria-selected` reflecting `activeId === r.id`; chevron is `aria-hidden`.

**Verification:**
- Visual parity with the screenshots' left list (color-bar width + height, row padding, selected-row tan background, chevron position).

---

- [ ] **Unit 4: `PermissionMatrixComponent` (right card body)**

**Goal:** Build the cross-role permission matrix — sticky `Permission` first column, role columns from the live `roles` input, section-header rows, checkbox cells bound to the **draft** matrix. Emits `toggle({ roleId, permKey })`. Does not own commit/discard — that lives in the page (Save/Discard footer).

**Requirements:** R3, R6, R7, R12, R15, R16

**Dependencies:** Unit 1

**Files:**
- Create: `src/app/pages/roles/components/permission-matrix/permission-matrix.ts`
- Create: `src/app/pages/roles/components/permission-matrix/permission-matrix.html`
- Create: `src/app/pages/roles/components/permission-matrix/permission-matrix.css`

**Approach:**
- Standalone component; signal `input()`s: `roles: RoleRecord[]`, `sections: PermissionSection[]`, `draftMatrix: Record<RoleId, Set<string>>` (the page passes `store.draftMatrix()` so checkboxes reflect uncommitted toggles in real time). `output()`: `toggle(event: { roleId: RoleId; permKey: string })`.
- Template: a `<div class="matrix-wrap">` with `overflow-x: auto`, containing a single native `<table class="matrix">`.
  - `<thead>` row: `<th class="perm-col">Permission</th>` followed by `@for (r of roles(); track r.id) { <th>{{r.name}}</th> }` — full role name (R7), no truncation.
  - `<tbody>`: `@for (section of sections(); track section.section)`:
    - One `<tr><td class="sec" [attr.colspan]="roles().length + 1">{{section.section.toUpperCase()}}</td></tr>` (small-caps section header row, tan/cream background via `--sys-bg-muted` or a dedicated `--sys-section-bg` if one exists).
    - `@for (p of section.items; track p.k)`: `<tr><td class="perm-cell"><div class="perm-label">{{p.label}}</div><div class="perm-slug">{{p.k}}</div></td>` then `@for (r of roles(); track r.id) { <td class="check-cell"><mat-checkbox [checked]="draftMatrix()[r.id]?.has(p.k) ?? false" (change)="toggle.emit({ roleId: r.id, permKey: p.k })" [aria-label]="p.label + ' for ' + r.name"></mat-checkbox></td> }</tr>`.
- CSS: `.matrix-wrap { overflow-x: auto; }`. `.matrix { border-collapse: collapse; width: 100%; }`. `.matrix th, .matrix td { padding: 10px 16px; border-bottom: 1px solid var(--sys-line-1); text-align: left; }`. `.check-cell { text-align: center; width: 96px; }`. `.perm-col { position: sticky; left: 0; background: var(--sys-bg-elev); z-index: 1; min-width: 220px; }`. `.sec { background: var(--sys-bg-muted); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: var(--sys-ink-3); text-transform: uppercase; padding: 8px 16px; }`. `.perm-label { font-size: 13px; color: var(--sys-ink-1); }`. `.perm-slug { font-size: 11px; color: var(--sys-ink-4); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin-top: 2px; }`.
- Header row may use `position: sticky; top: 0;` (vertical sticky) if the page-level scroll lets the matrix grow tall; lock this in only if vertical overflow becomes likely. Skip for v1 — the matrix is short enough to fit within the page scroll.

**Patterns to follow:**
- `public/pages-1.jsx` lines 436–460 for table structure.
- `public/styles.css` `.matrix` + `.sec` rules for visual reference.
- Native `<table>` semantics with explicit `aria-label` on each checkbox so screen readers announce both the permission and the role.

**Test scenarios:**
- Happy path: with 5 roles and 6 sections (19 permissions total), renders 6 section-header rows + 19 permission rows + 1 thead row.
- Happy path: column count is `roles.length + 1` for both thead and the section-header `<td>`.
- Happy path: a checkbox bound to `draftMatrix['admin'].has('users.view') === true` renders checked; toggling it emits `toggle` with `{ roleId: 'admin', permKey: 'users.view' }` exactly once. The component itself does not mutate any state — the page owns the `togglePermission` call.
- Happy path: changing the `roles` input adds/removes columns reactively.
- Happy path: changing the `draftMatrix` input (e.g., the page calls `store.discard()`) re-renders all checkboxes against the new draft — cells that were toggled-then-discarded snap back to their committed state.
- Edge case: `draftMatrix[role.id]` is `undefined` for a role (newly-created with no entry yet) → all its cells render unchecked, no errors.
- Edge case: passing 0 roles → only the `Permission` column header renders; section-header `colspan` stays correct (`0 + 1 = 1`).
- A11y: each checkbox has an `aria-label` of the form `"View users for Administrator"`; the sticky `Permission` column has `scope="col"` on its `<th>`.
- Integration: with 8 roles + a narrow viewport, `.matrix-wrap` shows a horizontal scrollbar and the `Permission` column stays fixed (manual visual check; cover with a scoped CSS test if Vitest+jsdom supports it).

**Verification:**
- Visual parity with the screenshots' matrix area (row density, section-header tone, checkbox color, slug typography).
- Toggling cells in DevTools while watching the role list (Unit 3) shows the live `{M} permissions` count update in real time (proves R12 once Unit 7 wires them together).

---

- [ ] **Unit 5: `NewRoleDialogComponent` (reactive form, `MatDialog` centered)**

**Goal:** Build the new-role dialog with name + description + color swatch picker; validates name uniqueness against both the current `RolesStore.roles` and the Users-page `Role` literal-union; on `Create role`, returns the draft to the caller.

**Requirements:** R8, R15, R16

**Dependencies:** Unit 1 (uses `RolesStore.nameIsAvailable()` for the validator)

**Files:**
- Create: `src/app/pages/roles/components/new-role-dialog/new-role-dialog.ts`
- Create: `src/app/pages/roles/components/new-role-dialog/new-role-dialog.html`
- Create: `src/app/pages/roles/components/new-role-dialog/new-role-dialog.css`

**Approach:**
- Standalone component; imports `ReactiveFormsModule`, `MatDialogModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `MatIconModule`.
- `inject(MatDialogRef<NewRoleDialogComponent, CreateRoleDraft | undefined>)`, `inject(RolesStore)`, `inject(FormBuilder)`.
- Form: `form = fb.group({ name: ['', [Validators.required, this.nameValidator()]], description: [''], color: ['accent' as RoleColor, Validators.required] })`.
  - `nameValidator()` is a custom function that returns `null` when the trimmed name has length ≥ 2 and `RolesStore.nameIsAvailable(trimmed) === true`; otherwise returns `{ tooShort: true }` or `{ taken: true }`.
- Template:
  - Title bar: `<h2 mat-dialog-title>Create a new role</h2>` + `<p class="sub">Permissions start empty — toggle them on in the matrix.</p>`.
  - Body: `<mat-form-field>` for Name (with `<mat-error>` lines for `tooShort` and `taken`), `<mat-form-field>` for Description (textarea, 3 rows), and a `<div class="color-swatches" role="radiogroup" aria-label="Color">` containing five `<button type="button" role="radio" [attr.aria-checked]="color === c" (click)="selectColor(c)" class="swatch swatch--{{c}}">` (a `<mat-icon>check</mat-icon>` shows when selected). Arrow keys navigate between swatches via a small `(keydown.arrowright)` / `(keydown.arrowleft)` handler.
  - Footer: `<button mat-button>Cancel</button>` + `<button mat-flat-button color="primary" [disabled]="form.invalid">Create role</button>`.
- On `Create role` click: `dialogRef.close({ name: form.value.name.trim(), description: form.value.description?.trim() ?? '', color: form.value.color })`. On `Cancel` (or backdrop / Esc): `dialogRef.close(undefined)`.

**Patterns to follow:**
- `src/app/pages/users/components/invite-user-dialog/invite-user-dialog.ts` for `ReactiveFormsModule` + `MatDialog` content pattern.
- Angular Material reactive-forms validation examples.

**Test scenarios:**
- Happy path: filling `name='Auditor'` + `color='info'` enables `Create role`; clicking it closes with `{ name: 'Auditor', description: '', color: 'info' }`.
- Happy path: clicking each swatch updates the selected color visually and in the form value; arrow-right cycles to the next swatch.
- Edge case: `name=' A '` (trim → `'A'`, length 1) keeps the button disabled and shows the `tooShort` error on blur.
- Edge case: `name='Administrator'` (exact match with seed) shows the `taken` error.
- Edge case: `name='admin'` (case-insensitive collision with seed) shows the `taken` error.
- Edge case: `name='Admin'` (collision with the Users-page `Role` literal-union) shows the `taken` error.
- Edge case: `Cancel` closes with `undefined`; `Escape` closes with `undefined`.
- A11y: form field labels are associated via `MatFormField`; the swatch group has `role="radiogroup"` with an `aria-label`; each swatch has `role="radio"` + `aria-checked`; focused swatch shows a visible focus ring.

**Verification:**
- The dialog visually matches the screenshots' chrome (centered, padded, rounded card) and the swatch row reads cleanly. On submit, the page (Unit 7) appends a new role and selects it.

---

- [ ] **Unit 6: `ConfirmDeleteDialogComponent` (small `MatDialog`)**

**Goal:** Build the small confirm dialog used before deleting a custom role.

**Requirements:** R10, R15, R16

**Dependencies:** None (consumed by Unit 7)

**Files:**
- Create: `src/app/pages/roles/components/confirm-delete-dialog/confirm-delete-dialog.ts`
- Create: `src/app/pages/roles/components/confirm-delete-dialog/confirm-delete-dialog.html`
- Create: `src/app/pages/roles/components/confirm-delete-dialog/confirm-delete-dialog.css`

**Approach:**
- Standalone component; injected with `MAT_DIALOG_DATA: { roleName: string }` and `MatDialogRef<ConfirmDeleteDialogComponent, boolean>`.
- Template: `<h2 mat-dialog-title>Delete role "{{data.roleName}}"?</h2>` + `<p>This cannot be undone. Users currently assigned this role keep their assignment string but their permissions will fall back to the default.</p>` + footer with `<button mat-button (click)="dialogRef.close(false)">Cancel</button>` and `<button mat-flat-button color="warn" (click)="dialogRef.close(true)">Delete</button>`.
- The "Delete" button is the autofocus target on open (`cdkFocusInitial`) so Enter confirms; Esc cancels.

**Patterns to follow:**
- Angular Material confirm-dialog examples.
- `src/app/pages/users/components/invite-user-dialog/` for `MatDialog` content scaffolding.

**Test scenarios:**
- Happy path: opens with `{ roleName: 'Auditor' }` → renders `Delete role "Auditor"?`.
- Happy path: clicking `Delete` closes with `true`; clicking `Cancel` closes with `false`; pressing `Esc` closes with `undefined` (which the page treats as cancel).
- A11y: the `Delete` button receives focus on open; the dialog has `aria-labelledby` pointing at the title.

**Verification:**
- Manual: deleting a custom role (Unit 7) opens this dialog, confirming removes the role from both the list and the matrix.

---

- [ ] **Unit 7: `RolesPageComponent` — compose everything, wire dirty-state Save/Discard chrome, register `/roles` route**

**Goal:** Assemble the header (with the conditional "Unsaved changes" chip), two-column body (role list + matrix card), the conditional sticky Save/Discard footer in the matrix card, the Reset link, and dialog wiring into the page; bind to `RolesStore`; add the `/roles` child route.

**Requirements:** R1, R2, R3, R5, R6, R6b, R9, R10, R11, R12, R15, R16

**Dependencies:** Units 1, 2, 3, 4, 5, 6

**Files:**
- Create: `src/app/pages/roles/roles.ts`
- Create: `src/app/pages/roles/roles.html`
- Create: `src/app/pages/roles/roles.css`
- Create: `src/app/pages/roles/roles.spec.ts`
- Modify: `src/app/app.routes.ts`

**Approach:**
- `app.routes.ts`: add the child `{ path: 'roles', loadComponent: () => import('./pages/roles/roles').then(m => m.RolesPageComponent), data: { title: 'Roles & Permissions', crumb: 'People · Access control' } }` after the existing `/users` entry.
- `RolesPageComponent`: standalone; `inject(RolesStore)`, `inject(MatDialog)`, `inject(LiveAnnouncer)`. Imports `MatButtonModule`, `MatIconModule`, `MatTooltipModule`, `RoleListComponent`, `PermissionMatrixComponent`, `SECTIONS` from `./fixtures`.
- Template structure matches the High-Level diagram:
  1. **Header row** (page-head): `<h1>Roles & Permissions</h1>` + subtitle, right-aligned action group:
     - `@if (store.dirty())` an "Unsaved changes" chip — `<span class="chip chip--warn"><span class="dot"></span>Unsaved changes</span>` — placed immediately to the left of `Duplicate role` (matches `public/images/roles-permissions_adminstartor.png`). `chip--warn` background = `--sys-color-warn-soft`, text = `--sys-color-warn-ink`, dot = `--sys-color-warn`.
     - `Duplicate role` (MatButton outline, copy icon) — calls `onDuplicate()`.
     - `New role` (MatButton primary, plus icon) — calls `openNewRoleDialog()`.
  2. **Two-column body** (`<section class="ch-grid">`):
     - `<app-role-list [roles]="store.roles()" [activeId]="store.selectedRoleId()" [counts]="store.permCountsById()" (select)="store.selectRole($event)" />`.
     - `<section class="ch-card matrix-card">` containing:
       - card-head with `<h3>{{store.activeRole().name}}</h3>` + subtitle `{{store.activeRole().description}}`, right-side flex row with `Duplicate` (MatButton sm) + trash icon button (`@if (!store.activeRole().builtIn)` — calls `openConfirmDeleteDialog()`).
       - `<app-permission-matrix [roles]="store.roles()" [sections]="SECTIONS" [draftMatrix]="store.draftMatrix()" (toggle)="store.togglePermission($event.roleId, $event.permKey)" />`.
       - `@if (store.dirty())` a sticky Save/Discard footer (R6b): `<div class="matrix-footer"><button mat-stroked-button (click)="onDiscard()">Discard</button><button mat-flat-button color="primary" (click)="onSave()"><mat-icon>check</mat-icon>Save changes</button></div>`. CSS: `.matrix-footer { position: sticky; bottom: 0; display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; background: var(--sys-bg-sunken); border-top: 1px solid var(--sys-line-1); border-bottom-left-radius: var(--sys-radius-lg); border-bottom-right-radius: var(--sys-radius-lg); }`. Matches the layout, copy, and tone of `public/images/roles-permissions_adminstartor.png`.
       - `@if (store.hasPersistedOverrides())` a small `<button class="reset-link">Reset demo data</button>` row at the bottom-right that calls `store.resetToDemo()` (rendered below the footer when both are present; below the matrix when the footer is hidden).
- `onSave()`: `store.commit()`; `LiveAnnouncer.announce('Permissions saved', 'polite')`. The `dirty` signal flips to `false`, the chip + footer disappear automatically.
- `onDiscard()`: `store.discard()`; `LiveAnnouncer.announce('Changes discarded', 'polite')`. Same automatic teardown of chip + footer. No confirmation prompt — the matrix snaps back to the committed state, which is itself the recovery affordance (any further mistake can just be re-toggled and re-saved). Revisit only if testing shows users discard by accident.
- The page does NOT own a `togglePermission` handler — the matrix component's `(toggle)` output is wired directly to `store.togglePermission($event.roleId, $event.permKey)`. No snackbar, no per-toggle announcement (toggles are batched into the dirty state and announced at save/discard time instead).
- `openNewRoleDialog()`: open `NewRoleDialogComponent`. On `afterClosed`, if a `CreateRoleDraft` is returned, call `store.createRole(draft)` (auto-selects the new role) and `LiveAnnouncer.announce('Role ' + draft.name + ' created')`.
- `onDuplicate()` (header button + per-card button): call `store.duplicateRole(store.selectedRoleId())` and announce `Role duplicated as ' + newName`.
- `openConfirmDeleteDialog()`: open `ConfirmDeleteDialogComponent` with `data: { roleName: store.activeRole().name }`. On `afterClosed`, if `true`, call `store.deleteRole(store.selectedRoleId())` and announce `Role ' + name + ' deleted'`.
- **No route guard for unsaved changes.** The `dirty` state is intentionally lost on navigation — the user has the visible chip + footer as their cue, and the demo cost of losing pending toggles is small. Captured as a deferred concern in Risks; revisit if the page graduates from demo to production.
- `roles.css`: page-grid (`.ch-grid { display: grid; grid-template-columns: 260px 1fr; gap: 16px; align-items: flex-start; }`), matrix-card chrome (`.matrix-card { padding: 0; }` so the table goes edge-to-edge), reset-link styling (`.reset-link { display: block; margin: 12px 16px; text-align: right; color: var(--sys-ink-4); font-size: 12px; background: none; border: none; cursor: pointer; } .reset-link:hover { color: var(--sys-ink-2); }`), chip styling per `public/styles.css` `.chip` rules translated to the `--sys-*` token namespace.

**Patterns to follow:**
- `src/app/pages/users/users.ts` + `users.html` for page-component composition idioms (header + cards + dialog overlays + LiveAnnouncer).
- `public/pages-1.jsx` lines 392–471 for the full RolesPage composition.
- `src/app/pages/dashboard/dashboard.css` for `ch-card` shape.

**Test scenarios:**
- Happy path (integration): route `/roles` renders the page with `<h1>Roles & Permissions</h1>`, the role list (5 rows), and the matrix card (matrix shows 19 permissions × 5 columns). The "Unsaved changes" chip is **not** present; the Save/Discard footer is **not** present.
- Happy path (integration): clicking a different role in the list updates the right card's `<h3>` and subtitle but leaves the matrix columns unchanged.
- Happy path (integration — toggle is draft-only): toggling a checkbox in the matrix shows the chip in the header (`Unsaved changes`), shows the sticky footer at the bottom of the matrix card (`Discard`, `Save changes`), and immediately updates the role list's `{M} permissions` count for that role (R12). `localStorage.getItem('ch.roles.v1')` does NOT change.
- Happy path (integration — Save commits): with one or more pending toggles, click `Save changes` → chip disappears, footer disappears, `localStorage` updated with the new permission keys, `LiveAnnouncer` receives `Permissions saved`.
- Happy path (integration — Discard reverts): with one or more pending toggles, click `Discard` → chip disappears, footer disappears, every checkbox snaps back to its committed state, role-list counts revert, `localStorage` unchanged, `LiveAnnouncer` receives `Changes discarded`.
- Happy path (integration — Save then re-toggle re-arms dirty): after Save, toggle a different cell → chip + footer reappear; click `Discard` → only the second toggle is reverted; the first toggle (now committed) stays.
- Happy path (integration): `New role` opens the dialog; submitting `{ name: 'Auditor', color: 'info' }` adds a 6th role to the list, the matrix grows a 6th column, the new role becomes the selected one, and `dirty()` stays `false` afterward (no chip, no footer).
- Happy path (integration — lifecycle does not clobber pending toggles): toggle one cell (chip + footer visible) → click `New role` → submit `Auditor` → the chip + footer remain visible (the toggle is still pending in the draft); the new Auditor role exists in the list with 0 permissions.
- Happy path (integration): with the `Auditor` role selected, the trash icon is visible (because `builtIn !== true`); clicking it opens the confirm dialog; clicking `Delete` removes the role from the list and the matrix and selects the previously-active role (or the role at index `[deletedIndex - 1]`).
- Happy path (integration): `Duplicate role` (header) on `admin` creates `Administrator (copy)`; the new role inherits all 19 permissions; `dirty()` stays `false`.
- Edge case: with all 5 seed roles selected one-by-one, the trash icon is **not** rendered (built-ins are non-deletable per R5).
- Edge case: `Reset demo data` link is hidden until at least one mutation has happened; clicking it wipes `localStorage` and the page reverts to the seed (5 roles, original matrix); the link disappears; the chip + footer disappear if previously visible.
- Edge case: navigating away to `/users` while dirty → no confirmation prompt; navigating back to `/roles` shows the page in clean (committed) state — pending draft is lost. Documented behavior.
- A11y: `<h1>` appears exactly once on the page; the active role-list row has `aria-selected="true"`; the trash button has `aria-label="Delete role {name}"` + `MatTooltip`; the dialogs trap focus and restore on close. The `Save changes` button is the natural last tab stop in the matrix card when the footer is visible.
- Integration: after `Save changes`, navigating away to `/users` then back to `/roles` shows the persisted state (saved mutations survive).
- Integration: navigating to `/` redirects to `/dashboard`; the sidebar's "Roles & Permissions" entry shows `aria-current="page"` when on `/roles` (depends on Unit 2).

**Verification:**
- Side-by-side with each `public/images/roles-permissions_*.png` (5 clean shots): header, role-list typography + color bars + selected-row tan background, matrix card chrome, section-header rows, checkbox styling, button styles all match within small tolerance.
- Side-by-side with `public/images/roles-permissions_adminstartor.png` (the dirty-state shot): toggle one cell on `Administrator`, then verify the "Unsaved changes" warn chip in the header and the sticky `Discard` / `Save changes` footer at the bottom of the matrix card match the screenshot's placement, color, and typography.
- Keyboard-only flow completes the entire happy path: navigate to `/roles`, Tab to `New role`, open dialog, fill fields, submit, Tab into the role list, select another role, Tab into the matrix, toggle a checkbox (footer appears), Tab through to `Save changes`, press Enter, Tab to trash, confirm delete.
- `ng build` passes; `vitest` suite passes; no console a11y warnings from Angular/Material.
- Clicking `Save changes` writes to `ch.roles.v1` in `localStorage`; reloading restores the toggled state. Clicking `Discard` does NOT write to `localStorage`.

## System-Wide Impact

- **Interaction graph:** `app.routes.ts` gains one child route; `sidebar.html` gets one binding added. Nothing else shifts. `ShellComponent`, `TopbarComponent`, the dashboard, and the users page are untouched.
- **Error propagation:** The only failure mode is `localStorage` being disabled (Safari private mode) or full — hydration and write are both wrapped in `try/catch`; UI silently falls back to in-memory state and continues. Save/Discard still work in-session because they operate on the in-memory `committedMatrix` / `draftMatrix` pair; only persistence to disk is lost.
- **State lifecycle risks:** A stale `ch.roles.v1` payload after a future `PERMISSIONS` change would render with stale role coverage. Mitigation in R13: built-in seeds are unioned with the seed matrix during hydration, so admin always picks up new permissions; custom roles stay opt-in. Bump `schemaVersion` only when the merge logic itself needs to change (e.g., introducing role-level constraints).
- **API surface parity:** No exported types consumed by other pages yet. The `RoleRecord`, `PermissionItem`, `RoleId` types stay page-local; promote to `src/app/shared/` when a second consumer appears.
- **Integration coverage:** The full route + store + role-list + matrix + dialogs + dirty-state chip/footer chain is exercised by Unit 7's spec.
- **Unchanged invariants:** Tailwind v4 pipeline, Angular 21 standalone bootstrap, existing `provideAnimations()`, dashboard route, users route, the `ch.users.v1` `localStorage` payload, the `Role` literal-union in `src/app/pages/users/fixtures.ts`, and the `--sys-*` token layer are untouched. The Users page's invite + bulk-set-role still only offer the four built-in role labels — this plan does not change that.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| User navigates away (sidebar click, browser back, reload) with pending draft → uncommitted toggles are lost without warning. | Documented behavior. The visible chip + sticky footer are the cue. No route guard for v1 (see Open Questions > Deferred to Implementation). Add `CanDeactivateFn` only if user testing shows accidental nav loss is common. |
| User mistakes `Discard` for `Save` and loses pending work. | Buttons are clearly labeled, color-coded (Discard outline / Save primary), and Save has a check-icon. No confirm-on-Discard for v1; the matrix is editable so re-toggling is the recovery. Revisit if testing shows the misclick happens. |
| Future `PERMISSIONS` removal would silently shrink the stored matrix on next read (orphan-key drop runs in hydration). | Documented behavior — orphan keys are dropped, no warning. Acceptable because the alternative (preserve orphans) creates dead state. If a removed key needs grace-period preservation, bump `schemaVersion` and add explicit migration. |
| Future cross-page flow that lets users be assigned to custom roles will break the "delete role with no warning" assumption. | Captured in Open Questions > Deferred to Implementation. The future plan must add either a guard in `deleteRole` or a reassign-or-cancel dialog. The current `deleteRole` already throws on `builtIn === true`, so the safety net is half-built. |
| `localStorage` quota or availability in Safari private mode. | `try/catch` on read and write; UI silently falls back to in-memory state. Mirrors Users store. The Save/Discard semantics still work in-session because they operate on in-memory `committedMatrix` / `draftMatrix`. |
| Sticky `Permission` first column may need a solid background to cover scrolled-under content; on very pale themes a border-right helps too. | CSS specifies `background: var(--sys-bg-elev)` and a `box-shadow: 1px 0 0 var(--sys-line-1)` on `.perm-col`; verify visually on first wire-up. |
| `MatCheckbox` default color is the Material primary; the screenshots show a blue (accent-tone) checkbox. | Either set `color="accent"` on `<mat-checkbox>` or override `--mdc-checkbox-selected-icon-color` via the panel CSS. Decide in Unit 4. |
| Visual drift from the screenshots (chip colors, section-header tone, checkbox color, footer tone). | Unit 7's verification compares side-by-side with all six `public/images/roles-permissions_*.png` (5 clean + the dirty-state `_adminstartor.png`); keep `public/styles.css` `.matrix` and `.chip` rules open while tuning. |
| `matricesEqual()` invoked on every signal read of `dirty` could become hot if the matrix grows very large. | At the current size (~6 roles × ~19 permissions = ~120 cells max), a single equality pass is sub-millisecond. Computed signals memoize until inputs change, so `dirty` only re-runs when `committedMatrix` or `draftMatrix` changes. Revisit only if the matrix grows into the thousands. |

## Documentation / Operational Notes

- Update the project README's feature list to include `/roles` once a Roles section exists (none today).
- No rollout, monitoring, or migration concerns — fully client-side.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-25-roles-permissions-page-requirements.md](../brainstorms/2026-04-25-roles-permissions-page-requirements.md)
- Behavioral source: `public/pages-1.jsx` lines 372–471 (`RolesPage`)
- Visual targets: `public/images/roles-permissions_adminintration.png`, `public/images/roles-permissions_operations_manager.png`, `public/images/roles-permissions_support_agent.png`, `public/images/roles-permissions_viewer.png`, `public/images/roles-permissions_billing.png`
- Seed fixtures: `public/data.jsx` `ROLES` (lines 18–24), `PERMISSIONS` (lines 26–58), `ROLE_MATRIX` (lines 60–66)
- Store pattern: `src/app/pages/users/users.store.ts` (lines 4, 36–43, 45–62, 113, 125–132, 176–187)
- Page pattern: `src/app/pages/users/users.ts`, `users.html`, `users.css`, `users.spec.ts`
- Dialog pattern: `src/app/pages/users/components/invite-user-dialog/`
- Sidebar host: `src/app/layout/sidebar/sidebar.html` (one-line modification in Unit 2)
- Routes host: `src/app/app.routes.ts`
- Design tokens: `src/app/core/system-colors.css`
- Prior plan: `docs/plans/2026-04-24-001-feat-user-management-page-plan.md`
- Angular Material v21 `MatDialog`, `MatCheckbox`, `MatButton`, `MatFormField`, `MatInput` (external)
- `@angular/cdk/a11y` `LiveAnnouncer` (external)

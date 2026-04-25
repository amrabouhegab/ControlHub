---
title: Angular 21 Roles & Permissions page with signals state management
date: 2026-04-25
last_updated: 2026-04-25
category: best-practices
module: Roles & Permissions
problem_type: best_practice
component: frontend
severity: medium
applies_when:
  - Implementing new feature pages in Angular 21
  - Building admin/user management pages with CRUD operations
  - Creating pages with draft/commit state patterns
tags:
  - angular-21
  - signals
  - standalone-components
  - roles-permissions
  - state-management
---

# Angular 21 Roles & Permissions page with signals state management

## Context

Building a Roles & Permissions admin page requires managing complex state: roles list, permission matrix (sections × permissions), draft vs committed state, and localStorage persistence. The implementation needed to follow Angular 21 idioms while matching existing patterns from the Users page.

## Guidance

### Core Patterns Used

**1. Standalone Components with Signals**
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './roles.html'
})
export class RolesPageComponent {
  private store = inject(RolesStore);

  roles = this.store.roles;
  activeRole = this.store.activeRole;
}
```

**2. RolesStore Service with Draft/Committed Matrix**
```typescript
@Injectable({ providedIn: 'root' })
export class RolesStore {
  // State signals
  readonly roles = signal<RoleRecord[]>([]);
  readonly committedMatrix = signal<Record<RoleId, Set<string>>>({});
  readonly draftMatrix = signal<Record<RoleId, Set<string>>>({});
  readonly selectedRoleId = signal<RoleId>('admin');
  readonly hasPersistedOverrides = signal(false);

  // Computed values
  readonly activeRole = computed(() => 
    this.roles().find(r => r.id === this.selectedRoleId()) ?? this.roles()[0]
  );
  readonly dirty = computed(() => !this.matricesEqual(this.committedMatrix(), this.draftMatrix()));

  constructor() {
    const { roles, matrix } = this.hydrate();
    this.roles.set(roles);
    this.committedMatrix.set(matrix);
    this.draftMatrix.set(this.cloneMatrix(matrix));
    this.hasPersistedOverrides.set(this.readPersistedFlag());
  }

  // Clone matrix (deep copy with Sets)
  private cloneMatrix(src: Record<RoleId, Set<string>>): Record<RoleId, Set<string>> {
    return Object.fromEntries(
      Object.entries(src).map(([id, set]) => [id, new Set(set)])
    );
  }

  togglePermission(roleId: RoleId, permKey: string): void {
    this.draftMatrix.update(current => {
      const newMatrix = { ...current };
      const rolePermissions = newMatrix[roleId] ?? new Set();
      if (rolePermissions.has(permKey)) {
        rolePermissions.delete(permKey);
      } else {
        rolePermissions.add(permKey);
      }
      newMatrix[roleId] = rolePermissions;
      return newMatrix;
    });
  }

  commit(): void {
    if (!this.dirty()) return;
    this.committedMatrix.set(this.cloneMatrix(this.draftMatrix()));
    this.persist();
  }

  discard(): void {
    if (!this.dirty()) return;
    this.draftMatrix.set(this.cloneMatrix(this.committedMatrix()));
  }

  private persist(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ch.roles.v1', JSON.stringify({
        schemaVersion: 1,
        roles: this.roles(),
        matrix: Object.fromEntries(
          Object.entries(this.committedMatrix()).map(([id, set]) => [id, Array.from(set)])
        )
      }));
      this.hasPersistedOverrides.set(true);
    }
  }
}
```

**3. Matrix Hydration with Schema Validation**
```typescript
private hydrate(): { roles: RoleRecord[]; matrix: Record<RoleId, Set<string>> } {
  try {
    const raw = localStorage.getItem('ch.roles.v1');
    if (!raw) return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };

    const parsed = JSON.parse(raw);
    // Validate schema version and structure
    if (!parsed || parsed.schemaVersion !== 1 || !parsed.roles || !parsed.matrix) {
      return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };
    }

    const validRoles = parsed.roles.every((r: unknown) =>
      typeof r === 'object' && r !== null &&
      typeof r.id === 'string' && typeof r.name === 'string'
    );
    if (!validRoles) return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };

    // Clean orphan role IDs and permission keys on load
    const processedMatrix: Record<RoleId, Set<string>> = {};
    for (const [roleId, permissions] of Object.entries(parsed.matrix)) {
      const validPerms = permissions.filter((k: string) => validPermissionKeys.has(k));
      processedMatrix[roleId] = new Set(validPerms);
    }

    return { roles: parsed.roles, matrix: processedMatrix };
  } catch {
    return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };
  }
}
```

**4. Reset to Demo Data**
```typescript
resetToDemo(): void {
  if (typeof localStorage) localStorage.removeItem('ch.roles.v1');
  this.roles.set([...SEED_ROLES]);
  this.committedMatrix.set(this.cloneSeedMatrix());
  this.draftMatrix.set(this.cloneSeedMatrix());
  this.selectedRoleId.set('admin');
  this.hasPersistedOverrides.set(false);
}
```

**3. New Control Flow (@for, @if)**
```html
@for (role of store.roles(); track role.id) {
  <li [class.selected]="role.id === store.selectedRoleId()">{{ role.name }}</li>
}
@if (isDirty()) {
  <button (click)="saveChanges()">Save</button>
}
```

**4. inject() for Dependency Injection**
```typescript
@Component({ ... })
export class NewRoleDialogComponent {
  private dialogRef = inject(MatDialogRef<NewRoleDialogComponent>);
  private store = inject(RolesStore);
  private fb = inject(FormBuilder);
}
```

**5. CSS Token Namespace**
```css
.page-header {
  padding: var(--spacing-4);
  background: var(--sys-bg-surface);
}
```

### Component Structure

| Component | Purpose |
|-----------|---------|
| `roles.store.ts` | State management with signals, persistence |
| `fixtures.ts` | Seed data (SEED_ROLES, SEED_PERMISSIONS, SEED_ROLE_MATRIX) |
| `role-list/` | Role sidebar with selection/duplicate/delete |
| `permission-matrix/` | Permission grid with toggle checkboxes |
| `new-role-dialog/` | Create role modal |
| `confirm-delete-dialog/` | Delete confirmation modal |
| `roles.ts` | Main page component |

## Why This Matters

- **Signals** provide fine-grained reactivity without Zone.js overhead
- **Standalone components** eliminate NgModule boilerplate
- **Draft/commit pattern** enables dirty state tracking with rollback
- **localStorage persistence** demonstrates persistence without backend
- **Control flow** (@for, @if) replaces *ngFor, *ngIf with better performance
- **Schema versioning** enables future migrations when persistence format changes
- **Orphan cleanup** on hydration prevents invalid data from breaking the UI
- **Set-based permissions** enable efficient lookup and toggle operations

## When to Apply

- New Angular 21 feature pages
- Admin dashboards with CRUD operations
- Pages requiring dirty state with save/discard
- Complex state with computed derived values

## Examples

**Permission toggle with Set mutation:**
```typescript
togglePermission(roleId: RoleId, permKey: string): void {
  this.draftMatrix.update(current => {
    const newMatrix = { ...current };
    const rolePermissions = newMatrix[roleId] ?? new Set<string>();
    if (rolePermissions.has(permKey)) {
      rolePermissions.delete(permKey);
    } else {
      rolePermissions.add(permKey);
    }
    newMatrix[roleId] = rolePermissions;
    return newMatrix;
  });
}
```

**Dirty state detection (comparing Sets):**
```typescript
private matricesEqual(a: Record<RoleId, Set<string>>, b: Record<RoleId, Set<string>>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const id of aKeys) {
    if (!b[id]) return false;
    if (a[id].size !== b[id].size) return false;
    for (const k of a[id]) {
      if (!b[id].has(k)) return false;
    }
  }
  return true;
}

readonly dirty = computed(() => !this.matricesEqual(this.committedMatrix(), this.draftMatrix()));
```

**Role name availability check:**
```typescript
nameIsAvailable(candidateName: string, excludingId?: RoleId): boolean {
  const trimmed = candidateName.trim();
  if (!trimmed) return false;

  const currentRoles = this.roles();
  const roleNameExists = currentRoles.some(r =>
    (excludingId === undefined || r.id !== excludingId) &&
    r.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (roleNameExists) return false;

  // Check against forbidden names (built-in roles)
  const forbiddenNames = ['admin', 'operations', 'support', 'viewer'];
  if (forbiddenNames.includes(trimmed.toLowerCase())) return false;

  return true;
}
```

**Fixture data with Set-based permission matrix:**
```typescript
// fixtures.ts - Seed data with permission Sets
export const SEED_ROLE_MATRIX: Record<string, Set<string>> = {
  admin: new Set(['users.view','users.create','users.edit','users.delete','users.impersonate','roles.view','roles.manage','res.view','res.create','res.publish','res.delete','ord.view','ord.update','ord.refund','an.view','an.export','sys.audit','sys.settings','sys.keys']),
  ops: new Set(['users.view','roles.view','res.view','res.create','res.publish','ord.view','ord.update','an.view','an.export','sys.audit']),
  support: new Set(['users.view','users.edit','res.view','ord.view','an.view']),
  viewer: new Set(['users.view','res.view','ord.view','an.view']),
  billing: new Set(['users.view','ord.view','ord.refund','an.view']),
};
```

## Related

- `docs/plans/2026-04-25-001-feat-roles-permissions-page-plan.md`
- `docs/plans/2026-04-24-001-feat-user-management-page-plan.md`
- `src/app/pages/users/users.store.ts` - Similar patterns for Users page
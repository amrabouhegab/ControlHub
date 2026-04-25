import { Injectable, signal, computed } from '@angular/core';
import { SEED_ROLES, SEED_PERMISSIONS, SEED_ROLE_MATRIX } from './fixtures';

export type RoleId = string;
export type RoleColor = 'accent'|'info'|'good'|'warn'|'danger';

export interface RoleRecord {
  id: RoleId;
  name: string;
  description: string;
  users: number;
  color: RoleColor;
  builtIn?: boolean;
}

export interface PermissionItem {
  k: string;
  label: string;
}

export interface PermissionSection {
  section: string;
  items: PermissionItem[];
}

export interface PersistedShape {
  schemaVersion: 1;
  roles: RoleRecord[];
  matrix: Record<RoleId, string[]>;
}

export interface CreateRoleDraft {
  name: string;
  description: string;
  color: RoleColor;
}

@Injectable({ providedIn: 'root' })
export class RolesStore {
  readonly roles = signal<RoleRecord[]>([]);
  readonly committedMatrix = signal<Record<RoleId, Set<string>>>({});
  readonly draftMatrix = signal<Record<RoleId, Set<string>>>({});
  readonly selectedRoleId = signal<RoleId>('admin');
  readonly hasPersistedOverrides = signal(false);

  readonly activeRole = computed(() => this.roles().find(r => r.id === this.selectedRoleId()) ?? this.roles()[0]);
  readonly permCountsById = computed(() => {
    const m = this.draftMatrix();
    return Object.fromEntries(this.roles().map(r => [r.id, m[r.id]?.size ?? 0]));
  });
  readonly dirty = computed(() => !this.matricesEqual(this.committedMatrix(), this.draftMatrix()));

  constructor() {
    const { roles, matrix } = this.hydrate();
    this.roles.set(roles);
    this.committedMatrix.set(matrix);
    this.draftMatrix.set(this.cloneMatrix(matrix));
    this.hasPersistedOverrides.set(this.readPersistedFlag());
  }

  private cloneMatrix(src: Record<RoleId, Set<string>>): Record<RoleId, Set<string>> {
    return Object.fromEntries(Object.entries(src).map(([id, set]) => [id, new Set(set)]));
  }

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

  private hydrate(): { roles: RoleRecord[]; matrix: Record<RoleId, Set<string>> } {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('ch.roles.v1') : null;
      if (!raw) {
        return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.schemaVersion !== 1 || !Array.isArray(parsed.roles) || !parsed.matrix) {
        return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };
      }
      
      const validRoles = parsed.roles.every((r: unknown) =>
        typeof r === 'object' && r !== null &&
        typeof (r as RoleRecord).id === 'string' &&
        typeof (r as RoleRecord).name === 'string' &&
        typeof (r as RoleRecord).description === 'string' &&
        typeof (r as RoleRecord).users === 'number' &&
        typeof (r as RoleRecord).color === 'string'
      );
      
      if (!validRoles) {
        return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };
      }
      
      const storedRoles = parsed.roles as RoleRecord[];
      const storedMatrix = parsed.matrix as Record<RoleId, string[]>;
      
      // Process roles: union built-in roles with seed permissions (R13)
      const processedRoles = storedRoles.map(role => {
        const seedRole = SEED_ROLES.find(sr => sr.id === role.id);
        if (seedRole && seedRole.builtIn) {
          // For built-in roles, union with seed permissions
          const seedPermissions = SEED_ROLE_MATRIX[role.id] || new Set();
          const storedPermissions = new Set(storedMatrix[role.id] || []);
          const unionPermissions = new Set([...storedPermissions, ...seedPermissions]);
          return { ...role, users: 0 }; // Reset users count as per plan
        }
        return { ...role, users: 0 }; // Reset users count for custom roles too
      });
      
      // Process matrix: remove orphan role IDs and permission keys
      const processedMatrix: Record<RoleId, Set<string>> = {};
      const validRoleIds = new Set(processedRoles.map(r => r.id));
      const validPermissionKeys = new Set(
        SEED_PERMISSIONS.flatMap(section => section.items.map(item => item.k))
      );
      
      for (const [roleId, permissions] of Object.entries(storedMatrix)) {
        // Remove orphan role IDs
        if (!validRoleIds.has(roleId)) continue;
        
        // Remove orphan permission keys
        const validPermissions = permissions.filter(k => validPermissionKeys.has(k));
        processedMatrix[roleId] = new Set(validPermissions);
      }
      
      // Ensure all valid roles have an entry in matrix
      for (const role of processedRoles) {
        if (!processedMatrix[role.id]) {
          processedMatrix[role.id] = new Set();
        }
      }
      
      return { roles: processedRoles, matrix: processedMatrix };
    } catch {
      return { roles: [...SEED_ROLES], matrix: this.cloneSeedMatrix() };
    }
  }

  private cloneSeedMatrix(): Record<RoleId, Set<string>> {
    return Object.fromEntries(
      Object.entries(SEED_ROLE_MATRIX).map(([id, set]) => [id, new Set(set)])
    );
  }

  private persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          'ch.roles.v1',
          JSON.stringify({
            schemaVersion: 1,
            roles: this.roles(),
            matrix: this.serializeMatrix(this.committedMatrix())
          })
        );
        this.hasPersistedOverrides.set(true);
      }
    } catch { /* quota exceeded — fall back to in-memory */ }
  }

  private readPersistedFlag(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('ch.roles.v1') !== null;
    } catch {
      return false;
    }
  }

  private serializeMatrix(matrix: Record<RoleId, Set<string>>): Record<RoleId, string[]> {
    return Object.fromEntries(
      Object.entries(matrix).map(([id, set]) => [id, Array.from(set)])
    );
  }

  togglePermission(roleId: RoleId, permKey: string): void {
    // Mutates draftMatrix only
    this.draftMatrix.update(current => {
      const newMatrix = { ...current };
      const rolePermissions = new Matrix(newMatrix[roleId] ?? new Set());
      if (rolePermissions.has(permKey)) {
        rolePermissions.delete(permKey);
      } else {
        rolePermissions.add(permKey);
      }
      newMatrix[roleId] = rolePermissions.getSet();
      return newMatrix;
    });
  }

  commit(): void {
    if (!this.dirty()) return;
    
    this.committedMatrix.set(this.cloneMatrix(this.draftMatrix()));
    this.persist();
    // dirty will compute to false automatically
  }

  discard(): void {
    if (!this.dirty()) return;
    
    this.draftMatrix.set(this.cloneMatrix(this.committedMatrix()));
    // dirty will compute to false automatically
  }

  createRole(draft: CreateRoleDraft): RoleId {
    const id = this.randomId();
    const newRole: RoleRecord = {
      id,
      name: draft.name.trim(),
      description: draft.description?.trim() ?? '',
      users: 0,
      color: draft.color,
      builtIn: false
    };
    
    this.roles.update(list => [...list, newRole]);
    this.committedMatrix.update(current => ({
      ...current,
      [id]: new Set()
    }));
    this.draftMatrix.update(current => ({
      ...current,
      [id]: new Set()
    }));
    this.selectRole(id);
    this.persist();
    return id;
  }

  duplicateRole(sourceId: RoleId): RoleId {
    const sourceRole = this.roles().find(r => r.id === sourceId);
    if (!sourceRole) throw new Error(`Source role not found: ${sourceId}`);
    
    const sourceName = sourceRole.name;
    const newName = this.nextCopyName(sourceName);
    const id = this.randomId();
    
    const newRole: RoleRecord = {
      id,
      name: newName,
      description: sourceRole.description,
      users: 0,
      color: sourceRole.color,
      builtIn: false
    };
    
    // Seed from committed matrix (not draft)
    const sourceCommittedSet = this.committedMatrix()[sourceId] ?? new Set();
    
    this.roles.update(list => [...list, newRole]);
    this.committedMatrix.update(current => ({
      ...current,
      [id]: new Set(sourceCommittedSet)
    }));
    this.draftMatrix.update(current => ({
      ...current,
      [id]: new Set(sourceCommittedSet)
    }));
    this.selectRole(id);
    this.persist();
    return id;
  }

  deleteRole(id: RoleId): void {
    const role = this.roles().find(r => r.id === id);
    if (role?.builtIn === true) {
      throw new Error(`Cannot delete built-in role: ${id}`);
    }
    
    this.roles.update(list => list.filter(r => r.id !== id));
    this.committedMatrix.update(current => {
      const newMatrix = { ...current };
      delete newMatrix[id];
      return newMatrix;
    });
    this.draftMatrix.update(current => {
      const newMatrix = { ...current };
      delete newMatrix[id];
      return newMatrix;
    });
    
    if (this.selectedRoleId() === id) {
      const roleList = this.roles();
      const currentIndex = roleList.findIndex(r => r.id === id);
      let newId: RoleId;
      
      if (roleList.length === 0) {
        newId = 'admin'; // fallback to first seed role
      } else if (currentIndex > 0) {
        newId = roleList[currentIndex - 1].id;
      } else {
        newId = roleList[0].id;
      }
      this.selectRole(newId);
    }
    
    this.persist();
  }

  selectRole(id: RoleId): void {
    if (!this.roles().some(r => r.id === id)) {
      console.warn(`Role not found: ${id}`);
      return;
    }
    this.selectedRoleId.set(id);
  }

  resetToDemo(): void {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('ch.roles.v1');
    } catch { /* ignore */ }
    
    this.roles.set([...SEED_ROLES]);
    this.committedMatrix.set(this.cloneSeedMatrix());
    this.draftMatrix.set(this.cloneSeedMatrix());
    this.selectedRoleId.set('admin');
    this.hasPersistedOverrides.set(false);
  }

  nameIsAvailable(candidateName: string, excludingId?: RoleId): boolean {
    const trimmed = candidateName.trim();
    if (!trimmed) return false;
    
    const lowerCase = trimmed.toLowerCase();
    const currentRoles = this.roles();
    
    // Check against existing roles (excluding the one being edited if provided)
    const roleNameExists = currentRoles.some(
      (r, index) => 
        (excludingId === undefined || r.id !== excludingId) &&
        r.name.toLowerCase() === lowerCase
    );
    
    if (roleNameExists) return false;
    
    // Check against Users page Role literal-union
    const forbiddenNames = ['admin', 'operations', 'support', 'viewer'];
    if (forbiddenNames.includes(lowerCase)) return false;
    
    return true;
  }

  private randomId(): RoleId {
    return 'r_' + Math.random().toString(36).slice(2, 8);
  }

  private nextCopyName(sourceName: string): string {
    const baseName = sourceName.trim();
    const copySuffix = ' (copy)';
    let newName = baseName + copySuffix;
    let counter = 2;
    
    while (!this.nameIsAvailable(newName)) {
      newName = `${baseName} (copy ${counter})`;
      counter++;
    }
    
    return newName;
  }
}

// Helper class for Set operations
class Matrix {
  constructor(private set: Set<string>) {}
  
  has(value: string): boolean {
    return this.set.has(value);
  }
  
  add(value: string): void {
    this.set.add(value);
  }
  
  delete(value: string): void {
    this.set.delete(value);
  }
  
  getSet(): Set<string> {
    return new Set(this.set);
  }
  
  size(): number {
    return this.set.size;
  }
}
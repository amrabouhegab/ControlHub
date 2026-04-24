import { Injectable, signal, computed, effect } from '@angular/core';
import { Role, SEED_USERS, Status, User, UserId } from './fixtures';

const STORAGE_KEY = 'ch.users.v1';

export type SortKey = 'name' | 'role' | 'status' | 'dept' | 'lastSeen';
export type SortDir = 'asc' | 'desc';

export interface InviteDraft {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  dept: string;
  requireMfa: boolean;
  note?: string;
}

const LAST_SEEN_UNITS: Record<string, number> = {
  m: 60,
  h: 3_600,
  d: 86_400,
  w: 604_800,
};

/** Lower rank = more recent. `never` sorts last (highest rank). */
export function lastSeenRank(s: string): number {
  if (!s || s === 'never') return Number.MAX_SAFE_INTEGER;
  const match = /^(\d+)\s*([mhdw])/i.exec(s.trim());
  if (!match) return Number.MAX_SAFE_INTEGER - 1;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  return n * (LAST_SEEN_UNITS[unit] ?? 60);
}

function randomId(): UserId {
  return 'u_' + Math.random().toString(36).slice(2, 8);
}

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function hydrate(): User[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [...SEED_USERS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...SEED_USERS];
    const valid = parsed.every((u: unknown) =>
      typeof u === 'object' && u !== null &&
      typeof (u as User).id === 'string' &&
      typeof (u as User).name === 'string' &&
      typeof (u as User).email === 'string' &&
      typeof (u as User).status === 'string'
    );
    return valid ? (parsed as User[]) : [...SEED_USERS];
  } catch {
    return [...SEED_USERS];
  }
}

@Injectable({ providedIn: 'root' })
export class UsersStore {
  readonly users = signal<User[]>(hydrate());

  readonly search = signal('');
  readonly roleFilter = signal<Role | 'all'>('all');
  readonly statusFilter = signal<Status | 'all'>('all');
  readonly sort = signal<{ key: SortKey; dir: SortDir }>({ key: 'lastSeen', dir: 'asc' });
  readonly selection = signal<ReadonlySet<UserId>>(new Set());
  readonly page = signal(1);
  readonly perPage = 5;

  readonly activeCount = computed(() => this.users().filter(u => u.status === 'active').length);

  readonly filtered = computed<User[]>(() => {
    const q = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();
    return this.users().filter(u => {
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (role !== 'all' && u.role !== role) return false;
      if (status !== 'all' && u.status !== status) return false;
      return true;
    });
  });

  readonly sorted = computed<User[]>(() => {
    const { key, dir } = this.sort();
    const mul = dir === 'asc' ? 1 : -1;
    const rows = [...this.filtered()];
    rows.sort((a, b) => {
      if (key === 'lastSeen') return (lastSeenRank(a.lastSeen) - lastSeenRank(b.lastSeen)) * mul;
      const av = (a[key] as string).toLowerCase();
      const bv = (b[key] as string).toLowerCase();
      if (av < bv) return -1 * mul;
      if (av > bv) return 1 * mul;
      return 0;
    });
    return rows;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage)));

  readonly paged = computed<User[]>(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.perPage;
    return this.sorted().slice(start, start + this.perPage);
  });

  readonly hasPersistedOverrides = signal(this.readPersistedFlag());

  constructor() {
    // Reset to page 1 whenever filters change.
    effect(() => {
      this.search();
      this.roleFilter();
      this.statusFilter();
      this.page.set(1);
    });
  }

  private persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users()));
        this.hasPersistedOverrides.set(true);
      }
    } catch { /* quota exceeded — fall back to in-memory */ }
  }

  toggleStatus(id: UserId): void {
    this.users.update(list => list.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
    this.persist();
  }

  bulkSetStatus(ids: ReadonlySet<UserId> | UserId[], status: Status): void {
    const set = new Set(ids);
    if (set.size === 0) return;
    this.users.update(list => list.map(u => set.has(u.id) ? { ...u, status } : u));
    this.selection.set(new Set());
    this.persist();
  }

  bulkSetRole(ids: ReadonlySet<UserId> | UserId[], role: Role): void {
    const set = new Set(ids);
    if (set.size === 0) return;
    this.users.update(list => list.map(u => set.has(u.id) ? { ...u, role } : u));
    this.selection.set(new Set());
    this.persist();
  }

  invite(draft: InviteDraft): User {
    const user: User = {
      id: randomId(),
      name: `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim(),
      email: draft.email.trim(),
      role: draft.role,
      status: 'pending',
      lastSeen: 'never',
      dept: draft.dept,
      joined: todayIso(),
      h: Math.floor(Math.random() * 7) + 1,
      mfa: draft.requireMfa,
      sessions: 0,
    };
    this.users.update(list => [user, ...list]);
    this.persist();
    return user;
  }

  resetToDemo(): void {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    this.users.set([...SEED_USERS]);
    this.selection.set(new Set());
    this.search.set('');
    this.roleFilter.set('all');
    this.statusFilter.set('all');
    this.page.set(1);
    this.hasPersistedOverrides.set(false);
  }

  toggleSelection(id: UserId): void {
    this.selection.update(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  setSelectionForVisible(select: boolean): void {
    if (!select) { this.selection.set(new Set()); return; }
    this.selection.set(new Set(this.paged().map(u => u.id)));
  }

  clearFilters(): void {
    this.search.set('');
    this.roleFilter.set('all');
    this.statusFilter.set('all');
    this.page.set(1);
  }

  private readPersistedFlag(): boolean {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }
}


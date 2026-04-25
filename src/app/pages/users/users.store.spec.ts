import { TestBed } from '@angular/core/testing';
import { UsersStore, lastSeenRank } from './users.store';
import { SEED_USERS } from './fixtures';

describe('lastSeenRank', () => {
  it('ranks recent before older', () => {
    expect(lastSeenRank('2m ago')).toBeLessThan(lastSeenRank('1h ago'));
    expect(lastSeenRank('1h ago')).toBeLessThan(lastSeenRank('1d ago'));
    expect(lastSeenRank('1d ago')).toBeLessThan(lastSeenRank('1w ago'));
  });

  it('puts never at the end', () => {
    expect(lastSeenRank('never')).toBeGreaterThan(lastSeenRank('3d ago'));
  });
});

describe('UsersStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('hydrates from the seed fixture when localStorage is empty', () => {
    const store = TestBed.inject(UsersStore);
    expect(store.users().length).toBe(SEED_USERS.length);
    expect(store.activeCount()).toBe(SEED_USERS.filter(u => u.status === 'active').length);
  });

  it('falls back to the seed when localStorage is corrupt', () => {
    localStorage.setItem('ch.users.v1', 'not json');
    const store = TestBed.inject(UsersStore);
    expect(store.users().length).toBe(SEED_USERS.length);
  });

  it('toggleStatus flips a row and persists', () => {
    const store = TestBed.inject(UsersStore);
    store.toggleStatus('u_8f2a');
    expect(store.users().find(u => u.id === 'u_8f2a')?.status).toBe('inactive');
    const raw = localStorage.getItem('ch.users.v1');
    expect(raw).toBeTruthy();
    expect(raw!.includes('"u_8f2a"')).toBe(true);
  });

  it('invite appends a pending row', () => {
    const store = TestBed.inject(UsersStore);
    const before = store.users().length;
    const created = store.invite({
      firstName: 'Jamie', lastName: 'Park', email: 'jamie.park@northwind.io',
      role: 'Support', dept: 'Customer Success', requireMfa: true
    });
    expect(store.users().length).toBe(before + 1);
    expect(created.status).toBe('pending');
    expect(created.lastSeen).toBe('never');
    expect(created.id.startsWith('u_')).toBe(true);
  });

  it('search narrows filtered results', () => {
    const store = TestBed.inject(UsersStore);
    store.search.set('felix');
    expect(store.filtered().length).toBe(1);
    expect(store.filtered()[0].name.toLowerCase().includes('felix')).toBe(true);
  });

  it('combining role and status filters', () => {
    const store = TestBed.inject(UsersStore);
    store.roleFilter.set('Admin');
    store.statusFilter.set('active');
    const result = store.filtered();
    expect(result.every(u => u.role === 'Admin' && u.status === 'active')).toBe(true);
  });

  it('paged returns perPage slice', () => {
    const store = TestBed.inject(UsersStore);
    expect(store.paged().length).toBe(store.perPage);
    expect(store.totalPages()).toBe(Math.ceil(SEED_USERS.length / store.perPage));
  });

  it('bulkSetRole is a no-op with empty set', () => {
    const store = TestBed.inject(UsersStore);
    const before = store.users();
    store.bulkSetRole([], 'Viewer');
    expect(store.users()).toBe(before);
  });

  it('resetToDemo restores the seed and clears localStorage', () => {
    const store = TestBed.inject(UsersStore);
    store.toggleStatus('u_8f2a');
    expect(localStorage.getItem('ch.users.v1')).toBeTruthy();
    store.resetToDemo();
    expect(localStorage.getItem('ch.users.v1')).toBeNull();
    expect(store.users().find(u => u.id === 'u_8f2a')?.status).toBe('active');
  });
});

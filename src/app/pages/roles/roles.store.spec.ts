import { TestBed } from '@angular/core/testing';
import { RolesStore } from './roles.store';
import { SEED_ROLES, SEED_PERMISSIONS, SEED_ROLE_MATRIX } from './fixtures';

describe('RolesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('hydrates from the seed fixture when localStorage is empty', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.roles().length).toBe(SEED_ROLES.length);
    expect(store.committedMatrix()['admin'].size).toBe(19);
    expect(store.draftMatrix()['admin'].size).toBe(19);
    expect(store.dirty()).toBeFalsy();
    expect(store.selectedRoleId()).toBe('admin');
    expect(store.hasPersistedOverrides()).toBeFalsy();
  });

  it('falls back to the seed when localStorage is corrupt', () => {
    localStorage.setItem('ch.roles.v1', 'not json');
    const store = TestBed.inject(RolesStore);
    expect(store.roles().length).toBe(SEED_ROLES.length);
  });

  it('togglePermission updates draft only and marks dirty', () => {
    const store = TestBed.inject(RolesStore);
    store.togglePermission('viewer', 'res.create');
    
    expect(store.draftMatrix()['viewer'].has('res.create')).toBeTruthy();
    expect(store.committedMatrix()['viewer'].has('res.create')).toBeFalsy();
    expect(store.permCountsById()['viewer']).toBe(5);
    expect(store.dirty()).toBeTruthy();
    expect(store.hasPersistedOverrides()).toBeFalsy();
    expect(localStorage.getItem('ch.roles.v1')).toBeNull();
    
    store.togglePermission('viewer', 'res.create');
    expect(store.dirty()).toBeFalsy();
  });

  it('commit persists draft to committed and localStorage', () => {
    const store = TestBed.inject(RolesStore);
    store.togglePermission('viewer', 'res.create');
    store.commit();
    
    expect(store.committedMatrix()['viewer'].has('res.create')).toBeTruthy();
    expect(store.dirty()).toBeFalsy();
    expect(store.hasPersistedOverrides()).toBeTruthy();
    
    const stored = localStorage.getItem('ch.roles.v1');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.matrix['viewer']).toContain('res.create');
  });

  it('commit no-op when clean', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.dirty()).toBeFalsy();
    store.commit();
    expect(store.dirty()).toBeFalsy();
    expect(localStorage.getItem('ch.roles.v1')).toBeNull();
  });

  it('discard reverts draft to committed', () => {
    const store = TestBed.inject(RolesStore);
    store.togglePermission('viewer', 'res.create');
    expect(store.dirty()).toBeTruthy();
    
    store.discard();
    
    expect(store.draftMatrix()['viewer'].has('res.create')).toBeFalsy();
    expect(store.dirty()).toBeFalsy();
  });

  it('discard no-op when clean', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.dirty()).toBeFalsy();
    store.discard();
    expect(store.dirty()).toBeFalsy();
  });

  it('createRole adds new role with empty matrix entries', () => {
    const store = TestBed.inject(RolesStore);
    const initialLength = store.roles().length;
    const newId = store.createRole({ 
      name: 'Auditor', 
      description: 'Read-only audit access', 
      color: 'info' 
    });
    
    expect(store.roles().length).toBe(initialLength + 1);
    expect(store.roles().find(r => r.id === newId)?.name).toBe('Auditor');
    expect(store.committedMatrix()[newId].size).toBe(0);
    expect(store.draftMatrix()[newId].size).toBe(0);
    expect(store.selectedRoleId()).toBe(newId);
    expect(store.dirty()).toBeFalsy();
    expect(store.hasPersistedOverrides()).toBeTruthy();
  });

  it('duplicateRole creates copy from committed matrix', () => {
    const store = TestBed.inject(RolesStore);
    const newId = store.duplicateRole('admin');
    
    expect(store.roles().find(r => r.id === newId)?.name).toBe('Administrator (copy)');
    expect(store.committedMatrix()[newId].size).toBe(19);
    expect(store.selectedRoleId()).toBe(newId);
    expect(store.hasPersistedOverrides()).toBeTruthy();
  });

  it('duplicateRole handles name collisions', () => {
    const store = TestBed.inject(RolesStore);
    const firstCopy = store.duplicateRole('admin');
    const secondCopy = store.duplicateRole('admin');
    
    expect(store.roles().find(r => r.id === firstCopy)?.name).toBe('Administrator (copy)');
    expect(store.roles().find(r => r.id === secondCopy)?.name).toBe('Administrator (copy 2)');
  });

  it('deleteRole removes role and updates selection', () => {
    const store = TestBed.inject(RolesStore);
    const auditorId = store.createRole({ name: 'Auditor', description: 'Test', color: 'info' });
    store.selectRole(auditorId);
    
    store.deleteRole(auditorId);
    
    expect(store.roles().find(r => r.id === auditorId)).toBeFalsy();
    expect(store.selectedRoleId()).toBe('admin');
    expect(store.hasPersistedOverrides()).toBeTruthy();
  });

  it('deleteRole throws for built-in roles', () => {
    const store = TestBed.inject(RolesStore);
    expect(() => store.deleteRole('admin')).toThrow();
  });

  it('selectRole updates selected role', () => {
    const store = TestBed.inject(RolesStore);
    const auditorId = store.createRole({ name: 'Auditor', description: 'Test', color: 'info' });
    store.selectRole(auditorId);
    expect(store.selectedRoleId()).toBe(auditorId);
  });

  it('resetToDemo restores seed and clears localStorage', () => {
    const store = TestBed.inject(RolesStore);
    store.createRole({ name: 'Auditor', description: 'Test', color: 'info' });
    store.togglePermission('viewer', 'res.create');
    
    store.resetToDemo();
    
    expect(localStorage.getItem('ch.roles.v1')).toBeNull();
    expect(store.roles().length).toBe(SEED_ROLES.length);
    expect(store.dirty()).toBeFalsy();
    expect(store.hasPersistedOverrides()).toBeFalsy();
  });

  it('nameIsAvailable validates role names', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.nameIsAvailable('Auditor')).toBeTruthy();
    expect(store.nameIsAvailable('Administrator')).toBeFalsy();
    expect(store.nameIsAvailable('Admin')).toBeFalsy();
    expect(store.nameIsAvailable('')).toBeFalsy();
    expect(store.nameIsAvailable('A')).toBeTruthy();
  });

  it('permCountsById reads from draft matrix', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.permCountsById()['viewer']).toBe(4);
    
    store.togglePermission('viewer', 'res.create');
    expect(store.permCountsById()['viewer']).toBe(5);
  });

  it('dirty computed works correctly', () => {
    const store = TestBed.inject(RolesStore);
    expect(store.dirty()).toBeFalsy();
    
    store.togglePermission('viewer', 'res.create');
    expect(store.dirty()).toBeTruthy();
    
    store.commit();
    expect(store.dirty()).toBeFalsy();
    
    store.togglePermission('ops', 'sys.keys');
    expect(store.dirty()).toBeTruthy();
    
    store.discard();
    expect(store.dirty()).toBeFalsy();
  });
});
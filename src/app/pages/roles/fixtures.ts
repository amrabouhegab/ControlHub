// src/app/pages/roles/fixtures.ts
// Seed data for Roles & Permissions page

import { RoleRecord } from './roles.store';
import { PermissionItem, PermissionSection } from './roles.store';
import { PersistedShape } from './roles.store';

// Transcribed from public/data.jsx:18-24
export const SEED_ROLES: RoleRecord[] = [
  { id: 'admin', name: 'Administrator', users: 3, description: 'Full system access. Can manage all users, settings, and data.', color: 'accent', builtIn: true },
  { id: 'ops', name: 'Operations Manager', users: 8, description: 'Monitor analytics, orders, and system performance.', color: 'info', builtIn: true },
  { id: 'support', name: 'Support Agent', users: 14, description: 'Handle tickets and view user details. Cannot modify roles.', color: 'good', builtIn: true },
  { id: 'viewer', name: 'Viewer', users: 22, description: 'Read-only access to reports and dashboards.', color: 'warn', builtIn: true },
  { id: 'billing', name: 'Billing', users: 2, description: 'Access to transactions, invoices, and payouts only.', color: 'danger', builtIn: true }
];

// Transcribed from public/data.jsx:26-58
export const SEED_PERMISSIONS: PermissionSection[] = [
  { section: 'Users', items: [
    { k: 'users.view', label: 'View users' },
    { k: 'users.create', label: 'Create users' },
    { k: 'users.edit', label: 'Edit users' },
    { k: 'users.delete', label: 'Delete users' },
    { k: 'users.impersonate', label: 'Impersonate users' },
  ]},
  { section: 'Roles', items: [
    { k: 'roles.view', label: 'View roles' },
    { k: 'roles.manage', label: 'Manage roles & permissions' },
  ]},
  { section: 'Resources', items: [
    { k: 'res.view', label: 'View resources' },
    { k: 'res.create', label: 'Create resources' },
    { k: 'res.publish', label: 'Publish resources' },
    { k: 'res.delete', label: 'Delete resources' },
  ]},
  { section: 'Orders', items: [
    { k: 'ord.view', label: 'View orders' },
    { k: 'ord.update', label: 'Update status' },
    { k: 'ord.refund', label: 'Issue refunds' },
  ]},
  { section: 'Analytics', items: [
    { k: 'an.view', label: 'View analytics' },
    { k: 'an.export', label: 'Export reports' },
  ]},
  { section: 'System', items: [
    { k: 'sys.audit', label: 'View audit logs' },
    { k: 'sys.settings', label: 'Edit settings' },
    { k: 'sys.keys', label: 'Manage API keys' },
  ]},
];

// Transcribed from public/data.jsx:60-66, converting each plain array into a Set
export const SEED_ROLE_MATRIX: Record<string, Set<string>> = {
  admin: new Set(['users.view','users.create','users.edit','users.delete','users.impersonate','roles.view','roles.manage','res.view','res.create','res.publish','res.delete','ord.view','ord.update','ord.refund','an.view','an.export','sys.audit','sys.settings','sys.keys']),
  ops: new Set(['users.view','roles.view','res.view','res.create','res.publish','ord.view','ord.update','an.view','an.export','sys.audit']),
  support: new Set(['users.view','users.edit','res.view','ord.view','an.view']),
  viewer: new Set(['users.view','res.view','ord.view','an.view']),
  billing: new Set(['users.view','ord.view','ord.refund','an.view']),
};
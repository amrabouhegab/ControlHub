export const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  ]},
  { group: 'People', items: [
    { id: 'users', label: 'User Management', icon: 'group' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'shield' },
  ]},
  { group: 'Operations', items: [
    { id: 'resources', label: 'Resources', icon: 'inventory_2' },
    { id: 'orders', label: 'Orders', icon: 'receipt_long' },
    { id: 'analytics', label: 'Analytics', icon: 'insights' },
  ]},
  { group: 'Support', items: [
    { id: 'tickets', label: 'Tickets', icon: 'support_agent', badge: 7 },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: 3 },
  ]},
  { group: 'System', items: [
    { id: 'audit', label: 'Audit Logs', icon: 'history' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'auth', label: 'Authentication', icon: 'lock' },
  ]},
];

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}
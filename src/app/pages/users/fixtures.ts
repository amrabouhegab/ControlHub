export type UserId = string;
export type Role = 'Admin' | 'Operations' | 'Support' | 'Viewer';
export type Status = 'active' | 'inactive' | 'pending';

export interface User {
  id: UserId;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastSeen: string;
  dept: string;
  joined: string;
  h: number;
  mfa: boolean;
  sessions: number;
}

export interface AuditEntry {
  t: string;
  actor: string;
  action: string;
  target: string;
  result: 'success' | 'denied';
  meta?: string;
}

export const ROLES: Role[] = ['Admin', 'Operations', 'Support', 'Viewer'];
export const DEPARTMENTS = ['Engineering', 'Operations', 'Customer Success', 'Finance'] as const;

export const SEED_USERS: User[] = [
  { id: 'u_8f2a', name: 'Amelia Chen', email: 'amelia.chen@northwind.io', role: 'Admin', status: 'active', lastSeen: '2m ago', dept: 'Engineering', joined: '2024-03-12', h: 3, mfa: true, sessions: 4 },
  { id: 'u_3b91', name: 'Marcus Holloway', email: 'm.holloway@northwind.io', role: 'Operations', status: 'active', lastSeen: '12m ago', dept: 'Operations', joined: '2023-11-04', h: 1, mfa: true, sessions: 2 },
  { id: 'u_7c44', name: 'Priya Raghavan', email: 'priya.r@northwind.io', role: 'Support', status: 'active', lastSeen: '1h ago', dept: 'Customer Success', joined: '2024-06-22', h: 5, mfa: true, sessions: 1 },
  { id: 'u_9d02', name: 'Theo Vasquez', email: 'theo@northwind.io', role: 'Support', status: 'active', lastSeen: '4h ago', dept: 'Customer Success', joined: '2025-01-08', h: 2, mfa: false, sessions: 1 },
  { id: 'u_4e8b', name: 'Sofie Lindqvist', email: 'sofie.l@northwind.io', role: 'Operations', status: 'active', lastSeen: '6h ago', dept: 'Operations', joined: '2024-08-15', h: 4, mfa: true, sessions: 3 },
  { id: 'u_1a60', name: 'Jordan Blake', email: 'jordan.blake@northwind.io', role: 'Admin', status: 'inactive', lastSeen: '3d ago', dept: 'Engineering', joined: '2023-05-19', h: 6, mfa: true, sessions: 0 },
  { id: 'u_5f19', name: 'Nadia Ibrahim', email: 'n.ibrahim@northwind.io', role: 'Viewer', status: 'active', lastSeen: '20m ago', dept: 'Finance', joined: '2024-09-30', h: 7, mfa: true, sessions: 2 },
  { id: 'u_2b7e', name: 'Felix Aranda', email: 'felix.a@northwind.io', role: 'Operations', status: 'pending', lastSeen: 'never', dept: 'Operations', joined: '2026-04-21', h: 3, mfa: false, sessions: 0 },
  { id: 'u_6c33', name: 'Harper Quinn', email: 'harper.q@northwind.io', role: 'Support', status: 'active', lastSeen: '45m ago', dept: 'Customer Success', joined: '2024-12-03', h: 5, mfa: true, sessions: 2 },
  { id: 'u_0d88', name: 'Rafael Moretti', email: 'rafael.m@northwind.io', role: 'Viewer', status: 'active', lastSeen: '2d ago', dept: 'Finance', joined: '2025-02-14', h: 1, mfa: false, sessions: 0 },
  { id: 'u_3a55', name: 'Yuki Tanaka', email: 'y.tanaka@northwind.io', role: 'Admin', status: 'active', lastSeen: '8m ago', dept: 'Engineering', joined: '2022-07-11', h: 4, mfa: true, sessions: 5 },
  { id: 'u_7e21', name: 'Isabelle Dubois', email: 'i.dubois@northwind.io', role: 'Operations', status: 'active', lastSeen: '3h ago', dept: 'Operations', joined: '2023-09-28', h: 6, mfa: true, sessions: 1 },
];

export const SEED_AUDIT: AuditEntry[] = [
  { t: '10:23:41', actor: 'Amelia Chen', action: 'role.updated', target: 'Operations Manager', result: 'success', meta: '+2 permissions' },
  { t: '10:14:07', actor: 'Amelia Chen', action: 'order.refunded', target: 'ORD-48215', result: 'success', meta: '$379.00' },
  { t: '09:57:33', actor: 'Marcus Holloway', action: 'user.created', target: 'felix.a@northwind.io', result: 'success', meta: 'role=ops' },
  { t: '09:42:18', actor: 'Priya Raghavan', action: 'ticket.assigned', target: 'TKT-1082', result: 'success', meta: 'to=Theo V.' },
  { t: '09:31:02', actor: 'Yuki Tanaka', action: 'api_key.rotated', target: 'prod-webhook-signer', result: 'success', meta: 'exp +90d' },
  { t: '08:47:41', actor: 'Sofie Lindqvist', action: 'resource.published', target: 'rs_04', result: 'success', meta: 'Ember Wool Throw' },
  { t: '08:22:09', actor: 'Harper Quinn', action: 'user.updated', target: 'u_0d88', result: 'success', meta: 'status=active' },
  { t: '07:55:28', actor: 'Amelia Chen', action: 'settings.updated', target: 'security.session_ttl', result: 'success', meta: '12h → 8h' },
  { t: '06:38:52', actor: 'Jordan Blake', action: 'auth.logout', target: 'u_1a60', result: 'success', meta: 'manual' },
];

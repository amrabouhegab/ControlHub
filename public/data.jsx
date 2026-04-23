// data.jsx — realistic mock data for ControlHub

const USERS = [
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

const ROLES = [
  { id: 'admin', name: 'Administrator', users: 3, description: 'Full system access. Can manage all users, settings, and data.', color: 'accent' },
  { id: 'ops', name: 'Operations Manager', users: 8, description: 'Monitor analytics, orders, and system performance.', color: 'info' },
  { id: 'support', name: 'Support Agent', users: 14, description: 'Handle tickets and view user details. Cannot modify roles.', color: 'good' },
  { id: 'viewer', name: 'Viewer', users: 22, description: 'Read-only access to reports and dashboards.', color: 'warn' },
  { id: 'billing', name: 'Billing', users: 2, description: 'Access to transactions, invoices, and payouts only.', color: 'danger' },
];

const PERMISSIONS = [
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

const ROLE_MATRIX = {
  admin: new Set(['users.view','users.create','users.edit','users.delete','users.impersonate','roles.view','roles.manage','res.view','res.create','res.publish','res.delete','ord.view','ord.update','ord.refund','an.view','an.export','sys.audit','sys.settings','sys.keys']),
  ops: new Set(['users.view','roles.view','res.view','res.create','res.publish','ord.view','ord.update','an.view','an.export','sys.audit']),
  support: new Set(['users.view','users.edit','res.view','ord.view','an.view']),
  viewer: new Set(['users.view','res.view','ord.view','an.view']),
  billing: new Set(['users.view','ord.view','ord.refund','an.view']),
};

const RESOURCES = [
  { id: 'rs_01', title: 'Atlas Compact Chair', category: 'Furniture', status: 'published', price: 289, stock: 142, updated: '2h ago', tags: ['bestseller','new'] },
  { id: 'rs_02', title: 'Nimbus Desk Lamp', category: 'Lighting', status: 'published', price: 79, stock: 0, updated: '1d ago', tags: ['low-stock'] },
  { id: 'rs_03', title: 'Kestrel Ceramic Planter', category: 'Decor', status: 'draft', price: 34, stock: 0, updated: '3d ago', tags: [] },
  { id: 'rs_04', title: 'Ember Wool Throw', category: 'Textiles', status: 'published', price: 119, stock: 38, updated: '5h ago', tags: ['seasonal'] },
  { id: 'rs_05', title: 'Halcyon Wall Mirror', category: 'Decor', status: 'scheduled', price: 210, stock: 12, updated: '1d ago', tags: [] },
  { id: 'rs_06', title: 'Vespera Table Lamp', category: 'Lighting', status: 'published', price: 165, stock: 56, updated: '6h ago', tags: ['bestseller'] },
  { id: 'rs_07', title: 'Foundry Bookshelf', category: 'Furniture', status: 'published', price: 540, stock: 8, updated: '2d ago', tags: ['low-stock'] },
  { id: 'rs_08', title: 'Orion Linen Cushion', category: 'Textiles', status: 'archived', price: 45, stock: 0, updated: '2w ago', tags: [] },
];

const ORDERS = [
  { id: 'ORD-48219', customer: 'Amelia Chen', email: 'amelia@proton.me', total: 289.00, status: 'paid', method: 'Visa •• 4821', date: 'Apr 23, 10:14', items: 1, h: 3 },
  { id: 'ORD-48218', customer: 'James Whitaker', email: 'j.whitaker@oakley.co', total: 1429.50, status: 'processing', method: 'ACH', date: 'Apr 23, 09:47', items: 3, h: 1 },
  { id: 'ORD-48217', customer: 'Leona Park', email: 'leona.p@gmail.com', total: 119.00, status: 'paid', method: 'Mastercard •• 9920', date: 'Apr 23, 08:22', items: 1, h: 4 },
  { id: 'ORD-48216', customer: 'Dmitri Volkov', email: 'dvolkov@outlook.com', total: 540.00, status: 'shipped', method: 'Apple Pay', date: 'Apr 22, 22:01', items: 1, h: 6 },
  { id: 'ORD-48215', customer: 'Simone Rossi', email: 'simone@rossi.it', total: 379.00, status: 'refunded', method: 'Visa •• 2033', date: 'Apr 22, 19:55', items: 2, h: 2 },
  { id: 'ORD-48214', customer: 'Olu Adebayo', email: 'olu.a@prism.ng', total: 84.50, status: 'paid', method: 'PayPal', date: 'Apr 22, 17:30', items: 2, h: 5 },
  { id: 'ORD-48213', customer: 'Carla Mendes', email: 'carla.m@fastmail.com', total: 210.00, status: 'failed', method: 'Visa •• 1177', date: 'Apr 22, 16:12', items: 1, h: 7 },
  { id: 'ORD-48212', customer: 'Henry Osei', email: 'henry.osei@kinpo.io', total: 1680.00, status: 'paid', method: 'Wire', date: 'Apr 22, 14:08', items: 5, h: 2 },
  { id: 'ORD-48211', customer: 'Zoe Laurent', email: 'zoe.l@brume.fr', total: 165.00, status: 'shipped', method: 'Visa •• 4412', date: 'Apr 22, 11:42', items: 1, h: 5 },
  { id: 'ORD-48210', customer: 'Ivan Korolev', email: 'ivan.k@rupost.ru', total: 95.00, status: 'paid', method: 'Mastercard •• 5510', date: 'Apr 22, 10:18', items: 2, h: 1 },
];

const NOTIFICATIONS = [
  { id: 'n1', type: 'alert', title: 'Unusual spike in failed logins', body: '23 failed attempts on u_3b91 from new IP (São Paulo). Auto-locked.', time: '4m ago', read: false, ico: 'alert' },
  { id: 'n2', type: 'system', title: 'Database backup completed', body: 'Nightly snapshot stored in eu-central-1. 2.3 TB, 00:14:22.', time: '2h ago', read: false, ico: 'db' },
  { id: 'n3', type: 'user', title: 'Felix Aranda accepted invitation', body: 'Joined as Operations. Awaiting MFA enrollment.', time: '5h ago', read: false, ico: 'users' },
  { id: 'n4', type: 'alert', title: 'API rate limit at 87%', body: '/v2/orders endpoint — consider upgrading quota.', time: '8h ago', read: true, ico: 'zap' },
  { id: 'n5', type: 'system', title: 'Stripe webhook redelivered', body: 'evt_3PkL8 — reprocessed successfully.', time: '1d ago', read: true, ico: 'receipt' },
  { id: 'n6', type: 'user', title: 'Jordan Blake deactivated', body: 'By Amelia Chen • session terminated.', time: '2d ago', read: true, ico: 'users' },
  { id: 'n7', type: 'system', title: 'New release deployed — v4.18.2', body: 'Orders filtering, dark mode refinements.', time: '3d ago', read: true, ico: 'zap' },
];

const AUDIT = [
  { t: '10:23:41', actor: 'Amelia Chen', action: 'role.updated', target: 'Operations Manager', ip: '104.21.88.4', result: 'success', meta: '+2 permissions' },
  { t: '10:18:12', actor: 'system', action: 'auth.mfa_enforced', target: 'u_2b7e', ip: '—', result: 'success', meta: 'policy v4' },
  { t: '10:14:07', actor: 'Amelia Chen', action: 'order.refunded', target: 'ORD-48215', ip: '104.21.88.4', result: 'success', meta: '$379.00' },
  { t: '09:57:33', actor: 'Marcus Holloway', action: 'user.created', target: 'felix.a@northwind.io', ip: '72.14.203.99', result: 'success', meta: 'role=ops' },
  { t: '09:42:18', actor: 'Priya Raghavan', action: 'ticket.assigned', target: 'TKT-1082', ip: '98.44.11.2', result: 'success', meta: 'to=Theo V.' },
  { t: '09:31:02', actor: 'Yuki Tanaka', action: 'api_key.rotated', target: 'prod-webhook-signer', ip: '203.0.113.45', result: 'success', meta: 'exp +90d' },
  { t: '09:12:55', actor: 'system', action: 'auth.login_blocked', target: 'u_3b91', ip: '187.54.12.9', result: 'denied', meta: 'geo anomaly' },
  { t: '08:47:41', actor: 'Sofie Lindqvist', action: 'resource.published', target: 'rs_04', ip: '85.203.4.18', result: 'success', meta: 'Ember Wool Throw' },
  { t: '08:22:09', actor: 'Harper Quinn', action: 'user.updated', target: 'u_0d88', ip: '98.44.11.7', result: 'success', meta: 'status=active' },
  { t: '07:55:28', actor: 'Amelia Chen', action: 'settings.updated', target: 'security.session_ttl', ip: '104.21.88.4', result: 'success', meta: '12h → 8h' },
  { t: '07:14:16', actor: 'system', action: 'backup.completed', target: 'db-primary', ip: '—', result: 'success', meta: '2.3 TB' },
  { t: '06:38:52', actor: 'Jordan Blake', action: 'auth.logout', target: 'u_1a60', ip: '72.14.203.11', result: 'success', meta: 'manual' },
];

const TICKETS = [
  { id: 'TKT-1082', subject: "Can't export April order report", from: 'Carla Mendes', email: 'carla.m@fastmail.com', status: 'open', priority: 'high', agent: 'Theo V.', updated: '8m ago', preview: "Hi — the CSV export times out after ~30s and returns an empty file. I've tried Safari and Chrome...", h: 7, unread: true },
  { id: 'TKT-1081', subject: 'Refund not showing on statement', from: 'Simone Rossi', email: 'simone@rossi.it', status: 'pending', priority: 'normal', agent: 'Harper Q.', updated: '34m ago', preview: "You confirmed the refund on the 22nd but I don't see it yet. My bank statement…", h: 2, unread: false },
  { id: 'TKT-1080', subject: 'Request: bulk user invite via CSV', from: 'Henry Osei', email: 'henry.osei@kinpo.io', status: 'open', priority: 'low', agent: 'Priya R.', updated: '1h ago', preview: 'We onboard about 40 people a month. A CSV importer would save a lot of time…', h: 2, unread: true },
  { id: 'TKT-1079', subject: 'Dashboard KPI showing wrong currency', from: 'Zoe Laurent', email: 'zoe.l@brume.fr', status: 'open', priority: 'high', agent: 'Theo V.', updated: '2h ago', preview: 'My revenue card shows USD but my account is on EUR. All other screens look correct.', h: 5, unread: false },
  { id: 'TKT-1078', subject: 'MFA code never arrives', from: 'Leona Park', email: 'leona.p@gmail.com', status: 'resolved', priority: 'normal', agent: 'Harper Q.', updated: '5h ago', preview: "Fixed — moved to authenticator app. Thanks!", h: 4, unread: false },
  { id: 'TKT-1077', subject: 'API webhook signature mismatch', from: 'Dmitri Volkov', email: 'dvolkov@outlook.com', status: 'pending', priority: 'high', agent: 'Priya R.', updated: '7h ago', preview: "Getting 401s on webhook verification. Signature is correct per our code…", h: 6, unread: false },
  { id: 'TKT-1076', subject: 'Feature request: dark mode on reports', from: 'Olu Adebayo', email: 'olu.a@prism.ng', status: 'open', priority: 'low', agent: 'Unassigned', updated: '1d ago', preview: "Love the new sidebar! Would love dark mode on PDF reports too.", h: 5, unread: false },
  { id: 'TKT-1075', subject: 'Cannot upload image > 4MB', from: 'Ivan Korolev', email: 'ivan.k@rupost.ru', status: 'resolved', priority: 'normal', agent: 'Theo V.', updated: '1d ago', preview: 'Resolved: raised limit to 10MB on your workspace.', h: 1, unread: false },
];

const TICKET_THREADS = {
  'TKT-1082': [
    { from: 'Carla Mendes', me: false, time: 'Apr 23, 09:32', body: "Hi — the CSV export times out after ~30s and returns an empty file. I've tried Safari and Chrome. Need this by EOD for the April board meeting.\n\nWorkspace: rossi-co" },
    { from: 'Theo Vasquez', me: true, time: 'Apr 23, 09:48', body: "Hi Carla — looking now. Can you confirm the date range and whether you're using any filters?" },
    { from: 'Carla Mendes', me: false, time: 'Apr 23, 10:01', body: 'Apr 1 – Apr 22, all statuses, EU region only.' },
    { from: 'Theo Vasquez', me: true, time: 'Apr 23, 10:15', body: "Reproduced it. Pushing a fix to batch the EU shard query. ETA 20min." },
  ],
};

const ACTIVITY = [
  { ico: 'users', who: 'Amelia Chen', text: 'updated role permissions for', what: 'Operations Manager', time: '4m ago' },
  { ico: 'receipt', who: 'New order', text: 'from Henry Osei —', what: '$1,680.00 · 5 items', time: '12m ago' },
  { ico: 'alert', who: 'Security', text: 'blocked login attempt on', what: 'u_3b91 from new geography', time: '23m ago' },
  { ico: 'box', who: 'Sofie Lindqvist', text: 'published', what: 'Ember Wool Throw', time: '1h ago' },
  { ico: 'users', who: 'Felix Aranda', text: 'accepted invite as', what: 'Operations', time: '5h ago' },
  { ico: 'key', who: 'Yuki Tanaka', text: 'rotated API key', what: 'prod-webhook-signer', time: '7h ago' },
];

window.CH_DATA = { USERS, ROLES, PERMISSIONS, ROLE_MATRIX, RESOURCES, ORDERS, NOTIFICATIONS, AUDIT, TICKETS, TICKET_THREADS, ACTIVITY };

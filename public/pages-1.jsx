// pages-1.jsx — Dashboard, Users, Roles, Resources

const { USERS, ROLES, PERMISSIONS, ROLE_MATRIX, RESOURCES, NOTIFICATIONS, AUDIT, ACTIVITY } = window.CH_DATA;

// ───────── Dashboard ─────────
function DashboardPage({ onOpenDrawer }) {
  const kpis = [
    { lbl: 'Active users', val: '4,218', delta: '+8.2%', dir: 'up', meta: 'vs last 30 days', spark: [12,15,14,18,17,22,20,25,23,28,30,29,34], color: 'var(--accent)' },
    { lbl: 'Revenue (MTD)', val: '$284.1k', delta: '+12.4%', dir: 'up', meta: '$3.2M annualized', spark: [40,42,41,45,48,47,52,55,54,60,58,63,65], color: 'var(--good)' },
    { lbl: 'Active sessions', val: '1,084', delta: '−3.1%', dir: 'down', meta: 'last 5 minutes', spark: [22,25,23,24,22,21,23,20,19,21,20,22,21], color: 'var(--info)' },
    { lbl: 'Error rate', val: '0.42%', delta: '−0.08pp', dir: 'up', meta: 'p50 168ms · p99 840ms', spark: [8,7,6,8,5,6,4,5,4,3,4,3,3], color: 'var(--warn)' },
  ];
  const line = [
    { data: [12,15,18,14,22,28,26,32,30,36,42,40,48,52,50,58,62,60,68,72,70,78,84,82,90,94], color: 'var(--accent)', fill: true },
    { data: [8,10,11,12,14,18,17,20,22,24,28,26,32,34,35,38,42,41,46,48,50,54,58,60,63,65], color: 'var(--info)', fill: false },
  ];
  const days = Array.from({ length: 26 }, (_, i) => i % 4 === 0 ? `Apr ${i + 1}` : '');

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Good morning, Amelia</h2>
          <div className="sub">Here's what's happening across Northwind today. Systems are nominal.</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico name="calendar" size={14} /> Last 30 days <Ico name="chevD" size={13} /></button>
          <button className="btn"><Ico name="download" size={14} /> Export</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="k-lbl">{k.lbl}</div>
            <div className="k-val">{k.val}</div>
            <div className={`k-delta ${k.dir}`}>
              <Ico name={k.dir === 'up' ? 'arrowUp' : 'arrowDown'} size={11} /> {k.delta}
            </div>
            <div className="k-meta">{k.meta}</div>
            <div className="k-spark"><Sparkline data={k.spark} color={k.color} /></div>
          </div>
        ))}
      </div>

      <div className="g-12" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Growth & usage</h3>
              <div className="card-sub">New signups (orange) and weekly active users (blue), last 26 days</div>
            </div>
            <div className="btn-group">
              <button className="on">30d</button>
              <button>90d</button>
              <button>1y</button>
            </div>
          </div>
          <div className="card-body">
            <LineChart series={line} labels={days} height={240} />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div><h3>Traffic mix</h3><div className="card-sub">Sessions by channel</div></div>
          </div>
          <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Donut data={[
              { v: 4820, color: 'oklch(0.55 0.18 255)', l: 'Direct' },
              { v: 3120, color: 'oklch(0.65 0.15 145)', l: 'Search' },
              { v: 1920, color: 'oklch(0.7 0.13 60)', l: 'Referral' },
              { v: 840, color: 'oklch(0.6 0.17 30)', l: 'Email' },
            ]} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Direct', 4820, 'oklch(0.55 0.18 255)'], ['Search', 3120, 'oklch(0.65 0.15 145)'], ['Referral', 1920, 'oklch(0.7 0.13 60)'], ['Email', 840, 'oklch(0.6 0.17 30)']].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />
                  <span style={{ flex: 1, color: 'var(--ink-2)' }}>{l}</span>
                  <span className="tnum muted">{v.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="g-12">
        <div className="card">
          <div className="card-head">
            <div><h3>Recent activity</h3><div className="card-sub">Actions across your workspace</div></div>
            <button className="btn ghost sm">View all <Ico name="chevR" size={12} /></button>
          </div>
          <div className="card-body tight">
            <div className="feed">
              {ACTIVITY.map((a, i) => (
                <div className="feed-item" key={i}>
                  <div className="f-dot"><Ico name={a.ico} size={14} /></div>
                  <div className="f-main">
                    <strong>{a.who}</strong> {a.text} <strong>{a.what}</strong>
                    <div className="f-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div><h3>Alerts</h3><div className="card-sub">Requires attention</div></div>
          </div>
          <div className="card-body tight">
            <div className="feed">
              {NOTIFICATIONS.filter(n => n.type === 'alert' || !n.read).slice(0, 5).map(n => (
                <div className="feed-item" key={n.id} onClick={onOpenDrawer} style={{ cursor: 'pointer' }}>
                  <div className="f-dot" style={{ background: n.type === 'alert' ? 'var(--danger-soft)' : 'var(--accent-soft)', color: n.type === 'alert' ? 'var(--danger)' : 'var(--accent-ink)' }}>
                    <Ico name={n.ico} size={14} />
                  </div>
                  <div className="f-main">
                    <strong>{n.title}</strong>
                    <div className="xs muted" style={{ marginTop: 2, lineHeight: 1.5 }}>{n.body}</div>
                    <div className="f-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────── User Management ─────────
function UsersPage() {
  const [users, setUsers] = React.useState(USERS);
  const [sort, setSort] = React.useState({ key: 'name', dir: 'asc' });
  const [q, setQ] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [selected, setSelected] = React.useState(new Set());
  const [drawerUser, setDrawerUser] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const perPage = 8;

  const toggleSort = (key) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  let filtered = users.filter(u => {
    if (q && !(u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))) return false;
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    return true;
  });
  filtered = [...filtered].sort((a, b) => {
    const va = a[sort.key], vb = b[sort.key];
    if (va < vb) return sort.dir === 'asc' ? -1 : 1;
    if (va > vb) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleOne = (id) => setSelected(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const toggleAll = () => setSelected(s => s.size === paged.length ? new Set() : new Set(paged.map(u => u.id)));

  const toggleStatus = (id) => setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));

  const sortHead = (key, label, extra = {}) => (
    <th className={`sortable ${sort.key === key ? 'sorted' : ''}`} onClick={() => toggleSort(key)} {...extra}>
      {label} <span className="sort-ind">{sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
    </th>
  );

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>User Management</h2>
          <div className="sub">{users.length} people, {users.filter(u => u.status === 'active').length} active. Manage roles, status, and access across the workspace.</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Ico name="upload" size={14} /> Import CSV</button>
          <button className="btn primary" onClick={() => setShowCreate(true)}><Ico name="plus" size={14} /> Invite user</button>
        </div>
      </div>

      <div className="card">
        <div className="tb-tools">
          <div className="search-in">
            <Ico name="search" size={14} />
            <input placeholder="Search name or email…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
          <button className={`filter-chip ${filterRole !== 'all' ? 'active' : ''}`} onClick={() => {
            const roles = ['all','Admin','Operations','Support','Viewer'];
            setFilterRole(roles[(roles.indexOf(filterRole) + 1) % roles.length]);
          }}>
            <Ico name="filter" size={12} /> Role: <strong>{filterRole === 'all' ? 'All' : filterRole}</strong>
          </button>
          <button className={`filter-chip ${filterStatus !== 'all' ? 'active' : ''}`} onClick={() => {
            const s = ['all','active','inactive','pending'];
            setFilterStatus(s[(s.indexOf(filterStatus) + 1) % s.length]);
          }}>
            <Ico name="filter" size={12} /> Status: <strong>{filterStatus === 'all' ? 'All' : filterStatus}</strong>
          </button>
          <div className="spacer" />
          {selected.size > 0 && (
            <>
              <span className="small muted">{selected.size} selected</span>
              <button className="btn sm"><Ico name="mail" size={12} /> Email</button>
              <button className="btn sm"><Ico name="edit" size={12} /> Change role</button>
              <button className="btn sm danger"><Ico name="trash" size={12} /> Deactivate</button>
            </>
          )}
        </div>
        <div className="table-wrap">
          <table className="dt">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" className="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} />
                </th>
                {sortHead('name', 'User')}
                {sortHead('role', 'Role')}
                {sortHead('status', 'Status')}
                {sortHead('dept', 'Department')}
                {sortHead('lastSeen', 'Last seen')}
                <th style={{ textAlign: 'right', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id} className={selected.has(u.id) ? 'selected' : ''}>
                  <td>
                    <input type="checkbox" className="checkbox" checked={selected.has(u.id)} onChange={() => toggleOne(u.id)} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar sm" data-h={u.h}>{u.name.split(' ').map(n => n[0]).join('')}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="cell-primary" style={{ cursor: 'pointer' }} onClick={() => setDrawerUser(u)}>{u.name}</div>
                        <div className="xs muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="chip">{u.role}</span></td>
                  <td><StatusChip status={u.status} /></td>
                  <td className="muted">{u.dept}</td>
                  <td className="muted tnum">{u.lastSeen}</td>
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <input type="checkbox" className="toggle" checked={u.status === 'active'} onChange={() => toggleStatus(u.id)} title="Toggle active" />
                      <button className="btn xs ghost" onClick={() => setDrawerUser(u)}><Ico name="eye" size={12} /></button>
                      <button className="btn xs ghost"><Ico name="more" size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan="7">
                  <div className="empty">
                    <div className="empty-ico"><Ico name="users" size={22} /></div>
                    <h4>No users match your filters</h4>
                    <p>Try clearing search or widening the role/status filters.</p>
                    <button className="btn sm" onClick={() => { setQ(''); setFilterRole('all'); setFilterStatus('all'); }}>Clear filters</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <div>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</div>
          <div className="pg-nums">
            <button className="pg-btn" disabled={page === 1} onClick={() => setPage(page - 1)}><Ico name="chevL" size={12} /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pg-btn ${p === page ? 'on' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="pg-btn" disabled={page === pages} onClick={() => setPage(page + 1)}><Ico name="chevR" size={12} /></button>
          </div>
        </div>
      </div>

      <Drawer open={!!drawerUser} onClose={() => setDrawerUser(null)}
        title={drawerUser?.name}
        subtitle={drawerUser?.email}
        footer={<>
          <button className="btn" onClick={() => setDrawerUser(null)}>Close</button>
          <button className="btn primary"><Ico name="edit" size={13} /> Edit user</button>
        </>}>
        {drawerUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="avatar xl" data-h={drawerUser.h}>{drawerUser.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 550 }}>{drawerUser.name}</div>
                <div className="muted small">{drawerUser.role} · {drawerUser.dept}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <StatusChip status={drawerUser.status} />
                  {drawerUser.mfa && <span className="chip good"><Ico name="shield" size={10} /> MFA</span>}
                </div>
              </div>
            </div>
            <div>
              <div className="xs muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 8, fontSize: 13 }}>
                <div className="muted">User ID</div><div className="mono">{drawerUser.id}</div>
                <div className="muted">Email</div><div>{drawerUser.email}</div>
                <div className="muted">Joined</div><div>{drawerUser.joined}</div>
                <div className="muted">Last seen</div><div>{drawerUser.lastSeen}</div>
                <div className="muted">Sessions</div><div>{drawerUser.sessions} active</div>
              </div>
            </div>
            <div>
              <div className="xs muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Recent activity</div>
              <div className="feed" style={{ borderTop: '1px solid var(--line-1)' }}>
                {AUDIT.filter(a => a.actor === drawerUser.name).slice(0, 4).map((a, i) => (
                  <div className="feed-item" key={i} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <div className="f-dot"><Ico name="logs" size={12} /></div>
                    <div className="f-main">
                      <span className="audit-code">{a.action}</span> on <strong>{a.target}</strong>
                      <div className="f-time">{a.t} · {a.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <Modal open={showCreate} onClose={() => setShowCreate(false)}
        title="Invite a new user"
        subtitle="They'll receive an email invitation valid for 7 days."
        footer={<>
          <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="btn primary" onClick={() => setShowCreate(false)}><Ico name="send" size={13} /> Send invitation</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="g-2">
            <div className="field"><label>First name</label><input className="input" placeholder="Jamie" /></div>
            <div className="field"><label>Last name</label><input className="input" placeholder="Park" /></div>
          </div>
          <div className="field"><label>Work email</label><input className="input" placeholder="jamie.park@northwind.io" /></div>
          <div className="g-2">
            <div className="field"><label>Role</label>
              <select className="select" defaultValue="Support">
                <option>Admin</option><option>Operations</option><option>Support</option><option>Viewer</option>
              </select>
            </div>
            <div className="field"><label>Department</label>
              <select className="select" defaultValue="Customer Success">
                <option>Engineering</option><option>Operations</option><option>Customer Success</option><option>Finance</option>
              </select>
            </div>
          </div>
          <div className="field"><label>Personal note (optional)</label>
            <textarea className="textarea" placeholder="Welcome to the team — let me know if you need help getting set up." />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            <input type="checkbox" className="checkbox" defaultChecked /> Require MFA enrollment on first login
          </label>
        </div>
      </Modal>
    </div>
  );
}

// ───────── Roles & Permissions ─────────
function RolesPage() {
  const [activeRole, setActiveRole] = React.useState('admin');
  const [matrix, setMatrix] = React.useState(() => {
    const m = {};
    for (const r of ROLES) m[r.id] = new Set(ROLE_MATRIX[r.id]);
    return m;
  });
  const [dirty, setDirty] = React.useState(false);

  const toggle = (roleId, perm) => {
    setMatrix(m => {
      const n = { ...m };
      n[roleId] = new Set(n[roleId]);
      if (n[roleId].has(perm)) n[roleId].delete(perm); else n[roleId].add(perm);
      return n;
    });
    setDirty(true);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Roles & Permissions</h2>
          <div className="sub">Control what each role can see and do. Changes apply to all users with that role immediately.</div>
        </div>
        <div className="page-actions">
          {dirty && <span className="chip warn"><span className="dot" />Unsaved changes</span>}
          <button className="btn"><Ico name="copy" size={13} /> Duplicate role</button>
          <button className="btn primary"><Ico name="plus" size={14} /> New role</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'flex-start' }}>
        <div className="card">
          <div className="card-head"><h3>Roles</h3></div>
          <div style={{ padding: 6 }}>
            {ROLES.map(r => (
              <div key={r.id} onClick={() => setActiveRole(r.id)}
                style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: activeRole === r.id ? 'var(--bg-sunken)' : 'transparent', marginBottom: 2, border: activeRole === r.id ? '1px solid var(--line-1)' : '1px solid transparent' }}>
                <div style={{ width: 6, height: 28, borderRadius: 3, background: `var(--${r.color === 'accent' ? 'accent' : r.color})` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 550, color: 'var(--ink-1)' }}>{r.name}</div>
                  <div className="xs muted">{r.users} {r.users === 1 ? 'user' : 'users'} · {matrix[r.id].size} permissions</div>
                </div>
                <Ico name="chevR" size={13} style={{ color: 'var(--ink-4)' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h3>{ROLES.find(r => r.id === activeRole).name}</h3>
              <div className="card-sub">{ROLES.find(r => r.id === activeRole).description}</div>
            </div>
            <div className="row">
              <button className="btn sm"><Ico name="copy" size={12} /> Duplicate</button>
              {activeRole !== 'admin' && <button className="btn sm danger"><Ico name="trash" size={12} /></button>}
            </div>
          </div>
          <div style={{ padding: '0 4px' }}>
            <table className="matrix">
              <thead>
                <tr>
                  <th>Permission</th>
                  {ROLES.map(r => <th key={r.id}>{r.name.split(' ')[0]}</th>)}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map(section => (
                  <React.Fragment key={section.section}>
                    <tr><td className="sec" colSpan={ROLES.length + 1}>{section.section}</td></tr>
                    {section.items.map(p => (
                      <tr key={p.k}>
                        <td>{p.label}<div className="xs muted mono" style={{ marginTop: 2 }}>{p.k}</div></td>
                        {ROLES.map(r => (
                          <td key={r.id}>
                            <input type="checkbox" className="checkbox" checked={matrix[r.id].has(p.k)} onChange={() => toggle(r.id, p.k)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {dirty && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line-1)', background: 'var(--bg-sunken)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={() => { setDirty(false); const m = {}; for (const r of ROLES) m[r.id] = new Set(ROLE_MATRIX[r.id]); setMatrix(m); }}>Discard</button>
              <button className="btn primary" onClick={() => setDirty(false)}><Ico name="check" size={13} /> Save changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────── Resources ─────────
function ResourcesPage() {
  const [items, setItems] = React.useState(RESOURCES);
  const [view, setView] = React.useState('grid');
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');

  let filtered = items.filter(r => {
    if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat !== 'all' && r.category !== cat) return false;
    return true;
  });

  const cats = ['all', ...new Set(items.map(i => i.category))];

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>Resources</h2>
          <div className="sub">Catalog of {items.length} items across {new Set(items.map(i => i.category)).size} categories. Draft, schedule, or publish.</div>
        </div>
        <div className="page-actions">
          <div className="btn-group">
            <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>Grid</button>
            <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>Table</button>
          </div>
          <button className="btn primary"><Ico name="plus" size={14} /> New resource</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="tb-tools">
          <div className="search-in">
            <Ico name="search" size={14} />
            <input placeholder="Search resources…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          {cats.map(c => (
            <button key={c} className={`filter-chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
              {c === 'all' ? 'All categories' : c}
            </button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map(r => (
            <div className="card" key={r.id} style={{ overflow: 'hidden' }}>
              <div style={{
                aspectRatio: '4 / 3',
                background: `repeating-linear-gradient(45deg, var(--bg-sunken) 0 8px, var(--bg-muted) 8px 16px)`,
                borderBottom: '1px solid var(--line-1)',
                display: 'grid', placeItems: 'center', color: 'var(--ink-4)',
                fontFamily: 'var(--font-mono)', fontSize: 10,
              }}>product · {r.id}</div>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div className="xs muted">{r.category}</div>
                  <StatusChip status={r.status} />
                </div>
                <div style={{ fontWeight: 550, color: 'var(--ink-1)', marginBottom: 4, fontSize: 14 }}>{r.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <div className="tnum" style={{ fontSize: 15, fontWeight: 550 }}>${r.price}</div>
                  <div className={`xs ${r.stock === 0 ? 'muted' : ''}`} style={{ color: r.stock === 0 ? 'var(--danger)' : 'var(--ink-4)' }}>
                    {r.stock === 0 ? 'Out of stock' : `${r.stock} in stock`}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty" style={{ gridColumn: '1 / -1', background: 'var(--bg-elev)', border: '1px dashed var(--line-2)', borderRadius: 16 }}>
              <div className="empty-ico"><Ico name="box" size={22} /></div>
              <h4>No resources match</h4>
              <p>Try a different category or clear your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <table className="dt">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Status</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'right' }}>Stock</th><th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="cell-primary">{r.title}<div className="xs muted mono">{r.id}</div></td>
                  <td className="muted">{r.category}</td>
                  <td><StatusChip status={r.status} /></td>
                  <td className="num tnum">${r.price}</td>
                  <td className="num tnum">{r.stock}</td>
                  <td className="muted">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DashboardPage, UsersPage, RolesPage, ResourcesPage });

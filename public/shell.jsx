// shell.jsx — Sidebar, Topbar, Drawer, Modal, shared UI primitives

const NAV = [
  { group: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard', ico: 'dashboard' },
  ]},
  { group: 'People', items: [
    { id: 'users', label: 'User Management', ico: 'users' },
    { id: 'roles', label: 'Roles & Permissions', ico: 'shield' },
  ]},
  { group: 'Operations', items: [
    { id: 'resources', label: 'Resources', ico: 'box' },
    { id: 'orders', label: 'Orders', ico: 'receipt' },
    { id: 'analytics', label: 'Analytics', ico: 'chart' },
  ]},
  { group: 'Support', items: [
    { id: 'tickets', label: 'Tickets', ico: 'life', badge: 7 },
    { id: 'notifications', label: 'Notifications', ico: 'bell', badge: 3 },
  ]},
  { group: 'System', items: [
    { id: 'audit', label: 'Audit Logs', ico: 'logs' },
    { id: 'settings', label: 'Settings', ico: 'settings' },
    { id: 'auth', label: 'Authentication', ico: 'lock' },
  ]},
];

function Sidebar({ current, onNav, collapsed, onToggle }) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo" />
        {!collapsed && (
          <div className="sb-brand-text">
            <div className="sb-brand-name">ControlHub</div>
            <div className="sb-brand-org">Northwind Inc.</div>
          </div>
        )}
      </div>
      <nav className="sb-nav">
        {NAV.map(group => (
          <div key={group.group}>
            {!collapsed && <div className="sb-group">{group.group}</div>}
            {group.items.map(item => (
              <div
                key={item.id}
                className={`sb-item ${current === item.id ? 'active' : ''}`}
                onClick={() => onNav(item.id)}
                title={collapsed ? item.label : ''}
              >
                <Ico name={item.ico} className="sb-ico" />
                <span className="sb-label">{item.label}</span>
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sb-foot">
        <button className="sb-collapse-btn" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          <Ico name="sidebar" size={14} />
        </button>
        {!collapsed && (
          <>
            <div className="small muted flex1">v4.18.2</div>
            <div className="small muted">Status: <span style={{color:'var(--good)',fontWeight:600}}>●</span> OK</div>
          </>
        )}
      </div>
    </aside>
  );
}

function Topbar({ page, theme, onTheme, onProfile, onNotifs, unread }) {
  const TITLES = {
    dashboard: ['Dashboard', 'Home · Overview'],
    users: ['User Management', 'People · Users'],
    roles: ['Roles & Permissions', 'People · Access control'],
    resources: ['Resources', 'Operations · Catalog'],
    orders: ['Orders', 'Operations · Transactions'],
    analytics: ['Analytics & Reports', 'Operations · Insights'],
    notifications: ['Notifications', 'Support · Inbox'],
    tickets: ['Support Tickets', 'Support · Tickets'],
    audit: ['Audit Logs', 'System · Activity'],
    settings: ['Settings', 'System · Configuration'],
    auth: ['Authentication', 'System · Access'],
  };
  const [title, crumb] = TITLES[page] || ['', ''];
  return (
    <header className="topbar">
      <div className="tb-title">
        <h1>{title}</h1>
        <div className="tb-crumbs">{crumb}</div>
      </div>
      <div className="tb-search">
        <Ico name="search" size={15} className="tb-search-ico" />
        <input placeholder="Search users, orders, resources…" />
        <kbd>⌘K</kbd>
      </div>
      <div className="tb-actions">
        <button className="tb-icon-btn" onClick={onTheme} title="Toggle theme">
          <Ico name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
        </button>
        <button className="tb-icon-btn" onClick={onNotifs} title="Notifications">
          <Ico name="bell" size={17} />
          {unread > 0 && <span className="dot" />}
        </button>
        <div style={{ width: 8 }} />
        <div className="tb-user" onClick={onProfile}>
          <div className="avatar" data-h="3">AC</div>
          <div className="tb-user-meta">
            <div className="n">Amelia Chen</div>
            <div className="r">Administrator</div>
          </div>
          <Ico name="chevD" size={13} style={{ color: 'var(--ink-4)' }} />
        </div>
      </div>
    </header>
  );
}

function Drawer({ open, onClose, title, subtitle, children, footer, width }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <>
      <div className={`drawer-mask ${open ? 'on' : ''}`} onClick={onClose} />
      <div className={`drawer ${open ? 'on' : ''}`} style={width ? { width } : undefined}>
        <div className="drawer-head">
          <div>
            {typeof title === 'string' ? <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h3> : title}
            {subtitle && <div className="small muted" style={{ marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button className="tb-icon-btn" onClick={onClose}><Ico name="x" size={16} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </>
  );
}

function Modal({ open, onClose, title, subtitle, children, footer }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <div className={`modal-mask ${open ? 'on' : ''}`} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          <button className="tb-icon-btn" onClick={onClose}><Ico name="x" size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// Status chip with proper color mapping
function StatusChip({ status }) {
  const MAP = {
    active: ['good', 'Active'],
    inactive: ['', 'Inactive'],
    pending: ['warn', 'Pending'],
    paid: ['good', 'Paid'],
    processing: ['info', 'Processing'],
    shipped: ['accent', 'Shipped'],
    refunded: ['', 'Refunded'],
    failed: ['danger', 'Failed'],
    published: ['good', 'Published'],
    draft: ['', 'Draft'],
    scheduled: ['info', 'Scheduled'],
    archived: ['', 'Archived'],
    open: ['info', 'Open'],
    resolved: ['good', 'Resolved'],
    high: ['danger', 'High'],
    normal: ['', 'Normal'],
    low: ['', 'Low'],
  };
  const [cls, label] = MAP[status] || ['', status];
  return <span className={`chip ${cls}`}><span className="dot" />{label}</span>;
}

// SVG Sparkline
function Sparkline({ data, color = 'var(--accent)', fill = true, height = 28, width = 72 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / rng) * (height - 4) - 2
  ]);
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill && <path d={area} fill={color} opacity="0.12" />}
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Line chart with grid
function LineChart({ series, height = 220, labels, yTicks = 4 }) {
  const w = 720, pad = { t: 14, r: 14, b: 26, l: 40 };
  const allVals = series.flatMap(s => s.data);
  const min = 0;
  const max = Math.max(...allVals) * 1.1;
  const xStep = (w - pad.l - pad.r) / (series[0].data.length - 1);
  const yH = height - pad.t - pad.b;
  const yOf = v => pad.t + yH - ((v - min) / (max - min)) * yH;

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => min + (max - min) * i / yTicks);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" style={{ display: 'block' }}>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={yOf(t)} y2={yOf(t)} stroke="var(--line-1)" strokeDasharray={i === 0 ? '' : '3 3'} />
          <text x={pad.l - 8} y={yOf(t) + 3} textAnchor="end" fontSize="10" fill="var(--ink-4)" style={{fontVariantNumeric:'tabular-nums'}}>
            {t >= 1000 ? (t / 1000).toFixed(1) + 'k' : Math.round(t)}
          </text>
        </g>
      ))}
      {labels && labels.map((lb, i) => (
        i % Math.ceil(labels.length / 8) === 0 && (
          <text key={i} x={pad.l + i * xStep} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--ink-4)">{lb}</text>
        )
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [pad.l + i * xStep, yOf(v)]);
        const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
        const area = d + ` L${pad.l + (pts.length - 1) * xStep},${height - pad.b} L${pad.l},${height - pad.b} Z`;
        return (
          <g key={si}>
            {s.fill && <path d={area} fill={s.color} opacity="0.1" />}
            <path d={d} stroke={s.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}

// Bar chart
function BarChart({ data, height = 220, color = 'var(--accent)' }) {
  const w = 720, pad = { t: 14, r: 14, b: 26, l: 40 };
  const max = Math.max(...data.map(d => d.v)) * 1.15;
  const yH = height - pad.t - pad.b;
  const bw = (w - pad.l - pad.r) / data.length;
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" style={{ display: 'block' }}>
      {ticks.map((t, i) => {
        const y = pad.t + yH - (t / max) * yH;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="var(--line-1)" strokeDasharray={i === 0 ? '' : '3 3'} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--ink-4)" style={{fontVariantNumeric:'tabular-nums'}}>
              {t >= 1000 ? (t / 1000).toFixed(1) + 'k' : Math.round(t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.v / max) * yH;
        const x = pad.l + i * bw + bw * 0.18;
        const bwActual = bw * 0.64;
        return (
          <g key={i}>
            <rect x={x} y={pad.t + yH - h} width={bwActual} height={h} fill={color} rx="4" />
            <text x={x + bwActual / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--ink-4)">{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Donut
function Donut({ data, size = 160 }) {
  const total = data.reduce((a, d) => a + d.v, 0);
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const arcs = data.map(d => {
    const frac = d.v / total;
    const a2 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle = a2;
    return { path, color: d.color, label: d.l, v: d.v };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} />)}
      <circle cx={cx} cy={cy} r={r * 0.58} fill="var(--bg-elev)" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="11" fill="var(--ink-4)">Total</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fontWeight="600" fill="var(--ink-1)" style={{fontVariantNumeric:'tabular-nums'}}>{total.toLocaleString()}</text>
    </svg>
  );
}

Object.assign(window, { Sidebar, Topbar, Drawer, Modal, StatusChip, Sparkline, LineChart, BarChart, Donut, NAV });

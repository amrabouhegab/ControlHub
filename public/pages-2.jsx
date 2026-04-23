// pages-2.jsx — Orders, Analytics, Notifications, Audit, Settings, Auth, Tickets

const { USERS: _U, ORDERS, NOTIFICATIONS: NTF, AUDIT: ADT, TICKETS, TICKET_THREADS } = window.CH_DATA;

// ───────── Orders ─────────
function OrdersPage() {
  const [orders] = React.useState(ORDERS);
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [sort, setSort] = React.useState({ key: 'date', dir: 'desc' });
  const [selected, setSelected] = React.useState(null);

  let filtered = orders.filter(o => {
    if (q && !(o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase()))) return false;
    if (status !== 'all' && o.status !== status) return false;
    return true;
  });
  filtered = [...filtered].sort((a,b) => {
    const va = a[sort.key], vb = b[sort.key];
    if (va < vb) return sort.dir === 'asc' ? -1 : 1;
    if (va > vb) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const totals = {
    all: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    refunded: orders.filter(o => o.status === 'refunded').length,
    failed: orders.filter(o => o.status === 'failed').length,
  };
  const revenue = orders.filter(o => o.status !== 'failed' && o.status !== 'refunded').reduce((a,o) => a + o.total, 0);

  const toggleSort = (k) => setSort(s => s.key === k ? { key: k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: 'desc' });
  const sortHead = (key, label, extra = {}) => (
    <th className={`sortable ${sort.key === key ? 'sorted' : ''}`} onClick={() => toggleSort(key)} {...extra}>
      {label} <span className="sort-ind">{sort.key === key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
    </th>
  );

  return (
    <div>
      <div className="page-head">
        <div><h2>Orders</h2><div className="sub">{orders.length} orders today · ${revenue.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})} in revenue</div></div>
        <div className="page-actions">
          <button className="btn"><Ico name="download" size={14} /> Export CSV</button>
          <button className="btn primary"><Ico name="plus" size={14} /> New order</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="kpi"><div className="k-lbl">Gross volume</div><div className="k-val">${(revenue/1000).toFixed(1)}k</div><div className="k-delta up"><Ico name="arrowUp" size={11}/> +14%</div></div>
        <div className="kpi"><div className="k-lbl">Paid</div><div className="k-val">{totals.paid}</div><div className="k-meta">Settled successfully</div></div>
        <div className="kpi"><div className="k-lbl">In flight</div><div className="k-val">{totals.processing + totals.shipped}</div><div className="k-meta">Processing or shipped</div></div>
        <div className="kpi"><div className="k-lbl">Failed / refunded</div><div className="k-val">{totals.failed + totals.refunded}</div><div className="k-meta">Needs review</div></div>
      </div>

      <div className="card">
        <div className="tb-tools">
          <div className="search-in"><Ico name="search" size={14}/><input placeholder="Search order ID or customer…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          {['all','paid','processing','shipped','refunded','failed'].map(s => (
            <button key={s} className={`filter-chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} <strong>{totals[s]}</strong>
            </button>
          ))}
          <div className="spacer"/>
          <button className="btn sm"><Ico name="calendar" size={12}/> Apr 1 – Apr 23</button>
        </div>
        <div className="table-wrap">
          <table className="dt">
            <thead>
              <tr>
                {sortHead('id','Order')}
                {sortHead('customer','Customer')}
                {sortHead('status','Status')}
                {sortHead('method','Payment')}
                {sortHead('date','Date')}
                {sortHead('total','Total', { style:{textAlign:'right'} })}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} onClick={() => setSelected(o)} style={{ cursor: 'pointer' }}>
                  <td className="mono cell-primary">{o.id}<div className="xs muted" style={{ fontFamily:'var(--font-sans)' }}>{o.items} {o.items === 1 ? 'item' : 'items'}</div></td>
                  <td>
                    <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                      <div className="avatar sm" data-h={o.h}>{o.customer.split(' ').map(n => n[0]).join('')}</div>
                      <div><div style={{ color:'var(--ink-1)', fontWeight:500 }}>{o.customer}</div><div className="xs muted">{o.email}</div></div>
                    </div>
                  </td>
                  <td><StatusChip status={o.status}/></td>
                  <td className="muted">{o.method}</td>
                  <td className="muted tnum">{o.date}</td>
                  <td className="num tnum cell-primary">${o.total.toFixed(2)}</td>
                  <td><Ico name="chevR" size={14} style={{ color: 'var(--ink-4)' }}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.id} subtitle={selected?.date}
        footer={<><button className="btn" onClick={() => setSelected(null)}>Close</button>{selected?.status === 'paid' && <button className="btn danger">Refund</button>}<button className="btn primary"><Ico name="external" size={13}/> Full view</button></>}>
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize: 28, fontWeight: 500 }} className="tnum">${selected.total.toFixed(2)}</div>
              <StatusChip status={selected.status}/>
            </div>
            <div>
              <div className="xs muted" style={{ textTransform:'uppercase', letterSpacing:'0.06em', marginBottom: 8 }}>Customer</div>
              <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <div className="avatar lg" data-h={selected.h}>{selected.customer.split(' ').map(n => n[0]).join('')}</div>
                <div><div style={{ fontWeight:550 }}>{selected.customer}</div><div className="small muted">{selected.email}</div></div>
              </div>
            </div>
            <div>
              <div className="xs muted" style={{ textTransform:'uppercase', letterSpacing:'0.06em', marginBottom: 8 }}>Payment</div>
              <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', rowGap:8, fontSize:13 }}>
                <div className="muted">Method</div><div>{selected.method}</div>
                <div className="muted">Items</div><div>{selected.items}</div>
                <div className="muted">Subtotal</div><div className="tnum">${(selected.total * 0.92).toFixed(2)}</div>
                <div className="muted">Tax</div><div className="tnum">${(selected.total * 0.08).toFixed(2)}</div>
              </div>
            </div>
            <div>
              <div className="xs muted" style={{ textTransform:'uppercase', letterSpacing:'0.06em', marginBottom: 8 }}>Timeline</div>
              <div className="feed" style={{ borderTop:'1px solid var(--line-1)' }}>
                <div className="feed-item" style={{ paddingLeft:0, paddingRight:0 }}><div className="f-dot" style={{ background:'var(--good-soft)', color:'var(--good)' }}><Ico name="check" size={12}/></div><div className="f-main">Payment authorized<div className="f-time">{selected.date}</div></div></div>
                <div className="feed-item" style={{ paddingLeft:0, paddingRight:0 }}><div className="f-dot"><Ico name="receipt" size={12}/></div><div className="f-main">Order created<div className="f-time">{selected.date}</div></div></div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ───────── Analytics ─────────
function AnalyticsPage() {
  const [range, setRange] = React.useState('30d');
  const data30 = [28,32,30,35,38,42,40,45,48,46,50,54,52,58,56,61,64,62,68,72,70,75,78,76,82,85,83,88,92,90];
  const data90 = [20,22,24,27,30,32,35,38,40,42,44,47,50,52,54,57,60,62,65,68,70,72,75,77,80,82,85,87,89,92];
  const series = [{ data: range === '30d' ? data30 : data90, color: 'var(--accent)', fill: true }];
  const labels = Array.from({ length: series[0].data.length }, (_, i) => i % 5 === 0 ? `D${i + 1}` : '');

  return (
    <div>
      <div className="page-head">
        <div><h2>Analytics & Reports</h2><div className="sub">Deep-dive into growth, engagement, and revenue. Slice by cohort, segment, or funnel.</div></div>
        <div className="page-actions">
          <div className="btn-group">
            {['7d','30d','90d','1y'].map(r => <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}</button>)}
          </div>
          <button className="btn"><Ico name="download" size={14}/> Export</button>
          <button className="btn"><Ico name="paper" size={14}/> PDF</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi"><div className="k-lbl">Total revenue</div><div className="k-val">$1.24M</div><div className="k-delta up"><Ico name="arrowUp" size={11}/> +18.3%</div><div className="k-spark"><Sparkline data={[20,25,22,28,30,35,32,38,42,44,48,52,56]} color="var(--good)"/></div></div>
        <div className="kpi"><div className="k-lbl">Avg order value</div><div className="k-val">$284</div><div className="k-delta up"><Ico name="arrowUp" size={11}/> +4.2%</div><div className="k-spark"><Sparkline data={[42,40,43,41,44,43,46,44,47,46,48,47,49]} color="var(--accent)"/></div></div>
        <div className="kpi"><div className="k-lbl">Conversion</div><div className="k-val">3.8%</div><div className="k-delta down"><Ico name="arrowDown" size={11}/> −0.3pp</div><div className="k-spark"><Sparkline data={[38,42,40,44,42,46,44,42,40,42,40,38,38]} color="var(--warn)"/></div></div>
        <div className="kpi"><div className="k-lbl">Churn</div><div className="k-val">1.2%</div><div className="k-delta up"><Ico name="arrowDown" size={11}/> −0.4pp</div><div className="k-spark"><Sparkline data={[18,16,18,14,16,12,14,12,10,12,10,12,10]} color="var(--info)"/></div></div>
      </div>

      <div className="g-12" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><div><h3>Revenue over time</h3><div className="card-sub">Daily revenue, {range}</div></div></div>
          <div className="card-body"><LineChart series={series} labels={labels} height={260}/></div>
        </div>
        <div className="card">
          <div className="card-head"><div><h3>By category</h3><div className="card-sub">Share of revenue</div></div></div>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[['Furniture', 48, 'oklch(0.55 0.18 255)'], ['Lighting', 24, 'oklch(0.65 0.15 145)'], ['Textiles', 18, 'oklch(0.7 0.13 60)'], ['Decor', 10, 'oklch(0.6 0.17 30)']].map(([l,v,c]) => (
              <div key={l}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:5 }}>
                  <span style={{ color:'var(--ink-1)', fontWeight:500 }}>{l}</span>
                  <span className="muted tnum">{v}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-sunken)', borderRadius: 4, overflow:'hidden' }}>
                  <div style={{ width: `${v}%`, height:'100%', background: c, borderRadius: 4 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Orders per day</h3><div className="card-sub">Last 12 weeks</div></div></div>
        <div className="card-body">
          <BarChart data={[
            { l:'W1', v: 310 },{ l:'W2', v: 340 },{ l:'W3', v: 380 },{ l:'W4', v: 360 },
            { l:'W5', v: 420 },{ l:'W6', v: 450 },{ l:'W7', v: 470 },{ l:'W8', v: 460 },
            { l:'W9', v: 510 },{ l:'W10', v: 540 },{ l:'W11', v: 580 },{ l:'W12', v: 610 },
          ]} height={220}/>
        </div>
      </div>
    </div>
  );
}

// ───────── Notifications ─────────
function NotificationsPage() {
  const [items, setItems] = React.useState(NTF);
  const [tab, setTab] = React.useState('all');
  const mark = (id) => setItems(xs => xs.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll = () => setItems(xs => xs.map(n => ({ ...n, read: true })));

  const shown = items.filter(n => {
    if (tab === 'unread') return !n.read;
    if (tab === 'alerts') return n.type === 'alert';
    if (tab === 'system') return n.type === 'system';
    if (tab === 'user') return n.type === 'user';
    return true;
  });

  return (
    <div>
      <div className="page-head">
        <div><h2>Notifications</h2><div className="sub">{items.filter(n => !n.read).length} unread · stay on top of system, user, and security events.</div></div>
        <div className="page-actions">
          <button className="btn" onClick={markAll}><Ico name="check" size={14}/> Mark all read</button>
          <button className="btn"><Ico name="settings" size={14}/> Preferences</button>
        </div>
      </div>

      <div className="tabs">
        {[['all','All',items.length],['unread','Unread',items.filter(n=>!n.read).length],['alerts','Alerts',items.filter(n=>n.type==='alert').length],['system','System',items.filter(n=>n.type==='system').length],['user','User',items.filter(n=>n.type==='user').length]].map(([k,l,c]) => (
          <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l} <span className="muted">{c}</span></button>
        ))}
      </div>

      <div className="card">
        <div className="feed">
          {shown.map(n => (
            <div className="feed-item" key={n.id} onClick={() => mark(n.id)} style={{ cursor:'pointer', padding:'18px 22px' }}>
              <div className="f-dot" style={{ width:36, height:36, background: n.type==='alert' ? 'var(--danger-soft)' : n.type==='user' ? 'var(--accent-soft)' : 'var(--info-soft)', color: n.type==='alert' ? 'var(--danger)' : n.type==='user' ? 'var(--accent-ink)' : 'var(--info)' }}>
                <Ico name={n.ico} size={16}/>
              </div>
              <div className="f-main">
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {!n.read && <span className="n-dot"/>}
                  <strong>{n.title}</strong>
                  <span className="chip" style={{ fontSize:10, padding:'1px 7px' }}>{n.type}</span>
                </div>
                <div className="small muted" style={{ marginTop:4, lineHeight:1.5 }}>{n.body}</div>
                <div className="f-time">{n.time}</div>
              </div>
              <button className="btn xs ghost"><Ico name="more" size={12}/></button>
            </div>
          ))}
          {shown.length === 0 && (
            <div className="empty"><div className="empty-ico"><Ico name="bell" size={22}/></div><h4>You're all caught up</h4><p>No notifications in this view.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ───────── Audit Logs ─────────
function AuditPage() {
  const [q, setQ] = React.useState('');
  const [res, setRes] = React.useState('all');
  const filtered = ADT.filter(a => {
    if (q && !(a.actor.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()) || a.target.toLowerCase().includes(q.toLowerCase()))) return false;
    if (res !== 'all' && a.result !== res) return false;
    return true;
  });

  return (
    <div>
      <div className="page-head">
        <div><h2>Audit Logs</h2><div className="sub">Immutable record of every action taken in your workspace. Retained for 13 months.</div></div>
        <div className="page-actions">
          <button className="btn"><Ico name="download" size={14}/> Export</button>
          <button className="btn"><Ico name="filter" size={14}/> Advanced filter</button>
        </div>
      </div>

      <div className="card">
        <div className="tb-tools">
          <div className="search-in"><Ico name="search" size={14}/><input placeholder="Search actor, action, or target…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          {['all','success','denied'].map(s => <button key={s} className={`filter-chip ${res === s ? 'active' : ''}`} onClick={() => setRes(s)}>{s === 'all' ? 'Any result' : s}</button>)}
          <div className="spacer"/>
          <button className="btn sm"><Ico name="calendar" size={12}/> Today</button>
        </div>
        <div className="table-wrap">
          <table className="dt">
            <thead>
              <tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Result</th><th>IP</th><th>Metadata</th></tr>
            </thead>
            <tbody>
              {filtered.map((a,i) => (
                <tr key={i}>
                  <td className="mono">{a.t}</td>
                  <td>{a.actor === 'system' ? <span className="chip info"><Ico name="cpu" size={10}/> system</span> : <div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="avatar sm" data-h={(i%7)+1}>{a.actor.split(' ').map(x=>x[0]).join('')}</div><span className="cell-primary">{a.actor}</span></div>}</td>
                  <td><span className="audit-code">{a.action}</span></td>
                  <td className="mono">{a.target}</td>
                  <td>{a.result === 'success' ? <span className="chip good"><span className="dot"/>success</span> : <span className="chip danger"><span className="dot"/>denied</span>}</td>
                  <td className="mono muted">{a.ip}</td>
                  <td className="muted xs">{a.meta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager"><div>Showing {filtered.length} of {ADT.length} events · 2026-04-23</div><div className="pg-nums"><button className="pg-btn on">1</button><button className="pg-btn">2</button><button className="pg-btn">3</button><button className="pg-btn">…</button></div></div>
      </div>
    </div>
  );
}

// ───────── Settings ─────────
function SettingsPage() {
  const [tab, setTab] = React.useState('general');
  const [flags, setFlags] = React.useState({ newChecker:true, aiSummaries:false, betaReports:true, darkPdf:false });
  return (
    <div>
      <div className="page-head">
        <div><h2>Settings</h2><div className="sub">Configure platform behavior, security, integrations, and feature flags.</div></div>
      </div>
      <div className="tabs">
        {['general','security','api','features','billing'].map(t => <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>
      <div className="card">
        <div style={{ padding: '8px 24px' }}>
          {tab === 'general' && <>
            <div className="settings-row"><div className="s-lbl"><h4>Workspace name</h4><p>Displayed across the platform and on invitation emails.</p></div><div><input className="input" defaultValue="Northwind Inc." style={{ maxWidth: 360 }}/></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Default timezone</h4><p>All timestamps use this unless a user overrides.</p></div><div><select className="select" style={{ maxWidth: 360 }}><option>UTC+01:00 · Europe/Berlin</option><option>UTC−05:00 · America/New_York</option><option>UTC+09:00 · Asia/Tokyo</option></select></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Currency</h4><p>Default for new orders and reports.</p></div><div><select className="select" style={{ maxWidth: 360 }}><option>EUR — €</option><option>USD — $</option><option>GBP — £</option></select></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Data retention</h4><p>How long to keep order and analytics history. Audit logs are retained separately for 13 months.</p></div><div><select className="select" style={{ maxWidth: 360 }}><option>24 months</option><option>36 months</option><option>Indefinite</option></select></div></div>
          </>}
          {tab === 'security' && <>
            <div className="settings-row"><div className="s-lbl"><h4>Enforce MFA</h4><p>Require all users to enroll in multi-factor authentication.</p></div><div><label style={{ display:'flex', gap:10, alignItems:'center' }}><input type="checkbox" className="toggle" defaultChecked/> <span>Enabled · 47 of 49 users enrolled</span></label></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Session timeout</h4><p>Idle sessions are logged out after this period.</p></div><div><select className="select" style={{ maxWidth: 360 }} defaultValue="8h"><option>1 hour</option><option>4 hours</option><option>8h</option><option>24 hours</option></select></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>IP allowlist</h4><p>Restrict admin console access to these ranges. Leave empty to allow all.</p></div><div><textarea className="textarea" placeholder="104.21.0.0/16&#10;72.14.192.0/19" style={{ maxWidth: 360, fontFamily:'var(--font-mono)', fontSize:12 }}/></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>SSO (SAML)</h4><p>Single sign-on via your identity provider.</p></div><div><div style={{ display:'flex', gap:8, alignItems:'center' }}><span className="chip good"><span className="dot"/>Connected · Okta</span><button className="btn sm">Configure</button></div></div></div>
          </>}
          {tab === 'api' && <>
            <div className="settings-row"><div className="s-lbl"><h4>API keys</h4><p>Manage server-to-server credentials. Rotate keys at least every 90 days.</p></div><div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[['prod-webhook-signer','sk_live_•••••_4f2a','rotated 7h ago','good'],['prod-reporter','sk_live_•••••_9c1e','84 days old','warn'],['staging','sk_test_•••••_2b3d','used 2m ago','good']].map(([n,k,m,c]) => (
                  <div key={n} style={{ padding: '10px 12px', border: '1px solid var(--line-1)', borderRadius: 10, display: 'flex', alignItems:'center', gap: 12 }}>
                    <Ico name="key" size={15} style={{ color: 'var(--ink-3)' }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight:500, fontSize:13 }}>{n}</div>
                      <div className="mono xs muted">{k}</div>
                    </div>
                    <span className={`chip ${c}`}><span className="dot"/>{m}</span>
                    <button className="btn xs"><Ico name="copy" size={11}/></button>
                    <button className="btn xs"><Ico name="more" size={11}/></button>
                  </div>
                ))}
                <button className="btn sm" style={{ alignSelf:'flex-start', marginTop: 4 }}><Ico name="plus" size={12}/> Generate new key</button>
              </div>
            </div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Webhooks</h4><p>Deliver events to your endpoints. Retries up to 5 times with exponential backoff.</p></div><div><button className="btn">Manage endpoints (4)</button></div></div>
          </>}
          {tab === 'features' && <>
            {[['newChecker','Advanced duplicate checker','Detect duplicate users across email and phone.'],['aiSummaries','AI-generated ticket summaries','Haiku-powered TL;DRs on every support ticket. Beta.'],['betaReports','Beta: composable reports','New builder with drag-drop blocks.'],['darkPdf','Dark mode in PDF exports','Render reports with dark background.']].map(([k,l,d]) => (
              <div className="settings-row" key={k}><div className="s-lbl"><h4>{l}</h4><p>{d}</p></div><div><label style={{display:'flex',gap:10,alignItems:'center'}}><input type="checkbox" className="toggle" checked={flags[k]} onChange={e => setFlags({...flags, [k]:e.target.checked})}/><span>{flags[k] ? 'Enabled' : 'Disabled'}</span></label></div></div>
            ))}
          </>}
          {tab === 'billing' && <>
            <div className="settings-row"><div className="s-lbl"><h4>Plan</h4><p>You are on the Scale plan — 50 seats, unlimited API calls.</p></div><div><div style={{ display:'flex', alignItems:'center', gap:10 }}><span className="chip accent">Scale · $2,400/mo</span><button className="btn sm">Change plan</button></div></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Payment method</h4><p>Invoices charge this method on the 1st of each month.</p></div><div><div className="row"><span className="mono">Visa •• 4821</span><button className="btn sm">Update</button></div></div></div>
            <div className="settings-row"><div className="s-lbl"><h4>Billing email</h4><p>Receipts and invoices go here.</p></div><div><input className="input" defaultValue="billing@northwind.io" style={{ maxWidth: 360 }}/></div></div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ───────── Authentication ─────────
function AuthPage() {
  const [mode, setMode] = React.useState('login');
  return (
    <div className="auth-wrap" style={{ minHeight: 'calc(100vh - 64px)', gridTemplateColumns: '1fr 1fr' }}>
      <div className="auth-brand-side">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="sb-logo"/>
          <div><div className="sb-brand-name">ControlHub</div></div>
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.02em', fontWeight: 450, maxWidth: 440, color:'var(--ink-1)' }}>
            The command surface for the systems you actually run.
          </div>
          <div className="muted" style={{ marginTop: 16, fontSize: 14, maxWidth: 420, lineHeight: 1.6 }}>
            Users, orders, permissions, alerts. One place. Built for ops, support, and admins — with the audit trail to prove it.
          </div>
          <div className="auth-brand-stats">
            <div><div className="xs muted">Uptime</div><div style={{ fontSize: 22, fontWeight: 550, fontFamily:'var(--font-display)', whiteSpace:'nowrap' }}>99.99%</div></div>
            <div><div className="xs muted">Actions / day</div><div style={{ fontSize: 22, fontWeight: 550, fontFamily:'var(--font-display)', whiteSpace:'nowrap' }}>1.2M</div></div>
            <div><div className="xs muted">Teams</div><div style={{ fontSize: 22, fontWeight: 550, fontFamily:'var(--font-display)', whiteSpace:'nowrap' }}>1,840</div></div>
          </div>
        </div>
        <div className="xs muted">SOC 2 Type II · ISO 27001 · GDPR · HIPAA-ready</div>
      </div>
      <div className="auth-form-side">
        {mode === 'login' && (
          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <div><h1>Sign in</h1><div className="lede">Welcome back — continue to your workspace.</div></div>
            <div className="field"><label>Work email</label><input className="input" placeholder="you@company.com" defaultValue="amelia.chen@northwind.io"/></div>
            <div className="field">
              <div style={{ display:'flex', justifyContent:'space-between' }}><label>Password</label><a style={{ fontSize:12, color:'var(--accent-ink)', textDecoration:'none', cursor:'pointer' }} onClick={() => setMode('forgot')}>Forgot?</a></div>
              <input className="input" type="password" defaultValue="••••••••••"/>
            </div>
            <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:13 }}><input type="checkbox" className="checkbox" defaultChecked/> Remember this device for 30 days</label>
            <button className="btn primary" style={{ height: 42 }}>Continue <Ico name="arrowR" size={14}/></button>
            <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--ink-4)', fontSize:11 }}><div style={{ flex:1, height:1, background:'var(--line-1)' }}/>OR<div style={{ flex:1, height:1, background:'var(--line-1)' }}/></div>
            <button className="btn" style={{ height: 42, justifyContent:'center' }}><Ico name="key" size={14}/> Continue with SSO</button>
            <div className="xs muted" style={{ textAlign:'center', marginTop: 8 }}>By continuing you agree to our Terms and Privacy Policy.</div>
          </form>
        )}
        {mode === 'forgot' && (
          <form className="auth-form" onSubmit={e => { e.preventDefault(); setMode('sent'); }}>
            <div><h1>Reset password</h1><div className="lede">Enter your email and we'll send a secure link valid for 30 minutes.</div></div>
            <div className="field"><label>Work email</label><input className="input" placeholder="you@company.com"/></div>
            <button className="btn primary" style={{ height: 42 }}>Send reset link <Ico name="send" size={14}/></button>
            <button type="button" className="btn ghost" onClick={() => setMode('login')} style={{ height: 42, justifyContent: 'center' }}><Ico name="chevL" size={14}/> Back to sign in</button>
          </form>
        )}
        {mode === 'sent' && (
          <div className="auth-form" style={{ textAlign:'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background:'var(--good-soft)', color: 'var(--good)', display:'grid', placeItems:'center', margin: '0 auto 8px' }}><Ico name="check" size={28} strokeWidth={2}/></div>
            <h1>Check your inbox</h1>
            <div className="lede">If an account exists, we sent a reset link. It expires in 30 minutes.</div>
            <button className="btn" onClick={() => setMode('login')} style={{ height: 42, justifyContent:'center' }}><Ico name="chevL" size={14}/> Back to sign in</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────── Tickets ─────────
function TicketsPage() {
  const [sel, setSel] = React.useState(TICKETS[0].id);
  const [status, setStatus] = React.useState('all');
  const [reply, setReply] = React.useState('');
  const [threads, setThreads] = React.useState(TICKET_THREADS);
  const shown = TICKETS.filter(t => status === 'all' || t.status === status);
  const ticket = TICKETS.find(t => t.id === sel);
  const thread = threads[sel] || [{ from: ticket.from, me: false, time: 'recent', body: ticket.preview }];

  const send = () => {
    if (!reply.trim()) return;
    setThreads(t => ({ ...t, [sel]: [...(t[sel] || []), { from: 'Amelia Chen', me: true, time: 'Just now', body: reply }] }));
    setReply('');
  };

  return (
    <div>
      <div className="page-head">
        <div><h2>Support Tickets</h2><div className="sub">{TICKETS.filter(t => t.status !== 'resolved').length} open · {TICKETS.filter(t => t.priority === 'high').length} high priority</div></div>
        <div className="page-actions">
          <button className="btn"><Ico name="filter" size={14}/> Filters</button>
          <button className="btn primary"><Ico name="plus" size={14}/> New ticket</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom: 12 }}>
        {['all','open','pending','resolved'].map(s => <button key={s} className={`filter-chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase()+s.slice(1)} <strong>{TICKETS.filter(t => s === 'all' || t.status === s).length}</strong></button>)}
      </div>

      <div className="ticket-layout">
        <div className="ticket-list">
          {shown.map(t => (
            <div key={t.id} className={`ticket-li ${sel === t.id ? 'on' : ''}`} onClick={() => setSel(t.id)}>
              <div className="t-head">
                <span className="mono">{t.id}</span>
                <span>{t.updated}</span>
              </div>
              <div className="t-sub">{t.unread && <span className="n-dot"/>}{t.subject}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span className="xs muted">{t.from}</span>
                <StatusChip status={t.priority}/>
              </div>
              <div className="t-prev">{t.preview}</div>
            </div>
          ))}
        </div>
        <div className="ticket-view">
          <div className="tv-head">
            <div>
              <div className="mono xs muted">{ticket.id}</div>
              <div style={{ fontSize: 17, fontWeight: 550, marginTop: 2 }}>{ticket.subject}</div>
              <div style={{ display:'flex', gap:6, marginTop: 8 }}>
                <StatusChip status={ticket.status}/>
                <StatusChip status={ticket.priority}/>
                <span className="chip"><Ico name="users" size={10}/> {ticket.agent}</span>
              </div>
            </div>
            <div className="row">
              <button className="btn sm"><Ico name="users" size={12}/> Assign</button>
              <button className="btn sm"><Ico name="tag" size={12}/> Label</button>
              <button className="btn sm primary">Resolve</button>
            </div>
          </div>
          <div className="tv-thread">
            {thread.map((m,i) => (
              <div key={i} className={`tv-msg ${m.me ? 'me' : ''}`}>
                <div className="avatar sm" data-h={m.me ? 3 : ticket.h}>{m.from.split(' ').map(n=>n[0]).join('')}</div>
                <div>
                  <div style={{ fontSize: 11.5, color:'var(--ink-4)', marginBottom:4, textAlign: m.me ? 'right' : 'left' }}>{m.from} · {m.time}</div>
                  <div className="body" style={{ whiteSpace:'pre-wrap' }}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="tv-foot">
            <textarea className="textarea" placeholder="Write a reply…" value={reply} onChange={e=>setReply(e.target.value)} style={{ minHeight: 44, flex:1 }} onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}/>
            <button className="btn primary" onClick={send}><Ico name="send" size={13}/> Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrdersPage, AnalyticsPage, NotificationsPage, AuditPage, SettingsPage, AuthPage, TicketsPage });

// app.jsx — Main App shell + routing + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 255,
  "fontPair": "modern",
  "sidebarCollapsed": false,
  "theme": "system"
}/*EDITMODE-END*/;

const FONT_PAIRS = {
  modern: { sans: "'Inter Tight', ui-sans-serif, system-ui, sans-serif", display: "'Fraunces', Georgia, serif", label: 'Inter Tight + Fraunces' },
  classic: { sans: "'Manrope', ui-sans-serif, system-ui, sans-serif", display: "'Playfair Display', Georgia, serif", label: 'Manrope + Playfair' },
  technical: { sans: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif", display: "'IBM Plex Serif', Georgia, serif", label: 'IBM Plex pair' },
  humanist: { sans: "'DM Sans', ui-sans-serif, system-ui, sans-serif", display: "'DM Serif Display', Georgia, serif", label: 'DM Sans + DM Serif' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(t.sidebarCollapsed);
  const [theme, setTheme] = React.useState(() => {
    if (t.theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return t.theme;
  });
  const [notifDrawer, setNotifDrawer] = React.useState(false);
  const [profileDrawer, setProfileDrawer] = React.useState(false);

  React.useEffect(() => { setCollapsed(t.sidebarCollapsed); }, [t.sidebarCollapsed]);
  React.useEffect(() => {
    if (t.theme === 'system') setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    else setTheme(t.theme);
  }, [t.theme]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-h', t.accentHue);
    const fp = FONT_PAIRS[t.fontPair] || FONT_PAIRS.modern;
    document.documentElement.style.setProperty('--font-sans', fp.sans);
    document.documentElement.style.setProperty('--font-display', fp.display);
  }, [theme, t.accentHue, t.fontPair]);

  const unread = window.CH_DATA.NOTIFICATIONS.filter(n => !n.read).length;

  // Auth page is full-bleed
  if (page === 'auth') {
    return (
      <>
        <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
          <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--line-1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', color:'var(--ink-4)', fontSize:12 }}>
              <button className="btn sm" onClick={() => setPage('dashboard')}><Ico name="chevL" size={12}/> Back to app</button>
              <span>Preview of the authentication flow</span>
            </div>
            <button className="tb-icon-btn" onClick={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next); setTweak('theme', next);
            }}>
              <Ico name={theme === 'dark' ? 'sun' : 'moon'} size={17}/>
            </button>
          </div>
          <AuthPage/>
        </div>
        <TweaksUI t={t} setTweak={setTweak}/>
      </>
    );
  }

  const Page = {
    dashboard: DashboardPage,
    users: UsersPage,
    roles: RolesPage,
    resources: ResourcesPage,
    orders: OrdersPage,
    analytics: AnalyticsPage,
    notifications: NotificationsPage,
    audit: AuditPage,
    settings: SettingsPage,
    tickets: TicketsPage,
  }[page] || DashboardPage;

  return (
    <>
      <div className={`app ${collapsed ? 'collapsed' : ''}`}>
        <Sidebar
          current={page}
          onNav={(id) => setPage(id)}
          collapsed={collapsed}
          onToggle={() => { const n = !collapsed; setCollapsed(n); setTweak('sidebarCollapsed', n); }}
        />
        <div className="main">
          <Topbar
            page={page}
            theme={theme}
            onTheme={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); setTweak('theme', next); }}
            onNotifs={() => setNotifDrawer(true)}
            onProfile={() => setProfileDrawer(true)}
            unread={unread}
          />
          <div className="page" data-screen-label={page}>
            <Page onOpenDrawer={() => setNotifDrawer(true)} />
          </div>
        </div>
      </div>

      <Drawer open={notifDrawer} onClose={() => setNotifDrawer(false)}
        title="Notifications" subtitle={`${unread} unread`}
        footer={<><button className="btn" onClick={() => setNotifDrawer(false)}>Close</button><button className="btn primary" onClick={() => { setNotifDrawer(false); setPage('notifications'); }}>View all</button></>}>
        <div className="feed" style={{ marginLeft: -24, marginRight: -24 }}>
          {window.CH_DATA.NOTIFICATIONS.slice(0,5).map(n => (
            <div className="feed-item" key={n.id}>
              <div className="f-dot" style={{ background: n.type === 'alert' ? 'var(--danger-soft)' : 'var(--accent-soft)', color: n.type === 'alert' ? 'var(--danger)' : 'var(--accent-ink)' }}><Ico name={n.ico} size={14}/></div>
              <div className="f-main">
                <strong>{n.title}</strong>
                <div className="xs muted" style={{ marginTop: 2, lineHeight:1.5 }}>{n.body}</div>
                <div className="f-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>

      <Drawer open={profileDrawer} onClose={() => setProfileDrawer(false)} title="Your profile" subtitle="Amelia Chen · Administrator"
        footer={<><button className="btn" onClick={() => setProfileDrawer(false)}>Close</button><button className="btn" onClick={() => { setProfileDrawer(false); setPage('auth'); }}><Ico name="arrowR" size={13}/> Sign out</button></>}>
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div className="avatar xl" data-h="3">AC</div>
            <div>
              <div style={{ fontWeight:550, fontSize:16 }}>Amelia Chen</div>
              <div className="small muted">amelia.chen@northwind.io</div>
              <div className="row" style={{ marginTop: 6 }}><span className="chip good"><Ico name="shield" size={10}/> MFA</span><span className="chip accent">Admin</span></div>
            </div>
          </div>
          {['Account settings', 'Security & MFA', 'API keys', 'Notification preferences', 'Keyboard shortcuts'].map(l => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, border:'1px solid var(--line-1)', cursor:'pointer' }}>
              <span>{l}</span><Ico name="chevR" size={14} style={{color:'var(--ink-4)'}}/>
            </div>
          ))}
        </div>
      </Drawer>

      <TweaksUI t={t} setTweak={setTweak}/>
    </>
  );
}

function TweaksUI({ t, setTweak }) {
  const accentOptions = [
    { h: 255, label: 'Indigo' },
    { h: 220, label: 'Blue' },
    { h: 145, label: 'Green' },
    { h: 30, label: 'Amber' },
    { h: 305, label: 'Magenta' },
    { h: 5, label: 'Red' },
  ];
  return (
    <TweaksPanel>
      <TweakSection label="Accent color"/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:6 }}>
        {accentOptions.map(o => (
          <button key={o.h} onClick={() => setTweak('accentHue', o.h)} title={o.label}
            style={{
              height: 30, borderRadius: 8, border: t.accentHue === o.h ? '2px solid var(--ink-1)' : '1px solid rgba(0,0,0,0.1)',
              background: `oklch(0.55 0.18 ${o.h})`, cursor: 'pointer', padding: 0,
            }}/>
        ))}
      </div>
      <TweakSection label="Typography"/>
      <TweakRadio label="Font pair" value={t.fontPair}
        options={Object.keys(FONT_PAIRS).map(k => ({ value: k, label: FONT_PAIRS[k].label.split(' ')[0] }))}
        onChange={v => setTweak('fontPair', v)} />
      <TweakSection label="Theme"/>
      <TweakRadio label="Appearance" value={t.theme}
        options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'},{value:'system',label:'System'}]}
        onChange={v => setTweak('theme', v)}/>
      <TweakSection label="Layout"/>
      <TweakToggle label="Sidebar collapsed" value={t.sidebarCollapsed} onChange={v => setTweak('sidebarCollapsed', v)}/>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

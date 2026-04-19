import { useAuth } from '../context/AuthContext'

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth()
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <nav style={s.nav}>
      <div style={s.logo}>
        <div style={s.logoMark}>R</div>
        <span style={s.logoText}>ResumeAI</span>
      </div>

      <div style={s.links}>
        {[
          { id: 'analyze',   icon: '⬡', label: 'Analyze'   },
          { id: 'rewrite',   icon: '✦', label: 'Rewriter'  },
          { id: 'dashboard', icon: '◈', label: 'Dashboard' },
        ].map(l => (
          <button
            key={l.id}
            onClick={() => setPage(l.id)}
            style={{ ...s.link, ...(page === l.id ? s.active : {}) }}
          >
            <span style={s.linkIcon}>{l.icon}</span> {l.label}
            {page === l.id && <span style={s.dot} />}
          </button>
        ))}
      </div>

      <div style={s.right}>
        <div style={s.avatar}>{initials}</div>
        <div>
          <div style={s.name}>{user?.name || 'User'}</div>
          <div style={s.email}>{user?.email}</div>
        </div>
        <button onClick={logout} style={s.logout} title="Sign out">↩ Sign out</button>
      </div>
    </nav>
  )
}

const s = {
  nav: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'0 2rem', height:60,
    background:'rgba(8,6,18,0.9)', backdropFilter:'blur(20px)',
    borderBottom:'1px solid var(--border)',
    position:'sticky', top:0, zIndex:100,
  },
  logo:     { display:'flex', alignItems:'center', gap:10 },
  logoMark: {
    width:32, height:32, borderRadius:9,
    background:'linear-gradient(135deg,#7c5cfc,#c084fc)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, color:'#fff',
  },
  logoText: { fontFamily:'var(--font-display)', fontWeight:800, fontSize:16, color:'var(--text)' },
  links:    { display:'flex', gap:2 },
  link: {
    background:'none', border:'none', color:'var(--text3)',
    fontSize:13, fontWeight:500, padding:'7px 14px', borderRadius:8,
    transition:'all .2s', position:'relative', display:'flex', alignItems:'center', gap:6,
  },
  active:   { color:'var(--text)', background:'rgba(124,92,252,0.13)' },
  linkIcon: { fontSize:12 },
  dot: {
    position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)',
    width:4, height:4, borderRadius:'50%', background:'var(--accent)', display:'block',
  },
  right:  { display:'flex', alignItems:'center', gap:12 },
  avatar: {
    width:32, height:32, borderRadius:'50%',
    background:'linear-gradient(135deg,#7c5cfc,#c084fc)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:12, fontWeight:700, color:'#fff', flexShrink:0,
  },
  name:   { fontSize:13, fontWeight:600, lineHeight:1.3 },
  email:  { fontSize:11, color:'var(--text3)', lineHeight:1.3 },
  logout: {
    background:'none', border:'1px solid var(--border)',
    color:'var(--text3)', borderRadius:7, padding:'5px 12px',
    fontSize:12, transition:'all .2s',
  },
}
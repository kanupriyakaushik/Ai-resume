import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { login, user } = useAuth()
  const [isLogin, setIsLogin]         = useState(true)
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const switchMode = () => { setIsLogin(v => !v); setError(''); setName('') }

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) return setError('Please fill in all fields.')
    if (!isLogin && !name)   return setError('Please enter your name.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    try {
      setLoading(true)
      const url  = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email, password } : { name, email, password }
      const res  = await axios.post(url, body)
      login(res.data.user, res.data.token)
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={s.card} className="fade-up">
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoMark}>R</div>
          <span style={s.logoText}>ResumeAI</span>
        </div>

        <h2 style={s.heading}>{isLogin ? 'Welcome back 👋' : 'Create account 🚀'}</h2>
        <p style={s.sub}>{isLogin ? 'Log in to analyze your resume.' : 'Sign up and supercharge your job search.'}</p>

        {/* Tabs */}
        <div style={s.tabs}>
          {['Log in', 'Sign up'].map((label, i) => (
            <button
              key={label}
              style={{ ...s.tab, ...(isLogin === (i === 0) ? s.tabActive : {}) }}
              onClick={() => { setIsLogin(i === 0); setError(''); setName('') }}
            >{label}</button>
          ))}
        </div>

        {/* Name (register only) */}
        {!isLogin && (
          <div style={s.field}>
            <label style={s.label}>Full name</label>
            <input style={s.input} placeholder="John Smith" value={name}
              onChange={e => { setName(e.target.value); setError('') }} />
          </div>
        )}

        {/* Email */}
        <div style={s.field}>
          <label style={s.label}>Email address</label>
          <input style={s.input} type="email" placeholder="you@example.com" value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        {/* Password */}
        <div style={s.field}>
          <label style={s.label}>Password</label>
          <div style={{ position:'relative' }}>
            <input
              style={{ ...s.input, paddingRight:44 }}
              type={showPass ? 'text' : 'password'}
              placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button style={s.eye} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={s.error}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Submit */}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading
            ? <span style={s.spinRow}><span style={s.spinner} /> Please wait…</span>
            : isLogin ? 'Log in →' : 'Create account →'}
        </button>

        <p style={s.switchText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button style={s.switchLink} onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'#0a0718', fontFamily:'var(--font-body)', padding:24,
    position:'relative', overflow:'hidden',
  },
  blob1: {
    position:'absolute', width:500, height:500, borderRadius:'50%', pointerEvents:'none',
    background:'radial-gradient(circle,rgba(124,92,252,0.3),transparent 70%)', top:-150, left:-120,
  },
  blob2: {
    position:'absolute', width:400, height:400, borderRadius:'50%', pointerEvents:'none',
    background:'radial-gradient(circle,rgba(192,132,252,0.2),transparent 70%)', bottom:-100, right:-80,
  },
  card: {
    position:'relative', width:'100%', maxWidth:420,
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
    backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
    borderRadius:20, padding:'40px 36px',
    boxShadow:'0 24px 80px rgba(0,0,0,0.5)', color:'#fff',
  },
  logoRow:  { display:'flex', alignItems:'center', gap:10, marginBottom:22 },
  logoMark: {
    width:34, height:34, borderRadius:9, fontSize:17, fontWeight:800,
    background:'linear-gradient(135deg,#7c5cfc,#c084fc)',
    display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
    fontFamily:'var(--font-display)',
  },
  logoText: { fontFamily:'var(--font-display)', fontWeight:800, fontSize:17 },
  heading:  { fontSize:24, fontWeight:700, marginBottom:6 },
  sub:      { fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:24, lineHeight:1.5 },
  tabs: {
    display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:10,
    padding:4, marginBottom:22, gap:4,
  },
  tab: {
    flex:1, padding:'8px 0', border:'none', background:'transparent',
    borderRadius:8, fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.4)', cursor:'pointer',
  },
  tabActive: { background:'rgba(255,255,255,0.12)', color:'#fff' },
  field:    { display:'flex', flexDirection:'column', gap:6, marginBottom:16 },
  label:    { fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.65)' },
  input: {
    width:'100%', padding:'11px 14px', background:'rgba(255,255,255,0.07)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:10,
    fontSize:14, color:'#fff', boxSizing:'border-box',
  },
  eye: {
    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
    background:'none', border:'none', cursor:'pointer', fontSize:16, opacity:.7,
  },
  error: {
    display:'flex', alignItems:'center', gap:8,
    background:'rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.3)',
    color:'#fca5a5', borderRadius:10, padding:'10px 14px', fontSize:13, marginBottom:16,
  },
  btn: {
    width:'100%', padding:13,
    background:'linear-gradient(135deg,#7c5cfc,#a855f7)',
    color:'#fff', border:'none', borderRadius:10,
    fontSize:15, fontWeight:600, marginBottom:16,
    boxShadow:'0 4px 24px rgba(124,92,252,0.35)',
  },
  spinRow:  { display:'flex', alignItems:'center', justifyContent:'center', gap:10 },
  spinner:  { width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' },
  switchText: { textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.4)', margin:0 },
  switchLink: { background:'none', border:'none', color:'#a78bfa', fontWeight:600, fontSize:13, cursor:'pointer', padding:0 },
}
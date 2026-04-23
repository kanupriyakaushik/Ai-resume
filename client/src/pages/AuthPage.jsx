import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function AuthPage() {
  const { login } = useAuth()
  const [isLogin, setIsLogin]   = useState(true)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

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
      const res  = await axios.post(`${API_BASE}${url}`, body)
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
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...s.input, paddingRight: 44 }}
              type={showPass ? 'text' : 'password'}
              placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button
              style={s.eyeBtn}
              onClick={() => setShowPass(v => !v)}
              type="button"
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div style={s.error}>⚠ {error}</div>}

        {/* Submit */}
        <button
          style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait…' : isLogin ? 'Log in →' : 'Create account →'}
        </button>

        <p style={s.footer}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span style={s.link} onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  )
}

/* ── Styles ── */
const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    fontFamily: "'Inter','Segoe UI',sans-serif",
    overflow: 'hidden',
    position: 'relative',
  },
  blob1: {
    position: 'absolute', width: 420, height: 420, borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(139,92,246,.35),transparent 70%)',
    top: -100, left: -100, pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', width: 320, height: 320, borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(59,130,246,.25),transparent 70%)',
    bottom: -80, right: -80, pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: '40px 36px',
    width: '100%', maxWidth: 420,
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    color: '#fff',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoMark: {
    width: 38, height: 38, borderRadius: 10,
    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 18, color: '#fff',
  },
  logoText: { fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' },
  heading: { margin: '0 0 6px', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' },
  sub: { margin: '0 0 24px', fontSize: 14, color: 'rgba(255,255,255,0.55)' },
  tabs: {
    display: 'flex', background: 'rgba(255,255,255,0.07)',
    borderRadius: 12, padding: 4, marginBottom: 24, gap: 4,
  },
  tab: {
    flex: 1, padding: '9px 0', border: 'none', borderRadius: 9,
    background: 'transparent', color: 'rgba(255,255,255,0.5)',
    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all .2s',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.13)', color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15,
    outline: 'none', boxSizing: 'border-box', transition: 'border .2s',
  },
  eyeBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, lineHeight: 1,
    padding: 4,
  },
  error: {
    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
    color: '#fca5a5', borderRadius: 10, padding: '10px 14px',
    fontSize: 13, marginBottom: 16,
  },
  submitBtn: {
    width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
    color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(139,92,246,0.45)', transition: 'opacity .2s',
    marginBottom: 20,
  },
  footer: { textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 },
  link: { color: '#a78bfa', cursor: 'pointer', fontWeight: 600 },
}
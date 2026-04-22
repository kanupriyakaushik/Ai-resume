import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || ''

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
          <div style={{ position:'relative' }}>
            <input
              style={{ ...s.input, paddingRight:44 }}
              type={showPass ? 'text' : 'password'}
              placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button sty
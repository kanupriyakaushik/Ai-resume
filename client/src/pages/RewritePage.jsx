import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function RewritePage() {
  const { token } = useAuth()
  const [bullets, setBullets]   = useState('')
  const [jobDesc, setJobDesc]   = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState(null)

  const rewrite = async () => {
    if (!bullets.trim() || !jobDesc.trim())
      return setError('Please provide both bullet points and a job description.')
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bulletPoints: bullets, jobDescription: jobDesc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Rewrite failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    copy(result.rewritten.map(r => r.improved).join('\n'), 'all')
  }

  return (
    <div style={s.page}>
      <div style={s.blob} />
      <div style={s.inner}>

        {/* Header */}
        <div style={s.header} className="fade-up">
          <h1 style={s.title}>Resume Rewriter</h1>
          <p style={s.sub}>Paste weak bullet points → AI rewrites them to be powerful, metrics-driven, and ATS-optimized</p>
        </div>

        <div style={s.grid}>
          {/* Left inputs */}
          <div style={s.left}>
            <div style={s.card} className="fade-up-1">
              <label style={s.label}><span style={s.badge}>01</span> Your current bullet points</label>
              <p style={s.hint}>One bullet per line</p>
              <textarea
                value={bullets}
                onChange={e => setBullets(e.target.value)}
                placeholder={'• Built a web application using React\n• Worked on backend APIs\n• Fixed bugs and improved performance'}
                rows={8}
                style={s.textarea}
              />
            </div>

            <div style={s.card} className="fade-up-2">
              <label style={s.label}><span style={s.badge}>02</span> Target job description</label>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description so AI can tailor your bullets…"
                rows={6}
                style={s.textarea}
              />
            </div>

            {error && <div style={s.errorBox}>⚠️ &nbsp;{error}</div>}

            <button
              onClick={rewrite}
              disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              className="fade-up-3"
            >
              {loading ? <><span style={s.spinner} /> Rewriting with AI…</> : '✦ Rewrite Bullet Points'}
            </button>
          </div>

          {/* Right results */}
          <div style={s.right}>
            {!result && !loading && (
              <div style={s.placeholder} className="fade-up-2">
                <div style={s.placeholderIcon}>✦</div>
                <p style={s.placeholderTitle}>See the transformation</p>
                <p style={s.placeholderSub}>Your rewritten bullets will appear here — stronger, quantified, and tailored to the role.</p>
                <div style={s.exampleBox}>
                  <p style={{ fontSize:12, color:'#f87171', marginBottom:10, lineHeight:1.5 }}>✗ &nbsp;"Worked on a React application"</p>
                  <p style={{ fontSize:12, color:'var(--text3)', marginBottom:10, textAlign:'center' }}>↓ AI transforms to</p>
                  <p style={{ fontSize:12, color:'#34d399', lineHeight:1.6 }}>✓ &nbsp;"Engineered a React dashboard serving 10K+ users, cutting load time by 40% via code splitting and lazy loading"</p>
                </div>
              </div>
            )}

            {loading && (
              <div style={s.loadingBox}>
                <div style={s.loadingRing} />
                <p style={s.loadingText}>Rewriting your bullets…</p>
                <p style={s.loadingHint}>Tailoring to the job description</p>
              </div>
            )}

            {result && (
              <div className="fade-up">
                {/* Header row */}
                <div style={s.resultHeader}>
                  <h3 style={s.resultTitle}>
                    Rewritten Bullets
                    <span style={s.countBadge}>{result.rewritten?.length} bullets</span>
                  </h3>
                  <button style={s.copyAllBtn} onClick={copyAll}>
                    {copied === 'all' ? '✓ Copied!' : '⎘ Copy all'}
                  </button>
                </div>

                {/* Bullet cards */}
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {result.rewritten?.map((item, i) => (
                    <div key={i} style={s.bulletCard}>
                      {/* Before */}
                      <div>
                        <span style={s.tagBefore}>Before</span>
                        <p style={s.textBefore}>{item.original}</p>
                      </div>
                      {/* Arrow */}
                      <div style={s.arrowRow}>
                        <div style={s.arrowLine} />
                        <span style={{ fontSize:16, color:'var(--text3)' }}>↓</span>
                        <div style={s.arrowLine} />
                      </div>
                      {/* After */}
                      <div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                          <span style={s.tagAfter}>After</span>
                          <button style={s.copyBtn} onClick={() => copy(item.improved, i)}>
                            {copied === i ? '✓ Copied' : '⎘ Copy'}
                          </button>
                        </div>
                        <p style={s.textAfter}>{item.improved}</p>
                        <p style={s.reason}>💡 {item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div style={s.tipsCard}>
                    <h4 style={s.tipsTitle}>✦ Pro Tips</h4>
                    {result.tips.map((tip, i) => (
                      <p key={i} style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>• {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}

const s = {
  page:  { padding:'2.5rem 2rem', position:'relative', minHeight:'calc(100vh - 60px)' },
  blob:  { position:'fixed', top:'30%', right:'20%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.06),transparent 70%)', pointerEvents:'none' },
  inner: { maxWidth:1300, margin:'0 auto' },
  header:{ marginBottom:'2rem' },
  title: { fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, letterSpacing:'-0.5px', marginBottom:8 },
  sub:   { fontSize:14, color:'var(--text2)', maxWidth:520, lineHeight:1.6 },
  grid:  { display:'grid', gridTemplateColumns:'380px 1fr', gap:'2rem', alignItems:'start' },
  left:  { display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:80 },
  right: { minHeight:400 },
  card:  { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem', display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 },
  badge: { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, padding:'2px 7px', fontSize:10, color:'var(--accent2)', fontFamily:'var(--font-mono)' },
  hint:  { fontSize:12, color:'var(--text3)' },
  textarea:{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'10px 12px', color:'var(--text)', fontSize:13, width:'100%', lineHeight:1.6 },
  errorBox:{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', color:'#fca5a5', borderRadius:'var(--radius-sm)', padding:'10px 14px', fontSize:13 },
  btn: {
    background:'linear-gradient(135deg,#7c5cfc,#a855f7)', border:'none',
    borderRadius:'var(--radius-sm)', padding:14, color:'#fff',
    fontSize:15, fontWeight:700, fontFamily:'var(--font-display)',
    display:'flex', alignItems:'center', justifyContent:'center', gap:10,
    boxShadow:'0 4px 24px rgba(124,92,252,0.35)',
  },
  spinner: { width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' },

  placeholder:     { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'3rem 2rem', textAlign:'center' },
  placeholderIcon: { fontSize:40, color:'var(--accent)', marginBottom:16 },
  placeholderTitle:{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, marginBottom:8 },
  placeholderSub:  { fontSize:13, color:'var(--text2)', lineHeight:1.6, maxWidth:400, margin:'0 auto 1.5rem' },
  exampleBox:      { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1.25rem', textAlign:'left' },
  loadingBox:      { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, gap:16 },
  loadingRing:     { width:50, height:50, border:'3px solid var(--bg3)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .9s linear infinite' },
  loadingText:     { fontFamily:'var(--font-display)', fontSize:18, fontWeight:700 },
  loadingHint:     { fontSize:13, color:'var(--text3)', animation:'pulse 2s ease infinite' },

  resultHeader:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' },
  resultTitle: { fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, display:'flex', alignItems:'center', gap:10 },
  countBadge:  { fontSize:12, fontWeight:500, color:'var(--text3)', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:99, padding:'2px 10px', fontFamily:'var(--font-body)' },
  copyAllBtn:  { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', color:'var(--text2)', fontSize:12, fontWeight:500 },
  bulletCard:  { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem', display:'flex', flexDirection:'column', gap:10 },
  tagBefore:   { fontSize:11, fontWeight:600, color:'#f87171', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:4, padding:'2px 8px', display:'inline-block', marginBottom:8 },
  textBefore:  { fontSize:13, color:'var(--text3)', textDecoration:'line-through', lineHeight:1.6 },
  arrowRow:    { display:'flex', alignItems:'center', gap:8 },
  arrowLine:   { flex:1, height:1, background:'var(--border)' },
  tagAfter:    { fontSize:11, fontWeight:600, color:'#34d399', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:4, padding:'2px 8px', display:'inline-block' },
  copyBtn:     { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 10px', color:'var(--text2)', fontSize:11 },
  textAfter:   { fontSize:13, color:'#34d399', lineHeight:1.7, marginBottom:8 },
  reason:      { fontSize:12, color:'var(--text3)', lineHeight:1.5 },
  tipsCard:    { background:'rgba(124,92,252,0.06)', border:'1px solid rgba(124,92,252,0.15)', borderRadius:'var(--radius)', padding:'1.25rem', marginTop:'1rem' },
  tipsTitle:   { fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--accent2)', marginBottom:10 },
}
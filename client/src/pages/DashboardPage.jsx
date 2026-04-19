import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const STATS_STATIC = [
  { label: 'Analyses',  icon: '📄', key: 'count' },
  { label: 'Avg Score', icon: '⚡', key: 'avg'   },
  { label: 'ATS Avg',   icon: '🎯', key: 'ats'   },
  { label: 'Best Score',icon: '🏆', key: 'best'  },
]

function ScoreRing({ score }) {
  const r = 28, circ = 2 * Math.PI * r
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'
  return (
    <svg width={70} height={70} style={{ flexShrink:0 }}>
      <circle cx={35} cy={35} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
      <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" transform="rotate(-90 35 35)" />
      <text x={35} y={40} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={700}>{score}</text>
    </svg>
  )
}

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/analyze/history', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setError('Could not load history.'); setLoading(false) })
  }, [])

  const stats = {
    count: history.length,
    avg:   history.length ? Math.round(history.reduce((a, h) => a + (h.overallScore || 0), 0) / history.length) : 0,
    ats:   history.length ? Math.round(history.reduce((a, h) => a + (h.atsScore || 0), 0) / history.length) : 0,
    best:  history.length ? Math.max(...history.map(h => h.overallScore || 0)) : 0,
  }

  const scoreColor = v => v >= 75 ? '#34d399' : v >= 50 ? '#fbbf24' : '#f87171'
  const scoreLabel = v => v >= 75 ? 'Strong' : v >= 50 ? 'Moderate' : 'Needs Work'

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.inner}>

        {/* Header */}
        <div style={s.topBar} className="fade-up">
          <div>
            <h1 style={s.title}>Dashboard</h1>
            <p style={s.sub}>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</p>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid} className="fade-up-1">
          {STATS_STATIC.map(c => (
            <div key={c.label} style={s.statCard}>
              <span style={s.statIcon}>{c.icon}</span>
              <div style={s.statVal}>{loading ? '…' : stats[c.key]}{c.key === 'avg' || c.key === 'ats' || c.key === 'best' ? '' : ''}</div>
              <div style={s.statLabel}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* History list */}
        <h2 style={s.sectionTitle} className="fade-up-2">Recent Analyses</h2>

        {loading && (
          <div style={s.emptyBox}>
            <div style={s.loadRing} />
            <p style={{ color:'var(--text3)', fontSize:14 }}>Loading history…</p>
          </div>
        )}

        {!loading && error && (
          <div style={s.emptyBox}>
            <p style={{ color:'#f87171', fontSize:14 }}>{error}</p>
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div style={s.emptyBox}>
            <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
            <p style={s.emptyTitle}>No analyses yet</p>
            <p style={s.emptySub}>Upload a resume on the Analyze tab to get started.</p>
          </div>
        )}

        {!loading && history.length > 0 && (
          <div style={s.list} className="fade-up-2">
            {history.map(item => (
              <div key={item._id}>
                <div
                  style={{ ...s.card, ...(expanded === item._id ? s.cardOpen : {}) }}
                  onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                >
                  <ScoreRing score={item.overallScore || 0} />
                  <div style={{ flex:1 }}>
                    <div style={s.resumeName}>{item.fileName || 'resume.pdf'}</div>
                    <div style={s.resumeDate}>{new Date(item.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                    <div style={s.tagRow}>
                      <span style={{ ...s.scoreTag, color: scoreColor(item.atsScore), background: scoreColor(item.atsScore) + '18', border:`1px solid ${scoreColor(item.atsScore)}30` }}>
                        ATS: {item.atsScore}
                      </span>
                      {item.matchScore > 0 && (
                        <span style={{ ...s.scoreTag, color:'#a78bfa', background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.25)' }}>
                          Match: {item.matchScore}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ ...s.statusBadge, color: scoreColor(item.overallScore), background: scoreColor(item.overallScore)+'18', border:`1px solid ${scoreColor(item.overallScore)}30` }}>
                    {scoreLabel(item.overallScore)}
                  </span>
                  <span style={s.chevron}>{expanded === item._id ? '▲' : '▼'}</span>
                </div>

                {expanded === item._id && (
                  <div style={s.detail}>
                    {item.verdict && (
                      <div style={s.verdictBox}>
                        <span style={{ color:'var(--accent)', marginRight:8 }}>◎</span>
                        <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{item.verdict}</p>
                      </div>
                    )}
                    {item.strengths?.length > 0 && (
                      <div style={s.detailSection}>
                        <p style={{ fontSize:12, fontWeight:600, color:'#34d399', marginBottom:6 }}>✓ Strengths</p>
                        {item.strengths.map((st, i) => <p key={i} style={s.detailItem}>• {st}</p>)}
                      </div>
                    )}
                    {item.improvements?.length > 0 && (
                      <div style={s.detailSection}>
                        <p style={{ fontSize:12, fontWeight:600, color:'#fbbf24', marginBottom:6 }}>↑ Improvements</p>
                        {item.improvements.map((im, i) => <p key={i} style={s.detailItem}>• {im}</p>)}
                      </div>
                    )}
                    {item.missingKeywords?.length > 0 && (
                      <div>
                        <p style={{ fontSize:12, fontWeight:600, color:'#f87171', marginBottom:8 }}>⚠ Missing Keywords</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                          {item.missingKeywords.map((k, i) => (
                            <span key={i} style={s.kwTag}>{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const s = {
  page:    { padding:'2.5rem 2rem', position:'relative', minHeight:'calc(100vh - 60px)' },
  blob1:   { position:'fixed', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,92,252,0.07),transparent 70%)', top:-150, left:-120, pointerEvents:'none' },
  blob2:   { position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.06),transparent 70%)', bottom:-80, right:-60, pointerEvents:'none' },
  inner:   { maxWidth:900, margin:'0 auto' },
  topBar:  { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' },
  title:   { fontFamily:'var(--font-display)', fontWeight:800, fontSize:30, letterSpacing:'-0.5px', marginBottom:4 },
  sub:     { fontSize:14, color:'var(--text2)' },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' },
  statCard:  { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:4 },
  statIcon:  { fontSize:22, marginBottom:4 },
  statVal:   { fontFamily:'var(--font-display)', fontWeight:800, fontSize:28, letterSpacing:'-1px' },
  statLabel: { fontSize:12, color:'var(--text3)' },

  sectionTitle: { fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, marginBottom:12, color:'var(--text2)' },
  list:  { display:'flex', flexDirection:'column', gap:8 },
  card:  { display:'flex', alignItems:'center', gap:16, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px 18px', cursor:'pointer', transition:'border .2s' },
  cardOpen: { border:'1px solid rgba(124,92,252,0.4)', background:'rgba(124,92,252,0.06)' },

  resumeName:  { fontWeight:600, fontSize:14, marginBottom:2 },
  resumeDate:  { fontSize:12, color:'var(--text3)', marginBottom:6 },
  tagRow:      { display:'flex', gap:6, flexWrap:'wrap' },
  scoreTag:    { fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:500, fontFamily:'var(--font-mono)' },
  statusBadge: { fontSize:11, padding:'3px 10px', borderRadius:20, fontWeight:600, whiteSpace:'nowrap' },
  chevron:     { fontSize:10, color:'var(--text3)', marginLeft:4 },

  detail:       { background:'rgba(124,92,252,0.06)', border:'1px solid rgba(124,92,252,0.18)', borderRadius:'0 0 var(--radius) var(--radius)', padding:'1.25rem 1.5rem', marginTop:-6, display:'flex', flexDirection:'column', gap:14 },
  verdictBox:   { display:'flex', alignItems:'flex-start', gap:6 },
  detailSection:{ display:'flex', flexDirection:'column', gap:0 },
  detailItem:   { fontSize:13, color:'var(--text2)', lineHeight:1.7 },
  kwTag:        { fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(248,113,113,0.1)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)' },

  emptyBox:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, gap:12, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)' },
  emptyTitle:{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700 },
  emptySub:  { fontSize:13, color:'var(--text3)' },
  loadRing:  { width:40, height:40, border:'3px solid var(--bg3)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .9s linear infinite' },
}
import ScoreBar from './ScoreBar'

function BigScore({ label, value, color }) {
  return (
    <div style={s.bigCard}>
      <p style={s.bigLabel}>{label}</p>
      <p style={{ ...s.bigVal, color }}>{value ?? '—'}</p>
      <p style={s.bigOut}>/100</p>
    </div>
  )
}

function Tag({ text, type }) {
  const c = type === 'good'
    ? { bg:'rgba(52,211,153,0.1)', color:'#34d399', border:'rgba(52,211,153,0.25)' }
    : { bg:'rgba(248,113,113,0.1)', color:'#f87171', border:'rgba(248,113,113,0.25)' }
  return (
    <span style={{
      background:c.bg, color:c.color, border:`1px solid ${c.border}`,
      borderRadius:99, padding:'4px 12px', fontSize:12, fontWeight:500,
    }}>{text}</span>
  )
}

export default function ResultSection({ result }) {
  const color = v => v >= 75 ? '#34d399' : v >= 50 ? '#fbbf24' : '#f87171'

  return (
    <div style={s.wrap} className="fade-up">
      {/* Top scores */}
      <div style={s.scoreRow}>
        <BigScore label="Overall Score" value={result.overallScore} color={color(result.overallScore)} />
        <BigScore label="Job Match"     value={result.matchScore}   color={color(result.matchScore)} />
        <BigScore label="ATS Score"     value={result.atsScore}     color={color(result.atsScore)} />
      </div>

      {/* Verdict */}
      <div style={s.verdict}>
        <span style={s.verdictIcon}>◎</span>
        <p style={s.verdictText}>{result.verdict}</p>
      </div>

      {/* Section bars */}
      <div style={s.card}>
        <h3 style={s.cardTitle}>Section Analysis</h3>
        {Object.entries(result.sections || {}).map(([key, val]) => (
          <ScoreBar
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            score={val.score}
            feedback={val.feedback}
          />
        ))}
      </div>

      {/* Strengths + Improvements */}
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, color:'#34d399' }}>✓ Strengths</h3>
          <ul style={s.list}>
            {result.strengths?.map((str, i) => (
              <li key={i} style={s.listItem}>
                <span style={{ ...s.dot, background:'#34d399' }} />{str}
              </li>
            ))}
          </ul>
        </div>
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, color:'#fbbf24' }}>↑ Improvements</h3>
          <ul style={s.list}>
            {result.improvements?.map((str, i) => (
              <li key={i} style={s.listItem}>
                <span style={{ ...s.dot, background:'#fbbf24' }} />{str}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing keywords */}
      {result.missingKeywords?.length > 0 && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, color:'#f87171' }}>⚠ Missing Keywords</h3>
          <p style={s.hint}>Add these to improve your ATS score:</p>
          <div style={s.tags}>
            {result.missingKeywords.map((k, i) => <Tag key={i} text={k} type="bad" />)}
          </div>
        </div>
      )}

      {/* Skills to add */}
      {result.sections?.skills?.missing?.length > 0 && (
        <div style={s.card}>
          <h3 style={s.cardTitle}>🛠 Skills to Add</h3>
          <div style={s.tags}>
            {result.sections.skills.missing.map((k, i) => <Tag key={i} text={k} type="bad" />)}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap:      { display:'flex', flexDirection:'column', gap:'1rem', marginTop:'2rem' },
  scoreRow:  { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' },
  bigCard:   { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem', textAlign:'center' },
  bigLabel:  { fontSize:12, color:'var(--text2)', marginBottom:8, fontWeight:500 },
  bigVal:    { fontSize:44, fontWeight:800, fontFamily:'var(--font-display)', lineHeight:1 },
  bigOut:    { fontSize:12, color:'var(--text3)', marginTop:4 },
  verdict:   {
    background:'linear-gradient(135deg,rgba(124,92,252,0.1),rgba(124,92,252,0.04))',
    border:'1px solid rgba(124,92,252,0.2)', borderRadius:'var(--radius)',
    padding:'1.25rem 1.5rem', display:'flex', alignItems:'flex-start', gap:12,
  },
  verdictIcon: { color:'var(--accent)', fontSize:22, flexShrink:0, marginTop:1 },
  verdictText: { fontSize:14, color:'var(--text)', lineHeight:1.7 },
  card:      { background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'1.5rem' },
  cardTitle: { fontFamily:'var(--font-display)', fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:'1.25rem' },
  twoCol:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  list:      { listStyle:'none', display:'flex', flexDirection:'column', gap:10 },
  listItem:  { fontSize:13, color:'var(--text2)', display:'flex', alignItems:'flex-start', gap:8, lineHeight:1.5 },
  dot:       { width:6, height:6, borderRadius:'50%', flexShrink:0, marginTop:5 },
  tags:      { display:'flex', flexWrap:'wrap', gap:8 },
  hint:      { fontSize:12, color:'var(--text3)', marginBottom:12 },
}
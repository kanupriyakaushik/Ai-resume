import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import ResultSection from '../components/ResultSection'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function AnalyzePage() {
  const { token } = useAuth()
  const fileRef = useRef()

  const [file, setFile]         = useState(null)
  const [jobDesc, setJobDesc]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')
  const [dragging, setDragging] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') return setError('Please upload a PDF file.')
    setFile(f); setError(''); setResult(null)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyze = async () => {
    if (!file) return setError('Please upload a resume PDF first.')
    setError(''); setLoading(true); setResult(null)

    try {
      const form = new FormData()
      form.append('resume', file)
      if (jobDesc.trim()) form.append('jobDescription', jobDesc)

      const authToken = token || localStorage.getItem('rz_token') || localStorage.getItem('token')

      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Analysis failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.blob} />
      <div style={s.inner}>

        <div style={s.header} className="fade-up">
          <h1 style={s.title}>Analyze Resume</h1>
          <p style={s.sub}>Upload your PDF and get an instant AI-powered score with actionable feedback</p>
        </div>

        <div style={s.grid}>
          <div style={s.left}>
            <div
              style={{ ...s.dropzone, ...(dragging ? s.dropActive : {}), ...(file ? s.dropFilled : {}) }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={s.fileIcon}>📄</div>
                  <p style={s.fileName}>{file.name}</p>
                  <p style={s.fileSize}>{(file.size / 1024).toFixed(0)} KB · PDF</p>
                  <p style={s.changeFile}>Click to change file</p>
                </>
              ) : (
                <>
                  <div style={s.uploadIcon}>⬆</div>
                  <p style={s.uploadTitle}>Drop your resume here</p>
                  <p style={s.uploadSub}>or click to browse · PDF only</p>
                </>
              )}
            </div>

            <div style={s.card} className="fade-up-1">
              <label style={s.label}>
                <span style={s.labelBadge}>Optional</span>
                Job Description
              </label>
              <p style={s.hint}>Paste the JD for a match score and tailored feedback</p>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste job description here…"
                rows={6}
                style={s.textarea}
              />
            </div>

            {error && <div style={s.errorBox}>⚠️ &nbsp;{error}</div>}

            <button
              style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
              onClick={analyze}
              disabled={loading}
            >
              {loading
                ? <><span style={s.spinner} /> Analyzing with AI…</>
                : '⬡ Analyze My Resume'}
            </button>
          </div>

          <div style={s.right}>
            {!result && !loading && (
              <div style={s.placeholder}>
                <div style={s.placeholderIcon}>◈</div>
                <p style={s.placeholderTitle}>Your analysis will appear here</p>
                <p style={s.placeholderSub}>Upload your resume and click Analyze to get your scores, keyword gaps, and improvement tips.</p>
                <div style={s.exampleCards}>
                  {['Overall Score', 'ATS Score', 'Job Match'].map(label => (
                    <div key={label} style={s.exCard}>
                      <div style={s.exNum}>—</div>
                      <div style={s.exLabel}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div style={s.loadingBox}>
                <div style={s.loadingRing} />
                <p style={s.loadingText}>Analyzing your resume…</p>
                <p style={s.loadingHint}>Reading content · Scoring sections · Building feedback</p>
              </div>
            )}

            {result && <ResultSection result={result} />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </div>
  )
}

const s = {
  page:  { padding: '2.5rem 2rem', position: 'relative', minHeight: 'calc(100vh - 60px)' },
  blob:  { position: 'fixed', top: '20%', right: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,92,252,0.06),transparent 70%)', pointerEvents: 'none' },
  inner: { maxWidth: 1300, margin: '0 auto' },
  header: { marginBottom: '2rem' },
  title: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.5px', marginBottom: 8 },
  sub:   { fontSize: 14, color: 'var(--text2)', maxWidth: 520, lineHeight: 1.6 },
  grid:  { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' },
  left:  { display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 },
  right: { minHeight: 400 },
  dropzone: { border: '2px dashed var(--border2)', borderRadius: 'var(--radius)', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'var(--card)', transition: 'all .2s' },
  dropActive: { borderColor: 'var(--accent)', background: 'rgba(124,92,252,0.08)' },
  dropFilled: { borderColor: 'var(--accent)', borderStyle: 'solid' },
  uploadIcon:  { fontSize: 28, marginBottom: 10, color: 'var(--text3)' },
  uploadTitle: { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  uploadSub:   { fontSize: 13, color: 'var(--text3)' },
  fileIcon:    { fontSize: 32, marginBottom: 8 },
  fileName:    { fontWeight: 600, fontSize: 14, marginBottom: 2, wordBreak: 'break-all' },
  fileSize:    { fontSize: 12, color: 'var(--text3)', marginBottom: 6 },
  changeFile:  { fontSize: 11, color: 'var(--accent2)', textDecoration: 'underline' },
  card:       { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 6 },
  label:      { fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
  labelBadge: { fontSize: 10, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--accent2)', fontFamily: 'var(--font-mono)' },
  hint:       { fontSize: 12, color: 'var(--text3)' },
  textarea:   { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)', fontSize: 13, width: '100%', lineHeight: 1.6 },
  errorBox: { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13 },
  btn: { background: 'linear-gradient(135deg,#7c5cfc,#a855f7)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 14, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 4px 24px rgba(124,92,252,0.35)', cursor: 'pointer' },
  spinner: { width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' },
  placeholder:      { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '3rem 2rem', textAlign: 'center' },
  placeholderIcon:  { fontSize: 40, color: 'var(--accent)', marginBottom: 16 },
  placeholderTitle: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 },
  placeholderSub:   { fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 1.5rem' },
  exampleCards:     { display: 'flex', justifyContent: 'center', gap: 12 },
  exCard:           { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.5rem', minWidth: 100 },
  exNum:            { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text3)', marginBottom: 4 },
  exLabel:          { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' },
  loadingBox:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 },
  loadingRing: { width: 50, height: 50, border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .9s linear infinite' },
  loadingText: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 },
  loadingHint: { fontSize: 13, color: 'var(--text3)', animation: 'pulse 2s ease infinite' },
}
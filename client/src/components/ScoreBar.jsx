export default function ScoreBar({ label, score, feedback }) {
    const color = score >= 75 ? '#43e97b' : score >= 50 ? '#f9d423' : '#ff4e50';
    return (
        <div style={styles.wrap}>
            <div style={styles.top}>
                <span style={styles.label}>{label}</span>
                <span style={{ ...styles.score, color }}>{score}</span>

            </div>
            <div style={styles.track}>
                <div style={{
                    ...styles.bar,
                    width: `${score}%`,
                    background: color,
                    boxShadow: `0 0 10px ${color}40`,
                }} />
                </div>
                {feedback && <p style={styles.feedback}>{feedback}</p>}
         </div>
    )
}
const styles = {
    wrap: { marginBottom: '1.5rem'},
    top: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'},
    label: { color: 'var(--text2)', fontSize: '14px'},
    score: { color: 'var(--text1)', fontSize: '16px', fontWeight: 'bold'},
    track: { height: '10px', background: 'var(--bg2)', borderRadius: '5px', overflow: 'hidden'},
    bar: { height: '100%', borderRadius: '5px'},
    feedback: { color: 'var(--text2)', fontSize: '14px', marginTop: '0.5rem'}
}


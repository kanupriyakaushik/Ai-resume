import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage      from './pages/AuthPage'
import AnalyzePage   from './pages/AnalyzePage'
import RewritePage   from './pages/RewritePage'
import DashboardPage from './pages/DashboardPage'
import Navbar        from './components/Navbar'

function AppContent() {
  const { user, ready } = useAuth()
  const [page, setPage] = useState('analyze')
  if (!ready) return null
  if (!user)  return <AuthPage />
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar page={page} setPage={setPage} />
      {page === 'analyze'   && <AnalyzePage />}
      {page === 'rewrite'   && <RewritePage />}
      {page === 'dashboard' && <DashboardPage />}
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
import { createContext, useContext, useState, useEffect } from 'react'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      // Try both key names for compatibility
      const u = localStorage.getItem('rz_user') || localStorage.getItem('user')
      const t = localStorage.getItem('rz_token') || localStorage.getItem('token')
      if (u && t) { setUser(JSON.parse(u)); setToken(t) }
    } catch { }
    setReady(true)
  }, [])

  const login = (userData, jwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('rz_user',  JSON.stringify(userData))
    localStorage.setItem('rz_token', jwt)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('rz_user')
    localStorage.removeItem('rz_token')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <Ctx.Provider value={{ user, token, login, logout, ready }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
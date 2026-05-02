import { createContext, useContext, useState, useEffect } from 'react'
import API from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password })
    const { access_token, role, user_id, name } = res.data
    localStorage.setItem('token', access_token)
    const userData = { id: user_id, name, role, email }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return role
  }

  const register = async (payload) => {
    const res = await API.post('/api/auth/register', payload)
    return res.data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

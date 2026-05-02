import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Search, Bell, Settings, Command, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Navigation Bar */}
        <header style={{ 
          height: 64, 
          background: 'rgba(10,15,30,0.8)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(51,65,85,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Global Search */}
          <div style={{ flex: 1, maxWidth: 400 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 8,
              background: searchFocused ? 'rgba(30,41,59,0.8)' : 'rgba(30,41,59,0.4)', 
              border: `1px solid ${searchFocused ? 'var(--color-primary)' : 'rgba(51,65,85,0.6)'}`,
              borderRadius: 8, padding: '6px 12px',
              transition: 'all 0.2s',
              boxShadow: searchFocused ? '0 0 0 2px rgba(6,182,212,0.1)' : 'none'
            }}>
              <Search size={16} color={searchFocused ? 'var(--color-primary)' : '#64748b'} />
              <input 
                type="text" 
                placeholder="Search analytics, audits, or reports..." 
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ 
                  background: 'transparent', border: 'none', color: 'var(--color-text)', 
                  fontSize: 13, width: '100%', outline: 'none'
                }} 
              />
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 2, 
                background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)',
                padding: '2px 6px', borderRadius: 4, color: '#94a3b8', fontSize: 10, fontWeight: 600
              }}>
                <Command size={10} /> K
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={toggleTheme} style={{ 
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8, transition: 'background 0.2s'
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(51,65,85,0.4)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button style={{ 
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', 
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8, transition: 'background 0.2s'
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(51,65,85,0.4)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
              <Bell size={18} />
              <div style={{ 
                position: 'absolute', top: 6, right: 6, width: 8, height: 8, 
                background: '#ef4444', borderRadius: '50%', border: '2px solid rgba(10,15,30,1)'
              }} />
            </button>
            <button onClick={() => navigate('/settings')} style={{ 
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8, transition: 'background 0.2s'
            }} onMouseOver={e => e.currentTarget.style.background = 'rgba(51,65,85,0.4)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'} title="Settings">
              <Settings size={18} />
            </button>
            <div style={{ width: 1, height: 24, background: 'rgba(51,65,85,0.6)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
              <div style={{ 
                width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14,
                boxShadow: '0 2px 10px rgba(139,92,246,0.2)', border: '2px solid rgba(51,65,85,0.4)'
              }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

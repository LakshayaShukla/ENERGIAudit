import { Routes as RouterRoutes, Route as RouterRoute, Navigate as RouterNavigate, Link as RouterLink, useLocation as RouterUseLocation, useNavigate as RouterUseNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LogOut, LayoutDashboard, Zap, ClipboardList, TrendingDown, Leaf, Brain, Lightbulb, BarChart3, Calculator, FileText, Bell, Users, Trophy } from 'lucide-react'

// Auth Pages
import Login from './pages/Login'
import Register from './pages/Register'

// Client Pages
import DashboardOverview from './pages/client/DashboardOverview'
import EnergyData from './pages/client/EnergyData'
import Audits from './pages/client/Audits'
import SavingsTracker from './pages/client/SavingsTracker'
import CarbonImpact from './pages/client/CarbonImpact'
import Predictions from './pages/client/Predictions'
import Recommendations from './pages/client/Recommendations'
import Benchmarking from './pages/client/Benchmarking'
import ROICalculator from './pages/client/ROICalculator'
import Reports from './pages/client/Reports'
import Notifications from './pages/client/Notifications'
import Settings from './pages/client/Settings'
import Achievements from './pages/client/Achievements'

// Role Dashboards
import AuditorDashboard from './pages/auditor/AuditorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

// Layout Component
const AppLayout = ({ children }) => {
  const navigate = RouterUseNavigate()
  const location = RouterUseLocation()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token) return <RouterNavigate to="/login" />

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const clientNav = [
    { path: '/client', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { path: '/client/energy', label: 'Energy Data', icon: <Zap size={18} /> },
    { path: '/client/audits', label: 'Audits', icon: <ClipboardList size={18} /> },
    { path: '/client/savings', label: 'Savings', icon: <TrendingDown size={18} /> },
    { path: '/client/carbon', label: 'Carbon Impact', icon: <Leaf size={18} /> },
    { path: '/client/predictions', label: 'Predictions', icon: <Brain size={18} /> },
    { path: '/client/recommendations', label: 'Recommendations', icon: <Lightbulb size={18} /> },
    { path: '/client/benchmark', label: 'Benchmarking', icon: <BarChart3 size={18} /> },
    { path: '/client/roi', label: 'ROI Calculator', icon: <Calculator size={18} /> },
    { path: '/client/reports', label: 'Reports', icon: <FileText size={18} /> },
    { path: '/client/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { path: '/client/badges', label: 'Achievements', icon: <Trophy size={18} /> },
  ]

  const auditorNav = [
    { path: '/auditor', label: 'Auditor Workspace', icon: <ClipboardList size={18} /> },
  ]

  const adminNav = [
    { path: '/admin', label: 'User Management', icon: <Users size={18} /> },
  ]

  const navLinks = user.role === 'admin' ? adminNav : user.role === 'auditor' ? auditorNav : clientNav

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'rgba(15,23,42,0.8)', borderRight: '1px solid rgba(51,65,85,0.5)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
      }}>
        <div style={{ padding: '0 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 18 }}>E</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>EnergiAudit</h1>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <RouterLink key={link.path} to={link.path} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'linear-gradient(90deg, rgba(6,182,212,0.15), transparent)' : 'transparent',
                borderLeft: `3px solid ${isActive ? '#06b6d4' : 'transparent'}`,
                transition: 'all 0.2s',
              }}>
                <span style={{ color: isActive ? '#06b6d4' : '#64748b' }}>{link.icon}</span>
                {link.label}
              </RouterLink>
            )
          })}
        </nav>

        <div style={{ padding: '24px 20px', borderTop: '1px solid rgba(51,65,85,0.5)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#06b6d4' }}>
              {user.name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px',
            background: 'none', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s',
          }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Navigation Bar */}
        <header style={{ 
          height: 64, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 40px', position: 'sticky', top: 0, zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 8 }} title="Toggle Theme">
              {theme === 'dark' ? <Lightbulb size={18} /> : <Leaf size={18} />}
            </button>
            {user.role === 'admin' && (
              <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 8 }} title="Settings">
                <ClipboardList size={18} />
              </button>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return (
    <RouterRoutes>
      <RouterRoute path="/login" element={<Login />} />
      <RouterRoute path="/register" element={<Register />} />
      
      {/* Client Routes */}
      <RouterRoute path="/client" element={<AppLayout><DashboardOverview /></AppLayout>} />
      <RouterRoute path="/client/energy" element={<AppLayout><EnergyData /></AppLayout>} />
      <RouterRoute path="/client/audits" element={<AppLayout><Audits /></AppLayout>} />
      <RouterRoute path="/client/savings" element={<AppLayout><SavingsTracker /></AppLayout>} />
      <RouterRoute path="/client/carbon" element={<AppLayout><CarbonImpact /></AppLayout>} />
      <RouterRoute path="/client/predictions" element={<AppLayout><Predictions /></AppLayout>} />
      <RouterRoute path="/client/recommendations" element={<AppLayout><Recommendations /></AppLayout>} />
      <RouterRoute path="/client/benchmark" element={<AppLayout><Benchmarking /></AppLayout>} />
      <RouterRoute path="/client/roi" element={<AppLayout><ROICalculator /></AppLayout>} />
      <RouterRoute path="/client/reports" element={<AppLayout><Reports /></AppLayout>} />
      <RouterRoute path="/client/notifications" element={<AppLayout><Notifications /></AppLayout>} />
      <RouterRoute path="/client/badges" element={<AppLayout><Achievements /></AppLayout>} />
      <RouterRoute path="/settings" element={user.role === 'admin' ? <AppLayout><Settings /></AppLayout> : <RouterNavigate to="/" />} />

      {/* Auditor Routes */}
      <RouterRoute path="/auditor" element={<AppLayout><AuditorDashboard /></AppLayout>} />

      {/* Admin Routes */}
      <RouterRoute path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />

      {/* Default Fallback */}
      <RouterRoute path="/" element={<RouterNavigate to="/login" />} />
      <RouterRoute path="*" element={<RouterNavigate to="/login" />} />
    </RouterRoutes>
  )
}

export default App

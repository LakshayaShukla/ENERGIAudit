import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Zap, ClipboardList, TrendingUp, Leaf,
  Brain, Lightbulb, BarChart3, Calculator, FileText,
  Bell, Trophy, Settings, LogOut, ChevronRight, Shield, Users
} from 'lucide-react'
import { useState, useEffect } from 'react'
import API from '../services/api'

const clientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/energy', icon: Zap, label: 'Energy Data' },
  { to: '/dashboard/audits', icon: ClipboardList, label: 'Audits' },
  { to: '/dashboard/savings', icon: TrendingUp, label: 'Savings Tracker' },
  { to: '/dashboard/carbon', icon: Leaf, label: 'Carbon Impact' },
  { to: '/dashboard/predict', icon: Brain, label: 'Predictions' },
  { to: '/dashboard/recommendations', icon: Lightbulb, label: 'Recommendations' },
  { to: '/dashboard/benchmark', icon: BarChart3, label: 'Benchmarking' },
  { to: '/dashboard/roi', icon: Calculator, label: 'ROI Calculator' },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/badges', icon: Trophy, label: 'Achievements' },
]

const auditorNav = [
  { to: '/auditor', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/auditor/requests', icon: ClipboardList, label: 'Audit Requests' },
  { to: '/auditor/active', icon: Zap, label: 'Active Audits' },
  { to: '/auditor/notifications', icon: Bell, label: 'Notifications' },
]

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/audits', icon: ClipboardList, label: 'All Audits' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [unread, setUnread] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    API.get('/api/notifications/').then(r => {
      setUnread(r.data.filter(n => !n.is_read).length)
    }).catch(() => {})
  }, [])

  const nav = user?.role === 'admin' ? adminNav
    : user?.role === 'auditor' ? auditorNav
    : clientNav

  const roleColors = {
    admin: 'from-purple-500 to-indigo-500',
    auditor: 'from-cyan-500 to-blue-500',
    client: 'from-cyan-500 to-emerald-500',
  }
  const roleIcon = { admin: <Shield size={14} />, auditor: <Zap size={14} />, client: <Users size={14} /> }

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      minHeight: '100vh',
      background: 'rgba(10,15,30,0.98)',
      borderRight: '1px solid rgba(51,65,85,0.5)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      zIndex: 40,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: 'white',
          }}>E</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>EnergiAudit</div>
              <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.5px' }}>ENERGY PLATFORM</div>
            </div>
          )}
        </div>
      </div>

      {/* User chip */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
          <div style={{
            background: 'rgba(30,41,59,0.6)', borderRadius: 10, padding: '10px 12px',
            border: '1px solid rgba(51,65,85,0.4)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
              background: 'rgba(6,182,212,0.15)', color: '#06b6d4', textTransform: 'uppercase' }}>
              {roleIcon[user?.role]} {user?.role}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/auditor' || to === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 18px' : '9px 12px',
              borderRadius: 10, marginBottom: 2,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              color: isActive ? '#06b6d4' : '#94a3b8',
              background: isActive ? 'rgba(6,182,212,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
              justifyContent: collapsed ? 'center' : 'flex-start',
              position: 'relative',
            })}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0, color: isActive ? '#06b6d4' : '#64748b' }} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && label === 'Notifications' && unread > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#ef4444', color: 'white',
                    borderRadius: 99, fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', minWidth: 18, textAlign: 'center',
                  }}>{unread}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse + Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(51,65,85,0.4)' }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.3)',
            color: '#64748b', cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: 4,
          }}
        >
          {!collapsed && <span>Collapse</span>}
          <ChevronRight size={14} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 6,
          }}
        >
          <LogOut size={14} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}

import { useState, useEffect } from 'react'
import { Spinner, PageHeader, EmptyState } from '../../components/UI'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { Bell, Check, Info, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'

const ICON_MAP = {
  alert: <AlertTriangle size={18} color="#ef4444" />,
  system: <Info size={18} color="#3b82f6" />,
  audit: <CheckCircle2 size={18} color="#10b981" />,
  savings: <Zap size={18} color="#f59e0b" />,
}

const COLOR_MAP = {
  alert: 'rgba(239,68,68,0.1)',
  system: 'rgba(59,130,246,0.1)',
  audit: 'rgba(16,185,129,0.1)',
  savings: 'rgba(245,158,11,0.1)',
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => API.get('/api/notifications/').then(r => setNotifs(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    try {
      await API.put(`/api/notifications/${id}/read`)
      setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const markAllRead = async () => {
    try {
      await API.post('/api/notifications/read-all')
      setNotifs(notifs.map(n => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  const unreadCount = notifs.filter(n => !n.is_read).length

  return (
    <div className="page">
      <PageHeader title="Notifications" subtitle="Alerts, system messages, and audit updates"
        action={unreadCount > 0 && (
          <button className="btn-secondary" onClick={markAllRead}>
            <Check size={14} /> Mark all read
          </button>
        )}
      />

      {notifs.length === 0 ? (
        <EmptyState icon={<Bell size={48} color="#64748b" />} title="All caught up!" description="You don't have any notifications right now." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 800 }}>
          {notifs.map(n => (
            <div key={n.id} style={{
              background: n.is_read ? 'rgba(30,41,59,0.3)' : 'rgba(30,41,59,0.8)',
              border: `1px solid ${n.is_read ? 'rgba(51,65,85,0.3)' : 'rgba(51,65,85,0.8)'}`,
              borderRadius: 12, padding: '16px', display: 'flex', gap: 14,
              transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}>
              {!n.is_read && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#06b6d4' }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: 99, flexShrink: 0,
                background: COLOR_MAP[n.type] || 'rgba(100,116,139,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ICON_MAP[n.type] || <Bell size={18} color="#64748b" />}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: n.is_read ? 600 : 700, color: n.is_read ? '#cbd5e1' : '#f1f5f9', marginBottom: 4 }}>
                  {n.title || n.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </h4>
                <p style={{ fontSize: 13, color: n.is_read ? '#64748b' : '#94a3b8', lineHeight: 1.5, marginBottom: 6 }}>
                  {n.message}
                </p>
                <div style={{ fontSize: 11, color: '#475569' }}>
                  {new Date(n.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} style={{
                  background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer',
                  padding: 8, height: 'fit-content', borderRadius: 8,
                }} title="Mark as read">
                  <Check size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

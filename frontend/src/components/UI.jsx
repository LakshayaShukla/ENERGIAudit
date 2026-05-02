export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div className="spinner" />
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function KpiCard({ label, value, icon, sub, color = '#06b6d4', trend }) {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{
          marginTop: 8, fontSize: 12, fontWeight: 600,
          color: trend >= 0 ? '#ef4444' : '#10b981',
        }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  )
}

export function StatusBadge({ status }) {
  const labels = {
    pending: 'Pending', in_progress: 'In Progress',
    completed: 'Completed', rejected: 'Rejected',
  }
  return (
    <span className={`tag status-${status}`} style={{ borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
      {labels[status] || status}
    </span>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: typeof icon === 'string' ? 48 : undefined, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{description}</div>
      {action}
    </div>
  )
}

export function AlertBox({ type = 'info', children }) {
  const styles = {
    info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#93c5fd' },
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  }
  const s = styles[type]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      borderRadius: 10, padding: '12px 16px', fontSize: 13, lineHeight: 1.6,
    }}>
      {children}
    </div>
  )
}

export function SectionCard({ title, children, action }) {
  return (
    <div className="card">
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

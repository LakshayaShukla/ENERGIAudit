import { useState, useEffect } from 'react'
import { Spinner, PageHeader, EmptyState } from '../../components/UI'
import API from '../../services/api'
import { Lightbulb, DollarSign, ArrowRight, CheckCircle, Clock, Zap, Leaf, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'

const TAG_STYLES = {
  'High Impact': 'tag-red',
  'Low Cost': 'tag-green',
  'Quick Win': 'tag-cyan',
}

const TAG_ICONS = {
  'High Impact': <Zap size={11} />,
  'Low Cost': <Leaf size={11} />,
  'Quick Win': <Rocket size={11} />,
}

export default function Recommendations() {
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/api/recommendations/').then(r => {
      // Simulate statuses if they don't exist in backend
      const initialized = r.data.map(rec => ({ ...rec, status: rec.status || 'todo' }))
      setRecs(initialized)
    }).finally(() => setLoading(false))
  }, [])

  const handleStatusChange = (id, newStatus) => {
    setRecs(recs.map(r => r.id === id ? { ...r, status: newStatus } : r))
    if (newStatus === 'completed') {
      toast.success('Recommendation marked as completed!')
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  const columns = [
    { id: 'todo', title: 'Action Plan', icon: <Lightbulb size={16} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.05)' },
    { id: 'in_progress', title: 'In Progress', icon: <Clock size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
    { id: 'completed', title: 'Implemented', icon: <CheckCircle size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.05)' },
  ]

  return (
    <div className="page">
      <PageHeader title="Optimization Workspace" subtitle="Track and implement AI-driven energy optimization strategies" />

      {recs.length === 0 ? (
        <EmptyState icon={<Lightbulb size={48} color="#64748b" />} title="No recommendations" description="Add more energy data to get personalized recommendations." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
          {columns.map(col => (
            <div key={col.id} style={{ 
              background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)', 
              borderRadius: 16, padding: 16, minHeight: 400 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: `2px solid ${col.color}40`, paddingBottom: 10 }}>
                <div style={{ color: col.color }}>{col.icon}</div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{col.title}</h2>
                <span style={{ marginLeft: 'auto', background: col.bg, color: col.color, padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                  {recs.filter(r => r.status === col.id).length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recs.filter(r => r.status === col.id).map(rec => (
                  <div key={rec.id} style={{ 
                    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.6)',
                    borderRadius: 12, padding: 16, transition: 'all 0.2s'
                  }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{rec.title}</h3>
                    <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>{rec.description}</p>
                    
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {rec.tags.map(tag => (
                        <span key={tag} className={`tag ${TAG_STYLES[tag] || 'tag-cyan'}`}>
                          {TAG_ICONS[tag]} {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 600 }}>
                        <DollarSign size={14} /> up to {rec.potential_savings_pct}%
                      </div>
                      
                      <div style={{ display: 'flex', gap: 6 }}>
                        {col.id === 'todo' && (
                          <button onClick={() => handleStatusChange(rec.id, 'in_progress')}
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Start <ArrowRight size={12} />
                          </button>
                        )}
                        {col.id === 'in_progress' && (
                          <button onClick={() => handleStatusChange(rec.id, 'completed')}
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Complete <CheckCircle size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {recs.filter(r => r.status === col.id).length === 0 && (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12, padding: '20px 0' }}>No items here</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

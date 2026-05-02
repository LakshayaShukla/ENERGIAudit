import { useState, useEffect } from 'react'
import { Spinner, PageHeader, SectionCard, StatusBadge, EmptyState } from '../../components/UI'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { ClipboardList, Plus, FileDown, AlertTriangle, XCircle, User, StickyNote, DollarSign } from 'lucide-react'

export default function Audits() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [notes, setNotes] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [downloading, setDownloading] = useState(null)

  const load = () => API.get('/api/audits/').then(r => setAudits(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleRequest = async (e) => {
    e.preventDefault()
    setRequesting(true)
    try {
      await API.post('/api/audits/request', { notes })
      toast.success('Audit request submitted!')
      setShowForm(false)
      setNotes('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit')
    } finally {
      setRequesting(false)
    }
  }

  const handleDownloadPDF = async (audit) => {
    setDownloading(audit.id)
    try {
      const res = await API.get(`/api/reports/audit/${audit.id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit_report_${audit.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded successfully')
    } catch (err) {
      toast.error('Failed to generate report')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  const hasActive = audits.some(a => ['pending', 'in_progress'].includes(a.status))

  return (
    <div className="page">
      <PageHeader title="Energy Audits" subtitle="Request and track your energy audit progress"
        action={!hasActive && (
          <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={15} /> Request Audit
          </button>
        )}
      />

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>New Audit Request</h3>
          <form onSubmit={handleRequest}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              Additional Notes (optional)
            </label>
            <textarea className="input-dark" rows={3}
              placeholder="Describe specific areas of concern, equipment types, or goals..."
              value={notes} onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" type="submit" disabled={requesting}>
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {hasActive && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fcd34d',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={16} /> You already have an active audit request. You can submit a new one once it is completed or rejected.
        </div>
      )}

      {audits.length === 0 ? (
        <EmptyState icon={<ClipboardList size={48} color="#64748b" />} title="No audits yet" description="Request your first energy audit to get professional insights."
          action={<button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Request Audit</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {audits.map(audit => (
            <div key={audit.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Audit #{audit.id}</span>
                    <StatusBadge status={audit.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Requested: {new Date(audit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                {audit.efficiency_score && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#06b6d4' }}>{audit.efficiency_score}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Efficiency Score</div>
                  </div>
                )}
              </div>

              {audit.auditor_name && (
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> Auditor: <strong style={{ color: '#f1f5f9' }}>{audit.auditor_name}</strong>
                </div>
              )}
              {audit.notes && (
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StickyNote size={14} /> {audit.notes}
                </div>
              )}
              {audit.estimated_savings_inr && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#10b981', marginBottom: 10,
                }}>
                  <DollarSign size={14} /> Estimated Savings: ₹{audit.estimated_savings_inr.toLocaleString('en-IN')}/year
                </div>
              )}
              {audit.recommendations && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  background: 'rgba(30,41,59,0.6)', borderRadius: 10, padding: '12px 14px',
                  border: '1px solid rgba(51,65,85,0.4)', marginTop: 4,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Recommendations
                    </div>
                    {audit.recommendations.split('\n').filter(l => l.trim()).map((line, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 4, display: 'flex', gap: 6 }}>
                        <span style={{ color: '#06b6d4', flexShrink: 0 }}>{i + 1}.</span> {line.replace(/^\d+\.\s*/, '')}
                      </div>
                    ))}
                  </div>
                  {audit.status === 'completed' && (
                    <button onClick={() => handleDownloadPDF(audit)}
                      disabled={downloading === audit.id}
                      style={{
                        background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                        color: '#06b6d4', padding: '6px 12px', borderRadius: 6, fontSize: 12,
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s', flexShrink: 0, marginLeft: 16
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(6,182,212,0.2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(6,182,212,0.1)'}
                    >
                      <FileDown size={14} /> {downloading === audit.id ? 'Generating...' : 'Download PDF'}
                    </button>
                  )}
                </div>
              )}
              {audit.rejection_reason && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#fca5a5', marginTop: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <XCircle size={14} /> Rejected: {audit.rejection_reason}
                </div>
              )}

              {/* Progress bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', gap: 0 }}>
                  {['pending', 'in_progress', 'completed'].map((s, i) => {
                    const idx = ['pending', 'in_progress', 'completed'].indexOf(audit.status)
                    const done = i <= idx && audit.status !== 'rejected'
                    return (
                      <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', height: 4, borderRadius: 2,
                          background: done ? '#06b6d4' : 'rgba(51,65,85,0.5)',
                          transition: 'background 0.3s',
                        }} />
                        <span style={{ fontSize: 10, color: done ? '#06b6d4' : '#475569', fontWeight: done ? 600 : 400 }}>
                          {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

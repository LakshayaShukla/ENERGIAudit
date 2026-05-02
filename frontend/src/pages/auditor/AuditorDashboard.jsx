import { useState, useEffect } from 'react'
import { Spinner, PageHeader, EmptyState, StatusBadge } from '../../components/UI'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, FileDown, MapPin, Calendar, Clock, Sparkles, Eye, Smartphone, ClipboardList, Tablet, User, Maximize2, X, TrendingUp, Zap, Leaf, Building2, Ruler } from 'lucide-react'

export default function AuditorDashboard() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [notes, setNotes] = useState('')
  const [selectedAuditId, setSelectedAuditId] = useState(null)
  const [viewAudit, setViewAudit] = useState(null)
  const [actionType, setActionType] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [fieldMode, setFieldMode] = useState(false)

  const load = () => API.get('/api/audits/').then(r => setAudits(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleAction = async (e) => {
    e.preventDefault()
    try {
      const url = `/api/audits/${selectedAuditId}/${actionType}`
      const payload = actionType === 'complete' 
        ? { recommendations: notes || 'Automated rules based', efficiency_score: 80, estimated_savings_inr: 100000 } 
        : { rejection_reason: notes }
      await API.put(url, payload)
      toast.success(`Audit ${actionType}ed successfully`)
      setNotes('')
      setSelectedAuditId(null)
      setActionType(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
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

  const filtered = audits.filter(a =>
    activeTab === 'pending' ? a.status === 'pending' :
    activeTab === 'active' ? a.status === 'in_progress' :
    ['completed', 'rejected'].includes(a.status)
  )

  const getMockLocation = (id) => ['Mumbai, MH', 'Bangalore, KA', 'Delhi, DL', 'Pune, MH'][id % 4]
  const getMockDueDate = (dateStr) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + 14)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`page ${fieldMode ? 'field-mode-active' : ''}`}>
      {fieldMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#10b981', color: 'white', padding: '8px 20px', zIndex: 2000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
           <span>Field Inspection Protocol Active</span>
           <button onClick={() => setFieldMode(false)} style={{ background: 'white', color: '#10b981', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>Exit Mode</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: fieldMode ? 40 : 0 }}>
        <PageHeader title={fieldMode ? "Inspection Workspace" : "Auditor Workspace"} subtitle="Manage energy audit requests, inspect facilities, and build digital proposals" />
        {!fieldMode && (
          <button className="btn-secondary" onClick={() => { setFieldMode(true); toast.success('Inspection interface optimized') }} 
            style={{ background: 'rgba(30,41,59,0.8)', color: '#f1f5f9', border: '1px solid #475569' }}>
            <Smartphone size={14} /> Field Mode
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(51,65,85,0.4)', paddingBottom: 16 }}>
        {[
          { id: 'pending', label: 'New Requests', count: audits.filter(a => a.status === 'pending').length },
          { id: 'active', label: 'Active Inspections', count: audits.filter(a => a.status === 'in_progress').length },
          { id: 'history', label: 'Completed', count: audits.filter(a => ['completed', 'rejected'].includes(a.status)).length },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: activeTab === t.id ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: activeTab === t.id ? '#06b6d4' : '#64748b',
            }}>
            {t.label}
            {t.count > 0 && <span style={{ background: activeTab === t.id ? '#06b6d4' : 'rgba(100,116,139,0.3)', color: activeTab === t.id ? '#fff' : '#cbd5e1', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: fieldMode ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
        {filtered.map(audit => (
          <div key={audit.id} className="card" style={{ 
            borderColor: fieldMode && audit.status === 'in_progress' ? '#10b981' : 'rgba(51,65,85,0.4)',
            boxShadow: fieldMode && audit.status === 'in_progress' ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
            padding: fieldMode ? 32 : 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(51,65,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                  <Tablet size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>{audit.client_name || 'Asset Owner'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Audit Ticket #{audit.id}</div>
                </div>
              </div>
              <StatusBadge status={audit.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, background: 'rgba(15,23,42,0.4)', padding: 16, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                <MapPin size={14} color="#06b6d4" /> {audit.client_location || getMockLocation(audit.id)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#94a3b8' }}>
                <Calendar size={14} color="#10b981" /> Due: {getMockDueDate(audit.created_at)}
              </div>
            </div>

            {audit.status === 'pending' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button className="btn-secondary" onClick={() => { setSelectedAuditId(audit.id); setActionType('reject') }} style={{ width: '100%', justifyContent: 'center', color: '#ef4444' }}>
                  <XCircle size={14} /> Defer
                </button>
                <button className="btn-primary" onClick={() => { setSelectedAuditId(audit.id); setActionType('accept'); handleAction({ preventDefault: () => {} }) }} style={{ width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={14} /> Accept Assignment
                </button>
              </div>
            )}

            {audit.status === 'in_progress' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn-primary" onClick={() => { setSelectedAuditId(audit.id); setActionType('complete') }} 
                  style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <Sparkles size={14} /> Finish Inspection & Submit
                </button>
              </div>
            )}

            {audit.status === 'completed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button className="btn-secondary" onClick={() => handleDownloadPDF(audit)} disabled={downloading === audit.id} style={{ width: '100%', justifyContent: 'center' }}>
                  <FileDown size={14} /> {downloading === audit.id ? 'Exporting...' : 'Export Report'}
                </button>
                <button className="btn-secondary" onClick={() => setViewAudit(audit)} style={{ width: '100%', justifyContent: 'center' }}>
                  <Eye size={14} /> View Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && <EmptyState icon={<ClipboardList size={40} />} title="Workspace is Clear" message={`You have no ${activeTab} audits in the protocol at this time.`} />}

      {/* Detail Modal */}
      {viewAudit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 24, padding: 40, width: '100%', maxWidth: 700, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflowY: 'auto', maxHeight: '90vh' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                   <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Inspection Ledger Detail</h3>
                   <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Audit Protocol #{viewAudit.id} • Completed on {new Date(viewAudit.updated_at).toLocaleDateString()}</div>
                </div>
                <button onClick={() => setViewAudit(null)} style={{ background: 'rgba(51,65,85,0.4)', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 8, borderRadius: 12 }}><X size={24}/></button>
             </div>

             {/* Company Profile Section */}
             <div style={{ marginBottom: 32, background: 'linear-gradient(135deg, rgba(30,41,59,0.4), rgba(15,23,42,0.4))', border: '1px solid #334155', borderRadius: 20, padding: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '1px' }}>
                   <Building2 size={16} /> Organizational Briefing
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                   <div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Industry Focus</div>
                      <div style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                         <Zap size={14} color="#f59e0b" /> {viewAudit.client_org_type?.toUpperCase() || 'GENERAL SECTOR'}
                      </div>
                   </div>
                   <div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Operational Footprint</div>
                      <div style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                         <Ruler size={14} color="#06b6d4" /> {viewAudit.client_floor_area?.toLocaleString() || '0'} SQ.FT.
                      </div>
                   </div>
                   <div>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Workforce Size</div>
                      <div style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                         <User size={14} color="#10b981" /> {viewAudit.client_org_size?.toLocaleString() || '0'} STAFF
                      </div>
                   </div>
                </div>
                <div style={{ paddingTop: 20, borderTop: '1px solid rgba(51,65,85,0.4)' }}>
                   <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>About {viewAudit.client_name}</div>
                   <p style={{ fontSize: 14, color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                      {viewAudit.client_about || `${viewAudit.client_name} is an enterprise entity operating in the ${viewAudit.client_org_type || 'commercial'} sector.`}
                   </p>
                   {viewAudit.client_location && (
                     <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                       <MapPin size={12} color="#06b6d4" /> {viewAudit.client_location}
                     </div>
                   )}
                </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 32 }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: 20, borderRadius: 16 }}>
                   <div style={{ fontSize: 11, color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Efficiency Score</div>
                   <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{viewAudit.efficiency_score}%</div>
                </div>
                <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', padding: 20, borderRadius: 16 }}>
                   <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Savings Yield</div>
                   <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>₹{viewAudit.estimated_savings_inr?.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: 20, borderRadius: 16 }}>
                   <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Inspection ID</div>
                   <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginTop: 8 }}>#{viewAudit.id}</div>
                </div>
             </div>

             <div style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                   <ClipboardList size={16} /> Professional Recommendations
                </h4>
                <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #334155', borderRadius: 16, padding: 24, color: '#cbd5e1', lineHeight: 1.6, fontSize: 15 }}>
                   {viewAudit.recommendations}
                </div>
             </div>

             <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" onClick={() => handleDownloadPDF(viewAudit)} style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
                   <FileDown size={18} /> Export Formal PDF
                </button>
                <button className="btn-secondary" onClick={() => setViewAudit(null)} style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
                   Close Inspector
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {(selectedAuditId && (actionType === 'complete' || actionType === 'reject')) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>
              {actionType === 'complete' ? 'Submit Inspection Results' : 'Assignment Deferral'}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              {actionType === 'complete' ? 'Provide professional recommendations and findings to finalize this audit report.' : 'Please provide a valid reason for deferring this inspection request.'}
            </p>
            <form onSubmit={handleAction}>
              <textarea className="input-dark" style={{ minHeight: 120, marginBottom: 20, paddingTop: 12 }} placeholder={actionType === 'complete' ? 'Findings: HVAC efficiency below baseline, recommended LED retrofit...' : 'Reason for deferral...'} value={notes} onChange={e => setNotes(e.target.value)} required />
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn-secondary" onClick={() => { setSelectedAuditId(null); setActionType(null) }} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: actionType === 'complete' ? '#10b981' : '#ef4444' }}>
                  {actionType === 'complete' ? 'Finalize & Submit' : 'Confirm Deferral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

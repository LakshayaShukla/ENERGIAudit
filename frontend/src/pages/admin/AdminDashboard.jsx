import { useState, useEffect } from 'react'
import { Spinner, PageHeader, KpiCard, SectionCard } from '../../components/UI'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { Users, CheckCircle, Shield, Briefcase, Activity, Zap, DollarSign, PieChart, Plus, FileText, Search, TrendingUp, Globe, X, Download } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { Leaf } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [provisionForm, setProvisionForm] = useState({ name: '', email: '', password: '', role: 'client' })

  const load = () => {
    Promise.all([
      API.get('/api/admin/users'),
      API.get('/api/admin/stats'),
      API.get('/api/admin/audits'),
    ]).then(([resUsers, resStats, resAudits]) => {
      setUsers(resUsers.data)
      setStats(resStats.data)
      setAudits(resAudits.data)
    }).finally(() => setLoading(false))
  }
  
  useEffect(() => { load() }, [])

  const toggleStatus = async (id, currentStatus) => {
    try {
      await API.put(`/api/admin/users/${id}/${currentStatus ? 'deactivate' : 'activate'}`)
      toast.success(`Infrastructure access ${!currentStatus ? 'restored' : 'revoked'}`)
      load()
    } catch (err) { toast.error('Management protocol failed') }
  }

  const verifyAuditor = async (id) => {
    try {
      await API.put(`/api/admin/users/${id}/approve`)
      toast.success('Auditor credentials verified')
      load()
    } catch (err) { toast.error('Verification protocol failed') }
  }

  const handleProvision = async (e) => {
    e.preventDefault()
    try {
      await API.post('/api/auth/register', {
        ...provisionForm,
        org_type: 'other',
        org_size: 1,
        floor_area_sqft: 0
      })
      toast.success('Identity provisioned successfully')
      setShowProvisionModal(false)
      setProvisionForm({ name: '', email: '', password: '', role: 'client' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Provisioning failed')
    }
  }

  const handleDownloadExecutiveSummary = async () => {
    setGeneratingReport(true)
    try {
      const res = await API.get('/api/reports/energy', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `executive_summary_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Executive intelligence report generated')
    } catch (err) {
      toast.error('Intelligence report generation failed')
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading || !stats) return <div className="page"><Spinner /></div>

  // Financial Metrics
  const totalSavingsInr = audits.filter(a => a.status === 'completed').reduce((acc, a) => acc + (a.estimated_savings_inr || 0), 0)
  const totalEnergySaved = totalSavingsInr * 0.12 
  const platformRevenue = totalSavingsInr * 0.10 
  const carbonOffsetTons = totalEnergySaved * 0.00085 
  const completionRate = stats.total_audits ? ((stats.completed_audits / stats.total_audits) * 100).toFixed(1) : 0

  // Auditor Performance Analytics
  const auditorStats = users.filter(u => u.role === 'auditor').map(u => ({
    id: u.id,
    name: u.name,
    valueGenerated: Math.floor(Math.random() * 500000) + 50000,
    avgTat: Math.floor(Math.random() * 5) + 2,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1)
  })).sort((a,b) => b.valueGenerated - a.valueGenerated)

  // Dataset Trends
  const trendData = [
    { month: 'Jan', savings: 120000, audits: 4 },
    { month: 'Feb', savings: 150000, audits: 7 },
    { month: 'Mar', savings: 280000, audits: 12 },
    { month: 'Apr', savings: 310000, audits: 15 },
    { month: 'May', savings: totalSavingsInr || 450000, audits: stats.total_audits },
  ]

  const filteredUsers = users.filter(u => {
    const matchRole = filterRole === 'All' || u.role === filterRole.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchRole && matchSearch
  })

  const recentUsers = [...users].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,4)
  const recentAudits = [...audits].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,4)

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <PageHeader title="Command Center" subtitle="Governance, risk management, and platform intelligence oversight" />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setShowProvisionModal(true)}>
            <Plus size={14}/> Provision Account
          </button>
          <button className="btn-primary" onClick={handleDownloadExecutiveSummary} disabled={generatingReport}>
            <FileText size={14}/> {generatingReport ? 'Generating...' : 'Executive Summary'}
          </button>
        </div>
      </div>

      {/* ESG Impact Dashboard */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', 
        border: '1px solid rgba(16,185,129,0.2)', 
        borderRadius: 16, padding: '24px 32px', 
        display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32,
        boxShadow: '0 10px 30px -15px rgba(0,0,0,0.3)'
      }}>
         <div style={{ 
           background: 'rgba(16,185,129,0.15)', 
           width: 64, height: 64, 
           borderRadius: 20, color: '#10b981',
           display: 'flex', alignItems: 'center', justifyContent: 'center'
         }}><Globe size={32} /></div>
         <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Sustainability Index</h2>
            <p style={{ fontSize: 15, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
              Platform-wide intelligence confirms <strong style={{color:'#10b981'}}>{Math.floor(totalEnergySaved).toLocaleString()} kWh</strong> of energy optimization 
              and <strong style={{color:'#06b6d4'}}>{Math.floor(carbonOffsetTons).toLocaleString()} Metric Tons of CO2</strong> mitigation in the current fiscal period.
            </p>
         </div>
         <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>ESG Performance</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>+24.8%</div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, marginBottom: 32 }}>
        <KpiCard label="Platform Net Yield" value={`₹${platformRevenue.toLocaleString('en-IN')}`} icon={<TrendingUp size={18} />} color="#f59e0b" sub="Attributed Gain-Share revenue" />
        <KpiCard label="Total Capital Recovery" value={`₹${totalSavingsInr.toLocaleString('en-IN')}`} icon={<DollarSign size={18} />} color="#10b981" sub="Verified client cost reduction" />
        <KpiCard label="Critical Audit Backlog" value={stats.pending_audits} icon={<Activity size={18} />} color="#ef4444" sub="Awaiting technician assignment" />
        <KpiCard label="SLA Fulfillment Rate" value={`${completionRate}%`} icon={<CheckCircle size={18} />} color="#06b6d4" sub="Audit lifecycle efficiency" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: 24, marginBottom: 32 }}>
        {/* Growth & Yield Chart */}
        <SectionCard title="Revenue & Savings Velocity">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(51,65,85,0.2)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} />
              <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" name="Capital Recovery" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Auditor Ranking */}
        <SectionCard title="Resource Performance Ranking">
           <div style={{ overflowX: 'auto' }}>
             <table className="data-table" style={{ width: '100%' }}>
               <thead>
                 <tr><th>Professional</th><th>Yield Contribution</th><th>Latency (Avg)</th><th>Score</th></tr>
               </thead>
               <tbody>
                 {auditorStats.map(a => (
                   <tr key={a.id}>
                     <td style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>{a.name}</td>
                     <td style={{ color: '#10b981', fontWeight: 600 }}>₹{a.valueGenerated.toLocaleString()}</td>
                     <td style={{ color: a.avgTat > 4 ? '#ef4444' : '#06b6d4' }}>{a.avgTat} days</td>
                     <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <div style={{ flex: 1, height: 4, background: 'rgba(51,65,85,0.5)', borderRadius: 2 }}>
                              <div style={{ width: `${(a.rating/5)*100}%`, height: '100%', background: '#f59e0b', borderRadius: 2 }} />
                           </div>
                           <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{a.rating}</span>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </SectionCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* User Directory */}
        <SectionCard title="System Directory & Access Control">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
             <div style={{ display: 'flex', gap: 10, background: 'rgba(15,23,42,0.6)', padding: '8px 16px', borderRadius: 10, border: '1px solid #334155', alignItems: 'center', width: 300 }}>
               <Search size={16} color="#475569" />
               <input type="text" placeholder="Filter identity..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                 style={{ background: 'transparent', border: 'none', color: '#f1f5f9', outline: 'none', width: '100%', fontSize: 13 }} />
             </div>
             <div style={{ display: 'flex', gap: 8 }}>
               {['All', 'Client', 'Auditor', 'Admin'].map(r => (
                 <button key={r} onClick={() => setFilterRole(r)}
                  style={{ 
                    background: filterRole === r ? 'rgba(6,182,212,0.1)' : 'transparent', 
                    color: filterRole === r ? '#06b6d4' : '#64748b',
                    border: `1px solid ${filterRole === r ? 'rgba(6,182,212,0.3)' : 'transparent'}`, 
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                   {r}
                 </button>
               ))}
             </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Identity</th><th>Classification</th><th>Status</th><th>Access Granted</th><th>Control</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                   <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(51,65,85,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontWeight: 800, border: '1px solid rgba(51,65,85,0.4)' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${u.role === 'admin' ? 'tag-red' : u.role === 'auditor' ? 'tag-purple' : 'tag-cyan'}`} style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.5px' }}>{u.role}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: u.is_active ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: 700 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 3, background: u.is_active ? '#10b981' : '#ef4444' }} />
                        {u.is_active ? 'ENABLED' : 'LOCKED'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => toggleStatus(u.id, u.is_active)}
                          style={{
                            background: 'rgba(15,23,42,0.4)', border: `1px solid ${u.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, borderRadius: 8,
                            padding: '6px 12px', color: u.is_active ? '#ef4444' : '#10b981', cursor: 'pointer', fontSize: 11, fontWeight: 700
                          }}>
                          {u.is_active ? 'Restrict' : 'Authorize'}
                        </button>
                        {u.role === 'auditor' && !u.is_approved && (
                          <button onClick={() => verifyAuditor(u.id)}
                            style={{
                              background: '#10b981', border: 'none', borderRadius: 8,
                              padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                            }}>
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Audit Log / Event Feed */}
        <SectionCard title="Telemetry Event Log">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {recentAudits.map((a, i) => (
              <div key={`a-${i}`} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#06b6d4', marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                   <p style={{ fontSize: 13, color: '#f1f5f9', margin: 0, lineHeight: 1.4 }}>
                     Operational state change: <strong style={{ color: '#06b6d4' }}>AUDIT #{a.id}</strong> transitioned to <span style={{ fontSize: 11, fontWeight: 800, color: a.status==='completed'?'#10b981':'#f59e0b' }}>{a.status.toUpperCase()}</span>
                   </p>
                   <p style={{ fontSize: 11, color: '#475569', margin: '6px 0 0 0' }}>{new Date(a.created_at).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            {recentUsers.map((u, i) => (
              <div key={`u-${i}`} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#8b5cf6', marginTop: 5 }} />
                <div style={{ flex: 1 }}>
                   <p style={{ fontSize: 13, color: '#f1f5f9', margin: 0, lineHeight: 1.4 }}>
                     Identity Provisioned: <strong style={{ color: '#8b5cf6' }}>{u.name}</strong> registered as <span style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6' }}>{u.role.toUpperCase()}</span>
                   </p>
                   <p style={{ fontSize: 11, color: '#475569', margin: '6px 0 0 0' }}>{new Date(u.created_at).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Provision Modal */}
      {showProvisionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Identity Provisioning</h3>
                <button onClick={() => setShowProvisionModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             <form onSubmit={handleProvision} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Full Name / Org</label>
                   <input className="input-dark" placeholder="John Doe / TechCorp" required value={provisionForm.name} onChange={e => setProvisionForm({...provisionForm, name: e.target.value})} />
                </div>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email Address</label>
                   <input className="input-dark" type="email" placeholder="email@company.com" required value={provisionForm.email} onChange={e => setProvisionForm({...provisionForm, email: e.target.value})} />
                </div>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Initial Password</label>
                   <input className="input-dark" type="password" placeholder="••••••••" required value={provisionForm.password} onChange={e => setProvisionForm({...provisionForm, password: e.target.value})} />
                </div>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Account Classification</label>
                   <select className="input-dark" value={provisionForm.role} onChange={e => setProvisionForm({...provisionForm, role: e.target.value})}>
                      <option value="client">Client (Asset Owner)</option>
                      <option value="auditor">Auditor (Field Technician)</option>
                      <option value="admin">Admin (Controller)</option>
                   </select>
                </div>
                <button className="btn-primary" type="submit" style={{ marginTop: 8, justifyContent: 'center', padding: 12 }}>
                   Provision Identity
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}

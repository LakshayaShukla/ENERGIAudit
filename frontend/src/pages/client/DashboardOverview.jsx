import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Spinner, KpiCard, SectionCard, AlertBox } from '../../components/UI'
import API from '../../services/api'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import { Zap, DollarSign, Leaf, TrendingUp, Award, AlertTriangle, FileText, Download } from 'lucide-react'

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function DashboardOverview() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [energy, setEnergy] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    Promise.all([
      API.get('/api/energy/summary'),
      API.get('/api/energy/'),
      API.get('/api/energy/predict').catch(() => null),
      API.get('/api/energy/anomalies').catch(() => ({ data: [] })),
    ]).then(([s, e, p, a]) => {
      setSummary(s.data)
      setEnergy(e.data.map(d => ({
        name: `${MONTHS[d.month]} ${d.year}`,
        kWh: d.units_kwh,
        Cost: d.cost_inr,
      })))
      setPrediction(p?.data || null)
      setAnomalies(a.data.filter(anom => anom.is_anomaly) || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const res = await API.get('/api/reports/energy', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `executive_report_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Executive report downloaded')
    } catch (err) {
      toast.error('Failed to generate report. Ensure you have energy data.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  const fmt = (n) => n?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? '—'

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here's your energy intelligence overview</p>
        </div>
        <button className="btn-secondary" onClick={handleExportPDF} disabled={exporting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(30,41,59,0.8)' }}>
          <Download size={15} /> {exporting ? 'Generating...' : 'Export Executive PDF'}
        </button>
      </div>

      {/* Automated AI Action Engine */}
      {(prediction || anomalies.length > 0) && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={18} color="#06b6d4" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Automated AI Actions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {prediction && prediction.trend_pct > 5 && (
              <div style={{ 
                background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(239,68,68,0.02))', 
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={16} /> Upward Trend Detected
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>{prediction.message}. Consider adjusting HVAC schedules for the upcoming month.</div>
                </div>
                <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => window.location.href='/client/audits'}>
                  Request Audit
                </button>
              </div>
            )}
            
            {anomalies.slice(0, 1).map((a, i) => (
              <div key={i} style={{ 
                background: 'linear-gradient(90deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))', 
                border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={16} /> Anomaly Detected in {MONTHS[a.month]} {a.year}
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>Usage of {a.units_kwh.toLocaleString()} kWh deviates significantly from your baseline. Inspect equipment for faults.</div>
                </div>
                <button className="btn-secondary" style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }} onClick={() => window.location.href='/client/energy'}>
                  Review Data
                </button>
              </div>
            ))}
            
            {prediction && prediction.trend_pct <= 5 && (
              <div style={{ 
                background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))', 
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Leaf size={16} /> On Track
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>{prediction.message}. Your energy consumption is stable or improving.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Consumption" value={`${fmt(summary?.total_kwh)} kWh`}
          icon={<Zap size={18} />} sub={`${summary?.months_count || 0} months of data`} color="#06b6d4" />
        <KpiCard label="Total Cost" value={`₹${fmt(summary?.total_cost_inr)}`}
          icon={<DollarSign size={18} />} sub={`₹${fmt(summary?.avg_monthly_cost)}/month avg`} color="#10b981" />
        <KpiCard label="Carbon Emissions" value={`${fmt(summary?.carbon_kg)} kg`}
          icon={<Leaf size={18} />} sub="CO₂ equivalent" color="#f59e0b" />
        <KpiCard label="Efficiency Score" value={`${summary?.efficiency_score ?? 0}/100`}
          icon={<Award size={18} />} sub="Energy performance rating" color="#8b5cf6" />
        <KpiCard label="Sustainability" value={`${summary?.sustainability_score ?? 0}/100`}
          icon={<TrendingUp size={18} />} sub="Composite green score" color="#10b981" />
        {summary?.cost_per_sqft && (
          <KpiCard label="Cost / sq.ft" value={`₹${summary.cost_per_sqft}`}
            icon={<DollarSign size={18} />} sub="Space efficiency" color="#06b6d4" />
        )}
        {summary?.kwh_per_person && (
          <KpiCard label="kWh / Person" value={`${summary.kwh_per_person}`}
            icon={<Zap size={18} />} sub="Per employee/student" color="#f59e0b" />
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <SectionCard title="Energy Consumption Trend (kWh)">
          {energy.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>No energy data yet. Add monthly data to see trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={energy}>
                <defs>
                  <linearGradient id="kwh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="kWh" stroke="#06b6d4" fill="url(#kwh)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Monthly Cost Trend (₹)">
          {energy.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>No energy data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={energy}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Cost']} />
                <Bar dataKey="Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Efficiency Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SectionCard title="Performance Overview">
          {[
            { label: 'Energy Efficiency', value: summary?.efficiency_score ?? 0, color: '#06b6d4' },
            { label: 'Sustainability Score', value: summary?.sustainability_score ?? 0, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}/100</span>
              </div>
              <div style={{ background: 'rgba(51,65,85,0.4)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${value}%`, borderRadius: 99,
                  background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Quick Stats">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Avg Monthly Usage', value: `${fmt(summary?.avg_monthly_kwh)} kWh` },
              { label: 'Avg Monthly Cost', value: `₹${fmt(summary?.avg_monthly_cost)}` },
              { label: 'CO₂ per Month', value: `${((summary?.carbon_kg ?? 0) / Math.max(summary?.months_count ?? 1, 1)).toFixed(0)} kg` },
              { label: 'Tariff Rate', value: `₹${((summary?.total_cost_inr ?? 0) / Math.max(summary?.total_kwh ?? 1, 1)).toFixed(2)}/kWh` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

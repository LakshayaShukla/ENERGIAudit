import { useState, useEffect, useRef } from 'react'
import { Spinner, PageHeader, SectionCard, AlertBox, EmptyState } from '../../components/UI'
import API from '../../services/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'
import { Plus, Zap, UploadCloud, Cpu, Radio, CheckCircle, Database, AlertTriangle } from 'lucide-react'

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function EnergyData() {
  const [data, setData] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Data connection modes
  const [showConnectors, setShowConnectors] = useState(false)
  const [ingestionMode, setIngestionMode] = useState('manual') // 'manual', 'csv', 'iot', 'api'
  
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), units_kwh: '', cost_inr: '' })
  const [saving, setSaving] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const fileInputRef = useRef(null)

  const load = () => {
    Promise.all([
      API.get('/api/energy/'),
      API.get('/api/energy/anomalies').catch(() => ({ data: [] })),
    ]).then(([e, a]) => {
      setData(e.data)
      setAnomalies(a.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await API.post('/api/energy/', {
        month: parseInt(form.month),
        year: parseInt(form.year),
        units_kwh: parseFloat(form.units_kwh),
        cost_inr: parseFloat(form.cost_inr),
      })
      toast.success('Energy data ingested successfully')
      setShowConnectors(false)
      setForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), units_kwh: '', cost_inr: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to ingest data')
    } finally {
      setSaving(false)
    }
  }

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCsvUploading(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        toast.error('CSV file must have a header row and at least one data row')
        return
      }
      const header = lines[0].toLowerCase()
      const hasHeader = header.includes('month') || header.includes('kwh') || header.includes('year')
      const dataLines = hasHeader ? lines.slice(1) : lines
      
      let successCount = 0
      let failCount = 0
      
      for (const line of dataLines) {
        const parts = line.split(',').map(s => s.trim())
        if (parts.length < 4) continue
        
        // Try to parse: Month, Year, kWh, Cost
        const monthStr = parts[0]
        const year = parseInt(parts[1])
        const kwh = parseFloat(parts[2])
        const cost = parseFloat(parts[3])
        
        // Parse month - could be number or name
        let month = parseInt(monthStr)
        if (isNaN(month)) {
          const idx = MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase().substring(0, 3))
          month = idx > 0 ? idx : 0
        }
        
        if (!month || !year || isNaN(kwh) || isNaN(cost) || kwh <= 0 || cost <= 0) {
          failCount++
          continue
        }
        
        try {
          await API.post('/api/energy/', {
            month, year,
            units_kwh: kwh,
            cost_inr: cost,
            source: 'csv_import'
          })
          successCount++
        } catch {
          failCount++
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} record(s)${failCount > 0 ? `, ${failCount} skipped` : ''}`)
        load()
      } else {
        toast.error(`No records imported. ${failCount} row(s) failed. Check CSV format: Month, Year, kWh, Cost`)
      }
    } catch (err) {
      toast.error('Failed to parse CSV file')
    } finally {
      setCsvUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const chartData = data.map(d => ({
    name: `${MONTHS[d.month]} ${d.year}`,
    kWh: d.units_kwh,
    Cost: d.cost_inr,
    isAnomaly: anomalies.find(a => a.month === d.month && a.year === d.year)?.is_anomaly || false,
  }))

  const anomalyMonths = anomalies.filter(a => a.is_anomaly)

  const handleExportCSV = () => {
    const headers = ['Month', 'Year', 'Usage (kWh)', 'Cost (INR)', 'Rate (INR/kWh)', 'CO2 (kg)', 'Source', 'Status']
    const csvContent = [
      headers.join(','),
      ...data.map(d => {
        const isAnom = anomalies.find(a => a.month === d.month && a.year === d.year)?.is_anomaly
        const rate = (d.cost_inr / d.units_kwh).toFixed(2)
        const co2 = (d.units_kwh * 0.82).toFixed(0)
        return `${MONTHS[d.month]},${d.year},${d.units_kwh},${d.cost_inr},${rate},${co2},${d.source},${isAnom ? 'Anomaly' : 'Normal'}`
      })
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `energy_data_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('CSV exported successfully')
  }

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <PageHeader title="Data Connectors & Telemetry" subtitle="Ingest and sync facility consumption data from hardware and utilities"
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} /> Export Ledger
            </button>
            <button className="btn-primary" onClick={() => { setShowConnectors(!showConnectors); setIngestionMode('manual') }}>
              <Database size={15} /> Ingest Data
            </button>
          </div>
        }
      />

      {anomalyMonths.length > 0 && !showConnectors && (
        <AlertBox type="warning">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={16} />
            <strong>{anomalyMonths.length} anomalous period(s) detected:</strong>{' '}
            {anomalyMonths.map(a => `${MONTHS[a.month]} ${a.year}`).join(', ')} — usage deviated significantly from predictive baseline.
          </div>
        </AlertBox>
      )}

      {/* Data Connectors Hub */}
      {showConnectors && (
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Select Data Pipeline</h3>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { id: 'manual', icon: <Plus size={16}/>, label: 'Manual Entry' },
              { id: 'csv', icon: <UploadCloud size={16}/>, label: 'Bulk CSV Upload' },
              { id: 'iot', icon: <Cpu size={16}/>, label: 'Smart Meter Sync (IoT)' },
              { id: 'api', icon: <Radio size={16}/>, label: 'Utility API Connection' }
            ].map(m => (
              <button key={m.id} onClick={() => setIngestionMode(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: ingestionMode === m.id ? 'rgba(6,182,212,0.1)' : 'rgba(30,41,59,0.6)',
                  color: ingestionMode === m.id ? '#06b6d4' : '#94a3b8',
                  border: `1px solid ${ingestionMode === m.id ? 'rgba(6,182,212,0.4)' : 'rgba(51,65,85,0.6)'}`
                }}>
                {m.icon} {m.label}
                {ingestionMode === m.id && <CheckCircle size={14} style={{ marginLeft: 4 }} />}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(30,41,59,0.4)', borderRadius: 12, padding: 20, border: '1px solid rgba(51,65,85,0.3)' }}>
            {ingestionMode === 'manual' && (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 5, fontWeight: 600 }}>Billing Month</label>
                  <select className="input-dark" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} style={{ cursor: 'pointer', width: '100%' }}>
                    {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 5, fontWeight: 600 }}>Fiscal Year</label>
                  <input className="input-dark" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} min={2000} max={2100} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 5, fontWeight: 600 }}>Total Usage (kWh)</label>
                  <input className="input-dark" type="number" step="0.01" placeholder="e.g. 42000" value={form.units_kwh} onChange={e => setForm(f => ({ ...f, units_kwh: e.target.value }))} required min={0.01} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 5, fontWeight: 600 }}>Total Cost (₹)</label>
                  <input className="input-dark" type="number" step="0.01" placeholder="e.g. 294000" value={form.cost_inr} onChange={e => setForm(f => ({ ...f, cost_inr: e.target.value }))} required min={0.01} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                    {saving ? 'Synchronizing...' : 'Ingest Record'}
                  </button>
                </div>
              </form>
            )}

            {ingestionMode === 'csv' && (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed rgba(51,65,85,0.8)', borderRadius: 12 }}>
                <UploadCloud size={40} color="#64748b" style={{ marginBottom: 12 }} />
                <h4 style={{ color: '#f1f5f9', margin: '0 0 8px 0' }}>Upload Historical Ledger (.csv)</h4>
                <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 400, margin: '0 auto 16px auto' }}>Quickly import historical billing data. Format columns as: Month, Year, kWh, Cost.</p>
                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }}
                  onChange={handleCSVUpload} />
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()} disabled={csvUploading}>
                  <UploadCloud size={15} /> {csvUploading ? 'Importing...' : 'Select CSV File'}
                </button>
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(15,23,42,0.6)', borderRadius: 8, textAlign: 'left' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>Example CSV Format:</div>
                  <code style={{ fontSize: 11, color: '#06b6d4', lineHeight: 1.8, display: 'block' }}>
                    Month,Year,kWh,Cost<br />
                    Jan,2025,4200,29400<br />
                    Feb,2025,3800,26600<br />
                    Mar,2025,4500,31500
                  </code>
                </div>
              </div>
            )}

            {ingestionMode === 'iot' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Cpu size={40} color="#06b6d4" style={{ marginBottom: 12 }} />
                <h4 style={{ color: '#f1f5f9', margin: '0 0 8px 0' }}>Connect Smart Meters (IoT Edge)</h4>
                <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 450, margin: '0 auto 16px auto' }}>Provision API keys for your facility's Modbus/TCP or MQTT edge devices to stream real-time kWh data.</p>
                <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: '12px 16px', display: 'inline-block', fontSize: 12, color: '#94a3b8' }}>
                  IoT integration is available on the Enterprise plan. Contact sales@energiaudit.in
                </div>
              </div>
            )}

            {ingestionMode === 'api' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Radio size={40} color="#8b5cf6" style={{ marginBottom: 12 }} />
                <h4 style={{ color: '#f1f5f9', margin: '0 0 8px 0' }}>Utility Provider Sync</h4>
                <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 450, margin: '0 auto 16px auto' }}>Automatically sync monthly bills directly from TATA Power, Adani Electricity, or BESCOM portals.</p>
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 8, padding: '12px 16px', display: 'inline-block', fontSize: 12, color: '#94a3b8' }}>
                  Utility API integration is available on the Enterprise plan. Contact sales@energiaudit.in
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
             <button className="btn-secondary" style={{ border: 'none', background: 'transparent' }} onClick={() => setShowConnectors(false)}>Close Pipeline Wizard</button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState icon={<Zap size={48} color="#64748b" />} title="No telemetry data found"
          description="Initialize your facility by establishing a data pipeline."
          action={<button className="btn-primary" onClick={() => setShowConnectors(true)}><Database size={14} /> Setup Connectors</button>} />
      ) : (
        <>
          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
            <SectionCard title="Consumption Velocity (kWh)">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="kWh" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#06b6d4', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Capital Expenditure (₹)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'OpEx']} />
                  <Bar dataKey="Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* Data Table */}
          <SectionCard title="Audited Telemetry Ledger">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Billing Cycle</th><th>Velocity (kWh)</th>
                    <th>OpEx (₹)</th><th>Effective Tariff</th><th>Est. Scope 2 (CO₂)</th><th>Pipeline</th><th>Validation</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].reverse().map(d => {
                    const anom = anomalies.find(a => a.month === d.month && a.year === d.year)
                    return (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{MONTHS[d.month]} {d.year}</td>
                        <td>{d.units_kwh.toLocaleString('en-IN')}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>₹{d.cost_inr.toLocaleString('en-IN')}</td>
                        <td>₹{(d.cost_inr / d.units_kwh).toFixed(2)}/u</td>
                        <td style={{ color: '#94a3b8' }}>{(d.units_kwh * 0.82).toFixed(0)} kg</td>
                        <td><span style={{ fontSize: 11, background: 'rgba(51,65,85,0.5)', padding: '2px 8px', borderRadius: 6, color: '#cbd5e1' }}>{d.source}</span></td>
                        <td>
                          {anom?.is_anomaly
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12, fontWeight: 600 }}><div style={{width: 6, height: 6, borderRadius: 3, background: '#ef4444'}}/> Anomaly</span>
                            : <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12 }}><CheckCircle size={12}/> Verified</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

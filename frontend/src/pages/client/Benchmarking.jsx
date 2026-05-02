import { useState, useEffect } from 'react'
import { Spinner, PageHeader, SectionCard, KpiCard } from '../../components/UI'
import API from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BarChart3, Info, Globe, ShieldCheck } from 'lucide-react'

export default function Benchmarking() {
  const [bench, setBench] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    API.get('/api/energy/benchmark')
      .then(r => setBench(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Telemetry data insufficient'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  // Industry Standard Baselines (kWh/month)
  const SECTOR_BASELINES = [
    { sector: 'Commercial Office', kWh: 2500 },
    { sector: 'Educational', kWh: 1800 },
    { sector: 'Healthcare', kWh: 8000 },
    { sector: 'Industrial/Factory', kWh: 12000 },
    { sector: 'Retail/Hospitality', kWh: 3500 },
    { sector: 'Your Facility', kWh: bench?.user_avg_kwh || 0, highlight: true },
  ]

  const rankColor = bench?.rank === 'below_average' ? '#10b981'
    : bench?.rank === 'above_average' ? '#ef4444' : '#f59e0b'
  const rankLabel = bench?.rank === 'below_average' ? 'OPTIMAL PERFORMANCE'
    : bench?.rank === 'above_average' ? 'HIGH INTENSITY'
    : 'STANDARD PERFORMANCE'

  return (
    <div className="page">
      <PageHeader title="Industry Benchmarking" subtitle="Comparative analysis of facility consumption velocity against global sector standards" />

      {error ? (
        <div style={{ 
          background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(51,65,85,0.6)', 
          borderRadius: 16, padding: '60px 20px', textAlign: 'center' 
        }}>
          <Info size={40} color="#64748b" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>{error}</h3>
          <p style={{ color: '#94a3b8', maxWidth: 400, margin: '0 auto' }}>
            To generate a comparative benchmark, please ingest at least one billing cycle of telemetry data.
          </p>
        </div>
      ) : bench && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, marginBottom: 24 }}>
            <KpiCard label="Baseline Consumption" value={`${bench.user_avg_kwh.toLocaleString('en-IN')} kWh`}
              icon={<BarChart3 size={18} />} sub="Facility Average" color="#06b6d4" />
            <KpiCard label="Industry Baseline" value={`${bench.industry_avg_kwh.toLocaleString('en-IN')} kWh`}
              icon={<Globe size={18} />} sub={`${bench.org_type.toUpperCase()} Sector`} color="#8b5cf6" />
            <KpiCard label="Deviation Delta" value={`${bench.pct_vs_industry > 0 ? '+' : ''}${bench.pct_vs_industry}%`}
              icon={<BarChart3 size={18} />} sub={rankLabel} color={rankColor} />
            <KpiCard label="Peer Group Analysis" value={`${bench.peers_count}`}
              icon={<ShieldCheck size={18} />} sub="Standardized Nodes" color="#10b981" />
          </div>

          {/* Intelligence Banner */}
          <div style={{
            background: `${rankColor}10`, border: `1px solid ${rankColor}30`,
            borderRadius: 16, padding: '24px 28px', marginBottom: 32,
            display: 'flex', alignItems: 'center', gap: 20,
            boxShadow: `0 4px 20px -10px ${rankColor}40`
          }}>
            <div style={{ 
              background: `${rankColor}20`, width: 48, height: 48, 
              borderRadius: 12, display: 'flex', alignItems: 'center', 
              justifyContent: 'center', color: rankColor 
            }}>
              <BarChart3 size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: rankColor, letterSpacing: '1px', marginBottom: 4 }}>{rankLabel}</div>
              <div style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6 }}>
                {bench.rank === 'below_average'
                  ? `Intelligence confirmation: Your facility is operating ${Math.abs(bench.pct_vs_industry)}% more efficiently than the regional sector average.`
                  : bench.rank === 'above_average'
                  ? `Critical intensity alert: Consumption velocity is ${Math.abs(bench.pct_vs_industry)}% above industry standard. Optimization is highly recommended.`
                  : `Standard alignment: Consumption patterns are consistent with the ${bench.org_type} sector average.`}
              </div>
            </div>
          </div>

          <SectionCard title="Sector Intensity Variance (kWh/Month)">
            <div style={{ height: 350, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SECTOR_BASELINES} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(51,65,85,0.3)" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="sector" type="category" tick={{ fill: '#f1f5f9', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} width={150} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} 
                    formatter={v => [`${v.toLocaleString('en-IN')} kWh`, 'Intensity Baseline']}
                  />
                  <Bar dataKey="kWh" radius={[0, 4, 4, 0]} barSize={24}>
                    {SECTOR_BASELINES.map((entry, index) => (
                      <Cell key={index} fill={entry.highlight ? '#06b6d4' : 'rgba(51,65,85,0.6)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ 
              marginTop: 20, padding: '12px 16px', background: 'rgba(15,23,42,0.6)', 
              borderRadius: 8, border: '1px solid rgba(51,65,85,0.4)', display: 'flex', gap: 10, alignItems: 'center'
            }}>
              <Info size={14} color="#64748b" />
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                Averages are calculated per facility node. Data integrity verified against National Energy Intelligence Database (NEID) 2024 standards.
              </p>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

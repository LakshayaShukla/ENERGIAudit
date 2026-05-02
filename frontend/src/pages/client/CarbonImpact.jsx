import { useState, useEffect } from 'react'
import { Spinner, PageHeader, KpiCard, SectionCard, EmptyState } from '../../components/UI'
import API from '../../services/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Leaf, Wind, TreePine, Globe } from 'lucide-react'

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const EMISSION_FACTOR = 0.82

export default function CarbonImpact() {
  const [energy, setEnergy] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([API.get('/api/energy/'), API.get('/api/energy/summary')])
      .then(([e, s]) => { setEnergy(e.data); setSummary(s.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  const totalCo2 = (summary?.total_kwh ?? 0) * EMISSION_FACTOR
  const co2Tonnes = totalCo2 / 1000
  const treesNeeded = Math.ceil(totalCo2 / 21)
  const monthlyAvgCo2 = summary?.months_count ? totalCo2 / summary.months_count : 0

  const chartData = energy.map(d => ({
    name: `${MONTHS[d.month]} ${d.year}`,
    CO2: +(d.units_kwh * EMISSION_FACTOR).toFixed(1),
  }))

  const pieData = [
    { name: 'Emitted', value: +co2Tonnes.toFixed(2) },
    { name: 'Target (50% less)', value: +(co2Tonnes * 0.5).toFixed(2) },
  ]
  const COLORS = ['#ef4444', '#10b981']

  const sustainabilityScore = summary?.sustainability_score ?? 0
  const scoreColor = sustainabilityScore >= 70 ? '#10b981' : sustainabilityScore >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="page">
      <PageHeader title="Carbon Impact" subtitle="Track your carbon footprint and sustainability metrics" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total CO₂ Emitted" value={`${totalCo2.toFixed(0)} kg`}
          icon={<Wind size={18} />} sub={`${co2Tonnes.toFixed(2)} tonnes`} color="#ef4444" />
        <KpiCard label="Monthly Average" value={`${monthlyAvgCo2.toFixed(0)} kg`}
          icon={<Globe size={18} />} sub="CO₂ per month" color="#f59e0b" />
        <KpiCard label="Trees to Offset" value={treesNeeded.toLocaleString('en-IN')}
          icon={<TreePine size={18} />} sub="Trees needed for full offset" color="#10b981" />
        <KpiCard label="Sustainability Score" value={`${sustainabilityScore}/100`}
          icon={<Leaf size={18} />} sub="Composite green rating" color={scoreColor} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <SectionCard title="Monthly CO₂ Emissions (kg)">
          {chartData.length === 0 ? <p style={{ color: '#64748b' }}>No data yet.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="co2grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip formatter={v => [`${v} kg`, 'CO₂']} />
                <Area type="monotone" dataKey="CO2" stroke="#ef4444" fill="url(#co2grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Reduction Potential">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <PieChart width={180} height={180}>
              <Pie data={pieData} cx={90} cy={90} innerRadius={55} outerRadius={80} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
              If you reduce usage by 50%,<br />you'd avoid <strong style={{ color: '#10b981' }}>{co2Tonnes.toFixed(1)}t CO₂</strong>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            {[
              { label: 'India Grid Factor', value: '0.82 kg/kWh' },
              { label: 'Total kWh Used', value: `${(summary?.total_kwh ?? 0).toLocaleString('en-IN')} kWh` },
              { label: 'CO₂ (tonnes)', value: `${co2Tonnes.toFixed(2)} t` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(51,65,85,0.3)', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Sustainability Score Gauge */}
      <SectionCard title="Sustainability Breakdown">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          {[
            { label: 'Energy Efficiency', value: summary?.efficiency_score ?? 0, color: '#06b6d4', weight: '60%' },
            { label: 'Carbon Score', value: Math.max(0, 100 - monthlyAvgCo2 / 10), color: '#10b981', weight: '40%' },
            { label: 'Overall Sustainability', value: sustainabilityScore, color: scoreColor, weight: '100%' },
          ].map(({ label, value, color, weight }) => (
            <div key={label} style={{ padding: '16px', background: 'rgba(30,41,59,0.5)', borderRadius: 12, border: '1px solid rgba(51,65,85,0.4)' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 8 }}>{Math.round(value)}</div>
              <div style={{ background: 'rgba(51,65,85,0.4)', borderRadius: 99, height: 6 }}>
                <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 1s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>Weight: {weight} of score</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

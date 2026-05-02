import { useState, useEffect } from 'react'
import { Spinner, PageHeader, SectionCard, KpiCard, EmptyState } from '../../components/UI'
import API from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingDown, DollarSign, Zap } from 'lucide-react'

export default function SavingsTracker() {
  const [savings, setSavings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/api/savings/').then(r => setSavings(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  const totalSavings = savings.reduce((s, r) => s + r.savings_amount_inr, 0)
  const totalKwhSaved = savings.reduce((s, r) => s + (r.before_usage_kwh - r.after_usage_kwh), 0)
  const avgImprovement = savings.length ? savings.reduce((s, r) => s + r.pct_improvement, 0) / savings.length : 0

  const chartData = savings.map(s => ({
    name: s.period_before,
    Before: s.before_usage_kwh,
    After: s.after_usage_kwh,
  }))

  return (
    <div className="page">
      <PageHeader title="Savings Tracker" subtitle="Compare energy consumption before and after audits" />

      {savings.length === 0 ? (
        <EmptyState icon={<DollarSign size={48} color="#64748b" />} title="No savings data yet"
          description="Complete an energy audit to start tracking your savings and improvements." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Total Savings" value={`₹${totalSavings.toLocaleString('en-IN')}`}
              icon={<DollarSign size={18} />} sub="Cumulative cost savings" color="#10b981" />
            <KpiCard label="Energy Saved" value={`${totalKwhSaved.toLocaleString('en-IN')} kWh`}
              icon={<Zap size={18} />} sub="Total reduction" color="#06b6d4" />
            <KpiCard label="Avg Improvement" value={`${avgImprovement.toFixed(1)}%`}
              icon={<TrendingDown size={18} />} sub="Average % reduction" color="#8b5cf6" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <SectionCard title="Before vs After Comparison (kWh)">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  <Bar dataKey="Before" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="After" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Savings Summary">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {savings.map(s => (
                  <div key={s.id} style={{
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                        {s.period_before} → {s.period_after}
                      </span>
                      <span style={{
                        fontSize: 14, fontWeight: 800, color: '#10b981',
                      }}>↓ {s.pct_improvement.toFixed(1)}%</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Before', value: `${s.before_usage_kwh.toLocaleString('en-IN')} kWh` },
                        { label: 'After', value: `${s.after_usage_kwh.toLocaleString('en-IN')} kWh` },
                        { label: 'Saved', value: `₹${s.savings_amount_inr.toLocaleString('en-IN')}` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ background: 'rgba(51,65,85,0.5)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${Math.min(s.pct_improvement, 100)}%`,
                          background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: 99,
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}

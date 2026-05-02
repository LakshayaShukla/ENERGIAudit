import { useState, useEffect } from 'react'
import { Spinner, PageHeader, SectionCard, KpiCard, AlertBox } from '../../components/UI'
import API from '../../services/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area
} from 'recharts'
import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Predictions() {
  const [energy, setEnergy] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      API.get('/api/energy/'),
      API.get('/api/energy/predict').catch(e => ({ data: null, error: e })),
      API.get('/api/energy/anomalies').catch(() => ({ data: [] })),
    ]).then(([e, p, a]) => {
      setEnergy(e.data)
      setPrediction(p.data)
      setAnomalies(a.data)
      if (!p.data) setError('Need at least 2 months of data for predictions.')
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  const chartData = energy.map(d => ({
    name: `${MONTHS[d.month]} ${d.year}`,
    Actual: d.units_kwh,
    Cost: d.cost_inr,
    isAnomaly: anomalies.find(a => a.month === d.month && a.year === d.year)?.is_anomaly || false,
  }))

  if (prediction) {
    chartData.push({
      name: `${MONTHS[prediction.next_month]} ${prediction.next_year}`,
      Predicted: prediction.predicted_kwh,
      PredictedCost: prediction.predicted_cost_inr,
    })
  }

  const trendColor = prediction?.trend_pct > 0 ? '#ef4444' : '#10b981'
  const trendIcon = prediction?.trend_pct > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />
  const anomalyCount = anomalies.filter(a => a.is_anomaly).length

  return (
    <div className="page">
      <PageHeader title="Predictive Analytics" subtitle="AI-powered forecasts and anomaly detection" />

      {error ? (
        <AlertBox type="warning">{error}</AlertBox>
      ) : prediction && (
        <>
          <div style={{ marginBottom: 20 }}>
            <AlertBox type={prediction.trend_pct > 5 ? 'warning' : prediction.trend_pct < -5 ? 'success' : 'info'}>
              <strong>Prediction Insight:</strong> {prediction.message}
            </AlertBox>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
            <KpiCard label="Predicted Usage" value={`${prediction.predicted_kwh.toLocaleString('en-IN')} kWh`}
              icon={<Brain size={18} />} sub={`${MONTHS[prediction.next_month]} ${prediction.next_year}`} color="#8b5cf6" />
            <KpiCard label="Predicted Cost" value={`₹${prediction.predicted_cost_inr.toLocaleString('en-IN')}`}
              icon={<TrendingUp size={18} />} sub="Estimated next month" color="#06b6d4" />
            <KpiCard label="Trend" value={`${prediction.trend_pct > 0 ? '+' : ''}${prediction.trend_pct}%`}
              icon={trendIcon} sub="Month-over-month change" color={trendColor} />
            <KpiCard label="Anomalies" value={`${anomalyCount}`}
              icon={<AlertTriangle size={18} />} sub="Unusual months detected" color={anomalyCount > 0 ? '#f59e0b' : '#10b981'} />
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
        <SectionCard title="Consumption History + Forecast">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="Actual" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} connectNulls />
              <Line type="monotone" dataKey="Predicted" stroke="#8b5cf6" strokeWidth={2}
                strokeDasharray="6 4" dot={{ fill: '#8b5cf6', r: 6 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Anomaly Table */}
      {anomalies.length > 0 && (
        <SectionCard title="Anomaly Detection Results">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th><th>Year</th><th>Usage (kWh)</th><th>Z-Score</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((a, i) => (
                  <tr key={i} style={{ background: a.is_anomaly ? 'rgba(245,158,11,0.04)' : undefined }}>
                    <td>{MONTHS[a.month]}</td>
                    <td>{a.year}</td>
                    <td>{a.units_kwh.toLocaleString('en-IN')}</td>
                    <td style={{ color: Math.abs(a.z_score) > 2 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{a.z_score}</td>
                    <td>{a.is_anomaly
                      ? <span className="tag tag-amber"><AlertTriangle size={11} /> Anomaly</span>
                      : <span className="tag tag-green">Normal</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

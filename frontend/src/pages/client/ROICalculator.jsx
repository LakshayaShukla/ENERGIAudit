import { useState, useEffect } from 'react'
import { Spinner, PageHeader, SectionCard } from '../../components/UI'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { Calculator, DollarSign, Clock, TrendingUp, Sparkles, Save, Info } from 'lucide-react'

const INVESTMENT_TYPES = [
  { id: 'Rooftop Solar', min: 500000, max: 10000000, defaultSavings: 0.15 },
  { id: 'LED Lighting', min: 50000, max: 1000000, defaultSavings: 0.40 },
  { id: 'HVAC Upgrade', min: 200000, max: 5000000, defaultSavings: 0.25 },
  { id: 'Smart Meters', min: 100000, max: 500000, defaultSavings: 0.10 },
  { id: 'Battery Storage', min: 800000, max: 8000000, defaultSavings: 0.20 },
]

export default function ROICalculator() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Interactive State
  const [typeIdx, setTypeIdx] = useState(0)
  const [investment, setInvestment] = useState(INVESTMENT_TYPES[0].min * 2)
  const [savingsPct, setSavingsPct] = useState(INVESTMENT_TYPES[0].defaultSavings)
  
  const currentType = INVESTMENT_TYPES[typeIdx]

  const load = () => API.get('/api/roi/').then(r => setHistory(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  // Local calculation for real-time slider updates
  const monthlySavings = (investment * savingsPct) / 12
  const paybackMonths = monthlySavings > 0 ? investment / monthlySavings : 0
  const roiPct = investment > 0 ? ((monthlySavings * 12) / investment) * 100 : 0
  
  // Projected 5-year and 10-year savings
  const savings5Y = (monthlySavings * 12 * 5) - investment
  const savings10Y = (monthlySavings * 12 * 10) - investment

  const handleSaveScenario = async () => {
    setSaving(true)
    try {
      await API.post('/api/roi/calculate', {
        investment_inr: investment,
        monthly_savings_inr: monthlySavings,
        investment_type: currentType.id,
      })
      toast.success('Scenario saved to history!')
      load()
    } catch (err) {
      toast.error('Failed to save scenario')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page"><Spinner /></div>

  return (
    <div className="page">
      <PageHeader title="Interactive Scenario Builder" subtitle="Simulate investments and forecast your energy returns in real-time." />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
        
        {/* Interactive Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Controls */}
          <SectionCard title="Configure Upgrade Scenario">
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 12, fontWeight: 600 }}>Upgrade Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INVESTMENT_TYPES.map((t, idx) => (
                  <button key={t.id} 
                    onClick={() => {
                      setTypeIdx(idx)
                      setInvestment(t.min * 2)
                      setSavingsPct(t.defaultSavings)
                    }}
                    style={{
                      background: typeIdx === idx ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'rgba(30,41,59,0.8)',
                      color: typeIdx === idx ? '#fff' : '#94a3b8',
                      border: `1px solid ${typeIdx === idx ? '#06b6d4' : '#334155'}`,
                      padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: typeIdx === idx ? '0 4px 15px rgba(6,182,212,0.3)' : 'none'
                    }}>
                    {t.id}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 30, background: 'rgba(15,23,42,0.4)', padding: 20, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Capital Investment</label>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#06b6d4' }}>₹{investment.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min={currentType.min} max={currentType.max} step={10000} value={investment} 
                onChange={(e) => setInvestment(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#64748b' }}>
                <span>₹{currentType.min.toLocaleString('en-IN')}</span>
                <span>₹{currentType.max.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginBottom: 10, background: 'rgba(15,23,42,0.4)', padding: 20, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Estimated Efficiency Gain</label>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{(savingsPct * 100).toFixed(1)}%</span>
              </div>
              <input type="range" min={0.05} max={0.80} step={0.01} value={savingsPct} 
                onChange={(e) => setSavingsPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
               <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
                 <Info size={14} /> Adjust based on the technology tier and vendor specs.
               </div>
            </div>
            
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={handleSaveScenario} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={15} /> {saving ? 'Saving...' : 'Save Scenario'}
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Live Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SectionCard title="Forecast Results" 
            style={{ 
              background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.8) 100%)',
              borderColor: 'rgba(6,182,212,0.3)',
              boxShadow: '0 10px 40px rgba(6,182,212,0.1)'
            }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Payback Period</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{(paybackMonths/12).toFixed(1)} <span style={{fontSize: 14, color: '#94a3b8'}}>Yrs</span></div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{paybackMonths.toFixed(0)} months</div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#10b981', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Annual ROI</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>{roiPct.toFixed(1)}%</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Yield on cost</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
               <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Cash Flow Projection (Net Profit)</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '12px 16px', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>Annual Savings</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>+ ₹{(monthlySavings * 12).toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '12px 16px', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>5-Year Net Position</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: savings5Y >= 0 ? '#10b981' : '#ef4444' }}>
                      {savings5Y >= 0 ? '+' : '-'} ₹{Math.abs(savings5Y).toLocaleString('en-IN', {maximumFractionDigits:0})}
                    </span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.6)', padding: '12px 16px', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>10-Year Net Position</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: savings10Y >= 0 ? '#10b981' : '#ef4444' }}>
                      {savings10Y >= 0 ? '+' : '-'} ₹{Math.abs(savings10Y).toLocaleString('en-IN', {maximumFractionDigits:0})}
                    </span>
                 </div>
               </div>
            </div>
          </SectionCard>

          {/* History */}
          <SectionCard title="Saved Scenarios">
            {history.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No scenarios saved yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '300px', overflowY: 'auto', paddingRight: 4 }}>
                {history.map(h => (
                  <div key={h.id} style={{
                    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.4)',
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.2s'
                  }} className="hover:border-cyan-500" onClick={() => {
                     const typeIndex = INVESTMENT_TYPES.findIndex(t => t.id === h.investment_type)
                     if(typeIndex > -1) setTypeIdx(typeIndex)
                     setInvestment(h.investment_inr)
                     setSavingsPct((h.monthly_savings_inr * 12) / h.investment_inr)
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{h.investment_type || 'Upgrade'}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>ROI: {h.roi_pct}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                      <span>Inv: ₹{h.investment_inr.toLocaleString('en-IN')}</span>
                      <span>Save: ₹{h.monthly_savings_inr.toLocaleString('en-IN')}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

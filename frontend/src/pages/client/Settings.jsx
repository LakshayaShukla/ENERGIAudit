import { useState } from 'react'
import { PageHeader, SectionCard } from '../../components/UI'
import toast from 'react-hot-toast'
import { Save, UploadCloud, Building, Zap, DollarSign } from 'lucide-react'

export default function Settings() {
  const [profile, setProfile] = useState({
    companyName: 'Acme Corp Industries',
    industry: 'Manufacturing',
    contactEmail: 'admin@acmecorp.com'
  })

  const [preferences, setPreferences] = useState({
    tariffRate: 8.5,
    currency: 'INR',
    baselineMonths: 3
  })

  const handleSaveProfile = (e) => {
    e.preventDefault()
    toast.success('Company profile updated')
  }

  const handleSavePreferences = (e) => {
    e.preventDefault()
    toast.success('System preferences saved. ROI calculations updated.')
  }

  return (
    <div className="page">
      <PageHeader title="Platform Settings" subtitle="Configure white-labeling, financial constants, and system preferences" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* Profile & White-Labeling */}
        <SectionCard title="Organization Profile">
          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
               <div style={{ width: 80, height: 80, borderRadius: 12, background: 'rgba(30,41,59,0.8)', border: '2px dashed rgba(100,116,139,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', cursor: 'pointer', color: '#94a3b8' }}>
                 <UploadCloud size={24} style={{ marginBottom: 4 }} />
                 <span style={{ fontSize: 10 }}>Logo</span>
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Company Name</label>
                 <div style={{ position: 'relative' }}>
                   <Building size={16} color="#64748b" style={{ position: 'absolute', top: 12, left: 12 }} />
                   <input className="input-dark" style={{ paddingLeft: 36 }} type="text" value={profile.companyName} onChange={e => setProfile({...profile, companyName: e.target.value})} />
                 </div>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Industry Sector</label>
                <select className="input-dark" value={profile.industry} onChange={e => setProfile({...profile, industry: e.target.value})}>
                  <option>Manufacturing</option>
                  <option>IT / Data Center</option>
                  <option>Healthcare</option>
                  <option>Retail</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Contact Email</label>
                <input className="input-dark" type="email" value={profile.contactEmail} onChange={e => setProfile({...profile, contactEmail: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn-primary"><Save size={15}/> Save Profile</button>
          </form>
        </SectionCard>

        {/* Financial Preferences */}
        <SectionCard title="Financial & Analytics Preferences">
          <form onSubmit={handleSavePreferences}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Base Tariff Rate (per kWh)</label>
                <div style={{ position: 'relative' }}>
                   <Zap size={16} color="#64748b" style={{ position: 'absolute', top: 12, left: 12 }} />
                   <input className="input-dark" style={{ paddingLeft: 36 }} type="number" step="0.1" value={preferences.tariffRate} onChange={e => setPreferences({...preferences, tariffRate: e.target.value})} />
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Used as baseline for ROI calculations if exact ledger is missing.</div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>Primary Currency</label>
                <div style={{ position: 'relative' }}>
                   <DollarSign size={16} color="#64748b" style={{ position: 'absolute', top: 12, left: 12 }} />
                   <select className="input-dark" style={{ paddingLeft: 36 }} value={preferences.currency} onChange={e => setPreferences({...preferences, currency: e.target.value})}>
                     <option value="INR">INR (₹)</option>
                     <option value="USD">USD ($)</option>
                     <option value="EUR">EUR (€)</option>
                   </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
               <label style={{ fontSize: 12, color: 'var(--color-muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>M&V Baseline Period (Months)</label>
               <input className="input-dark" type="number" min="1" max="12" value={preferences.baselineMonths} onChange={e => setPreferences({...preferences, baselineMonths: e.target.value})} />
               <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Measurement & Verification baseline duration for comparing 'before' and 'after' implementation savings.</div>
            </div>

            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}><Save size={15}/> Update Preferences</button>
          </form>
        </SectionCard>

      </div>
    </div>
  )
}

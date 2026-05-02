import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Activity, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const ORG_TYPES = ['office', 'school', 'hospital', 'factory', 'retail', 'other']
const ROLES = ['client', 'auditor']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'client',
    org_type: 'office', org_size: '', floor_area_sqft: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({
        ...form,
        org_size: form.org_size ? parseInt(form.org_size) : undefined,
        floor_area_sqft: form.floor_area_sqft ? parseFloat(form.floor_area_sqft) : undefined,
      })
      toast.success(form.role === 'auditor'
        ? 'Account created! Awaiting admin approval.'
        : 'Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #0a1628 100%)',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={24} color="white" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>Join EnergiAudit to start optimizing energy</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Full Name / Organization</label>
              <input className="input-dark" placeholder="TechCorp Pvt Ltd" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Email</label>
              <input className="input-dark" type="email" placeholder="you@company.com" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Password</label>
              <input className="input-dark" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Account Role</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r} type="button" onClick={() => set('role', r)}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
                      fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
                      border: form.role === r ? '1px solid #06b6d4' : '1px solid #334155',
                      background: form.role === r ? 'rgba(6,182,212,0.12)' : 'rgba(30,41,59,0.5)',
                      color: form.role === r ? '#06b6d4' : '#64748b',
                      transition: 'all 0.15s',
                    }}>{r}</button>
                ))}
              </div>
              {form.role === 'auditor' && (
                <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={12} /> Auditor accounts require admin approval before platform access.
                </p>
              )}
            </div>
            {form.role === 'client' && (
              <>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Organization Type</label>
                  <select className="input-dark" value={form.org_type} onChange={e => set('org_type', e.target.value)}
                    style={{ cursor: 'pointer' }}>
                    {ORG_TYPES.map(t => <option key={t} value={t} style={{ background: '#1e293b' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Staff Count</label>
                    <input className="input-dark" type="number" placeholder="e.g. 250" value={form.org_size}
                      onChange={e => set('org_size', e.target.value)} min={1} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Floor Area (sq.ft)</label>
                    <input className="input-dark" type="number" placeholder="e.g. 15000" value={form.floor_area_sqft}
                      onChange={e => set('floor_area_sqft', e.target.value)} min={1} />
                  </div>
                </div>
              </>
            )}
            <button className="btn-primary" type="submit" disabled={loading}
              style={{ marginTop: 4, justifyContent: 'center', padding: '12px' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

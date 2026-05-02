import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Mail, Lock, Eye, EyeOff, Activity, FileText, Brain, Leaf } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const role = await login(form.email, form.password)
      toast.success('Welcome back!')
      if (role === 'admin') navigate('/admin')
      else if (role === 'auditor') navigate('/auditor')
      else navigate('/client')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 60%, #0a1628 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', background: 'rgba(6,182,212,0.03)',
        borderRight: '1px solid rgba(51,65,85,0.3)',
      }} className="hidden-mobile">
        <div style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={24} color="white" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>EnergiAudit</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 16 }}>
            Intelligent Energy<br />
            <span className="gradient-text">Intelligence Platform</span>
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 36 }}>
            Monitor, analyze, predict and optimize your organization's energy consumption.
            Track cost savings and measure your sustainability impact.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <Activity size={18} />, text: 'Real-time energy dashboards & KPIs' },
              { icon: <FileText size={18} />, text: 'Professional energy audits & reports' },
              { icon: <Brain size={18} />, text: 'AI-powered predictions & anomaly detection' },
              { icon: <Leaf size={18} />, text: 'Carbon footprint tracking & sustainability scoring' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#06b6d4' }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div style={{
        width: 480, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '40px 48px',
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>EnergiAudit</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Sign in</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>Access your energy intelligence dashboard</p>
        </div>



        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className="input-dark" style={{ paddingLeft: 36 }} type="email" placeholder="you@company.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className="input-dark" style={{ paddingLeft: 36, paddingRight: 40 }}
                type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center', padding: '12px' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}

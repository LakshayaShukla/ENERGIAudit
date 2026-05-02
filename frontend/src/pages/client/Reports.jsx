import { useState } from 'react'
import { PageHeader } from '../../components/UI'
import API from '../../services/api'
import toast from 'react-hot-toast'
import { FileText, Download, Leaf, Zap } from 'lucide-react'

export default function Reports() {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async (endpoint, filename) => {
    setGenerating(true)
    try {
      const res = await API.get(endpoint, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Report downloaded successfully!')
    } catch (err) {
      toast.error('Failed to generate report. Make sure you have data.')
    } finally {
      setGenerating(false)
    }
  }

  const availableReports = [
    {
      title: 'Comprehensive Energy Report',
      description: 'Contains monthly usage summary, cost breakdowns, and total CO2 estimates. Ideal for financial and operational review.',
      icon: <Zap size={24} />,
      color: '#06b6d4',
      endpoint: '/api/reports/energy',
      filename: `energy_report_${new Date().toISOString().split('T')[0]}.pdf`
    },
    {
      title: 'Carbon Impact & Sustainability',
      description: 'Detailed breakdown of your carbon footprint, emission factors, and equivalent trees needed to offset your usage. Ideal for ESG compliance.',
      icon: <Leaf size={24} />,
      color: '#10b981',
      endpoint: '/api/reports/carbon',
      filename: `sustainability_report_${new Date().toISOString().split('T')[0]}.pdf`
    }
  ]

  return (
    <div className="page">
      <PageHeader title="Sustainability & Data Reports" subtitle="Generate and download automated compliance & audit reports on the fly." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
        {availableReports.map((report, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `rgba(${report.color === '#06b6d4' ? '6,182,212' : '16,185,129'},0.1)`, 
                border: `1px solid rgba(${report.color === '#06b6d4' ? '6,182,212' : '16,185,129'},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: report.color,
              }}>
                {report.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.3 }}>{report.title}</h3>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  {report.description}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 16 }}>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleDownload(report.endpoint, report.filename)} disabled={generating}>
                <Download size={15} /> {generating ? 'Generating PDF...' : 'Download PDF Report'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

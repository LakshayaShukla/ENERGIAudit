import { useState, useEffect } from 'react'
import { Spinner, PageHeader, EmptyState } from '../../components/UI'
import API from '../../services/api'
import { Trophy, Award, Leaf, Zap, Star, Shield } from 'lucide-react'

const BADGE_CONFIG = {
  energy_efficient: {
    label: 'Energy Efficient',
    description: 'Maintained energy efficiency score above 80 for 3 consecutive months',
    icon: <Zap size={28} />,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05))',
    borderColor: 'rgba(6,182,212,0.3)',
  },
  carbon_reducer: {
    label: 'Carbon Reducer',
    description: 'Reduced carbon emissions by more than 15% compared to baseline',
    icon: <Leaf size={28} />,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  quick_adopter: {
    label: 'Quick Adopter',
    description: 'Implemented audit recommendations within 30 days of completion',
    icon: <Star size={28} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    borderColor: 'rgba(245,158,11,0.3)',
  },
  top_saver: {
    label: 'Top Saver',
    description: 'Achieved the highest savings percentage among peers in the same sector',
    icon: <Award size={28} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
    borderColor: 'rgba(139,92,246,0.3)',
  },
}

export default function Achievements() {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/api/badges/').then(r => setBadges(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><Spinner /></div>

  // All possible badges for display
  const allBadgeTypes = Object.keys(BADGE_CONFIG)
  const earnedTypes = badges.map(b => b.badge_type)

  return (
    <div className="page">
      <PageHeader title="Achievements" subtitle="Track your sustainability milestones and badges" />

      {/* Earned badges count */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.12))',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#8b5cf6',
        }}>
          <Trophy size={28} />
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
            {badges.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>of {allBadgeTypes.length} badges earned</span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
            {badges.length === 0
              ? 'Start your sustainability journey to earn badges'
              : badges.length === allBadgeTypes.length
                ? 'Congratulations! You have earned all available badges'
                : 'Keep improving to unlock more achievements'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ background: 'rgba(51,65,85,0.4)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(badges.length / allBadgeTypes.length) * 100}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
            borderRadius: 99,
            transition: 'width 1s ease',
          }} />
        </div>
      </div>

      {/* Badge Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {allBadgeTypes.map(type => {
          const config = BADGE_CONFIG[type]
          const earned = earnedTypes.includes(type)
          const badge = badges.find(b => b.badge_type === type)

          return (
            <div key={type} style={{
              background: earned ? config.gradient : 'rgba(15,23,42,0.6)',
              border: `1px solid ${earned ? config.borderColor : 'rgba(51,65,85,0.4)'}`,
              borderRadius: 16, padding: 24,
              opacity: earned ? 1 : 0.5,
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {earned && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: config.color, color: '#fff',
                  borderRadius: 99, width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield size={14} />
                </div>
              )}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: earned ? `${config.color}20` : 'rgba(51,65,85,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: earned ? config.color : '#475569',
                marginBottom: 16,
              }}>
                {config.icon}
              </div>
              <h3 style={{
                fontSize: 16, fontWeight: 700,
                color: earned ? '#f1f5f9' : '#64748b',
                marginBottom: 6,
              }}>
                {config.label}
              </h3>
              <p style={{
                fontSize: 13, color: earned ? '#94a3b8' : '#475569',
                lineHeight: 1.5, marginBottom: earned ? 12 : 0,
              }}>
                {config.description}
              </p>
              {earned && badge && (
                <div style={{
                  fontSize: 11, color: '#64748b',
                  paddingTop: 10, borderTop: '1px solid rgba(51,65,85,0.3)',
                }}>
                  Awarded: {new Date(badge.awarded_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              )}
              {!earned && (
                <div style={{
                  marginTop: 12, fontSize: 11, color: '#475569', fontStyle: 'italic',
                }}>
                  Not yet earned
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

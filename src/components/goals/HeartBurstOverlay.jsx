import { useState, useEffect } from 'react'

const HEART = "M9 15.5S1.5 10.5 1.5 5.5a4 4 0 0 1 7.5-1.9A4 4 0 0 1 16.5 5.5c0 5-7.5 10-7.5 10z"

function HeartSvg({ size = 80, color = '#8b1a4a', style }) {
  return (
    <svg width={size} height={size * 0.94} viewBox="0 0 18 17" fill="none" style={style}>
      <path d={HEART} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={color} />
    </svg>
  )
}

function DailyAnimation({ id }) {
  return (
    <div key={id} style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 9999 }}>
      <HeartSvg size={80} style={{ animation: 'goal-pop 0.8s ease-out forwards' }} />
    </div>
  )
}

function WeeklyAnimation({ id }) {
  return (
    <div key={id} style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 9999 }}>
      <div style={{ position: 'relative', width: 0, height: 0 }}>
        <div style={{ position: 'absolute', animation: 'heart-fly-1 1s ease-out forwards' }}>
          <HeartSvg size={52} />
        </div>
        <div style={{ position: 'absolute', animation: 'heart-fly-2 1s ease-out forwards' }}>
          <HeartSvg size={70} />
        </div>
        <div style={{ position: 'absolute', animation: 'heart-fly-3 1s ease-out forwards' }}>
          <HeartSvg size={52} />
        </div>
      </div>
    </div>
  )
}

function MonthlyAnimation({ id }) {
  return (
    <div key={id} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {/* Big bouncing heart */}
      <HeartSvg size={120} style={{
        position: 'absolute', top: '50%', left: '50%',
        animation: 'monthly-big 1.2s cubic-bezier(0.16,1,0.3,1) forwards',
      }} />
      {/* Scattered small hearts */}
      {[
        { anim: 'scatter-1', size: 40 },
        { anim: 'scatter-2', size: 40 },
        { anim: 'scatter-3', size: 30 },
        { anim: 'scatter-4', size: 30 },
        { anim: 'scatter-5', size: 36 },
      ].map(({ anim, size }, i) => (
        <HeartSvg key={i} size={size} style={{
          position: 'absolute', top: '50%', left: '50%',
          animation: `${anim} 1.2s ease-out forwards`,
          animationDelay: `${i * 0.05}s`,
        }} />
      ))}
    </div>
  )
}

const YEARLY_HEARTS = [
  { tx: -200, ty: -220, r: -40, r2: -60, size: 56, delay: 0 },
  { tx:  200, ty: -220, r:  40, r2:  60, size: 56, delay: 0.05 },
  { tx: -260, ty:   20, r: -70, r2: -100, size: 44, delay: 0.1 },
  { tx:  260, ty:   20, r:  70, r2:  100, size: 44, delay: 0.1 },
  { tx: -120, ty: -280, r: -20, r2: -35, size: 48, delay: 0.07 },
  { tx:  120, ty: -280, r:  20, r2:  35, size: 48, delay: 0.07 },
  { tx:    0, ty: -300, r:   0, r2:   0, size: 52, delay: 0.03 },
  { tx: -200, ty:  120, r: -50, r2: -80, size: 38, delay: 0.12 },
  { tx:  200, ty:  120, r:  50, r2:  80, size: 38, delay: 0.12 },
]

function YearlyAnimation({ id }) {
  return (
    <div key={id} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle, #f3e6ec 0%, transparent 70%)',
        animation: 'yearly-flash 1.5s ease-out forwards',
      }} />
      {YEARLY_HEARTS.map((h, i) => (
        <HeartSvg key={i} size={h.size} style={{
          position: 'absolute', top: '50%', left: '50%',
          '--tx': `${h.tx}px`, '--ty': `${h.ty}px`,
          '--r': `${h.r}deg`, '--r2': `${h.r2}deg`,
          animation: `yearly-heart 1.5s cubic-bezier(0.16,1,0.3,1) forwards`,
          animationDelay: `${h.delay}s`,
        }} />
      ))}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        animation: 'yearly-text 1.5s ease-out forwards',
        fontWeight: 700, fontSize: 22, color: '#8b1a4a',
        whiteSpace: 'nowrap', letterSpacing: '-0.3px',
        textShadow: '0 2px 12px rgba(139,26,74,0.3)',
      }}>
        Jahres-Ziel! 🎯
      </div>
    </div>
  )
}

export function HeartBurstOverlay() {
  const [event, setEvent] = useState(null) // { scope, key }

  useEffect(() => {
    function handler(e) {
      const scope = e.detail?.scope || 'daily'
      setEvent({ scope, key: Date.now() })
      const duration = scope === 'yearly' ? 1600 : scope === 'monthly' ? 1300 : scope === 'weekly' ? 1100 : 900
      setTimeout(() => setEvent(null), duration)
    }
    window.addEventListener('goal-completed', handler)
    return () => window.removeEventListener('goal-completed', handler)
  }, [])

  if (!event) return null

  if (event.scope === 'yearly')  return <YearlyAnimation  id={event.key} />
  if (event.scope === 'monthly') return <MonthlyAnimation id={event.key} />
  if (event.scope === 'weekly')  return <WeeklyAnimation  id={event.key} />
  return <DailyAnimation id={event.key} />
}

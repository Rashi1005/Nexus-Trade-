import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const COLOR_MAP = {
  cyan:   { grad: 'linear-gradient(135deg,#00F5FF,#0070ff)', glow: 'rgba(0,245,255,0.25)', border: 'rgba(0,245,255,0.2)',  text: '#00F5FF' },
  purple: { grad: 'linear-gradient(135deg,#8B5CF6,#a855f7)', glow: 'rgba(139,92,246,0.25)', border: 'rgba(139,92,246,0.2)', text: '#8B5CF6' },
  green:  { grad: 'linear-gradient(135deg,#00FF88,#00d4a3)', glow: 'rgba(0,255,136,0.25)', border: 'rgba(0,255,136,0.2)',  text: '#00FF88' },
  orange: { grad: 'linear-gradient(135deg,#FF9500,#ff6b35)', glow: 'rgba(255,149,0,0.25)',  border: 'rgba(255,149,0,0.2)',  text: '#FF9500' },
}

const StatsCard = ({ title, value, prefix = '', suffix = '', icon: Icon, change, changePercent, color = 'cyan', delay = 0 }) => {
  const ref = useRef(null)
  const [displayed, setDisplayed] = useState(0)
  const c = COLOR_MAP[color] || COLOR_MAP.cyan

  // 3D tilt
  const handleMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`
  }
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
  }

  // Animated counter
  useEffect(() => {
    const numVal = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
    if (numVal === 0) { setDisplayed(0); return }
    const duration = 1200
    const start = performance.now()
    const raf = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(numVal * eased)
      if (p < 1) requestAnimationFrame(raf)
    }
    const id = setTimeout(() => requestAnimationFrame(raf), delay * 1000)
    return () => clearTimeout(id)
  }, [value, delay])

  const formatDisplayed = () => {
    const v = displayed
    if (v >= 1000000) return (v / 1000000).toFixed(2) + 'M'
    if (v >= 1000)    return (v / 1000).toFixed(2) + 'K'
    return v.toFixed(2)
  }

  const isUp   = change > 0
  const isDown = change < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22,1,0.36,1] }}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: 24,
        cursor: 'default',
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${c.border}`,
      }}
      whileHover={{ boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${c.glow}` }}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.grad, boxShadow: `0 0 16px ${c.glow}` }}>
          {Icon && <Icon className="w-5 h-5 text-white" strokeWidth={2} />}
        </div>
        {change !== undefined && (
          <span className={`badge ${isUp ? 'badge-up' : isDown ? 'badge-down' : 'badge-neutral'} text-xs`}>
            {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5 inline" /> : isDown ? <ArrowDownRight className="w-3 h-3 mr-0.5 inline" /> : null}
            {changePercent ? Math.abs(changePercent).toFixed(2) + '%' : '0%'}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-3xl font-mono-custom font-bold" style={{ color: c.text }}>
          {prefix}{formatDisplayed()}{suffix}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm text-muted font-medium">{title}</p>

      {/* Change */}
      {change !== undefined && (
        <p className={`text-xs mt-1 font-mono-custom ${isUp ? 'text-green' : isDown ? 'text-red' : 'text-muted'}`}>
          {isUp ? '+' : ''}{typeof change === 'number' ? change.toFixed(2) : change}
        </p>
      )}
    </motion.div>
  )
}

export default StatsCard
import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

// Decorative sparkline SVG
const Sparkline = ({ up }) => {
  const color = up ? '#00FF88' : '#FF2D55'
  const d = up
    ? 'M0,18 C10,16 15,12 25,10 C35,8 40,11 50,9 C60,7 65,4 75,5 C85,6 90,3 100,2'
    : 'M0,4 C10,6 15,8 25,10 C35,12 40,9 50,13 C60,17 65,14 75,16 C85,18 90,15 100,18'
  return (
    <svg viewBox="0 0 100 22" width="90" height="28" style={{ display:'block' }}>
      <defs>
        <linearGradient id={`sg-${up}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={`url(#sg-${up})`} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const StockCard = ({ stock, onTrade }) => {
  const ref = useRef(null)
  const { symbol, name, current_price, change, change_percent } = stock
  const up = change >= 0

  const handleMouseMove = (e) => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
  }
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: 20,
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s',
        cursor: 'default',
      }}
      whileHover={{ boxShadow: up
        ? '0 20px 50px rgba(0,0,0,0.4), 0 0 24px rgba(0,255,136,0.12)'
        : '0 20px 50px rgba(0,0,0,0.4), 0 0 24px rgba(255,45,85,0.12)'
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-orbitron font-bold text-lg text-white tracking-wide">{symbol}</div>
          <div className="text-xs text-muted mt-0.5 truncate max-w-[140px]">{name}</div>
        </div>
        <span className={`badge ${up ? 'badge-up' : 'badge-down'} text-xs`}>
          {up ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
          {Math.abs(change_percent || 0).toFixed(2)}%
        </span>
      </div>

      {/* Price + Sparkline */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className={`text-2xl font-mono-custom font-bold ${up ? 'gradient-text-green' : 'gradient-text-red'}`}>
            {formatCurrency(current_price)}
          </div>
          <div className={`text-xs font-mono-custom mt-0.5 ${up ? 'text-green' : 'text-red'}`}>
            {up ? '+' : ''}{change?.toFixed(2) || '0.00'}
          </div>
        </div>
        <Sparkline up={up} />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onTrade?.(symbol, 'buy')}
          className="btn btn-success py-2 text-sm rounded-lg font-semibold"
          style={{ padding: '8px 0', fontSize: 13 }}
        >
          Buy
        </button>
        <button
          onClick={() => onTrade?.(symbol, 'sell')}
          className="btn btn-danger py-2 text-sm rounded-lg font-semibold"
          style={{ padding: '8px 0', fontSize: 13 }}
        >
          Sell
        </button>
      </div>
    </motion.div>
  )
}

export default StockCard
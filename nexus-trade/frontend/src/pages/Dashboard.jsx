import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, TrendingUp, Activity, Target, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Loading from '../components/common/Loading'
import ParticleBackground from '../components/common/ParticleBackground'
import { portfolioService } from '../services/portfolioService'
import { marketService } from '../services/marketService'
import { useAuthStore } from '../store/authStore'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ── Mini StatCard inline (no external dependency issues) ── */
const StatCard = ({ label, value, icon:Icon, iconBg, change, changeUp, delay=0 }) => (
  <motion.div
    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.5, ease:[0.22,1,0.36,1] }}
    style={{
      background:'rgba(13,20,40,0.75)',
      backdropFilter:'blur(20px)',
      border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:16,
      padding:'20px',
      transition:'box-shadow 0.3s, border-color 0.3s',
    }}
    whileHover={{ boxShadow:'0 16px 40px rgba(0,0,0,0.4)', borderColor:'rgba(139,111,255,0.25)' }}>
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
      <div style={{ width:40, height:40, borderRadius:12, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color="#fff" strokeWidth={2} />
      </div>
      {change !== undefined && (
        <span style={{
          display:'inline-flex', alignItems:'center', gap:2, padding:'3px 8px', borderRadius:99,
          fontSize:12, fontWeight:600,
          background: changeUp ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
          color: changeUp ? '#34D399' : '#FB7185',
          border: `1px solid ${changeUp ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}`,
        }}>
          {changeUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
    <div className="font-mono-custom" style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:700, color:'#E2E8F0', marginBottom:4 }}>{value}</div>
    <div style={{ fontSize:13, color:'#64748B', fontWeight:500 }}>{label}</div>
  </motion.div>
)

/* ── Stock Card inline ── */
const StockRow = ({ stock, onTrade }) => {
  const up = stock.change >= 0
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      style={{ background:'rgba(13,20,40,0.75)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'18px 20px', transition:'all 0.3s' }}
      whileHover={{ borderColor:'rgba(139,111,255,0.3)', boxShadow:'0 12px 32px rgba(0,0,0,0.35)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <div className="font-orbitron" style={{ fontSize:16, fontWeight:700, color:'#E2E8F0' }}>{stock.symbol}</div>
          <div style={{ fontSize:12, color:'#475569', marginTop:2 }}>{stock.name}</div>
        </div>
        <span style={{
          display:'inline-flex', alignItems:'center', gap:2, padding:'4px 10px', borderRadius:99,
          fontSize:12, fontWeight:700,
          background: up ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)',
          color: up ? '#34D399' : '#FB7185',
          border: `1px solid ${up ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)'}`,
        }}>
          {up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>}
          {Math.abs(stock.change_percent||0).toFixed(2)}%
        </span>
      </div>
      <div className="font-mono-custom" style={{ fontSize:22, fontWeight:700, marginBottom:2, background: up ? 'linear-gradient(90deg,#34D399,#22D3EE)' : 'linear-gradient(90deg,#FB7185,#F97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        {formatCurrency(stock.current_price)}
      </div>
      <div style={{ fontSize:12, color: up ? '#34D399':'#FB7185', marginBottom:14, fontFamily:'JetBrains Mono,monospace' }}>
        {up?'+':''}{stock.change?.toFixed(2)||'0.00'} today
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <button className="btn btn-success" onClick={() => onTrade(stock.symbol,'buy')} style={{ padding:'9px 0', fontSize:13, justifyContent:'center' }}>↑ Buy</button>
        <button className="btn btn-danger"  onClick={() => onTrade(stock.symbol,'sell')} style={{ padding:'9px 0', fontSize:13, justifyContent:'center' }}>↓ Sell</button>
      </div>
    </motion.div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [portfolio, setPortfolio] = useState(null)
  const [stocks, setStocks]       = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([portfolioService.getPortfolio(), marketService.getPopularStocks()])
      .then(([p, s]) => {
        if (p.success) setPortfolio(p.data)
        if (s.success) setStocks(s.data.slice(0,6))
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading fullScreen text="Loading dashboard" />

  const s   = portfolio?.summary || {}
  const plUp = (s.total_profit_loss || 0) >= 0
  const dateStr = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

  return (
    <div style={{ background:'#080D1A', minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <ParticleBackground />
      <div className="orb orb-indigo" style={{ width:350, height:350, top:80, right:-60, position:'absolute' }} />
      <div className="orb orb-teal"   style={{ width:300, height:300, bottom:80, left:-60, position:'absolute' }} />
      <div className="bg-grid" style={{ position:'absolute', inset:0, opacity:0.35, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:10 }}>
        <Navbar />

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'clamp(16px,3vw,32px) clamp(16px,3vw,40px)' }}>

          {/* Header */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'clamp(20px,3vw,32px)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, color:'#475569', fontSize:13 }}>
              <Sparkles size={14} color="#F0B429" /> {dateStr}
            </div>
            <h1 style={{ fontSize:'clamp(22px,4vw,34px)', fontWeight:700, color:'#E2E8F0', lineHeight:1.2 }}>
              {GREETING()},{' '}
              <span style={{ background:'linear-gradient(90deg,#8B6FFF,#F0B429)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {user?.full_name?.split(' ')[0] || 'Trader'}
              </span>{' '}👋
            </h1>
            <p style={{ color:'#475569', fontSize:14, marginTop:4 }}>Here's your trading overview for today</p>
          </motion.div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom:'clamp(20px,3vw,32px)' }}>
            <StatCard label="Portfolio Value" value={formatCurrency(s.total_portfolio_value||0)}
              icon={DollarSign} iconBg="linear-gradient(135deg,#8B6FFF,#6D4FE8)"
              change={s.total_return_percent} changeUp={plUp} delay={0} />
            <StatCard label="Cash Balance"  value={formatCurrency(s.cash_balance||0)}
              icon={TrendingUp} iconBg="linear-gradient(135deg,#34D399,#059669)" delay={0.08} />
            <StatCard label="Holdings Value" value={formatCurrency(s.holdings_value||0)}
              icon={Activity} iconBg="linear-gradient(135deg,#22D3EE,#6D4FE8)" delay={0.16} />
            <StatCard label="Open Positions" value={s.num_positions||0}
              icon={Target} iconBg="linear-gradient(135deg,#F0B429,#F97316)" delay={0.24} />
          </div>

          {/* Popular Stocks */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
              <div>
                <h2 style={{ fontSize:'clamp(17px,2.5vw,22px)', fontWeight:700, color:'#E2E8F0' }}>Popular Stocks</h2>
                <p style={{ color:'#475569', fontSize:13, marginTop:2 }}>Live market prices</p>
              </div>
              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#34D399', fontWeight:600 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#34D399', animation:'pulse 1.5s infinite' }} />
                Markets Live
              </span>
            </div>
            {stocks.length > 0 ? (
              <div className="stocks-grid">
                {stocks.map((stock,i) => (
                  <motion.div key={stock.symbol} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.32+i*0.07 }}>
                    <StockRow stock={stock} onTrade={(sym,side) => navigate('/trading',{ state:{ symbol:sym, side } })} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ background:'rgba(13,20,40,0.7)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'60px 24px', textAlign:'center' }}>
                <TrendingUp size={40} color="#334155" style={{ margin:'0 auto 12px' }} />
                <p style={{ color:'#94A3B8', fontWeight:600 }}>No market data available</p>
                <p style={{ color:'#475569', fontSize:13, marginTop:4 }}>Markets may be closed or API limit reached</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
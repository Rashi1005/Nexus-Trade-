import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, TrendingUp, TrendingDown, Briefcase, DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Loading from '../components/common/Loading'
import ParticleBackground from '../components/common/ParticleBackground'
import { portfolioService } from '../services/portfolioService'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

const SECTOR_GRADS = [
  'linear-gradient(90deg,#8B6FFF,#F0B429)',
  'linear-gradient(90deg,#34D399,#22D3EE)',
  'linear-gradient(90deg,#FB7185,#F97316)',
  'linear-gradient(90deg,#F0B429,#34D399)',
  'linear-gradient(90deg,#22D3EE,#8B6FFF)',
]

const Portfolio = () => {
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    portfolioService.getPortfolio()
      .then(r => { if (r.success) setPortfolio(r.data) })
      .catch(() => toast.error('Failed to load portfolio'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading fullScreen text="Loading portfolio" />

  const { summary={}, holdings=[], sector_allocation=[] } = portfolio || {}
  const totalPL = summary.total_profit_loss || 0
  const plUp    = totalPL >= 0
  const hasH    = holdings.length > 0

  const cardStyle = {
    background:'rgba(13,20,40,0.8)', backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:16,
  }

  return (
    <div style={{ background:'#080D1A', minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <ParticleBackground />
      <div className="orb orb-indigo" style={{ width:340, height:340, top:60,    right:-60, position:'absolute' }} />
      <div className="orb orb-gold"   style={{ width:300, height:300, bottom:60, left:-60,  position:'absolute' }} />
      <div className="bg-grid" style={{ position:'absolute', inset:0, opacity:0.35, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:10 }}>
        <Navbar />
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'clamp(16px,3vw,32px) clamp(16px,3vw,40px)' }}>

          {/* Header */}
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:'clamp(20px,3vw,28px)' }}>
            <h1 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:700, color:'#E2E8F0' }}>
              My <span style={{ background:'linear-gradient(90deg,#8B6FFF,#F0B429)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Portfolio</span>
            </h1>
            <p style={{ color:'#475569', fontSize:14, marginTop:4 }}>Track your positions and performance</p>
          </motion.div>

          {/* Summary */}
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} className="summary-grid" style={{ marginBottom:'clamp(18px,3vw,28px)' }}>
            {[
              { label:'Total Value',    val:formatCurrency(summary.total_portfolio_value), icon:DollarSign, grad:'linear-gradient(135deg,#8B6FFF,#6D4FE8)' },
              { label:'Cash Balance',   val:formatCurrency(summary.cash_balance),          icon:Briefcase,  grad:'linear-gradient(135deg,#34D399,#059669)' },
              { label:'Holdings Value', val:formatCurrency(summary.holdings_value),        icon:PieChart,   grad:'linear-gradient(135deg,#22D3EE,#8B6FFF)' },
            ].map(({ label, val, icon:Icon, grad })=>(
              <div key={label} style={{ ...cardStyle, padding:'clamp(18px,2.5vw,26px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:grad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={16} color="#fff" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize:13, color:'#64748B', fontWeight:600 }}>{label}</span>
                </div>
                <div className="font-mono-custom" style={{ fontSize:'clamp(20px,3vw,27px)', fontWeight:700, color:'#E2E8F0' }}>{val}</div>
              </div>
            ))}
          </motion.div>

          {/* P&L Banner */}
          {hasH && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.18 }}
              style={{
                display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12,
                padding:'clamp(14px,2.5vw,22px) clamp(18px,3vw,28px)', borderRadius:14, marginBottom:'clamp(18px,3vw,28px)',
                background: plUp?'rgba(52,211,153,0.07)':'rgba(251,113,133,0.07)',
                border:`1px solid ${plUp?'rgba(52,211,153,0.2)':'rgba(251,113,133,0.2)'}`,
              }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {plUp?<TrendingUp size={22} color="#34D399"/>:<TrendingDown size={22} color="#FB7185"/>}
                <div>
                  <div style={{ fontSize:12, color:'#64748B', marginBottom:3 }}>Total Profit / Loss</div>
                  <div className="font-mono-custom" style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:700, color:plUp?'#34D399':'#FB7185' }}>
                    {plUp?'+':''}{formatCurrency(totalPL)}
                  </div>
                </div>
              </div>
              <div className="font-orbitron" style={{ fontSize:'clamp(22px,4vw,34px)', fontWeight:700, color:plUp?'#34D399':'#FB7185' }}>
                {plUp?'+':''}{(summary.total_return_percent||0).toFixed(2)}%
              </div>
            </motion.div>
          )}

          {/* Holdings */}
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.22 }} style={{ marginBottom:'clamp(20px,3vw,32px)' }}>
            <h2 style={{ fontSize:'clamp(16px,2.5vw,20px)', fontWeight:700, color:'#E2E8F0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <Briefcase size={17} color="#8B6FFF"/> Holdings
            </h2>
            {hasH ? (
              <div style={{ ...cardStyle, overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Stock</th><th>Shares</th><th>Avg Cost</th><th>Price</th><th>Value</th><th>P&amp;L</th></tr></thead>
                  <tbody>
                    {holdings.map(h=>{
                      const up = h.profit_loss >= 0
                      return (
                        <tr key={h.symbol} onClick={()=>navigate('/trading',{state:{symbol:h.symbol}})} style={{ cursor:'pointer' }}>
                          <td>
                            <div className="font-orbitron" style={{ fontWeight:700, color:'#E2E8F0', fontSize:13 }}>{h.symbol}</div>
                            <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>{h.company_name}</div>
                          </td>
                          <td className="font-mono-custom" style={{ color:'#94A3B8' }}>{h.quantity}</td>
                          <td className="font-mono-custom" style={{ color:'#94A3B8' }}>{formatCurrency(h.average_cost)}</td>
                          <td className="font-mono-custom" style={{ color:'#E2E8F0' }}>{formatCurrency(h.current_price)}</td>
                          <td className="font-mono-custom" style={{ color:'#E2E8F0', fontWeight:600 }}>{formatCurrency(h.current_value)}</td>
                          <td>
                            <div className="font-mono-custom" style={{ fontWeight:700, fontSize:13, color:up?'#34D399':'#FB7185' }}>
                              {up?'+':''}{formatCurrency(h.profit_loss)}
                            </div>
                            <div style={{ fontSize:11, color:up?'rgba(52,211,153,0.7)':'rgba(251,113,133,0.7)', marginTop:2 }}>
                              {up?'+':''}{(h.profit_loss_percent||0).toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ ...cardStyle, padding:'80px 24px', textAlign:'center' }}>
                <Rocket size={52} color="#334155" style={{ margin:'0 auto 16px', display:'block' }} className="animate-float" />
                <h3 style={{ fontSize:20, fontWeight:700, color:'#E2E8F0', marginBottom:8 }}>No holdings yet</h3>
                <p style={{ color:'#94A3B8', marginBottom:24, fontSize:15 }}>Start trading to build your portfolio</p>
                <button onClick={()=>navigate('/trading')} className="btn btn-primary" style={{ padding:'12px 32px', fontSize:15 }}>Start Trading →</button>
              </div>
            )}
          </motion.div>

          {/* Sector Allocation */}
          {sector_allocation.length > 0 && (
            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
              <h2 style={{ fontSize:'clamp(16px,2.5vw,20px)', fontWeight:700, color:'#E2E8F0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                <PieChart size={17} color="#F0B429"/> Sector Allocation
              </h2>
              <div style={{ ...cardStyle, padding:'clamp(18px,3vw,28px)' }}>
                {sector_allocation.map((sec,i)=>(
                  <div key={sec.sector} style={{ marginBottom: i<sector_allocation.length-1?20:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:4 }}>
                      <span style={{ fontSize:14, color:'#94A3B8', fontWeight:600 }}>{sec.sector}</span>
                      <div style={{ display:'flex', gap:10 }}>
                        <span className="font-mono-custom" style={{ fontSize:13, color:'#E2E8F0' }}>{formatCurrency(sec.value)}</span>
                        <span style={{ fontSize:13, color:'#64748B' }}>{(sec.percentage||0).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                      <motion.div
                        initial={{ width:0 }} animate={{ width:`${sec.percentage}%` }}
                        transition={{ duration:1, delay:0.35+i*0.1, ease:[0.22,1,0.36,1] }}
                        style={{ height:'100%', borderRadius:99, background:SECTOR_GRADS[i%SECTOR_GRADS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Portfolio
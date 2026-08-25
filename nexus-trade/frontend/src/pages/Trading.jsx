import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Loading from '../components/common/Loading'
import ParticleBackground from '../components/common/ParticleBackground'
import { marketService } from '../services/marketService'
import { tradingService } from '../services/tradingService'
import { useAuthStore } from '../store/authStore'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

const Trading = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const [input,   setInput]   = useState(location.state?.symbol || '')
  const [symbol,  setSymbol]  = useState(location.state?.symbol || '')
  const [quote,   setQuote]   = useState(null)
  const [side,    setSide]    = useState(location.state?.side || 'buy')
  const [qty,     setQty]     = useState('')
  const [preview, setPreview] = useState(null)
  const [orders,  setOrders]  = useState([])
  const [loadQ,   setLoadQ]   = useState(false)
  const [loadP,   setLoadP]   = useState(false)
  const [loadE,   setLoadE]   = useState(false)

  useEffect(() => { fetchOrders(); if (location.state?.symbol) doSearch(location.state.symbol) }, [])

  const doSearch = async (sym) => {
    const s = (sym || input).trim().toUpperCase()
    if (!s) return
    setLoadQ(true); setQuote(null); setPreview(null)
    try {
      const r = await marketService.getQuote(s)
      if (r.success) { setQuote(r.data); setSymbol(s) }
      else toast.error(r.message || 'Symbol not found')
    } catch { toast.error('Failed to fetch quote') }
    finally { setLoadQ(false) }
  }

  const handleSearch = e => { e.preventDefault(); doSearch(input) }

  const handlePreview = async () => {
    if (!quote || !qty || parseInt(qty) < 1) { toast.error('Enter a valid quantity'); return }
    setLoadP(true)
    try {
      const r = await tradingService.quoteAndValidate(symbol, parseInt(qty), side)
      if (r.success) setPreview(r.data)
      else toast.error(r.message)
    } catch (e) { toast.error(e?.message || 'Preview failed') }
    finally { setLoadP(false) }
  }

  const handleExecute = async () => {
    setLoadE(true)
    try {
      const fn = side === 'buy' ? tradingService.buyStock : tradingService.sellStock
      const r = await fn(symbol, parseInt(qty))
      if (r.success) { toast.success(`${side==='buy'?'Bought':'Sold'} ${qty} ${symbol}! 🎉`); setPreview(null); setQty(''); fetchOrders() }
      else toast.error(r.message || 'Trade failed')
    } catch (e) { toast.error(e?.message || 'Trade failed') }
    finally { setLoadE(false) }
  }

  const fetchOrders = async () => {
    try { const r = await tradingService.getOrders(10); if (r.success) setOrders(r.data) } catch {}
  }

  const up = quote?.change >= 0
  const canAfford = preview ? (side === 'buy' ? (user?.cash_balance >= preview.total_cost) : true) : true

  const cardStyle = {
    background:'rgba(13,20,40,0.8)', backdropFilter:'blur(20px)',
    border:'1px solid rgba(255,255,255,0.08)', borderRadius:18,
  }

  return (
    <div style={{ background:'#080D1A', minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
      <ParticleBackground />
      <div className="orb orb-indigo" style={{ width:340, height:340, top:60,    right:-60, position:'absolute' }} />
      <div className="orb orb-teal"   style={{ width:300, height:300, bottom:60, left:-60,  position:'absolute' }} />
      <div className="bg-grid" style={{ position:'absolute', inset:0, opacity:0.35, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:10 }}>
        <Navbar />
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'clamp(16px,3vw,32px) clamp(16px,3vw,40px)' }}>

          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} style={{ marginBottom:'clamp(20px,3vw,28px)' }}>
            <h1 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:700, color:'#E2E8F0' }}>
              Trading <span style={{ background:'linear-gradient(90deg,#8B6FFF,#F0B429)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Terminal</span>
            </h1>
            <p style={{ color:'#475569', fontSize:14, marginTop:4 }}>Search a stock and execute orders in real time</p>
          </motion.div>

          <div className="trading-grid" style={{ marginBottom:'clamp(20px,3vw,32px)' }}>

            {/* ── LEFT: Quote ── */}
            <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.1 }}>
              <form onSubmit={handleSearch} style={{ display:'flex', gap:10, marginBottom:16 }}>
                <div style={{ flex:1, position:'relative' }}>
                  <Search size={15} color="#475569" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)' }} />
                  <input
                    className="input-neon font-orbitron"
                    style={{ paddingLeft:38, paddingRight:16, height:46, fontSize:13, letterSpacing:'0.08em', textTransform:'uppercase' }}
                    placeholder="AAPL, TSLA, NVDA..."
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase())} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height:46, padding:'0 20px', flexShrink:0 }} disabled={loadQ}>
                  {loadQ ? <span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%' }} className="animate-spin-slow"/> : 'Search'}
                </button>
              </form>

              <AnimatePresence>
                {quote ? (
                  <motion.div key="q" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                    style={{ ...cardStyle, padding:'clamp(18px,3vw,28px)', border:`1px solid ${up?'rgba(52,211,153,0.2)':'rgba(251,113,133,0.2)'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                      <div>
                        <div className="font-orbitron" style={{ fontSize:22, fontWeight:700, color:'#E2E8F0' }}>{quote.symbol}</div>
                        <div style={{ color:'#64748B', fontSize:13, marginTop:3 }}>{quote.name || quote.symbol}</div>
                      </div>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:99,
                        fontSize:13, fontWeight:700,
                        background: up?'rgba(52,211,153,0.12)':'rgba(251,113,133,0.12)',
                        color: up?'#34D399':'#FB7185',
                        border:`1px solid ${up?'rgba(52,211,153,0.25)':'rgba(251,113,133,0.25)'}`,
                      }}>
                        {up?<TrendingUp size={13}/>:<TrendingDown size={13}/>}
                        {Math.abs(quote.change_percent||0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="font-mono-custom" style={{ fontSize:'clamp(32px,5vw,48px)', fontWeight:700, marginBottom:4, background: up?'linear-gradient(90deg,#34D399,#22D3EE)':'linear-gradient(90deg,#FB7185,#F97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                      {formatCurrency(quote.current_price)}
                    </div>
                    <div className="font-mono-custom" style={{ fontSize:13, color: up?'#34D399':'#FB7185', marginBottom:20 }}>
                      {up?'+':''}{quote.change?.toFixed(2)} today
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      {[['Open',quote.open],['High',quote.high],['Low',quote.low],['Volume',quote.volume?.toLocaleString()]].map(([l,v])=>(
                        <div key={l} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 14px' }}>
                          <div style={{ fontSize:11, color:'#475569', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{l}</div>
                          <div className="font-mono-custom" style={{ fontSize:14, color:'#E2E8F0', fontWeight:600 }}>{typeof v==='number'?formatCurrency(v):v||'—'}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : !loadQ && (
                  <div style={{ ...cardStyle, padding:'60px 24px', textAlign:'center' }}>
                    <Search size={36} color="#334155" style={{ margin:'0 auto 12px' }} />
                    <p style={{ color:'#94A3B8', fontWeight:600, marginBottom:4 }}>Search for a stock to begin</p>
                    <p style={{ color:'#475569', fontSize:13 }}>Try AAPL, TSLA, NVDA, MSFT...</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── RIGHT: Order Panel ── */}
            <motion.div initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.15 }}>
              <div style={{ ...cardStyle, padding:'clamp(18px,3vw,28px)' }}>
                {/* Buy/Sell toggle */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, padding:5, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, marginBottom:22 }}>
                  {['buy','sell'].map(s=>(
                    <button key={s} onClick={()=>{setSide(s);setPreview(null)}}
                      style={{
                        padding:'10px 0', borderRadius:9, fontSize:15, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.2s',
                        background: side===s ? (s==='buy'?'linear-gradient(135deg,#34D399,#059669)':'linear-gradient(135deg,#FB7185,#E11D48)') : 'transparent',
                        color: side===s ? '#fff' : '#64748B',
                        boxShadow: side===s ? (s==='buy'?'0 4px 16px rgba(52,211,153,0.3)':'0 4px 16px rgba(251,113,133,0.3)') : 'none',
                      }}>
                      {s==='buy'?'↑ Buy':'↓ Sell'}
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:8 }}>Quantity (Shares)</label>
                <input type="number" min="1" value={qty}
                  onChange={e=>{setQty(e.target.value);setPreview(null)}}
                  placeholder="Enter number of shares"
                  className="input-neon font-mono-custom"
                  style={{ fontSize:17, marginBottom:16, height:50 }} />

                {/* Estimated cost */}
                {quote && qty && (
                  <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                    <div style={{ fontSize:12, color:'#475569', marginBottom:5 }}>Estimated {side==='buy'?'Cost':'Proceeds'}</div>
                    <div className="font-mono-custom" style={{ fontSize:20, fontWeight:700, color:'#E2E8F0' }}>
                      {formatCurrency(quote.current_price * parseInt(qty||0))}
                    </div>
                  </div>
                )}

                <button onClick={handlePreview} disabled={!quote||!qty||loadP}
                  className="btn btn-secondary" style={{ width:'100%', justifyContent:'center', marginBottom:16, height:44 }}>
                  {loadP?<span style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#fff',borderRadius:'50%' }} className="animate-spin-slow"/>:'Preview Order'}
                </button>

                {/* Preview */}
                <AnimatePresence>
                  {preview && (
                    <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                      style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${canAfford?'rgba(139,111,255,0.25)':'rgba(251,113,133,0.3)'}`, borderRadius:12, padding:'16px', marginBottom:14 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:12, fontWeight:700, color:'#E2E8F0', fontSize:14 }}>
                        {canAfford?<CheckCircle size={15} color="#34D399"/>:<AlertCircle size={15} color="#FB7185"/>}
                        Order Preview
                      </div>
                      {[['Price',formatCurrency(preview.current_price)],['Qty',preview.quantity],['Subtotal',formatCurrency(preview.subtotal)],['Commission',formatCurrency(preview.commission)]].map(([l,v])=>(
                        <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:14 }}>
                          <span style={{ color:'#64748B' }}>{l}</span>
                          <span className="font-mono-custom" style={{ color:'#E2E8F0' }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, marginTop:2, fontWeight:700, fontSize:16 }}>
                        <span style={{ color:'#E2E8F0' }}>Total</span>
                        <span className="font-mono-custom" style={{ color: side==='buy'?'#FB7185':'#34D399' }}>
                          {formatCurrency(side==='buy'?preview.total_cost:preview.total_proceeds)}
                        </span>
                      </div>
                      {!canAfford && <p style={{ color:'#FB7185', fontSize:12, marginTop:10, display:'flex', alignItems:'center', gap:5 }}><AlertCircle size={12}/>Insufficient funds</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {preview && (
                  <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }}
                    onClick={handleExecute} disabled={!canAfford||loadE}
                    className={`btn ${side==='buy'?'btn-success':'btn-danger'}`}
                    style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:16, fontWeight:700 }}>
                    {loadE?<span style={{ width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%' }} className="animate-spin-slow"/>:`Execute ${side==='buy'?'Buy':'Sell'} Order`}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Orders */}
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
            <h2 style={{ fontSize:'clamp(17px,2.5vw,21px)', fontWeight:700, color:'#E2E8F0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <Clock size={18} color="#8B6FFF"/> Recent Orders
            </h2>
            <div style={{ ...cardStyle, overflowX:'auto' }}>
              {orders.length>0 ? (
                <table className="data-table">
                  <thead><tr><th>Symbol</th><th>Side</th><th>Qty</th><th>Price</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.map((o,i)=>(
                      <tr key={i}>
                        <td className="font-orbitron" style={{ fontWeight:700, color:'#E2E8F0', fontSize:13 }}>{o.symbol}</td>
                        <td><span className={`badge ${o.side==='buy'?'badge-up':'badge-down'}`} style={{ textTransform:'capitalize' }}>{o.side}</span></td>
                        <td className="font-mono-custom" style={{ color:'#94A3B8' }}>{o.filled_quantity||o.quantity}</td>
                        <td className="font-mono-custom" style={{ color:'#E2E8F0' }}>{formatCurrency(o.filled_price)}</td>
                        <td className="font-mono-custom" style={{ color:'#E2E8F0', fontWeight:600 }}>{formatCurrency(o.total_amount)}</td>
                        <td><span className="badge badge-neutral" style={{ textTransform:'capitalize' }}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding:'56px 24px', textAlign:'center' }}>
                  <TrendingUp size={36} color="#334155" style={{ margin:'0 auto 12px' }} />
                  <p style={{ color:'#94A3B8', fontWeight:600 }}>No orders yet</p>
                  <p style={{ color:'#475569', fontSize:13, marginTop:4 }}>Your executed trades will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Trading
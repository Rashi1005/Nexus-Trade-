import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, Shield, BarChart3, ArrowRight, DollarSign, ChevronRight, Star } from 'lucide-react'
import ParticleBackground from '../components/common/ParticleBackground'

/* ── Ticker data ── */
const TICKERS = [
  { sym:'AAPL',  chg:'+0.82%', up:true  }, { sym:'GOOGL', chg:'-0.34%', up:false },
  { sym:'MSFT',  chg:'+1.20%', up:true  }, { sym:'TSLA',  chg:'-2.10%', up:false },
  { sym:'AMZN',  chg:'+0.67%', up:true  }, { sym:'NVDA',  chg:'+3.40%', up:true  },
  { sym:'META',  chg:'+1.80%', up:true  }, { sym:'NFLX',  chg:'-0.90%', up:false },
]

/* ── Features ── */
const FEATURES = [
  {
    icon: Zap, title: 'Real-Time Prices',
    desc: 'Live data from NYSE & NASDAQ for 5,700+ stocks powered by Alpha Vantage.',
    bg: 'linear-gradient(135deg,#8B6FFF,#6D4FE8)',
    glow: 'rgba(139,111,255,0.2)',
  },
  {
    icon: Shield, title: '100% Risk-Free',
    desc: 'Start with $10,000 virtual cash. Learn trading strategies with zero financial risk.',
    bg: 'linear-gradient(135deg,#F0B429,#F97316)',
    glow: 'rgba(240,180,41,0.2)',
  },
  {
    icon: BarChart3, title: 'Portfolio Analytics',
    desc: 'Real-time P&L tracking, sector breakdown, and complete transaction history.',
    bg: 'linear-gradient(135deg,#34D399,#22D3EE)',
    glow: 'rgba(52,211,153,0.2)',
  },
]

/* ── Steps ── */
const STEPS = [
  { n:'01', title:'Create Free Account', desc:'Sign up in 30 seconds. No credit card required, ever.' },
  { n:'02', title:'Get $10,000 Cash',    desc:'Virtual funds appear in your account instantly.' },
  { n:'03', title:'Trade Real Stocks',   desc:'Buy and sell 5,700+ stocks at live market prices.' },
]

const fadeUp = {
  hidden: { opacity:0, y:36 },
  show:   { opacity:1, y:0, transition:{ duration:0.6, ease:[0.22,1,0.36,1] } },
}
const stagger = { show:{ transition:{ staggerChildren:0.12 } } }

const Landing = () => (
  <div style={{ background:'#080D1A', minHeight:'100vh', position:'relative', overflowX:'hidden' }}>
    <ParticleBackground />

    {/* Ambient orbs */}
    <div className="orb orb-indigo" style={{ width:500, height:500, top:-120, left:-100, position:'absolute' }} />
    <div className="orb orb-gold"   style={{ width:400, height:400, top:80,   right:-80, position:'absolute' }} />
    <div className="orb orb-teal"   style={{ width:350, height:350, bottom:100, left:'35%', position:'absolute' }} />
    <div className="bg-grid" style={{ position:'absolute', inset:0, opacity:0.5, pointerEvents:'none' }} />

    <div style={{ position:'relative', zIndex:10 }}>

      {/* ── NAVBAR ── */}
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, zIndex:50, background:'rgba(8,13,26,0.85)', backdropFilter:'blur(20px)' }}>
        <div className="content-wrap" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <TrendingUp size={26} color="#8B6FFF" strokeWidth={2.5} />
            <span className="font-orbitron" style={{ fontSize:18, fontWeight:700, background:'linear-gradient(90deg,#22D3EE,#8B6FFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              NEXUS TRADE
            </span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <Link to="/login">
              <button className="btn btn-ghost" style={{ padding:'9px 20px', fontSize:14 }}>Sign In</button>
            </Link>
            <Link to="/signup">
              <button className="btn btn-primary animate-pulse-glow" style={{ padding:'9px 20px', fontSize:14 }}>Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'80px 24px 60px', textAlign:'center' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px',
            borderRadius:99, marginBottom:32, fontSize:13, fontWeight:600,
            background:'rgba(139,111,255,0.1)', border:'1px solid rgba(139,111,255,0.25)', color:'#c4b5fd',
          }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#8B6FFF', animation:'pulse 1.5s infinite' }} />
            Live Market Data · Zero Risk
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.7 }}
          style={{ fontSize:'clamp(44px,8vw,96px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:24 }}>
          <span style={{ color:'#E2E8F0' }}>TRADE THE</span><br />
          <span style={{ background:'linear-gradient(135deg,#8B6FFF 0%,#F0B429 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            FUTURE
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.6 }}
          style={{ fontSize:'clamp(15px,2vw,19px)', color:'#94A3B8', maxWidth:520, margin:'0 auto 36px', lineHeight:1.7 }}>
          Practice with <span style={{ color:'#F0B429', fontWeight:600 }}>$10,000</span> virtual cash.
          Real market data. Zero financial risk.
        </motion.p>

        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:64 }}>
          <Link to="/signup">
            <button className="btn btn-primary animate-pulse-glow" style={{ fontSize:16, padding:'14px 32px' }}>
              Start Trading Free <ArrowRight size={18} />
            </button>
          </Link>
          <Link to="/login">
            <button className="btn btn-ghost" style={{ fontSize:16, padding:'14px 32px' }}>
              Sign In <ChevronRight size={18} />
            </button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          style={{ display:'flex', justifyContent:'center', gap:'clamp(24px,6vw,64px)', flexWrap:'wrap' }}>
          {[['10K+','Active Traders'],['1M+','Trades Executed'],['$500M+','Volume Traded']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center' }}>
              <div className="font-orbitron" style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:700, background:'linear-gradient(90deg,#8B6FFF,#F0B429)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{v}</div>
              <div style={{ fontSize:13, color:'#475569', marginTop:4 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── TICKER TAPE ── */}
      <div style={{ background:'rgba(255,255,255,0.025)', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'10px 0', overflow:'hidden' }}>
        <div className="ticker-inner">
          {[...TICKERS,...TICKERS].map((t,i)=>(
            <span key={i} className="font-mono-custom" style={{ display:'inline-flex', alignItems:'center', gap:6, margin:'0 28px', fontSize:13, flexShrink:0 }}>
              <span style={{ color:'#E2E8F0', fontWeight:600 }}>{t.sym}</span>
              <span style={{ color: t.up ? '#34D399':'#FB7185', fontWeight:700 }}>{t.chg}</span>
              <span style={{ color:'#334155', fontSize:11 }}>|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'80px 24px' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once:true }} style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:700, color:'#E2E8F0', marginBottom:14 }}>
            Everything you need to{' '}
            <span style={{ background:'linear-gradient(90deg,#8B6FFF,#F0B429)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>trade smart</span>
          </h2>
          <p style={{ color:'#94A3B8', fontSize:17, maxWidth:500, margin:'0 auto' }}>Professional-grade tools without the financial risk</p>
        </motion.div>

        <motion.div className="features-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}>
          {FEATURES.map(({ icon:Icon, title, desc, bg, glow })=>(
            <motion.div key={title} variants={fadeUp} className="feature-card">
              {/* ── icon ── must have explicit dimensions via style ── */}
              <div className="feature-icon" style={{ background: bg, boxShadow:`0 8px 24px ${glow}` }}>
                <Icon size={24} color="#fff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, color:'#E2E8F0', marginBottom:10 }}>{title}</h3>
              <p style={{ color:'#94A3B8', lineHeight:1.65, fontSize:15 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px 80px' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once:true }} style={{ textAlign:'center', marginBottom:52 }}>
          <h2 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:700, color:'#E2E8F0', marginBottom:14 }}>
            Up and running in{' '}
            <span style={{ background:'linear-gradient(90deg,#34D399,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>60 seconds</span>
          </h2>
        </motion.div>

        <motion.div className="steps-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}>
          {STEPS.map(({ n, title, desc })=>(
            <motion.div key={n} variants={fadeUp} className="step-card">
              <div className="step-num">{n}</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:'#E2E8F0', marginBottom:10 }}>{title}</h3>
              <p style={{ color:'#94A3B8', lineHeight:1.65, fontSize:14 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth:900, margin:'0 auto', padding:'0 24px 100px' }}>
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once:true }}
          style={{
            background:'rgba(13,20,40,0.8)', backdropFilter:'blur(24px)',
            border:'1px solid rgba(139,111,255,0.2)', borderRadius:24,
            padding:'clamp(40px,6vw,72px) clamp(24px,5vw,64px)',
            textAlign:'center',
            boxShadow:'0 0 80px rgba(139,111,255,0.06)',
          }}>
          <DollarSign size={52} color="#F0B429" style={{ margin:'0 auto 20px', display:'block' }} className="animate-float" />
          <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:700, color:'#E2E8F0', marginBottom:14 }}>
            Ready to start your{' '}
            <span style={{ background:'linear-gradient(90deg,#8B6FFF,#F0B429)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>trading journey?</span>
          </h2>
          <p style={{ color:'#94A3B8', fontSize:16, marginBottom:36, maxWidth:440, margin:'0 auto 36px' }}>
            Join 10,000+ traders. Free forever. No credit card needed.
          </p>
          <Link to="/signup">
            <button className="btn btn-primary animate-pulse-glow" style={{ fontSize:17, padding:'15px 40px' }}>
              Create Free Account <ArrowRight size={18} />
            </button>
          </Link>
        </motion.div>
      </section>

    </div>
  </div>
)

export default Landing
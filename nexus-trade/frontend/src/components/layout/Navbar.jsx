import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, LogOut, LayoutDashboard, LineChart, Briefcase, Wallet } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/formatters'

const NAV = [
  { path:'/dashboard', label:'Dashboard', icon:LayoutDashboard },
  { path:'/trading',   label:'Trading',   icon:LineChart },
  { path:'/portfolio', label:'Portfolio',  icon:Briefcase },
]

const Navbar = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)
    : 'NT'

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <motion.nav
      initial={{ y:-64, opacity:0 }}
      animate={{ y:0, opacity:1 }}
      transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{
        position:'sticky', top:0, zIndex:50, width:'100%',
        background: scrolled ? 'rgba(8,13,26,0.96)' : 'rgba(8,13,26,0.75)',
        backdropFilter:'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        transition:'background 0.3s',
      }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 clamp(16px,3vw,40px)', display:'flex', alignItems:'center', justifyContent:'space-between', height:62 }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <TrendingUp size={24} color="#8B6FFF" strokeWidth={2.5} />
          <span className="font-orbitron" style={{ fontSize:16, fontWeight:700, background:'linear-gradient(90deg,#22D3EE,#8B6FFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'0.05em' }}>
            NEXUS TRADE
          </span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <div style={{ display:'flex', alignItems:'center', gap:2, position:'absolute', left:'50%', transform:'translateX(-50%)' }} className="nav-links">
          {NAV.map(({ path, label, icon:Icon }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} style={{ textDecoration:'none' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:7, padding:'7px 16px', borderRadius:10,
                  color: active ? '#8B6FFF' : '#64748B',
                  background: active ? 'rgba(139,111,255,0.1)' : 'transparent',
                  fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
                  position:'relative',
                }}>
                  <Icon size={15} />
                  {label}
                  {active && (
                    <motion.div layoutId="nav-pill"
                      style={{ position:'absolute', bottom:-1, left:'20%', right:'20%', height:2, borderRadius:99, background:'linear-gradient(90deg,#22D3EE,#8B6FFF)' }} />
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* Balance */}
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', borderRadius:10, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.18)' }}
            className="hide-mobile">
            <Wallet size={13} color="#34D399" />
            <span className="font-mono-custom" style={{ fontSize:13, fontWeight:600, color:'#34D399' }}>
              {formatCurrency(user?.cash_balance || 0)}
            </span>
          </div>

          {/* Avatar */}
          <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'Orbitron,sans-serif', fontWeight:700, fontSize:12, background:'rgba(139,111,255,0.15)', border:'1px solid rgba(139,111,255,0.3)', color:'#8B6FFF' }}>
            {initials}
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:10, background:'rgba(251,113,133,0.07)', border:'1px solid rgba(251,113,133,0.18)', color:'#FB7185', fontSize:13, fontWeight:600, cursor:'pointer', transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(251,113,133,0.15)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(251,113,133,0.07)'}>
            <LogOut size={14} />
            <span className="hide-mobile">Logout</span>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </motion.nav>
  )
}

export default Navbar
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import ParticleBackground from '../components/common/ParticleBackground'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const [form, setForm] = useState({ email:'', password:'' })

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    const r = await login(form.email, form.password)
    if (r.success) { toast.success('Welcome back! 🚀'); navigate('/dashboard') }
    else toast.error(r.message || 'Login failed')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080D1A', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', overflow:'hidden' }}>
      <ParticleBackground />

      {/* Orbs */}
      <div className="orb orb-indigo" style={{ width:440, height:440, top:-80, left:-100, position:'absolute' }} />
      <div className="orb orb-gold"   style={{ width:360, height:360, bottom:-60, right:-80, position:'absolute' }} />
      <div className="bg-grid" style={{ position:'absolute', inset:0, opacity:0.45, pointerEvents:'none' }} />

      <motion.div
        initial={{ opacity:0, scale:0.93, y:28 }}
        animate={{ opacity:1, scale:1,    y:0 }}
        transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
        style={{ width:'100%', maxWidth:440, position:'relative', zIndex:10 }}
      >
        <div style={{
          background:'rgba(13,20,40,0.9)',
          backdropFilter:'blur(40px)',
          WebkitBackdropFilter:'blur(40px)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:24,
          padding:'clamp(28px,5vw,44px)',
          boxShadow:'0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,111,255,0.1)',
        }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div className="animate-float" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, borderRadius:16, background:'rgba(139,111,255,0.15)', border:'1px solid rgba(139,111,255,0.3)', marginBottom:16 }}>
              <TrendingUp size={26} color="#8B6FFF" strokeWidth={2.5} />
            </div>
            <div className="font-orbitron" style={{ fontSize:20, fontWeight:700, background:'linear-gradient(90deg,#22D3EE,#8B6FFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8 }}>
              NEXUS TRADE
            </div>
            <p style={{ color:'#94A3B8', fontSize:14 }}>Welcome back, trader</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:8 }}>Email</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} color="#475569" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                <input type="email" name="email" value={form.email} onChange={onChange}
                  placeholder="your@email.com" required
                  className="input-neon" style={{ paddingLeft:40 }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:8 }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} color="#475569" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                <input type="password" name="password" value={form.password} onChange={onChange}
                  placeholder="••••••••" required
                  className="input-neon" style={{ paddingLeft:40 }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:16 }}>
              {loading
                ? <span style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin-slow 0.8s linear infinite' }} />
                : 'Sign In'}
            </button>
          </form>

          {/* Demo box */}
          <div style={{ marginTop:20, padding:'14px 16px', background:'rgba(139,111,255,0.06)', border:'1px solid rgba(139,111,255,0.15)', borderRadius:12 }}>
            <p style={{ fontSize:12, color:'#64748B', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Demo Account</p>
            <p className="font-mono-custom" style={{ fontSize:12, color:'#94A3B8', lineHeight:1.8 }}>
              debug2@nexustrade.com<br />Debug@1234
            </p>
          </div>

          <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'#64748B' }}>
            No account?{' '}
            <Link to="/signup" style={{ color:'#8B6FFF', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
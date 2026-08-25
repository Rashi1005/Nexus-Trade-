import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, TrendingUp, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import ParticleBackground from '../components/common/ParticleBackground'
import toast from 'react-hot-toast'

const getStrength = pw => {
  let s = 0
  if (pw.length >= 8)             s++
  if (/[A-Z]/.test(pw))           s++
  if (/[0-9]/.test(pw))           s++
  if (/[^A-Za-z0-9]/.test(pw))   s++
  return s
}
const STR_COLORS = ['','#FB7185','#F0B429','#22D3EE','#34D399']
const STR_LABELS = ['','Weak','Fair','Good','Strong']

const Signup = () => {
  const navigate = useNavigate()
  const { signup, loading } = useAuthStore()
  const [form, setForm] = useState({ fullName:'', email:'', password:'' })
  const str = getStrength(form.password)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const r = await signup(form.email, form.password, form.fullName)
    if (r.success) { toast.success('Account created! $10,000 added 💰'); navigate('/dashboard') }
    else toast.error(r.message || 'Signup failed')
  }

  const inputStyle = { paddingLeft: 40 }
  const iconStyle  = { position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }
  const labelStyle = { display:'block', fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:8 }
  const fieldStyle = { marginBottom:16 }

  return (
    <div style={{ minHeight:'100vh', background:'#080D1A', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', overflow:'hidden' }}>
      <ParticleBackground />

      <div className="orb orb-indigo" style={{ width:400, height:400, top:-100, right:-80, position:'absolute' }} />
      <div className="orb orb-gold"   style={{ width:360, height:360, bottom:-60, left:-80, position:'absolute' }} />
      <div className="bg-grid" style={{ position:'absolute', inset:0, opacity:0.45, pointerEvents:'none' }} />

      <motion.div
        initial={{ opacity:0, scale:0.93, y:28 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
        style={{ width:'100%', maxWidth:440, position:'relative', zIndex:10 }}
      >
        {/* $10K badge */}
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px',
            borderRadius:99, fontSize:13, fontWeight:600,
            background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.25)', color:'#34D399',
          }}>
            <CheckCircle size={14} /> Start with $10,000 virtual cash — free forever
          </span>
        </div>

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
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div className="animate-float" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:52, height:52, borderRadius:14, background:'rgba(139,111,255,0.15)', border:'1px solid rgba(139,111,255,0.3)', marginBottom:14 }}>
              <TrendingUp size={24} color="#8B6FFF" strokeWidth={2.5} />
            </div>
            <div className="font-orbitron" style={{ fontSize:19, fontWeight:700, background:'linear-gradient(90deg,#22D3EE,#8B6FFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:6 }}>
              NEXUS TRADE
            </div>
            <p style={{ color:'#94A3B8', fontSize:14 }}>Create your trading account</p>
          </div>

          <form onSubmit={onSubmit}>
            {/* Full Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position:'relative' }}>
                <User size={15} color="#475569" style={iconStyle} />
                <input type="text" name="fullName" value={form.fullName} onChange={onChange}
                  placeholder="John Doe" required className="input-neon" style={inputStyle} />
              </div>
            </div>

            {/* Email */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} color="#475569" style={iconStyle} />
                <input type="email" name="email" value={form.email} onChange={onChange}
                  placeholder="your@email.com" required className="input-neon" style={inputStyle} />
              </div>
            </div>

            {/* Password + strength */}
            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} color="#475569" style={iconStyle} />
                <input type="password" name="password" value={form.password} onChange={onChange}
                  placeholder="Min. 6 characters" required className="input-neon" style={inputStyle} />
              </div>
              {form.password.length > 0 && (
                <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} style={{ marginTop:10 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                    {[1,2,3,4].map(i=>(
                      <div key={i} style={{ flex:1, height:3, borderRadius:99, transition:'background 0.3s', background: i <= str ? STR_COLORS[str] : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <p style={{ fontSize:12, color: STR_COLORS[str], fontWeight:600 }}>{STR_LABELS[str]}</p>
                </motion.div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:16 }}>
              {loading
                ? <span style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block' }} className="animate-spin-slow" />
                : 'Create Free Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:22, fontSize:14, color:'#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#8B6FFF', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
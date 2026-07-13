import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      toast.success('Login successful!')
      navigate('/dashboard')
    } else {
      toast.error(result.message || 'Login failed')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-12 h-12 text-primary" />
            <h1 className="text-3xl font-orbitron font-bold gradient-text">
              NEXUS TRADE
            </h1>
          </div>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        
        {/* Login Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              icon={<Mail className="w-5 h-5" />}
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>
          
          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Try the demo account:</p>
            <p className="text-xs text-gray-400 font-mono">
              Email: demo@nexustrade.com<br />
              Password: Test@123
            </p>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
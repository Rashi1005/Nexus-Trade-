import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const { signup, loading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState({})
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const result = await signup(
      formData.email, 
      formData.password, 
      formData.fullName
    )
    
    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } else {
      toast.error(result.message || 'Signup failed')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-12 h-12 text-primary" />
            <h1 className="text-3xl font-orbitron font-bold gradient-text">
              NEXUS TRADE
            </h1>
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>
        
        {/* Signup Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
              error={errors.fullName}
              required
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email}
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
              error={errors.password}
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword}
              required
            />
            
            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-gray-300">
              ✓ Start with $10,000 virtual balance<br />
              ✓ Trade with real market prices<br />
              ✓ No credit card required
            </p>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
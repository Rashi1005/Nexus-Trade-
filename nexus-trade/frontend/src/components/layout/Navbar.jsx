import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, User, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/formatters'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }
  
  const isActive = (path) => location.pathname === path
  
  return (
    <nav className="glass-card mb-6 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <span className="text-2xl font-orbitron font-bold gradient-text">
            NEXUS TRADE
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className={`font-medium transition-colors ${
              isActive('/dashboard') 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/trading" 
            className={`font-medium transition-colors ${
              isActive('/trading') 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            Trading
          </Link>
          <Link 
            to="/portfolio" 
            className={`font-medium transition-colors ${
              isActive('/portfolio') 
                ? 'text-primary' 
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            Portfolio
          </Link>
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-sm font-mono font-semibold text-success">
              {formatCurrency(user?.cash_balance || 0)}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
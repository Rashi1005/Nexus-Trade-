import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase,
  Settings,
  HelpCircle
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/trading', icon: TrendingUp, label: 'Trading' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]
  
  const isActive = (path) => location.pathname === path
  
  return (
    <aside className="glass-card w-64 h-[calc(100vh-8rem)] sticky top-24 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive(item.path)
                  ? 'bg-primary/20 text-primary border-l-4 border-primary'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto pt-6">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <HelpCircle className="w-6 h-6 text-primary mb-2" />
          <p className="text-sm text-gray-300 mb-2">Need help?</p>
          <p className="text-xs text-gray-400">Check our documentation</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
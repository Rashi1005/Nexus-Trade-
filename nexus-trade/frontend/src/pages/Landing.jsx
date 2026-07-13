import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Zap, Shield, BarChart3, ArrowRight, DollarSign, Activity } from 'lucide-react'
import Button from '../components/common/Button'

const Landing = () => {
  const [stats] = useState({
    users: '10,000+',
    trades: '1M+',
    value: '$500M+',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-10 -left-10 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 top-1/2 right-0 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bottom-0 left-1/2 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-10 h-10 text-cyan-400" />
              <h1 className="text-3xl font-orbitron font-bold">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NEXUS TRADE
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="secondary" className="px-6">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="px-6 glow">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-5xl mx-auto mb-20">
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 animate-fade-in">
              Master Trading
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Without The Risk
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 animate-fade-in delay-100">
              Practice trading 5,700+ real stocks with $10,000 virtual cash.<br />
              Real-time data. Zero financial risk. 100% free forever.
            </p>
            <div className="flex items-center justify-center space-x-6 animate-fade-in delay-200">
              <Link to="/signup">
                <Button size="lg" className="glow text-lg group">
                  <span>Start Trading Free</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="text-lg">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto animate-fade-in delay-300">
              <div className="text-center glass-card p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stats.users}
                </div>
                <div className="text-gray-400 mt-2">Active Traders</div>
              </div>
              <div className="text-center glass-card p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.trades}
                </div>
                <div className="text-gray-400 mt-2">Trades Executed</div>
              </div>
              <div className="text-center glass-card p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stats.value}
                </div>
                <div className="text-gray-400 mt-2">Portfolio Value</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-32">
            <div className="glass-card p-8 hover:border-cyan-500 transition-all duration-300 animate-fade-in group">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Real-Time Data</h3>
              <p className="text-gray-400 text-lg">
                Live prices from NYSE & NASDAQ. Trade 5,700+ stocks with actual market data powered by Alpha Vantage.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-purple-500 transition-all duration-300 animate-fade-in delay-100 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">100% Risk-Free</h3>
              <p className="text-gray-400 text-lg">
                Start with $10,000 virtual cash. Learn and practice trading strategies without losing real money.
              </p>
            </div>

            <div className="glass-card p-8 hover:border-blue-500 transition-all duration-300 animate-fade-in delay-200 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Performance</h3>
              <p className="text-gray-400 text-lg">
                Real-time portfolio tracking, detailed profit/loss calculations, and complete transaction history.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 text-center glass-card p-16 animate-fade-in">
            <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders practicing with Nexus Trade. No credit card required.
            </p>
            <Link to="/signup">
              <Button size="lg" className="glow text-lg">
                <DollarSign className="w-5 h-5 mr-2" />
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
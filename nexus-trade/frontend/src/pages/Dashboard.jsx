import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Activity, Target } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import StatsCard from '../components/dashboard/StatsCard'
import StockCard from '../components/dashboard/StockCard'
import Loading from '../components/common/Loading'
import { portfolioService } from '../services/portfolioService'
import { marketService } from '../services/marketService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [popularStocks, setPopularStocks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [portfolioRes, stocksRes] = await Promise.all([
        portfolioService.getPortfolio(),
        marketService.getPopularStocks()
      ])
      
      if (portfolioRes.success) {
        setPortfolio(portfolioRes.data)
      }
      
      if (stocksRes.success) {
        setPopularStocks(stocksRes.data.slice(0, 6))
      }
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  const handleTrade = (symbol, side) => {
    navigate('/trading', { state: { symbol, side } })
  }
  
  if (loading) return <Loading fullScreen text="Loading dashboard..." />
  
  const summary = portfolio?.summary || {}
  
  return (
    <div className="min-h-screen p-6">
      <Navbar />
      
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Portfolio Value"
            value={summary.total_portfolio_value?.toFixed(2) || '0.00'}
            prefix="$"
            icon={DollarSign}
            change={summary.total_profit_loss}
            changePercent={summary.total_return_percent}
          />
          
          <StatsCard
            title="Cash Balance"
            value={summary.cash_balance?.toFixed(2) || '0.00'}
            prefix="$"
            icon={TrendingUp}
          />
          
          <StatsCard
            title="Holdings Value"
            value={summary.holdings_value?.toFixed(2) || '0.00'}
            prefix="$"
            icon={Activity}
          />
          
          <StatsCard
            title="Total Positions"
            value={summary.num_positions || 0}
            icon={Target}
          />
        </div>
        
        {/* Popular Stocks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Popular Stocks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onTrade={handleTrade}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
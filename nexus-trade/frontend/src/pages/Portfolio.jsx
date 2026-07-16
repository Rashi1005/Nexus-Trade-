import React, { useState, useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import Card from '../components/common/Card'
import Loading from '../components/common/Loading'
import { portfolioService } from '../services/portfolioService'
import { formatCurrency, formatPercent, getChangeColor } from '../utils/formatters'
import toast from 'react-hot-toast'

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPortfolio()
  }, [])
  
  const fetchPortfolio = async () => {
    try {
      const response = await portfolioService.getPortfolio()
      if (response.success) {
        setPortfolio(response.data)
      }
    } catch {
      toast.error('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <Loading fullScreen text="Loading portfolio..." />
  
  const { summary, holdings, sector_allocation } = portfolio || {}
  
  return (
    <div className="min-h-screen p-6">
      <Navbar />
      
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Portfolio</h1>
        
        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <p className="text-sm text-gray-400 mb-2">Total Value</p>
            <p className="text-3xl font-bold text-white mb-2">
              {formatCurrency(summary?.total_portfolio_value)}
            </p>
            <p className={`text-sm ${getChangeColor(summary?.total_profit_loss)}`}>
              {formatCurrency(summary?.total_profit_loss)} ({formatPercent(summary?.total_return_percent)})
            </p>
          </Card>
          
          <Card>
            <p className="text-sm text-gray-400 mb-2">Cash Balance</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(summary?.cash_balance)}
            </p>
          </Card>
          
          <Card>
            <p className="text-sm text-gray-400 mb-2">Holdings Value</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(summary?.holdings_value)}
            </p>
            <p className="text-sm text-gray-400">
              {summary?.num_positions} positions
            </p>
          </Card>
        </div>
        
        {/* Holdings Table */}
        <Card title="Holdings">
          {holdings && holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm text-gray-400">Symbol</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400">Shares</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400">Avg Cost</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400">Current</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400">Value</th>
                    <th className="text-right py-3 px-4 text-sm text-gray-400">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.symbol} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-white">{holding.symbol}</p>
                          <p className="text-xs text-gray-400">{holding.company_name}</p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-white">{holding.quantity}</td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrency(holding.average_cost)}
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrency(holding.current_price)}
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {formatCurrency(holding.current_value)}
                      </td>
                      <td className={`text-right py-3 px-4 ${getChangeColor(holding.profit_loss)}`}>
                        {formatCurrency(holding.profit_loss)}
                        <br />
                        <span className="text-xs">
                          ({formatPercent(holding.profit_loss_percent)})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No holdings yet</p>
              <p className="text-sm text-gray-500 mt-2">Start trading to build your portfolio</p>
            </div>
          )}
        </Card>
        
        {/* Sector Allocation */}
        {sector_allocation && sector_allocation.length > 0 && (
          <Card title="Sector Allocation" className="mt-6">
            <div className="space-y-3">
              {sector_allocation.map((sector) => (
                <div key={sector.sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{sector.sector}</span>
                    <span className="text-white font-mono">
                      {formatCurrency(sector.value)} ({sector.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${sector.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Portfolio
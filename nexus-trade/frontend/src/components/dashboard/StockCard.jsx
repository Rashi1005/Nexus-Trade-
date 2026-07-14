import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, getChangeColor } from '../../utils/formatters'
import Button from '../common/Button'

const StockCard = ({ 
  stock, 
  onTrade,
  showActions = true 
}) => {
  const isPositive = stock.change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <div className="glass-card p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white text-lg">{stock.symbol}</h4>
          <p className="text-xs text-gray-400 truncate">{stock.name}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-mono ${
          isPositive ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
        }`}>
          {isPositive ? '+' : ''}{stock.change_percent?.toFixed(2)}%
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {formatCurrency(stock.current_price)}
          </span>
          <span className={`text-sm font-mono ${getChangeColor(stock.change)}`}>
            {isPositive ? '+' : ''}{formatCurrency(stock.change)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div>
          <span className="text-gray-400">Volume</span>
          <p className="font-mono text-white">{(stock.volume / 1000000).toFixed(2)}M</p>
        </div>
        <div>
          <span className="text-gray-400">Market Cap</span>
          <p className="font-mono text-white">
            {stock.market_cap ? `$${(stock.market_cap / 1000000000).toFixed(2)}B` : 'N/A'}
          </p>
        </div>
      </div>
      
      {showActions && (
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            variant="success"
            onClick={() => onTrade && onTrade(stock.symbol, 'buy')}
          >
            Buy
          </Button>
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => onTrade && onTrade(stock.symbol, 'sell')}
          >
            Sell
          </Button>
        </div>
      )}
    </div>
  )
}

export default StockCard
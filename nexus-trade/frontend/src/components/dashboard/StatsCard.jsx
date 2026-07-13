import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercent, getChangeColor } from '../../utils/formatters'

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changePercent,
  icon: Icon,
  prefix = '',
  suffix = '',
  trend = null
}) => {
  const isPositive = change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <div className="glass-card p-6 hover:scale-105 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-mono text-white">
            {prefix}{value}{suffix}
          </h3>
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-primary/20">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
      
      {(change !== undefined || changePercent !== undefined) && (
        <div className={`flex items-center gap-2 text-sm ${getChangeColor(change || changePercent)}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="font-mono">
            {change !== undefined && `${isPositive ? '+' : ''}${formatCurrency(change)} `}
            {changePercent !== undefined && `(${formatPercent(changePercent, 2)})`}
          </span>
        </div>
      )}
      
      {trend && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{trend.label}</span>
            <span className={getChangeColor(trend.value)}>{trend.value}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsCard
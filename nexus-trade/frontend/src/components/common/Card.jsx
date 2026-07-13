import React from 'react'

const Card = ({ 
  children, 
  className = '',
  hover = true,
  padding = true,
  title,
  subtitle,
  action
}) => {
  return (
    <div 
      className={`
        glass-card
        ${hover ? 'hover:shadow-lg' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {children}
    </div>
  )
}

export default Card
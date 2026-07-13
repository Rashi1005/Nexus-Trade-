import React from 'react'

const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
  size = 'md'
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'bg-success hover:bg-success/80 text-white',
    danger: 'bg-danger hover:bg-danger/80 text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-black'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${widthClass}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="loading-spinner w-5 h-5"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
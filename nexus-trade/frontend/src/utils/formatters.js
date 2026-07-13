// Format currency
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Format number
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Format percentage
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%'
  return `${value >= 0 ? '+' : ''}${formatNumber(value, decimals)}%`
}

// Format large numbers (1.5K, 2.3M, etc.)
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined) return '0'
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`
  }
  return value.toFixed(2)
}

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Format time
export const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return `${formatDate(dateString)} ${formatTime(dateString)}`
}

// Get change color class
export const getChangeColor = (value) => {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-danger'
  return 'text-gray-400'
}

// Get change background class
export const getChangeBg = (value) => {
  if (value > 0) return 'bg-success'
  if (value < 0) return 'bg-danger'
  return 'bg-gray-700'
}
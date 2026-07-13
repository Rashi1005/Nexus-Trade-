import React from 'react'

const Loading = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }
  
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-300/95 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  )
}

export default Loading
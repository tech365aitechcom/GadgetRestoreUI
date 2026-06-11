'use client'

import { AlertCircle } from 'lucide-react'

export default function ErrorState({
  title = 'Something went wrong',
  message,
  buttonText,
  onButtonClick,
  icon,
  className = '',
  fullScreen = false,
}) {
  const Icon = icon || <AlertCircle size={48} className='text-red-500' />

  return (
    <div
      className={`
        flex items-center justify-center bg-black text-white
        ${fullScreen ? 'min-h-screen' : 'min-h-[400px]'}
        ${className}
      `}
    >
      <div className='text-center max-w-md px-6 py-8'>
        {/* Icon */}
        <div className='flex justify-center mb-4'>{Icon}</div>

        {/* Title */}
        <h2 className='text-xl font-bold text-white mb-2'>{title}</h2>

        {/* Message */}
        {message && (
          <p className='text-sm text-gray-400 mb-6 leading-relaxed'>
            {message}
          </p>
        )}

        {/* Action Button */}
        {buttonText && onButtonClick && (
          <button
            onClick={onButtonClick}
            className='px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors'
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}

export function InlineError({ message, className = '' }) {
  return (
    <div
      className={`flex items-center gap-2 text-red-500 text-sm ${className}`}
    >
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  )
}

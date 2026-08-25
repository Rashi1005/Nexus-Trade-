import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium neon input with floating label, icon support, and error state.
 *
 * @param {string} label
 * @param {string} type
 * @param {string} name
 * @param {string} value
 * @param {Function} onChange
 * @param {string} placeholder
 * @param {React.ReactNode} icon  - Left side icon element
 * @param {string} error
 * @param {boolean} required
 * @param {string} className
 */
export default function Input({
  label,
  type = 'text',
  name,
  value = '',
  onChange,
  placeholder = '',
  icon,
  error,
  required = false,
  className = '',
}) {
  const [focused, setFocused] = useState(false);
  const uid = useId();
  const inputId = `input-${uid}`;

  const isFloating = focused || value !== '';

  return (
    <div className={`relative w-full ${className}`}>
      {/* Wrapper — provides relative context for floating label */}
      <motion.div
        animate={focused ? { scale: 1.005 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative"
      >
        {/* Left icon */}
        {icon && (
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10 transition-colors duration-200"
            style={{ color: focused ? '#00F5FF' : undefined }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {/* Input */}
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          placeholder={isFloating ? placeholder : ''}
          className={[
            'input-neon',
            'w-full',
            'peer',
            icon ? 'pl-10' : '',
            error ? 'border-red-500 focus:border-red-400 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.25)]' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />

        {/* Floating label */}
        {label && (
          <motion.label
            htmlFor={inputId}
            animate={
              isFloating
                ? { y: -26, x: icon ? -2 : 0, scale: 0.78, color: error ? '#ef4444' : '#00F5FF' }
                : { y: 0, x: 0, scale: 1, color: '#6b7280' }
            }
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none font-medium origin-left z-10"
            style={{ left: icon ? '2.75rem' : '1rem' }}
          >
            {label}
            {required && (
              <span className="ml-0.5 text-red-400" aria-hidden="true">
                *
              </span>
            )}
          </motion.label>
        )}

        {/* Focused glow border accent */}
        <motion.span
          className="absolute bottom-0 left-0 h-[2px] rounded-full pointer-events-none"
          animate={
            focused
              ? { width: '100%', opacity: 1 }
              : { width: '0%', opacity: 0 }
          }
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            background: error
              ? 'linear-gradient(90deg, #ef4444, #f87171)'
              : 'linear-gradient(90deg, #00F5FF, #0080FF)',
            boxShadow: error
              ? '0 0 8px rgba(239,68,68,0.6)'
              : '0 0 8px rgba(0,245,255,0.6)',
          }}
        />
      </motion.div>

      {/* Error message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${inputId}-error`}
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 text-xs text-red-400 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
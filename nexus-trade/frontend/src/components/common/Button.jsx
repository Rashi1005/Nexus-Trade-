import { motion } from 'framer-motion';

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

/**
 * Premium Button component for Nexus Trade.
 *
 * @param {'primary'|'secondary'|'success'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} fullWidth
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {Function} onClick
 * @param {React.ReactNode} children
 * @param {'button'|'submit'|'reset'} type
 * @param {string} className
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'btn',
        variantClasses[variant] ?? 'btn-primary',
        sizeClasses[size] ?? sizeClasses.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        'relative overflow-hidden select-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Shimmer highlight on hover */}
      {!isDisabled && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            {/* Spinning ring */}
            <span
              className="inline-block rounded-full border-2 border-current border-t-transparent animate-spin"
              style={{ width: '1em', height: '1em' }}
              aria-hidden="true"
            />
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const GLOW_COLORS = {
  cyan: {
    border: 'rgba(0, 245, 255, 0.55)',
    shadow: '0 0 24px rgba(0, 245, 255, 0.18)',
  },
  purple: {
    border: 'rgba(129, 140, 248, 0.55)',
    shadow: '0 0 24px rgba(129, 140, 248, 0.18)',
  },
  green: {
    border: 'rgba(0, 255, 136, 0.55)',
    shadow: '0 0 24px rgba(0, 255, 136, 0.18)',
  },
  none: {
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: 'none',
  },
};

const MAX_TILT = 8; // degrees

/**
 * Glassmorphism card with 3D mouse-tilt effect and optional glow border.
 *
 * @param {string}                          title
 * @param {string}                          subtitle
 * @param {React.ReactNode}                 children
 * @param {string}                          className
 * @param {boolean}                         noPad      - Remove inner padding
 * @param {'cyan'|'purple'|'green'|'none'}  glowColor
 * @param {Function}                        onClick
 */
export default function Card({
  title,
  subtitle,
  children,
  className = '',
  noPad = false,
  glowColor = 'none',
  onClick,
}) {
  const cardRef = useRef(null);
  const frameRef = useRef(null);

  const glow = GLOW_COLORS[glowColor] ?? GLOW_COLORS.none;
  const isInteractive = !!onClick;

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const rotY = (dx / (rect.width / 2)) * MAX_TILT;
    const rotX = -(dy / (rect.height / 2)) * MAX_TILT;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (!card) return;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01,1.01,1.01)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), border-color 0.3s ease, box-shadow 0.3s ease';
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      // Remove smooth transition during active tilt so it tracks the mouse instantly
      card.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease';
    }
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={[
        'glass',
        'relative rounded-xl overflow-hidden',
        'transition-[border-color,box-shadow] duration-300',
        isInteractive ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        borderColor: glow.border,
        boxShadow: glow.shadow,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Subtle inner top highlight for glass feel */}
      <span
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        }}
        aria-hidden="true"
      />

      {/* Glow corner accent */}
      {glowColor !== 'none' && (
        <span
          className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
          style={{ background: glow.border }}
          aria-hidden="true"
        />
      )}

      {/* Header */}
      {(title || subtitle) && (
        <div
          className={`${noPad ? 'px-5 pt-5' : 'px-5 pt-5 pb-0'} flex flex-col gap-0.5`}
        >
          {title && (
            <h3 className="text-sm font-semibold tracking-wide text-white/90">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-muted leading-snug">{subtitle}</p>
          )}
          {/* Divider */}
          <span
            className="mt-3 block h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.07), transparent)',
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Body */}
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </motion.div>
  );
}
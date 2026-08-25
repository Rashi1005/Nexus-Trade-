import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DOT_CYCLE = ['', '.', '..', '...'];
const DOT_INTERVAL = 450; // ms per dot step

function TypewriterDots() {
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % DOT_CYCLE.length);
    }, DOT_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-block w-8 text-left" aria-hidden="true">
      {DOT_CYCLE[dotIndex]}
    </span>
  );
}

/**
 * Premium deep-space orbital loading indicator.
 *
 * @param {boolean} fullScreen - Cover entire viewport with dark overlay
 * @param {string}  text       - Optional label below the spinner
 */
export default function Loading({ fullScreen = false, text = 'Loading' }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Orbital rings */}
      <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
        {/* Outer ring */}
        <motion.span
          className="absolute inset-0 rounded-full border border-cyan-400/30"
          style={{ borderTopColor: '#00F5FF' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Middle ring */}
        <motion.span
          className="absolute rounded-full border border-blue-400/25"
          style={{
            inset: 14,
            borderBottomColor: '#818CF8',
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner ring */}
        <motion.span
          className="absolute rounded-full border border-cyan-300/20"
          style={{
            inset: 28,
            borderRightColor: '#00F5FF',
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center glowing dot */}
        <motion.span
          className="relative rounded-full"
          style={{
            width: 10,
            height: 10,
            background: '#00F5FF',
            boxShadow: '0 0 12px 4px rgba(0,245,255,0.7)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbit trailing particles */}
        {[0, 120, 240].map((deg, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              background: '#00F5FF',
              boxShadow: '0 0 6px 2px rgba(0,245,255,0.5)',
              top: '50%',
              left: '50%',
              marginTop: -1.5,
              marginLeft: -1.5,
              transformOrigin: '1.5px 1.5px',
            }}
            animate={{ rotate: [deg, deg + 360] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0,
            }}
          >
            {/* Offset to ring edge */}
            <span
              className="absolute rounded-full"
              style={{
                width: 3,
                height: 3,
                background: '#00F5FF',
                transform: 'translateX(44px)',
                opacity: 0.6,
              }}
            />
          </motion.span>
        ))}
      </div>

      {/* Label */}
      <motion.p
        className="text-sm font-medium tracking-widest uppercase"
        style={{ color: 'rgba(0,245,255,0.75)' }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {text}
        <TypewriterDots />
      </motion.p>
    </div>
  );

  if (!fullScreen) return spinner;

  return (
    <AnimatePresence>
      <motion.div
        key="loading-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(6, 8, 21, 0.85)', backdropFilter: 'blur(10px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="status"
        aria-label={`${text}…`}
      >
        {spinner}
      </motion.div>
    </AnimatePresence>
  );
}
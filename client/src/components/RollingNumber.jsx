import React, { useEffect, useState, useRef } from 'react';

/**
 * RollingNumber Component
 * Animates number transitions like an authentic mechanical rolling odometer / counter.
 */
export default function RollingNumber({ value, duration = 350, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValRef = useRef(value);
  const targetValRef = useRef(value);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    startValRef.current = displayValue;
    targetValRef.current = value;
    startTimeRef.current = null;

    if (displayValue === value) return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(
        startValRef.current + (targetValRef.current - startValRef.current) * easeOut
      );

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className={`inline-block tabular-nums transition-transform ${className}`}>{displayValue.toLocaleString()}</span>;
}


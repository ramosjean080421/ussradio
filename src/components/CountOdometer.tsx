"use client";

import { useEffect, useRef, useState } from "react";

type CountOdometerProps = {
  end: number;
  start?: number;
  duration?: number; // ms
  delay?: number;    // ms
  className?: string;
};

/** Cuenta de start -> end con desaceleración al final (ease-out). */
export default function CountOdometer({
  end,
  start = 0,
  duration = 1400,
  delay = 0,
  className,
}: CountOdometerProps) {
  const [value, setValue] = useState(start);
  const [hasRun, setHasRun] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasRun) return;
      setHasRun(true);

      const tStart = performance.now() + delay;
      const from = start;
      const to = end;

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        if (now < tStart) {
          requestAnimationFrame(tick);
          return;
        }
        const p = Math.min((now - tStart) / duration, 1);
        const eased = easeOutCubic(p);
        const current = Math.round(from + (to - from) * eased);
        setValue(current);

        if (p < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.2 });

    io.observe(el);
    return () => io.disconnect();
  }, [end, start, duration, delay, hasRun]);

  return (
    <span ref={spanRef} className={className} aria-label={`${end}`}>
      {value}
    </span>
  );
}

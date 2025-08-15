"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function InlineRotator({
  words,
  interval = 2600,
  className = "",
  duration = 520, // ms de animación
}: {
  words: string[];
  interval?: number;
  className?: string;
  duration?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [anim, setAnim] = useState(false);
  const timer = useRef<number | null>(null);

  const longest = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [words]
  );

  useEffect(() => {
    timer.current = window.setInterval(() => {
      const n = (idx + 1) % words.length;
      setNextIdx(n);
      setAnim(true);
      window.setTimeout(() => {
        setIdx(n);
        setNextIdx(null);
        setAnim(false);
      }, duration);
    }, interval);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [idx, interval, duration, words.length]);

  return (
    <span
      aria-live="polite"
      className={`relative inline-block align-baseline ${className}`}
      style={{
        lineHeight: 1.35,
        minHeight: "1.6em",
        minWidth: `${longest.length}ch`,
      }}
    >
      {/* Palabra actual */}
      <span
        className={`absolute inset-0 transition-all`}
        style={{
          opacity: anim ? 0 : 1,
          transform: anim ? "translateY(-0.25em)" : "translateY(0)",
          filter: anim ? "blur(0.5px)" : "none",
          transitionDuration: `${duration}ms`,
        }}
      >
        {words[idx]}
      </span>

      {/* Próxima palabra (aparece suavemente) */}
      {nextIdx !== null && (
        <span
          className="absolute inset-0 transition-all"
          style={{
            opacity: anim ? 1 : 0,
            transform: anim ? "translateY(0)" : "translateY(0.25em)",
            filter: anim ? "blur(0)" : "blur(0.5px)",
            transitionDuration: `${duration}ms`,
          }}
        >
          {words[nextIdx]}
        </span>
      )}

      {/* Fallback para SSR / sin animación */}
      <span className="invisible">{words[idx]}</span>
    </span>
  );
}

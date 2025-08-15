"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  baseSpeed?: number;   // px/seg base
  boostFactor?: number; // multiplicador por velocidad de scroll
  className?: string;
};

export default function ScrollVelocity({
  text,
  baseSpeed = 60,
  boostFactor = 0.5,
  className = "",
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const laneRef = useRef<HTMLDivElement | null>(null);
  const lastTs = useRef<number>(0);
  const lastScrollY = useRef<number>(0);
  const [offset, setOffset] = useState(0);

  // construir el contenido repetido
  const content = ` ${text}  • `.repeat(10).trim();

  useEffect(() => {
    let raf = 0;

    const tick = (ts: number) => {
      if (!laneRef.current || !wrapRef.current) {
        lastTs.current = ts;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.max(0, (ts - lastTs.current) / 1000); // seg
      lastTs.current = ts;

      const dy = Math.abs(window.scrollY - lastScrollY.current);
      lastScrollY.current = window.scrollY;

      const boost = Math.min(600, dy * boostFactor); // límite de boost
      const speed = baseSpeed + boost;

      // ancho de la "pista"
      const laneWidth = laneRef.current.scrollWidth / 2 || 1;

      setOffset((prev) => {
        let next = prev - speed * dt;
        // hacer loop infinito
        if (Math.abs(next) >= laneWidth) next += laneWidth;
        return next;
      });

      raf = requestAnimationFrame(tick);
    };

    lastTs.current = performance.now();
    lastScrollY.current = window.scrollY;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [baseSpeed, boostFactor]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 ${className}`}
      ref={wrapRef}
      aria-label="Aviso de emisoras en Zeno.FM"
    >
      <div
        ref={laneRef}
        className="whitespace-nowrap will-change-transform"
        style={{
          transform: `translate3d(${offset}px,0,0)`,
        }}
      >
        {/* Dos copias para loop continuo */}
        <span className="inline-block pr-6 text-sm md:text-base text-white/85 tracking-wide">
          {content}
        </span>
        <span className="inline-block pr-6 text-sm md:text-base text-white/85 tracking-wide">
          {content}
        </span>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];       // rutas dentro de /public (por ejemplo: "/programacion/banner1.jpg")
  intervalMs?: number;    // por defecto 3000 ms
  className?: string;
};

export default function ProgramCarousel({
  images,
  intervalMs = 5000,
  className = "",
}: Props) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  // autoplay
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [images.length, intervalMs]);

  const go = (to: number) => setIdx((to + images.length) % images.length);

  return (
    <div className={`mt-10 ${className}`}>
      {/* Wrapper para centrar y controlar ancho */}
      <div className="mx-auto w-full">
        {/* 
          - En móviles: ocupa todo el ancho disponible pero mantiene el ratio 728/90.
          - Desde sm (>=640px): fija exactamente 728x90.
        */}
        <div
          className={[
            "relative mx-auto overflow-hidden rounded-2xl shadow-lg",
            "aspect-[728/90] w-full",   // móvil: ancho flexible, respeta el ratio
            "sm:w-[728px] sm:h-[90px] sm:aspect-auto", // desktop/tablet: tamaño exacto 728x90
            "ring-1 ring-white/10 bg-black/30",
          ].join(" ")}
        >
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Banner ${i + 1}`}
              className={[
                "absolute inset-0 h-full w-full transition-opacity duration-500",
                // object-contain para no recortar el diseño del banner
                "object-contain bg-black/20",
                i === idx ? "opacity-100" : "opacity-0",
              ].join(" ")}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}

          {/* bullets */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={`h-1.5 w-4 rounded-full transition ${
                    i === idx ? "bg-[var(--accent)]" : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Ir al banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

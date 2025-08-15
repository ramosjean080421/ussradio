"use client";
import * as React from "react";

export default function SnapCarousel({ children }: { children: React.ReactNode }) {
  const slides = React.Children.toArray(children);
  const [index, setIndex] = React.useState(0);

  const go = (i: number) => {
    if (slides.length === 0) return;
    const next = ((i % slides.length) + slides.length) % slides.length;
    setIndex(next);
  };

  return (
    <div className="relative w-full">
      {/* Pista: sin scroll, solo transform */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((child, i) => (
            <div key={i} className="min-w-full p-6">
              <div className="flex items-center justify-center">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <button
        onClick={() => go(index - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/40 backdrop-blur hover:bg-black/55"
        aria-label="Anterior"
        title="Anterior"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button
        onClick={() => go(index + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/40 backdrop-blur hover:bg-black/55"
        aria-label="Siguiente"
        title="Siguiente"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2.5 bg-white/35 hover:bg-white/70"
            }`}
            aria-label={`Ir al slide ${i + 1}`}
            title={`Ir al slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Un único badge (fecha + hora) — se renderiza solo en cliente
const ClockDateBadge = dynamic(() => import("@/components/ClockDateBadge"), {
  ssr: false,
});

type LinkDef = { href: `#${string}`; label: string };

const links: LinkDef[] = [
  { href: "#inicio", label: "Inicio" },
  { href: "#emisoras", label: "Emisoras" },
  { href: "#noticias", label: "Noticias" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#galeria", label: "Galería" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<LinkDef["href"]>("#inicio");

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const [indicator, setIndicator] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  const setLinkRef = useCallback(
    (key: string) => (el: HTMLAnchorElement | null) => {
      linkRefs.current[key] = el;
    },
    []
  );

  const updateIndicator = useCallback(() => {
    const wrap = wrapRef.current;
    const el = linkRefs.current[active];
    if (!wrap || !el) return;
    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({
      left: elRect.left - wrapRect.left,
      width: elRect.width,
      visible: true,
    });
  }, [active]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateIndicator]);

  // Sección activa según scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);

      const mid = window.innerHeight / 2;
      let bestId: LinkDef["href"] | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const l of links) {
        const el = document.querySelector<HTMLElement>(l.href);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = l.href;
        }
      }
      if (bestId && bestId !== active) setActive(bestId);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "backdrop-blur-md bg-black/40 border-b border-white/10" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between pl-4 pr-2 md:pl-6 md:pr-3 py-3 max-w-none">


        {/* Marca */}
        <a href="#inicio" className="text-lg font-semibold tracking-wide">
          <span className="text-white">RADIO</span>{" "}
          <span className="text-[var(--accent)]">EN VIVO</span>
        </a>

        {/* Links + indicador + badge unificado */}
        <div className="relative flex items-center gap-3 pb-2" ref={wrapRef}>
          <ul className="flex items-center gap-3 text-sm md:gap-6">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  ref={setLinkRef(l.href)}
                  className={`inline-block py-1 transition ${
                    active === l.href ? "text-white" : "text-white/80 hover:text-white"
                  }`}
                  aria-current={active === l.href ? "page" : undefined}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <span
            className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-white transition-all duration-300 ease-out"
            style={{
              width: `${indicator.width}px`,
              transform: `translateX(${indicator.left}px)`,
              opacity: indicator.visible ? 1 : 0,
              left: 0,
            }}
            aria-hidden
          />

          {/* Fecha + Hora en un mismo contenedor */}
          <ClockDateBadge className="hidden sm:inline-flex" />
        </div>
      </nav>
    </header>
  );
}

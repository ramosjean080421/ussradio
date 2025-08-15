"use client";

import { useEffect, useMemo, useState } from "react";

type Props = { className?: string };

export default function ClockDateBadge({ className = "" }: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  // Refresco cada segundo (zona horaria de Perú)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { dateText, timeText } = useMemo(() => {
    const d = new Date(now);

    // 13 AGO 2025
    const parts = new Intl.DateTimeFormat("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).formatToParts(d);
    const pick = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const dateText = `${pick("day")} ${pick("month").replace(".", "").toUpperCase()} ${pick(
      "year"
    )}`;

    // 14:33:09
    const timeText = new Intl.DateTimeFormat("es-PE", {
      timeZone: "America/Lima",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);

    return { dateText, timeText };
  }, [now]);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/70 px-3 py-1.5 shadow-lg backdrop-blur-sm ${className}`}
      style={{ transform: "translateZ(0)" }}
      aria-label="Fecha y hora - Perú"
    >
      <span
        suppressHydrationWarning
        className="select-none font-mono tabular-nums tracking-[0.08em] text-[13px] md:text-[14px] leading-none text-white/85"
        style={{ fontFeatureSettings: "'tnum' 1" }}
      >
        {dateText}
      </span>
      <span className="text-white/30">•</span>
      <span
        suppressHydrationWarning
        className="select-none font-mono tabular-nums text-[15px] md:text-[16px] leading-none text-[var(--accent)] drop-shadow-[0_0_6px_rgba(74,222,128,0.45)]"
        style={{ fontFeatureSettings: "'tnum' 1" }}
      >
        {timeText}
      </span>
    </div>
  );
}

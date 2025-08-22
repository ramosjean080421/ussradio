"use client";
import { useEffect, useRef, useState } from "react";
import type { Station } from "@/data/stations";

/* Perlin 1D para darle vida orgánica */
class Perlin {
  perm: number[];
  constructor() {
    const tmp = Array.from({ length: 256 }, () => Math.floor(Math.random() * 256));
    this.perm = tmp.concat(tmp);
  }
  private grad(i: number, x: number) {
    const h = i & 0xf;
    const g = 1 + (h & 7);
    return (h & 8) !== 0 ? -g * x : g * x;
  }
  getValue(x: number) {
    const i0 = Math.floor(x);
    const i1 = i0 + 1;
    const x0 = x - i0;
    const x1 = x0 - 1;
    let t0 = 1 - x0 * x0;
    t0 *= t0;
    let t1 = 1 - x1 * x1;
    t1 *= t1;
    const n0 = t0 * t0 * this.grad(this.perm[i0 & 0xff], x0);
    const n1 = t1 * t1 * this.grad(this.perm[i1 & 0xff], x1);
    return 0.395 * (n0 + n1); // ~[-1,1]
  }
}

export default function PlayerCard({ station }: { station: Station }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setPlaying] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  // Estado para el nombre de la canción
  const [songTitle, setSongTitle] = useState<string | null>(null);

  // Imagen (con fallback y sin referrer)
  const [imgSrc, setImgSrc] = useState(station.imageUrl);
  useEffect(() => setImgSrc(station.imageUrl), [station.imageUrl]);

  // Pausar otras emisoras al reproducir esta y reiniciar estados/búfer
  useEffect(() => {
    const onSomeonePlays = (e: Event) => {
      const id = (e as CustomEvent<any>).detail;
      if (id !== station.id) {
        const a = audioRef.current;
        if (a) {
          a.pause();
          // Restablecer estados de la tarjeta y vaciar búfer
          setPlaying(false);
          setLoading(false);
          setError(null);
          a.currentTime = 0;
          // volver a asignar la misma URL limpia el buffer sin iniciar carga
          a.src = station.streamUrl;
        }
      }
    };
    window.addEventListener("radio:play", onSomeonePlays as EventListener);
    return () =>
      window.removeEventListener("radio:play", onSomeonePlays as EventListener);
  }, [station.id, station.streamUrl]);

  // Obtener metadata de la canción actual mediante SSE
  useEffect(() => {
    const slug = station.streamUrl.split("/").pop();
    if (!slug) return;

    // Abrir conexión SSE con Zeno para el punto de montaje
    const es = new EventSource(
      `https://api.zeno.fm/mounts/metadata/subscribe/${slug}`
    );

    es.onmessage = (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        if (data.streamTitle) {
          setSongTitle(data.streamTitle);
        }
      } catch (err) {
        console.warn("Error parsing stream metadata", err);
      }
    };

    // Cerrar la conexión al desmontar o cambiar de estación
    return () => {
      es.close();
    };
  }, [station.streamUrl]);

  // Eventos del audio
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;

    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
      setError(null);
    };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onError = () => {
      setLoading(false);
      setPlaying(false);
      setError("No se pudo reproducir el stream.");
    };

    a.addEventListener("playing", onPlaying);
    a.addEventListener("pause", onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("stalled", onWaiting);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("stalled", onWaiting);
      a.removeEventListener("error", onError);
    };
  }, [volume]);

  /* ===== Waveform simétrica (canvas) — solo al reproducir ===== */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      const cssW = Math.max(1, canvas.clientWidth);
      const cssH = Math.max(1, canvas.clientHeight);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() ||
      "#69ee33"; // color de respaldo si no se encuentra la variable

    const noise = new Perlin();
    let t = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      const points = 180;
      const amp = h * 0.32;
      const envFreq = 0.06;
      const spikeFreq = 0.9;
      const spikeAmt = 0.22;
      const speed = 0.018;

      const xs: number[] = [];
      const ysTop: number[] = [];
      for (let i = 0; i < points; i++) {
        const x = (i / (points - 1)) * w;
        const env = noise.getValue(i * envFreq + t);
        const spikes =
          Math.sin(i * spikeFreq + t * 6) * 0.5 +
          Math.sin(i * spikeFreq * 1.7 + t * 9) * 0.5;
        const m = env * (1 - spikeAmt) + spikes * spikeAmt;
        const y = cy - m * amp;
        xs.push(x);
        ysTop.push(y);
      }

      const ysBottom = ysTop.map((y) => cy + (cy - y));

      ctx.beginPath();
      ctx.moveTo(xs[0], ysTop[0]);
      for (let i = 1; i < points; i++) ctx.lineTo(xs[i], ysTop[i]);
      for (let i = points - 1; i >= 0; i--) ctx.lineTo(xs[i], ysBottom[i]);
      ctx.closePath();

      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = accent;
      ctx.stroke();

      t += speed;
      rafRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) {
      // Pausar como hasta ahora
      return a.pause();
    }
    try {
      setLoading(true);
      // Notificar a otras emisoras para que se detengan
      window.dispatchEvent(new CustomEvent("radio:play", { detail: station.id } as any));
      // Reiniciar el audio para conectar en vivo
      a.currentTime = 0;
      a.load();
      await a.play();
    } catch {
      setLoading(false);
      setError("Autoplay bloqueado: presiona Play otra vez.");
    }
  };

  /* ---------- Cover clickable si hay zenoUrl ---------- */
  const CoverBlock = (
    <div className="relative mx-auto aspect-square w-48 rounded-2xl bg-[#161a1e] p-2 shadow-inner z-10">
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
      <img
        src={imgSrc}
        alt={station.name}
        className="relative z-[1] h-full w-full rounded-xl object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() =>
          setImgSrc(
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=70&auto=format"
          )
        }
      />
    </div>
  );

  return (
    <article
      className="
        relative pt-2
        w-full max-w-[340px] h-[500px]
        rounded-xl border border-white/10 bg-white/5 p-5 shadow-lg
        transition hover:bg-white/10
        flex flex-col
      "
    >
      {/* ON AIR */}
      <div
        className={`
          absolute right-3 top-3 z-30 pointer-events-none
          inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
          border transition
          ${
            isPlaying
              ? "bg-red-600 text-white border-red-300/30 shadow-[0_0_20px_rgba(239,68,68,.35)]"
              : "bg-black/60 text-white/60 border-white/10"
          }
        `}
      >
        <span
          className={`block h-2 w-2 rounded-full ${
            isPlaying ? "bg-white animate-pulse" : "bg-white/40"
          }`}
        />
        ON AIR
      </div>

      {/* COVER (clic a Zeno si hay zenoUrl) */}
      {station.zenoUrl ? (
        <a
          href={station.zenoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir perfil en Zeno.fm"
          aria-label={`Abrir ${station.name} en Zeno.fm`}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl"
        >
          {CoverBlock}
        </a>
      ) : (
        CoverBlock
      )}

      {/* Título y subtítulo */}
      <div className="mt-4 text-center">
        <h3 className="truncate text-lg font-semibold">{station.name}</h3>
        {station.description && (
          <p className="mt-1 text-sm text-white/70">{station.description}</p>
        )}
        {/* Mostrar título de la canción desplazándose cuando está reproduciendo */}
        {isPlaying && songTitle && (
          <div className="mt-1 text-xs text-[var(--accent)] w-full overflow-hidden">
            <div
              style={{
                whiteSpace: "nowrap",
                display: "inline-block",
                animation: "scroll-left 12s linear infinite",
              }}
            >
              {songTitle}
            </div>
          </div>
        )}
      </div>

      {/* Waveform simétrica (oculta hasta reproducir) */}
      <div
        className={`mt-4 transition-all duration-300 ${
          isPlaying ? "opacity-100 h-20" : "opacity-0 h-0"
        }`}
      >
        <canvas ref={canvasRef} className="block h-20 w-full max-w-sm mx-auto" />
      </div>

      {/* Botón + Volumen */}
      <div className="mt-4 space-y-3">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="relative w-full overflow-hidden rounded-full bg-[var(--accent)] py-3 text-center font-medium text-black shadow-[0_8px_20px_rgba(0,0,0,.25)] transition hover:brightness-110 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="absolute inset-0 grid place-items-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-transparent" />
            </span>
          ) : null}
          <span className={isLoading ? "opacity-0" : "opacity-100"}>
            {isPlaying ? "Pausar" : "Escuchar en vivo"}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-80">
            <path d="M4 10v4h4l5 4V6l-5 4H4z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            style={{ ["--p" as any]: `${Math.round(volume * 100)}%` }}
            className="modern-range h-2 w-full"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

      <audio ref={audioRef} src={station.streamUrl} preload="none" crossOrigin="anonymous" />
    </article>
  );
}

// src/components/Gallery.tsx
"use client";
import { useEffect, useState } from "react";

/* ---------- Tipos ---------- */
type VideoItem = { videoId: string; title?: string; publishedAt?: string; thumb?: string };

/* ---------- Config ---------- */
const YT_PAGE_SIZE = 6;

// Leemos los canales desde variables públicas (puedes poner @handle o URL o channelId UC…)
const RAW_CH1 = process.env.NEXT_PUBLIC_YT_CH1 || "@LAHORADELPLANETA-nn6ub";
const RAW_CH2 = process.env.NEXT_PUBLIC_YT_CH2 || "@radiouss3081"; // fallback razonable

// Normaliza: si no empieza con http/@/UC, antepone @
const normalizeId = (s: string) =>
  s.startsWith("http") || s.startsWith("@") || s.startsWith("UC") ? s : `@${s}`;

/* =================================================================
   Componente (dos pestañas de videos: LHP y USS) con paginación por páginas
   ================================================================= */
export default function Gallery() {
  type Tab = "lhp" | "uss";
  const [tab, setTab] = useState<Tab>("lhp");

  // Estado por pestaña
  const [dataByTab, setDataByTab] = useState<{
    lhp: { items: VideoItem[]; loading: boolean; error: string | null; page: number; pageCount: number };
    uss: { items: VideoItem[]; loading: boolean; error: string | null; page: number; pageCount: number };
  }>({
    lhp: { items: [], loading: false, error: null, page: 1, pageCount: 1 },
    uss: { items: [], loading: false, error: null, page: 1, pageCount: 1 },
  });

  const [refreshKey, setRefreshKey] = useState(0);

  // Mapa pestaña -> canal normalizado
  const channelByTab: Record<Tab, string> = {
    lhp: normalizeId(RAW_CH1),
    uss: normalizeId(RAW_CH2),
  };

  // Carga de videos (por pestaña y página)
  useEffect(() => {
    const run = async () => {
      const ch = channelByTab[tab];
      const curPage = dataByTab[tab].page;

      setDataByTab((s) => ({ ...s, [tab]: { ...s[tab], loading: true, error: null } }));

      try {
        const url = new URL("/api/youtube", window.location.origin);
        url.searchParams.set("id", ch);
        url.searchParams.set("pageSize", String(YT_PAGE_SIZE));
        url.searchParams.set("page", String(curPage));

        const res = await fetch(url.toString(), { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : { error: "Respuesta no JSON" };

        if (data.error) {
          setDataByTab((s) => ({
            ...s,
            [tab]: { ...s[tab], items: [], loading: false, error: data.error, pageCount: 1 },
          }));
          return;
        }

        setDataByTab((s) => ({
          ...s,
          [tab]: {
            ...s[tab],
            items: data.items || [],
            page: data.page || curPage,
            pageCount: data.pageCount || 1,
            loading: false,
            error: null,
          },
        }));
      } catch (e: any) {
        setDataByTab((s) => ({
          ...s,
          [tab]: {
            ...s[tab],
            items: [],
            loading: false,
            error: e?.message || "Error inesperado",
            pageCount: 1,
          },
        }));
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dataByTab[tab].page, refreshKey]);

  // Refrescar al volver al foco
  useEffect(() => {
    const onFocus = () => setRefreshKey((k) => k + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  /* ---------- Render ---------- */
  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => {
        setTab(id);
        // Al cambiar de pestaña, reseteamos a página 1
        setDataByTab((s) => ({ ...s, [id]: { ...s[id], page: 1 } }));
      }}
      className={`rounded-full px-4 py-2 text-sm font-medium transition
        ${tab === id ? "bg-[var(--accent)] text-black" : "bg-white/5 text-white/80 hover:bg-white/10"}`}
    >
      {label}
    </button>
  );

  const cur = dataByTab[tab];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Galería</h2>
          <p className="mt-2 text-white/70">Videos más recientes por canal.</p>
        </div>

        <div className="flex items-center gap-2">
          <TabBtn id="lhp" label="LA HORA DEL PLANETA" />
          <TabBtn id="uss" label="USS RADIO" />
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            title="Actualizar lista"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cur.loading &&
          Array.from({ length: YT_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="aspect-video w-full bg-white/10" />
              <div className="p-4">
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          ))}

        {!cur.loading && cur.error && (
          <div className="col-span-full rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-yellow-200">
            {cur.error}
          </div>
        )}

        {!cur.loading &&
          !cur.error &&
          cur.items.map((v) => (
            <div key={v.videoId} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="aspect-video w-full overflow-hidden bg-black/40">
                <iframe
                  src={`https://www.youtube.com/embed/${v.videoId}?rel=0`}
                  title={v.title || "Video"}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{v.title || "Video"}</h3>
                {v.publishedAt && (
                  <p className="mt-1 text-xs text-white/60">
                    {new Date(v.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Paginación por pestaña (páginas independientes) */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() =>
            setDataByTab((s) => ({ ...s, [tab]: { ...s[tab], page: Math.max(1, s[tab].page - 1) } }))
          }
          disabled={cur.page <= 1 || cur.loading}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          Anterior
        </button>

        <span className="text-sm text-white/60">
          Página {cur.page} de {cur.pageCount}
        </span>

        <button
          onClick={() =>
            setDataByTab((s) => ({
              ...s,
              [tab]: { ...s[tab], page: Math.min(s[tab].pageCount, s[tab].page + 1) },
            }))
          }
          disabled={cur.page >= cur.pageCount || cur.loading}
          className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

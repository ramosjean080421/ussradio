// src/components/NewsToday.tsx
"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  title: string;
  link: string;
  isoDate?: string;
  image?: string | null;
  description?: string;
};

export default function NewsToday() {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(2);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const url = new URL("/api/news", window.location.origin);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", "6");
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error cargando noticias.");
        if (!alive) return;
        setItems(data.items || []);
        setPageCount(data.pageCount || 1);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error inesperado");
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [page]);

  return (
    <section id="noticias" className="scroll-mt-24 border-t border-white/10 bg-[#0e1114]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Noticias de hoy</h2>
            <p className="mt-2 text-white/70">
              Titulares de Perú (El Comercio), actualizados automáticamente.
            </p>
          </div>

          {/* Paginación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-white/60">
              Página {page} de {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount || loading}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* Grid de tarjetas */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`s${i}`}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[16/10] w-full bg-white/10" />
                <div className="p-4">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-white/10" />
                </div>
              </div>
            ))}

          {!loading && err && (
            <div className="col-span-full rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
              {err}
            </div>
          )}

          {!loading &&
            !err &&
            items.map((n) => (
              <article
                key={n.id || n.link}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                  {n.image ? (
                    <img
                      src={n.image}
                      alt={n.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-white/50">
                      Sin imagen
                    </div>
                  )}

                  {/* Botón Abrir (hover) */}
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-black opacity-0 transition-opacity group-hover:opacity-100"
                    title="Abrir en el sitio"
                  >
                    Abrir
                  </a>
                </div>

                <div className="p-4">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-white/50">
                    elcomercio.pe
                    {n.isoDate && (
                      <>
                        {" "}
                        •{" "}
                        {new Date(n.isoDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold">{n.title}</h3>
                  {n.description && (
                    <p className="mt-2 text-sm text-white/70">{n.description}</p>
                  )}
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}

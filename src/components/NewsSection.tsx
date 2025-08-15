"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  url: string;
  title: string;
  description: string;
  image: string | null;
  source: "elcomercio.pe";
  publishedAt: string | null;
};

type ApiResp = {
  page: number;
  pageCount: number;
  pageSize: number;
  items: NewsItem[];
};

export default function NewsSection() {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(2);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const PAGE_SIZE = 6;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const url = new URL("/api/news", window.location.origin);
        url.searchParams.set("page", String(page));
        const res = await fetch(url.toString(), { cache: "no-store" });
        const data: ApiResp = await res.json();
        if (!res.ok) throw new Error((data as any)?.error || "Error");

        if (!cancelled) {
          setItems(data.items || []);
          setPageCount(Math.max(1, Math.min(2, data.pageCount || 1)));
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Error inesperado");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const Card = ({ n }: { n: NewsItem }) => {
    const host = "elcomercio.pe";
    const short =
      n.description?.length > 140 ? n.description.slice(0, 140).trim() + "…" : n.description;

    return (
      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {/* Imagen + overlay */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40 group">
          {n.image ? (
            <img
              src={n.image}
              alt={n.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/60">
              Sin imagen
            </div>
          )}

          {/* Overlay al hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          <a
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto absolute right-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-black shadow hover:brightness-95"
            title={`Abrir en ${host}`}
          >
            Abrir
          </a>
        </div>

        {/* Texto */}
        <div className="p-4">
          <p className="text-xs text-white/50">
            {host}
            {n.publishedAt && (
              <>
                {" · "}
                {new Date(n.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </>
            )}
          </p>
          {/* TÍTULO LIMPIO (ya viene sin “| EL COMERCIO PERÚ”) */}
          <h3 className="mt-1 line-clamp-2 font-semibold">{n.title}</h3>
          {short && <p className="mt-2 line-clamp-2 text-sm text-white/70">{short}</p>}
        </div>
      </article>
    );
  };

  return (
    <section id="noticias" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Noticias de hoy</h2>
            <p className="mt-2 text-white/70">
              Titulares de Perú (El Comercio), actualizados automáticamente cada día.
            </p>
          </div>

          {/* Paginación: máx. 2 páginas */}
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

        {/* Grid 3x2 */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[16/9] w-full bg-white/10" />
                <div className="p-4">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
                </div>
              </div>
            ))}

          {!loading && err && (
            <div className="col-span-full rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
              {err}
            </div>
          )}

          {!loading && !err && items.map((n) => <Card key={n.url} n={n} />)}
        </div>
      </div>
    </section>
  );
}

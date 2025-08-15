// src/app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import * as cheerio from "cheerio";

// ❗ Habilita caché a 12 horas en el handler (por URL/página)
// (Quita cualquier `export const dynamic = "force-dynamic"` que tuvieras antes)
export const revalidate = 43200; // 12h en segundos

type ECItem = {
  id: string;
  title: string;
  link: string;
  isoDate?: string;
  description?: string;
  image?: string | null;
};

const FEEDS = [
  "https://elcomercio.pe/arcio/rss/?outputType=xml",
  "https://elcomercio.pe/feed",
];

const parser = new Parser({ timeout: 15000 });

async function getFirstWorkingFeedXML(): Promise<string> {
  for (const url of FEEDS) {
    try {
      // Cachea el XML 12h
      const res = await fetch(url, { next: { revalidate: 43200 } });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes("<rss")) return text;
    } catch {/* siguiente */}
  }
  throw new Error("No se pudo leer el RSS de El Comercio.");
}

function getImageFromItem(item: any): string | null {
  const enc = (item as any)?.enclosure;
  if (enc && typeof enc.url === "string") return enc.url;

  const mediaContent = (item as any)["media:content"];
  if (mediaContent && typeof mediaContent.url === "string") return mediaContent.url;

  const mediaThumb = (item as any)["media:thumbnail"];
  if (mediaThumb && typeof mediaThumb.url === "string") return mediaThumb.url;

  const html =
    (item as any)["content:encoded"] ||
    (item as any).content ||
    (item as any).contentSnippet;

  if (typeof html === "string") {
    const $ = cheerio.load(html);
    const src = $("img").first().attr("data-src") || $("img").first().attr("src") || null;
    if (src) return src;
  }
  return null;
}

async function fetchOgImage(link: string): Promise<string | null> {
  try {
    // También cachea el HTML del artículo 12h (por URL)
    const res = await fetch(link, { next: { revalidate: 43200 } });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    const og =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      null;
    return og || null;
  } catch {
    return null;
  }
}

function cleanDescription(desc?: string): string {
  if (!desc) return "";
  const text = cheerio.load(`<div>${desc}</div>`)("div").text().replace(/\s+/g, " ").trim();
  return text.length > 190 ? text.slice(0, 187) + "…" : text;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.min(2, Number(searchParams.get("page") || "1")));
  const pageSize = Math.max(1, Math.min(6, Number(searchParams.get("pageSize") || "6")));

  try {
    const xml = await getFirstWorkingFeedXML();
    const feed = await parser.parseString(xml);

    let items: ECItem[] =
      (feed.items || []).map((it: any) => {
        const link: string = it.link || "";
        const id: string = it.guid || it.id || link || crypto.randomUUID();
        const title: string = (it.title || "").toString().trim();
        const isoDate: string | undefined = it.isoDate;
        const image = getImageFromItem(it);
        const description = cleanDescription(
          it.contentSnippet || it.summary || it.content || it["content:encoded"]
        );
        return { id, title, link, isoDate, image, description };
      }) || [];

    const seen = new Set<string>();
    items = items.filter((x) => {
      if (!x.link) return false;
      if (seen.has(x.link)) return false;
      seen.add(x.link);
      return true;
    });

    // Completa imágenes faltantes (limitado para no sobrecargar)
    const candidates = items.slice(0, 14);
    await Promise.all(
      candidates.map(async (it) => {
        if (!it.image) it.image = await fetchOgImage(it.link);
      })
    );

    items = items.slice(0, 12); // 2 páginas x 6

    const total = items.length;
    const pageCount = Math.max(1, Math.min(2, Math.ceil(total / pageSize)));
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    return NextResponse.json(
      { items: pageItems, page, pageCount, total },
      {
        headers: {
          // CDN (Vercel) cachea 12h; sirve stale 10 min mientras revalida
          "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=600",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "No se pudieron cargar noticias." },
      { status: 500 }
    );
  }
}

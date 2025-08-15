import { NextResponse } from "next/server";

export const revalidate = 43200; // 12h - literal para Vercel

type NewsItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  image?: string;
  source: "elcomercio";
  publishedAt?: string;
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function stripSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
function unescapeHTML(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
function cdataOrText(chunk: string, tag: string): string {
  const re1 = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i");
  const re2 = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = chunk.match(re1) || chunk.match(re2);
  return m ? stripSpaces(unescapeHTML(m[1])) : "";
}
function findFirstAttr(chunk: string, tag: string, attr: string): string {
  const m = chunk.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"[^>]*>`, "i"));
  return m ? stripSpaces(m[1]) : "";
}
function extractFirstImg(html: string): string {
  const m = html.match(/<img[^>]+src="([^"]+)"/i);
  return m ? stripSpaces(m[1]) : "";
}

function parseRss(xml: string): NewsItem[] {
  const itemBlocks = Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)).map((m) => m[1]);
  const items: NewsItem[] = [];

  for (let i = 0; i < itemBlocks.length; i++) {
    const chunk = itemBlocks[i];

    const title = cdataOrText(chunk, "title");
    let link = cdataOrText(chunk, "link");
    if (!/^https?:\/\//i.test(link)) {
      const guid = cdataOrText(chunk, "guid");
      if (/^https?:\/\//i.test(guid)) link = guid;
    }

    const descRaw = cdataOrText(chunk, "description");
    const contentEncoded = cdataOrText(chunk, "content:encoded");
    const description =
      stripSpaces((descRaw || contentEncoded).replace(/<[^>]+>/g, "")) || "Noticia de El Comercio";

    const image =
      findFirstAttr(chunk, "enclosure", "url") ||
      findFirstAttr(chunk, "media:content", "url") ||
      findFirstAttr(chunk, "media:thumbnail", "url") ||
      extractFirstImg(contentEncoded || descRaw) ||
      undefined;

    const publishedAt =
      cdataOrText(chunk, "pubDate") || cdataOrText(chunk, "dc:date") || cdataOrText(chunk, "published") || undefined;

    if (title && /^https?:\/\//i.test(link)) {
      const safe = encodeURIComponent(link).replace(/[^a-z0-9]/gi, "").slice(-12);
      items.push({
        id: `ec-${i}-${safe || String(i)}`,
        title,
        url: link,
        description,
        image,
        source: "elcomercio",
        publishedAt,
      });
    }
  }

  return items;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": UA }, next: { revalidate } });
  return await res.text();
}

async function fetchElComercioBase(): Promise<NewsItem[]> {
  // Intento 1
  try {
    const xml = await fetchText("https://elcomercio.pe/feed");
    const items = parseRss(xml);
    if (items.length) return items;
  } catch {}

  // Intento 2 (feed alterno)
  try {
    const xml = await fetchText("https://elcomercio.pe/arcio/rss/");
    const items = parseRss(xml);
    if (items.length) return items;
  } catch {}

  return [];
}

async function fetchGoogleNewsFallback(): Promise<NewsItem[]> {
  const url = "https://news.google.com/rss/search?q=site:elcomercio.pe&hl=es-419&gl=PE&ceid=PE:es-419";
  try {
    const xml = await fetchText(url);
    const parsed = parseRss(xml);
    return parsed.map((n, idx) => {
      const safe = encodeURIComponent(n.url).replace(/[^a-z0-9]/gi, "").slice(-12);
      return { ...n, id: `ec-gn-${idx}-${safe}` };
    });
  } catch {
    return [];
  }
}

async function enrichWithOgImage(items: NewsItem[], limit = 12): Promise<NewsItem[]> {
  const out = [...items];
  const n = Math.min(limit, out.length);
  for (let i = 0; i < n; i++) {
    if (out[i].image) continue;
    const url = out[i].url;
    try {
      const html = await fetchText(url);
      const m =
        html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
      if (m && m[1]) out[i].image = stripSpaces(m[1]);
    } catch {
      // ignorar fallos por artículo
    }
  }
  return out;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageSize = Math.max(1, Math.min(6, Number(searchParams.get("pageSize") || 6)));
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  try {
    const base = await fetchElComercioBase();
    const primary = base.length ? base : await fetchGoogleNewsFallback();
    if (!primary.length) {
      return NextResponse.json({ items: [], page: 1, pageCount: 1, error: "El feed no devolvió ítems válidos" });
    }

    // Completar imágenes que falten (hasta 12)
    const enriched = await enrichWithOgImage(primary, 12);

    // Paginación (máximo 12 ítems)
    const capped = enriched.slice(0, 12);
    const pageCount = Math.max(1, Math.ceil(capped.length / pageSize));
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * pageSize;
    const items = capped.slice(start, start + pageSize);

    return NextResponse.json({ items, page: safePage, pageCount, error: null }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ items: [], page: 1, pageCount: 1, error: msg || "Error al cargar noticias" }, { status: 200 });
  }
}

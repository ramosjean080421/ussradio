import { NextResponse } from "next/server";

export const revalidate = 43200; // 12h en literal

type Item = { videoId: string; title: string; publishedAt: string; thumb?: string };

const CH_ID_RE = /^UC[\w-]{22}$/;

function unescapeHTML(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseFeed(xml: string): Item[] {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map((m) => m[1]);
  return entries
    .map((e) => {
      const videoId = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "").trim();
      const title = unescapeHTML((e.match(/<title>([^<]+)<\/title>/)?.[1] || "").trim());
      const publishedAt = (e.match(/<published>([^<]+)<\/published>/)?.[1] || "").trim();
      const thumb =
        (e.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] || "").replace(
          /hqdefault\.jpg/,
          "maxresdefault.jpg"
        );
      return { videoId, title, publishedAt, thumb };
    })
    .filter((x) => x.videoId);
}

async function resolveChannel(input: string | null): Promise<
  | { kind: "channelId"; value: string }
  | { kind: "user"; value: string }
  | null
> {
  if (!input) return null;
  const q = input.trim(); // prefer-const

  // channelId directo
  if (CH_ID_RE.test(q)) return { kind: "channelId", value: q };

  // Si es URL o path lo normalizamos
  try {
    const u = new URL(q.startsWith("http") ? q : `https://www.youtube.com/${q}`);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "channel" && parts[1] && CH_ID_RE.test(parts[1])) {
      return { kind: "channelId", value: parts[1] };
    }
    if (parts[0] === "user" && parts[1]) {
      return { kind: "user", value: parts[1] };
    }
    if (parts[0]?.startsWith("@")) {
      // Resolución de handle -> channelId (parseando el HTML)
      const res = await fetch(`https://www.youtube.com/${parts[0]}`, {
        headers: { "user-agent": "Mozilla/5.0" },
      });
      const html = await res.text();
      const m =
        html.match(/"channelId":"(UC[\w-]{22})"/) ||
        html.match(/https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})/);
      if (m) return { kind: "channelId", value: m[1] };
    }
  } catch {
    // Si no era URL, puede ser @handle “pelado”
  }

  if (q.startsWith("@")) {
    const res = await fetch(`https://www.youtube.com/${q}`, {
      headers: { "user-agent": "Mozilla/5.0" },
    });
    const html = await res.text();
    const m =
      html.match(/"channelId":"(UC[\w-]{22})"/) ||
      html.match(/https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})/);
    if (m) return { kind: "channelId", value: m[1] };
  }

  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const raw =
    searchParams.get("id") ||
    searchParams.get("handle") ||
    process.env.NEXT_PUBLIC_YT_CHANNEL ||
    "";

  const pageSize = Math.max(1, Math.min(12, Number(searchParams.get("pageSize") || 6)));
  const page = Math.max(1, Number(searchParams.get("page") || 1));

  try {
    const resolved = await resolveChannel(raw);
    if (!resolved) {
      return NextResponse.json(
        { items: [], page: 1, pageCount: 1, error: "No se encontró el canal" },
        { status: 200 }
      );
    }

    const feedUrl =
      resolved.kind === "user"
        ? `https://www.youtube.com/feeds/videos.xml?user=${resolved.value}`
        : `https://www.youtube.com/feeds/videos.xml?channel_id=${resolved.value}`;

    const res = await fetch(feedUrl, { next: { revalidate } });
    const xml = await res.text();
    const all = parseFeed(xml);

    const pageCount = Math.max(1, Math.ceil(all.length / pageSize));
    const safePage = Math.min(page, pageCount);
    const start = (safePage - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return NextResponse.json(
      { items, page: safePage, pageCount, source: "rss", error: null },
      { status: 200 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { items: [], page: 1, pageCount: 1, error: msg || "Error al cargar videos" },
      { status: 200 }
    );
  }
}

import { NextResponse } from "next/server";

export const revalidate = 43200; // 12h

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get("src");

  if (!src || !/^https?:\/\//i.test(src)) {
    return NextResponse.json({ error: "Parámetro 'src' inválido" }, { status: 400 });
  }

  try {
    const r = await fetch(src, {
      headers: { "user-agent": UA },
      next: { revalidate },
    });

    const ct = r.headers.get("content-type") || "application/octet-stream";

    // Permitimos lo que sea "image/*"
    if (!ct.startsWith("image/")) {
      // Aun así, devolvemos el cuerpo; algunos servidores no ponen content-type correcto.
      return new NextResponse(r.body, {
        status: 200,
        headers: {
          "content-type": ct,
          "cache-control": "public, max-age=43200, s-maxage=43200",
        },
      });
    }

    return new NextResponse(r.body, {
      status: 200,
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=43200, s-maxage=43200",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg || "No se pudo obtener la imagen" }, { status: 200 });
  }
}

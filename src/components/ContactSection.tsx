"use client";

const WHATSAPP_NUMBER = "51999999999"; // <-- cámbialo cuando tengas el número real
const FB_URL = "https://www.facebook.com/USSRadioOficial";

export default function ContactSection() {
  const waMessage =
    "Hola Radio USS, quiero participar en vivo con un saludo/pedido. Mi nombre es ____ y soy de ____.";
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    waMessage
  )}`;

  // QR usando un servicio gratuito. Si prefieres, luego lo cambiamos por uno local.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=10&data=${encodeURIComponent(
    waLink
  )}`;

  return (
    <section id="contacto" className="scroll-mt-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Texto (izquierda) */}
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">Contáctanos</h2>
            <p className="mt-3 text-white/80">
              ¿Quieres salir al aire, enviar saludos o pasar una alerta de tu
              barrio? Escríbenos por WhatsApp o Facebook. Escanea el QR para
              abrir directamente el chat con un mensaje prellenado. ¡Te leemos!
            </p>

            <ul className="mt-6 space-y-2 text-white/70">
              <li>• Audios cortos (15–30s) y sin música de fondo.</li>
              <li>• Cuéntanos tu nombre y distrito al empezar.</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--accent)] px-5 py-2 font-medium text-black hover:opacity-90"
              >
                Escribir por WhatsApp
              </a>

              <a
                href={FB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2 font-medium text-white/90 hover:bg-white/10"
              >
                Mensaje en Facebook
              </a>
            </div>
          </div>

          {/* QR (derecha) */}
          <div className="flex justify-center md:justify-end">
            <figure className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl">
              <img
                src={qrSrc}
                alt="QR para escribir al WhatsApp de Radio USS"
                className="h-64 w-64 rounded-xl object-contain md:h-72 md:w-72"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <figcaption className="mt-2 text-center text-xs text-white/60">
                Escanea para abrir WhatsApp
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

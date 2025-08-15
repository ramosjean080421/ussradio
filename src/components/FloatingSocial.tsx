"use client";

export default function FloatingSocial() {
  const fbUrl = "https://www.facebook.com/USSRadioOficial";
  // número ficticio — cámbialo cuando te den el real (formato internacional sin +)
  const waPhone = "51999999999";
  const waText =
    "Hola%20Radio%20USS%2C%20quiero%20hacer%20una%20consulta%20desde%20la%20web.";
  const waUrl = `https://wa.me/${waPhone}?text=${waText}`;

  const baseBtn =
    "group relative grid place-items-center h-14 w-14 rounded-full text-white shadow-lg shadow-black/30 transition transform-gpu hover:scale-105 focus:scale-105 focus:outline-none";

  const tooltip =
    "pointer-events-none absolute right-[4.25rem] whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs text-white opacity-0 backdrop-blur transition group-hover:opacity-100";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {/* WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir WhatsApp"
        className={`${baseBtn} bg-[#25D366]`}
        title="Escríbenos por WhatsApp"
      >
        {/* tooltip */}
        <span className={tooltip}>WhatsApp</span>
        {/* icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="h-7 w-7"
          fill="currentColor"
        >
          <path d="M19.11 17.16c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.61.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.24-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.34-.01-.52-.01s-.48.07-.74.34c-.25.27-.97.95-.97 2.31 0 1.36.99 2.67 1.13 2.85.14.18 1.96 3 4.74 4.21.66.28 1.18.45 1.58.57.66.21 1.26.18 1.74.11.53-.08 1.63-.67 1.86-1.31.23-.64.23-1.19.16-1.31-.07-.12-.25-.2-.53-.34zM16.01 3.2c-6.99 0-12.68 5.69-12.68 12.68 0 2.24.6 4.33 1.64 6.14L3.2 28.8l6.95-1.8a12.63 12.63 0 0 0 5.86 1.48c6.99 0 12.68-5.69 12.68-12.68S23 3.2 16.01 3.2zm0 23.06c-2.15 0-4.15-.63-5.82-1.73l-.42-.27-4.11 1.06 1.1-4.01-.28-.41a9.96 9.96 0 0 1-1.77-5.61c0-5.52 4.48-10 10-10 5.52 0 10 4.48 10 10s-4.48 10-10 10z" />
        </svg>
        {/* pequeño pulso */}
        <span className="absolute inset-0 -z-10 rounded-full bg-[#25D366]/40 blur-xl opacity-0 group-hover:opacity-100 transition" />
      </a>

      {/* Facebook */}
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir Facebook"
        className={`${baseBtn} bg-[#1877F2]`}
        title="Síguenos en Facebook"
      >
        <span className={tooltip}>Facebook</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="currentColor"
        >
          <path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 1.88 6.48 1.88 12.06c0 5.01 3.66 9.16 8.45 9.94v-7.04H7.92v-2.9h2.41V9.93c0-2.38 1.42-3.7 3.6-3.7 1.04 0 2.13.19 2.13.19v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22v7.04C18.34 21.22 22 17.07 22 12.06z" />
        </svg>
      </a>
    </div>
  );
}

import Navbar from "@/components/Navbar";
import PlayerCard from "@/components/PlayerCard";
import { stations } from "@/data/stations";
import Gallery from "@/components/Gallery";
//import NewsToday from "@/components/NewsToday";//
import ContactSection from "@/components/ContactSection";
import ScrollVelocity from "@/components/ScrollVelocity";
import CountOdometer from "@/components/CountOdometer";
import ProgramCarousel from "@/components/ProgramCarousel";

export default function Page() {
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen text-white">
      <Navbar />

      {/* HERO - INICIO */}
      <section id="inicio" className="relative scroll-mt-24">
        <div className="relative w-full aspect-[16/9]">
          {/* Fondo */}
          <div
            className="absolute inset-0 -z-10 bg-center bg-cover"
            style={{ backgroundImage: "url('/radio-hero.jpg')" }}
            aria-hidden
          />
          <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80"
            aria-hidden
          />

          {/* 2 columnas */}
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            {/* Columna izquierda: contenido */}
            <div className="flex h-full items-center justify-center px-4 md:px-6 text-center md:text-left">
              <div className="w-fit mx-auto md:mx-0">
                <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
                  <span className="text-[var(--accent)]">RADIO</span> EN VIVO
                </h1>

                {/* Eslogan estático */}
                <div className="mt-4 w-full">
                  <p className="text-2xl md:text-3xl font-semibold text-white/90 leading-[1.3] text-center md:text-left">
                    <span className="uppercase">
                      <span className="text-white/90">TU </span>
                      <span className="text-[var(--accent)]">GENTE</span>
                      <span className="text-white/90">, TU </span>
                      <span className="text-[var(--accent)]">MÚSICA</span>
                      <span className="text-white/90">.</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha reservada */}
            <div />
          </div>
        </div>
      </section>

      {/* EMISORAS */}
      <section id="emisoras" className="relative scroll-mt-24 bg-[#0e1114]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          {/* Encabezado a dos columnas: izquierda (título + desc), derecha (banner animado) */}
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Emisoras</h2>
              <p className="mt-2 text-white/70">Escuchanos en vivo</p>
            </div>

            {/* Texto animado tipo Scroll Velocity */}
            <div className="w-full md:w-[52%]">
              <ScrollVelocity
                text="Escúchanos también a través de Zeno.FM: haz clic en la imagen de cada emisora para abrir su página oficial."
                baseSpeed={70}
                boostFactor={0.6}
              />
            </div>
          </div>

          {/* Grid de emisoras */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 justify-items-center">
            {stations.map((s) => (
              <PlayerCard key={s.id} station={s} />
            ))}
          </div>

          {/* Carrusel de programación (coloca tus imágenes en /public/programacion/) */}
          <div className="mt-12">
            <ProgramCarousel
              images={[
                "/programacion/horario-1.jpg",
                "/programacion/horario-2.jpg",
                "/programacion/horario-3.jpg",
              ]}
              intervalMs={3000}
            />
          </div>
        </div>
      </section>


      {/* NOSOTROS */}
      <section id="nosotros" className="scroll-mt-24 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Imagen a la izquierda */}
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1722696464550-e221208ad039?auto=format&q=80&w=1400&ixlib=rb-4.1.0"
                alt="Micrófono de estudio en cabina de radio"
                className="block w-full h-[420px] md:h-[520px] rounded-3xl object-cover"
                loading="lazy"
              />
            </div>

            {/* Texto a la derecha */}
            <div className="order-1 md:order-2">
              <h2 className="text-2xl font-bold md:text-3xl">Nosotros</h2>
              <p className="mt-4 text-white/80">
                <strong>USSRadio</strong> es un proyecto universitario de radiodifusión
                digital creado por estudiantes y docentes. Curamos música, producimos
                contenidos culturales y cubrimos actividades de nuestra comunidad.
                Nuestro objetivo es formar talento en producción sonora y ofrecer un
                espacio para nuevas voces, con una identidad moderna y cercana.
              </p>

              <ul className="mt-6 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-[var(--accent)]">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Programación en vivo y playlists temáticas.
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-[var(--accent)]">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Talleres y prácticas de locución, edición y streaming.
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-[var(--accent)]">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Cobertura de eventos y cultura universitaria.
                </li>
                <li className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-[var(--accent)]">
                    <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Comunidad abierta: colabora y envía tu propuesta.
                </li>
              </ul>

              {/* Métricas/Highlights */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-bold text-[var(--accent)]">
                    <CountOdometer end={4} duration={1600} />
                  </div>
                  <div className="text-xs text-white/70">Emisoras</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-bold text-[var(--accent)]">24/7</div>
                  <div className="text-xs text-white/70">En línea</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xl font-bold text-[var(--accent)]">10+</div>
                  <div className="text-xs text-white/70">Programas activos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="scroll-mt-24 border-t border-white/10">
        <Gallery />
      </section>

      {/* CONTACTO */}
      <ContactSection />

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-white/60 md:px-6">
          © {year} USS RADIO
        </div>
      </footer>
    </div>
  );
}

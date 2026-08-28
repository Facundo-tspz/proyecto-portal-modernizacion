import { FileText, CalendarDays, Newspaper, Globe, Link2, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'

const tarjetasBase = [
  {
    id: 1,
    icono: 'file-text',
    titulo: 'Certificado Digital',
    leyenda: 'Gestioná tu certificado digital y firma electrónica desde acá.',
    link: 'https://certificados.example.com',
    activo: true,
  },
  {
    id: 2,
    icono: 'calendar-days',
    titulo: 'Calendario de Feriados',
    leyenda: 'Feriados, conmemoraciones y días no laborables de la provincia.',
    link: 'https://calendario.example.com',
    activo: true,
  },
  {
    id: 3,
    icono: 'newspaper',
    titulo: 'Boletín Municipal',
    leyenda: 'Las ordenanzas y resoluciones oficiales de la municipalidad.',
    link: 'https://boletin.example.com',
    activo: true,
  },
]

const iconos = {
  'file-text': FileText,
  'calendar-days': CalendarDays,
  newspaper: Newspaper,
  globe: Globe,
  link2: Link2,
  share2: Share2,
}

function TarjetasEnlace() {
  const tarjetas = tarjetasBase.filter((t) => t.activo)

  if (tarjetas.length === 0) return null

  const cantidad = tarjetas.length
  const claseAncho =
    cantidad === 1
      ? 'lg:max-w-2xl'
      : cantidad === 2
        ? 'lg:w-[calc(50%-1rem)]'
        : 'lg:w-[calc(33.333%-1.2rem)]'

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
          Accesos útiles
        </p>
        <h2 className="mt-1 text-2xl font-bold text-municipal-azul dark:text-municipal-crema">
          Para saber más
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
        {tarjetas.map((tarjeta, i) => {
          const Icono = iconos[tarjeta.icono] ?? Link2
          return (
            <motion.a
              key={tarjeta.id}
              href={tarjeta.link}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`group block w-full ${claseAncho}`}
            >
              <div className="h-full rounded-3xl p-px bg-gradient-to-br from-municipal-azul/50 via-transparent to-municipal-naranja/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-white/70 p-6 backdrop-blur-xl dark:bg-[#0d0d0d]/80 dark:hover:bg-[#0d0d0d]/90 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                      <Icono size={22} />
                    </div>
                    <ArrowExterno />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-municipal-azul dark:text-municipal-crema">
                    {tarjeta.titulo}
                  </h3>
                  <p className="mt-1.5 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
                    {tarjeta.leyenda}
                  </p>
                </div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}

function ArrowExterno() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-municipal-naranja/10 text-municipal-naranja opacity-70 transition-all group-hover:opacity-100">
      <Link2 size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </span>
  )
}

export default TarjetasEnlace
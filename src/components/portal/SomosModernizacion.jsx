import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wrench, Globe, GraduationCap, ArrowRight } from 'lucide-react'
import { useConfigSitio } from '../../hooks/useConfigSitio'

const configFallback = {
  overline: 'El área',
  titulo: 'Somos el Área de Modernización',
  parrafo:
    'Modernizar es transformar, innovar y abrir nuevas oportunidades. Desde el Área de Modernización acercamos la tecnología a cada área municipal y a nuestra comunidad: creamos herramientas digitales, desarrollamos sitios web y capacitamos a nuestro equipo para crecer juntos.',
  frase:
    'Porque la tecnología es el medio, y el fin es un Municipio más cercano, accesible y preparado para el futuro.',
  boton: 'Conocé más sobre nosotros',
  pilares: [
    {
      id: 1,
      icono: 'wrench',
      titulo: 'Herramientas digitales',
      descripcion: 'Desarrollamos soluciones para cada área municipal.',
    },
    {
      id: 2,
      icono: 'globe',
      titulo: 'Sitios web',
      descripcion: 'Llevamos a la web la información y los servicios.',
    },
    {
      id: 3,
      icono: 'graduation-cap',
      titulo: 'Capacitaciones',
      descripcion: 'Formamos al equipo para crecer en lo digital.',
    },
  ],
}

const iconos = {
  wrench: Wrench,
  globe: Globe,
  'graduation-cap': GraduationCap,
}

function SomosModernizacion() {
  const configDb = useConfigSitio()
  const config = configDb
    ? {
        ...configFallback,
        overline: configDb.somos_overline || configFallback.overline,
        titulo: configDb.somos_titulo || configFallback.titulo,
        parrafo: configDb.somos_parrafo || configFallback.parrafo,
        frase: configDb.somos_frase || configFallback.frase,
      }
    : configFallback

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 h-64 w-72 -translate-x-1/2 rounded-full bg-municipal-azul/10 blur-3xl dark:bg-municipal-azul/25" />
        <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full bg-municipal-verde/10 blur-3xl dark:bg-municipal-verde/25" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja"
        >
          {config.overline}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-2 text-3xl font-bold text-municipal-azul dark:text-municipal-crema"
        >
          {config.titulo}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-4 text-municipal-azul/80 dark:text-municipal-crema/80"
        >
          {config.parrafo}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="mx-auto mt-8 max-w-2xl rounded-3xl p-px bg-gradient-to-r from-municipal-verde/70 via-municipal-naranja/70 to-municipal-verde/70"
      >
        <blockquote className="rounded-[calc(1.5rem-1px)] bg-white/80 px-6 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
          <p className="text-lg font-medium italic text-municipal-verde dark:text-municipal-crema">
            “{config.frase}”
          </p>
        </blockquote>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="mt-8 text-center"
      >
        <Link
          to="/quienes-somos"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-municipal-azul to-municipal-verde px-6 py-3 text-sm font-semibold text-municipal-crema shadow-lg transition-transform hover:scale-105"
        >
          {config.boton}
          <ArrowRight size={16} />
        </Link>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
        {config.pilares.map((pilar, i) => {
          const Icono = iconos[pilar.icono] ?? Wrench
          return (
            <motion.div
              key={pilar.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/40 via-transparent to-municipal-azul/40"
            >
              <div className="flex h-full flex-col items-center rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                  <Icono size={22} />
                </div>
                <h3 className="mt-4 font-bold text-municipal-azul dark:text-municipal-crema">
                  {pilar.titulo}
                </h3>
                <p className="mt-1 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
                  {pilar.descripcion}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default SomosModernizacion
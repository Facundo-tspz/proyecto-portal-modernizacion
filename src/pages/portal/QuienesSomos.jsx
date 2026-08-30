import { motion } from 'framer-motion'
import {
  Target,
  Eye,
  Cog,
  Globe,
  Database,
  Wrench,
  GraduationCap,
  Rocket,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { useConfigSitio } from '../../hooks/useConfigSitio'

const configBase = {
  presentacion: {
    overline: 'Quiénes somos',
    titulo: 'Un área al servicio de la innovación municipal',
    parrafos: [
      'La Dirección de Modernización de la Municipalidad de Tinogasta es el brazo ejecutor de la modernización digital del municipio. Dependemos de la Secretaría de Industria y Desarrollo Económico y trabajamos de forma transversal, acercando la tecnología a cada oficina municipal y a la comunidad.',
      'Lo que comenzó como un área de soporte técnico básico se convirtió en el motor de proyectos estratégicos: portales oficiales, sistemas de gestión y programas como el ID Digital Emprendedor.',
    ],
  },
  pilares: [
    {
      id: 'mision',
      icono: 'target',
      titulo: 'Misión',
      descripcion:
        'Acercar la tecnología a cada área municipal y a la comunidad, mediante el desarrollo de software, la gestión digital y la capacitación.',
    },
    {
      id: 'vision',
      icono: 'eye',
      titulo: 'Visión',
      descripcion:
        'Un Municipio más cercano, accesible y preparado para el futuro, donde la tecnología sea el medio para servir mejor a los vecinos.',
    },
    {
      id: 'funcion',
      icono: 'cog',
      titulo: 'Función',
      descripcion:
        'Somos el brazo ejecutor de la modernización administrativa y tecnológica del municipio: desarrollamos, damos soporte y formamos en herramientas de vanguardia.',
    },
  ],
  servicios: [
    {
      id: 1,
      icono: 'globe',
      titulo: 'Portales web',
      descripcion:
        'Desarrollamos y mantenemos los portales oficiales del Municipio: tinogasta.gob.ar y tinogasta.tur.ar.',
    },
    {
      id: 2,
      icono: 'database',
      titulo: 'Sistemas de gestión',
      descripcion:
        'Administramos sistemas como MEDI, Recursos Humanos y Red de Empleo.',
    },
    {
      id: 3,
      icono: 'wrench',
      titulo: 'Soporte técnico',
      descripcion:
        'Asistencia y mantenimiento a todas las oficinas municipales.',
    },
    {
      id: 4,
      icono: 'graduation-cap',
      titulo: 'Capacitaciones',
      descripcion:
        'Formación en herramientas digitales e inteligencia artificial para el equipo y la comunidad.',
    },
    {
      id: 5,
      icono: 'rocket',
      titulo: 'ID Digital Emprendedor',
      descripcion:
        'Acompañamos a emprendedores locales en su inserción digital y acceso a nuevas herramientas.',
    },
  ],
  equipo: [
    {
      id: 1,
      nombre: 'Camila Barrionuevo',
      rol: 'Directora de Modernización',
      funciones: 'Planificación de proyectos y nexo institucional.',
    },
    {
      id: 2,
      nombre: 'Francis Seura',
      rol: 'Colaborador Técnico',
      funciones:
        'Soporte técnico, desarrollo de software y mantenimiento de plataformas.',
    },
  ],
  organigrama: {
    secretaria: 'Secretaría de Industria y Desarrollo Económico',
    secretario: 'Abel Martínez · Secretario',
    direccion: 'Dirección de Modernización',
    directora: 'Camila Barrionuevo · Directora',
    tecnico: 'Francis Seura · Colaborador Técnico',
  },
  contacto: {
    ubicacion: 'Calle Dr. Antonio Del Pino N° 739, Tinogasta — Catamarca',
    telefono: '3834-669002',
    email: 'info@tinogasta.gob.ar',
  },
}

const iconos = {
  target: Target,
  eye: Eye,
  cog: Cog,
  globe: Globe,
  database: Database,
  wrench: Wrench,
  'graduation-cap': GraduationCap,
  rocket: Rocket,
}

const animacion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4 },
}

function EncabezadoSeccion({ overline, titulo, descripcion }) {
  return (
    <motion.div
      {...animacion}
      className="mx-auto mb-8 max-w-2xl text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
        {overline}
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-municipal-azul dark:text-municipal-crema">
        {titulo}
      </h2>
      {descripcion && (
        <p className="mt-3 text-municipal-azul/80 dark:text-municipal-crema/80">
          {descripcion}
        </p>
      )}
    </motion.div>
  )
}

function CajaOrganigrama({ cargo, nombre }) {
  return (
    <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/50 via-transparent to-municipal-azul/50">
      <div className="flex flex-col items-center rounded-[calc(1rem-1px)] bg-white/70 px-6 py-4 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
        <span className="text-xs font-bold uppercase tracking-widest text-municipal-azul dark:text-municipal-crema">
          {cargo}
        </span>
        {nombre && (
          <span className="mt-1 text-sm text-municipal-naranja">{nombre}</span>
        )}
      </div>
    </div>
  )
}

function QuienesSomos() {
  const configDb = useConfigSitio()
  const config = configDb
    ? {
        ...configBase,
        presentacion: {
          overline: configDb.q_overline || configBase.presentacion.overline,
          titulo: configDb.q_titulo || configBase.presentacion.titulo,
          parrafos: [
            configDb.q_parrafo_1 || configBase.presentacion.parrafos[0],
            configDb.q_parrafo_2 || configBase.presentacion.parrafos[1],
          ],
        },
        pilares: [
          {
            ...configBase.pilares[0],
            descripcion: configDb.q_mision || configBase.pilares[0].descripcion,
          },
          {
            ...configBase.pilares[1],
            descripcion: configDb.q_vision || configBase.pilares[1].descripcion,
          },
          {
            ...configBase.pilares[2],
            descripcion: configDb.q_funcion || configBase.pilares[2].descripcion,
          },
        ],
        servicios: [
          {
            ...configBase.servicios[0],
            descripcion:
              configDb.q_servicio_web_desc || configBase.servicios[0].descripcion,
          },
          {
            ...configBase.servicios[1],
            descripcion:
              configDb.q_servicio_sistemas_desc ||
              configBase.servicios[1].descripcion,
          },
          {
            ...configBase.servicios[2],
            descripcion:
              configDb.q_servicio_soporte_desc ||
              configBase.servicios[2].descripcion,
          },
          {
            ...configBase.servicios[3],
            descripcion:
              configDb.q_servicio_caps_desc || configBase.servicios[3].descripcion,
          },
          {
            ...configBase.servicios[4],
            descripcion:
              configDb.q_servicio_id_desc || configBase.servicios[4].descripcion,
          },
        ],
        contacto: {
          ubicacion: configDb.q_contacto_ubicacion || configBase.contacto.ubicacion,
          telefono: configDb.q_contacto_telefono || configBase.contacto.telefono,
          email: configDb.q_contacto_email || configBase.contacto.email,
        },
      }
    : configBase

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-municipal-azul/10 blur-3xl dark:bg-municipal-azul/25" />
        <div className="absolute top-1/2 -right-16 h-72 w-72 rounded-full bg-municipal-naranja/10 blur-3xl dark:bg-municipal-naranja/20" />
        <div className="absolute bottom-0 left-8 h-64 w-64 rounded-full bg-municipal-verde/10 blur-3xl dark:bg-municipal-verde/20" />
      </div>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja"
        >
          {config.presentacion.overline}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mx-auto mt-3 max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-bold text-municipal-azul dark:text-municipal-crema"
        >
          {config.presentacion.titulo}
        </motion.h1>
        {config.presentacion.parrafos.map((parrafo, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.16 + i * 0.08 }}
            className="mx-auto mt-4 max-w-2xl text-municipal-azul/80 dark:text-municipal-crema/80"
          >
            {parrafo}
          </motion.p>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <EncabezadoSeccion
          overline="Nuestro compromiso"
          titulo="Qué nos guía"
        />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          {config.pilares.map((pilar, i) => {
            const Icono = iconos[pilar.icono] ?? Target
            return (
              <motion.div
                key={pilar.id}
                {...animacion}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/40 via-transparent to-municipal-azul/40"
              >
                <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                    <Icono size={22} />
                  </div>
                  <h3 className="mt-4 font-bold text-municipal-azul dark:text-municipal-crema">
                    {pilar.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
                    {pilar.descripcion}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <EncabezadoSeccion
          overline="Qué hacemos"
          titulo="Nuestros servicios"
          descripcion="Trabajamos de forma transversal con todas las oficinas del Municipio y con la comunidad."
        />
        <div className="flex flex-wrap justify-center gap-5">
          {config.servicios.map((servicio, i) => {
            const Icono = iconos[servicio.icono] ?? Globe
            return (
              <motion.div
                key={servicio.id}
                {...animacion}
                transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
                className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-1.25rem)] rounded-2xl p-px bg-gradient-to-br from-municipal-verde/40 via-transparent to-municipal-naranja/40"
              >
                <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 backdrop-blur-xl dark:bg-[#0d0d0d]/80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-naranja to-municipal-verde text-municipal-crema shadow-md">
                    <Icono size={22} />
                  </div>
                  <h3 className="mt-4 font-bold text-municipal-azul dark:text-municipal-crema">
                    {servicio.titulo}
                  </h3>
                  <p className="mt-2 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
                    {servicio.descripcion}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section
        id="equipo"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-24"
      >
        <EncabezadoSeccion
          overline="Nuestro equipo"
          titulo="Quiénes lo llevan adelante"
          descripcion="Un equipo comprometido con llevar la innovación a cada rincón del Municipio."
        />
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          {config.equipo.map((integrante, i) => (
            <motion.div
              key={integrante.id}
              {...animacion}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl p-px bg-gradient-to-br from-municipal-azul/40 via-transparent to-municipal-naranja/40"
            >
              <div className="flex h-full flex-col items-center rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                  <span className="text-lg font-bold">
                    {integrante.nombre.charAt(0)}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-municipal-azul dark:text-municipal-crema">
                  {integrante.nombre}
                </h3>
                <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-municipal-naranja">
                  {integrante.rol}
                </span>
                <p className="mt-2 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
                  {integrante.funciones}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p
          {...animacion}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-center text-sm text-municipal-azul/70 dark:text-municipal-crema/70"
        >
          El área depende de la Secretaría de Industria y Desarrollo
          Económico, a cargo del Secretario Abel Martínez.
        </motion.p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <EncabezadoSeccion
          overline="Estructura"
          titulo="Organigrama"
          descripcion="Así se organiza nuestra área dentro de la Municipalidad."
        />
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <motion.div {...animacion} className="w-full max-w-md">
            <CajaOrganigrama
              cargo={config.organigrama.secretaria}
              nombre={config.organigrama.secretario}
            />
          </motion.div>

          <div
            className="h-10 w-px bg-gradient-to-b from-municipal-naranja to-municipal-azul"
            aria-hidden="true"
          />

          <motion.div {...animacion} className="w-full max-w-md">
            <CajaOrganigrama cargo={config.organigrama.direccion} />
          </motion.div>

          <div className="mx-auto h-8 w-px bg-gradient-to-b from-municipal-azul to-municipal-verde" />
          <div className="relative w-full">
            <div
              className="pointer-events-none absolute inset-x-8 top-4 hidden h-px bg-gradient-to-r from-municipal-verde via-municipal-naranja to-municipal-verde sm:block"
              aria-hidden="true"
            />
            <div
              className="mx-auto h-px w-px bg-municipal-naranja sm:hidden"
              aria-hidden="true"
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {['directora', 'tecnico'].map((clave, i) => (
                <motion.div
                  key={clave}
                  {...animacion}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                >
                  <CajaOrganigrama cargo={config.organigrama[clave]} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="contacto"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-24"
      >
        <EncabezadoSeccion
          overline="Contacto"
          titulo="¿Cómo nos encontrás?"
          descripcion="Estamos en el centro de Tinogasta y esperamos tu consulta."
        />
        <motion.div
          {...animacion}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3"
        >
          <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/40 via-transparent to-municipal-verde/40">
            <div className="flex h-full flex-col items-center rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                <MapPin size={20} />
              </div>
              <span className="mt-3 text-sm font-semibold text-municipal-azul dark:text-municipal-crema">
                {config.contacto.ubicacion}
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/40 via-transparent to-municipal-verde/40">
            <div className="flex h-full flex-col items-center rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                <Phone size={20} />
              </div>
              <a
                href={`tel:${config.contacto.telefono.replace(/-/g, '')}`}
                className="mt-3 text-sm font-semibold text-municipal-azul dark:text-municipal-crema hover:text-municipal-naranja transition-colors"
              >
                {config.contacto.telefono}
              </a>
            </div>
          </div>

          <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/40 via-transparent to-municipal-verde/40">
            <div className="flex h-full flex-col items-center rounded-[calc(1rem-1px)] bg-white/70 px-5 py-6 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
                <Mail size={20} />
              </div>
              <a
                href={`mailto:${config.contacto.email}`}
                className="mt-3 text-sm font-semibold break-all text-municipal-azul dark:text-municipal-crema hover:text-municipal-naranja transition-colors"
              >
                {config.contacto.email}
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          {...animacion}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={`mailto:${config.contacto.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-municipal-azul to-municipal-verde px-6 py-3 text-sm font-semibold text-municipal-crema shadow-lg transition-transform hover:scale-105"
          >
            ¿Necesitás asistencia técnica?
            <ArrowRight size={16} />
          </a>
          <a
            href={`tel:${config.contacto.telefono.replace(/-/g, '')}`}
            className="inline-flex items-center gap-2 rounded-full p-px bg-gradient-to-r from-municipal-verde to-municipal-naranja transition-transform hover:scale-105"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-6 py-3 text-sm font-semibold text-municipal-azul backdrop-blur-xl dark:bg-[#0d0d0d]/80 dark:text-municipal-crema">
              Llamanos
              <Phone size={16} />
            </span>
          </a>
        </motion.div>
      </section>
    </div>
  )
}

export default QuienesSomos
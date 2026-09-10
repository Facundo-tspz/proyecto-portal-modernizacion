import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  FolderKanban,
  Newspaper,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const categoriasBase = [
  {
    id: 'capacitaciones',
    nombre: 'Capacitaciones',
    tabla: 'capacitaciones',
    items: [
      {
        id: 1,
        titulo: 'Taller de Excel Avanzado',
        leyenda:
          'Plantillas, tablas dinámicas y automatización de reportes para la gestión municipal.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 2,
        titulo: 'Firma Digital Certificada',
        leyenda:
          'Trámites 100% digitales con firma electrónica para el personal de la municipalidad.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 3,
        titulo: 'Herramientas de Inteligencia Artificial',
        leyenda:
          'Cómo aprovechar la IA en tareas administrativas cotidianas del área.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 4,
        titulo: 'Gestión de Redes Sociales',
        leyenda:
          'Comunicación oficial para oficinas públicas: contenido, alcance y buen uso.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 5,
        titulo: 'Ciberseguridad Básica',
        leyenda:
          'Contraseñas seguras, correos fraudulentos y buenas prácticas en equipos del estado.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
    ],
  },
  {
    id: 'proyectos',
    nombre: 'Proyectos',
    tabla: 'destacados_proyectos',
    items: [
      {
        id: 1,
        titulo: 'Portal de Modernización',
        leyenda:
          'La plataforma institucional que estás viendo: información, capacitaciones y gestión de incidencias.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 2,
        titulo: 'Red WiFi Municipal',
        leyenda:
          'Conectividad gratuita en espacios públicos y oficinas de la municipalidad.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 3,
        titulo: 'Gestión de Trámites Digitales',
        leyenda:
          'Digitalización de trámites municipales para reducir tiempos de espera.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
    ],
  },
  {
    id: 'noticias',
    nombre: 'Noticias',
    tabla: 'noticias',
    items: [
      {
        id: 1,
        titulo: 'IA generativa, ¿qué es y cómo usarla en trámites?',
        leyenda:
          'Un repaso simple de las herramientas de IA y sus usos en oficinas públicas.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
      {
        id: 2,
        titulo: 'Lanzamiento de la nueva web departamental',
        leyenda:
          'Ya podés consultar la información de las secretarías desde un solo lugar.',
        imagen_url: '/images/banner-noticia/banner-seismiles.webp',
        link: '',
      },
    ],
  },
]

const iconosCategoria = {
  capacitaciones: GraduationCap,
  proyectos: FolderKanban,
  noticias: Newspaper,
}

const DURACION_ROTACION = 6

function CarruselSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="lg:col-span-2 h-[360px] rounded-3xl bg-municipal-azul/10 dark:bg-white/5 animate-pulse" />
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex-1 rounded-2xl bg-municipal-azul/10 dark:bg-white/5 animate-pulse" />
        <div className="flex-1 rounded-2xl bg-municipal-azul/10 dark:bg-white/5 animate-pulse" />
        <div className="flex-1 rounded-2xl bg-municipal-azul/10 dark:bg-white/5 animate-pulse" />
      </div>
    </div>
  )
}

function IndicadorPuntos({ items, indiceActivo, onSeleccionar }) {
  return (
    <div className="flex justify-center gap-2">
      {items.map((it, i) => (
        <button
          key={it.id}
          type="button"
          onClick={() => onSeleccionar(i)}
          aria-label={`Ver ${it.titulo}`}
          className={`h-1.5 rounded-full transition-all ${
            i === indiceActivo
              ? 'w-6 bg-municipal-naranja'
              : 'w-3 bg-municipal-azul/30 hover:bg-municipal-azul/50 dark:bg-white/20'
          }`}
        />
      ))}
    </div>
  )
}

function ControlesCarrusel({ onAnterior, onSiguiente, children }) {
  const base =
    'p-2 rounded-full bg-white/50 dark:bg-white/10 border border-municipal-azul/10 dark:border-white/10 text-municipal-azul dark:text-municipal-crema hover:bg-white/80 dark:hover:bg-white/20 transition-colors'

  return (
    <div className="mt-4 flex items-center justify-center gap-4">
      <button type="button" onClick={onAnterior} aria-label="Ver anterior" className={base}>
        <ChevronLeft size={18} />
      </button>
      {children}
      <button type="button" onClick={onSiguiente} aria-label="Ver siguiente" className={base}>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

function TarjetaPrincipal({ item, categoria, indice, manualmente }) {
  const esExterna = categoria.id === 'noticias' && item.link

  return (
    <div className="group relative h-full rounded-3xl p-px bg-gradient-to-br from-municipal-azul/80 via-municipal-verde/50 to-municipal-naranja/80 shadow-xl transition-transform duration-500 group-hover:scale-[1.005] group-hover:rotate-[0.4deg]">
      <div className="relative h-full rounded-[calc(1.5rem-1px)] overflow-hidden bg-white/75 dark:bg-[#0d0d0d]/85 backdrop-blur-xl">
        <div className="relative overflow-hidden">
          <img
            src={item.imagen_url}
            alt={item.titulo}
            loading="lazy"
            className="w-full object-cover aspect-[16/9] sm:aspect-[16/8] lg:aspect-[21/10]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <motion.div
              key={`${categoria.id}-${indice}-${item.id}-${manualmente}`}
              className="h-full bg-municipal-naranja"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: DURACION_ROTACION, ease: 'linear' }}
            />
          </div>
        </div>
        <div className="px-5 sm:px-7 py-5 sm:py-6">
          <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-municipal-azul dark:text-municipal-crema">
            {item.titulo}
            {esExterna && (
              <ExternalLink size={18} className="text-municipal-naranja shrink-0" />
            )}
          </h3>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-municipal-azul/70 dark:text-municipal-crema/70">
            {item.leyenda}
          </p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-municipal-azul to-municipal-verde px-4 py-2 text-sm font-semibold text-municipal-crema shadow-lg transition-transform hover:scale-105"
            >
              Conocer más
              <ArrowRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function TarjetaSecundaria({ item, categoria, altaCalidad, onPromover }) {
  const esExterna = categoria.id === 'noticias' && item.link

  return (
    <button
      type="button"
      onClick={onPromover}
      className={`group w-full rounded-2xl p-px bg-gradient-to-br from-municipal-azul/35 via-transparent to-municipal-naranja/35 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        altaCalidad ? 'flex-1' : ''
      }`}
    >
      <div className="relative h-full rounded-[calc(1rem-1px)] overflow-hidden bg-white/70 dark:bg-[#0d0d0d]/80 backdrop-blur-xl">
        <img
          src={item.imagen_url}
          alt={item.titulo}
          loading="lazy"
          className={`w-full object-cover ${altaCalidad ? 'aspect-[4/5]' : 'aspect-video'}`}
        />
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <span className="line-clamp-2 text-sm font-medium text-municipal-azul dark:text-municipal-crema">
            {item.titulo}
          </span>
          {esExterna && (
            <ExternalLink size={14} className="shrink-0 text-municipal-naranja" />
          )}
        </div>
      </div>
    </button>
  )
}

function DestacadosCarrusel() {
  const [categorias, setCategorias] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState(0)
  const [indicePrincipal, setIndicePrincipal] = useState(0)
  const [manualmente, setManualmente] = useState(0)

  useEffect(() => {
    let activo = true
    Promise.all(
      categoriasBase.map((categoria) =>
        supabase
          .from(categoria.tabla)
          .select('id, titulo, leyenda, imagen_url, link, activo, orden')
          .eq('activo', true)
          .order('orden', { ascending: true })
          .then(({ data }) => ({
            id: categoria.id,
            nombre: categoria.nombre,
            items: data || [],
          }))
      )
    ).then((resultado) => {
      if (!activo) return
      const conItems = resultado.map((cat) => ({
        ...cat,
        items:
          cat.items.length > 0
            ? cat.items
            : categoriasBase.find((c) => c.id === cat.id)?.items || [],
      }))
      setCategorias(conItems)
      setCargando(false)
    })
    return () => {
      activo = false
    }
  }, [])

  const categoriasVisibles = useMemo(
    () =>
      (categorias || categoriasBase).filter((c) => c.items.length > 0),
    [categorias]
  )

  useEffect(() => {
    const t = setTimeout(() => setCargando(false), 900)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (cargando || categoriasVisibles.length === 0) return
    const items = categoriasVisibles[categoriaActiva].items
    if (items.length < 2) return
    const intervalo = setInterval(() => {
      setIndicePrincipal((prev) => (prev + 1) % items.length)
    }, DURACION_ROTACION * 1000)
    return () => clearInterval(intervalo)
  }, [cargando, categoriaActiva, categoriasVisibles, manualmente])

  const seleccionarItem = (indice) => {
    setIndicePrincipal(indice)
    setManualmente((prev) => prev + 1)
  }

  const cambiarCategoria = (i) => {
    setCategoriaActiva(i)
    setIndicePrincipal(0)
  }

  if (cargando) {
    return <CarruselSkeleton />
  }

  if (categoriasVisibles.length === 0) {
    return null
  }

  const categoria = categoriasVisibles[categoriaActiva]
  const items = categoria.items
  const cantidad = items.length

  const contenidoPrincipal = cantidad >= 2 ? items[indicePrincipal] : items[0]

  const renderCarrusel = () => {
    if (cantidad <= 2) {
      return (
        <div className="mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={contenidoPrincipal.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TarjetaPrincipal
                item={contenidoPrincipal}
                categoria={categoria}
                indice={indicePrincipal}
                manualmente={manualmente}
              />
            </motion.div>
          </AnimatePresence>
          {cantidad === 2 && (
            <IndicadorPuntos
              items={items}
              indiceActivo={indicePrincipal}
              onSeleccionar={seleccionarItem}
            />
          )}
        </div>
      )
    }

    const secundarios = items.filter((_, i) => i !== indicePrincipal).slice(0, 3)
    const columnaAlta = cantidad === 3

    const anterior = () =>
      seleccionarItem((indicePrincipal - 1 + cantidad) % cantidad)
    const siguiente = () => seleccionarItem((indicePrincipal + 1) % cantidad)

    return (
      <>
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={contenidoPrincipal.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TarjetaPrincipal
                item={contenidoPrincipal}
                categoria={categoria}
                indice={indicePrincipal}
                manualmente={manualmente}
              />
            </motion.div>
          </AnimatePresence>
          <ControlesCarrusel onAnterior={anterior} onSiguiente={siguiente}>
            <IndicadorPuntos
              items={items}
              indiceActivo={indicePrincipal}
              onSeleccionar={seleccionarItem}
            />
          </ControlesCarrusel>
        </div>

        <div className="hidden lg:grid grid-cols-3 items-stretch gap-4 sm:gap-5">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={contenidoPrincipal.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full"
              >
                <TarjetaPrincipal
                  item={contenidoPrincipal}
                  categoria={categoria}
                  indice={indicePrincipal}
                  manualmente={manualmente}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-col gap-4 sm:gap-5">
            {secundarios.map((it) => (
              <TarjetaSecundaria
                key={it.id}
                item={it}
                categoria={categoria}
                altaCalidad={columnaAlta}
                onPromover={() =>
                  seleccionarItem(items.findIndex((x) => x.id === it.id))
                }
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-municipal-verde/20 blur-3xl dark:bg-municipal-verde/25" />
        <div className="absolute top-1/4 -right-16 h-72 w-72 rounded-full bg-municipal-naranja/20 blur-3xl dark:bg-municipal-naranja/25" />
        <div className="absolute -bottom-10 left-1/4 h-64 w-64 rounded-full bg-municipal-azul/15 blur-3xl dark:bg-municipal-azul/30" />
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
            <Sparkles size={14} />
            Lo más reciente del área
          </p>
          <h2 className="mt-1 text-2xl font-bold text-municipal-azul dark:text-municipal-crema">
            Destacados
          </h2>
        </div>

        <div className="inline-flex rounded-xl bg-white/50 p-1 shadow-sm backdrop-blur-sm dark:bg-white/5">
          {categoriasVisibles.map((cat, i) => {
            const activa = i === categoriaActiva
            const Icono = iconosCategoria[cat.id] ?? Newspaper
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                onClick={() => cambiarCategoria(i)}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                  activa
                    ? 'text-municipal-crema'
                    : 'text-municipal-azul/70 hover:text-municipal-azul dark:text-municipal-crema/60 dark:hover:text-municipal-crema'
                }`}
              >
                {activa && (
                  <motion.span
                    layoutId="indicador-destacados"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-municipal-azul to-municipal-verde shadow-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icono size={15} className="relative z-10" />
                <span className="relative z-10">{cat.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={categoria.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {renderCarrusel()}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

export default DestacadosCarrusel
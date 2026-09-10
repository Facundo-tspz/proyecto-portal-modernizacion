import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const estadosDb = {
  activo: 'Activos',
  finalizado: 'Finalizados',
  en_desarrollo: 'En desarrollo',
}

const mapaUrl = {
  activos: 'activo',
  finalizados: 'finalizado',
  en_desarrollo: 'en_desarrollo',
}

const descripcionEstado = {
  activo: 'Proyectos que ya están en marcha en el municipio.',
  finalizado: 'Proyectos completados y entregados.',
  en_desarrollo: 'Lo que estamos construyendo en este momento.',
}

const mensajeVacio = {
  activo: 'De momento, no hay proyectos en activos',
  finalizado: 'De momento, no hay proyectos en finalizados',
  en_desarrollo: 'De momento, no hay proyectos en desarrollo',
}

function Esqueleto() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-72 rounded-2xl bg-municipal-azul/10 dark:bg-white/5 animate-pulse"
        />
      ))}
    </div>
  )
}

function Proyectos() {
  const [searchParams] = useSearchParams()
  const estadoUrl = searchParams.get('estado') || 'activos'
  const estado = mapaUrl[estadoUrl] || 'activo'
  const [items, setItems] = useState(null)

  useEffect(() => {
    let activo = true
    supabase
      .from('proyectos')
      .select('id, nombre, descripcion, imagen_url, estado')
      .eq('activo', true)
      .eq('estado', estado)
      .order('orden', { ascending: true })
      .then(({ data }) => {
        if (!activo) return
        setItems(data || [])
      })
    return () => {
      activo = false
    }
  }, [estado])

  const cargando = items === null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mb-10 max-w-2xl text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
          Nuestros proyectos
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-municipal-azul dark:text-municipal-crema">
          Proyectos {estadosDb[estado].toLowerCase()}
        </h1>
        <p className="mt-3 text-municipal-azul/80 dark:text-municipal-crema/80">
          {descripcionEstado[estado]}
        </p>
      </motion.div>

      {cargando ? (
        <Esqueleto />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl p-px bg-gradient-to-br from-municipal-verde/40 via-transparent to-municipal-naranja/40">
          <div className="flex flex-col items-center rounded-[calc(1.5rem-1px)] bg-white/70 px-8 py-12 text-center backdrop-blur-xl dark:bg-[#0d0d0d]/80">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-municipal-azul to-municipal-verde text-municipal-crema shadow-md">
              <FolderKanban size={26} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-municipal-azul dark:text-municipal-crema">
              {mensajeVacio[estado]}
            </h2>
            <p className="mt-1 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
              Volvé pronto para ver las novedades de esta sección.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group rounded-2xl p-px bg-gradient-to-br from-municipal-azul/40 via-municipal-verde/30 to-municipal-naranja/40 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-full rounded-[calc(1rem-1px)] overflow-hidden bg-white/75 dark:bg-[#0d0d0d]/85 backdrop-blur-xl">
                <div className="relative overflow-hidden">
                  <img
                    src={p.imagen_url || 'https://placehold.co/1280x720/1b263b/64748b?text=Proyecto'}
                    alt={p.nombre}
                    loading="lazy"
                    className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-municipal-azul/85 px-3 py-1 text-xs font-semibold text-municipal-crema backdrop-blur">
                    {estadosDb[p.estado]}
                  </span>
                </div>
                <div className="px-4 sm:px-5 py-4">
                  <h3 className="text-lg font-bold text-municipal-azul dark:text-municipal-crema">
                    {p.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-municipal-azul/70 dark:text-municipal-crema/70">
                    {p.descripcion || 'Sin descripción todavía.'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Proyectos
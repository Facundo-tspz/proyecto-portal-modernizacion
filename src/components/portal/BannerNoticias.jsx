import { useEffect, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

const configFallback = {
  activo: true,
  texto: 'Nueva capacitación de herramientas digitales. Inscripciones abiertas en la Dirección de Modernización.',
  link: '',
  imagen: '/images/banner-noticia/banner-seismiles.webp',
}

function BannerNoticias() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    let activo = true
    supabase
      .from('avisos')
      .select('activo, texto, link, imagen_url')
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (!activo) return
        if (data && !error) {
          setConfig({
            activo: data.activo,
            texto: data.texto || '',
            link: data.link || '',
            imagen: data.imagen_url || '',
          })
        } else {
          setConfig(configFallback)
        }
      })
    return () => {
      activo = false
    }
  }, [])

  if (!config) return null
  if (!config.activo) return null

  const contenido = (
    <>
      <div className="flex items-center justify-center shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-municipal-naranja/20">
        <Megaphone size={22} className="text-municipal-naranja" />
      </div>
      <p className="text-sm sm:text-base font-medium text-municipal-negro dark:text-municipal-crema drop-shadow-md flex-1">
        {config.texto}
      </p>
      {config.link && (
        <span className="text-municipal-naranja text-sm font-semibold shrink-0">
          Ver más →
        </span>
      )}
    </>
  )

  const fondo = config.imagen ? (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${config.imagen})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/55 dark:bg-municipal-azul/65" aria-hidden="true" />
    </>
  ) : (
    <div
      className="absolute inset-0 bg-gradient-to-r from-municipal-crema to-municipal-azul/20 dark:from-municipal-azul dark:to-municipal-verde"
      aria-hidden="true"
    />
  )

  const contenedor =
    'relative overflow-hidden rounded-xl shadow-md px-4 sm:px-6 py-3 sm:py-4'

  const contenidoConFondo = (
    <>
      {fondo}
      <div className="relative flex items-center gap-3 sm:gap-4">{contenido}</div>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4"
    >
      {config.link ? (
        <a
          href={config.link}
          className={`${contenedor} block hover:opacity-95 transition-opacity cursor-pointer`}
        >
          {contenidoConFondo}
        </a>
      ) : (
        <div className={contenedor}>{contenidoConFondo}</div>
      )}
    </motion.div>
  )
}

export default BannerNoticias

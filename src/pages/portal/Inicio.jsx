import { motion } from 'framer-motion'
import BannerNoticias from '../../components/portal/BannerNoticias'

function Inicio() {
  return (
    <>
      <BannerNoticias />
      <section className="flex flex-col items-center justify-center min-h-[80vh] gap-4 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold text-municipal-azul dark:text-municipal-crema"
        >
          Dirección de Modernización
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-municipal-verde dark:text-municipal-naranja"
        >
          Municipalidad de Tinogasta
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl text-municipal-negro dark:text-municipal-crema/80"
        >
          Portal institucional en construcción
        </motion.p>
      </section>
    </>
  )
}

export default Inicio

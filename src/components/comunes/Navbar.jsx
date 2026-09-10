import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Moon, Sun, Menu, X, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

const enlacesSobreNosotros = [
  { nombre: 'Quiénes Somos', ruta: '/quienes-somos' },
  { nombre: 'Nuestro Equipo', ruta: '/quienes-somos#equipo' },
  { nombre: 'Contacto', ruta: '/quienes-somos#contacto' },
]

const enlacesProyectos = [
  { nombre: 'Activos', ruta: '/proyectos?estado=activos' },
  { nombre: 'Finalizados', ruta: '/proyectos?estado=finalizados' },
  { nombre: 'En desarrollo', ruta: '/proyectos?estado=en_desarrollo' },
]

const claseSubrayado =
  "after:content-[''] after:absolute after:-bottom-0.5 after:inset-x-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-municipal-verde after:to-municipal-naranja after:transition-opacity"

function DropdownNav({ etiqueta, enlaces }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button className="flex items-center gap-1 py-2 text-sm text-municipal-crema hover:text-municipal-naranja transition-colors cursor-pointer">
        {etiqueta}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 min-w-52 rounded-2xl p-px bg-gradient-to-br from-municipal-naranja/50 via-transparent to-municipal-verde/50 z-50"
          >
            <div className="rounded-[calc(1rem-1px)] bg-white/75 dark:bg-[#0d0d0d]/90 backdrop-blur-xl py-2">
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.nombre}
                  to={enlace.ruta}
                  className="block px-4 py-2 text-sm text-municipal-azul dark:text-municipal-crema hover:text-municipal-naranja hover:bg-municipal-azul/5 dark:hover:bg-white/5 transition-colors"
                >
                  {enlace.nombre}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Navbar() {
  const { tema, alternarTema } = useTheme()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-municipal-azul/85 shadow-md backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-14">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo/logo-negativo.png"
              alt="Logo de la Dirección de Modernización"
              className="h-12 w-auto object-contain"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-municipal-crema/80 font-light">
                Dirección de
              </span>
              <span className="text-sm font-bold text-municipal-crema">
                Modernización
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative py-2 text-sm transition-colors ${claseSubrayado} ${
                  isActive
                    ? 'text-municipal-naranja font-semibold after:opacity-100'
                    : 'text-municipal-crema hover:text-municipal-naranja after:opacity-0'
                }`
              }
            >
              Inicio
            </NavLink>
            <DropdownNav etiqueta="Sobre nosotros" enlaces={enlacesSobreNosotros} />
            <DropdownNav etiqueta="Proyectos" enlaces={enlacesProyectos} />
            <span
              title="Próximamente"
              className="inline-flex items-center rounded-full p-px bg-gradient-to-r from-municipal-verde via-municipal-naranja to-municipal-azul shadow-lg"
            >
              <span className="rounded-full bg-municipal-azul px-4 py-1.5 text-xs font-semibold text-municipal-crema/70">
                Capacitaciones
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={alternarTema}
              className="p-2 rounded-full text-municipal-crema hover:bg-white/10 border border-white/10 transition-colors"
              aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {tema === 'oscuro' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMenuAbierto((estado) => !estado)}
              className="lg:hidden p-2 rounded-full text-municipal-crema hover:bg-white/10 border border-white/10 transition-colors"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-municipal-verde via-municipal-naranja to-municipal-azul"
        aria-hidden="true"
      />

      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-municipal-azul/90 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              <NavLink
                to="/"
                className="block py-2 text-sm text-municipal-crema hover:text-municipal-naranja"
              >
                Inicio
              </NavLink>
              {enlacesSobreNosotros.map((enlace) => (
                <Link
                  key={enlace.nombre}
                  to={enlace.ruta}
                  className="block py-2 pl-4 text-sm text-municipal-crema/80 hover:text-municipal-naranja"
                >
                  {enlace.nombre}
                </Link>
              ))}
              {enlacesProyectos.map((enlace) => (
                <Link
                  key={enlace.nombre}
                  to={enlace.ruta}
                  className="block py-2 pl-4 text-sm text-municipal-crema/80 hover:text-municipal-naranja"
                >
                  {enlace.nombre}
                </Link>
              ))}
              <span className="block py-2 text-sm text-municipal-naranja font-semibold opacity-70">
                Capacitaciones →
              </span>
            </div>
            <div
              className="h-px bg-gradient-to-r from-municipal-verde via-municipal-naranja to-municipal-azul"
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
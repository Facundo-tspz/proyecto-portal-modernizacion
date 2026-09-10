import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  LogOut,
  LayoutDashboard,
  Ticket,
  FileText,
  Users,
  Settings,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  Home,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const grupos = [
  {
    id: 'inicio',
    etiqueta: 'Inicio',
    icono: LayoutDashboard,
    roles: ['admin', 'tecnico', 'editor'],
    items: [{ nombre: 'Panel', ruta: '/mg-tinogasta/panel' }],
  },
  {
    id: 'mesa',
    etiqueta: 'Mesa de ayuda',
    icono: Ticket,
    roles: ['admin', 'tecnico'],
    items: [{ nombre: 'Todos los tickets', ruta: '/mg-tinogasta/tickets' }],
  },
  {
    id: 'contenido',
    etiqueta: 'Contenido',
    icono: FileText,
    roles: ['admin', 'editor'],
    items: [
      { nombre: 'Banner', ruta: '/mg-tinogasta/contenido?seccion=banner' },
      { nombre: 'Destacados', ruta: '/mg-tinogasta/contenido?seccion=destacados' },
      { nombre: 'Accesos útiles', ruta: '/mg-tinogasta/contenido?seccion=accesos' },
      { nombre: 'Textos / Quiénes Somos', ruta: '/mg-tinogasta/contenido?seccion=textos' },
      { nombre: 'Proyectos', ruta: '/mg-tinogasta/contenido?seccion=proyectos' },
    ],
  },
  {
    id: 'usuarios',
    etiqueta: 'Usuarios',
    icono: Users,
    roles: ['admin'],
    items: [
      { nombre: 'Lista de usuarios', ruta: '/mg-tinogasta/usuarios?seccion=lista' },
      { nombre: 'Nuevo usuario', ruta: '/mg-tinogasta/usuarios?seccion=nuevo' },
    ],
  },
  {
    id: 'config',
    etiqueta: 'Configuración',
    icono: Settings,
    roles: ['admin'],
    items: [{ nombre: 'Preferencias', ruta: '/mg-tinogasta/configuracion' }],
  },
]

const nombresRuta = {
  '/mg-tinogasta/panel': ['Panel'],
  '/mg-tinogasta/tickets': ['Mesa de ayuda', 'Todos los tickets'],
  '/mg-tinogasta/contenido': ['Contenido'],
  '/mg-tinogasta/usuarios': ['Usuarios', 'Lista de usuarios'],
  '/mg-tinogasta/configuracion': ['Configuración', 'Preferencias'],
  '/mg-tinogasta/manual': ['Manual de usuario'],
}

const nombresSeccion = {
  banner: 'Banner',
  destacados: 'Destacados',
  accesos: 'Accesos útiles',
  textos: 'Textos / Quiénes Somos',
  proyectos: 'Proyectos',
}

const nombresSeccionUsuarios = {
  lista: 'Lista de usuarios',
  nuevo: 'Nuevo usuario',
}

function obtenerSeccion(search) {
  return new URLSearchParams(search).get('seccion')
}

function Breadcrumb({ ruta, search }) {
  const partes = [...(nombresRuta[ruta] || [])]
  const seccion = obtenerSeccion(search)
  if (ruta === '/mg-tinogasta/contenido' && seccion && nombresSeccion[seccion]) {
    partes.push(nombresSeccion[seccion])
  }
  if (ruta === '/mg-tinogasta/usuarios' && seccion && nombresSeccionUsuarios[seccion]) {
    partes[1] = nombresSeccionUsuarios[seccion]
  }
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span>Inicio</span>
      {partes.map((parte, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-slate-500">›</span>
          <span className={i === partes.length - 1 ? 'text-slate-200 font-medium' : ''}>
            {parte}
          </span>
        </span>
      ))}
    </div>
  )
}

function MenuLateral({ rol, ruta, search, nombre, onNavegar }) {
  const gruposVisibles = grupos.filter((g) => g.roles.includes(rol))
  const rutaCompleta = `${ruta}${search}`
  const [abierto, setAbierto] = useState(() => {
    const inicial = {}
    gruposVisibles.forEach((g) => {
      const activo = g.items.some((it) => it.ruta === rutaCompleta)
      inicial[g.id] = activo
    })
    return inicial
  })

  function alternar(id) {
    setAbierto((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <nav className="flex h-full flex-col overflow-y-auto bg-[#0b1220] text-slate-200">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-sm font-bold text-slate-100">Panel Administrativo</p>
        <p className="mt-0.5 text-xs text-slate-400 capitalize">Rol: {rol}</p>
      </div>

      <div className="flex-1 space-y-1 px-3 py-4">
        {gruposVisibles.map((grupo) => {
          const Icono = grupo.icono
          const estaAbierto = abierto[grupo.id]
          return (
            <div key={grupo.id}>
              <button
                onClick={() => alternar(grupo.id)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/5"
              >
                <span className="flex items-center gap-3">
                  <Icono size={18} className="text-slate-400" />
                  {grupo.etiqueta}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${estaAbierto ? 'rotate-180' : ''}`}
                />
              </button>
              {estaAbierto && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {grupo.items.map((item) => {
                    const activo = item.ruta === rutaCompleta
                    return (
                      <NavLink
                        key={item.nombre}
                        to={item.ruta}
                        onClick={onNavegar}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          activo
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 font-medium text-white'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {item.nombre}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          onClick={onNavegar}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/5"
        >
          <Home size={18} className="text-slate-400" />
          Volver al inicio
        </Link>
        <div className="px-2 pt-4">
          <p className="text-sm font-medium text-slate-100">{nombre}</p>
        </div>
      </div>
    </nav>
  )
}

function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const rol = usuario?.perfil?.rol
  const ruta = location.pathname
  const search = location.search
  const nombre = usuario?.perfil?.nombre || 'Administrador'

  async function manejarSalir() {
    await cerrarSesion()
    navigate('/mg-tinogasta/acceso')
  }

  return (
    <div className="flex min-h-screen bg-[#101a2e] text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:block">
        <MenuLateral rol={rol} ruta={ruta} search={search} nombre={nombre} />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#101a2e]/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="rounded-lg p-2 text-slate-200 hover:bg-white/5 lg:hidden"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <p className="text-sm font-bold text-slate-100">Panel Administrativo</p>
              <Breadcrumb ruta={ruta} search={search} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-cyan-300 sm:inline-block">
              Rol: {rol}
            </span>
            <span className="hidden text-xs text-slate-300 md:inline-block">{nombre}</span>
            <Link
              to="/"
              className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/5"
              aria-label="Volver al inicio"
              title="Volver al inicio"
            >
              <Home size={18} />
            </Link>
            <Link
              to="/mg-tinogasta/manual"
              className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/5"
              aria-label="Manual de usuario"
              title="Manual de usuario"
            >
              <BookOpen size={18} />
            </Link>
            <button
              onClick={manejarSalir}
              className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-white/5"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {menuAbierto && (
          <div className="border-b border-white/10 bg-[#0b1220] lg:hidden">
            <MenuLateral
              rol={rol}
              ruta={ruta}
              search={search}
              onNavegar={() => setMenuAbierto(false)}
              nombre={nombre}
            />
          </div>
        )}

        <main className="flex-1 bg-[#0b1220]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
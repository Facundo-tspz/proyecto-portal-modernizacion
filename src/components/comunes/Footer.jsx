import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react'

const enlacesNavegacion = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Sobre Nosotros', ruta: '/quienes-somos' },
  { nombre: 'Proyectos', ruta: '/proyectos' },
]

const datosContacto = [
  { icono: MapPin, texto: 'Calle Dr. Antonio Del Pino N° 739, Tinogasta — Catamarca' },
  { icono: Phone, texto: '3834-669002' },
  { icono: Mail, texto: 'info@tinogasta.gob.ar' },
]

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-municipal-azul text-municipal-crema mt-auto">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-municipal-verde via-municipal-naranja to-municipal-azul"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-municipal-verde/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-municipal-naranja/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
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
            </div>
            <p className="text-sm text-municipal-crema/80 max-w-xs">
              Usamos la tecnología como medio para acercar el Municipio a la
              comunidad de Tinogasta.
            </p>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              {datosContacto.map(({ icono: Icono, texto }) => (
                <li key={texto} className="flex items-start gap-3 text-sm text-municipal-crema/80">
                  <Icono size={16} className="mt-0.5 text-municipal-naranja shrink-0" />
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Navegación
            </h3>
            <ul className="space-y-3">
              {enlacesNavegacion.map((enlace) => (
                <li key={enlace.nombre}>
                  <Link
                    to={enlace.ruta}
                    className="relative inline-block text-sm text-municipal-crema/80 hover:text-municipal-naranja transition-colors after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-municipal-verde after:to-municipal-naranja after:opacity-0 hover:after:opacity-100 after:transition-opacity"
                  >
                    {enlace.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Capacitaciones
            </h3>
            <a
              href="#"
              className="inline-flex items-center rounded-full p-px bg-gradient-to-r from-municipal-verde to-municipal-naranja transition-transform hover:scale-105"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-municipal-azul px-4 py-2 text-sm font-semibold text-municipal-naranja">
                Ir al sitio de capacitaciones
                <ExternalLink size={14} />
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-municipal-crema/60">
            © 2026 Municipalidad de Tinogasta · Dirección de Modernización
          </p>
          <p className="text-xs text-municipal-crema/60">
            Municipalidad de Tinogasta
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

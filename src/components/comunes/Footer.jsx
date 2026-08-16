import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react'

const enlacesNavegacion = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Sobre Nosotros', ruta: '/quienes-somos' },
  { nombre: 'Proyectos', ruta: '/proyectos' },
]

const datosContacto = [
  { icono: MapPin, texto: 'Av. Principal s/n — Tinogasta, Catamarca' },
  { icono: Mail, texto: 'modernizacion@tinogasta.gob.ar' },
  { icono: Phone, texto: '(03837) 4-0000' },
]

function Footer() {
  return (
    <footer className="bg-municipal-azul text-municipal-crema mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <img
              src="/images/logo/logo-negativo.png"
              alt="Logo de la Dirección de Modernización"
              className="h-16 w-auto object-contain mb-4"
            />
            <p className="text-sm text-municipal-crema/80 max-w-xs">
              Transformamos digitalmente la gestión municipal, acercando la
              tecnología a la comunidad de Tinogasta.
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
                    className="text-sm text-municipal-crema/80 hover:text-municipal-naranja transition-colors"
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
              className="inline-flex items-center gap-2 text-sm text-municipal-naranja hover:text-municipal-crema transition-colors"
            >
              Ir al sitio de capacitaciones
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
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

import { useEffect, useState } from 'react'
import { Inbox, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

function Dashboard() {
  const { usuario } = useAuth()
  const rol = usuario?.perfil?.rol
  const puedeTickets = rol === 'admin' || rol === 'tecnico'
  const [conteos, setConteos] = useState({ pendiente: 0, en_espera: 0, resuelta: 0, rechazada: 0 })

  useEffect(() => {
    let activo = true
    if (!puedeTickets) return
    supabase
      .from('tickets')
      .select('estado')
      .then(({ data }) => {
        if (!activo || !data) return
        const resultado = { pendiente: 0, en_espera: 0, resuelta: 0, rechazada: 0 }
        data.forEach((t) => {
          if (resultado[t.estado] !== undefined) resultado[t.estado] += 1
        })
        setConteos(resultado)
      })
    return () => {
      activo = false
    }
  }, [puedeTickets])

  const tarjetas = [
    {
      icono: Inbox,
      etiqueta: 'Pendientes',
      valor: conteos.pendiente,
      color: 'from-amber-500 to-orange-600',
    },
    {
      icono: Clock,
      etiqueta: 'En espera',
      valor: conteos.en_espera,
      color: 'from-sky-500 to-blue-600',
    },
    {
      icono: CheckCircle2,
      etiqueta: 'Resueltos',
      valor: conteos.resuelta,
      color: 'from-emerald-500 to-green-600',
    },
    {
      icono: XCircle,
      etiqueta: 'Rechazados',
      valor: conteos.rechazada,
      color: 'from-rose-500 to-red-600',
    },
  ]

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-panel-texto">Panel</h1>
      <p className="mt-1 text-sm text-panel-texto-suave">
        Hola, {usuario?.perfil?.nombre || 'Administrador'} · Resumen del área
      </p>

      {puedeTickets ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {tarjetas.map((tarjeta) => {
              const Icono = tarjeta.icono
              return (
                <div
                  key={tarjeta.etiqueta}
                  className="rounded-2xl p-px bg-gradient-to-br from-panel-borde to-panel-hover"
                >
                  <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-panel-superficie p-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tarjeta.color} text-white shadow`}
                    >
                      <Icono size={22} />
                    </div>
                    <span className="mt-4 text-3xl font-bold text-panel-texto">
                      {tarjeta.valor}
                    </span>
                    <span className="mt-1 text-sm text-panel-texto-suave">{tarjeta.etiqueta}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/40 via-transparent to-panel-acento-2/40">
            <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-panel-texto">Mesa de ayuda</h2>
                <Link
                  to="/mg-tinogasta/tickets"
                  className="inline-flex items-center gap-1 text-xs font-medium text-panel-acento-texto hover:text-panel-acento-texto"
                >
                  Ver tickets <ArrowRight size={14} />
                </Link>
              </div>
              <p className="mt-2 text-sm text-panel-texto-suave">
                Accedé a la lista completa de tickets para priorizar, cambiar estado y coordinar
                respuestas.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/40 via-transparent to-panel-acento-2/40">
          <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-6">
            <h2 className="text-sm font-semibold text-panel-texto">Editor de contenido</h2>
            <p className="mt-2 text-sm text-panel-texto-suave">
              Tu rol de editor te permite configurar el contenido del portal. Usá el menú
              "Contenido" para editar banner, destacados, accesos y textos.
            </p>
            <Link
              to="/mg-tinogasta/contenido"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-panel-acento-texto hover:text-panel-acento-texto"
            >
              Ir a Contenido <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
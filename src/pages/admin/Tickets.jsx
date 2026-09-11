import { useEffect, useMemo, useState } from 'react'
import {
  Ticket,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  Send,
  Phone,
  Building2,
  User,
  MapPin,
  Tag,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const pestañas = [
  { id: 'todos', etiqueta: 'Todos los tickets', icono: Ticket },
  { id: 'pendiente', etiqueta: 'Pendientes', icono: Inbox },
  { id: 'en_espera', etiqueta: 'En espera', icono: Clock },
  { id: 'resuelta', etiqueta: 'Resueltos', icono: CheckCircle2 },
  { id: 'rechazada', etiqueta: 'Rechazados', icono: XCircle },
]

const estadoInfo = {
  pendiente: { etiqueta: 'Pendiente', clase: 'bg-amber-500/15 text-amber-300', punto: 'bg-amber-400' },
  en_espera: { etiqueta: 'En espera', clase: 'bg-sky-500/15 text-sky-300', punto: 'bg-sky-400' },
  resuelta: { etiqueta: 'Resuelta', clase: 'bg-emerald-500/15 text-emerald-300', punto: 'bg-emerald-400' },
  rechazada: { etiqueta: 'Rechazada', clase: 'bg-rose-500/15 text-rose-300', punto: 'bg-rose-400' },
}

const gravedadInfo = {
  critica: { etiqueta: 'Crítica', clase: 'bg-red-500/15 text-red-300' },
  alta: { etiqueta: 'Alta', clase: 'bg-orange-500/15 text-orange-300' },
  media: { etiqueta: 'Media', clase: 'bg-yellow-500/15 text-yellow-300' },
  baja: { etiqueta: 'Baja', clase: 'bg-green-500/15 text-green-300' },
}

const opcionesEstado = [
  { valor: 'en_espera', etiqueta: 'En espera' },
  { valor: 'resuelta', etiqueta: 'Resuelta' },
  { valor: 'rechazada', etiqueta: 'Rechazada' },
]

const opcionesGravedad = [
  { valor: 'baja', etiqueta: 'Baja' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'alta', etiqueta: 'Alta' },
  { valor: 'critica', etiqueta: 'Crítica' },
]

const selectClase =
  'rounded-lg border border-white/10 bg-[#0b1220] px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400/60'

function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Tickets() {
  const { usuario } = useAuth()
  const [tickets, setTickets] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pestaña, setPestaña] = useState('todos')
  const [expandido, setExpandido] = useState(null)
  const [detalles, setDetalles] = useState({})
  const [respuesta, setRespuesta] = useState('')
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false)
  const [accionando, setAccionando] = useState(null)
  const [perfiles, setPerfiles] = useState([])

  useEffect(() => {
    supabase
      .from('perfiles')
      .select('id, nombre')
      .then(({ data }) => setPerfiles(data || []))
      .catch(() => {})
  }, [])

  async function cargarTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(error.message || 'No se pudieron cargar los tickets.')
      setTickets([])
    } else {
      setTickets(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarTickets()
  }, [])

  const conteos = useMemo(() => {
    const base = { pendiente: 0, en_espera: 0, resuelta: 0, rechazada: 0 }
    tickets.forEach((t) => {
      if (base[t.estado] !== undefined) base[t.estado] += 1
    })
    return base
  }, [tickets])

  const visibles = useMemo(() => {
    if (pestaña === 'todos') return tickets
    return tickets.filter((t) => t.estado === pestaña)
  }, [tickets, pestaña])

  const nombreDe = (id) => perfiles.find((p) => p.id === id)?.nombre || 'Mesa de ayuda'

  async function cargarDetalle(ticket) {
    const [historial, respuestas] = await Promise.all([
      supabase
        .from('ticket_estado_historial')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('ticket_respuestas')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true }),
    ])
    setDetalles((prev) => ({
      ...prev,
      [ticket.id]: {
        historial: historial.data || [],
        respuestas: respuestas.data || [],
      },
    }))
  }

  function alternarDetalle(ticket) {
    if (expandido === ticket.id) {
      setExpandido(null)
      setRespuesta('')
      return
    }
    setExpandido(ticket.id)
    setRespuesta('')
    if (!detalles[ticket.id]) cargarDetalle(ticket)
  }

  async function cambiarEstado(ticket, valor) {
    if (valor === ticket.estado) return
    setAccionando(`estado-${ticket.id}`)
    const { error } = await supabase.from('tickets').update({ estado: valor }).eq('id', ticket.id)
    setAccionando(null)
    if (error) {
      toast.error(error.message || 'No se pudo cambiar el estado.')
      return
    }
    toast.success('Estado actualizado')
    await cargarTickets()
    if (expandido === ticket.id) cargarDetalle({ ...ticket, estado: valor })
  }

  async function cambiarGravedad(ticket, valor) {
    if (valor === ticket.gravedad) return
    setAccionando(`gravedad-${ticket.id}`)
    const { error } = await supabase.from('tickets').update({ gravedad: valor }).eq('id', ticket.id)
    setAccionando(null)
    if (error) {
      toast.error(error.message || 'No se pudo cambiar la gravedad.')
      return
    }
    toast.success('Gravedad actualizada')
    await cargarTickets()
  }

  async function agregarRespuesta(ticket) {
    const mensaje = respuesta.trim()
    if (!mensaje) return
    setEnviandoRespuesta(true)
    const { error } = await supabase.from('ticket_respuestas').insert({
      ticket_id: ticket.id,
      mensaje,
      autor_id: usuario?.id || null,
    })
    if (error) {
      setEnviandoRespuesta(false)
      toast.error(error.message || 'No se pudo enviar la respuesta.')
      return
    }

    let desplazado = false
    if (ticket.estado === 'pendiente') {
      const res = await supabase
        .from('tickets')
        .update({ estado: 'en_espera' })
        .eq('id', ticket.id)
      if (res.error) {
        setEnviandoRespuesta(false)
        toast.error(
          `Respuesta guardada, pero no se pudo pasar el ticket a "En espera": ${res.error.message}`
        )
      } else {
        desplazado = true
      }
    }

    setEnviandoRespuesta(false)
    setRespuesta('')
    toast.success(
      desplazado ? 'Respuesta enviada · el ticket pasó a En espera' : 'Respuesta enviada'
    )
    await cargarTickets()
    await cargarDetalle(ticket)
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-100">Mesa de ayuda</h1>
      <p className="mt-1 text-sm text-slate-400">
        Todos los tickets · {pestaña === 'todos' ? tickets.length : conteos[pestaña]} resultado
        {pestaña === 'todos' || conteos[pestaña] === 1 ? '' : 's'}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {pestañas.map((btn) => {
          const activa = pestaña === btn.id
          const Icono = btn.icono
          const cantidad = btn.id === 'todos' ? tickets.length : conteos[btn.id]
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setPestaña(btn.id)}
              className={`relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                activa
                  ? 'text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {activa && (
                <motion.span
                  layoutId="indicador-tickets"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icono size={15} className="relative z-10" />
              <span className="relative z-10">{btn.etiqueta}</span>
              <span
                className={`relative z-10 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  activa ? 'bg-white/20' : 'bg-white/10 text-slate-300'
                }`}
              >
                {cantidad}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {cargando && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            Cargando tickets…
          </div>
        )}

        {!cargando && visibles.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#101a2e] p-10 text-center">
            <p className="text-sm text-slate-400">
              {pestaña === 'todos'
                ? 'Todavía no hay tickets.'
                : `No hay tickets en estado "${estadoInfo[pestaña]?.etiqueta ?? pestaña}".`}
            </p>
          </div>
        )}

        {visibles.map((ticket) => {
          const estaExpandido = expandido === ticket.id
          const estado = estadoInfo[ticket.estado]
          const gravedad = gravedadInfo[ticket.gravedad]
          const detalleTicket = estaExpandido ? detalles[ticket.id] : null
          return (
            <div
              key={ticket.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#101a2e]"
            >
              <button
                type="button"
                onClick={() => alternarDetalle(ticket)}
                className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className="rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-cyan-300">
                  {ticket.codigo_seguimiento}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">
                    {ticket.contacto_nombre}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {ticket.contacto_secretaria} · {ticket.categoria_problema}
                  </span>
                </span>
                {estado && (
                  <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${estado.clase}`}>
                    {estado.etiqueta}
                  </span>
                )}
                {gravedad && (
                  <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold lg:inline ${gravedad.clase}`}>
                    {gravedad.etiqueta}
                  </span>
                )}
                <span className="text-xs text-slate-400">{formatFecha(ticket.created_at)}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${estaExpandido ? 'rotate-180' : ''}`}
                />
              </button>

              {estaExpandido && (
                <div className="border-t border-white/10 bg-[#0b1220] px-4 py-4">
                  <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <Building2 size={15} className="text-slate-500" />
                      {ticket.contacto_secretaria}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={15} className="text-slate-500" />
                      {ticket.contacto_direccion || '—'}
                    </span>
                    <span className="flex items-center gap-2">
                      <User size={15} className="text-slate-500" />
                      {ticket.contacto_rol || '—'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone size={15} className="text-slate-500" />
                      {ticket.contacto_telefono || '—'}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/[0.03] px-3.5 py-3 text-sm text-slate-200">
                    {ticket.descripcion}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      Estado
                      <select
                        value={ticket.estado}
                        onChange={(e) => cambiarEstado(ticket, e.target.value)}
                        className={selectClase}
                        disabled={accionando === `estado-${ticket.id}`}
                      >
                        {ticket.estado === 'pendiente' && (
                          <option value="pendiente" disabled>
                            Pendiente (inicial)
                          </option>
                        )}
                        {opcionesEstado.map((op) => (
                          <option key={op.valor} value={op.valor}>
                            {op.etiqueta}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-400">
                      <Tag size={13} />
                      Gravedad
                      <select
                        value={ticket.gravedad}
                        onChange={(e) => cambiarGravedad(ticket, e.target.value)}
                        className={selectClase}
                        disabled={accionando === `gravedad-${ticket.id}`}
                      >
                        {opcionesGravedad.map((op) => (
                          <option key={op.valor} value={op.valor}>
                            {op.etiqueta}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <Clock size={13} />
                        Historial
                      </h3>
                      {!detalleTicket ? (
                        <p className="mt-2 text-xs text-slate-500">Cargando…</p>
                      ) : detalleTicket.historial.length === 0 ? (
                        <p className="mt-2 text-xs text-slate-500">Sin cambios de estado.</p>
                      ) : (
                        <ul className="mt-2 space-y-1.5">
                          {detalleTicket.historial.map((h, i) => (
                            <li key={i} className="text-xs text-slate-300">
                              <span className="text-slate-500">{formatFecha(h.created_at)}</span>
                              {' · '}
                              {!h.estado_anterior ? (
                                <>
                                  <span className="font-semibold text-emerald-300">Creado</span>{' '}
                                  → <span className="font-semibold">{estadoInfo[h.estado_nuevo]?.etiqueta ?? h.estado_nuevo}</span>
                                </>
                              ) : (
                                <>
                                  <span>{estadoInfo[h.estado_anterior]?.etiqueta ?? h.estado_anterior}</span>{' '}
                                  → <span className="font-semibold">{estadoInfo[h.estado_nuevo]?.etiqueta ?? h.estado_nuevo}</span>
                                </>
                              )}
                              {h.cambiado_por && (
                                <span className="text-slate-500">
                                  {' '}
                                  ({nombreDe(h.cambiado_por)})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <Send size={13} />
                        Respuestas
                      </h3>
                      {detalleTicket && (
                        <>
                          {detalleTicket.respuestas.length === 0 ? (
                            <p className="mt-2 text-xs text-slate-500">Todavía no hay respuestas.</p>
                          ) : (
                            <ul className="mt-2 space-y-2">
                              {detalleTicket.respuestas.map((r, i) => (
                                <li
                                  key={i}
                                  className="rounded-xl bg-white/[0.03] px-3 py-2.5"
                                >
                                  <p className="whitespace-pre-wrap text-xs text-slate-200">{r.mensaje}</p>
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    {formatFecha(r.created_at)} · {r.autor_id ? nombreDe(r.autor_id) : 'Mesa de ayuda'}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}

                          <textarea
                            value={respuesta}
                            onChange={(e) => setRespuesta(e.target.value)}
                            rows={3}
                            className="mt-3 w-full resize-y rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none"
                            placeholder="Escribí una respuesta para el seguimiento del vecino…"
                          />
                          <button
                            type="button"
                            onClick={() => agregarRespuesta(ticket)}
                            disabled={enviandoRespuesta || !respuesta.trim()}
                            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow transition-transform hover:scale-[1.02] disabled:opacity-50"
                          >
                            {enviandoRespuesta ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            Enviar respuesta
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!cargando && tickets.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
          <AlertTriangle size={12} />
          Los cambios de estado se registran automáticamente en el historial. Al responder un
          ticket pendiente, pasa automáticamente a "En espera".
        </p>
      )}
    </div>
  )
}

export default Tickets
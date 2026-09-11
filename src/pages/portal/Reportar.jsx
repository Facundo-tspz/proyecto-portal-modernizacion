import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  ClipboardCopy,
  Download,
  Home,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'

const categorias = ['Conectividad', 'Equipos', 'Software', 'Otro']

const estadosTicket = {
  pendiente: {
    etiqueta: 'Pendiente',
    clase: 'bg-estado-pendiente/15 text-estado-pendiente',
    punto: 'bg-estado-pendiente',
  },
  en_espera: {
    etiqueta: 'En espera',
    clase: 'bg-estado-enEspera/15 text-estado-enEspera',
    punto: 'bg-estado-enEspera',
  },
  resuelta: {
    etiqueta: 'Resuelta',
    clase: 'bg-estado-resuelta/15 text-estado-resuelta',
    punto: 'bg-estado-resuelta',
  },
  rechazada: {
    etiqueta: 'Rechazada',
    clase: 'bg-estado-rechazada/15 text-estado-rechazada',
    punto: 'bg-estado-rechazada',
  },
}

const gravedades = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

const inputClase =
  'w-full rounded-xl border border-municipal-azul/15 bg-white/80 px-4 py-2.5 text-sm text-municipal-azul placeholder:text-municipal-azul/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-municipal-naranja/60 dark:border-municipal-crema/15 dark:bg-white/5 dark:text-municipal-crema dark:placeholder:text-municipal-crema/40'

const etiquetaClase = 'mb-1.5 block text-sm font-semibold text-municipal-azul dark:text-municipal-crema'

function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ejemploDescripcion =
  'Contanos qué pasó, desde cuándo, qué intentaste resolver…'

const pestañas = [
  { id: 'reportar', nombre: 'Realizar reporte', icono: FileText },
  { id: 'seguimiento', nombre: 'Hacer seguimiento', icono: Search },
]

function Reportar() {
  const [pestaña, setPestaña] = useState('reportar')

  const [form, setForm] = useState({
    nombre: '',
    secretaria: '',
    direccion: '',
    rol: '',
    telefono: '',
    categoria: 'Conectividad',
    descripcion: '',
  })
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [fase, setFase] = useState('form')
  const [codigoGenerado, setCodigoGenerado] = useState('')

  const [codigoConsulta, setCodigoConsulta] = useState('')
  const [ticket, setTicket] = useState(null)
  const [errorConsulta, setErrorConsulta] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [pedidoBusqueda, setPedidoBusqueda] = useState({ n: 0, codigo: '' })

  useEffect(() => {
    if (pedidoBusqueda.n === 0) return
    let activo = true
    const codigo = pedidoBusqueda.codigo
    async function buscar() {
      setBuscando(true)
      setTicket(null)
      setErrorConsulta(null)
      try {
        const { data, error } = await supabase.rpc('consultar_ticket_por_codigo', {
          p_codigo: codigo,
        })
        if (!activo) return
        if (error) {
          setErrorConsulta(error.message || 'No se pudo consultar el ticket')
        } else {
          setTicket(data)
        }
      } catch {
        if (activo) setErrorConsulta('Error de conexión. Probá de nuevo.')
      } finally {
        if (activo) setBuscando(false)
      }
    }
    buscar()
    return () => {
      activo = false
    }
  }, [pedidoBusqueda.n, pedidoBusqueda.codigo])

  const camposValidos = useMemo(() => {
    const erroresNuevos = {}
    const soloLetras = /^[a-zA-ZáéíóúñÑüÜ\s]+$/

    if (form.nombre.trim().length < 2) erroresNuevos.nombre = 'Ingresá tu nombre y apellido (mínimo 2 letras).'
    else if (!soloLetras.test(form.nombre.trim())) erroresNuevos.nombre = 'Solo se permiten letras y espacios.'

    if (!form.secretaria.trim()) erroresNuevos.secretaria = 'Indicá la secretaría.'
    if (!form.direccion.trim()) erroresNuevos.direccion = 'Indicá tu dirección, área o departamento.'
    if (!form.rol.trim()) erroresNuevos.rol = 'Indicá tu rol o cargo.'

    const telefono = form.telefono.trim()
    if (telefono && !/^\d{5,20}$/.test(telefono)) {
      erroresNuevos.telefono = 'El número debe tener solo dígitos (5 a 20).'
    }

    if (form.descripcion.trim().length < 20) {
      erroresNuevos.descripcion = 'La descripción debe tener al menos 20 caracteres.'
    }

    return erroresNuevos
  }, [form])

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function enviarFormulario(e) {
    e.preventDefault()
    const erroresNuevos = camposValidos
    setErrores(erroresNuevos)
    if (Object.keys(erroresNuevos).length > 0) return

    setEnviando(true)
    try {
      const { data, error } = await supabase.rpc('crear_ticket_publico', {
        p_nombre: form.nombre.trim(),
        p_secretaria: form.secretaria.trim(),
        p_direccion: form.direccion.trim(),
        p_rol: form.rol.trim(),
        p_email: '',
        p_telefono: form.telefono.trim(),
        p_categoria: form.categoria,
        p_descripcion: form.descripcion.trim(),
      })
      if (error) {
        toast.error(error.message || 'No se pudo enviar la solicitud.')
        return
      }
      setCodigoGenerado(data.codigo_seguimiento)
      setFase('exito')
      toast.success('Solicitud enviada correctamente')
    } catch {
      toast.error('Error de conexión. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoGenerado)
      toast.success('Código copiado al portapapeles')
    } catch {
      toast.error('No se pudo copiar automáticamente')
    }
  }

  function descargarCodigo() {
    const texto = [
      'SOLICITUD DE SOPORTE TÉCNICO',
      'Dirección de Modernización - Municipalidad de Tinogasta',
      '',
      `Código de seguimiento: ${codigoGenerado}`,
      '',
      'Guardá este código: es la única forma de consultar',
      'el estado de tu solicitud.',
    ].join('\n')
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solicitud-${codigoGenerado}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function irASeguimiento(codigo) {
    setPestaña('seguimiento')
    setCodigoConsulta(codigo)
    setPedidoBusqueda({ n: Date.now(), codigo })
  }

  function buscarPorClic() {
    if (!codigoConsulta.trim()) {
      toast.error('Ingresá el código de seguimiento.')
      return
    }
    const codigo = codigoConsulta.trim().toUpperCase()
    setCodigoConsulta(codigo)
    setPedidoBusqueda({ n: Date.now(), codigo })
  }

  function volverALlenar() {
    setFase('form')
    setForm({
      nombre: '',
      secretaria: '',
      direccion: '',
      rol: '',
      telefono: '',
      categoria: 'Conectividad',
      descripcion: '',
    })
  }

  return (
    <section className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-municipal-verde/20 blur-3xl dark:bg-municipal-verde/25" />
        <div className="absolute top-1/4 -right-16 h-72 w-72 rounded-full bg-municipal-naranja/20 blur-3xl dark:bg-municipal-naranja/25" />
      </div>

      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl bg-white/50 p-1 shadow-sm backdrop-blur-sm dark:bg-white/5">
          {pestañas.map((btn) => {
            const activa = pestaña === btn.id
            const Icono = btn.icono
            return (
              <button
                key={btn.id}
                type="button"
                role="tab"
                onClick={() => setPestaña(btn.id)}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activa
                    ? 'text-municipal-crema'
                    : 'text-municipal-azul/70 hover:text-municipal-azul dark:text-municipal-crema/60 dark:hover:text-municipal-crema'
                }`}
              >
                {activa && (
                  <motion.span
                    layoutId="indicador-reporte"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-municipal-azul to-municipal-verde shadow-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icono size={15} className="relative z-10" />
                <span className="relative z-10">{btn.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pestaña === 'reportar' ? (
          <motion.div
            key="reportar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {fase === 'form' ? (
              <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-verde/40 via-transparent to-municipal-naranja/40">
                <form
                  onSubmit={enviarFormulario}
                  noValidate
                  className="rounded-[calc(1rem-1px)] bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:bg-municipal-negro/80"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
                    Mesa de ayuda
                  </p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-municipal-azul dark:text-municipal-crema">
                    Realizar reporte
                  </h1>
                  <p className="mt-2 text-sm text-municipal-azul/70 dark:text-municipal-crema/60">
                    Completá los datos para reportar un problema. Todo es para
                    uso interno del municipio.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="campo-nombre" className={etiquetaClase}>
                        Nombre y apellido *
                      </label>
                      <input
                        id="campo-nombre"
                        type="text"
                        value={form.nombre}
                        onChange={(e) => actualizar('nombre', e.target.value)}
                        className={inputClase}
                      />
                      {errores.nombre && (
                        <p className="mt-1 text-xs text-municipal-naranja">{errores.nombre}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="campo-secretaria" className={etiquetaClase}>
                        Secretaría *
                      </label>
                      <input
                        id="campo-secretaria"
                        type="text"
                        value={form.secretaria}
                        onChange={(e) => actualizar('secretaria', e.target.value)}
                        className={inputClase}
                      />
                      {errores.secretaria && (
                        <p className="mt-1 text-xs text-municipal-naranja">{errores.secretaria}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="campo-direccion" className={etiquetaClase}>
                        Dirección / Área / Departamento *
                      </label>
                      <input
                        id="campo-direccion"
                        type="text"
                        value={form.direccion}
                        onChange={(e) => actualizar('direccion', e.target.value)}
                        className={inputClase}
                      />
                      {errores.direccion && (
                        <p className="mt-1 text-xs text-municipal-naranja">{errores.direccion}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="campo-rol" className={etiquetaClase}>
                        Rol / Cargo *
                      </label>
                      <input
                        id="campo-rol"
                        type="text"
                        value={form.rol}
                        onChange={(e) => actualizar('rol', e.target.value)}
                        className={inputClase}
                      />
                      {errores.rol && (
                        <p className="mt-1 text-xs text-municipal-naranja">{errores.rol}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="campo-telefono" className={etiquetaClase}>
                        Número de contacto (opcional)
                      </label>
                      <input
                        id="campo-telefono"
                        type="tel"
                        inputMode="numeric"
                        value={form.telefono}
                        onChange={(e) => actualizar('telefono', e.target.value)}
                        className={inputClase}
                        placeholder="Solo dígitos"
                      />
                      {errores.telefono && (
                        <p className="mt-1 text-xs text-municipal-naranja">{errores.telefono}</p>
                      )}
                    </div>

                    <fieldset>
                      <legend className={etiquetaClase}>¿Qué tipo de problema es? *</legend>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {categorias.map((cat) => (
                          <label
                            key={cat}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                              form.categoria === cat
                                ? 'border-municipal-naranja bg-municipal-naranja/10 text-municipal-azul dark:text-municipal-crema'
                                : 'border-municipal-azul/15 bg-white/60 text-municipal-azul/70 hover:border-municipal-naranja/50 dark:border-municipal-crema/15 dark:bg-white/5 dark:text-municipal-crema/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name="categoria"
                              value={cat}
                              checked={form.categoria === cat}
                              onChange={() => actualizar('categoria', cat)}
                              className="radio radio-sm radio-primary"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="campo-descripcion" className={etiquetaClase}>
                        Descripción del problema *
                      </label>
                      <textarea
                        id="campo-descripcion"
                        rows={4}
                        value={form.descripcion}
                        onChange={(e) => actualizar('descripcion', e.target.value)}
                        className={`${inputClase} resize-y`}
                        placeholder={`${ejemploDescripcion} (mínimo 20 caracteres)`}
                      />
                      {errores.descripcion && (
                        <p className="mt-1 text-xs text-municipal-naranja">{errores.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-municipal-azul to-municipal-verde px-6 py-3 text-sm font-semibold text-municipal-crema shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Enviando…
                      </>
                    ) : (
                      'ENVIAR SOLICITUD'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-verde/40 via-transparent to-municipal-naranja/40">
                <div className="rounded-[calc(1rem-1px)] bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:bg-municipal-negro/80">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-municipal-verde/15 text-municipal-verde">
                    <CheckCircle2 size={34} />
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-municipal-azul dark:text-municipal-crema">
                    Solicitud enviada correctamente
                  </h2>
                  <p className="mt-2 text-sm text-municipal-azul/70 dark:text-municipal-crema/60">
                    Tu código de seguimiento es:
                  </p>
                  <button
                    type="button"
                    onClick={copiarCodigo}
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-municipal-azul/5 px-8 py-4 font-mono text-3xl font-bold tracking-widest text-municipal-naranja ring-2 ring-municipal-naranja/60 transition-transform hover:scale-[1.02] dark:bg-white/5"
                    title="Copiar código"
                  >
                    {codigoGenerado}
                    <ClipboardCopy size={22} />
                  </button>
                  <p className="mx-auto mt-4 max-w-md text-sm text-municipal-azul/70 dark:text-municipal-crema/60">
                    Guardá este código. Es la única forma de consultar el estado
                    de tu solicitud.
                  </p>
                  <p className="mx-auto mt-2 flex max-w-md items-center justify-center gap-2 rounded-xl bg-municipal-naranja/10 px-4 py-2 text-xs text-municipal-naranja">
                    <AlertTriangle size={15} />
                    Si perdés este código, vas a tener que realizar un nuevo reporte.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={descargarCodigo}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-municipal-azul to-municipal-verde px-5 py-2.5 text-sm font-semibold text-municipal-crema shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <Download size={17} />
                      Descargar (.txt)
                    </button>
                    <button
                      type="button"
                      onClick={() => irASeguimiento(codigoGenerado)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-municipal-naranja px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <Search size={17} />
                      Ver seguimiento
                    </button>
                    <Link
                      to="/"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-municipal-azul/20 px-5 py-2.5 text-sm font-semibold text-municipal-azul transition-colors hover:bg-municipal-azul/5 dark:border-municipal-crema/20 dark:text-municipal-crema dark:hover:bg-white/5"
                    >
                      <Home size={17} />
                      Volver al inicio
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={volverALlenar}
                    className="mt-4 text-xs text-municipal-azul/60 underline-offset-2 hover:underline dark:text-municipal-crema/60"
                  >
                    Hacer otro reporte
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="seguimiento"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="rounded-2xl p-px bg-gradient-to-br from-municipal-verde/40 via-transparent to-municipal-naranja/40">
              <div className="rounded-[calc(1rem-1px)] bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:bg-municipal-negro/80">
                <h2 className="text-xl font-bold text-municipal-azul dark:text-municipal-crema">
                  Hacer seguimiento
                </h2>
                <p className="mt-1 text-sm text-municipal-azul/70 dark:text-municipal-crema/60">
                  Ingresá tu código de seguimiento para ver el estado de tu solicitud.
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={codigoConsulta}
                    onChange={(e) => setCodigoConsulta(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && buscarPorClic()}
                    className={`${inputClase} font-mono uppercase tracking-widest`}
                    placeholder="X4F8K2M9"
                  />
                  <button
                    type="button"
                    onClick={buscarPorClic}
                    disabled={buscando}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-municipal-azul to-municipal-verde px-6 py-2.5 text-sm font-semibold text-municipal-crema shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {buscando ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
                    Buscar
                  </button>
                </div>

                {errorConsulta && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-municipal-naranja/10 px-4 py-3 text-sm text-municipal-naranja">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    {errorConsulta}
                  </div>
                )}

                {ticket && !errorConsulta && (
                  <div className="mt-5 rounded-2xl border border-municipal-azul/10 bg-white/50 p-5 dark:border-municipal-crema/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center gap-2">
                      {estadosTicket[ticket.estado] && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${estadosTicket[ticket.estado].clase}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${estadosTicket[ticket.estado].punto}`} />
                          {estadosTicket[ticket.estado].etiqueta}
                        </span>
                      )}
                      <span className="text-sm text-municipal-azul/70 dark:text-municipal-crema/60">
                        Gravedad: <strong>{gravedades[ticket.gravedad] ?? ticket.gravedad}</strong>
                      </span>
                      <span className="text-sm text-municipal-azul/70 dark:text-municipal-crema/60">
                        Categoría: <strong>{ticket.categoria_problema}</strong>
                      </span>
                    </div>

                    {ticket.descripcion && (
                      <p className="mt-4 whitespace-pre-wrap text-sm text-municipal-azul/80 dark:text-municipal-crema/80">
                        {ticket.descripcion}
                      </p>
                    )}

                    <div className="mt-4 grid gap-1 text-sm text-municipal-azul/70 dark:text-municipal-crema/60 sm:grid-cols-2">
                      <span>Creado: {formatFecha(ticket.created_at)}</span>
                      <span>Último cambio: {formatFecha(ticket.updated_at)}</span>
                    </div>

                    {(ticket.historial?.length > 0 || ticket.respuestas?.length > 0) && (
                      <div className="mt-4 border-t border-municipal-azul/10 pt-4 dark:border-municipal-crema/10">
                        {ticket.historial?.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
                              Historial
                            </h3>
                            <ul className="mt-2 space-y-1.5">
                              {ticket.historial.map((h, i) => (
                                <li key={i} className="text-sm text-municipal-azul/80 dark:text-municipal-crema/80">
                                  <span className="font-mono">{formatFecha(h.created_at)}</span>
                                  {' · '}
                                  {!h.estado_anterior ? (
                                    <>
                                      <strong>Inicio</strong> →{' '}
                                      <strong>{estadosTicket[h.estado_nuevo]?.etiqueta ?? h.estado_nuevo}</strong>
                                    </>
                                  ) : (
                                    <>
                                      <strong>{estadosTicket[h.estado_anterior]?.etiqueta ?? h.estado_anterior}</strong> →{' '}
                                      <strong>{estadosTicket[h.estado_nuevo]?.etiqueta ?? h.estado_nuevo}</strong>
                                    </>
                                  )}
                                  {h.responsable && (
                                    <span className="text-municipal-azul/60 dark:text-municipal-crema/50">
                                      {' '}
                                      ({h.responsable})
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {ticket.respuestas?.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-municipal-naranja">
                              Respuesta del técnico
                            </h3>
                            <ul className="mt-2 space-y-2">
                              {ticket.respuestas.map((r, i) => (
                                <li
                                  key={i}
                                  className="rounded-xl bg-municipal-verde/5 px-4 py-2.5 text-sm text-municipal-azul/85 dark:bg-white/5 dark:text-municipal-crema/85"
                                >
                                  <span className="text-xs text-municipal-azul/50 dark:text-municipal-crema/50">
                                    {formatFecha(r.created_at)} · {r.autor ?? 'Mesa de ayuda'}
                                  </span>
                                  <p className="mt-1">“{r.mensaje}”</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default Reportar
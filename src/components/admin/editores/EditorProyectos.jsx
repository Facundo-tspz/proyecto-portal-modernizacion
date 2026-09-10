import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImagePlus,
  RefreshCw,
  Eye,
  EyeOff,
  FolderKanban,
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { subirImagen, borrarImagen } from '../../../lib/storage'
import CropImageModal from '../CropImageModal'

const estados = [
  { id: 'activo', nombre: 'Activos' },
  { id: 'en_desarrollo', nombre: 'En desarrollo' },
  { id: 'finalizado', nombre: 'Finalizados' },
]

const filtros = [{ id: 'todos', nombre: 'Todos' }, ...estados]

const placeholders = {
  activo: 'red wifi, trámites digitales, …',
  en_desarrollo: 'portal, app móvil, …',
  finalizado: 'capacitación, relevamiento, …',
}

function TarjetaProyecto({ item, enImagen }) {
  const [cropAbierto, setCropAbierto] = useState(false)
  const [fuente, setFuente] = useState(null)
  const [archivoRecorte, setArchivoRecorte] = useState(null)
  const [urlPrevia, setUrlPrevia] = useState('')
  const vacio = !item.nombre && !item.descripcion

  useEffect(() => {
    if (!archivoRecorte) {
      setUrlPrevia('')
      return
    }
    const url = URL.createObjectURL(archivoRecorte)
    setUrlPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [archivoRecorte])

  function confirmarRecorte(archivo) {
    setArchivoRecorte(archivo)
    setCropAbierto(false)
    setFuente(null)
    if (enImagen) enImagen(archivo)
  }

  return (
    <div
      className={`rounded-2xl p-px ${
        item.activo === false
          ? 'bg-gradient-to-br from-amber-500/40 via-transparent to-amber-500/20'
          : 'bg-gradient-to-br from-indigo-500/30 via-transparent to-cyan-400/30'
      }`}
    >
      <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-4 sm:p-5">
        {item.activo === false && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
            <EyeOff size={13} /> Oculto (no se ve en el portal)
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">Nombre</span>
              <input
                type="text"
                value={item.nombre}
                onChange={(e) => item.onCambio('nombre', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Descripción
              </span>
              <textarea
                value={item.descripcion}
                onChange={(e) => item.onCambio('descripcion', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">Estado</span>
              <select
                value={item.estado}
                onChange={(e) => item.onCambio('estado', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#101a2e] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                {estados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-300">Imagen</span>
              <div className="flex flex-wrap items-center gap-2">
                {item.imagen_url || urlPrevia ? (
                  <img
                    src={urlPrevia || item.imagen_url}
                    alt="Actual"
                    className="h-16 aspect-video rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-500">Sin imagen</span>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10">
                  <ImagePlus size={15} />
                  Elegir
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const a = e.target.files?.[0]
                      if (a) {
                        setFuente(a)
                        setCropAbierto(true)
                      }
                    }}
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-slate-500">Recomendado: 1280 × 720 (16:9)</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Vista previa
            </p>
            <div
              className={`group overflow-hidden rounded-2xl border border-white/10 ${
                item.activo === false ? 'opacity-50' : ''
              }`}
            >
              <img
                src={urlPrevia || item.imagen_url || 'https://placehold.co/1280x720/1b263b/64748b?text=Proyecto'}
                alt={item.nombre}
                className="w-full aspect-video object-cover"
              />
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-100">
                    {item.nombre || 'Nombre del proyecto'}
                  </h4>
                  <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                    {estados.find((e) => e.id === item.estado)?.nombre}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {item.descripcion || 'Descripción…'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <CropImageModal
          abierto={cropAbierto}
          fuente={fuente}
          aspect={16 / 9}
          recomendacion="1280 × 720 px"
          onCerrar={() => {
            setCropAbierto(false)
            setFuente(null)
          }}
          onListo={confirmarRecorte}
        />
      </div>
    </div>
  )
}

function EditorProyectos() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')
  const [nuevaAbierta, setNuevaAbierta] = useState(false)
  const [nueva, setNueva] = useState({ nombre: '', descripcion: '', estado: 'activo' })
  const [guardando, setGuardando] = useState(false)
  const [pendientes, setPendientes] = useState({})

  async function cargar() {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('estado', { ascending: true })
      .order('orden', { ascending: true })
    if (error) return
    setDatos(data || [])
  }

  useEffect(() => {
    cargar().finally(() => setCargando(false))
  }, [])

  const items =
    filtro === 'todos' ? datos : datos.filter((p) => p.estado === filtro)

  function actualizarItem(id, campo, valor) {
    setDatos((d) => d.map((it) => (it.id === id ? { ...it, [campo]: valor } : it)))
  }

  function mover(indice, delta) {
    const nuevoArr = [...items]
    const destino = indice + delta
    if (destino < 0 || destino >= nuevoArr.length) return
    ;[nuevoArr[indice], nuevoArr[destino]] = [nuevoArr[destino], nuevoArr[indice]]
    const indices = {}
    nuevoArr.forEach((it, i) => (indices[it.id] = i + 1))
    setDatos((d) =>
      d.map((it) => (indices[it.id] ? { ...it, orden: indices[it.id] } : it))
    )
    guardarOrden(indices)
  }

  async function guardarOrden(indices) {
    const resultados = await Promise.all(
      Object.entries(indices).map(([id, orden]) =>
        supabase.from('proyectos').update({ orden }).eq('id', id)
      )
    )
    const fallo = resultados.find((r) => r.error)
    if (fallo) {
      toast.error('No se pudo guardar el orden. Intentalo de nuevo.')
      cargar()
    }
  }

  function marcarImagen(id, archivo) {
    setPendientes((p) => ({ ...p, [id]: archivo }))
  }

  async function guardarUno(it) {
    const pendiente = pendientes[it.id]
    const imagenAnterior = it.imagen_url
    let urlFinal = imagenAnterior
    try {
      if (pendiente) {
        urlFinal = await subirImagen({
          archivo: pendiente,
          carpeta: 'public/proyectos',
        })
      }
    } catch {
      toast.error('No se pudo subir la imagen. Intentalo de nuevo.')
      return
    }
    const { error } = await supabase
      .from('proyectos')
      .update({
        nombre: it.nombre,
        descripcion: it.descripcion,
        estado: it.estado,
        imagen_url: urlFinal,
        activo: it.activo,
      })
      .eq('id', it.id)
    if (error) {
      if (pendiente && urlFinal) await borrarImagen(urlFinal)
      toast.error('No se pudo guardar el proyecto. Intentalo de nuevo.')
      return
    }
    setPendientes((p) => {
      const resto = { ...p }
      delete resto[it.id]
      return resto
    })
    if (urlFinal !== imagenAnterior) {
      actualizarItem(it.id, 'imagen_url', urlFinal)
      await borrarImagen(imagenAnterior)
    }
    toast.success('Proyecto guardado correctamente')
  }

  async function crearNuevo(e) {
    e.preventDefault()
    if (!nueva.nombre) {
      toast.error('El nombre es obligatorio')
      return
    }
    setGuardando(true)
    const grupo = datos.filter((p) => p.estado === nueva.estado)
    const { error } = await supabase.from('proyectos').insert({
      nombre: nueva.nombre,
      descripcion: nueva.descripcion,
      estado: nueva.estado,
      imagen_url: '',
      orden: grupo.length + 1,
      activo: true,
    })
    setGuardando(false)
    if (error) {
      toast.error('No se pudo crear el proyecto. Intentalo de nuevo.')
      return
    }
    toast.success('Proyecto creado correctamente')
    setNueva({ nombre: '', descripcion: '', estado: 'activo' })
    setNuevaAbierta(false)
    cargar()
  }

  async function eliminar(id) {
    const item = datos.find((x) => x.id === id)
    const { error } = await supabase.from('proyectos').delete().eq('id', id)
    if (error) {
      toast.error('No se pudo eliminar el proyecto. Intentalo de nuevo.')
    } else {
      if (item?.imagen_url) {
        await borrarImagen(item.imagen_url)
      }
      toast.success('Proyecto eliminado correctamente')
      cargar()
    }
  }

  function marcarVacio(estado) {
    const grupo = datos.filter((p) => p.estado === estado && p.activo)
    if (grupo.length > 0) return null
    return `De momento, no hay proyectos ${estado === 'en_desarrollo' ? 'en desarrollo' : estado === 'finalizado' ? 'finalizados' : 'en activos'}`
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-white/5 p-1">
          {filtros.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filtro === f.id
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              {f.nombre}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNuevaAbierta((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105"
        >
          <Plus size={16} /> Agregar proyecto
        </button>
      </div>

      {cargando ? (
        <p className="mt-6 text-sm text-slate-400">Cargando…</p>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-slate-400">
            {items.length} proyecto{items.length === 1 ? '' : 's'}
            {filtro !== 'todos'
              ? ` en ${estados.find((e) => e.id === filtro)?.nombre.toLowerCase()}`
              : ' en total'}
          </p>

          {nuevaAbierta && (
            <form
              onSubmit={crearNuevo}
              className="rounded-2xl p-px bg-gradient-to-br from-emerald-500/30 via-transparent to-cyan-400/30"
            >
              <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-4">
                <h4 className="text-sm font-semibold text-slate-100">Nuevo proyecto</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={nueva.nombre}
                    onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
                    disabled={guardando}
                    placeholder="Nombre del proyecto"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <select
                    value={nueva.estado}
                    onChange={(e) => setNueva({ ...nueva, estado: e.target.value })}
                    disabled={guardando}
                    className="rounded-xl border border-white/10 bg-[#101a2e] px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  >
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={nueva.descripcion}
                    onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
                    disabled={guardando}
                    placeholder="Descripción breve"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={guardando}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {guardando ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                  Crear
                </button>
              </div>
            </form>
          )}

          {items.map((it, i) => (
            <div key={it.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  #{it.orden} · {estados.find((e) => e.id === it.estado)?.nombre}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => mover(i, -1)}
                    disabled={filtro === 'todos' || i === 0}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Subir"
                    title="Subir en el orden"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => mover(i, 1)}
                    disabled={filtro === 'todos' || i === items.length - 1}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Bajar"
                    title="Bajar en el orden"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => actualizarItem(it.id, 'activo', !it.activo)}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5"
                    aria-label={it.activo ? 'Ocultar' : 'Mostrar'}
                    title={it.activo ? 'Ocultar (no se ve en el portal)' : 'Mostrar en el portal'}
                  >
                    {it.activo ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => guardarUno(it)}
                    className="rounded-lg p-1.5 text-cyan-300 hover:bg-white/5"
                    aria-label="Guardar cambios"
                    title="Guardar cambios de este proyecto"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => eliminar(it.id)}
                    className="rounded-lg p-1.5 text-rose-300 hover:bg-white/5"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <TarjetaProyecto
                item={{ ...it, onCambio: (c, v) => actualizarItem(it.id, c, v) }}
                enImagen={(a) => marcarImagen(it.id, a)}
              />
            </div>
          ))}

          {filtro !== 'todos' && !items.some((p) => p.activo !== false) && (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-amber-300">
              <FolderKanban size={16} className="shrink-0" />
              En el portal se verá: {marcarVacio(filtro)}.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EditorProyectos
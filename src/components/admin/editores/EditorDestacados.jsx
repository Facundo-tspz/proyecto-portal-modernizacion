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
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { subirImagen } from '../../../lib/storage'
import CropImageModal from '../CropImageModal'

const categorias = [
  { id: 'capacitaciones', tabla: 'capacitaciones', nombre: 'Capacitaciones' },
  { id: 'proyectos', tabla: 'destacados_proyectos', nombre: 'Proyectos' },
  { id: 'noticias', tabla: 'noticias', nombre: 'Noticias' },
]

const MAX_ITEMS = 5

function TarjetaBorrador({ item, enVivo }) {
  const [cropAbierto, setCropAbierto] = useState(false)
  const [fuente, setFuente] = useState(null)
  const [archivoRecorte, setArchivoRecorte] = useState(null)

  useEffect(() => {
    if (archivoRecorte && enVivo) {
      enVivo(archivoRecorte)
        .then(() => {
          setCropAbierto(false)
          setFuente(null)
        })
        .catch(() => toast.error('No se pudo subir la imagen'))
    }
  }, [archivoRecorte, enVivo])

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
              <span className="mb-1 block text-sm font-medium text-slate-300">Título</span>
              <input
                type="text"
                value={item.titulo}
                onChange={(e) => item.onCambio('titulo', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">Leyenda</span>
              <textarea
                value={item.leyenda}
                onChange={(e) => item.onCambio('leyenda', e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Link (opcional)
              </span>
              <input
                type="url"
                value={item.link}
                onChange={(e) => item.onCambio('link', e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </label>
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-300">Imagen</span>
              <div className="flex flex-wrap items-center gap-2">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
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
                src={item.imagen_url || 'https://placehold.co/1280x720/1b263b/64748b?text=Sin+imagen'}
                alt={item.titulo}
                className="w-full aspect-video object-cover"
              />
              <div className="px-4 py-3">
                <h4 className="text-sm font-bold text-slate-100">
                  {item.titulo || 'Título'}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {item.leyenda || 'Leyenda…'}
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
          onListo={setArchivoRecorte}
        />
      </div>
    </div>
  )
}

function EditorDestacados() {
  const [datos, setDatos] = useState(
    categorias.reduce((acc, c) => ({ ...acc, [c.id]: null }), {})
  )
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0].id)
  const [nuevaAbierta, setNuevaAbierta] = useState(false)
  const [nueva, setNueva] = useState({ titulo: '', leyenda: '', link: '', imagen_url: '' })
  const [guardando, setGuardando] = useState(false)

  async function cargarCategoria(cat) {
    const { data, error } = await supabase
      .from(cat.tabla)
      .select('*')
      .order('orden', { ascending: true })
    if (error) return
    setDatos((d) => ({ ...d, [cat.id]: data }))
  }

  useEffect(() => {
    Promise.all(categorias.map((c) => cargarCategoria(c))).finally(() => setCargando(false))
  }, [])

  const catActiva = categorias.find((c) => c.id === categoriaActiva)
  const items = datos[categoriaActiva] || []
  const completo = items.length >= MAX_ITEMS

  function actualizarItem(id, campo, valor) {
    setDatos((d) => ({
      ...d,
      [categoriaActiva]: d[categoriaActiva].map((it) =>
        it.id === id ? { ...it, [campo]: valor } : it
      ),
    }))
  }

  function mover(indice, delta) {
    const nuevoArr = [...items]
    const destino = indice + delta
    if (destino < 0 || destino >= nuevoArr.length) return
    ;[nuevoArr[indice], nuevoArr[destino]] = [nuevoArr[destino], nuevoArr[indice]]
    nuevoArr.forEach((it, i) => (it.orden = i + 1))
    setDatos((d) => ({ ...d, [categoriaActiva]: nuevoArr }))
    guardarOrden(nuevoArr)
  }

  async function guardarOrden(lista) {
    await Promise.all(
      lista.map((it) => supabase.from(catActiva.tabla).update({ orden: it.orden }).eq('id', it.id))
    )
  }

  async function guardarUno(it) {
    const { error } = await supabase
      .from(catActiva.tabla)
      .update({ titulo: it.titulo, leyenda: it.leyenda, link: it.link, imagen_url: it.imagen_url, activo: it.activo })
      .eq('id', it.id)
    if (error) toast.error('No se pudo guardar la tarjeta. Intentalo de nuevo.')
    else toast.success('Tarjeta guardada correctamente')
  }

  async function subirParaItem(id, archivo) {
    const url = await subirImagen({ archivo, carpeta: `public/destacados/${catActiva.id}` })
    actualizarItem(id, 'imagen_url', url)
  }

  async function crearNueva(e) {
    e.preventDefault()
    if (!nueva.titulo) {
      toast.error('El título es obligatorio')
      return
    }
    setGuardando(true)
    const { error } = await supabase
      .from(catActiva.tabla)
      .insert({ titulo: nueva.titulo, leyenda: nueva.leyenda, link: nueva.link, imagen_url: nueva.imagen_url, orden: items.length + 1, activo: true })
    setGuardando(false)
    if (error) {
      toast.error('No se pudo crear la tarjeta. Intentalo de nuevo.')
      return
    }
    toast.success('Tarjeta creada correctamente')
    setNueva({ titulo: '', leyenda: '', link: '', imagen_url: '' })
    setNuevaAbierta(false)
    cargarCategoria(catActiva)
  }

  async function eliminar(id) {
    const { error } = await supabase.from(catActiva.tabla).delete().eq('id', id)
    if (error) {
      toast.error('No se pudo eliminar la tarjeta. Intentalo de nuevo.')
    } else {
      toast.success('Tarjeta eliminada correctamente')
      cargarCategoria(catActiva)
    }
  }

  return (
    <div>
      <div className="inline-flex rounded-xl bg-white/5 p-1">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              categoriaActiva === cat.id
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="mt-6 text-sm text-slate-400">Cargando…</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {items.length} / {MAX_ITEMS} tarjetas en esta categoría
            </p>
            <button
              onClick={() => setNuevaAbierta((v) => !v)}
              disabled={completo}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Plus size={16} /> Agregar tarjeta
            </button>
          </div>

          {completo && (
            <p className="text-xs text-amber-400">
              Se alcanzó el máximo de {MAX_ITEMS} tarjetas para esta categoría.
            </p>
          )}

          {nuevaAbierta && (
            <form
              onSubmit={crearNueva}
              className="rounded-2xl p-px bg-gradient-to-br from-emerald-500/30 via-transparent to-cyan-400/30"
            >
              <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-4">
                <h4 className="text-sm font-semibold text-slate-100">Nueva tarjeta</h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={nueva.titulo}
                    onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
                    placeholder="Título"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                  <input
                    type="url"
                    value={nueva.link}
                    onChange={(e) => setNueva({ ...nueva, link: e.target.value })}
                    placeholder="Link (opcional)"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                  <textarea
                    value={nueva.leyenda}
                    onChange={(e) => setNueva({ ...nueva, leyenda: e.target.value })}
                    placeholder="Leyenda"
                    rows={2}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none sm:col-span-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={guardando}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
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
                <span className="text-xs text-slate-500">#{it.orden}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Subir"
                    title="Subir en el orden"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => mover(i, 1)}
                    disabled={i === items.length - 1}
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
                    title="Guardar cambios de esta tarjeta"
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
              <TarjetaBorrador
                item={{ ...it, onCambio: (c, v) => actualizarItem(it.id, c, v) }}
                enVivo={(a) => subirParaItem(it.id, a)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EditorDestacados
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FileText,
  CalendarDays,
  Newspaper,
  Globe,
  Link2,
  Share2,
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

const opcionesIcono = [
  { id: 'file-text', nombre: 'Documento', Icono: FileText },
  { id: 'calendar-days', nombre: 'Calendario', Icono: CalendarDays },
  { id: 'newspaper', nombre: 'Periódico', Icono: Newspaper },
  { id: 'globe', nombre: 'Globo', Icono: Globe },
  { id: 'link2', nombre: 'Enlace', Icono: Link2 },
  { id: 'share2', nombre: 'Compartir', Icono: Share2 },
]

function EditorAccesos() {
  const [items, setItems] = useState([])
  const [nuevaAbierta, setNuevaAbierta] = useState(false)
  const [nueva, setNueva] = useState({ icono: 'file-text', titulo: '', leyenda: '', link: '' })
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    const { data, error } = await supabase
      .from('tarjetas_enlace')
      .select('*')
      .order('orden', { ascending: true })
    if (!error) setItems(data || [])
  }

  useEffect(() => {
    cargar()
  }, [])

  function actualizar(id, campo, valor) {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, [campo]: valor } : it)))
  }

  function mover(indice, delta) {
    const nuevoArr = [...items]
    const destino = indice + delta
    if (destino < 0 || destino >= nuevoArr.length) return
    ;[nuevoArr[indice], nuevoArr[destino]] = [nuevoArr[destino], nuevoArr[indice]]
    nuevoArr.forEach((it, i) => (it.orden = i + 1))
    setItems(nuevoArr)
    nuevoArr.forEach((it) =>
      supabase.from('tarjetas_enlace').update({ orden: it.orden }).eq('id', it.id)
    )
  }

  async function guardarUno(it) {
    const { error } = await supabase
      .from('tarjetas_enlace')
      .update({ icono: it.icono, titulo: it.titulo, leyenda: it.leyenda, link: it.link, activo: it.activo })
      .eq('id', it.id)
    if (error) toast.error('No se pudo guardar el acceso. Intentalo de nuevo.')
    else toast.success('Acceso guardado correctamente')
  }

  async function crear(e) {
    e.preventDefault()
    if (!nueva.titulo) {
      toast.error('El título es obligatorio')
      return
    }
    setGuardando(true)
    const { error } = await supabase.from('tarjetas_enlace').insert({
      icono: nueva.icono,
      titulo: nueva.titulo,
      leyenda: nueva.leyenda,
      link: nueva.link,
      orden: items.length + 1,
      activo: true,
    })
    setGuardando(false)
    if (error) {
      toast.error('No se pudo crear el acceso. Intentalo de nuevo.')
      return
    }
    toast.success('Acceso creado correctamente')
    setNueva({ icono: 'file-text', titulo: '', leyenda: '', link: '' })
    setNuevaAbierta(false)
    cargar()
  }

  async function eliminar(id) {
    const { error } = await supabase.from('tarjetas_enlace').delete().eq('id', id)
    if (error) toast.error('No se pudo eliminar el acceso. Intentalo de nuevo.')
    else {
      toast.success('Acceso eliminado correctamente')
      cargar()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{items.length} accesos</p>
        <button
          onClick={() => setNuevaAbierta((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105"
        >
          <Plus size={16} /> Agregar acceso
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {items.map((it, i) => (
          <div
            key={it.id}
            className="rounded-2xl p-px bg-gradient-to-br from-indigo-500/30 via-transparent to-cyan-400/30"
          >
            <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">#{it.orden}</span>
                  <select
                    value={it.icono}
                    onChange={(e) => actualizar(it.id, 'icono', e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#101a2e] px-2 py-1 text-xs text-slate-200"
                  >
                    {opcionesIcono.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Subir"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => mover(i, 1)}
                    disabled={i === items.length - 1}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => guardarUno(it)}
                    className="rounded-lg p-1.5 text-cyan-300 hover:bg-white/5"
                    aria-label="Guardar"
                    title="Guardar cambios"
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

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={it.titulo}
                  onChange={(e) => actualizar(it.id, 'titulo', e.target.value)}
                  placeholder="Título"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                <input
                  type="url"
                  value={it.link}
                  onChange={(e) => actualizar(it.id, 'link', e.target.value)}
                  placeholder="Link"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={it.activo}
                    onChange={(e) => actualizar(it.id, 'activo', e.target.checked)}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Activo
                </label>
                <textarea
                  value={it.leyenda}
                  onChange={(e) => actualizar(it.id, 'leyenda', e.target.value)}
                  placeholder="Leyenda"
                  rows={2}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none sm:col-span-3"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {nuevaAbierta && (
        <form
          onSubmit={crear}
          className="mt-4 rounded-2xl p-px bg-gradient-to-br from-emerald-500/30 via-transparent to-cyan-400/30"
        >
          <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-4">
            <h4 className="text-sm font-semibold text-slate-100">Nuevo acceso</h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={nueva.icono}
                onChange={(e) => setNueva({ ...nueva, icono: e.target.value })}
                className="rounded-xl border border-white/10 bg-[#101a2e] px-3 py-2 text-sm text-slate-100"
              >
                {opcionesIcono.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={nueva.titulo}
                onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
                placeholder="Título"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
              />
              <input
                type="url"
                value={nueva.link}
                onChange={(e) => setNueva({ ...nueva, link: e.target.value })}
                placeholder="Link"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
              />
              <textarea
                value={nueva.leyenda}
                onChange={(e) => setNueva({ ...nueva, leyenda: e.target.value })}
                placeholder="Leyenda"
                rows={2}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 sm:col-span-3"
              />
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
            >
              {guardando ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Crear acceso
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default EditorAccesos
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Save, ImagePlus, RefreshCw } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { subirImagen, borrarImagen } from '../../../lib/storage'
import CropImageModal from '../CropImageModal'

function EditorBanner() {
  const [form, setForm] = useState({ activo: true, texto: '', link: '', imagen_url: '' })
  const [guardando, setGuardando] = useState(false)
  const [cropAbierto, setCropAbierto] = useState(false)
  const [archivoRecorte, setArchivoRecorte] = useState(null)
  const [fuenteCrop, setFuenteCrop] = useState(null)
  const [urlPrevia, setUrlPrevia] = useState('')
  const imagenOriginalRef = useRef('')

  useEffect(() => {
    let activo = true
    supabase
      .from('avisos')
      .select('id, activo, texto, link, imagen_url')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data && activo) {
          imagenOriginalRef.current = data.imagen_url || ''
          setForm({
            id: data.id,
            activo: data.activo,
            texto: data.texto || '',
            link: data.link || '',
            imagen_url: data.imagen_url || '',
          })
        }
      })
    return () => {
      activo = false
    }
  }, [])

  function elegirImagen(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setFuenteCrop(archivo)
    setCropAbierto(true)
  }

  function confirmarRecorte(archivo) {
    setArchivoRecorte(archivo)
    setCropAbierto(false)
    setFuenteCrop(null)
  }

  useEffect(() => {
    if (!archivoRecorte) {
      setUrlPrevia('')
      return
    }
    const url = URL.createObjectURL(archivoRecorte)
    setUrlPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [archivoRecorte])

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    let imagenSubida = null
    try {
      let urlFinal = form.imagen_url
      if (archivoRecorte) {
        urlFinal = await subirImagen({ archivo: archivoRecorte, carpeta: 'public/banner' })
        imagenSubida = urlFinal
      }
      const fila = {
        activo: form.activo,
        texto: form.texto,
        link: form.link,
        imagen_url: urlFinal,
      }
      const imagenAnterior = imagenOriginalRef.current
      let idFinal = form.id
      let error
      if (form.id) {
        ;({ error } = await supabase.from('avisos').update(fila).eq('id', form.id))
      } else {
        const insertado = await supabase
          .from('avisos')
          .insert(fila)
          .select('id')
          .single()
        ;({ error } = insertado)
        if (insertado.data) idFinal = insertado.data.id
      }
      if (error) {
        if (imagenSubida) await borrarImagen(imagenSubida)
        toast.error('No se pudo guardar el banner. Intentalo de nuevo.')
        return
      }
      imagenOriginalRef.current = urlFinal
      setForm((f) => ({ ...f, ...fila, id: idFinal }))
      if (imagenAnterior && imagenAnterior !== urlFinal) {
        await borrarImagen(imagenAnterior)
      }
      toast.success('Modificación de banner exitosa')
    } catch {
      if (imagenSubida) await borrarImagen(imagenSubida)
      toast.error('No se pudo guardar el banner. Intentalo de nuevo.')
    } finally {
      setGuardando(false)
      setArchivoRecorte(null)
    }
  }

  const imagenPreview = urlPrevia || form.imagen_url
  const vistaPrevia = (
    <div className="relative overflow-hidden rounded-xl border border-white/10">
      {imagenPreview ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imagenPreview})` }}
          />
          <div className="absolute inset-0 bg-[#0b1220]/60" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-500" />
      )}
      <div className="relative flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/25 text-cyan-300">
          <ImagePlus size={18} />
        </div>
        <p className="flex-1 text-sm font-medium text-slate-100">
          {form.texto || 'Texto del banner…'}
        </p>
        {form.link && <span className="text-xs font-semibold text-cyan-300">Ver más →</span>}
      </div>
    </div>
  )

  return (
    <form onSubmit={guardar} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            className="h-4 w-4 accent-cyan-400"
          />
          <span className="text-sm text-slate-300">Banner activo</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-300">Texto</span>
          <textarea
            value={form.texto}
            onChange={(e) => setForm({ ...form, texto: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Link (opcional)
          </span>
          <input
            type="url"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="https://…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
        </label>

        <div>
          <span className="mb-1 block text-sm font-medium text-slate-300">Imagen de fondo</span>
          <div className="flex flex-wrap items-center gap-2">
            {form.imagen_url && (
              <img
                src={form.imagen_url}
                alt="Banner actual"
                className="h-20 w-40 rounded-lg object-cover"
              />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10">
              <ImagePlus size={16} />
              Elegir imagen
              <input type="file" accept="image/*" onChange={elegirImagen} className="hidden" />
            </label>
            {form.imagen_url && (
              <button
                type="button"
                onClick={() => setForm({ ...form, imagen_url: '' })}
                className="rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-white/5"
              >
                Quitar
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Recomendado: 1600 × 400 · se recorta automáticamente</p>
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60"
        >
          {guardando ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Guardar banner
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Vista previa
        </p>
        {vistaPrevia}
      </div>

      <CropImageModal
        abierto={cropAbierto}
        fuente={fuenteCrop}
        aspect={1600 / 400}
        recomendacion="1600 × 400 px"
        onCerrar={() => {
          setCropAbierto(false)
          setFuenteCrop(null)
        }}
        onListo={confirmarRecorte}
      />
    </form>
  )
}

export default EditorBanner
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Upload } from 'lucide-react'

function centrarAutom(defaultAspect, ancho, alto) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      defaultAspect,
      ancho,
      alto
    ),
    ancho,
    alto
  )
}

async function obtenerRecorte(imagen, recorte) {
  if (!imagen || !recorte?.width || !recorte?.height) return null
  const nw = imagen.naturalWidth
  const nh = imagen.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = Math.round((recorte.width / 100) * nw)
  canvas.height = Math.round((recorte.height / 100) * nh)
  const contexto = canvas.getContext('2d')
  if (!contexto) return null
  const xPx = (recorte.x || 0) / 100
  const yPx = (recorte.y || 0) / 100
  const wPx = recorte.width / 100
  const hPx = recorte.height / 100
  contexto.drawImage(
    imagen,
    xPx * nw,
    yPx * nh,
    wPx * nw,
    hPx * nh,
    0,
    0,
    canvas.width,
    canvas.height
  )
  return await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
}

function CropImageModal({ abierto, fuente, aspect, recomendacion, onCerrar, onListo }) {
  const [imagen, setImagen] = useState(null)
  const [recorte, setRecorte] = useState(null)
  const [recorteFinal, setRecorteFinal] = useState()
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const imageRef = useRef(null)

  useEffect(() => {
    if (abierto && fuente) {
      const img = new Image()
      img.onload = () => {
        setImagen(img)
        setRecorte(centrarAutom(aspect, img.width, img.height))
        setError('')
      }
      img.src = URL.createObjectURL instanceof Function && fuente instanceof Blob
        ? URL.createObjectURL(fuente)
        : fuente
    }
  }, [abierto, fuente, aspect])

  useEffect(() => {
    if (!abierto) {
      setImagen(null)
      setRecorte(null)
      setRecorteFinal(undefined)
      setSubiendo(false)
      setError('')
    }
  }, [abierto])

  const enImagenCargada = useCallback(
    (e) => {
      const { width, height } = e.currentTarget
      setRecorte(centrarAutom(aspect, width, height))
    },
    [aspect]
  )

  async function confirmar() {
    if (!imageRef.current || !recorte?.width || !recorte?.height) return
    setSubiendo(true)
    setError('')
    try {
      const blob = await obtenerRecorte(imageRef.current, recorte)
      if (!blob) throw new Error('No se pudo procesar la imagen')
      const archivo = new File([blob], `recorte-${Date.now()}.webp`, { type: 'image/webp' })
      onListo(archivo)
    } catch {
      setError('No se pudo procesar la imagen. Probá con otro archivo.')
    } finally {
      setSubiendo(false)
    }
  }

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl p-px bg-gradient-to-br from-indigo-500/50 via-transparent to-cyan-400/50">
        <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Ajustar imagen</h3>
            <button
              onClick={onCerrar}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {recomendacion && (
            <p className="mt-1 text-xs text-slate-400">Tamaño recomendado: {recomendacion}</p>
          )}

          <div className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-white/10 bg-black/30">
            {imagen && (
              <ReactCrop
                crop={recorte}
                onChange={(_, pup) => setRecorte(pup)}
                onComplete={(c) => setRecorteFinal(c)}
                aspect={aspect}
                ruleOfThirds
                className="[&_.ReactCrop__crop-selection]:border-cyan-400"
              >
                <img ref={imageRef} src={imagen.src} onLoad={enImagenCargada} alt="Recorte" />
              </ReactCrop>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onCerrar}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={subiendo || !recorteFinal?.width}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60"
            >
              {subiendo ? (
                'Procesando…'
              ) : (
                <>
                  <Upload size={16} /> Confirmar y subir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CropImageModal
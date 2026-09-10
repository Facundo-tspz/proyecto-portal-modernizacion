import { supabase } from './supabase'

const BUCKET = 'modernizacion'

export async function subirImagen({ archivo, carpeta }) {
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const ruta = `${carpeta}/${nombre}`

  const { error } = await supabase.storage.from(BUCKET).upload(ruta, archivo, {
    contentType: 'image/webp',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta)
  return data.publicUrl
}

export function rutaDesdeUrl(url) {
  if (!url) return null
  const marcador = `/object/public/${BUCKET}/`
  const indice = url.indexOf(marcador)
  if (indice === -1) return null
  return url.slice(indice + marcador.length)
}

export async function borrarImagen(url) {
  const ruta = rutaDesdeUrl(url)
  if (!ruta) return
  try {
    await supabase.storage.from(BUCKET).remove([ruta])
  } catch {
    // El borrado no debe romper el guardado principal
  }
}
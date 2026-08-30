import { supabase } from './supabase'

export async function subirImagen({ archivo, carpeta }) {
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const ruta = `${carpeta}/${nombre}`

  const { error } = await supabase.storage.from('modernizacion').upload(ruta, archivo, {
    contentType: 'image/webp',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from('modernizacion').getPublicUrl(ruta)
  return data.publicUrl
}
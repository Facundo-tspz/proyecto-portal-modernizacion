import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env. ' +
      'Copiá .env.example a .env y completá los valores (Supabase -> Settings -> API).'
  )
}

export const supabase = createClient(url, anonKey)

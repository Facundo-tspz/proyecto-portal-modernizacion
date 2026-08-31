import { createClient } from '@supabase/supabase-js'

const url =
  import.meta.env.VITE_SUPABASE_URL || 'https://tzrtirfrmitxbknibpgn.supabase.co'
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_DVC06VR10XCWK7hKzToH2w_w_GBwp3Q'

export const supabase = createClient(url, anonKey)

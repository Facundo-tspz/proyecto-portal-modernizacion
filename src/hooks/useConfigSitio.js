import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useConfigSitio() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    let activo = true
    supabase
      .from('config_sitio')
      .select('clave, valor')
      .then(({ data, error }) => {
        if (error || !data) return
        if (!activo) return
        const objeto = {}
        data.forEach((fila) => {
          objeto[fila.clave] = fila.valor
        })
        setConfig(objeto)
      })
    return () => {
      activo = false
    }
  }, [])

  return config
}

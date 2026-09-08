import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ThemeContext = createContext(null)

function temaInicial() {
  const guardado = localStorage.getItem('tema')
  if (guardado) return guardado
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'oscuro'
    : 'claro'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    const html = document.documentElement
    localStorage.setItem('tema', tema)
    if (tema === 'oscuro') {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'modernizacion-dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'modernizacion')
    }
  }, [tema])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase
          .from('perfiles')
          .select('tema')
          .eq('id', data.session.user.id)
          .single()
          .then(({ data: perfil }) => {
            if (perfil?.tema === 'claro' || perfil?.tema === 'oscuro') {
              setTema(perfil.tema)
            } else if (perfil?.tema) {
              localStorage.removeItem('tema')
            }
          })
      }
    })
  }, [])

  function alternarTema() {
    setTema((temaActual) => {
      const proximo = temaActual === 'oscuro' ? 'claro' : 'oscuro'
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase.rpc('cambiar_mi_tema', { p_tema: proximo })
        }
      })
      return proximo
    })
  }

  return (
    <ThemeContext.Provider value={{ tema, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const contexto = useContext(ThemeContext)
  if (!contexto) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return contexto
}

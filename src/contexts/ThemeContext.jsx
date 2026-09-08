import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem('tema')
    if (guardado) return guardado
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'oscuro'
      : 'claro'
  })

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

  const alternarTema = () =>
    setTema((temaActual) => (temaActual === 'oscuro' ? 'claro' : 'oscuro'))

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

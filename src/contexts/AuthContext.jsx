import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        cargarPerfil(data.session.user)
      } else {
        setCargando(false)
      }
    })

    const { data: subscriptor } = supabase.auth.onAuthStateChange((_evento, sesionActual) => {
      if (sesionActual?.user) {
        setSesion(sesionActual)
        cargarPerfil(sesionActual.user)
      } else {
        setSesion(null)
        setUsuario(null)
        setCargando(false)
      }
    })

    return () => subscriptor?.subscription?.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cargarPerfil(user) {
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, rol, activo')
      .eq('id', user.id)
      .single()

    setSesion({ user })
    setUsuario({ ...user, perfil: data })
    setCargando(false)
  }

  async function iniciarSesion(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ sesion, usuario, cargando, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return contexto
}

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const CLAVE_ACTIVIDAD = 'modernizacion_ultima_actividad'
const DIAS_MAX_INACTIVIDAD = 7
const MS_INACTIVIDAD = DIAS_MAX_INACTIVIDAD * 24 * 60 * 60 * 1000
const LATIDO_MS = 60 * 1000
const REGISTRO_EVENTOS_MS = 60 * 1000

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const sesionRef = useRef(null)

  useEffect(() => {
    async function inicializar() {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        sesionRef.current = true
        const ultimaActividad = Number(localStorage.getItem(CLAVE_ACTIVIDAD) || 0)
        const inactivo = ultimaActividad > 0 && Date.now() - ultimaActividad > MS_INACTIVIDAD

        if (inactivo) {
          localStorage.removeItem(CLAVE_ACTIVIDAD)
          sesionRef.current = false
          await supabase.auth.signOut()
          setSesion(null)
          setUsuario(null)
          setCargando(false)
          return
        }

        marcarActividad()
        cargarPerfil(data.session.user)
      } else {
        setCargando(false)
      }
    }

    inicializar()

    const { data: subscriptor } = supabase.auth.onAuthStateChange((_evento, sesionActual) => {
      if (sesionActual?.user) {
        sesionRef.current = true
        marcarActividad()
        setSesion(sesionActual)
        cargarPerfil(sesionActual.user)
      } else {
        sesionRef.current = false
        setSesion(null)
        setUsuario(null)
        setCargando(false)
      }
    })

    const eventos = ['mousemove', 'keydown', 'click', 'touchstart']
    let ultimoRegistro = 0
    function registrarActividad() {
      const ahora = Date.now()
      if (ahora - ultimoRegistro < REGISTRO_EVENTOS_MS) return
      ultimoRegistro = ahora
      marcarActividad()
    }
    eventos.forEach((evento) => window.addEventListener(evento, registrarActividad))

    let intervaloLatido = null
    intervaloLatido = setInterval(() => {
      marcarActividad()
      if (sesionRef.current) {
        supabase.rpc('registrar_ultimo_acceso')
      }
    }, LATIDO_MS)

    return () => {
      subscriptor?.subscription?.unsubscribe()
      eventos.forEach((evento) => window.removeEventListener(evento, registrarActividad))
      if (intervaloLatido) clearInterval(intervaloLatido)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function marcarActividad() {
    localStorage.setItem(CLAVE_ACTIVIDAD, String(Date.now()))
  }

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
    const resultado = await supabase.auth.signInWithPassword({ email, password })
    if (!resultado.error) {
      marcarActividad()
    }
    return resultado
  }

  async function cerrarSesion() {
    localStorage.removeItem(CLAVE_ACTIVIDAD)
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

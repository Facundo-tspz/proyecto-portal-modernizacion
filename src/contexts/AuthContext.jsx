import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const CLAVE_ACTIVIDAD = 'modernizacion_ultima_actividad'
const DIAS_MAX_INACTIVIDAD = 7
const MS_INACTIVIDAD = DIAS_MAX_INACTIVIDAD * 24 * 60 * 60 * 1000
const LATIDO_MS = 60 * 1000
const REGISTRO_EVENTOS_MS = 60 * 1000
const ROLES_VALIDOS = ['admin', 'tecnico', 'editor']

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const sesionRef = useRef(null)
  const usuarioRef = useRef(false)

  useEffect(() => {
    async function inicializar() {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        sesionRef.current = true
        usuarioRef.current = false
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
        if (_evento === 'SIGNED_IN') return
        if (!usuarioRef.current) {
          setCargando(true)
          cargarPerfil(sesionActual.user)
        }
      } else {
        sesionRef.current = false
        usuarioRef.current = false
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
        supabase.rpc('registrar_ultimo_acceso').then(() => {})
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

  async function cargarPerfil(user, { desloguearSiInvalido = true } = {}) {
    let perfil = null
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('nombre, rol, activo')
        .eq('id', user.id)
        .maybeSingle()
      if (error) {
        if (error.code === 'PGRST116') {
          perfil = null
        } else {
          return null
        }
      } else {
        perfil = data
      }
    } catch {
      return null
    }

    if (!perfil || perfil.activo !== true || !ROLES_VALIDOS.includes(perfil.rol)) {
      if (!desloguearSiInvalido) return null
      sesionRef.current = false
      await supabase.auth.signOut()
      setSesion(null)
      setUsuario(null)
      setCargando(false)
      return null
    }

    usuarioRef.current = true
    setSesion({ user })
    setUsuario({ ...user, perfil })
    setCargando(false)
    return perfil
  }

  async function iniciarSesion(email, password) {
    const emailNormalizado = email.trim().toLowerCase()

    try {
      const { data: bloqueo } = await supabase.rpc('verificar_bloqueo_login', {
        p_email: emailNormalizado,
      })
      if (bloqueo?.bloqueado) {
        const err = new Error(
          `Demasiados intentos fallidos. Volvé a intentar en ${bloqueo.minutos_restantes} min.`
        )
        err.code = 'bloqueado'
        return { error: err }
      }
    } catch {
      // si la verificación falla por red, se permite el intento
    }

    const resultado = await supabase.auth.signInWithPassword({ email, password })
    if (resultado.error) {
      supabase
        .rpc('registrar_intento_login', { p_email: emailNormalizado, p_exitoso: false })
        .then(() => {})
      return resultado
    }
    supabase
      .rpc('registrar_intento_login', { p_email: emailNormalizado, p_exitoso: true })
      .then(() => {})
    marcarActividad()
    const perfil = await cargarPerfil(resultado.data.user)
    if (!perfil) {
      const err = new Error('Tu cuenta no está habilitada para acceder al panel.')
      err.cuentaInhabilitada = true
      return { error: err }
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

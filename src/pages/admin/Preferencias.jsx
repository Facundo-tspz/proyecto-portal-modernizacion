import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Moon, Sun, User, KeyRound, ShieldAlert, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

function Seccion({ titulo, descripcion, children }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/30 via-transparent to-panel-acento-2/30">
      <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-5">
        <h2 className="text-sm font-semibold text-panel-texto">{titulo}</h2>
        {descripcion && <p className="mt-1 text-xs text-panel-texto-suave">{descripcion}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function ModalNuevaContrasena({ usuario, cerrar, onConfirmar }) {
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setEnviando(true)
    const { error } = await supabase.rpc('reiniciar_contrasena_usuario', {
      p_user_id: usuario.id,
      p_nueva_contrasena: password,
    })
    setEnviando(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(`Contraseña de ${usuario.nombre} reiniciada`)
    cerrar()
    onConfirmar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/50 via-transparent to-panel-acento-2/50">
        <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-6">
          <h3 className="text-base font-bold text-panel-texto">
            Reiniciar contraseña
          </h3>
          <p className="mt-2 text-sm text-panel-texto-suave">
            Nueva contraseña para <span className="font-semibold text-panel-texto">{usuario.nombre}</span>.
            El usuario deberá volver a iniciar sesión.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="mt-4 w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={cerrar}
              className="rounded-xl bg-panel-hover px-4 py-2 text-sm font-medium text-panel-texto transition-colors hover:bg-panel-hover"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={enviando}
              className="rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
            >
              {enviando ? 'Reiniciando…' : 'Reiniciar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Preferencias() {
  const { usuario } = useAuth()
  const { tema, alternarTema } = useTheme()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nombre, setNombre] = useState(usuario?.perfil?.nombre || '')
  const [guardandoNombre, setGuardandoNombre] = useState(false)
  const [confirmarTodo, setConfirmarTodo] = useState(false)
  const [usuarioClave, setUsuarioClave] = useState(null)

  useEffect(() => {
    setNombre(usuario?.perfil?.nombre || '')
  }, [usuario])

  async function cargarUsuarios() {
    setCargando(true)
    const { data, error } = await supabase.rpc('listar_usuarios')
    if (error) {
      toast.error('No se pudieron cargar los usuarios')
    } else {
      setUsuarios(data || [])
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function guardarNombre(evento) {
    evento.preventDefault()
    if (!nombre.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }
    setGuardandoNombre(true)
    const { error } = await supabase.rpc('actualizar_mi_nombre', { p_nombre: nombre.trim() })
    setGuardandoNombre(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Nombre actualizado')
  }

  async function revocarSesion(idUsuario) {
    const { error } = await supabase.rpc('revocar_sesiones_usuario', {
      p_user_id: idUsuario,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Sesiones revocadas')
  }

  async function revocarTodas() {
    const { error } = await supabase.rpc('revocar_sesiones_todos')
    setConfirmarTodo(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Sesiones de todos los usuarios revocadas')
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-panel-texto">Preferencias</h1>
      <p className="mt-1 text-sm text-panel-texto-suave">
        Ajustes personales y administración de accesos
      </p>

      <Seccion titulo="Tema" descripcion="Tu preferencia se guarda en tu cuenta y se aplica en cualquier dispositivo.">
        <div className="flex items-center gap-3">
          <button
            onClick={alternarTema}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105"
          >
            {tema === 'oscuro' ? <Sun size={16} /> : <Moon size={16} />}
            Cambiar a {tema === 'oscuro' ? 'claro' : 'oscuro'}
          </button>
          <span className="text-sm capitalize text-panel-texto-suave">
            Tema actual: {tema}
          </span>
        </div>
      </Seccion>

      <Seccion titulo="Mi perfil" descripcion="Tu nombre se muestra en el panel. El email y el rol son informativos.">
        <form onSubmit={guardarNombre} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-panel-texto">Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={guardandoNombre}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60"
            >
              <User size={16} />
              {guardandoNombre ? 'Guardando…' : 'Guardar nombre'}
            </button>
          </div>
          <div className="rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto sm:col-span-2">
            <span className="mr-2 font-medium text-panel-texto-suave">Email:</span>
            {usuario?.email}
            <span className="mx-3 text-panel-texto-suave">|</span>
            <span className="mr-2 font-medium text-panel-texto-suave">Rol:</span>
            <span className="capitalize">{usuario?.perfil?.rol}</span>
          </div>
        </form>
      </Seccion>

      <Seccion
        titulo="Sesiones de usuarios"
        descripcion="Revocá la sesión de un usuario (deberá volver a iniciar sesión) o reiniciá su contraseña si la olvidó. Todas estas acciones son solo para administradores."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={cargarUsuarios}
            className="inline-flex items-center gap-2 rounded-xl border border-panel-borde px-3 py-2 text-xs font-semibold text-panel-texto transition-colors hover:bg-panel-hover"
          >
            <RefreshCw size={14} />
            Recargar
          </button>
          <button
            onClick={() => setConfirmarTodo(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow transition-transform hover:scale-105"
          >
            <ShieldAlert size={14} />
            Revocar todas las sesiones
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-panel-borde text-panel-texto-suave">
                <th className="px-3 py-2 font-medium">Usuario</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-panel-texto-suave">
                    Cargando…
                  </td>
                </tr>
              )}
              {!cargando && usuarios.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-panel-texto-suave">
                    No hay usuarios
                  </td>
                </tr>
              )}
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-panel-borde text-panel-texto last:border-0">
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{u.nombre}</p>
                    <p className="text-xs text-panel-texto-suave">{u.email}</p>
                  </td>
                  <td className="px-3 py-2.5 capitalize">{u.rol}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => revocarSesion(u.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-panel-acento-texto transition-colors hover:bg-panel-hover"
                      >
                        Revocar sesión
                      </button>
                      <button
                        onClick={() => setUsuarioClave(u)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-panel-hover"
                      >
                        <KeyRound size={12} />
                        Reiniciar contraseña
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Seccion>

      {usuarioClave && (
        <ModalNuevaContrasena
          usuario={usuarioClave}
          cerrar={() => setUsuarioClave(null)}
          onConfirmar={cargarUsuarios}
        />
      )}

      {confirmarTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl p-px bg-gradient-to-br from-rose-500/40 via-transparent to-orange-400/40">
            <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-6">
              <h3 className="text-base font-bold text-panel-texto">Revocar todas las sesiones</h3>
              <p className="mt-2 text-sm text-panel-texto-suave">
                Todos los usuarios deberán volver a iniciar sesión. Tu sesión actual no se verá
                afectada.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmarTodo(false)}
                  className="rounded-xl bg-panel-hover px-4 py-2 text-sm font-medium text-panel-texto transition-colors hover:bg-panel-hover"
                >
                  Cancelar
                </button>
                <button
                  onClick={revocarTodas}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
                >
                  Confirmar revocación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Preferencias
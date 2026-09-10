import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User, KeyRound, ShieldAlert, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function Seccion({ titulo, descripcion, children }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl p-px bg-gradient-to-br from-indigo-500/30 via-transparent to-cyan-400/30">
      <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-5">
        <h2 className="text-sm font-semibold text-slate-100">{titulo}</h2>
        {descripcion && <p className="mt-1 text-xs text-slate-400">{descripcion}</p>}
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
      toast.error('No se pudo reiniciar la contraseña. Intentá de nuevo.')
      return
    }
    toast.success(`Contraseña de ${usuario.nombre} reiniciada`)
    cerrar()
    onConfirmar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl p-px bg-gradient-to-br from-indigo-500/50 via-transparent to-cyan-400/50">
        <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-6">
          <h3 className="text-base font-bold text-slate-100">
            Reiniciar contraseña
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Nueva contraseña para <span className="font-semibold text-slate-200">{usuario.nombre}</span>.
            El usuario deberá volver a iniciar sesión.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={cerrar}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={enviando}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
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
      toast.error('No se pudo actualizar el nombre. Intentá de nuevo.')
      return
    }
    toast.success('Nombre actualizado')
  }

  async function revocarSesion(idUsuario) {
    const { error } = await supabase.rpc('revocar_sesiones_usuario', {
      p_user_id: idUsuario,
    })
    if (error) {
      toast.error('No se pudieron revocar las sesiones. Intentá de nuevo.')
      return
    }
    toast.success('Sesiones revocadas')
  }

  async function revocarTodas() {
    const { error } = await supabase.rpc('revocar_sesiones_todos')
    setConfirmarTodo(false)
    if (error) {
      toast.error('No se pudieron revocar todas las sesiones. Intentá de nuevo.')
      return
    }
    toast.success('Sesiones de todos los usuarios revocadas')
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-100">Preferencias</h1>
      <p className="mt-1 text-sm text-slate-400">
        Ajustes personales y administración de accesos
      </p>

      <Seccion titulo="Mi perfil" descripcion="Tu nombre se muestra en el panel. El email y el rol son informativos.">
        <form onSubmit={guardarNombre} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-300">Nombre</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={guardandoNombre}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60"
            >
              <User size={16} />
              {guardandoNombre ? 'Guardando…' : 'Guardar nombre'}
            </button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 sm:col-span-2">
            <span className="mr-2 font-medium text-slate-400">Email:</span>
            {usuario?.email}
            <span className="mx-3 text-slate-600">|</span>
            <span className="mr-2 font-medium text-slate-400">Rol:</span>
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
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/5"
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
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-3 py-2 font-medium">Usuario</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                    Cargando…
                  </td>
                </tr>
              )}
              {!cargando && usuarios.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                    No hay usuarios
                  </td>
                </tr>
              )}
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-white/5 text-slate-200 last:border-0">
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{u.nombre}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-3 py-2.5 capitalize">{u.rol}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => revocarSesion(u.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-cyan-300 transition-colors hover:bg-white/5"
                      >
                        Revocar sesión
                      </button>
                      <button
                        onClick={() => setUsuarioClave(u)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-white/5"
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
            <div className="rounded-[calc(1rem-1px)] bg-[#101a2e] p-6">
              <h3 className="text-base font-bold text-slate-100">Revocar todas las sesiones</h3>
              <p className="mt-2 text-sm text-slate-400">
                Todos los usuarios deberán volver a iniciar sesión. Tu sesión actual no se verá
                afectada.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirmarTodo(false)}
                  className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
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
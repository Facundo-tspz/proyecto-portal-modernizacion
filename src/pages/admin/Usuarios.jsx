import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus, RefreshCw, ShieldCheck, ArrowLeft, Wifi } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const roles = ['admin', 'tecnico', 'editor']
const MINUTOS_EN_LINEA = 5

function formatoTiempoRelativo(fecha) {
  if (!fecha) return '—'
  const milis = Date.now() - new Date(fecha).getTime()
  if (milis < 60 * 1000) return 'ahora'
  const minutos = Math.floor(milis / (60 * 1000))
  if (minutos < 60) return `${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `${dias}d`
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function ModalConfirmacion({ abierto, titulo, mensaje, confirmar, cancelar }) {
  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/50 via-transparent to-panel-acento-2/50">
        <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-6">
          <h3 className="text-base font-bold text-panel-texto">{titulo}</h3>
          <p className="mt-2 text-sm text-panel-texto-suave">{mensaje}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={cancelar}
              className="rounded-xl bg-panel-hover px-4 py-2 text-sm font-medium text-panel-texto transition-colors hover:bg-panel-hover"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              className="rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Usuarios() {
  const [searchParams, setSearchParams] = useSearchParams()
  const seccion = searchParams.get('seccion') || 'lista'
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [nuevo, setNuevo] = useState({ email: '', nombre: '', password: '', rol: 'editor' })
  const [enviando, setEnviando] = useState(false)
  const [confirmarAccion, setConfirmarAccion] = useState(null)

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

  async function crearUsuario(evento) {
    evento.preventDefault()
    if (!nuevo.email || !nuevo.password) {
      toast.error('Email y contraseña son obligatorios')
      return
    }
    setEnviando(true)
    const { error } = await supabase.rpc('crear_usuario_admin', {
      p_email: nuevo.email,
      p_password: nuevo.password,
      p_nombre: nuevo.nombre || 'Sin nombre',
      p_rol: nuevo.rol,
    })
    setEnviando(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Usuario creado')
    setNuevo({ email: '', nombre: '', password: '', rol: 'editor' })
    setSearchParams({ seccion: 'lista' })
    cargarUsuarios()
  }

  async function cambiarRol(id, rol) {
    const { error } = await supabase.rpc('cambiar_rol_usuario', {
      p_user_id: id,
      p_rol: rol,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Rol actualizado')
      cargarUsuarios()
    }
  }

  async function toggleActivo(id, activo) {
    const { error } = await supabase.rpc('toggle_usuario_activo', {
      p_user_id: id,
      p_activo: activo,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(activo ? 'Usuario activado' : 'Usuario desactivado')
      cargarUsuarios()
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-panel-texto">
            {seccion === 'nuevo' ? 'Nuevo usuario' : 'Usuarios'}
          </h1>
          <p className="mt-1 text-sm text-panel-texto-suave">
            {seccion === 'nuevo'
              ? 'Alta de cuenta para el panel'
              : 'Gestioná las cuentas y los roles del panel'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {seccion === 'nuevo' ? (
            <button
              onClick={() => setSearchParams({ seccion: 'lista' })}
              className="inline-flex items-center gap-2 rounded-xl border border-panel-borde px-4 py-2 text-sm font-semibold text-panel-texto transition-colors hover:bg-panel-hover"
            >
              <ArrowLeft size={16} />
              Volver a la lista
            </button>
          ) : (
            <>
              <button
                onClick={cargarUsuarios}
                className="rounded-lg p-2 text-panel-texto transition-colors hover:bg-panel-hover"
                aria-label="Recargar lista"
                title="Recargar lista"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={() => setSearchParams({ seccion: 'nuevo' })}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105"
              >
                <UserPlus size={16} />
                Nuevo usuario
              </button>
            </>
          )}
        </div>
      </div>

      {seccion === 'nuevo' ? (
        <form
          onSubmit={crearUsuario}
          className="mt-6 rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/40 via-transparent to-panel-acento-2/40"
        >
          <div className="grid grid-cols-1 gap-4 rounded-[calc(1rem-1px)] bg-panel-superficie p-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-panel-texto">Nombre</span>
              <input
                type="text"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                className="w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
                placeholder="Nombre del integrante"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-panel-texto">Email *</span>
              <input
                type="email"
                value={nuevo.email}
                onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                required
                className="w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
                placeholder="correo@municipio.gob.ar"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-panel-texto">Contraseña *</span>
              <input
                type="password"
                value={nuevo.password}
                onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
                required
                minLength={8}
                className="w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-panel-texto">Rol</span>
              <select
                value={nuevo.rol}
                onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value })}
                className="w-full rounded-xl border border-panel-borde bg-panel-superficie px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60"
              >
                <ShieldCheck size={16} />
                {enviando ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </form>
      ) : (
      <div className="mt-6 overflow-hidden rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/30 via-transparent to-panel-acento-2/30">
        <div className="overflow-x-auto rounded-[calc(1rem-1px)] bg-panel-superficie">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-panel-borde text-panel-texto-suave">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Última conexión</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-panel-texto-suave">
                    Cargando…
                  </td>
                </tr>
              )}
              {!cargando && usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-panel-texto-suave">
                    No hay usuarios
                  </td>
                </tr>
              )}
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b border-panel-borde text-panel-texto last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{usuario.nombre}</td>
                  <td className="break-all px-4 py-3 text-panel-texto-suave">{usuario.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={usuario.rol}
                      onChange={(e) => cambiarRol(usuario.id, e.target.value)}
                      className="rounded-lg border border-panel-borde bg-panel-superficie px-2 py-1 text-xs capitalize text-panel-texto"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          usuario.activo
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {usuario.activo &&
                        usuario.ultimo_acceso &&
                        Date.now() - new Date(usuario.ultimo_acceso).getTime() <=
                          MINUTOS_EN_LINEA * 60 * 1000 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-panel-acento-2/15 px-2 py-0.5 text-xs font-semibold text-panel-acento-texto">
                            <Wifi size={12} />
                            En línea
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-panel-texto-suave">
                    <span
                      title={
                        usuario.ultimo_acceso || usuario.last_sign_in_at
                          ? new Date(
                              usuario.ultimo_acceso || usuario.last_sign_in_at
                            ).toLocaleString('es-AR')
                          : 'Sin actividad'
                      }
                    >
                      {formatoTiempoRelativo(
                        usuario.ultimo_acceso || usuario.last_sign_in_at
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setConfirmarAccion({
                          titulo: usuario.activo ? 'Desactivar usuario' : 'Activar usuario',
                          mensaje: `¿Confirmás ${usuario.activo ? 'desactivar' : 'activar'} a ${usuario.nombre}?`,
                          ejecutar: () => toggleActivo(usuario.id, !usuario.activo),
                        })
                      }
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-panel-acento-texto transition-colors hover:bg-panel-hover"
                    >
                      {usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <ModalConfirmacion
        abierto={!!confirmarAccion}
        titulo={confirmarAccion?.titulo}
        mensaje={confirmarAccion?.mensaje}
        cancelar={() => setConfirmarAccion(null)}
        confirmar={() => {
          confirmarAccion?.ejecutar()
          setConfirmarAccion(null)
        }}
      />
    </div>
  )
}

export default Usuarios
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Toaster, toast } from 'sonner'

function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setEnviando(true)
    const { error } = await iniciarSesion(email, password)

    if (error) {
      toast.error(error.message || 'No se pudo iniciar sesión.')
      setEnviando(false)
      return
    }
    toast.success('Bienvenido al panel')
    navigate('/mg-tinogasta/panel')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl p-px bg-gradient-to-br from-indigo-500 via-cyan-400 to-indigo-600">
          <div className="rounded-[calc(1.5rem-1px)] bg-[#101a2e]/90 px-6 py-8 backdrop-blur-xl sm:px-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
                <Sparkles size={28} />
              </div>
              <h1 className="mt-4 text-xl font-bold text-slate-100">
                Panel Administrativo
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Dirección de Modernización
              </p>
            </div>

            <form onSubmit={manejarEnvio} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-300">
                  Correo electrónico
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-cyan-400">
                  <Mail size={18} className="shrink-0 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="correo@municipio.gob.ar"
                    className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-300">
                  Contraseña
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 transition-colors focus-within:border-cyan-400">
                  <Lock size={18} className="shrink-0 text-slate-400" />
                  <input
                    type={verPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-transparent py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-200"
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={enviando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
              >
                {enviando ? 'Ingresando…' : 'Ingresar'}
                <LogIn size={16} />
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Sistema interno · acceso restringido al equipo del área
        </p>
      </motion.div>

      <Toaster position="top-center" richColors />
    </div>
  )
}

export default Login
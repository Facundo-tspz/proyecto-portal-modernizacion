import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save, RefreshCw, Megaphone, Sparkles, Users } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

const secciones = [
  {
    id: 'somos',
    nombre: 'Somos Modernización (home)',
    Icono: Sparkles,
    campos: [
      ['somos_overline', 'Texto chico superior', 'texto'],
      ['somos_titulo', 'Título', 'texto'],
      ['somos_parrafo', 'Párrafo', 'area'],
      ['somos_frase', 'Frase destacada', 'texto'],
    ],
  },
  {
    id: 'mision',
    nombre: 'Misión / Visión / Función',
    Icono: Users,
    campos: [
      ['q_mision', 'Misión', 'area'],
      ['q_vision', 'Visión', 'area'],
      ['q_funcion', 'Función', 'area'],
    ],
  },
  {
    id: 'contacto',
    nombre: 'Contacto (Quiénes Somos)',
    Icono: Megaphone,
    campos: [
      ['q_contacto_ubicacion', 'Ubicación', 'texto'],
      ['q_contacto_telefono', 'Teléfono', 'texto'],
      ['q_contacto_email', 'Email', 'texto'],
    ],
  },
]

function EditorTextos() {
  const [todos, setTodos] = useState({})
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let activo = true
    supabase
      .from('config_sitio')
      .select('clave, valor')
      .then(({ data }) => {
        if (activo && data) {
          const obj = {}
          data.forEach((f) => {
            obj[f.clave] = f.valor
          })
          setTodos(obj)
        }
        setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  async function guardar() {
    setGuardando(true)
    const filas = Object.entries(todos).map(([clave, valor]) => ({ clave, valor }))
    const { error } = await supabase.from('config_sitio').upsert(filas, { onConflict: 'clave' })
    setGuardando(false)
    if (error) toast.error('No se pudieron guardar los textos. Intentalo de nuevo.')
    else toast.success('Textos guardados correctamente')
  }

  if (cargando) return <p className="text-sm text-panel-texto-suave">Cargando…</p>

  return (
    <div>
      <div className="space-y-6">
        {secciones.map((seccion) => {
          const Icono = seccion.Icono
          return (
            <div key={seccion.id} className="rounded-2xl p-px bg-gradient-to-br from-panel-acento-1/30 via-transparent to-panel-acento-2/30">
              <div className="rounded-[calc(1rem-1px)] bg-panel-superficie p-4 sm:p-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-panel-texto">
                  <Icono size={16} className="text-panel-acento-texto" />
                  {seccion.nombre}
                </h4>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {seccion.campos.map(([clave, etiqueta, tipo]) => (
                    <label key={clave} className="block">
                      <span className="mb-1 block text-sm font-medium text-panel-texto">
                        {etiqueta}
                      </span>
                      {tipo === 'area' ? (
                        <textarea
                          value={todos[clave] || ''}
                          onChange={(e) => setTodos({ ...todos, [clave]: e.target.value })}
                          rows={3}
                          className="w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={todos[clave] || ''}
                          onChange={(e) => setTodos({ ...todos, [clave]: e.target.value })}
                          className="w-full rounded-xl border border-panel-borde bg-panel-hover px-3 py-2 text-sm text-panel-texto focus:border-panel-acento-borde focus:outline-none"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={guardar}
        disabled={guardando}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-panel-acento-1 to-panel-acento-2 px-4 py-2 text-sm font-semibold text-white shadow transition-transform hover:scale-105 disabled:opacity-60"
      >
        {guardando ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
        Guardar todos los textos
      </button>
    </div>
  )
}

export default EditorTextos
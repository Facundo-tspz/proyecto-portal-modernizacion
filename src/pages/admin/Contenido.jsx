import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Megaphone, LayoutGrid, Link2, Type, FolderKanban } from 'lucide-react'
import EditorBanner from '../../components/admin/editores/EditorBanner'
import EditorDestacados from '../../components/admin/editores/EditorDestacados'
import EditorAccesos from '../../components/admin/editores/EditorAccesos'
import EditorTextos from '../../components/admin/editores/EditorTextos'
import EditorProyectos from '../../components/admin/editores/EditorProyectos'

const pestanas = [
  { id: 'banner', nombre: 'Banner', Icono: Megaphone },
  { id: 'destacados', nombre: 'Destacados', Icono: LayoutGrid },
  { id: 'accesos', nombre: 'Accesos útiles', Icono: Link2 },
  { id: 'textos', nombre: 'Textos', Icono: Type },
  { id: 'proyectos', nombre: 'Proyectos', Icono: FolderKanban },
]

function Contenido() {
  const [searchParams, setSearchParams] = useSearchParams()
  const seccionUrl = searchParams.get('seccion') || 'banner'
  const [activa, setActiva] = useState(
    pestanas.some((p) => p.id === seccionUrl) ? seccionUrl : 'banner'
  )

  useEffect(() => {
    const valida = pestanas.some((p) => p.id === seccionUrl) ? seccionUrl : 'banner'
    setActiva(valida)
  }, [seccionUrl])

  function cambiarPestana(id) {
    setActiva(id)
    setSearchParams({ seccion: id }, { replace: true })
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-100">Gestión de contenido</h1>
      <p className="mt-1 text-sm text-slate-400">
        Editá el contenido del portal público. Los cambios se guardan y se ven al instante.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
        {pestanas.map((p) => {
          const Icono = p.Icono
          return (
            <button
              key={p.id}
              onClick={() => cambiarPestana(p.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activa === p.id
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-white'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icono size={16} />
              {p.nombre}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {activa === 'banner' && <EditorBanner />}
        {activa === 'destacados' && <EditorDestacados />}
        {activa === 'accesos' && <EditorAccesos />}
        {activa === 'textos' && <EditorTextos />}
        {activa === 'proyectos' && <EditorProyectos />}
      </div>
    </div>
  )
}

export default Contenido
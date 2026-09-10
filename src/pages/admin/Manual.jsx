import { BookOpen, FileDown } from 'lucide-react'

function Manual() {
  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-100">
        Manual de usuario
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Guía de uso del panel administrativo.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 border border-dashed border-white/10 rounded-2xl p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
          <BookOpen size={30} />
        </div>
        <p className="max-w-md text-sm text-slate-400">
          El manual de usuario se está preparando. Mostrará cómo usar cada
          sección del panel según el rol y los pasos para gestionar tickets,
          contenido y usuarios.
        </p>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow opacity-60 cursor-default"
        >
          <FileDown size={16} />
          Descargar PDF (próximamente)
        </button>
      </div>
    </div>
  )
}

export default Manual
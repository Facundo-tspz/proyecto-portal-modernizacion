import { Ticket } from 'lucide-react'

function Tickets() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-panel-acento-1 to-panel-acento-2 text-white shadow-lg">
        <Ticket size={30} />
      </div>
      <h1 className="text-2xl font-bold text-panel-texto">Mesa de ayuda</h1>
      <p className="max-w-md text-sm text-panel-texto-suave">
        La gestión completa de tickets (ver, priorizar, cambiar estado y responder) se habilita
        en la próxima etapa del desarrollo.
      </p>
    </div>
  )
}

export default Tickets
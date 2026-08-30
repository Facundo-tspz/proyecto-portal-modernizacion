import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function RutaProtegida({ children }) {
  const { sesion, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-municipal-azul">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-municipal-crema/20 border-t-municipal-naranja" />
      </div>
    )
  }

  if (!sesion) {
    return <Navigate to="/mg-tinogasta/acceso" replace />
  }

  return children
}

export default RutaProtegida
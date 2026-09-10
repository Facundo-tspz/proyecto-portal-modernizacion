import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ROLES_ADMIN = ['admin', 'tecnico', 'editor']

function RutaProtegida({ children }) {
  const { sesion, usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-municipal-azul">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-municipal-crema/20 border-t-municipal-naranja" />
      </div>
    )
  }

  const rol = usuario?.perfil?.rol
  if (!sesion || !ROLES_ADMIN.includes(rol) || usuario?.perfil?.activo === false) {
    return <Navigate to="/mg-tinogasta/acceso" replace />
  }

  return children
}

export default RutaProtegida
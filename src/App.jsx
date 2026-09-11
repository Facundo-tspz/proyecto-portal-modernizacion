import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/comunes/ScrollToTop'
import PortalLayout from './layouts/PortalLayout'
import Inicio from './pages/portal/Inicio'
import QuienesSomos from './pages/portal/QuienesSomos'
import Proyectos from './pages/portal/Proyectos'
import Reportar from './pages/portal/Reportar'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Tickets from './pages/admin/Tickets'
import Contenido from './pages/admin/Contenido'
import Usuarios from './pages/admin/Usuarios'
import Preferencias from './pages/admin/Preferencias'
import Manual from './pages/admin/Manual'
import AdminLayout from './layouts/AdminLayout'
import RutaProtegida from './components/admin/RutaProtegida'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/reporte-tiket" element={<Reportar />} />
        </Route>

        <Route path="/mg-tinogasta/acceso" element={<Login />} />

        <Route
          path="/mg-tinogasta"
          element={
            <RutaProtegida>
              <AdminLayout />
            </RutaProtegida>
          }
        >
          <Route path="panel" element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="contenido" element={<Contenido />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracion" element={<Preferencias />} />
          <Route path="manual" element={<Manual />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

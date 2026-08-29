import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/comunes/ScrollToTop'
import PortalLayout from './layouts/PortalLayout'
import Inicio from './pages/portal/Inicio'
import QuienesSomos from './pages/portal/QuienesSomos'
import Proyectos from './pages/portal/Proyectos'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/proyectos" element={<Proyectos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

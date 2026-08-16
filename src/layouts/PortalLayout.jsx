import { Outlet } from 'react-router-dom'
import Navbar from '../components/comunes/Navbar'
import Footer from '../components/comunes/Footer'

function PortalLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />
      <main className="pt-16 lg:pt-14 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PortalLayout

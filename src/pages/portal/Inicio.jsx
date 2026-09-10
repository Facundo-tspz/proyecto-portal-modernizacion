import BannerNoticias from '../../components/portal/BannerNoticias'
import DestacadosCarrusel from '../../components/portal/DestacadosCarrusel'
import TarjetasEnlace from '../../components/portal/TarjetasEnlace'
import SomosModernizacion from '../../components/portal/SomosModernizacion'

function Inicio() {
  return (
    <>
      <h1 className="sr-only">Dirección de Modernización — Municipalidad de Tinogasta</h1>
      <BannerNoticias />
      <DestacadosCarrusel />
      <TarjetasEnlace />
      <SomosModernizacion />
    </>
  )
}

export default Inicio

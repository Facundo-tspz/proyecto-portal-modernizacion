import {
  BookOpen,
  ChevronRight,
  FileDown,
  Info,
  LifeBuoy,
  Lightbulb,
  LogIn,
  MousePointerClick,
  ShieldCheck,
} from 'lucide-react'

import capturaAcceso from '../../assets/manual/acceso.png'
import capturaMoverse from '../../assets/manual/moverse.png'
import capturaPanel from '../../assets/manual/panel.png'
import capturaTickets from '../../assets/manual/tickets.png'
import capturaContenido from '../../assets/manual/contenido.png'
import capturaUsuarios from '../../assets/manual/usuarios.png'
import capturaPreferencias from '../../assets/manual/preferencias.png'

const clasesEstado = {
  amber: 'border-amber-300 bg-amber-100 text-amber-800',
  blue: 'border-blue-300 bg-blue-100 text-blue-800',
  green: 'border-green-300 bg-green-100 text-green-800',
  red: 'border-red-300 bg-red-100 text-red-800',
}

const clasesGravedad = {
  critica: 'border-red-300 bg-red-100 text-red-800',
  alta: 'border-orange-300 bg-orange-100 text-orange-800',
  media: 'border-yellow-300 bg-yellow-100 text-yellow-800',
  baja: 'border-green-300 bg-green-100 text-green-800',
}

const estados = [
  ['Pendiente', 'amber', 'Recibido hace poco, todavía no se respondió.'],
  ['En espera', 'blue', 'Ya tiene respuesta o gestión iniciada.'],
  ['Resuelta', 'green', 'El trabajo se finalizó.'],
  ['Rechazada', 'red', 'No se tramita.'],
]

const gravedades = [
  ['Crítica', 'critica'],
  ['Alta', 'alta'],
  ['Media', 'media'],
  ['Baja', 'baja'],
]

const rolTabla = {
  panel: ['Panel (resumen)', '✓', '✓', '✓'],
  mesa: ['Mesa de ayuda', '✓', '✓', '—'],
  contenido: ['Contenido', '✓', '—', '✓'],
  usuarios: ['Usuarios', '✓', '—', '—'],
  config: ['Configuración', '✓', '—', '—'],
}

const faq = [
  [
    'No recuerdo mi contraseña',
    'El administrador debe reiniciarla desde Configuración → Preferencias, en "reiniciar contraseña" del usuario.',
  ],
  [
    'El login me bloqueó',
    'Después de 5 intentos fallidos el acceso queda bloqueado durante 15 minutos. Esperá ese tiempo y volvé a intentar.',
  ],
  [
    'No veo una sección en el menú',
    'Cada rol ve solo sus secciones. Si te falta "Mesa de ayuda" o "Usuarios", es porque tu rol no lo permite: consultá con el administrador.',
  ],
  [
    'Un ticket quedó en "En espera" y no avanza',
    'Es el estado automático que se aplica al responder un ticket pendiente. Cuando termines el trabajo, pasalo a "Resuelta".',
  ],
  [
    'Me cerró la sesión "solo"',
    'Ocurre por más de 7 días sin actividad en el panel, o porque el administrador revocó la sesión. Con volver a ingresar alcanza.',
  ],
]

const practicas = [
  'Prepará y recortá las imágenes antes de subirlas: el panel las guarda optimizadas. Usá solo material institucional y de buena calidad.',
  'En cada respuesta de ticket describí qué hiciste y, si corresponde, qué falta. No escribas solo "resuelto".',
  'Preferí desactivar una cuenta si la persona puede volver; eliminá solo cuando esté confirmado que no.',
  'Usá contraseñas de al menos 8 caracteres, preferentemente distintas para cada persona, y no las compartas.',
]

function Captura({ src, alt, leyenda }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <img src={src} alt={alt} className="w-full" />
      <figcaption className="border-t border-slate-200 px-3 py-1.5 text-xs font-medium text-[#64748b]">
        Figura: {leyenda}
      </figcaption>
    </figure>
  )
}

function Paso({ n, children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#010a26] text-xs font-bold text-white">
        {n}
      </span>
      <div className="text-sm leading-relaxed text-[#1e293b]">{children}</div>
    </div>
  )
}

function Nota({ children }) {
  return (
    <div className="flex gap-2 rounded-lg border-l-4 border-[#d96704] bg-white px-3 py-2 text-sm text-[#57534e]">
      <Info size={16} className="mt-0.5 shrink-0 text-[#d96704]" />
      <p>{children}</p>
    </div>
  )
}

function TituloSeccion({ id, icono: Icono, numero, texto, subtitulo }) {
  return (
    <>
      <h2
        id={id}
        className="mt-10 flex scroll-mt-24 items-center gap-3 border-b border-slate-300 pb-2 text-lg font-bold text-[#010a26]"
      >
        {Icono && <Icono size={18} className="shrink-0 text-[#d96704]" />}
        {numero && <span className="text-[#d96704]">{numero}.</span>}
        <span>{texto}</span>
      </h2>
      {subtitulo && <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{subtitulo}</p>}
    </>
  )
}

function SubTitulo({ numero, texto }) {
  return (
    <h3 className="mt-6 mb-2 flex items-center gap-2 text-base font-bold text-[#010a26]">
      <span className="text-xs font-bold text-[#d96704]">{numero}</span>
      {texto}
    </h3>
  )
}

function Chip({ children, clase }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${clase}`}>
      {children}
    </span>
  )
}

function Manual() {
  return (
    <div className="p-4 sm:p-8 print:p-0">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#f6f4e8] p-6 text-[#1e293b] shadow-xl sm:p-10 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-col gap-4 border-b border-slate-300 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#d96704]">
              <BookOpen size={14} />
              Guía de uso
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#010a26] sm:text-3xl">
              Manual de usuario del panel administrativo
            </h1>
            <p className="mt-1 text-sm text-[#64748b]">
              Acceso, mesa de ayuda, contenido, usuarios y configuración. Versión 1.0 · Septiembre 2026.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#010a26] px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-[#0b1220] print:hidden"
          >
            <FileDown size={16} />
            Descargar PDF
          </button>
        </header>

        <nav className="mt-6 print:hidden">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#64748b]">Contenido</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['#acceso', 'Acceso al panel'],
              ['#moverse', 'Cómo moverse en el panel'],
              ['#guia', 'Guía por sección'],
              ['#roles', 'Roles y permisos'],
              ['#faq', 'Solución de problemas (FAQ)'],
              ['#practicas', 'Buenas prácticas'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#1e293b] transition-colors hover:bg-[#010a26] hover:text-white"
              >
                {label}
                <ChevronRight size={16} className="shrink-0" />
              </a>
            ))}
          </div>
        </nav>

        <TituloSeccion
          id="acceso"
          icono={LogIn}
          numero={1}
          texto="Acceso al panel"
          subtitulo="El panel es la zona privada del portal. Solo los usuarios con rol activo pueden entrar."
        />
        <div className="mt-4 space-y-3">
          <Paso n={1}>
            Abrí el sitio del portal y entrá a la dirección <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-[#010a26]">/mg-tinogasta/acceso</code> (o usá el vínculo de ingreso de la página).
          </Paso>
          <Paso n={2}>
            Ingresá tu <strong>email</strong> y tu <strong>contraseña</strong> y tocá <strong>Ingresar</strong>.
          </Paso>
          <Paso n={3}>
            Si los datos son correctos y tu cuenta está activa, entrás al <strong>Panel</strong>.
          </Paso>
        </div>
        <div className="mt-4 space-y-2">
          <Nota>Después de <strong>5 intentos fallidos</strong> el acceso queda bloqueado por <strong>15 minutos</strong>.</Nota>
          <Nota>Si pasan <strong>más de 7 días sin actividad</strong>, la sesión se cierra sola y hay que volver a ingresar.</Nota>
        </div>
        <div className="mt-4">
          <Captura src={capturaAcceso} alt="Pantalla de inicio de sesión" leyenda="Pantalla de inicio de sesión" />
        </div>

        <TituloSeccion
          id="moverse"
          icono={MousePointerClick}
          numero={2}
          texto="Cómo moverse en el panel"
          subtitulo="Todas las secciones se alcanzan desde el menú lateral, el cual cambia según el rol de cada usuario."
        />
        <div className="mt-4 space-y-3">
          <Paso n={1}>
            A la <strong>izquierda</strong> está el <strong>menú lateral</strong> con las secciones agrupadas (Inicio, Mesa de ayuda, Contenido, Usuarios, Configuración). En pantallas chicas se abre con el botón de hamburguesa del encabezado.
          </Paso>
          <Paso n={2}>
            Arriba del contenido, el <strong>pan de ruta (breadcrumb)</strong> indica dónde estás: por ejemplo, <em>Inicio › Mesa de ayuda › Todos los tickets</em>.
          </Paso>
          <Paso n={3}>
            En el <strong>encabezado</strong> superior se muestran tu rol, tu nombre y botones para abrir este <strong>manual</strong>, <strong>volver al inicio</strong> del portal y <strong>cerrar sesión</strong>.
          </Paso>
        </div>
        <div className="mt-4">
          <Captura src={capturaMoverse} alt="Menú lateral y encabezado del panel" leyenda="Menú lateral y encabezado del panel" />
        </div>

        <TituloSeccion
          id="guia"
          icono={BookOpen}
          numero={3}
          texto="Guía por sección"
          subtitulo="Cada sección está explicada con los pasos de uso habituales. Lo que muestras solo una parte de lo que existe según el rol."
        />

        <SubTitulo numero="3.1" texto="Panel" />
        <div className="space-y-3">
          <Paso n={1}>
            Entrá a <strong>Panel</strong> para ver el resumen general.
          </Paso>
          <Paso n={2}>
            Revisá las <strong>tarjetas de resumen</strong> con la cantidad de tickets según su estado, al día.
          </Paso>
          <Paso n={3}>
            Usá los <strong>accesos rápidos</strong> para saltar a las secciones frecuentes.
          </Paso>
        </div>
        <div className="mt-4">
          <Captura src={capturaPanel} alt="Panel con tarjetas de resumen" leyenda="Panel con tarjetas de resumen" />
        </div>

        <SubTitulo numero="3.2" texto="Mesa de ayuda — Todos los tickets" />
        <div className="space-y-3">
          <Paso n={1}>
            Entrá a <strong>Mesa de ayuda → Todos los tickets</strong> para ver la lista completa.
          </Paso>
          <Paso n={2}>
            Usá las <strong>pestañas</strong> (Todos, Pendiente, En espera, Resuelta, Rechazada) para filtrar por estado; cada pestaña muestra su contador.
          </Paso>
          <Paso n={3}>
            Abrí un <strong>ticket</strong> para ver el detalle: código, solicitante, datos de contacto, secretaría, categoría, fecha y descripción.
          </Paso>
          <Paso n={4}>
            Sobre un ticket podés <strong>cambiar el estado</strong>, <strong>cambiar la gravedad</strong> y <strong>responder</strong> con una nota.
          </Paso>
          <Paso n={5}>
            Cada cambio de estado y cada respuesta queda en el <strong>historial</strong> del ticket, con responsable y fecha.
          </Paso>
        </div>
        <Nota>
          <strong>Regla de estados:</strong> "Pendiente" es solo el estado inicial y no puede volver a elegirse. Cuando respondés un ticket pendiente, pasa <strong>automáticamente a "En espera"</strong>.
        </Nota>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3">
            <p className="mb-2 text-sm font-bold text-[#010a26]">Estados</p>
            <div className="space-y-2">
              {estados.map(([nombre, color, descripcion]) => (
                <div key={nombre} className="flex items-center gap-2 text-sm">
                  <Chip clase={clasesEstado[color]}>{nombre}</Chip>
                  <span className="text-[#334155]">{descripcion}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="mb-2 text-sm font-bold text-[#010a26]">Gravedad</p>
            <div className="flex flex-wrap gap-2">
              {gravedades.map(([nombre, color]) => (
                <Chip key={nombre} clase={clasesGravedad[color]}>
                  {nombre}
                </Chip>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Captura src={capturaTickets} alt="Lista de tickets con pestañas y estado" leyenda="Lista de tickets con pestañas y estado" />
        </div>

        <SubTitulo numero="3.3" texto="Contenido" />
        <div className="space-y-3">
          <Paso n={1}>
            Entrá a <strong>Contenido</strong> y elegí la sección: <strong>Banner</strong>, <strong>Destacados</strong>, <strong>Accesos útiles</strong>, <strong>Textos / Quiénes Somos</strong> o <strong>Proyectos</strong>.
          </Paso>
          <Paso n={2}>
            Modificá los <strong>campos de texto</strong> (títulos, descripciones, enlaces) según corresponda a cada sección.
          </Paso>
          <Paso n={3}>
            Para <strong>imágenes</strong>: tocá el botón de subir, elegí el archivo y ajustá el <strong>recorte</strong>; se guarda optimizada automáticamente.
          </Paso>
          <Paso n={4}>
            Guardá los cambios con el botón <strong>Guardar</strong> de la sección.
          </Paso>
        </div>
        <Nota>Las imágenes se convierten y guardan en formato <strong>WebP</strong> para que el portal cargue rápido. Usá material institucional de buena calidad.</Nota>
        <div className="mt-4">
          <Captura src={capturaContenido} alt="Editor de contenido con imágenes" leyenda="Editor de contenido con imágenes" />
        </div>

        <SubTitulo numero="3.4" texto="Usuarios" />
        <div className="space-y-3">
          <Paso n={1}>
            Entrá a <strong>Usuarios → Lista de usuarios</strong> para ver a todo el personal: nombre, correo, rol, si está activo y su última conexión.
          </Paso>
          <Paso n={2}>
            En <strong>Nuevo usuario</strong> creá una cuenta con <strong>email</strong>, <strong>contraseña de al menos 8 caracteres</strong> y su <strong>rol</strong>.
          </Paso>
          <Paso n={3}>
            Para <strong>activar o desactivar</strong> a una persona, usá el control de su fila: al desactivarla, <strong>se cierran sus sesiones</strong> de inmediato.
          </Paso>
          <Paso n={4}>
            Para <strong>eliminar</strong>, confirmá la acción. No se puede eliminar la cuenta propia.
          </Paso>
        </div>
        <div className="mt-4">
          <Captura src={capturaUsuarios} alt="Lista de usuarios con roles" leyenda="Lista de usuarios con roles" />
        </div>

        <SubTitulo numero="3.5" texto="Configuración — Preferencias" />
        <div className="space-y-3">
          <Paso n={1}>
            Entrá a <strong>Configuración → Preferencias</strong> para cambiar tu <strong>nombre</strong> mostrado en el panel.
          </Paso>
          <Paso n={2}>
            Desde ahí también se <strong>revocan sesiones</strong>: podés cerrar la sesión de un usuario puntual o de todos; esas personas deben volver a iniciar sesión.
          </Paso>
          <Paso n={3}>
            Para <strong>reiniciar la contraseña</strong> de un usuario, seleccionalo desde la lista y confirmá.
          </Paso>
        </div>
        <div className="mt-4">
          <Captura src={capturaPreferencias} alt="Pantalla de preferencias" leyenda="Pantalla de preferencias" />
        </div>

        <TituloSeccion
          id="roles"
          icono={ShieldCheck}
          numero={4}
          texto="Roles y permisos"
          subtitulo="Qué puede ver y hacer cada rol dentro del panel."
        />
        <div className="mt-4 overflow-x-auto rounded-lg">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#010a26] text-left text-white">
                <th className="px-3 py-2 font-semibold">Sección</th>
                <th className="px-3 py-2 text-center font-semibold">Administrador</th>
                <th className="px-3 py-2 text-center font-semibold">Técnico</th>
                <th className="px-3 py-2 text-center font-semibold">Editor</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {Object.values(rolTabla).map(([seccion, admin, tecnico, editor], i) => (
                <tr key={seccion} className={i % 2 ? 'bg-[#f6f4e8]' : ''}>
                  <td className="border-t border-slate-200 px-3 py-2 font-medium text-[#010a26]">{seccion}</td>
                  <td className="border-t border-slate-200 px-3 py-2 text-center">{admin}</td>
                  <td className="border-t border-slate-200 px-3 py-2 text-center">{tecnico}</td>
                  <td className="border-t border-slate-200 px-3 py-2 text-center">{editor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Nota>El administrador tiene acceso total y es quien crea las cuentas, asigna roles, revoca sesiones y reinicia contraseñas.</Nota>
        </div>

        <TituloSeccion
          id="faq"
          icono={LifeBuoy}
          numero={5}
          texto="Solución de problemas (FAQ)"
          subtitulo="Las consultas más comunes y cómo resolverlas."
        />
        <div className="mt-4 space-y-2">
          {faq.map(([pregunta, respuesta]) => (
            <div key={pregunta} className="rounded-lg bg-white px-3 py-2">
              <p className="text-sm font-semibold text-[#010a26]">{pregunta}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[#334155]">{respuesta}</p>
            </div>
          ))}
        </div>

        <TituloSeccion
          id="practicas"
          icono={Lightbulb}
          numero={6}
          texto="Buenas prácticas"
          subtitulo="Recomendaciones para mantener el panel y el portal ordenados."
        />
        <ul className="mt-4 space-y-2">
          {practicas.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#d96704]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Manual
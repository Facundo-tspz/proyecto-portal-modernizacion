# BITÁCORA DE DESARROLLO DEL PROYECTO DE PASANTÍA

**Tecnicatura Superior en Desarrollo de Software**
**Cátedra:** Pasantía
**Institución:** IES Tinogasta
**Alumno:** Paez Facundo Tomas
**Organización de la pasantía:** Municipality de Tinogasta – Dirección de Modernización
**Tutor institucional:** Barrionuevo A. Camila – Directora de Modernización
**Docente:** Lic. Eugenia Roger

---

## SEMANA 1

### Datos generales

- **Fecha:** [_completar con fecha real]
- **Horas dedicadas:** [_completar con horas reales]
- **Lugar de trabajo:** [_completar]

### Objetivos de la semana

- Definir el stack tecnológico completo del proyecto.
- Analizar la identidad visual de la Municipalidad de Tinogasta y extraer la paleta de colores para el diseño de la interfaz.
- Diseñar la arquitectura general del sistema (módulo público + módulo de help desk).
- Establecer las convenciones de código y la estructura de directorios del proyecto.
- Documentar todo en un archivo README que funcione como guía central del desarrollo.
- Consultar con la tutora del área sobre la disponibilidad de infraestructura (servidor, dominio, base de datos).

### Actividades realizadas

1. **Relevamiento de necesidades:** Revisión de la documentación de relevamiento realizada en la institución, identificando las necesidades del área de Modernización: ausencia de portal institucional propio y falta de un sistema formal para la gestión de soporte técnico interáreas.

2. **Análisis de propuestas:** Evaluación de tres propuestas mediante matriz de viabilidad (técnica, institucional y de recursos). Se seleccionó el "Portal Web Oficial y Plataforma Integrada de Gestión de Incidentes" por resolver ambas necesidades con un único desarrollo.

3. **Definición del stack tecnológico:**
   - **Frontend:** React 18+ con Vite, React Router v6+, Tailwind CSS, DaisyUI.
   - **Utilidades:** Framer Motion (animaciones), React Hook Form (formularios), date-fns (fechas), qrcode.react (QR), Lucide React (iconos), Sonner (notificaciones), browser-image-compression (conversión de imágenes).
   - **Backend:** Pendiente de confirmación con la tutora (servidor municipal vs Supabase).

4. **Análisis de identidad visual:** Se recibió la identidad visual de la municipalidad (imagotipo, paleta cromática y tipografía Congenial). Se extrajeron los colores institucionales:
   - Azul Marino Profundo: `#010a26`
   - Verde Oliva: `#3e5902`
   - Naranja Vibrante: `#d96704`
   - Negro Carbón: `#0d0d0d`
   - Blanco Roto / Crema: `#f1f0d4`

5. **Diseño de paleta de colores para tickets:** Se definió una escala de colores para la gravedad de los incidentes (crítica, alta, media, baja) y para los estados del ticket (pendiente, en espera, resuelta, rechazada), compatibles con la paleta institucional.

6. **Diseño de arquitectura del sistema:**
   - **Módulo Público:** Portal institucional con secciones Inicio, Quiénes Somos, Portafolio de Proyectos y enlace a Capacitaciones (sitio externo del compañero de equipo).
   - **Módulo de Help Desk:** Sistema de tickets accesible exclusivamente vía códigos QR físicos distribuidos en las oficinas municipales. Ruta oculta, sin navegación pública. Incluye formulario de carga, generación de código de seguimiento, QR descargable, copia de link y opción de notificación por email.
   - **Panel Administrativo:** Ruta protegida con autenticación para el equipo del área de Modernización. Dashboard con gráficos, gestión de tickets con código de colores, respuesta de coordinación y gestión de usuarios/permisos.

7. **Diseño del modelo de datos:** Se definieron las tablas principales: `usuarios`, `tickets` (con campos actualizados: nombre, secretaría, dirección/departamento, rol, categoría de problema), `ticket_respuestas`, `ticket_estado_historial` y `proyectos`. La tabla de `capacitaciones` se excluyó ya que es manejada por el compañero de equipo.

8. **Elaboración del README completo:** Se documentaron 13 secciones: descripción general, objetivos, beneficiarios, stack tecnológico, arquitectura, paleta de colores, funcionalidades detalladas, modelo de datos, roadmap de 5 semanas, requisitos funcionales (16) y no funcionales (7), estructura de directorios, guía para desarrollo con IA, y seguridad/SEO.

9. **Definición de seguridad:** Se establecieron reglas para gestión de variables de entorno, protección de claves al usar herramientas de IA, y la decisión de que el formulario de tickets sea accesible solo vía QR físico para evitar reportes de ciudadanos no pertenecientes al municipio.

10. **Definición de notificaciones:** Se descartó WhatsApp (costos y complejidad) y se optó por notificaciones por email. El usuario proporciona su correo de forma opcional después de enviar el ticket, y recibe notificaciones cuando cambia el estado de su solicitud.

### Avances logrados

- Documento README completo con toda la planificación del proyecto.
- Stack tecnológico definido y justificado.
- Paleta de colores institucional y de funcionalidad diseñada.
- Arquitectura del sistema definida (módulo público + help desk oculto + panel admin).
- Modelo de datos preliminar con 5 tablas.
- Roadmap de 5 semanas con desglose por día.
- Guía para desarrollo con IA (convenciones, prompts, reglas).
- Estructura de directorios del proyecto planificada.

### Dificultades encontradas

- La decisión de backend está condicionada a la disponibilidad de infraestructura del municipio (servidor y dominio), lo cual genera incertidumbre tecnológica inicial.
- El diseño del formulario de tickets requiere una revisión de UX más profunda para definir los tags de categorización de problemas y la experiencia de selección progresiva.
- La integración del sitio de capacitaciones (desarrollado por el compañero de equipo) implica trabajar con un componente externo cuya tecnología aún no se conoce.

### Estrategias implementadas

- Se decidió documentar en el README tanto la opción A (servidor municipal) como la opción B (Supabase) para el backend, permitiendo flexibilidad según la respuesta de la tutora.
- Se definió que el formulario de tickets es un borrador cuyo diseño UX final se resolverá en una etapa posterior del desarrollo.
- Se estableció que la sección de Capacitaciones se integrará como enlace externo, minimizando la dependencia tecnológica con el compañero de equipo.

### Cambios respecto del proyecto original

- **Acceso al formulario de tickets:** Originalmente se contemplaba como sección pública del portal. Se cambió a acceso exclusivo vía QR físico para evitar que ciudadanos ajenos al municipio carguen reportes falsos.
- **Notificaciones:** Se evaluó WhatsApp como canal de notificación pero se descartó por costos y riesgo de baneo (librerías no oficiales). Se optó por notificaciones por email.
- **Sección de Capacitaciones:** Se definió como enlace externo al sitio del compañero de equipo, en vez de desarrollarla internamente.

### Reunión con el tutor institucional

- **Fecha:** [_completar]
- **Temas tratados:**
  - Presentación del proyecto y alcance general.
  - Consulta sobre disponibilidad de servidor, dominio y base de datos del municipio.
  - Explicación del sistema de acceso vía QR físico para el formulario de tickets.
- **Acuerdos alcanzados:**
  - [_completar según lo tratado]

### Evidencias

1. Archivo `README.md` completo del proyecto.
2. Documento de identidad visual de la municipalidad (logo y paleta cromática).
3. Bitácora de desarrollo (este documento).

### Reflexión profesional

Esta semana me permitió comprender que la planificación previa al desarrollo es tan importante como el código en sí. Definir el stack tecnológico, analizar la identidad visual y diseñar la arquitectura del sistema antes de escribir una línea de código me dio una visión clara del camino a seguir. La decisión de ocultar el formulario de tickets detrás de un QR físico fue un punto de inflexión que me hizo pensar en seguridad y UX desde la perspectiva del usuario real. También aprendí la importancia de documentar cada decisión técnica para que el proyecto sea mantenible y escalable. Necesito seguir fortaleciendo mis conocimientos en backend (pendiente la decisión final) y en diseño UX para el formulario de carga.

### Plan de trabajo para la próxima semana

- Instalar y configurar todas las herramientas del stack (Vite, React, Tailwind, DaisyUI, React Router, Framer Motion).
- Crear la estructura de carpetas del proyecto según lo planificado.
- Configurar la paleta de colores institucional en `tailwind.config.js`.
- Configurar el modo oscuro/claro.
- Comenzar el desarrollo del layout base del portal público (Navbar, Footer, routing).
- Iniciar la sección "Inicio" del portal con hero banner y estadísticas.

### Estado del proyecto

| Área | Estado |
|------|--------|
| Requerimientos | ☑ Completo |
| Diseño | ☑ Completo |
| Desarrollo | ☐ Pendiente |
| Prueba | ☐ Pendiente |
| Documentación | ☐ En proceso |
| Validación con el tutor | ☐ Pendiente |

---

### Validación del tutor institucional

**Observaciones:**

________________________________________________________________________________________________________________________

**Firma:** ______________

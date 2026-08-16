# Portal Web Oficial — Dirección de Modernización

## Municipalidad de Tinogasta

---

## 1. Descripción General

Este proyecto consiste en el desarrollo de una **plataforma web dual** para la Dirección de Modernización de la Municipalidad de Tinogasta, realizado como **trabajo grupal** dentro de la pasantía profesionalizante. La plataforma articula dos módulos complementarios dentro de una misma aplicación:

- **Módulo Público (Portal Institucional):** Sitio web de acceso abierto que presenta la identidad del área, sus proyectos activos y su agenda pública. Incluye un enlace al sitio de capacitaciones desarrollado de forma independiente por un compañero del equipo. Funciona como la carta de presentación digital de la Dirección de Modernización ante la comunidad.

- **Módulo Privado (Sistema de Gestión de Incidentes — Help Desk):** Sistema de tickets accesible exclusivamente vía códigos QR físicos distribuidos en las oficinas municipales. No es visible en la navegación pública. Permite a los empleados municipales reportar incidentes técnicos de forma formal, y al equipo del área gestionar, priorizar y dar seguimiento a cada solicitud mediante un sistema de tickets con código de colores.

> **Nota sobre trabajo grupal:** Este desarrollo forma parte de un proyecto grupal. La sección de "Capacitaciones" del portal es desarrollada de forma independiente por otro integrante del equipo y se enlaza externamente a este sitio. Los detalles técnicos de dicho sitio no forman parte de este documento.

### Problema que Resuelve

La Dirección de Modernización carece de un canal digital propio que visibilice su trabajo ante la comunidad, y simultáneamente depende del uso informal de WhatsApp para la gestión de soporte técnico interáreas. Esto genera solicitudes perdidas, falta de trazabilidad y saturación operativa. Este proyecto unifica ambas necesidades en una única plataforma web profesional, moderna y accesible.

---

## 2. Objetivos

### Objetivo General

Desarrollar una plataforma web para la Dirección de Modernización que articule un portal informativo público para transparentar y difundir el trabajo del área, y una sección operativa interna para la optimización del soporte técnico interáreas de la municipalidad.

### Objetivos Específicos

| N° | Objetivo |
|----|----------|
| 1 | Diseñar e implementar un portal institucional responsivo que comunique la identidad, los proyectos y las capacitaciones del área ante la comunidad. |
| 2 | Desarrollar un sistema de carga y seguimiento de tickets de incidentes técnicos con generación de código único y consulta pública. |
| 3 | Implementar un panel administrativo protegido con autenticación que permita gestionar tickets por gravedad, actualizar estados y coordinar respuestas. |
| 4 | Establecer un sistema de roles y permisos flexible que la directora del área pueda administrar de forma autónoma. |
| 5 | Aplicar la identidad visual institucional de la Municipalidad de Tinogasta en el diseño de la interfaz. |
| 6 | Desplegar un MVP funcional en el plazo de 5 semanas de desarrollo. |

---

## 3. Beneficiarios

### Beneficiarios Directos

| Beneficiario | Beneficio |
|-------------|-----------|
| **Comunidad de Tinogasta** | Acceso a un portal transparente para conocer los proyectos, capacitaciones y el equipo del área de Modernización. |
| **Dirección de Modernización** (Camila Barrionuevo y equipo) | Panel administrativo privado para gestionar tickets de forma ordenada y profesional. Visibilización del trabajo del área. |
| **Agentes y Secretarías Municipales** | Herramienta formal y ágil para reportar incidentes técnicos y dar seguimiento sin depender de mensajes informales. |

### Beneficiarios Indirectos

- La Municipalidad de Tinogasta en su conjunto, al contar con un canal de soporte estructurado.
- Los futuros pasantes o desarrolladores que hereden el sistema.

---

## 4. Stack Tecnológico

### Frontend

| Tecnología | Versión | Función |
|-----------|---------|---------|
| **React** | 18+ | Framework de interfaz basado en componentes. |
| **Vite** | 5+ | Bundler y servidor de desarrollo de alta velocidad. |
| **React Router** | 6+ | Enrutamiento SPA con soporte para rutas protegidas. |
| **Tailwind CSS** | 3+ | Framework de estilos utility-first. |
| **DaisyUI** | 4+ | Componentes prearmados sobre Tailwind (botones, cards, skeleton, etc.). |

### Utilidades y Librerías

| Librería | Función |
|----------|---------|
| **Framer Motion** | Transiciones suaves y animaciones de entrada entre secciones. |
| **React Hook Form** | Manejo y validación de formularios (carga de tickets, formularios admin). |
| **date-fns** | Manipulación de fechas para agenda de capacitaciones y calendarización. |
| **qrcode.react** | Generación de código QR para consulta de tickets desde dispositivos móviles. |
| **Lucide React** | Librería de iconos SVG ligera e integrada con React. |
| **Sonner** | Sistema de notificaciones toast moderno y no invasivo. |
| **browser-image-compression** | Conversión y compresión de imágenes directamente en el navegador (JPG → WebP). |

### Backend y Persistencia

> **Estado:** Pendiente de confirmación con tutor del área.

| Opción | Descripción |
|--------|-------------|
| **A: Servidor Municipal** | Utilizar el servidor y dominio existentes del área de Modernización. |
| **B: Supabase** | Backend-as-a-Service con PostgreSQL, autenticación y API REST automática. Tier gratuito. |

La decisión final se tomará en la **Semana 1** del roadmap, tras la consulta con la tutora del área.

### Despliegue

| Opción | Contexto |
|--------|----------|
| Servidor municipal | Si se confirma disponibilidad de infraestructura. |
| Vercel / Netlify | Alternativa gratuita e inmediata si no hay servidor disponible. |

---

## 5. Arquitectura del Sistema

### Módulo 1 — Portal Institucional (Público)

Rutas accesibles sin autenticación. Orientado a la comunidad.

| Sección | Descripción | Funcionalidades |
|---------|-------------|-----------------|
| **Inicio** | Página principal con hero institucional. | Banner con logo, estadísticas animadas (counters), acceso rápido a secciones. |
| **Quiénes Somos** | Identidad y misión del área. | Descripción del área, equipo de trabajo, logo institucional. |
| **Portafolio de Proyectos** | Catálogo de desarrollos activos y finalizados. | Cards con imagen (WebP), nombre, descripción y estado. Filtros por categoría. |
| **Capacitaciones** | Enlace al sitio externo del compañero de equipo. | Botón o card que redirige al sitio de capacitaciones (desarrollado por otro integrante del grupo). No se desarrolla en este proyecto. |
| **Soporte Técnico** | Sistema de tickets — **acceso exclusivo vía QR físico**. | Ruta oculta, no visible en navegación. Formulario de carga de incidentes. Generación de QR de seguimiento. Consulta de estado por código. |

### Módulo 2 — Panel Administrativo (Privado)

Rutas protegidas por autenticación. Orientado al equipo del área.

| Sección | Descripción | Funcionalidades |
|---------|-------------|-----------------|
| **Dashboard** | Vista general del estado operativo. | Resumen de tickets pendientes, en espera, resueltos. Gráficos básicos (tickets por sector, por gravedad, por mes). |
| **Gestión de Tickets** | Panel visual de tickets. | Lista de tickets ordenados por gravedad y fecha. Código de colores. Filtros avanzados. |
| **Detalle de Ticket** | Vista individual de un ticket. | Información completa, historial de estados, respuesta de coordinación, agendamiento de visita técnica. |
| **Gestión de Contenido** | Edición del portal público. | CRUD de proyectos del portafolio. Edición de secciones del portal (Quiénes Somos, Inicio). Upload de imágenes con conversión automática JPG → WebP. |
| **Gestión de Usuarios** | Administración de miembros del área. | Alta/baja de usuarios, asignación de permisos flexibles. Solo accesible para admin principal. |
| **Configuración** | Ajustes del sistema. | Perfil, preferencias de notificaciones, configuración general. |

### Flujo del Sistema de Tickets

```
1. Empleado escanea QR FÍSICO en su oficina municipal
   ↓
2. Se abre el formulario de carga (ruta oculta, sin navegación pública)
   ↓
3. Completa formulario: nombre, secretaría, dirección/departamento, rol, problema
   ↓
4. Sistema genera código único de seguimiento + QR digital
   ↓
5. Pantalla de confirmación:
   - Copiar link de seguimiento
   - Descargar QR como imagen (PNG)
   - Opcional: ingresar email para recibir notificaciones de cambios de estado
   ↓
6. Ticket llega al panel admin con gravedad asignada
   ↓
7. Técnico del área revisa, actualiza estado y responde
   ↓
8. Si el empleado proporcionó email → recibe notificación del cambio de estado
   ↓
9. Empleado consulta estado con su código (consulta pública, sin login)
```

---

## 6. Paleta de Colores y Sistema Visual

### Colores Institucionales (Municipalidad de Tinogasta)

| Muestra | Código HEX | Uso |
|---------|-----------|-----|
| Azul Marino Profundo | `#010a26` | Color institucional base. Fondos principales, textos, navbar. |
| Verde Oliva | `#3e5902` | Acento secundario. Elementos territoriales/ambientales. |
| Naranja Vibrante | `#d96704` | Acento de alto contraste. CTAs, destacados, elementos activos. |
| Negro Carbón | `#0d0d0d` | Texto extenso sobre fondos claros. Máxima legibilidad. |
| Blanco Roto / Crema | `#f1f0d4` | Fondos suaves, alternativa al blanco puro. |

### Colores de Gravedad de Tickets

| Nivel | Color | Código HEX | Descripción |
|-------|-------|-----------|-------------|
| Crítica | Rojo Cálido | `#be3a3a` | Incidente crítico que requiere atención inmediata. |
| Alta | Naranja Municipal | `#d96704` | Prioridad alta, afecta operatividad. Usa el color del municipio. |
| Media | Ámbar Dorado | `#c49b20` | Prioridad media, requiere seguimiento. |
| Baja | Verde Natural | `#4d8c2a` | Prioridad baja, no urgente. |

### Colores de Estado del Ticket

| Estado | Color | Código HEX | Descripción |
|--------|-------|-----------|-------------|
| Pendiente | Ámbar | `#c49b20` | Ticket recién cargado, esperando revisión. |
| En espera | Azul Medio | `#3a7cb8` | En proceso, requiere acción externa o coordinación. |
| Resuelta | Verde | `#4d8c2a` | Incidente solucionado. |
| Rechazada | Rojo | `#be3a3a` | Solicitud rechazada (duplicada, fuera de alcance, etc.). |

### Modo Oscuro / Claro

La aplicación soporta ambos modos conmutables por el usuario:

| Elemento | Modo Claro | Modo Oscuro |
|----------|-----------|-------------|
| Fondo principal | `#f1f0d4` (crema) | `#0d0d0d` (carbón) |
| Fondo secundario | `#ffffff` | `#1a1a2e` |
| Texto principal | `#0d0d0d` | `#f1f0d4` |
| Texto secundario | `#4a4a4a` | `#a0a0a0` |
| Navbar | `#010a26` | `#010a26` (sin cambio) |

### Tipografía

| Propiedad | Valor |
|-----------|-------|
| Familia | **Congenial** |
| Clasificación | Sans-serif contemporánea, rasgos humanistas. |
| Características | Terminaciones redondeadas, ojo medio amplio, óptima legibilidad en pantalla e impreso. |
| Soporte | Caja alta (A-Z), caja baja (a-z), Ñ/ñ, números, signos de puntuación. |

---

## 7. Funcionalidades Detalladas

### 7.1 Portal Público

#### Inicio
- Hero banner con logo institucional y eslogan del área.
- Sección de estadísticas con counters animados (tickets resueltos, proyectos activos, capacitaciones realizadas).
- Acceso rápido a las demás secciones.
- Transiciones suaves entre secciones (Framer Motion).

#### Quiénes Somos
- Descripción de la misión y objetivos del área.
- Foto del equipo de trabajo.
- Logo institucional en tamaño visible.

#### Portafolio de Proyectos
- Cards con imagen convertida automáticamente a WebP.
- Nombre, descripción corta y estado del proyecto (Activo / Finalizado / En desarrollo).
- Filtros por categoría o estado.
- Vista detallada de cada proyecto.

#### Capacitaciones (Enlace Externo)
- Botón o card en el portal que enlaza al sitio de capacitaciones desarrollado por el compañero de equipo.
- El sitio de capacitaciones es un proyecto independiente que se integra mediante enlace externo.
- No se desarrolla la lógica de capacitaciones en este proyecto.

#### Soporte Técnico (acceso vía QR físico únicamente)
- **Acceso:** Ruta web oculta. No visible en la navegación del portal. Solo se accede escaneando códigos QR físicos distribuidos en las oficinas municipales.
- **Formulario de carga de incidente:**
  - Nombre completo.
  - Secretaría.
  - Dirección / Departamento.
  - Rol en el área.
  - Problema (selector de tags + campo libre de descripción).
  - *Nota: El diseño final del formulario requiere revisión de UX. Los campos son un borrador.*
- **Pantalla de confirmación post-envío:**
  - Código de seguimiento alfanumérico.
  - QR digital con la URL de consulta.
  - Botón "Copiar link de seguimiento" (usa `navigator.clipboard`).
  - Botón "Descargar QR como imagen" (convierte SVG a PNG y descarga).
  - Sección opcional: "Si deseás recibir notificaciones cuando el estado de tu solicitud cambie, ingresá tu correo electrónico".
- **Consulta de estado:** Ruta pública donde el empleado ingresa su código de seguimiento y ve el estado actual. No requiere login.
- **Notificaciones por email:** Si el empleado proporcionó su email, recibe una notificación automática cada vez que el técnico cambia el estado de su ticket.

### 7.2 Panel Administrativo

#### Dashboard
- Resumen ejecutivo: tickets pendientes, en espera, resueltos, rechazados.
- Gráficos básicos: tickets por sector, por gravedad, por mes.
- Últimos tickets recibidos.

#### Gestión de Tickets
- Tabla visual de tickets ordenados por gravedad y fecha.
- Filtros: por sector, gravedad, estado, rango de fechas.
- Código de colores en cada fila según gravedad.
- Acción rápida: cambiar estado, agregar respuesta.

#### Detalle de Ticket
- Información completa del incidente.
- Historial de cambios de estado.
- Campo de respuesta de coordinación (ej: "Visitа agendada para 15/07 a las 10:00").
- Botón de agendamiento de visita técnica con selector de día y horario.

#### Gestión de Contenido
- CRUD de proyectos del portafolio.
- Edición de secciones del portal (Quiénes Somos, Inicio).
- Upload de imágenes con conversión automática JPG → WebP.

#### Gestión de Usuarios
- Alta, baja y edición de miembros del área.
- Asignación de permisos flexibles (editar contenido, responder tickets, gestionar usuarios).
- Solo accesible para la admin principal (directora).

---

## 8. Modelo de Datos

> **Nota:** El modelo se adapta según la tecnología de backend confirmada en la Semana 1.

### Tabla: usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID / INT | Identificador único. |
| `nombre` | VARCHAR | Nombre completo. |
| `email` | VARCHAR | Correo institucional (usado como login). |
| `password_hash` | VARCHAR | Contraseña encriptada. |
| `rol` | ENUM | `admin` / `tecnico` / `editor`. |
| `activo` | BOOLEAN | Si el usuario está habilitado. |
| `created_at` | TIMESTAMP | Fecha de creación. |

### Tabla: tickets

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID / INT | Identificador único. |
| `codigo_seguimiento` | VARCHAR(10) | Código alfanumérico único generado automáticamente. |
| `contacto_nombre` | VARCHAR | Nombre completo del solicitante. |
| `contacto_secretaria` | VARCHAR | Secretaría o dependencia que reporta. |
| `contacto_direccion` | VARCHAR | Dirección o departamento específico. |
| `contacto_rol` | VARCHAR | Rol del empleado dentro del área. |
| `contacto_email` | VARCHAR | Email de contacto (opcional, para notificaciones). |
| `gravedad` | ENUM | `baja` / `media` / `alta` / `critica` (asignada por el sistema o por el técnico). |
| `categoria_problema` | VARCHAR | Tag/categoría del problema (ej: dispositivo, página web, sugerencia). |
| `descripcion` | TEXT | Descripción libre del incidente. |
| `estado` | ENUM | `pendiente` / `en_espera` / `resuelta` / `rechazada`. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Última actualización. |

### Tabla: ticket_respuestas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID / INT | Identificador único. |
| `ticket_id` | FK → tickets | Ticket asociado. |
| `autor_id` | FK → usuarios | Técnico que responde. |
| `mensaje` | TEXT | Respuesta o nota de coordinación. |
| `created_at` | TIMESTAMP | Fecha de la respuesta. |

### Tabla: ticket_estado_historial

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID / INT | Identificador único. |
| `ticket_id` | FK → tickets | Ticket asociado. |
| `estado_anterior` | ENUM | Estado previo. |
| `estado_nuevo` | ENUM | Estado nuevo. |
| `cambiado_por` | FK → usuarios | Quién realizó el cambio. |
| `created_at` | TIMESTAMP | Fecha del cambio. |

### Tabla: proyectos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID / INT | Identificador único. |
| `nombre` | VARCHAR | Nombre del proyecto. |
| `descripcion` | TEXT | Descripción detallada. |
| `imagen_url` | VARCHAR | URL de la imagen (WebP optimizado). |
| `estado` | ENUM | `activo` / `finalizado` / `en_desarrollo`. |
| `categoria` | VARCHAR | Categoría del proyecto. |
| `created_at` | TIMESTAMP | Fecha de creación. |
| `updated_at` | TIMESTAMP | Última actualización. |

---

## 9. Roadmap — 5 Semanas

### Semana 1 — Definición de Tecnologías y Setup

| Día | Actividad | Entregable |
|-----|-----------|-----------|
| 1-2 | Consulta con tutora: confirmar disponibilidad de servidor, dominio y base de datos municipal. Decidir stack backend. | Stack tecnológico definitivo documentado. |
| 3 | Instalación de herramientas: Node.js, Vite, extensiones del editor. | Entorno de desarrollo funcionando. |
| 4 | Inicializar proyecto: `npm create vite@latest`, instalar dependencias (Tailwind, DaisyUI, React Router, etc.). | Proyecto corriendo en `localhost`. |
| 5 | Configurar estructura de carpetas, convenciones de código, paleta de colores en Tailwind. | Estructura base y theming configurado. |

### Semana 2 — Portal Público

| Día | Actividad | Entregable |
|-----|-----------|-----------|
| 1 | Layout base: Navbar, Footer, routing de secciones. Modo oscuro/claro. | Navegación funcional entre secciones. |
| 2 | Sección "Inicio": hero banner, estadísticas con counters animados. | Página de inicio completa. |
| 3 | Sección "Quiénes Somos". | Sección funcional. |
| 4 | Sección "Portafolio de Proyectos": cards con filtros, upload con conversión a WebP. | Portafolio interactivo. |
| 5 | Sección "Capacitaciones": enlace externo al sitio del compañero de equipo. | Enlace funcional. |
| 6-7 | Responsive, transiciones Framer Motion, animaciones de entrada. | Portal público completo y pulido. |

### Semana 3 — Help Desk: Formulario y Tickets

| Día | Actividad | Entregable |
|-----|-----------|-----------|
| 1-2 | Formulario de carga de incidentes con validación (React Hook Form). Ruta oculta, sin enlaces públicos. | Formulario funcional y accesible solo vía QR físico. |
| 3 | Generación de código único alfanumérico y lógica de persistencia. | Tickets se guardan correctamente. |
| 4 | Generación de código QR digital con el código de seguimiento. Botón de descarga como PNG y copia de link. | QR descargable y link copiable. |
| 5 | Consulta pública de estado del ticket por código (sin login). | Flujo completo de usuario externo. |
| 6-7 | Integración con backend. Opción de email para notificaciones. Pruebas del flujo completo. | Flujo de usuario externo terminado. |

### Semana 4 — Panel Administrativo

| Día | Actividad | Entregable |
|-----|-----------|-----------|
| 1 | Login con autenticación. Rutas protegidas. | Acceso admin funcional. |
| 2 | Dashboard: resumen de tickets, gráficos básicos. | Panel de control visible. |
| 3 | Gestión de tickets: tabla con código de colores, filtros, cambio de estado. | Gestión visual funcional. |
| 4 | Detalle de ticket: respuesta de coordinación, agendamiento de visitas. | Seguimiento completo. |
| 5 | Gestión de contenido: CRUD de proyectos y edición de secciones del portal. | Contenido editable desde el admin. |
| 6-7 | Gestión de usuarios y permisos. Sistema de notificaciones por email (cambio de estado). | Admin con roles y notificaciones funcionales. |

### Semana 5 — Integración, Pruebas y Despliegue

| Día | Actividad | Entregable |
|-----|-----------|-----------|
| 1-2 | Integración completa de módulos. Navegación fluida entre portal y admin. | App unificada. |
| 3 | Pruebas: formularios, tickets, autenticación, responsive. Corrección de bugs. | QA completo. |
| 4 | Notificaciones (Sonner), loading states (skeletons), pulido de animaciones. | UX refinada. |
| 5 | Despliegue en servidor o plataforma de hosting. | MVP accesible públicamente. |
| 6-7 | Documentación final, ajustes según feedback de tutora. | Proyecto entregado. |

---

## 10. Requisitos

### 10.1 Requisitos Funcionales

| ID | Requisito | Módulo |
|----|-----------|--------|
| RF-01 | El formulario de carga de tickets debe ser accesible exclusivamente vía códigos QR físicos distribuidos en las oficinas municipales. No debe ser visible en la navegación pública. | Help Desk |
| RF-02 | El sistema debe generar un código alfanumérico único por cada ticket creado. | Help Desk |
| RF-03 | El sistema debe generar un código QR digital con la URL de consulta del ticket, y permitir al usuario descargarlo como imagen (PNG). | Help Desk |
| RF-04 | El sistema debe permitir copiar el link de seguimiento al portapapeles con un solo clic. | Help Desk |
| RF-05 | El sistema debe permitir consultar el estado de un ticket mediante su código, sin autenticación. | Help Desk |
| RF-06 | El sistema debe clasificar los tickets por gravedad (Baja, Media, Alta, Crítica) con código de colores. | Help Desk |
| RF-07 | El sistema debe ofrecer al usuario la opción de proporcionar su email para recibir notificaciones de cambios de estado. | Help Desk |
| RF-08 | El sistema debe enviar notificaciones por email cuando el estado de un ticket cambie (solo si el usuario proporcionó email). | Help Desk |
| RF-09 | El sistema debe permitir actualizar el estado de un ticket (Pendiente, En espera, Resuelta, Rechazada). | Admin |
| RF-10 | El sistema debe registrar respuestas de coordinación en cada ticket (notas, agendamiento de visitas). | Admin |
| RF-11 | El sistema debe autenticar a los miembros del área de Modernización para acceder al panel admin. | Admin |
| RF-12 | La admin principal debe poder gestionar usuarios y asignar permisos flexibles. | Admin |
| RF-13 | El portal debe mostrar secciones informativas: Inicio, Quiénes Somos, Proyectos, y enlace a Capacitaciones (externo). | Portal |
| RF-14 | El sistema debe convertir imágenes subidas a formato WebP automáticamente. | Portal / Admin |
| RF-15 | El sistema debe soportar modo oscuro y modo claro conmutable. | Transversal |
| RF-16 | La interfaz debe ser completamente responsiva (mobile-first). | Transversal |

### 10.2 Requisitos No Funcionales

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RNF-01 | **Rendimiento** | El portal debe cargar en menos de 3 segundos en conexiones estándar. |
| RNF-02 | **Usabilidad** | Interfaz intuitiva que no requiera capacitación previa para empleados municipales. |
| RNF-03 | **Accesibilidad** | Contraste de colores WCAG AA. Navegación por teclado. |
| RNF-04 | **Seguridad** | Contraseñas encriptadas. Rutas admin protegidas. Tokens de sesión seguros. |
| RNF-05 | **Mantenibilidad** | Código modular, componentes reutilizables, convenciones documentadas. |
| RNF-06 | **Compatibilidad** | Funcional en Chrome, Firefox, Safari, Edge. Responsive hasta 320px. |
| RNF-07 | **Escalabilidad** | Arquitectura que permita agregar nuevos módulos en el futuro. |

---

## 11. Estructura de Directorios

```
Proyecto-Modernizacion/
├── public/
│   ├── favicon.ico
│   └── logo-municipal/
│       ├── logo-positivo.png
│       └── logo-negativo.png
├── src/
│   ├── assets/
│   │   └── imagenes/
│   ├── components/
│   │   ├── comunes/          # Botones, Cards, Modal, Navbar, Footer, etc.
│   │   ├── portal/           # Componentes del módulo público
│   │   ├── helpdesk/         # Componentes del sistema de tickets
│   │   └── admin/            # Componentes del panel administrativo
│   ├── contexts/
│   │   └── ThemeContext.jsx   # Contexto del modo oscuro/claro
│   ├── hooks/
│   │   ├── useAuth.js        # Hook de autenticación
│   │   ├── useTickets.js     # Hook de lógica de tickets
│   │   └── useNotifications.js # Hook de notificaciones por email
│   ├── layouts/
│   │   ├── PortalLayout.jsx  # Layout del portal público
│   │   └── AdminLayout.jsx   # Layout del panel admin
│   ├── pages/
│   │   ├── portal/           # Inicio, QuienesSomos, Proyectos, Capacitaciones (enlace externo)
│   │   ├── helpdesk/         # FormularioTicket (ruta oculta), ConsultaTicket, ConfirmacionTicket
│   │   └── admin/            # Dashboard, GestionTickets, GestionContenido, GestionUsuarios, Login
│   ├── services/
│   │   ├── api.js            # Conexión con backend (Supabase o custom)
│   │   └── emailService.js   # Servicio de envío de emails (notificaciones)
│   ├── styles/
│   │   └── theme.js          # Paleta de colores y variables de tema
│   ├── utils/
│   │   ├── generateCode.js   # Generador de código alfanumérico
│   │   ├── imageConverter.js # Conversión de imágenes a WebP
│   │   └── downloadQR.js    # Conversión de SVG a PNG y descarga
│   ├── App.jsx               # Router principal
│   └── main.jsx              # Punto de entrada
├── docs/
│   └── referencia/
│       └── identidad-visual.jpg
├── .env.example           # Variables de entorno de ejemplo (sin valores reales)
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 12. Guía para Desarrollo con IA

### 12.1 Convenciones de Código

Antes de interactuar con herramientas de IA, el proyecto debe respetar estas convenciones para que la IA genere código consistente:

| Convención | Regla |
|-----------|-------|
| **Nomenclatura componentes** | PascalCase: `TicketCard.jsx`, `NavbarAdmin.jsx`. |
| **Nomenclatura funciones** | camelCase: `generateCode()`, `convertToWebp()`. |
| **Nomenclatura constantes** | UPPER_SNAKE_CASE: `COLORS_GRAVEDAD`, `ESTADOS_TICKET`. |
| **Archivos de estilos** | No crear CSS custom. Usar solo Tailwind classes. |
| **Estructura de un componente** | Export default al final. Hooks al inicio. JSX return al final. |
| **Idioma del código** | Variables y funciones en español. Comentarios en español. |
| **Manejo de estado** | useState para local. Context para global (tema, auth). |
| **Props** | Desestructurar en la firma del componente. |

### 12.2 Prompts Sugeridos por Fase

#### Fase: Setup y configuración
```
"Inicializar proyecto React con Vite. Instalar y configurar Tailwind CSS,
DaisyUI, React Router y Framer Motion. Crear estructura de carpetas según
el README del proyecto. Configurar la paleta de colores institucional en
tailwind.config.js."
```

#### Fase: Portal público
```
"Crear componente Navbar responsive para portal institucional con modo
oscuro/claro. Usar Tailwind + DaisyUI. Incluir logo de la municipalidad
y Links de navegación a: Inicio, Quiénes Somos, Proyectos, Agenda, Soporte.
Animación de entrada con Framer Motion."
```

#### Fase: Sistema de tickets
```
"Crear formulario de carga de incidentes técnicos con React Hook Form.
La ruta debe ser oculta (no enlazada desde la navegación pública), accesible
solo vía QR físico. Campos: nombre completo, secretaría, dirección/departamento,
rol, problema (selector de tags + campo libre). Al enviar, generar código
alfanumérico único y pantalla de confirmación con: código de seguimiento,
QR descargable como PNG, botón de copiar link, y opción de ingresar email
para notificaciones."
```

#### Fase: Panel administrativo
```
"Crear panel de gestión de tickets con tabla visual. Cada fila muestra:
código de seguimiento, sector, gravedad (con color), estado (con color),
fecha. Filtros por gravedad, estado y sector. Botón para ver detalle
del ticket."
```

### 12.3 Reglas para Interactuar con IA

1. **Siempre proveer contexto**: Antes de pedir código, indicar en qué archivo se va a integrar y qué componentes ya existen.
2. **Pedir un componente a la vez**: No mezclar lógica de backend con UI en un solo prompt.
3. **Validar después de generar**: Revisar que el código generado cumpla las convenciones del proyecto.
4. **Iterar, no regenerar**: Si algo no funciona, pedir corrección específica en vez de pedir todo de nuevo.
5. **Documentar decisiones**: Cuando la IA proponga algo que se aprueba, anotar en el README o en comentarios del código por qué se eligió esa solución.

### 12.4 Flujo de Trabajo Recomendado

```
1. Leer la sección relevante del README
2. Pedir a la IA que genere el componente/función
3. Revisar el código generado
4. Ajustar según convenciones del proyecto
5. Probar en el navegador
6. Hacer commit con mensaje descriptivo
```

---

## 13. Seguridad y SEO

### 13.1 Seguridad

Dado que el proyecto se desarrolla con asistencia de herramientas de IA, es fundamental seguir prácticas de seguridad rigurosas para proteger credenciales, datos sensibles y la integridad del sistema.

#### Gestión de Variables de Entorno y Claves

| Regla | Descripción |
|-------|-------------|
| **Nunca hardcodear claves** | Todas las claves de API, contraseñas de base de datos y tokens de autenticación deben almacenarse en variables de entorno, nunca en código fuente. |
| **Archivo `.env` en `.gitignore`** | El archivo `.env` nunca se sube a repositorios. Siempre debe estar en `.gitignore`. |
| **Archivo `.env.example`** | Crear un archivo `.env.example` con las variables necesarias pero sin valores reales, como referencia para otros desarrolladores. |
| **No compartir claves con IA** | Al usar herramientas de IA, nunca incluir claves reales en los prompts. Usar valores de ejemplo o Placeholders. |

#### Estructura de Variables de Entorno

```env
# Base de datos (Supabase o servidor municipal)
VITE_DB_URL=
VITE_DB_ANON_KEY=

# Autenticación
VITE_AUTH_PROVIDER=
VITE_AUTH_SECRET=

# Servicios externos (si aplica)
VITE_EMAIL_SERVICE_KEY=
```

#### Prácticas de Seguridad en Desarrollo

| Área | Práctica |
|------|----------|
| **Autenticación** | Contraseñas hasheadas con bcrypt o similar. Tokens JWT con expiración. |
| **Rutas protegidas** | Verificación del token en cada ruta admin, no solo en el login. |
| **Ruta de tickets oculta** | La ruta del formulario de tickets no debe indexarse en buscadores ni aparecer en el sitemap. Accesible solo vía QR físico. |
| **Validación de inputs** | Validar y sanitizar todos los datos del lado del servidor, no solo del cliente. |
| **CORS** | Configurar políticas CORS estrictas en el backend. |
| **Actualizaciones** | Mantener dependencias actualizadas para evitar vulnerabilidades conocidas. |
| **Auditoría** | Registrar quién realizó cada cambio de estado en los tickets (ya contemplado en `ticket_estado_historial`). |

#### Seguridad al Usar IA

| Riesgo | Precaución |
|--------|-----------|
| **Filtración de claves** | Revisar siempre el código generado por IA antes de commitear. Buscar strings que parezcan tokens o claves. |
| **Código malicioso** | La IA puede generar código con vulnerabilidades (SQL injection, XSS). Verificar la validación de inputs. |
| **Dependencias sospechosas** | No instalar paquetes sugeridos por IA sin verificar que sean legítimos y populares. |
| **Datos sensibles** | No pegar en prompts de IA datos reales de usuarios, contraseñas o configuraciones del servidor municipal. |

### 13.2 SEO (Optimización para Motores de Búsqueda)

El portal público debe estar optimizado para que la comunidad pueda encontrar la Dirección de Modernización en buscadores.

#### Prácticas SEO a Implementar

| Elemento | Acción |
|----------|--------|
| **Meta tags** | `<title>` descriptivo por página. `<meta name="description">` con resumen de cada sección. |
| **Open Graph** | Tags `og:title`, `og:description`, `og:image` para compartir en redes sociales. |
| **Semantic HTML** | Usar etiquetas semánticas: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. |
| **Imágenes** | Texto alternativo (`alt`) descriptivo en todas las imágenes. Formato WebP para carga rápida. |
| **Velocidad** | Lazy loading de imágenes. Minimización de bundle con Vite. |
| **Responsividad** | Google prioriza sitios mobile-first. Ya contemplado en los requisitos. |
| **URLs limpias** | Rutas claras: `/proyectos`, `/quienes-somos`. Ruta de tickets oculta, no incluida en navegación. |
| **Sitemap** | Generar `sitemap.xml` para indexación. |
| **Favicon** | Icono de la municipalidad en pestaña del navegador. |

#### Meta Tags por Página

| Página | Title | Description |
|--------|-------|-------------|
| Inicio | Dirección de Modernización — Tinogasta | Portal oficial de la Dirección de Modernización de la Municipalidad de Tinogasta. Proyectos, capacitaciones y soporte técnico. |
| Quiénes Somos | Quiénes Somos — Dirección de Modernización | Conocé al equipo de la Dirección de Modernización y nuestra misión de transformación digital. |
| Proyectos | Proyectos — Dirección de Modernización | Portafolio de proyectos tecnológicos desarrollados para la Municipalidad de Tinogasta. |

---

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Portal Web Oficial y Plataforma de Gestión de Incidentes |
| **Institución** | Dirección de Modernización — Municipalidad de Tinogasta |
| **Tutora Institucional** | Prof. Camila Barrionuevo (Directora de Modernización) |
| **Desarrollador Principal** | Francis Seura (Pasante — Tecnicatura Superior en Desarrollo de Software, IES Tinogasta) |
| **Compañero de Equipo** | Integrante responsable del sitio de Capacitaciones (enlace externo) |
| **Duración** | 5 semanas |
| **Estado** | En planificación |
| **Tipo** | Proyecto grupal — Desarrollo principal + componente externo |

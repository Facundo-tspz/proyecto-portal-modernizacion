# Informe de Auditoría de Código

**Proyecto:** Portal de la Dirección de Modernización — Municipalidad de Tinogasta
**Fecha:** 08-09-2026
**Alcance:** Revisión integral de código, errores, código basura, seguridad, rendimiento y mantenimiento. Solo diagnóstico — no se modificó ningún archivo.

---

## 1. Resumen ejecutivo

| Prioridad | Hallazgos |
|---|---|
| **Alta (5)** | BUG Banner duplica filas, autorización sin rol/activo, RLS insert público sin validación, enlaces `href="#"` rotos, falta `<h1>` en el inicio |
| **Media (14)** | RPC huérfanas, seeds no idempotentes, tema huérfano en BD, reordenamientos sin manejo de error, fallback de imagen repetido, contenido ineditable, etc. |
| **Baja (18+)** | Props muertas, assets sin usar, colores/gradientes duplicados, keys por índice, etc. |

---

## 2. Errores y bugs (gravedad ALTA)

### 2.1 [ALTA] Banner: segunda guardada duplica filas y rompe la carga
**`src/components/admin/editores/EditorBanner.jsx:60-81`**

Tras un `insert` (cuando `form.id` no existe) nunca se asigna el `id` devuelto por Supabase. Si el usuario pulsa "Guardar banner" por segunda vez, se hace otro `insert` → **2 filas en `avisos`**. Combinado con el `.limit(1).single()` del `useEffect` (líneas 17-21), la siguiente carga lanza **PGRST116 "more than one row"** y el banner queda en fallback.

**Fix sugerido:** asignar `form.id = data[0].id` tras el insert (o hacer update/upsert sobre una única fila) y refetch posterior.

### 2.2 [ALTA] Autorización: ruta protegida valida solo sesión, no rol ni cuenta activa
**`src/components/admin/RutaProtegida.jsx:4-22` + `src/App.jsx:30-44`**

Cualquier usuario autenticado (ej. rol `editor`) puede entrar por URL directa a `/mg-tinogasta/usuarios`, `/mg-tinogasta/configuracion` o `/mg-tinogasta/contenido`. La UI de `Preferencias.jsx` (recuperar sesiones, reiniciar contraseñas) se muestra completa a quien entre. Los RPC de admin están protegidos server-side (`es_admin()`), pero falta defensa en profundidad.

### 2.3 [ALTA] RLS: insert público en `tickets` sin validación
**`supabase/migrations/0001_esquema.sql:292-295`**

```sql
create policy "tickets_insert_publico" on public.tickets for insert to authenticated, anon
  with check (true);
```

Cualquier cliente anónimo puede insertar filas directamente en `tickets`, **bypaseando** `crear_ticket_publico`: sin `codigo_seguimiento` generado, sin historial de estado, y setear `estado='resuelta'` o `gravedad` arbitrarios. Riesgo de spam/abuso y datos no normalizados.

**Fix sugerido:** restringir `with check` a `estado = 'pendiente'` y `codigo_seguimiento <> ''`, o `REVOKE INSERT` y exponer solo la RPC.

### 2.4 [ALTA] Enlaces placeholder `href="#"` (ux y SEO)
- **`src/components/comunes/Navbar.jsx:104-111`** — "Capacitaciones" con `href="#"` (no existe ruta de capacitaciones).
- **`src/components/comunes/Navbar.jsx:172`** — Ídem en menú móvil.
- **`src/components/comunes/Footer.jsx:90-98`** — "Ir al sitio de capacitaciones" con `href="#"`.

### 2.5 [ALTA] La página de inicio no tiene `<h1>`
**`src/pages/portal/Inicio.jsx` (todo)**

Los primeros headings son `<h2>` (DestacadosCarrusel.jsx:464, TarjetasEnlace.jsx:79, SomosModernizacion.jsx:74). Falta el heading principal y la jerarquía empieza en h2. Ver informe SEO.

---

## 3. Errores y bugs (gravedad MEDIA)

| # | Ubicación | Hallazgo |
|---|---|---|
| 3.1 | `EditorAccesos.jsx:50-60` | `mover()` muta el state en el lugar (`it.orden = i+1`) y hace `supabase.update` fire-and-forget por item, sin await ni manejo de error. Si un update falla, UI y DB quedan desincronizadas. |
| 3.2 | `EditorDestacados.jsx:210-214` | `guardarOrden()` igual: `Promise.all` sin manejo de error ni refetch. |
| 3.3 | `EditorTextos.jsx:65-72` | `guardar()` hace upsert de **todas** las claves de `config_sitio` (`Object.entries(todos)`), no solo las editadas. Lost-update si otro proceso tocó otras claves. |
| 3.4 | `Dashboard.jsx:16-26` | Conteos sin `.catch` ni error surface (falla → 0 silencioso). Cuenta tickets trayéndolos al cliente, sin `.count()`; crecerá mal con volumen. |
| 3.5 | `Usuarios.jsx:64-73`, `Preferencias.jsx:96-105` | `cargando` sin `try/finally`: si el RPC rechaza (en vez de resolver con error), el spinner queda eterno. |
| 3.6 | `Usuarios.jsx:117-128`, `AuthContext.jsx:102-108` | **Usuario desactivado puede seguir entrando**: el login no chequea `perfiles.activo`; las sesiones vigentes no se revocan al desactivar. |
| 3.7 | `Login.jsx:8-46` | Bloqueo por fuerza bruta (3 intentos) solo client-side vía `localStorage` (`modernizacion_login_intentos`); se elude borrando la clave. Sin rate-limit server-side. |
| 3.8 | `BannerNoticias.jsx:18-22`, `EditorBanner.jsx:17-21` | `.limit(1).single()` sobre `avisos`: más de una fila → PGRST116 y banner en fallback; 0 filas → fallback falso "Nueva capacitación…" aunque el admin haya desactivado todo. |
| 3.9 | `Footer.jsx:10-14,48-51` vs `QuienesSomos.jsx:110-113` | Contacto hardcodeado y duplicado entre ambos; el Footer no usa `useConfigSitio`, si el admin edita `q_contacto_*` el Footer queda desactualizado. |
| 3.10 | `DestacadosCarrusel.jsx:26,42,58,89,112…` | La misma imagen fallback `banner-seismiles.webp` repetida ~10 veces como "imagen" de los items; template no armado y duplica lógica. |
| 3.11 | `QuienesSomos.jsx:176-224` | Claves `config_sitio` leídas por el portal pero **sin campo en el editor admin**: `q_overline`, `q_titulo`, `q_parrafo_1/2`, `q_servicio_*_desc`. Caen siempre al fallback hardcodeado (contenido ineditable). |
| 3.12 | `QuienesSomos.jsx:87-108` | Equipo (`Camila Barrionuevo`, `Francis Seura`) y organigrama hardcodeados; no editables desde admin. |
| 3.13 | `TarjetasEnlace.jsx:88-97` + fallbacks | `href={tarjeta.link}` con `link=''` + `target="_blank"` en los 3 fallbacks → tarjetas clicables que abren la URL actual en pestaña nueva. |
| 3.14 | `Manual.jsx:6-9` + `AdminLayout.jsx:286` | Manual usa `text-slate-800` **con** variante `dark:` sobre fondo admin siempre oscuro `#0b1220`. En modo claro del sistema es casi ilegible (negro sobre azul). Único archivo admin que respeta tema → inconsistencia. |

---

## 4. Código basura

| # | Ubicación | Hallazgo |
|---|---|---|
| 4.1 | `CropImageModal.jsx:49` | No se destructura la prop `carpeta`, pero se pasa desde `EditorBanner.jsx:198` y `EditorDestacados.jsx:152` — prop muerta. |
| 4.2 | `AdminLayout.jsx:223` | `onNavegar={() => {}}` en menú desktop: prop no-op. |
| 4.3 | `Manual.jsx:22-27` | Botón "Descargar PDF (próximamente)" sin `onClick` ni `type`. |
| 4.4 | `AdminLayout.jsx:33-36` | El menú genera links `/tickets?f=pendiente|en_espera|resuelta|rechazada`, pero `Tickets.jsx` es placeholder que ignora el query param — subfiltros muertos. |
| 4.5 | `DestacadosCarrusel.jsx:492` | `className={activa ? 'relative z-10' : 'relative z-10'}` — ternario con ambas ramas idénticas. |
| 4.6 | `supabase/migrations/0006_preferencias.sql:9,15-26` | La columna `perfiles.tema` y la RPC `cambiar_mi_tema` **no las invoca ningún código** (grep de `.rpc(`). El tema vive 100% en `localStorage` (`ThemeContext.jsx:7,16`). Código muerto en BD. |
| 4.7 | `supabase/migrations/0001_esquema.sql:167,203` | RPC `crear_ticket_publico` y `consultar_ticket_por_codigo` sin consumidor (Tickets es placeholder). También `generar_codigo_seguimiento` (solo interna). Todo el módulo tickets vive solo en BD. |
| 4.8 | `package.json` | **Dependencias declaradas y sin uso**: `qrcode.react`, `react-hook-form`, `date-fns`, `browser-image-compression` (ningún import en `src/`). |
| 4.9 | Assets muertos | `src/assets/hero.png`, `src/assets/vite.svg`, `src/assets/react.svg`, `public/images/logo/logo-positivo.png` (sin referencias en `src/`), `src/assets/imagenes/` (vacía). |

---

## 5. Seguridad

| # | Gravedad | Ubicación | Hallazgo |
|---|---|---|---|
| 5.1 | media-alta | `RutaProtegida.jsx` | Validación solo de sesión (ver 2.2). |
| 5.2 | media | `Usuarios.jsx:117-128` / `AuthContext` | Desactivación parcial (ver 3.6). |
| 5.3 | media | `Login.jsx` | Bloqueo login client-side con localStorage (ver 3.7). |
| 5.4 | media | `0001:292-295` | RLS insert tickets `check(true)` (ver 2.3). |
| 5.5 | baja-media | `Usuarios.jsx:79-102`, `0004:12-50` | `crear_usuario_admin` no valida `length(p_password)>=8` server-side; client tampoco valida formato email/confirmación. |
| 5.6 | baja | `Usuarios.jsx`, `Preferencias.jsx` | `toast.error(error.message)` expone mensajes crudos del RPC ("No autorizado" y detalles). |
| 5.7 | info | `src/lib/supabase.js:3-7` | Anon/publishable key y URL hardcodeados como fallback en `src`. La key publishable es pública por diseño, pero el fallback vuelve decorativo al `.env` y duplica el lugar de cambio si se rota la key. |
| 5.8 | OK | `0001,0004,0005,0006` | RPC admin con `SECURITY DEFINER` + `es_admin()` server-side y `set search_path` correctamente implementados. Sin `service_role`/`sk-`/`postgres://` en el repo. `.env` en `.gitignore`, no trackeado. |

---

## 6. Mantenimiento y duplicación

| # | Gravedad | Ubicación | Hallazgo |
|---|---|---|---|
| 6.1 | media | `AdminLayout.jsx:18-77`, `App.jsx:23-44`, `Dashboard.jsx:97,119`, `Login.jsx:45` | Ruta `/mg-tinogasta/*` repetida ~15 veces; estados de tickets reales repetidos (enum, strings); roles repetidos. Faltan constantes centralizadas. |
| 6.2 | baja-media | `EditorAccesos.jsx:19-26` vs `TarjetasEnlace.jsx:33-40` | Los 6 IDs de icono de la BD duplicados en admin y portal (2 lugares + valor DB). |
| 6.3 | baja | Todo el panel | `from-indigo-500 to-cyan-400` (~10 veces), `bg-[#101a2e]` (~15 veces), `bg-[#0b1220]`, `rounded-[calc(1rem-1px)]` repetidos. Falta componente `<Card/>`/utilidades. |
| 6.4 | baja | `EditorDestacados.jsx` (404 líneas), `Usuarios.jsx` (361) | Componentes que superan 300 líneas y mezclan lógica (lista, borrador, form, imágenes). |
| 6.5 | baja | `EditorDestacados.jsx:24,189,298` | `MAX_ITEMS = 5` hardcodeado en 3 lugares y no coincide necesariamente con el carrusel público (máx 2+3). |
| 6.6 | baja | `DestacadosCarrusel.jsx:15-117` y seeds | El fallback del carrusel duplica el contenido de los seeds SQL. Mantenimiento doble. |

---

## 7. Rendimiento

| # | Gravedad | Ubicación | Hallazgo |
|---|---|---|---|
| 7.1 | media | `DestacadosCarrusel.jsx:266-307` | Dos `useEffect` setean `setCargando(false)`: timeout fijo de 900 ms que puede flashear el fallback antes de llegar la data real. |
| 7.2 | baja | `useConfigSitio.js:7-24` | Hook sin caché/contexto: cada componente montado hace su propia request a `config_sitio`. Duplicará fetches si se reutiliza. |
| 7.3 | baja | `Inicio.jsx` | La home dispara ~6 requests al montar (3 categorías + avisos + tarjetas + config). No duplicados, pero consolidables. |
| 7.4 | baja | `CropImageModal.jsx:65-67` | `URL.createObjectURL` nunca se revoca → memory leak acumulativo al abrir/cerrar el crop. |
| 7.5 | baja | `AuthContext.jsx:71-76` | Latido `registrar_ultimo_acceso` cada 60 s sin `.catch`; cada pestaña abierta escribe 1 vez por minuto (churn de escritura). |
| 7.6 | baja | `EditorDestacados.jsx:394,225-228` | `enVivo` en deps de useEffect recrea el efecto; `subirParaItem` usa `catActiva` del closure (carpeta vieja si cambias categoría mientras sube). |
| 7.7 | verde | — | Sin loops de useEffect, claves de React correctas (solo `key={i}` cosmético en breadcrumb `AdminLayout.jsx:107` y QuienesSomos:264), animaciones framer-motion razonables. |

---

## 8. SQL: migraciones

| # | Gravedad | Hallazgo |
|---|---|---|
| 8.1 | media | **`on conflict do nothing` SIN target** en seeds de `0001:342-345`, `0002:137-158`, `0003:59-62`: como `id` es `gen_random_uuid()` en cada ejecución, el conflicto nunca se dispara y cada re-ejecución **duplica los seeds**. Solo `config_sitio` lo hace bien con `on conflict (clave)`. |
| 8.2 | media | `0004:35-58` insert directo en `auth.users`/`auth.identities` a mano (frágil entre versiones de Supabase, deja columnas sin setear: `invited_at`, `is_super_admin`, etc.). Recomendación: `supabase.auth.admin.createUser`. |
| 8.3 | baja | Helpers `es_admin*` (0001:102-138) sin `revoke execute from public` (restringir buenas prácticas). |
| 8.4 | baja | `set_updated_at` (0001:234) vs `set_updated_at_contenido` (0002:77) idénticas; nombres inconsistentes. |
| 8.5 | media | **Índices faltantes**: `tickets(estado)` (usado en filtros Dashboard/futuros), FKs `ticket_respuestas.ticket_id` y `ticket_estado_historial.ticket_id` (Postgres NO indexa FKs), compuestos `(activo, orden)` en tabla de contenido (tablas chicas, baja). Sugerencia: migración 0007. |
| 8.6 | OK | RLS habilitado en las 11 tablas; políticas públicas solo sobre contenido; `perfiles` no expone datos sensibles; triggers consistentes; sin UUID hardcodeado de admin en políticas. |

---

## 9. Dependencias del bundle (código)

- **JS único**: `index-*.js` ~740 KB raw / **~203 KB gzip**.
- **CSS único**: ~70 KB / ~11 KB gzip.
- **Sin code splitting por ruta**: `App.jsx` importa TODAS las páginas eager (incluidas las 7 del panel `/mg-tinogasta`). No hay `React.lazy`/`Suspense`.
- Librerías pesadas en el bundle principal que solo usan el admin: `framer-motion`, `react-image-crop`, `sonner`. Y `qrcode.react`, `react-hook-form`, `date-fns`, `browser-image-compression` ni siquiera se usan (ver 4.8).

---

## 10. Otros (cosmético / UX)

- `Tickets.jsx:11-13` dice "se habilita en la próxima etapa" mientras el menú y Dashboard la presentan como operativa con subfiltros. Expectativa rota.
- `Usuarios.jsx:240` — indentación torcida (cosmético).
- `Footer.jsx:106` — `© 2026` hardcodeado (quedará obsoleto).
- `DestacadosCarrusel.jsx:232-256` — en categoría Noticias la tarjeta secundaria no permite abrir el link (solo promueve), inconsistente con la principal.
- Divisores decorativos sin `aria-hidden` en `QuienesSomos.jsx:412,418-421`.
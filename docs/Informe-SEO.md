# Informe de Auditoría SEO — Portal de Modernización Tinogasta

**Fecha:** 08-09-2026
**Alcance:** Archivos raíz, `index.html`, `public/`, config Netlify/Vite, imágenes, rendimiento y estructura del portal. Solo diagnóstico — no se modificó nada.

---

## 1. Resumen ejecutivo (nota SEO general)

| Aspecto | Estado | Gravedad |
|---|---|---|
| `<title>` y meta description en `index.html` | ✅ Correctos (~38 y 126 chars) | — |
| Favicon (`/favicon.svg`) | ❌ **404 en producción: archivo no existe** | **ALTA** |
| Meta por ruta (title/description/og por página) | ❌ No existe (todo estático en index.html) | **ALTA** |
| Enlaces rotos `href="#"` | ❌ 3 ocurrencias (Capacitaciones) | ALTA |
| `<h1>` en la home | ❌ Falta (empieza en h2) | ALTA |
| Open Graph / Twitter Cards | ❌ Faltan todos | MEDIA |
| Canonical | ❌ Falta | MEDIA |
| JSON-LD (Organization / GovernmentOrganization) | ❌ Falta | MEDIA |
| Sitemap / robots.txt | ❌ No existen | MEDIA |
| Pre-render / SSR | ❌ SPA puro (JS-only rendering) | MEDIA |
| Headers de seguridad (Netlify) | ❌ No existe `netlify.toml` | ALTA |
| Bundle único sin code-splitting | ❌ ~203 KB gzip | ALTA |
| Imágenes | ✅ alt + lazy loading mayormente bien; banner sin fetchpriority/dimensiones | MEDIA |

---

## 2. Revisión de `index.html`

Archivo: `index.html` (31 líneas) — Verificado.

| Elemento | Estado | Detalle |
|---|---|---|
| `lang="es"` | ✅ | `index.html:2` |
| `<meta charset>` | ✅ | |
| `<meta viewport>` | ✅ | |
| `<title>` | ✅ | "Dirección de Modernización — Tinogasta" (~38 chars, correcto) |
| `meta description` | ✅ | **126 chars** (recomendado 120-160), bien redactada — `index.html:7-10` |
| `<link rel="icon" href="/favicon.svg">` | ❌ | **El archivo `/favicon.svg` NO existe en `public/` ni en `dist/`** → 404 en producción, navegador muestra icono genérico. Fix trivial: agregar `public/favicon.svg` (o reemplazar por `logo-positivo.png`, que sí existe y está sin usar). |
| Script anti-FOUC tema | ✅ | `index.html:12-25` — no afecta SEO; evita salto de tema. |
| `og:title` / `og:description` / `og:image` / `og:type` / `og:url` | ❌ | Faltan todos. Al compartir en WhatsApp/IG/FB se muestra solo el título del navegador sin imagen. |
| `twitter:card` / `twitter:title/description/image` | ❌ | Faltan. |
| `<link rel="canonical">` | ❌ | Falta. |
| JSON-LD (Organization / GovernmentOrganization / WebSite) | ❌ | Falta. Al ser un portal de gobierno, conviene `GovernmentOrganization` + `WebSite` con los datos de contacto reales. |

### Problemas clave de SEO en el `index.html`

1. **Todo el SEO es estático**: una sola `<title>` y `meta description` para TODAS las rutas (`/`, `/quienes-somos`, `/proyectos` y hasta las 7 del panel admin). **No existe react-helmet ni gestor de meta por ruta** (verificado con grep — solo README lo menciona como intención).
2. **Falta el favicon**, lo más barato de corregir y lo más visible (error 404 en cada carga).

---

## 3. SEO on-page (estructura, headings, enlaces)

### 3.1 [ALTA] La home no tiene `<h1>`
`src/pages/portal/Inicio.jsx` no contiene ningún `<h1>`. La jerarquía empieza en `<h2>`:
- `DestacadosCarrusel.jsx:464` (h2)
- `TarjetasEnlace.jsx:79` (h2)
- `SomosModernizacion.jsx:74` (h2)

Cada página debe tener exactamente un `<h1>`; la home es la más indexable del sitio.

### 3.2 [ALTA] Enlaces rotos `href="#"`
- `Navbar.jsx:104-111` — "Capacitaciones" (no hay ruta `/capacitaciones` en `App.jsx`).
- `Navbar.jsx:172` — menú móvil.
- `Footer.jsx:90-98` — "Ir al sitio de capacitaciones".

Son enlaces muertos que además dispersan presupuesto de rastreo hacia un anchor `#`.

### 3.3 [ALTA] Falta `<title>` y meta por ruta
Todas las páginas comparten el mismo `<title>` (ver sección 2). Sin `react-helmet-async`, un hook simple que setee `document.title` en cada página, o meta tags dinámicos por ruta, el CTR en Google y el compartir en redes se degradan.

### 3.4 [MEDIA] Tarjetas de enlace con `href=""` + `target="_blank"`
`TarjetasEnlace.jsx:88-97` — los 3 fallbacks tienen `link: ''` y el anchor tiene `target="_blank"`. Resultado: las tarjetas son clicables, abren la URL actual en una pestaña nueva y confunden al usuario (y al rastreador).

### 3.5 [MEDIA] Tabs del carrusel sin ARIA completo
`DestacadosCarrusel.jsx:469-497` — botones con `role="tab"` pero sin contenedor `role="tablist"`, sin `aria-selected` y sin navegación por teclado (flechas). Lector de pantalla ve pestañas sin estado.

### 3.6 [BAJA/MEDIA] Jerarquía de encabezados en páginas interiores
- **`Inicio.jsx`**: sin h1 (3.1).
- **`QuienesSomos.jsx`**: ✅ un solo `<h1>` (línea 255), bien.
- **`Proyectos.jsx`**: un solo `<h1>` (línea 4), pero es la página "Sección en construcción" — contenido de relleno indexable.
- **Footer `h3`** (`Footer.jsx:55,69,87`) sin h2 contenedor → salto h1→h3 en `/proyectos`.

### 3.7 Hecho bien ✅
- **Alt en imágenes**: todas las `<img>` del portal tienen `alt` (`Navbar.jsx:76`, `Footer.jsx:35`, `DestacadosCarrusel.jsx:186,242`). El crop usa `alt="Recorte"`. El banner usa `background-image` + `aria-hidden` (decorativo, correcto).
- **Lazy loading**: `loading="lazy"` en las tarjetas del carrusel (`DestacadosCarrusel.jsx:187,243`). Sin videos.
- **Sin múltiples `<h1>`** por página.

---

## 4. SEO técnico (archivos, infraestructura)

### 4.1 [MEDIA] No hay `sitemap.xml` ni `robots.txt`
No existen en `public/` ni en `dist/`. Netlify **no los genera automáticamente** para builds Vite estáticos.

**Acción sugerida:**
- `public/robots.txt`: `User-agent: * / Allow: /` + referencia al sitemap.
- `public/sitemap.xml`: 3 URLs públicas (`/`, `/quienes-somos`, `/proyectos`) + dominio canónico `https://portal-modernizacion.netlify.app/`.

### 4.2 [MEDIA] SPA sin pre-render / SSR (fases de renderizado JS)
`index.html` solo tiene `<div id="root">`; todo se pinta en cliente vía `main.jsx`. Impacto:
- Google/Bing deben ejecutar JS para ver contenido (mejorable).
- Al ser un sitio `.gob` institucional, el coste/beneficio favorece **pre-render de las 3 rutas públicas** (`react-snap`, `vite-prerender-plugin`) o al menos un gestor de `document.title`/meta por ruta.
- Los og:/canonical serían idénticos para todas las rutas sin esto.

### 4.3 [ALTA] Sin `netlify.toml` → sin headers de seguridad ni cache
No existe `netlify.toml`. Consecuencias:
- **Sin CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy** → un `.gob.ar` vulnerable a clickjacking básico.
- **Sin cache headers explícitos** para `/assets/*` (Vite hashea los nombres → podrían ser `immutable, max-age=31536000`).
- Brotli/gzip: Netlify comprime por CDN por defecto (no requiere config, pero no se garantiza a nivel config).

**Acción sugerida:** crear `netlify.toml` con `[[headers]]` de seguridad y cache.

### 4.4 [ALTA] Bundle único sin code-splitting
Medido sobre `dist/` real:
- **`index-*.js` = 740 KB raw / ~203 KB gzip.**
- `App.jsx:22-44` importa TODAS las páginas eager (portal + 7 del panel).
- Sin `React.lazy`/`Suspense`.
- Librerías pesadas solo de admin (framer-motion, react-image-crop, sonner) en el bundle principal junto con dependencias sin uso (qrcode.react, react-hook-form, date-fns, browser-image-compression).

**Acción sugerida:** `React.lazy` del bloque `/mg-tinogasta/*` y/o `manualChunks` + `build.chunkSizeWarningLimit` en `vite.config.js`. Un chunk separado para el panel reduce ~40-50% el JS del portal.

---

## 5. Imágenes

| Imagen | Tamaño | Estado |
|---|---|---|
| `public/images/banner-noticia/banner-seismiles.webp` | ~146 KB | **Es la imagen LCP** (hero del banner) y el fallback de ~13 referencias (carrusel + banner + seeds). **Sin `fetchpriority="high"`, sin `width/height` explícitos** (solo clases de aspecto) → posible CLS. |
| `public/images/logo/logo-negativo.png` | ~68 KB | Usado en `Navbar.jsx:75` y `Footer.jsx:35`. Optimizable a SVG. |
| `public/images/logo/logo-positivo.png` | ~76 KB | **Sin referencias en `src/`** (asset muerto). Optimizable/eliminable. |
| `src/assets/hero.png` | ~13 KB | Sin referencias (muerto). |
| `src/assets/vite.svg`, `react.svg` | — | Plantilla Vite sin usar. |
| Uploads admin | — | Forzados a `.webp` por `storage.js:8` ✅ |

**Hecho bien ✅:** uploads en `.webp` por diseño; `alt` y `loading="lazy"` presentes.

**Acciones sugeridas:** preload/fetchpriority en el banner; dimensiones explícitas; logos a SVG; eliminar assets muertos.

---

## 6. Redirecciones / URLs

- `public/_redirects`: `/* /index.html 200` ✅ (SPA fallback correcto, Netlify lo copia a `dist/` automáticamente).
- Dominio `portal-modernizacion.netlify.app` (Netlify). No hay dominio propio `.gob.ar` apuntado todavía (fuera de alcance del repo).
- Ruta del panel `/mg-tinogasta/*` indexable? → Sí, técnicamente es indexable por Google (no hay `noindex`). La página de acceso/admin no debería indexarse; sugerencia: `noindex` en el login con el gestor de meta por ruta de la sección 3.3.

---

## 7. Checklist final (priorizado)

### Crítico para SEO (hacer primero)
1. [ ] **Crear `/favicon.svg`** (o usar `logo-positivo.png`) — elimina el 404.
2. [ ] **`<h1>` en la home** (`Inicio.jsx`).
3. [ ] **Enlaces de "Capacitaciones"**: darles ruta real u ocultarlos (`Navbar` + `Footer`).
4. [ ] **Meta por ruta**: `react-helmet-async` o hook `usePageMeta` (title + description + canonical + og por página).
5. [ ] **`netlify.toml`**: headers de seguridad (CSP, XFO, HSTS) y cache immutable para `/assets/*`.

### Importante
6. [ ] Open Graph + Twitter Cards + canonicals (con la URL real del dominio).
7. [ ] JSON-LD `GovernmentOrganization` + `WebSite`.
8. [ ] `robots.txt` + `sitemap.xml` (3 rutas públicas).
9. [ ] Code-splitting: `React.lazy` del bloque admin + `manualChunks`; eliminar dependencias sin uso (`qrcode.react`, `react-hook-form`, `date-fns`, `browser-image-compression`).
10. [ ] `noindex` en `/mg-tinogasta/*` y en `Proyectos` mientras esté "en construcción".

### Perfeccionamiento
11. [ ] `fetchpriority="high"` y dimensiones en el banner LCP.
12. [ ] ARIA completa en tabs del carrusel.
13. [ ] Logos a SVG; eliminar `hero.png`, `vite.svg`, `react.svg`, `logo-positivo.png`.
14. [ ] H1/estructura: h2 antes de los h3 del Footer.

---

## 8. Notas
- No se modificó ningún archivo: todo lo anterior es diagnóstico.
- El proyecto es una SPA con SEO estándar de Vite; el cambio de mayor impacto es el **pre-render de rutas públicas o meta por ruta** (sección 4.2 + 3.3).
- El 404 del favicon (`index.html:5` → archivo inexistente) es el único defecto que además rompe la pestaña del navegador todos los días; el de mayor visibilidad para corregir.
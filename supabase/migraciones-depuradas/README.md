# Migraciones depuradas (estado final de la BD)

Versiones purgadas de la base de datos: reproducen el **esquema final** del
proyecto desde cero, sin la historia de fixes y correcciones intercalada en
`supabase/migrations/` (0001 → 0012).

## Uso

- **Solo para una BD NUEVA / VACÍA** (por ejemplo, replicar el proyecto en un
  entorno limpio o un proyecto de prueba desechable).
- **NUNCA ejecutar** sobre la base que ya usa el sitio en producción: esa base
  ya se aplicó con las migraciones 0001–0012 y contiene datos.
- Aplicar cada archivo **una sola vez, en orden**:

1. `01_esquema_core.sql` — extensiones, enums, tablas núcleo
   (`perfiles`, `tickets`, `ticket_respuestas`, `ticket_estado_historial`,
   `proyectos`), helpers RLS, funciones de tickets (finales), triggers,
   políticas RLS y seed de proyectos.
2. `02_contenido_storage.sql` — contenido editable del portal
   (`config_sitio`, `avisos`, `capacitaciones`, `noticias`,
   `tarjetas_enlace`, `destacados_proyectos`), RLS, bucket de Storage
   `modernizacion` + políticas, y todos los seeds iniciales.
3. `03_usuarios_seguridad.sql` — gestión de usuarios, sesiones y contraseñas
   (panel admin) y rate-limit de login (`login_intentos`).

## Probar en un proyecto nuevo

En Supabase: **New Project** (gratis, desechable) → **SQL Editor** → pegar y
ejecutar cada archivo en orden. Si los tres aplican sin error, el esquema
final quedó replicado correctamente.
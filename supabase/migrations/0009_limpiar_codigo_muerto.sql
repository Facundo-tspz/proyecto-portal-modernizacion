-- ============================================================
-- 0009_limpiar_codigo_muerto.sql
-- Limpieza de código/objetos muertos que quedaron de diseños
-- anteriores y que ninguna UI consume:
--   1. perfiles.tema + RPC cambiar_mi_tema: el tema claro/oscuro
--      vive 100% en localStorage (ThemeContext + script anti-FOUC
--      de index.html). El revert de tema por usuario (a1b7604)
--      dejó la columna y la función sin uso.
--   2. Claves banner_* de config_sitio: ni BannerNoticias ni
--      EditorBanner las leen; ambos usan la tabla avisos.
-- Idempotente: puede ejecutarse sobre una BD ya existente.
-- ============================================================

-- 1. Columna perfiles.tema (elimina eventuales valores obsoletos)
alter table public.perfiles drop column if exists tema;

-- 2. RPC cambiar_mi_tema (se elimina también su grant/revoke)
drop function if exists public.cambiar_mi_tema(text);

-- 3. Claves banner_* de config_sitio (huérfanas del diseño con avisos)
delete from public.config_sitio
 where clave in ('banner_activo', 'banner_texto', 'banner_link', 'banner_imagen');
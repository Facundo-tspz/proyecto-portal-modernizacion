-- ============================================================
-- 0003_almacenamiento.sql
-- Tabla destacados_proyectos (carrusel de Proyectos en el home)
-- y Storage: bucket "modernizacion" público con políticas de
-- escritura admin/editor.
-- Depende de: 0001 (es_admin_o_editor).
--
-- RE-EJECUTABLE SIN PERDER DATOS: la tabla se crea con
-- "if not exists" y el seed es idempotente (on conflict (id)).
-- ============================================================

-- ---------- Tabla: destacados_proyectos ----------
create table if not exists public.destacados_proyectos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  leyenda text default '',
  imagen_url text default '',
  link text default '',
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.destacados_proyectos enable row level security;

drop policy if exists "destacados_proyectos_select_publico" on public.destacados_proyectos;
create policy "destacados_proyectos_select_publico" on public.destacados_proyectos for select using (true);

drop policy if exists "destacados_proyectos_write" on public.destacados_proyectos;
create policy "destacados_proyectos_write" on public.destacados_proyectos for all using (public.es_admin_o_editor()) with check (public.es_admin_o_editor());

drop trigger if exists trg_destacados_proyectos_updated on public.destacados_proyectos;
create trigger trg_destacados_proyectos_updated before update on public.destacados_proyectos
for each row execute function public.set_updated_at_contenido();

-- ---------- Storage: bucket "modernizacion" (público) ----------
insert into storage.buckets (id, name, public)
values ('modernizacion', 'modernizacion', true)
on conflict (id) do nothing;

drop policy if exists "modernizacion_public_read" on storage.objects;
create policy "modernizacion_public_read" on storage.objects for select
using (bucket_id = 'modernizacion');

drop policy if exists "modernizacion_admin_write" on storage.objects;
create policy "modernizacion_admin_write" on storage.objects for insert
with check (bucket_id = 'modernizacion' and public.es_admin_o_editor());

drop policy if exists "modernizacion_admin_update" on storage.objects;
create policy "modernizacion_admin_update" on storage.objects for update
using (bucket_id = 'modernizacion' and public.es_admin_o_editor());

drop policy if exists "modernizacion_admin_delete" on storage.objects;
create policy "modernizacion_admin_delete" on storage.objects for delete
using (bucket_id = 'modernizacion' and public.es_admin_o_editor());

-- ---------- Seed: destacados_proyectos ----------
insert into public.destacados_proyectos (id, titulo, leyenda, imagen_url, link, orden) values
  ('00000000-0000-0000-0000-000000000051', 'Portal de Modernización', 'La plataforma institucional que estás viendo: información, capacitaciones y gestión de incidencias.', '/images/banner-noticia/banner-seismiles.webp', '', 1),
  ('00000000-0000-0000-0000-000000000052', 'Red WiFi Municipal', 'Conectividad gratuita en espacios públicos y oficinas de la municipalidad.', '/images/banner-noticia/banner-seismiles.webp', '', 2),
  ('00000000-0000-0000-0000-000000000053', 'Gestión de Trámites Digitales', 'Digitalización de trámites municipales para reducir tiempos de espera.', '/images/banner-noticia/banner-seismiles.webp', '', 3)
on conflict (id) do nothing;

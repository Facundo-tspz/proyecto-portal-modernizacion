-- ============================================================
-- migraciones-depuradas / 01_esquema_core.sql
-- ------------------------------------------------------------------
-- VERSIONES PURGADAS DE LA BASE DE DATOS — ESTADO FINAL.
-- Consolidación de las migraciones 0001→0012 en archivos lógicos,
-- eliminando la historia de fixes y el código muerto.
--
-- ⚠️ SOLO PARA UNA BD NUEVA / VACÍA.
-- No ejecutar sobre la base que ya usa el sitio en producción.
-- Aplicar en orden: 01 → 02 → 03 (una sola vez cada una).
--
-- Contenido: extensiones, enums, tablas núcleo, helpers RLS,
-- funciones de tickets (finales), triggers y políticas RLS,
-- y el seed de proyectos.
-- ============================================================

-- ---------- Extensiones ----------
create extension if not exists pgcrypto;

-- ============================================================
-- Enums
-- ============================================================
drop type if exists rol_usuario cascade;
create type rol_usuario as enum ('admin', 'tecnico', 'editor');

drop type if exists gravedad_ticket cascade;
create type gravedad_ticket as enum ('baja', 'media', 'alta', 'critica');

drop type if exists estado_ticket cascade;
create type estado_ticket as enum ('pendiente', 'en_espera', 'resuelta', 'rechazada');

drop type if exists estado_proyecto cascade;
create type estado_proyecto as enum ('activo', 'finalizado', 'en_desarrollo');

-- ============================================================
-- Tablas (antes que las funciones que las referencian)
-- ============================================================

-- perfiles: incluye ultimo_acceso (0005). La columna "tema" fue
-- eliminada (0009): el tema claro/oscuro vive en localStorage.
drop table if exists public.perfiles cascade;
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol rol_usuario not null default 'editor',
  activo boolean not null default true,
  ultimo_acceso timestamptz,
  created_at timestamptz not null default now()
);

-- tickets: incluye contacto_telefono (0011, formulario público).
drop table if exists public.tickets cascade;
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  codigo_seguimiento text not null unique,
  contacto_nombre text not null,
  contacto_secretaria text not null,
  contacto_direccion text default '',
  contacto_rol text default '',
  contacto_email text default '',
  contacto_telefono text default '',
  gravedad gravedad_ticket not null default 'media',
  categoria_problema text default '',
  descripcion text not null,
  estado estado_ticket not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop table if exists public.ticket_respuestas cascade;
create table public.ticket_respuestas (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  autor_id uuid references auth.users (id) on delete set null,
  mensaje text not null,
  created_at timestamptz not null default now()
);

drop table if exists public.ticket_estado_historial cascade;
create table public.ticket_estado_historial (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  estado_anterior estado_ticket,
  estado_nuevo estado_ticket not null,
  cambiado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- proyectos (reservada para sección futura del navbar)
drop table if exists public.proyectos cascade;
create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text default '',
  imagen_url text default '',
  estado estado_proyecto not null default 'activo',
  categoria text default '',
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Helpers RLS (versión final: search_path incluye auth)
-- ============================================================

create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'admin' and p.activo
  );
$$;

create or replace function public.es_admin_o_editor()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'editor') and p.activo
  );
$$;

create or replace function public.es_admin_o_tecnico()
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol in ('admin', 'tecnico') and p.activo
  );
$$;

-- ============================================================
-- Funciones de negocio (versiones FINALES)
-- ============================================================

-- Código de seguimiento único
create or replace function public.generar_codigo_seguimiento()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_codigo text;
  existe boolean;
begin
  loop
    nuevo_codigo := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    select exists(
      select 1 from public.tickets where codigo_seguimiento = nuevo_codigo
    ) into existe;
    exit when not existe;
  end loop;
  return nuevo_codigo;
end;
$$;

-- Insertar ticket público (formulario QR) — versión final con p_telefono (0011)
create or replace function public.crear_ticket_publico(
  p_nombre text,
  p_secretaria text,
  p_direccion text,
  p_rol text,
  p_email text,
  p_categoria text,
  p_descripcion text,
  p_gravedad gravedad_ticket default 'media',
  p_telefono text default ''
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_id uuid;
  codigo text;
begin
  codigo := public.generar_codigo_seguimiento();
  insert into public.tickets (
    codigo_seguimiento, contacto_nombre, contacto_secretaria, contacto_direccion,
    contacto_rol, contacto_email, contacto_telefono, categoria_problema,
    descripcion, gravedad
  ) values (
    codigo, p_nombre, p_secretaria, p_direccion, p_rol, p_email,
    p_telefono, p_categoria, p_descripcion, p_gravedad
  ) returning id into nuevo_id;

  insert into public.ticket_estado_historial (ticket_id, estado_nuevo)
  values (nuevo_id, 'pendiente');

  return json_build_object('id', nuevo_id, 'codigo_seguimiento', codigo);
end;
$$;

-- Consulta pública por código — versión final enriquecida (0011):
-- incluye historial de estados y respuestas del técnico.
create or replace function public.consultar_ticket_por_codigo(p_codigo text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado jsonb;
begin
  select jsonb_build_object(
    'codigo_seguimiento', t.codigo_seguimiento,
    'estado', t.estado,
    'gravedad', t.gravedad,
    'categoria_problema', t.categoria_problema,
    'descripcion', t.descripcion,
    'created_at', t.created_at,
    'updated_at', t.updated_at,
    'historial', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'estado_anterior', h.estado_anterior,
          'estado_nuevo', h.estado_nuevo,
          'responsable', p.nombre,
          'created_at', h.created_at
        ) order by h.created_at
      )
      from public.ticket_estado_historial h
      left join public.perfiles p on p.id = h.cambiado_por
      where h.ticket_id = t.id
    ), '[]'::jsonb),
    'respuestas', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'mensaje', r.mensaje,
          'autor', p.nombre,
          'created_at', r.created_at
        ) order by r.created_at
      )
      from public.ticket_respuestas r
      left join public.perfiles p on p.id = r.autor_id
      where r.ticket_id = t.id
    ), '[]'::jsonb)
  )
  into resultado
  from public.tickets t
  where t.codigo_seguimiento = upper(p_codigo);

  if resultado is null then
    raise exception 'No se encontró ningún ticket con ese código';
  end if;

  return resultado::json;
end;
$$;

-- Trigger: actualizar updated_at (genérico)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Trigger: registrar historial al cambiar estado.
-- Versión FINAL (0012): SECURITY DEFINER para poder insertar en
-- ticket_estado_historial bajo RLS con solo política de lectura.
create or replace function public.registrar_cambio_estado()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.estado is distinct from old.estado then
    insert into public.ticket_estado_historial (ticket_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, old.estado, new.estado, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tickets_updated on public.tickets;
create trigger trg_tickets_updated
  before update on public.tickets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tickets_historial on public.tickets;
create trigger trg_tickets_historial
  before update on public.tickets
  for each row execute function public.registrar_cambio_estado();

drop trigger if exists trg_proyectos_updated on public.proyectos;
create trigger trg_proyectos_updated
  before update on public.proyectos
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================

alter table public.perfiles enable row level security;

drop policy if exists "perfiles_select" on public.perfiles;
create policy "perfiles_select"
  on public.perfiles for select
  using (auth.uid() = id or public.es_admin());

drop policy if exists "perfiles_update_admin" on public.perfiles;
create policy "perfiles_update_admin"
  on public.perfiles for update
  using (public.es_admin())
  with check (public.es_admin());

alter table public.tickets enable row level security;

drop policy if exists "tickets_insert_publico" on public.tickets;
create policy "tickets_insert_publico"
  on public.tickets for insert
  with check (
    estado = 'pendiente'
    and gravedad in ('baja', 'media', 'alta', 'critica')
    and codigo_seguimiento <> ''
  );

drop policy if exists "tickets_select_admin" on public.tickets;
create policy "tickets_select_admin"
  on public.tickets for select
  using (public.es_admin_o_tecnico());

drop policy if exists "tickets_update_admin" on public.tickets;
create policy "tickets_update_admin"
  on public.tickets for update
  using (public.es_admin_o_tecnico());

alter table public.ticket_respuestas enable row level security;

drop policy if exists "respuestas_select_admin" on public.ticket_respuestas;
create policy "respuestas_select_admin"
  on public.ticket_respuestas for select
  using (public.es_admin_o_tecnico());

drop policy if exists "respuestas_insert_admin" on public.ticket_respuestas;
create policy "respuestas_insert_admin"
  on public.ticket_respuestas for insert
  with check (public.es_admin_o_tecnico());

alter table public.ticket_estado_historial enable row level security;

drop policy if exists "historial_select_admin" on public.ticket_estado_historial;
create policy "historial_select_admin"
  on public.ticket_estado_historial for select
  using (public.es_admin_o_tecnico());

alter table public.proyectos enable row level security;

drop policy if exists "proyectos_select_publico" on public.proyectos;
create policy "proyectos_select_publico"
  on public.proyectos for select
  using (true);

drop policy if exists "proyectos_write" on public.proyectos;
create policy "proyectos_write"
  on public.proyectos for all
  using (public.es_admin_o_editor())
  with check (public.es_admin_o_editor());

-- ============================================================
-- Seed: proyectos iniciales
-- ============================================================
insert into public.proyectos (id, nombre, descripcion, imagen_url, estado, categoria, orden) values
  ('00000000-0000-0000-0000-000000000001', 'Portal de Modernización', 'La plataforma institucional que estás viendo: información, capacitaciones y gestión de incidencias.', '/images/banner-noticia/banner-seismiles.webp', 'en_desarrollo', 'portal', 1),
  ('00000000-0000-0000-0000-000000000002', 'Red WiFi Municipal', 'Conectividad gratuita en espacios públicos y oficinas de la municipalidad.', '/images/banner-noticia/banner-seismiles.webp', 'activo', 'infraestructura', 2),
  ('00000000-0000-0000-0000-000000000003', 'Gestión de Trámites Digitales', 'Digitalización de trámites municipales para reducir tiempos de espera.', '/images/banner-noticia/banner-seismiles.webp', 'en_desarrollo', 'digital', 3)
on conflict (id) do nothing;
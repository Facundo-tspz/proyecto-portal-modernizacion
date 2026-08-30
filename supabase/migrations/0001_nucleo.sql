-- ============================================================
-- 0001_nucleo.sql
-- Núcleo: usuarios (perfiles), tickets, respuestas, historial,
-- proyectos. Enums, funciones del servidor, RLS y triggers.
-- Ejecutar en Dashboard Supabase > SQL Editor > New Query > Run
-- ============================================================

-- ---------- Extensiones ----------
create extension if not exists pgcrypto;

-- ---------- Enums ----------
create type rol_usuario as enum ('admin', 'tecnico', 'editor');
create type gravedad_ticket as enum ('baja', 'media', 'alta', 'critica');
create type estado_ticket as enum ('pendiente', 'en_espera', 'resuelta', 'rechazada');
create type estado_proyecto as enum ('activo', 'finalizado', 'en_desarrollo');

-- ---------- Tabla: perfiles ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol rol_usuario not null default 'editor',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Tabla: tickets ----------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  codigo_seguimiento text not null unique,
  contacto_nombre text not null,
  contacto_secretaria text not null,
  contacto_direccion text default '',
  contacto_rol text default '',
  contacto_email text default '',
  gravedad gravedad_ticket not null default 'media',
  categoria_problema text default '',
  descripcion text not null,
  estado estado_ticket not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tabla: ticket_respuestas ----------
create table if not exists public.ticket_respuestas (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  autor_id uuid references auth.users (id) on delete set null,
  mensaje text not null,
  created_at timestamptz not null default now()
);

-- ---------- Tabla: ticket_estado_historial ----------
create table if not exists public.ticket_estado_historial (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  estado_anterior estado_ticket,
  estado_nuevo estado_ticket not null,
  cambiado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Tabla: proyectos ----------
create table if not exists public.proyectos (
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

-- ---------- Función: generar código de seguimiento ----------
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

-- ---------- Función: insertar ticket público (formulario QR) ----------
-- Asigna gravedad y genera el código en el servidor.
create or replace function public.crear_ticket_publico(
  p_nombre text,
  p_secretaria text,
  p_direccion text,
  p_rol text,
  p_email text,
  p_categoria text,
  p_descripcion text,
  p_gravedad gravedad_ticket default 'media'
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
    contacto_rol, contacto_email, categoria_problema, descripcion, gravedad
  ) values (
    codigo, p_nombre, p_secretaria, p_direccion, p_rol, p_email,
    p_categoria, p_descripcion, p_gravedad
  ) returning id into nuevo_id;

  insert into public.ticket_estado_historial (ticket_id, estado_nuevo)
  values (nuevo_id, 'pendiente');

  return json_build_object('id', nuevo_id, 'codigo_seguimiento', codigo);
end;
$$;

-- ---------- Función: consulta pública por código ----------
-- Devuelve solo datos no sensibles + estado + historial breve.
create or replace function public.consultar_ticket_por_codigo(p_codigo text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  resultado json;
begin
  select json_build_object(
    'codigo_seguimiento', t.codigo_seguimiento,
    'estado', t.estado,
    'gravedad', t.gravedad,
    'categoria_problema', t.categoria_problema,
    'descripcion', t.descripcion,
    'created_at', t.created_at,
    'updated_at', t.updated_at
  )
  into resultado
  from public.tickets t
  where t.codigo_seguimiento = upper(p_codigo);

  if resultado is null then
    raise exception 'No se encontró ningún ticket con ese código';
  end if;

  return resultado;
end;
$$;

-- ---------- Trigger: actualizar updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_tickets_updated
  before update on public.tickets
  for each row execute function public.set_updated_at();

create trigger trg_proyectos_updated
  before update on public.proyectos
  for each row execute function public.set_updated_at();

-- Trigger: registrar historial al cambiar estado de un ticket
create or replace function public.registrar_cambio_estado()
returns trigger
language plpgsql
as $$
begin
  if new.estado is distinct from old.estado then
    insert into public.ticket_estado_historial (ticket_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, old.estado, new.estado, auth.uid());
  end if;
  return new;
end;
$$;

create trigger trg_tickets_historial
  before update on public.tickets
  for each row execute function public.registrar_cambio_estado();

-- ---------- RLS: perfiles ----------
alter table public.perfiles enable row level security;

create policy "perfiles_select_own"
  on public.perfiles for select
  using (auth.uid() = id);

create policy "perfiles_update_admin"
  on public.perfiles for update
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'admin' and p.activo
    )
  );

-- ---------- RLS: tickets ----------
alter table public.tickets enable row level security;

-- Cualquiera puede insertar un ticket (formulario QR público)
create policy "tickets_insert_publico"
  on public.tickets for insert
  with check (true);

-- Los tickets no se leen por listado directo (solo vía función por código)
create policy "tickets_select_admin"
  on public.tickets for select
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'tecnico') and p.activo
    )
  );

create policy "tickets_update_admin"
  on public.tickets for update
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'tecnico') and p.activo
    )
  );

-- ---------- RLS: ticket_respuestas ----------
alter table public.ticket_respuestas enable row level security;

create policy "respuestas_select_admin"
  on public.ticket_respuestas for select
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'tecnico') and p.activo
    )
  );

create policy "respuestas_insert_admin"
  on public.ticket_respuestas for insert
  with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'tecnico') and p.activo
    )
  );

-- ---------- RLS: ticket_estado_historial ----------
alter table public.ticket_estado_historial enable row level security;

create policy "historial_select_admin"
  on public.ticket_estado_historial for select
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'tecnico') and p.activo
    )
  );

-- ---------- RLS: proyectos ----------
alter table public.proyectos enable row level security;

create policy "proyectos_select_publico"
  on public.proyectos for select
  using (true);

create policy "proyectos_write_admin"
  on public.proyectos for all
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'editor') and p.activo
    )
  )
  with check (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('admin', 'editor') and p.activo
    )
  );

-- ---------- Seed: proyectos iniciales (contenido actual del home) ----------
insert into public.proyectos (nombre, descripcion, imagen_url, estado, categoria, orden) values
  ('Portal de Modernización', 'La plataforma institucional que estás viendo: información, capacitaciones y gestión de incidencias.', '/images/banner-noticia/banner-seismiles.webp', 'en_desarrollo', 'portal', 1),
  ('Red WiFi Municipal', 'Conectividad gratuita en espacios públicos y oficinas de la municipalidad.', '/images/banner-noticia/banner-seismiles.webp', 'activo', 'infraestructura', 2),
  ('Gestión de Trámites Digitales', 'Digitalización de trámites municipales para reducir tiempos de espera.', '/images/banner-noticia/banner-seismiles.webp', 'en_desarrollo', 'digital', 3)
on conflict do nothing;

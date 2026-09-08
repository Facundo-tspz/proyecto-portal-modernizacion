-- ============================================================
-- 0005_ultimo_acceso.sql
-- Última conexión de cada usuario (panel).
-- Agrega columna, RPC de "latido" del front y expone la fecha
-- en listar_usuarios (recreada con ultimo_acceso y last_sign_in_at).
-- Depende de: 0001 (es_admin), 0004 (listar_usuarios).
-- ============================================================

-- Columna de última actividad (la actualiza el front cada ~60s)
alter table public.perfiles add column if not exists ultimo_acceso timestamptz;

-- Latido: el usuario autenticado marca su propia última conexión
create or replace function public.registrar_ultimo_acceso()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.perfiles
     set ultimo_acceso = now()
   where id = auth.uid();
end;
$$;

revoke all on function public.registrar_ultimo_acceso() from public;
grant execute on function public.registrar_ultimo_acceso() to authenticated;

-- Recrea listar_usuarios incluyendo última conexión de perfil
-- y último sign-in de auth (respaldo cuando no hubo latido aún).
drop function if exists public.listar_usuarios();

create or replace function public.listar_usuarios()
returns table (
  id uuid,
  email text,
  nombre text,
  rol rol_usuario,
  activo boolean,
  ultimo_acceso timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  return query
    select
      u.id,
      u.email::text as email,
      p.nombre,
      p.rol,
      p.activo,
      p.ultimo_acceso,
      u.last_sign_in_at
    from auth.users u
    join public.perfiles p on p.id = u.id
    order by p.created_at;
end;
$$;

revoke all on function public.listar_usuarios() from public;
grant execute on function public.listar_usuarios() to authenticated;
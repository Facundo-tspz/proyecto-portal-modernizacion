-- ============================================================
-- 0004_usuarios.sql
-- Gestión de usuarios desde el panel (rol admin).
-- Permite al admin crear usuarios, cambiar rol y activar/desactivar
-- usando Supabase Auth + perfiles, sin exponer la service_role key.
--
-- ============================================================

-- Función: crear usuario (email + password + rol) SOLO para admin
create or replace function public.crear_usuario_admin(
  p_email text,
  p_password text,
  p_nombre text default '',
  p_rol rol_usuario default 'editor'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  -- Solo un admin autenticado puede crear usuarios
  if not exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'admin' and p.activo
  ) then
    raise exception 'No autorizado';
  end if;

  user_id := public.crear_admin(p_email, p_password);
  update public.perfiles set nombre = p_nombre, rol = p_rol where id = user_id;
  return user_id;
end;
$$;

revoke all on function public.crear_usuario_admin(text, text, text, rol_usuario) from public;
grant execute on function public.crear_usuario_admin(text, text, text, rol_usuario) to authenticated;

-- Función: cambiar rol de un usuario (solo admin)
create or replace function public.cambiar_rol_usuario(p_user_id uuid, p_rol rol_usuario)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'admin' and p.activo
  ) then
    raise exception 'No autorizado';
  end if;

  update public.perfiles set rol = p_rol where id = p_user_id;
end;
$$;

revoke all on function public.cambiar_rol_usuario(uuid, rol_usuario) from public;
grant execute on function public.cambiar_rol_usuario(uuid, rol_usuario) to authenticated;

-- Función: activar/desactivar usuario (solo admin)
create or replace function public.toggle_usuario_activo(p_user_id uuid, p_activo boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'admin' and p.activo
  ) then
    raise exception 'No autorizado';
  end if;

  update public.perfiles set activo = p_activo where id = p_user_id;
end;
$$;

revoke all on function public.toggle_usuario_activo(uuid, boolean) from public;
grant execute on function public.toggle_usuario_activo(uuid, boolean) to authenticated;

-- Ajuste RLS: permitir a los admins listar todos los perfiles
drop policy if exists "perfiles_select_own" on public.perfiles;
create policy "perfiles_select_own"
  on public.perfiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol = 'admin' and p.activo
    )
  );

-- Función: listar usuarios (email + perfil) para el admin
create or replace function public.listar_usuarios()
returns table (
  id uuid,
  email text,
  nombre text,
  rol rol_usuario,
  activo boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.rol = 'admin' and p.activo
  ) then
    raise exception 'No autorizado';
  end if;

  return query
    select
      u.id,
      u.email::text as email,
      p.nombre,
      p.rol,
      p.activo
    from auth.users u
    join public.perfiles p on p.id = u.id
    order by p.created_at;
end;
$$;

revoke all on function public.listar_usuarios() from public;
grant execute on function public.listar_usuarios() to authenticated;

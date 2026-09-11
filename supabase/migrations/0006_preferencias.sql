-- ============================================================
-- 0006_preferencias.sql
-- Preferencias del panel: gestión de sesiones (revocar fuerza
-- a re-loguearse) y reinicio de contraseña por admin.
-- Depende de: 0001 (rol_usuario, es_admin), 0004, 0005.
-- ============================================================

-- ============================================================
-- RPCs "self": el propio usuario edita su perfil/preferencia
-- ============================================================

create or replace function public.actualizar_mi_nombre(p_nombre text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(p_nombre, '') = '' then
    raise exception 'El nombre no puede estar vacío';
  end if;

  update public.perfiles
     set nombre = p_nombre
   where id = auth.uid();
end;
$$;

revoke all on function public.actualizar_mi_nombre(text) from public;
grant execute on function public.actualizar_mi_nombre(text) to authenticated;

-- ============================================================
-- RPCs de sesiones (solo admin)
-- ============================================================

-- Revoca todas las sesiones de un usuario -> debe re-loguearse
create or replace function public.revocar_sesiones_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  delete from auth.refresh_tokens where user_id = p_user_id;
  delete from auth.sessions where user_id = p_user_id;
end;
$$;

revoke all on function public.revocar_sesiones_usuario(uuid) from public;
grant execute on function public.revocar_sesiones_usuario(uuid) to authenticated;

-- Revoca las sesiones de todos los usuarios EXCEPTO el admin actual
create or replace function public.revocar_sesiones_todos()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  delete from auth.refresh_tokens
   where user_id is distinct from auth.uid();

  delete from auth.sessions
   where user_id is distinct from auth.uid();
end;
$$;

revoke all on function public.revocar_sesiones_todos() from public;
grant execute on function public.revocar_sesiones_todos() to authenticated;

-- ============================================================
-- Reinicio de contraseña (solo admin) + revoca sus sesiones
-- ============================================================

create or replace function public.reiniciar_contrasena_usuario(
  p_user_id uuid,
  p_nueva_contrasena text
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  if coalesce(p_nueva_contrasena, '') = '' or length(p_nueva_contrasena) < 8 then
    raise exception 'La contraseña debe tener al menos 8 caracteres';
  end if;

  update auth.users
     set encrypted_password = crypt(p_nueva_contrasena, gen_salt('bf', 10)),
         updated_at = now()
   where id = p_user_id;

  delete from auth.refresh_tokens where user_id = p_user_id;
  delete from auth.sessions where user_id = p_user_id;
end;
$$;

revoke all on function public.reiniciar_contrasena_usuario(uuid, text) from public;
grant execute on function public.reiniciar_contrasena_usuario(uuid, text) to authenticated;
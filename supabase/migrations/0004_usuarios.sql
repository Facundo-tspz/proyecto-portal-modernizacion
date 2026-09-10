-- ============================================================
-- 0004_usuarios.sql
-- Gestión de usuarios desde el panel (rol admin).
-- CRÍTICO: crea usuarios con INSERT COMPLETO en auth.users,
-- seteando todas las columnas a string vacío / valor correcto,
-- para NO repetir el problema de "Database error querying schema"
-- (que ocurría cuando columnas quedaban en NULL).
-- Depende de: 0001 (rol_usuario, es_admin).
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
set search_path = public, auth, extensions
as $$
declare
  user_id uuid;
begin
  -- Solo un admin autenticado puede crear usuarios
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  if length(coalesce(p_password, '')) < 8 then
    raise exception 'La contraseña debe tener al menos 8 caracteres';
  end if;

  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'El email no es válido';
  end if;

  user_id := gen_random_uuid();

  -- INSERT COMPLETO: todas las columnas inicializadas (sin NULL) para
  -- que el servidor de Auth no falle al leer la fila.
  insert into auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at,
    email_change_token_new, email_change, email_change_sent_at,
    last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    phone, phone_confirmed_at, phone_change, phone_change_token,
    phone_change_sent_at
  ) values (
    '00000000-0000-0000-0000-000000000000', user_id,
    'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf', 10)),
    now(), '', now(),
    '', now(),
    '', '', now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nombre', p_nombre),
    now(), now(),
    '', null, '', '',
    null
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), user_id, user_id::text, 'email',
    jsonb_build_object('sub', user_id::text, 'email', p_email,
                       'email_verified', true, 'phone_verified', false),
    now(), now(), now()
  );

  insert into public.perfiles (id, nombre, rol, activo)
  values (user_id, p_nombre, p_rol, true);

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
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'No podés cambiar el rol de tu propia cuenta';
  end if;

  update public.perfiles set rol = p_rol where id = p_user_id;
end;
$$;

revoke all on function public.cambiar_rol_usuario(uuid, rol_usuario) from public;
grant execute on function public.cambiar_rol_usuario(uuid, rol_usuario) to authenticated;

-- Función: activar/desactivar usuario (solo admin).
-- Al desactivar, además se cierran las sesiones activas de Auth
-- para que la cuenta no siga operando desde una sesión ya emitida.
create or replace function public.toggle_usuario_activo(p_user_id uuid, p_activo boolean)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'No podés desactivar tu propia cuenta';
  end if;

  update public.perfiles set activo = p_activo where id = p_user_id;

  if not p_activo then
    delete from auth.refresh_tokens where user_id::text = p_user_id::text;
    delete from auth.sessions where user_id::text = p_user_id::text;
  end if;
end;
$$;

revoke all on function public.toggle_usuario_activo(uuid, boolean) from public;
grant execute on function public.toggle_usuario_activo(uuid, boolean) to authenticated;

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
      p.activo
    from auth.users u
    join public.perfiles p on p.id = u.id
    order by p.created_at;
end;
$$;

revoke all on function public.listar_usuarios() from public;
grant execute on function public.listar_usuarios() to authenticated;

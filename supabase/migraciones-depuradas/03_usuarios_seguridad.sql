-- ============================================================
-- migraciones-depuradas / 03_usuarios_seguridad.sql
-- ------------------------------------------------------------------
-- VERSIONES PURGADAS DE LA BASE DE DATOS — ESTADO FINAL.
-- Consolidación de las migraciones 0001→0012 en archivos lógicos,
-- eliminando la historia de fixes y el código muerto.
--
-- ⚠️ SOLO PARA UNA BD NUEVA / VACÍA.
-- No ejecutar sobre la base que ya usa el sitio en producción.
-- Aplicar en orden: 01 → 02 → 03 (una sola vez cada una).
--
-- Contenido: gestión de usuarios, sesiones y contraseñas (panel) y
-- rate-limit de login. La columna perfiles.ultimo_acceso ya está
-- definida en el archivo 01 (esquema core).
-- Depende de: 01 (rol_usuario, es_admin).
-- ============================================================

-- ---------- RPCs "self": el propio usuario edita su perfil ----------

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

-- Latido: el usuario autenticado marca su propia última conexión
create or replace function public.registrar_ultimo_acceso()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update public.perfiles
     set ultimo_acceso = now()
   where id = auth.uid();
end;
$$;

revoke all on function public.registrar_ultimo_acceso() from public;
grant execute on function public.registrar_ultimo_acceso() to authenticated;

-- ============================================================
-- Gestión de usuarios desde el panel (rol admin)
-- ============================================================

-- Crear usuario (email + password + rol).
-- INSERT COMPLETO en auth.users (todas las columnas inicializadas)
-- para no repetir el problema de "Database error querying schema".
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

-- Cambiar rol de un usuario (un admin no puede cambiarse a sí mismo)
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

-- Activar/desactivar usuario. Al desactivar, cierra las sesiones de Auth
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

-- Listar usuarios (email + perfil) para el admin.
-- Versión FINAL: incluye ultimo_acceso y last_sign_in_at.
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

-- Eliminar usuario de forma definitiva (cuenta de Auth + perfil +
-- referencias en cascada). Nunca sobre la propia cuenta.
create or replace function public.eliminar_usuario(p_user_id uuid)
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
    raise exception 'No podés eliminar tu propia cuenta';
  end if;

  delete from auth.users where id = p_user_id;

  if not found then
    raise exception 'El usuario no existe';
  end if;
end;
$$;

revoke all on function public.eliminar_usuario(uuid) from public;
grant execute on function public.eliminar_usuario(uuid) to authenticated;

-- ============================================================
-- Sesiones y contraseñas (rol admin)
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

-- Reinicio de contraseña (rol admin) + revoca sus sesiones
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

-- ============================================================
-- Rate-limit de login (bloqueo de intentos fallidos en la BD)
-- ============================================================

-- Tabla: login_intentos
create table if not exists public.login_intentos (
  email text primary key,
  fallidos integer not null default 0,
  ventana_inicio timestamptz not null default now(),
  bloqueado_hasta timestamptz
);

alter table public.login_intentos enable row level security;

-- Acceso directo denegado: solo se opera vía RPC (SECURITY DEFINER).
create policy "login_intentos_solo_rpc"
  on public.login_intentos for all
  using (false) with check (false);

-- Verifica si un email está bloqueado y cuánto falta. Limpia filas expiradas.
create or replace function public.verificar_bloqueo_login(p_email text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  email_norm text;
  fila public.login_intentos%rowtype;
  minutos_restantes integer;
begin
  email_norm := lower(btrim(p_email));

  if email_norm = '' or position('@' in email_norm) = 0 then
    return json_build_object('bloqueado', false, 'minutos_restantes', 0, 'fallidos', 0);
  end if;

  select * into fila from public.login_intentos where email = email_norm;

  if fila.email is null then
    return json_build_object('bloqueado', false, 'minutos_restantes', 0, 'fallidos', 0);
  end if;

  -- Bloqueo expirado: limpiar y no bloquear
  if fila.bloqueado_hasta is not null and fila.bloqueado_hasta <= now() then
    delete from public.login_intentos where email = email_norm;
    return json_build_object('bloqueado', false, 'minutos_restantes', 0, 'fallidos', 0);
  end if;

  -- Ventana caída sin bloqueo: reiniciar el contador
  if fila.bloqueado_hasta is null and fila.ventana_inicio <= now() - interval '15 minutes' then
    update public.login_intentos
       set fallidos = 0, ventana_inicio = now()
     where email = email_norm;
    fila.fallidos := 0;
  end if;

  if fila.bloqueado_hasta is not null then
    minutos_restantes := greatest(
      1,
      ceil(extract(epoch from (fila.bloqueado_hasta - now())) / 60)::int
    );
    return json_build_object(
      'bloqueado', true,
      'minutos_restantes', minutos_restantes,
      'fallidos', fila.fallidos
    );
  end if;

  return json_build_object('bloqueado', false, 'minutos_restantes', 0, 'fallidos', fila.fallidos);
end;
$$;

revoke all on function public.verificar_bloqueo_login(text) from public;
grant execute on function public.verificar_bloqueo_login(text) to anon;
grant execute on function public.verificar_bloqueo_login(text) to authenticated;

-- p_exitoso = true -> resetea el contador del email.
-- p_exitoso = false -> acumula; al llegar a 5 fija bloqueo de 15 min.
create or replace function public.registrar_intento_login(p_email text, p_exitoso boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  email_norm text;
  fila public.login_intentos%rowtype;
begin
  email_norm := lower(btrim(p_email));

  if email_norm = '' or position('@' in email_norm) = 0 then
    return;
  end if;

  if p_exitoso then
    delete from public.login_intentos where email = email_norm;
    return;
  end if;

  select * into fila from public.login_intentos where email = email_norm;

  -- Ya bloqueada: no acumular más
  if fila.email is not null and fila.bloqueado_hasta is not null and fila.bloqueado_hasta > now() then
    return;
  end if;

  -- Nueva fila o ventana vencida: empieza con 1
  if fila.email is null or fila.ventana_inicio <= now() - interval '15 minutes' then
    insert into public.login_intentos (email, fallidos, ventana_inicio)
    values (email_norm, 1, now())
    on conflict (email) do update
      set fallidos = 1, ventana_inicio = now(), bloqueado_hasta = null;
    return;
  end if;

  -- Misma ventana: acumular y bloquear en la quinta falla
  update public.login_intentos
     set fallidos = fallidos + 1,
         bloqueado_hasta = case
           when fallidos + 1 >= 5 then now() + interval '15 minutes'
           else null
         end
   where email = email_norm;
end;
$$;

revoke all on function public.registrar_intento_login(text, boolean) from public;
grant execute on function public.registrar_intento_login(text, boolean) to anon;
grant execute on function public.registrar_intento_login(text, boolean) to authenticated;
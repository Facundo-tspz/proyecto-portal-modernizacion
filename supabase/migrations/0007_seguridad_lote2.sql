-- ============================================================
-- 0007_seguridad_lote2.sql
-- Correcciones de seguridad del "Lote 2" de la auditoría.
-- Idempotente: puede ejecutarse sobre una BD ya existente.
-- Depende de: 0001 (es_admin, es_admin_o_tecnico, rol_usuario).
-- ============================================================

-- ============================================================
-- Corrección: funciones auxiliares con search_path completo.
-- La versión original de 0001 usaba "set search_path = public"
-- pero llama auth.uid() — en versiones recientes de PostgreSQL
-- esto puede fallar si "auth" no está en el search_path.
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
-- registrar_ultimo_acceso: misma corrección de search_path.
-- Original en 0005 usaba "set search_path = public".
-- ============================================================
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

-- ============================================================
-- [2.3] RLS tickets: el insert público ya no puede fijar
-- estado/gravedad arbitrarios ni dejar el código vacío.
-- ============================================================
drop policy if exists "tickets_insert_publico" on public.tickets;
create policy "tickets_insert_publico"
  on public.tickets for insert
  with check (
    estado = 'pendiente'
    and gravedad in ('baja', 'media', 'alta', 'critica')
    and codigo_seguimiento <> ''
  );

-- ============================================================
-- [5.5] crear_usuario_admin: valida credenciales en servidor
-- (password >= 8 y email con formato), no solo en el cliente.
-- ============================================================
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

-- ============================================================
-- [3.6] toggle_usuario_activo: al desactivar también se cierran
-- las sesiones de Auth vigentes (la cuenta no sigue operando
-- desde una sesión ya emitida).
-- ============================================================
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

-- ============================================================
-- Protección: un admin no puede cambiarse el rol a sí mismo
-- (evita quedarse sin permisos de admin accidentalmente).
-- ============================================================
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

-- ============================================================
-- listar_usuarios: incluye ultimo_acceso y last_sign_in_at.
-- ============================================================
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
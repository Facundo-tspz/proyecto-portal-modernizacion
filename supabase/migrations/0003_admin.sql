-- ============================================================
-- 0003_admin.sql
-- Creación del usuario ADMIN inicial en Supabase Auth + su perfil
-- con rol 'admin'.
-- ============================================================

create or replace function public.crear_admin(p_email text, p_password text)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  user_id uuid;
  hashed text;
begin
  -- Supabase Auth almacena contraseñas con hash bcrypt
  hashed := crypt(p_password, gen_salt('bf', 10));

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    hashed,
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', 'Administrador'),
    now()
  )
  returning id into user_id;

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    user_id,
    user_id::text,
    'email',
    jsonb_build_object('sub', user_id::text, 'email', p_email),
    now(), now(), now()
  );

  insert into public.perfiles (id, nombre, rol, activo)
  values (user_id, 'Administrador', 'admin', true);

  return user_id;
end;
$$;

-- ============================================================
-- CONFIGURACIÓN DEL ADMIN (SEGUNDO BLOQUE)
-- 1) Reemplazá EL EMAIL y LA CONTRASEÑA por los nuevos.
-- 2) Ejecutá esto DESPUÉS de correr el bloque anterior y los
--    archivos 0001 y 0002.
-- 3) Guardá la contraseña en un lugar seguro para el área.
-- ============================================================

-- select public.crear_admin('modernizacion.tinogasta@gmail.com', 'TU_CONTRASEÑA_SEGURA');

-- ============================================================
-- 0010_rate_limit_login.sql
-- Bloqueo de intentos fallidos de login con estado en la BD.
-- Reemplaza el contador de "solo-cliente" que vivía en localStorage
-- (borrable con F12 / cambia de navegador), por un estado que
-- persiste entre dispositivos y sobrevive a recargas.
--
-- Lógica:
--   - 1 fallo por email (clave normalizada: trim + minúsculas).
--   - Ventana móvil de 15 min; al llegar a 5 fallos -> bloqueo 15 min.
--   - Un login exitoso resetea el contador.
--   - Limpieza de filas expiradas bajo demanda (en verificar_bloqueo).
--
-- ⚠️ Tradeoff conocido: al ser RPCs de pre-login se otorgan a "anon",
-- alguien con la anon key pública podría bloquear remotamente un
-- email durante 15 min (DoS acotado por cuenta). Aceptado para el
-- alcance de un panel interno. Backstop por IP: rate limits del
-- dashboard de Supabase (Auth -> Rate Limits).
-- Idempotente: puede ejecutarse sobre una BD ya existente.
-- ============================================================

-- ---------- Tabla: login_intentos ----------
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

-- ---------- RPC: verificar_bloqueo_login ----------
-- Devuelve { bloqueado, minutos_restantes, fallidos }. Limpia
-- filas expiradas de paso.
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

-- ---------- RPC: registrar_intento_login ----------
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
-- ============================================================
-- 0011_publico_tickets.sql
-- Extensiones para la "Mesa de tickets":
--   1. contacto_telefono: el formulario público de reportes
--      agrega un teléfono opcional (no existía columna).
--   2. crear_ticket_publico: acepta p_telefono (default '').
--   3. consultar_ticket_por_codigo: ahora devuelve además el
--      historial de estados y las respuestas del técnico (con
--      nombre del responsable vía join a perfiles), para la
--      pestaña pública "Hacer seguimiento".
-- Idempotente: puede ejecutarse sobre una BD ya existente.
-- NO modifica RLS ni grants: las funciones mantienen execute
-- público por defecto (anon puede llamarlas), como hasta ahora.
-- ============================================================

-- ---------- 1. Columna contacto_telefono ----------
alter table public.tickets add column if not exists contacto_telefono text default '';

-- ---------- 2. crear_ticket_publico + p_telefono ----------
-- Se descarta la firma anterior (sin teléfono) para no dejar
-- un overload muerto, y se recrea con el nuevo parámetro.
drop function if exists public.crear_ticket_publico(
  text, text, text, text, text, text, text, gravedad_ticket
);

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

-- ---------- 3. consultar_ticket_por_codigo enriquecida ----------
-- Devuelve los datos del ticket + historial + respuestas.
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
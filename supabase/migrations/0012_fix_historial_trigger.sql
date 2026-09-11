-- ============================================================
-- 0012_fix_historial_trigger.sql
-- Corrige el trigger que registra el historial de estados.
-- Problema: al cambiar el estado de un ticket, el trigger
-- registrar_cambio_estado() inserta en ticket_estado_historial,
-- que tiene RLS con solo política de lectura (select admin/tecnico).
-- Como la función no era SECURITY DEFINER, el insert corría con los
-- permisos del usuario autenticado y la actualización fallaba con
-- "new row violates row-level security policy ... ticket_estado_historial".
-- Fix: SECURITY DEFINER + search_path completo, igual que las demás
-- funciones de negocio (crear_ticket_publico, etc.).
-- Idempotente: puede ejecutarse sobre una BD ya existente.
-- ============================================================
create or replace function public.registrar_cambio_estado()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.estado is distinct from old.estado then
    insert into public.ticket_estado_historial (ticket_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, old.estado, new.estado, auth.uid());
  end if;
  return new;
end;
$$;
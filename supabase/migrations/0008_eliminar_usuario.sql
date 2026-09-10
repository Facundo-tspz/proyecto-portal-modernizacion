-- ============================================================
-- 0008_eliminar_usuario.sql
-- Eliminar un usuario de forma definitiva (cuenta de Auth +
-- perfil + referencias). SOLO para rol admin y nunca sobre la
-- propia cuenta (mismo patrón de seguridad que 0004_usuarios.sql).
-- Depende de: 0001 (es_admin), 0004 (es_admin en funciones).
-- El borrado de auth.users dispara las FK en cascada:
--   - public.perfiles           -> on delete cascade
--   - auth.identities           -> on delete cascade
--   - auth.sessions             -> on delete cascade
--   - auth.refresh_tokens       -> on delete cascade
--   - ticket_respuestas.autor_id       -> on delete set null
--   - ticket_estado_historial.cambiado_por -> on delete set null
-- ============================================================

create or replace function public.eliminar_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Solo un admin autenticado puede eliminar usuarios
  if not public.es_admin() then
    raise exception 'No autorizado';
  end if;

  -- No podés eliminar tu propia cuenta
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
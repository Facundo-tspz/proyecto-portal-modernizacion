-- ============================================================
-- 0002_contenido.sql
-- Contenido editable del portal: config_sitio (textos), avisos
-- (banner), capacitaciones, noticias y tarjetas_enlace.
-- Con seeds del contenido actual del home.
-- Depende de: 0001 (define es_admin_o_editor).
-- ============================================================

-- ---------- Drops preventivos (para re-ejecutar sin errores) ----------
-- Se borran las tablas con CASCADE (elimina también sus triggers),
-- por lo que NO hace falta drop de triggers individuales.
drop table if exists public.config_sitio cascade;
drop table if exists public.avisos cascade;
drop table if exists public.capacitaciones cascade;
drop table if exists public.noticias cascade;
drop table if exists public.tarjetas_enlace cascade;

-- ---------- Tabla: config_sitio (textos del portal) ----------
create table public.config_sitio (
  clave text primary key,
  valor text default '',
  tipo text not null default 'texto',
  updated_at timestamptz not null default now()
);

-- ---------- Tabla: avisos (banner de noticias) ----------
create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  activo boolean not null default true,
  texto text not null default '',
  link text default '',
  imagen_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tabla: capacitaciones ----------
create table public.capacitaciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  leyenda text default '',
  imagen_url text default '',
  link text default '',
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tabla: noticias ----------
create table public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  leyenda text default '',
  imagen_url text default '',
  link text default '',
  orden integer not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Tabla: tarjetas_enlace (accesos útiles) ----------
create table public.tarjetas_enlace (
  id uuid primary key default gen_random_uuid(),
  icono text default '',
  titulo text not null,
  leyenda text default '',
  link text default '',
  activo boolean not null default true,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Trigger: actualizar updated_at (contenido) ----------
create or replace function public.set_updated_at_contenido()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_avisos_updated before update on public.avisos for each row execute function public.set_updated_at_contenido();
create trigger trg_capacitaciones_updated before update on public.capacitaciones for each row execute function public.set_updated_at_contenido();
create trigger trg_noticias_updated before update on public.noticias for each row execute function public.set_updated_at_contenido();
create trigger trg_tarjetas_updated before update on public.tarjetas_enlace for each row execute function public.set_updated_at_contenido();
create trigger trg_config_updated before update on public.config_sitio for each row execute function public.set_updated_at_contenido();

-- ---------- RLS: contenido ----------
alter table public.avisos enable row level security;
alter table public.capacitaciones enable row level security;
alter table public.noticias enable row level security;
alter table public.tarjetas_enlace enable row level security;
alter table public.config_sitio enable row level security;

-- Lectura pública
drop policy if exists "avisos_select_publico" on public.avisos;
create policy "avisos_select_publico" on public.avisos for select using (true);

drop policy if exists "capacitaciones_select_publico" on public.capacitaciones;
create policy "capacitaciones_select_publico" on public.capacitaciones for select using (true);

drop policy if exists "noticias_select_publico" on public.noticias;
create policy "noticias_select_publico" on public.noticias for select using (true);

drop policy if exists "tarjetas_select_publico" on public.tarjetas_enlace;
create policy "tarjetas_select_publico" on public.tarjetas_enlace for select using (true);

drop policy if exists "config_select_publico" on public.config_sitio;
create policy "config_select_publico" on public.config_sitio for select using (true);

-- Escritura admin/editor (helper security definer de 0001)
drop policy if exists "avisos_write" on public.avisos;
create policy "avisos_write" on public.avisos for all using (public.es_admin_o_editor()) with check (public.es_admin_o_editor());

drop policy if exists "capacitaciones_write" on public.capacitaciones;
create policy "capacitaciones_write" on public.capacitaciones for all using (public.es_admin_o_editor()) with check (public.es_admin_o_editor());

drop policy if exists "noticias_write" on public.noticias;
create policy "noticias_write" on public.noticias for all using (public.es_admin_o_editor()) with check (public.es_admin_o_editor());

drop policy if exists "tarjetas_write" on public.tarjetas_enlace;
create policy "tarjetas_write" on public.tarjetas_enlace for all using (public.es_admin_o_editor()) with check (public.es_admin_o_editor());

drop policy if exists "config_write" on public.config_sitio;
create policy "config_write" on public.config_sitio for all using (public.es_admin_o_editor()) with check (public.es_admin_o_editor());

-- ============================================================
-- Seeds
-- ============================================================

-- Aviso (UNA sola fila, el código usa .single())
insert into public.avisos (activo, texto, link, imagen_url) values
  (true, 'Nueva capacitación de herramientas digitales. Inscripciones abiertas en la Dirección de Modernización.', '', '/images/banner-noticia/banner-seismiles.webp')
on conflict do nothing;

insert into public.capacitaciones (titulo, leyenda, imagen_url, link, orden) values
  ('Taller de Excel Avanzado', 'Plantillas, tablas dinámicas y automatización de reportes para la gestión municipal.', '/images/banner-noticia/banner-seismiles.webp', '', 1),
  ('Firma Digital Certificada', 'Trámites 100% digitales con firma electrónica para el personal de la municipalidad.', '/images/banner-noticia/banner-seismiles.webp', '', 2),
  ('Herramientas de Inteligencia Artificial', 'Cómo aprovechar la IA en tareas administrativas cotidianas del área.', '/images/banner-noticia/banner-seismiles.webp', '', 3),
  ('Gestión de Redes Sociales', 'Comunicación oficial para oficinas públicas: contenido, alcance y buen uso.', '/images/banner-noticia/banner-seismiles.webp', '', 4),
  ('Ciberseguridad Básica', 'Contraseñas seguras, correos fraudulentos y buenas prácticas en equipos del estado.', '/images/banner-noticia/banner-seismiles.webp', '', 5)
on conflict do nothing;

insert into public.noticias (titulo, leyenda, imagen_url, link, orden) values
  ('IA generativa, ¿qué es y cómo usarla en trámites?', 'Un repaso simple de las herramientas de IA y sus usos en oficinas públicas.', '/images/banner-noticia/banner-seismiles.webp', '', 1),
  ('Lanzamiento de la nueva web departamental', 'Ya podés consultar la información de las secretarías desde un solo lugar.', '/images/banner-noticia/banner-seismiles.webp', '', 2)
on conflict do nothing;

insert into public.tarjetas_enlace (icono, titulo, leyenda, link, activo, orden) values
  ('file-text', 'Certificado Digital', 'Gestioná tu certificado digital y firma electrónica desde acá.', '', true, 1),
  ('calendar-days', 'Calendario de Feriados', 'Feriados, conmemoraciones y días no laborables de la provincia.', '', true, 2),
  ('newspaper', 'Boletín Municipal', 'Las ordenanzas y resoluciones oficiales de la municipalidad.', '', true, 3)
on conflict do nothing;

insert into public.config_sitio (clave, valor, tipo) values
  -- Banner
  ('banner_activo', 'true', 'booleano'),
  ('banner_texto', 'Nueva capacitación de herramientas digitales. Inscripciones abiertas en la Dirección de Modernización.', 'texto'),
  ('banner_link', '', 'texto'),
  ('banner_imagen', '/images/banner-noticia/banner-seismiles.webp', 'texto'),
  -- Somos Modernización (home)
  ('somos_overline', 'El área', 'texto'),
  ('somos_titulo', 'Somos el Área de Modernización', 'texto'),
  ('somos_parrafo', 'Modernizar es transformar, innovar y abrir nuevas oportunidades. Desde el Área de Modernización acercamos la tecnología a cada área municipal y a nuestra comunidad: creamos herramientas digitales, desarrollamos sitios web y capacitamos a nuestro equipo para crecer juntos.', 'texto'),
  ('somos_frase', 'Porque la tecnología es el medio, y el fin es un Municipio más cercano, accesible y preparado para el futuro.', 'texto'),
  -- Quiénes Somos: presentación
  ('q_overline', 'Quiénes somos', 'texto'),
  ('q_titulo', 'Un área al servicio de la innovación municipal', 'texto'),
  ('q_parrafo_1', 'La Dirección de Modernización de la Municipalidad de Tinogasta es el brazo ejecutor de la modernización digital del municipio. Dependemos de la Secretaría de Industria y Desarrollo Económico y trabajamos de forma transversal.', 'texto'),
  ('q_parrafo_2', 'Lo que comenzó como un área de soporte técnico básico se convirtió en el motor de proyectos estratégicos: portales oficiales, sistemas de gestión y programas como el ID Digital Emprendedor.', 'texto'),
  -- Quiénes Somos: misión/visión/función
  ('q_mision', 'Acercar la tecnología a cada área municipal y a la comunidad, mediante el desarrollo de software, la gestión digital y la capacitación.', 'texto'),
  ('q_vision', 'Un Municipio más cercano, accesible y preparado para el futuro, donde la tecnología sea el medio para servir mejor a los vecinos.', 'texto'),
  ('q_funcion', 'Somos el brazo ejecutor de la modernización administrativa y tecnológica del municipio: desarrollamos, damos soporte y formamos en herramientas de vanguardia.', 'texto'),
  -- Quiénes Somos: servicios
  ('q_servicio_web', 'Portales web', 'texto'),
  ('q_servicio_web_desc', 'Desarrollamos y mantenemos los portales oficiales del Municipio: tinogasta.gob.ar y tinogasta.tur.ar.', 'texto'),
  ('q_servicio_sistemas', 'Sistemas de gestión', 'texto'),
  ('q_servicio_sistemas_desc', 'Administramos sistemas como MEDI, Recursos Humanos y Red de Empleo.', 'texto'),
  ('q_servicio_soporte', 'Soporte técnico', 'texto'),
  ('q_servicio_soporte_desc', 'Asistencia y mantenimiento a todas las oficinas municipales.', 'texto'),
  ('q_servicio_caps', 'Capacitaciones', 'texto'),
  ('q_servicio_caps_desc', 'Formación en herramientas digitales e inteligencia artificial para el equipo y la comunidad.', 'texto'),
  ('q_servicio_id', 'ID Digital Emprendedor', 'texto'),
  ('q_servicio_id_desc', 'Acompañamos a emprendedores locales en su inserción digital y acceso a nuevas herramientas.', 'texto'),
  -- Quiénes Somos: contacto
  ('q_contacto_ubicacion', 'Calle Dr. Antonio Del Pino N° 739, Tinogasta — Catamarca', 'texto'),
  ('q_contacto_telefono', '3834-669002', 'texto'),
  ('q_contacto_email', 'info@tinogasta.gob.ar', 'texto')
on conflict (clave) do nothing;

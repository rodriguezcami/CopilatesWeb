-- ==============================================================
-- COPILATES WEB - configuración completa (ejecutar UNA vez)
-- Supabase > SQL Editor > New query > pegar todo > Run
-- ==============================================================

-- ---------- 1) OPINIONES ----------
create table if not exists public.opiniones (
  id bigint generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 2 and 60),
  estrellas int not null check (estrellas between 1 and 5),
  comentario text not null check (char_length(comentario) between 10 and 600),
  aprobada boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.opiniones enable row level security;

-- Cualquiera puede VER solo las opiniones aprobadas
create policy "ver opiniones aprobadas" on public.opiniones
  for select to anon, authenticated using (aprobada = true);

-- Cualquiera puede ENVIAR una opinión, pero siempre queda sin aprobar
create policy "enviar opinion" on public.opiniones
  for insert to anon, authenticated with check (aprobada = false);

-- Para publicar una opinión: Table Editor > opiniones > marcar aprobada = true

-- ---------- 2) CLASES GRABADAS ----------

create table if not exists public.clases_grabadas (
  id bigint generated always as identity primary key,
  titulo text not null,
  descripcion text,
  etiqueta text not null,          -- ej: 'Clase simple 20 min', 'Full body'
  duracion_min int,
  nivel text,                      -- ej: 'Principiante'
  precio numeric,
  portada_url text,                -- opcional: link a una imagen
  video_url text not null,         -- link de YouTube (no listado) o Vimeo. PRIVADO
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.clases_accesos (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  clase_id bigint references public.clases_grabadas(id) on delete cascade, -- vacío = acceso a TODAS
  comprador text,
  vence timestamptz,               -- vacío = no vence
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.clases_grabadas enable row level security;
alter table public.clases_accesos  enable row level security;

-- La web solo puede leer los datos públicos de las clases (NUNCA video_url)
revoke all on public.clases_grabadas from anon, authenticated;
grant select (id,titulo,descripcion,etiqueta,duracion_min,nivel,precio,portada_url,orden,activo)
  on public.clases_grabadas to anon, authenticated;
create policy "ver clases activas" on public.clases_grabadas
  for select to anon, authenticated using (activo = true);

-- Los códigos no se pueden leer desde la web
revoke all on public.clases_accesos from anon, authenticated;

-- Entrega los videos solo si el código es válido
create or replace function public.desbloquear_clases(p_codigo text)
returns table(id bigint, titulo text, etiqueta text, video_url text)
language sql security definer set search_path = public as $$
  select c.id, c.titulo, c.etiqueta, c.video_url
  from clases_accesos a
  join clases_grabadas c
    on c.activo and (a.clase_id is null or a.clase_id = c.id)
  where a.activo
    and (a.vence is null or a.vence > now())
    and a.codigo = upper(trim(p_codigo))
  order by c.orden, c.id;
$$;
revoke all on function public.desbloquear_clases(text) from public;
grant execute on function public.desbloquear_clases(text) to anon, authenticated;

/* ===== CÓMO USAR (desde Table Editor o SQL Editor) =====

-- Cargar una clase:
insert into clases_grabadas (titulo, descripcion, etiqueta, duracion_min, nivel, precio, video_url, orden)
values ('Clase express de abdomen', 'Una clase corta para activar el centro.', 'Clase simple 20 min', 20, 'Todos los niveles', 5000,
        'https://www.youtube.com/watch?v=XXXXXXXXXXX', 1);

-- Cuando una alumna paga una clase: crear su código y enviárselo por WhatsApp
-- (reemplazá 1 por el id de la clase)
insert into clases_accesos (codigo, clase_id, comprador)
values (upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), 1, 'Nombre de la alumna')
returning codigo;

-- Código para TODAS las clases (pack), que vence en 90 días:
insert into clases_accesos (codigo, comprador, vence)
values (upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), 'Nombre de la alumna', now() + interval '90 days')
returning codigo;

-- Para quitar un acceso: poner activo = false en esa fila de clases_accesos.
*/


-- ---------- 3) CLASES / SERVICIOS (texto editable de la sección "Nuestras clases") ----------
create table if not exists public.servicios (
  id bigint generated always as identity primary key,
  titulo text not null,
  descripcion text,
  para_quien text,               -- línea chica debajo (ej: 'Todos los niveles')
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.servicios enable row level security;
revoke all on public.servicios from anon, authenticated;
grant select (id,titulo,descripcion,para_quien,orden,activo) on public.servicios to anon, authenticated;
create policy "ver servicios activos" on public.servicios
  for select to anon, authenticated using (activo = true);

-- Clases iniciales (editalas o borralas desde Table Editor)
insert into public.servicios (titulo, descripcion, para_quien, orden)
select * from (values
  ('Pilates Reformer','En la máquina, con grupos reducidos, para cuidar la postura, ganar fuerza y aliviar tensiones de espalda.','Todos los niveles',1),
  ('Pilates Mat','Trabajo en colchoneta con pelotas y accesorios. Muy buena puerta de entrada para ganar flexibilidad.','Todos los niveles',2),
  ('Pilates terapéutico','Para quien llega con dolor o lesiones: se avanza de a poco, con acompañamiento cercano.','Consultanos antes de empezar',3),
  ('Hipopresivos','Ejercicios posturales con respiración para la faja abdominal.','Consultanos si tenés dudas sobre tu caso',4)
) as v(titulo,descripcion,para_quien,orden)
where not exists (select 1 from public.servicios);

-- Para agregar una clase nueva: Table Editor > servicios > Insert row.
-- Para ocultarla sin borrarla: activo = false. Para cambiar el orden: columna "orden".

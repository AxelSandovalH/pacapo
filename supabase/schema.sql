-- ============================================================
-- PÁCAPO BAKERY — Supabase Schema
-- Ejecuta este SQL en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabla de productos
create table if not exists public.productos (
  id          uuid          default gen_random_uuid() primary key,
  nombre      text          not null,
  categoria   text          not null,
  descripcion text          not null,
  precio_base numeric(10,2) not null,
  opciones    jsonb         not null default '[]'::jsonb,
  imagen_url  text,                              -- primera imagen (para cards)
  imagenes    text[]        not null default '{}', -- todas las imágenes
  activo      boolean       not null default true,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

-- 2. Row Level Security
alter table public.productos enable row level security;

-- Anon solo lee productos activos
create policy "Anon: leer activos"
  on public.productos for select
  to anon
  using (activo = true);

-- Admin (autenticado) ve y modifica todo
create policy "Auth: leer todos"
  on public.productos for select
  to authenticated
  using (true);

create policy "Auth: insertar"
  on public.productos for insert
  to authenticated
  with check (true);

create policy "Auth: actualizar"
  on public.productos for update
  to authenticated
  using (true)
  with check (true);

create policy "Auth: eliminar"
  on public.productos for delete
  to authenticated
  using (true);

-- 3. Trigger updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.productos
  for each row execute function public.handle_updated_at();

-- ============================================================
-- STORAGE: crea el bucket manualmente en
--   Supabase Dashboard > Storage > New bucket
--   Nombre: productos
--   Public: ✅ activado
-- ============================================================

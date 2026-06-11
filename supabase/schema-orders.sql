-- ============================================================
-- PÁCAPO BAKERY — Tabla de órdenes
-- Ejecuta en: Supabase Dashboard > SQL Editor
-- ============================================================

create table if not exists public.ordenes (
  id                uuid          default gen_random_uuid() primary key,
  stripe_session_id text          not null unique,
  stripe_payment_id text,
  producto_id       uuid          references public.productos(id),
  producto_nombre   text          not null,
  opcion_nombre     text,
  opcion_precio     numeric(10,2) not null,
  customer_email    text,
  customer_name     text,
  status            text          not null default 'pending', -- pending | paid | cancelled
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

alter table public.ordenes enable row level security;

-- Anon no puede leer órdenes
create policy "Auth: leer ordenes"
  on public.ordenes for select
  to authenticated
  using (true);

-- Solo server (service_role) puede insertar/actualizar
create policy "Service: gestionar ordenes"
  on public.ordenes for all
  to service_role
  using (true)
  with check (true);

create trigger set_ordenes_updated_at
  before update on public.ordenes
  for each row execute function public.handle_updated_at();

-- Tabla de ofertas para Pácapo
-- Pega esto en Supabase Dashboard > SQL Editor y ejecuta

CREATE TABLE IF NOT EXISTS ofertas (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      text NOT NULL,
  descripcion text DEFAULT '',
  emoji       text DEFAULT '🏷️',
  color       text DEFAULT '#8B1A1A',
  activa      boolean DEFAULT false,
  fecha_fin   date,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer ofertas activas
CREATE POLICY "anon read" ON ofertas
  FOR SELECT USING (true);

-- Solo usuarios autenticados pueden escribir
CREATE POLICY "auth write" ON ofertas
  FOR ALL USING (auth.role() = 'authenticated');

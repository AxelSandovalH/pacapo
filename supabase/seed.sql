-- ============================================================
-- PÁCAPO BAKERY — Seed de productos con imágenes
-- Ejecuta en: Supabase Dashboard > SQL Editor
-- ============================================================

insert into public.productos (nombre, categoria, descripcion, precio_base, opciones, imagen_url, imagenes, activo)
values

-- 1. Pasteles Personalizados
(
  'Pasteles Personalizados',
  'Pasteles',
  'Pasteles artesanales hechos bajo pedido en 10 sabores: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino y Gansito. Decoraciones especiales se cotizan por separado.',
  270,
  '[
    {"nombre": "Cake Box Lunch (14 cm)", "precio": 270,  "descripcion": "1-2 personas"},
    {"nombre": "Pequeño (16 cm)",        "precio": 480,  "descripcion": "5-6 personas"},
    {"nombre": "Mediano (18 cm)",         "precio": 600,  "descripcion": "8-10 personas"},
    {"nombre": "Grande (21 cm)",          "precio": 870,  "descripcion": "12-15 personas"},
    {"nombre": "Familiar (23 cm)",        "precio": 1150, "descripcion": "20-25 personas"}
  ]'::jsonb,
  '/images/pastel-bento-lazos-rosa.png',
  ARRAY[
    '/images/pastel-bento-lazos-rosa.png',
    '/images/pastel-personalizado-flores-naturales.png',
    '/images/pastel-rosa-feliz-dia-mama.png',
    '/images/pastel-vintage-bordado-vainilla.png',
    '/images/pasteles-snoopy-flores-azules.png',
    '/images/pastel-cumpleanos-rojo-lazos.png',
    '/images/pastel-naked-frutos-rojos.png',
    '/images/pastel-naked-naranja-frutas.jpg',
    '/images/pasteles-bento-corazon-caja.png',
    '/images/pastel-dos-pisos-frambuesas.jpg'
  ],
  true
),

-- 2. Cheesecakes Artesanales
(
  'Cheesecakes Artesanales',
  'Cheesecakes',
  'Cheesecakes artesanales en 10 sabores: Frutos Rojos, Tropical, Manzana, Café, Lotus, Guayaba, Brownie, Cookie, Chocolate y Limón. Elaborados con queso crema premium y base de galleta artesanal.',
  320,
  '[
    {"nombre": "Chico",   "precio": 320, "descripcion": "3-4 personas"},
    {"nombre": "Mediano", "precio": 550, "descripcion": "6-8 personas"},
    {"nombre": "Grande",  "precio": 850, "descripcion": "12-15 personas"}
  ]'::jsonb,
  '/images/cheesecake-flores-naturales-logo.png',
  ARRAY[
    '/images/cheesecake-flores-naturales-logo.png',
    '/images/cheesecakes-individuales-surtidos.jpg',
    '/images/cheesecakes-individuales-cenital.jpg',
    '/images/cheesecake-guayaba-pecana.jpg',
    '/images/cheesecakes-sin-decorar-limon.jpg',
    '/images/cheesecakes-proceso-decoracion.jpg',
    '/images/proceso-decoracion-fresa-cheesecake.jpg',
    '/images/proceso-soplete-merengue.jpg'
  ],
  true
),

-- 3. Postres de Línea Premium
(
  'Postres de Línea Premium',
  'Postres Premium',
  'Postres de pastelería fina: Fraisier, Tiramisú, Ópera, Sacher, Tres Leches y Guinness. Elaborados con técnica profesional e ingredientes de primera calidad.',
  450,
  '[
    {"nombre": "Chico",   "precio": 450,  "descripcion": "3-4 personas"},
    {"nombre": "Mediano", "precio": 680,  "descripcion": "6-8 personas"},
    {"nombre": "Grande",  "precio": 1050, "descripcion": "12-15 personas"}
  ]'::jsonb,
  '/images/postre-opera-capas-chocolate.png',
  ARRAY[
    '/images/postre-opera-capas-chocolate.png',
    '/images/postre-fraisier-fresa-individual.png',
    '/images/tartas-individuales-mango-blueberry.png',
    '/images/tarta-maracuya-merengue.jpg',
    '/images/tartas-crema-frambuesa-limon.jpg',
    '/images/tartas-variadas-surtido.jpg',
    '/images/tarta-manzana-nuez.jpg'
  ],
  true
),

-- 4. Cajitas Dulces
(
  'Cajitas Dulces',
  'Dulcería',
  'Selección surtida de repostería artesanal: Galletas artesanales, Brownies, Alfajores y Macarons. Ideales como regalo o para acompañar cualquier celebración.',
  240,
  '[
    {"nombre": "6 piezas",  "precio": 240},
    {"nombre": "9 piezas",  "precio": 360},
    {"nombre": "12 piezas", "precio": 480}
  ]'::jsonb,
  '/images/alfajores-azucar-glass.jpg',
  ARRAY[
    '/images/alfajores-azucar-glass.jpg',
    '/images/alfajores-caramelo-apilados.jpg',
    '/images/alfajores-caramelo-vertical.jpg',
    '/images/alfajores-fondo-bicolor.jpg',
    '/images/cookies-chocochip-apiladas.jpg',
    '/images/cookies-chocolate-decoracion.jpg',
    '/images/macarons-rosa-chocolate.jpg'
  ],
  true
);

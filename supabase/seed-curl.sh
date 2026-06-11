#!/bin/bash
# ============================================================
# Ejecutar este script para insertar los productos en Supabase
# sin necesitar Node.js instalado.
# Uso: bash supabase/seed-curl.sh
# ============================================================

SUPABASE_URL="https://shngmscrnsaknnhipbhq.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmdtc2NybnNha25uaGlwYmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE1NTI3MCwiZXhwIjoyMDk0NzMxMjcwfQ.lupcOckX1JSdz5kbMXAQmPtQ36E_tm20wWEihAnRSPo"

curl -s -X POST "$SUPABASE_URL/rest/v1/productos" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '[
    {
      "nombre": "Pasteles Personalizados",
      "categoria": "Pasteles",
      "descripcion": "Pasteles artesanales hechos bajo pedido en 10 sabores: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino y Gansito. Decoraciones especiales se cotizan por separado.",
      "precio_base": 270,
      "opciones": [
        {"nombre": "Cake Box Lunch (14 cm)", "precio": 270,  "descripcion": "1-2 personas"},
        {"nombre": "Pequeño (16 cm)",        "precio": 480,  "descripcion": "5-6 personas"},
        {"nombre": "Mediano (18 cm)",         "precio": 600,  "descripcion": "8-10 personas"},
        {"nombre": "Grande (21 cm)",          "precio": 870,  "descripcion": "12-15 personas"},
        {"nombre": "Familiar (23 cm)",        "precio": 1150, "descripcion": "20-25 personas"}
      ],
      "imagen_url": "/images/pastel-bento-lazos-rosa.png",
      "imagenes": [
        "/images/pastel-bento-lazos-rosa.png",
        "/images/pastel-personalizado-flores-naturales.png",
        "/images/pastel-rosa-feliz-dia-mama.png",
        "/images/pastel-vintage-bordado-vainilla.png",
        "/images/pasteles-snoopy-flores-azules.png",
        "/images/pastel-cumpleanos-rojo-lazos.png",
        "/images/pastel-naked-frutos-rojos.png",
        "/images/pastel-dos-pisos-frambuesas.jpg"
      ],
      "activo": true
    },
    {
      "nombre": "Cheesecakes Artesanales",
      "categoria": "Cheesecakes",
      "descripcion": "Cheesecakes artesanales en 10 sabores: Frutos Rojos, Tropical, Manzana, Café, Lotus, Guayaba, Brownie, Cookie, Chocolate y Limón. Elaborados con queso crema premium y base de galleta artesanal.",
      "precio_base": 320,
      "opciones": [
        {"nombre": "Chico",   "precio": 320, "descripcion": "3-4 personas"},
        {"nombre": "Mediano", "precio": 550, "descripcion": "6-8 personas"},
        {"nombre": "Grande",  "precio": 850, "descripcion": "12-15 personas"}
      ],
      "imagen_url": "/images/cheesecake-flores-naturales-logo.png",
      "imagenes": [
        "/images/cheesecake-flores-naturales-logo.png",
        "/images/cheesecakes-individuales-surtidos.jpg",
        "/images/cheesecakes-individuales-cenital.jpg",
        "/images/cheesecake-guayaba-pecana.jpg",
        "/images/cheesecakes-proceso-decoracion.jpg",
        "/images/proceso-soplete-merengue.jpg"
      ],
      "activo": true
    },
    {
      "nombre": "Postres de Línea Premium",
      "categoria": "Postres Premium",
      "descripcion": "Postres de pastelería fina: Fraisier, Tiramisú, Ópera, Sacher, Tres Leches y Guinness. Elaborados con técnica profesional e ingredientes de primera calidad.",
      "precio_base": 450,
      "opciones": [
        {"nombre": "Chico",   "precio": 450,  "descripcion": "3-4 personas"},
        {"nombre": "Mediano", "precio": 680,  "descripcion": "6-8 personas"},
        {"nombre": "Grande",  "precio": 1050, "descripcion": "12-15 personas"}
      ],
      "imagen_url": "/images/postre-opera-capas-chocolate.png",
      "imagenes": [
        "/images/postre-opera-capas-chocolate.png",
        "/images/postre-fraisier-fresa-individual.png",
        "/images/tartas-individuales-mango-blueberry.png",
        "/images/tarta-maracuya-merengue.jpg",
        "/images/tartas-crema-frambuesa-limon.jpg",
        "/images/tartas-variadas-surtido.jpg"
      ],
      "activo": true
    },
    {
      "nombre": "Cajitas Dulces",
      "categoria": "Dulcería",
      "descripcion": "Selección surtida de repostería artesanal: Galletas artesanales, Brownies, Alfajores y Macarons. Ideales como regalo o para acompañar cualquier celebración.",
      "precio_base": 240,
      "opciones": [
        {"nombre": "6 piezas",  "precio": 240},
        {"nombre": "9 piezas",  "precio": 360},
        {"nombre": "12 piezas", "precio": 480}
      ],
      "imagen_url": "/images/alfajores-azucar-glass.jpg",
      "imagenes": [
        "/images/alfajores-azucar-glass.jpg",
        "/images/alfajores-caramelo-apilados.jpg",
        "/images/alfajores-caramelo-vertical.jpg",
        "/images/cookies-chocochip-apiladas.jpg",
        "/images/cookies-chocolate-decoracion.jpg",
        "/images/macarons-rosa-chocolate.jpg"
      ],
      "activo": true
    }
  ]' | python3 -m json.tool 2>/dev/null || echo "Listo (sin python para pretty-print)"

echo ""
echo "✅ Seed ejecutado. Verifica en: $SUPABASE_URL/rest/v1/productos?select=nombre,categoria"

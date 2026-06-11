#!/bin/bash
SUPABASE_URL="https://shngmscrnsaknnhipbhq.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobmdtc2NybnNha25uaGlwYmhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE1NTI3MCwiZXhwIjoyMDk0NzMxMjcwfQ.lupcOckX1JSdz5kbMXAQmPtQ36E_tm20wWEihAnRSPo"
HDR=(-H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json")

SABORES='[
  {"nombre":"Vainilla","precio":PRECIO},
  {"nombre":"Doble Chocolate","precio":PRECIO},
  {"nombre":"Marmoleado","precio":PRECIO},
  {"nombre":"Limón","precio":PRECIO},
  {"nombre":"Zanahoria","precio":PRECIO},
  {"nombre":"Red Velvet","precio":PRECIO},
  {"nombre":"Banoffee","precio":PRECIO},
  {"nombre":"Moka","precio":PRECIO},
  {"nombre":"Pingüino","precio":PRECIO},
  {"nombre":"Gansito","precio":PRECIO}
]'

# 1. Borrar el producto genérico "Pasteles Personalizados"
curl -s -X DELETE "$SUPABASE_URL/rest/v1/productos?nombre=eq.Pasteles%20Personalizados" "${HDR[@]}"
echo "🗑  Eliminado producto genérico"

# 2. Insertar los 5 tamaños como productos individuales
PRODUCTOS=$(cat <<EOF
[
  {
    "nombre": "Pastel Box Lunch (14 cm)",
    "categoria": "Pasteles",
    "descripcion": "Pastel individual perfecto para 1-2 personas. Elige tu sabor favorito: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino o Gansito.",
    "precio_base": 270,
    "opciones": [
      {"nombre":"Vainilla","precio":270},{"nombre":"Doble Chocolate","precio":270},
      {"nombre":"Marmoleado","precio":270},{"nombre":"Limón","precio":270},
      {"nombre":"Zanahoria","precio":270},{"nombre":"Red Velvet","precio":270},
      {"nombre":"Banoffee","precio":270},{"nombre":"Moka","precio":270},
      {"nombre":"Pingüino","precio":270},{"nombre":"Gansito","precio":270}
    ],
    "imagen_url": "/images/pastel-bento-lazos-rosa.png",
    "imagenes": ["/images/pastel-bento-lazos-rosa.png","/images/pasteles-bento-corazon-caja.png"],
    "activo": true
  },
  {
    "nombre": "Pastel Pequeño (16 cm)",
    "categoria": "Pasteles",
    "descripcion": "Pastel para 5-6 personas. Elige tu sabor: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino o Gansito.",
    "precio_base": 480,
    "opciones": [
      {"nombre":"Vainilla","precio":480},{"nombre":"Doble Chocolate","precio":480},
      {"nombre":"Marmoleado","precio":480},{"nombre":"Limón","precio":480},
      {"nombre":"Zanahoria","precio":480},{"nombre":"Red Velvet","precio":480},
      {"nombre":"Banoffee","precio":480},{"nombre":"Moka","precio":480},
      {"nombre":"Pingüino","precio":480},{"nombre":"Gansito","precio":480}
    ],
    "imagen_url": "/images/pastel-personalizado-flores-naturales.png",
    "imagenes": ["/images/pastel-personalizado-flores-naturales.png","/images/pastel-rosa-feliz-dia-mama.png","/images/pastel-vintage-bordado-vainilla.png"],
    "activo": true
  },
  {
    "nombre": "Pastel Mediano (18 cm)",
    "categoria": "Pasteles",
    "descripcion": "Pastel para 8-10 personas. Elige tu sabor: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino o Gansito.",
    "precio_base": 600,
    "opciones": [
      {"nombre":"Vainilla","precio":600},{"nombre":"Doble Chocolate","precio":600},
      {"nombre":"Marmoleado","precio":600},{"nombre":"Limón","precio":600},
      {"nombre":"Zanahoria","precio":600},{"nombre":"Red Velvet","precio":600},
      {"nombre":"Banoffee","precio":600},{"nombre":"Moka","precio":600},
      {"nombre":"Pingüino","precio":600},{"nombre":"Gansito","precio":600}
    ],
    "imagen_url": "/images/pastel-cumpleanos-rojo-lazos.png",
    "imagenes": ["/images/pastel-cumpleanos-rojo-lazos.png","/images/pasteles-snoopy-flores-azules.png","/images/pastel-naked-frutos-rojos.png"],
    "activo": true
  },
  {
    "nombre": "Pastel Grande (21 cm)",
    "categoria": "Pasteles",
    "descripcion": "Pastel para 12-15 personas. Elige tu sabor: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino o Gansito.",
    "precio_base": 870,
    "opciones": [
      {"nombre":"Vainilla","precio":870},{"nombre":"Doble Chocolate","precio":870},
      {"nombre":"Marmoleado","precio":870},{"nombre":"Limón","precio":870},
      {"nombre":"Zanahoria","precio":870},{"nombre":"Red Velvet","precio":870},
      {"nombre":"Banoffee","precio":870},{"nombre":"Moka","precio":870},
      {"nombre":"Pingüino","precio":870},{"nombre":"Gansito","precio":870}
    ],
    "imagen_url": "/images/pastel-dos-pisos-frambuesas.jpg",
    "imagenes": ["/images/pastel-dos-pisos-frambuesas.jpg","/images/pastel-naked-naranja-frutas.jpg"],
    "activo": true
  },
  {
    "nombre": "Pastel Familiar (23 cm)",
    "categoria": "Pasteles",
    "descripcion": "Pastel para 20-25 personas. Elige tu sabor: Vainilla, Doble Chocolate, Marmoleado, Limón, Zanahoria, Red Velvet, Banoffee, Moka, Pingüino o Gansito.",
    "precio_base": 1150,
    "opciones": [
      {"nombre":"Vainilla","precio":1150},{"nombre":"Doble Chocolate","precio":1150},
      {"nombre":"Marmoleado","precio":1150},{"nombre":"Limón","precio":1150},
      {"nombre":"Zanahoria","precio":1150},{"nombre":"Red Velvet","precio":1150},
      {"nombre":"Banoffee","precio":1150},{"nombre":"Moka","precio":1150},
      {"nombre":"Pingüino","precio":1150},{"nombre":"Gansito","precio":1150}
    ],
    "imagen_url": "/images/pastel-naked-frutos-rojos.png",
    "imagenes": ["/images/pastel-naked-frutos-rojos.png","/images/pastel-vintage-bordado-vainilla.png"],
    "activo": true
  }
]
EOF
)

curl -s -X POST "$SUPABASE_URL/rest/v1/productos" "${HDR[@]}" \
  -H "Prefer: return=minimal" \
  -d "$PRODUCTOS"

echo ""
echo "✅ 5 pasteles insertados con sabores como opciones"

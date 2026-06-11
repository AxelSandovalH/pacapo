'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Producto, Opcion } from '@/lib/supabase'

const WPP = '523141441119'

function waOrden(producto: string, opcion: Opcion | null, precio: number) {
  const detalle = opcion ? ` — ${opcion.nombre}` : ''
  const msg = `Hola Pácapo 👋 Me interesa hacer un pedido:

🎂 *Producto:* ${producto}${detalle} ($${precio.toLocaleString('es-MX')})
📅 *Fecha que lo necesito:*
⏰ *Hora de entrega:*
👥 *Número de personas:*
📍 *¿Paso a recoger o necesito entrega?:*
💬 *Observaciones / decoración especial:* `
  return `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`
}

const WPP_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={17} height={17}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function ProductCard({ producto }: { producto: Producto }) {
  const p = producto
  const hasOpciones = p.opciones && p.opciones.length > 0
  const [selectedIdx, setSelectedIdx] = useState(0)

  const selectedOpcion: Opcion | null = hasOpciones ? p.opciones[selectedIdx] : null
  const precioMostrar = selectedOpcion ? selectedOpcion.precio : p.precio_base

  // Si todas las opciones tienen el mismo precio → son sabores; si no → son tamaños
  const allSamePrice = hasOpciones && p.opciones.every(o => o.precio === p.opciones[0].precio)
  const selectorLabel = allSamePrice ? 'Selecciona sabor:' : 'Selecciona tamaño:'

  return (
    <div className="producto-card">
      <div className="producto-img">
        {p.imagen_url ? (
          <Image src={p.imagen_url} alt={p.nombre} fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={p.imagen_url.startsWith('/')}
          />
        ) : (
          <img src="/images/pastel-dos-pisos-frambuesas.jpg" alt={p.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div className="producto-body">
        <span className="categoria-badge">{p.categoria}</span>
        <h3 className="producto-nombre">{p.nombre}</h3>
        <p className="producto-desc">{p.descripcion}</p>

        {hasOpciones ? (
          <div className="opciones-selector">
            <p className="opciones-label">{selectorLabel}</p>
            <div className="opciones-chips">
              {p.opciones.map((o, i) => (
                <button key={i} type="button"
                  className={`opcion-chip-btn${selectedIdx === i ? ' selected' : ''}`}
                  onClick={() => setSelectedIdx(i)}>
                  <span className="sz-name">{o.nombre}</span>
                  {!allSamePrice && <span className="sz-price">${o.precio}</span>}
                  {o.descripcion && <span className="sz-pax">{o.descripcion}</span>}
                </button>
              ))}
            </div>
            <p className="precio-seleccionado">
              Precio: <strong>${precioMostrar.toLocaleString('es-MX')} MXN</strong>
            </p>
          </div>
        ) : (
          <p className="producto-precio">Desde ${p.precio_base}</p>
        )}

        <a href={waOrden(p.nombre, selectedOpcion, precioMostrar)}
          className="btn-pedir btn-pedir-full" target="_blank" rel="noopener">
          {WPP_SVG}
          Pedir por WhatsApp
        </a>
      </div>
    </div>
  )
}

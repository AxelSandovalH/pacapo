'use client'

import { useState } from 'react'

const WPP = '523141441119'

type Opcion = { n: string; p: number; px?: string }

type Props = {
  icon: string
  titulo: string
  categoria: string
  opciones: Opcion[]
  sabores: string[]
  imgSrc: string
  imgAlt: string
}

function waOrden(titulo: string, opcion: Opcion, saboresDisponibles: string[]) {
  const saboresStr = saboresDisponibles.length
    ? `\n🍰 *Sabores disponibles:* ${saboresDisponibles.join(', ')}`
    : ''
  const msg = `Hola Pácapo 👋 Me interesa hacer un pedido:

🎂 *Producto:* ${titulo} — ${opcion.n} ($${opcion.p.toLocaleString('es-MX')})${saboresStr}
🍓 *Sabor que quiero:*
📅 *Fecha que lo necesito:*
⏰ *Hora de entrega:*
👥 *Número de personas:*
📍 Entregas en Barrio 5, Avenida de los gansos No.18
💬 *Observaciones / decoración especial:* Mandamos tu imagen de referencia`
  return `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`
}

const WPP_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function MenuCard({ icon, titulo, categoria, opciones, sabores, imgSrc, imgAlt }: Props) {
  const [selected, setSelected] = useState(0)
  const op = opciones[selected]

  return (
    <div className="menu-card">
      <div className="menu-card-img">
        <img src={imgSrc} alt={imgAlt} loading="lazy" />
      </div>
      <div className="menu-card-icon">{icon}</div>
      <h3>{titulo}</h3>

      <div className="menu-sizes" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        {opciones.map((o, i) => (
          <div key={o.n}
            className={`size-chip${selected === i ? ' size-chip-active' : ''}`}
            onClick={() => setSelected(i)}
            style={{ cursor: 'pointer' }}>
            <div className="sz-name">{o.n}</div>
            <div className="sz-price">${o.p.toLocaleString('es-MX')}</div>
            {o.px && <div className="sz-pax">{o.px}</div>}
          </div>
        ))}
      </div>

      <ul style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        {sabores.map(f => <li key={f}>{f}</li>)}
      </ul>

      <div style={{ padding: '0 2rem 1.5rem' }}>
        <a href={waOrden(titulo, op, sabores)}
          className="btn-pedir btn-pedir-full" target="_blank" rel="noopener"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', textDecoration: 'none' }}>
          {WPP_SVG}
          Pedir ${op.p.toLocaleString('es-MX')} por WhatsApp
        </a>
      </div>
    </div>
  )
}

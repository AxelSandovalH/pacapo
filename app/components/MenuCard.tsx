'use client'

import { useState } from 'react'
import MenuBuyButton from './MenuBuyButton'

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
          <div
            key={o.n}
            className={`size-chip${selected === i ? ' size-chip-active' : ''}`}
            onClick={() => setSelected(i)}
            style={{ cursor: 'pointer' }}
          >
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
        <MenuBuyButton
          productoNombre={titulo}
          opcionNombre={op.n}
          opcionPrecio={op.p}
          categoria={categoria}
        />
      </div>
    </div>
  )
}

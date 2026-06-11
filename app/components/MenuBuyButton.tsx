'use client'

import { useState } from 'react'

type Props = {
  productoNombre: string
  opcionNombre: string
  opcionPrecio: number
  categoria: string
}

export default function MenuBuyButton({ productoNombre, opcionNombre, opcionPrecio, categoria }: Props) {
  const [loading, setLoading] = useState(false)

  async function handlePagar() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoNombre, opcionNombre, opcionPrecio, categoria }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error al iniciar el pago. Intenta de nuevo.')
    } catch {
      alert('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button className="menu-buy-btn" onClick={handlePagar} disabled={loading} type="button">
      {loading ? <span className="spinner" /> : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      )}
      {loading ? 'Procesando…' : `Pagar $${opcionPrecio.toLocaleString('es-MX')}`}
    </button>
  )
}

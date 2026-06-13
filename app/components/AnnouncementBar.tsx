'use client'

import { useEffect, useState } from 'react'
import { supabase, type Oferta } from '@/lib/supabase'

export default function AnnouncementBar() {
  const [oferta, setOferta] = useState<Oferta | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    supabase
      .from('ofertas')
      .select('*')
      .eq('activa', true)
      .or('fecha_fin.is.null,fecha_fin.gte.' + new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!data?.length) return
        const o = data[0] as Oferta
        const dismissed = sessionStorage.getItem(`oferta-${o.id}`)
        if (!dismissed) { setOferta(o); setVisible(true) }
      })
  }, [])

  useEffect(() => {
    if (visible) {
      document.documentElement.classList.add('has-announcement')
    } else {
      document.documentElement.classList.remove('has-announcement')
    }
    return () => document.documentElement.classList.remove('has-announcement')
  }, [visible])

  function dismiss() {
    if (oferta) sessionStorage.setItem(`oferta-${oferta.id}`, '1')
    setVisible(false)
  }

  if (!visible || !oferta) return null

  return (
    <div className="announcement-bar" style={{ background: oferta.color }}>
      <div className="announcement-inner">
        {oferta.emoji && <span className="announcement-emoji">{oferta.emoji}</span>}
        <div className="announcement-text">
          <strong>{oferta.titulo}</strong>
          {oferta.descripcion && <span>{oferta.descripcion}</span>}
        </div>
        {oferta.fecha_fin && (
          <span className="announcement-date">
            Hasta {new Date(oferta.fecha_fin + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
          </span>
        )}
      </div>
      <button className="announcement-close" onClick={dismiss} aria-label="Cerrar">✕</button>
    </div>
  )
}

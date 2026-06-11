'use client'

import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGERENCIAS = [
  '¿Qué tamaños tienen?',
  '¿Cuánto cuesta un pastel para 10 personas?',
  '¿Qué sabores de cheesecake hay?',
  '¿Con cuánto tiempo debo pedir?',
]

export default function ChatBot() {
  const [open, setOpen]       = useState(false)
  const [msgs, setMsgs]       = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && !started) {
      setStarted(true)
      setMsgs([{ role: 'assistant', content: '¡Hola! Soy Caro 🍒 la asistente de Pácapo. ¿En qué puedo ayudarte hoy?' }])
    }
  }, [open, started])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')

    const newMsgs: Msg[] = [...msgs, { role: 'user', content }]
    setMsgs(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'assistant', content: data.text ?? 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Por favor intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        className="chat-fab"
        onClick={() => setOpen(v => !v)}
        aria-label="Abrir chat"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={22} height={22}>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24}>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.244-1.292A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.032-1.094l-.286-.169-2.975.734.762-2.88-.187-.298A7.964 7.964 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
            <circle cx="8.5" cy="12.5" r="1.2"/><circle cx="12" cy="12.5" r="1.2"/><circle cx="15.5" cy="12.5" r="1.2"/>
          </svg>
        )}
        {!open && <span className="chat-fab-pulse" />}
      </button>

      {/* Ventana del chat */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-avatar">🍒</div>
            <div>
              <p className="chat-header-name">Caro — Pácapo</p>
              <p className="chat-header-status">● En línea</p>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Cerrar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg-bot chat-typing">
                <span /><span /><span />
              </div>
            )}

            {/* Sugerencias solo al inicio */}
            {msgs.length === 1 && !loading && (
              <div className="chat-suggestions">
                {SUGERENCIAS.map(s => (
                  <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form className="chat-input-row" onSubmit={e => { e.preventDefault(); send() }}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              disabled={loading}
            />
            <button className="chat-send" type="submit" disabled={loading || !input.trim()} aria-label="Enviar">
              <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}

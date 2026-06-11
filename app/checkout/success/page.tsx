export default function CheckoutSuccess() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: 'var(--crema)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: '3rem 2rem',
        maxWidth: '480px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎂</div>
        <h1 style={{ color: 'var(--cafe)', marginBottom: '0.75rem', fontSize: '1.75rem' }}>
          ¡Pago recibido!
        </h1>
        <p style={{ color: 'var(--cafe-med)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Tu pedido está confirmado. Te contactaremos pronto por WhatsApp para coordinar la fecha de entrega y los detalles de tu postre.
        </p>
        <p style={{ color: 'var(--cafe-med)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          📱 <strong>314 144 1119</strong>
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: 'var(--rosa)',
            color: '#fff',
            padding: '0.85rem 2rem',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}

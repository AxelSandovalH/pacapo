import Image from 'next/image'
import { supabase, type Producto } from '@/lib/supabase'

const WPP = '523141441119'
const WPP_BASE = `https://wa.me/${WPP}`

function waLink(texto: string) {
  return `${WPP_BASE}?text=${encodeURIComponent(texto)}`
}

const WPP_COTIZAR = waLink(
  'Hola Pácapo, quiero cotizar un postre para [ocasión] para [personas] personas en [fecha]. ¿Qué me recomiendas?'
)

function waProducto(nombre: string) {
  return waLink(
    `Hola Pácapo, me interesa el producto: *${nombre}*. ¿Tienen disponibilidad y cuánto tiempo de anticipación necesitan?`
  )
}

const WPP_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

async function getProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos:', error.message)
    return []
  }
  return data as Producto[]
}

export const revalidate = 60 // revalida cada 60 segundos

export default async function Home() {
  const productos = await getProductos()

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="#inicio" className="nav-logo">
          <img src="/images/logo-cereza-icono.jpg" alt="Pácapo logo" />
          <span>Pácapo</span>
        </a>
        <ul className="nav-links">
          <li><a href="#productos">Productos</a></li>
          <li><a href="#menu">Menú</a></li>
          <li><a href="#proceso">Nosotros</a></li>
          <li><a href="#pedido" className="nav-cta">Hacer pedido</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="hero-text">
          <p className="hero-tag">✦ Repostería artesanal · Manzanillo, Colima</p>
          <h1 className="hero-title">
            El pastel de tu<br /><em>celebración,</em><br />hecho a mano
          </h1>
          <p className="hero-desc">
            Cumpleaños, bodas, baby showers, graduaciones — cada ocasión merece un postre que sorprenda.
            Pasteles personalizados en Manzanillo, elaborados con ingredientes premium y mucho amor.
          </p>
          <div className="hero-btns">
            <div>
              <a href={WPP_COTIZAR} className="btn-primary" target="_blank" rel="noopener">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">{WPP_SVG.props.children}</svg>
                Cotizar mi pedido
              </a>
              <span className="microcopy">Respuesta en menos de 1 hora · Sin compromiso</span>
            </div>
            <a href="#menu" className="btn-secondary">Ver precios &rarr;</a>
          </div>
          <div className="trust-row">
            <span className="trust-item">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              +500 pedidos entregados
            </span>
            <span className="trust-item">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              5 años en Manzanillo
            </span>
            <span className="trust-item">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Ingredientes premium
            </span>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/pastel-dos-pisos-frambuesas.jpg" alt="Pastel de dos pisos con frambuesas" />
          <div className="hero-badge">
            <div className="hero-badge-icon">🍒</div>
            <div className="hero-badge-text">
              <strong>5 años</strong>
              endulzando Manzanillo
            </div>
          </div>
        </div>
      </section>

      {/* STRIP */}
      <div className="strip">
        <span>✦</span> Pasteles por encargo <span>✦</span> Tartas artesanales <span>✦</span> Cheesecakes <span>✦</span> Macarons <span>✦</span> Cookies <span>✦</span> Alfajores <span>✦</span>
      </div>

      {/* SOCIAL PROOF */}
      <div className="social-proof">
        <div className="sp-item"><strong>+500</strong> pedidos entregados</div>
        <div className="sp-dot" />
        <div className="sp-item"><strong>5 años</strong> endulzando Manzanillo</div>
        <div className="sp-dot" />
        <div className="sp-item"><strong>100%</strong> hecho a mano</div>
        <div className="sp-dot" />
        <div className="sp-item"><strong>⭐ 5/5</strong> calificación en redes</div>
      </div>

      {/* PRODUCTOS DINÁMICOS */}
      <section id="productos">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Repostería artesanal en Manzanillo</p>
            <h2 className="section-title">
              Postres que hacen<br />inolvidable tu ocasión
            </h2>
            <p className="section-desc">
              Desde pasteles personalizados para cumpleaños hasta cheesecakes de vitrina — todo elaborado a mano
              con técnica de pastelería profesional e ingredientes de primera calidad.
            </p>
          </div>

          {productos.length === 0 ? (
            <div className="productos-empty">
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍒</p>
              <p>Próximamente nuevos productos. Escríbenos por WhatsApp para ver disponibilidad.</p>
            </div>
          ) : (
            <div className="productos-grid">
              {productos.map((p) => (
                <div key={p.id} className="producto-card">
                  <div className="producto-img">
                    {p.imagen_url ? (
                      <Image
                        src={p.imagen_url}
                        alt={p.nombre}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <img
                        src="/images/pastel-dos-pisos-frambuesas.jpg"
                        alt={p.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className="producto-body">
                    <span className="categoria-badge">{p.categoria}</span>
                    <h3 className="producto-nombre">{p.nombre}</h3>
                    <p className="producto-desc">{p.descripcion}</p>

                    {p.opciones && p.opciones.length > 0 ? (
                      <div className="producto-opciones">
                        {p.opciones.map((o, i) => (
                          <span key={i} className="opcion-chip">
                            {o.nombre}: <strong>${o.precio}</strong>
                            {o.descripcion ? ` · ${o.descripcion}` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="producto-precio">Desde ${p.precio_base}</p>
                    )}

                    <a
                      href={waProducto(p.nombre)}
                      className="btn-pedir"
                      target="_blank"
                      rel="noopener"
                    >
                      {WPP_SVG}
                      Pedir por WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MENÚ */}
      <section id="menu">
        <div className="container">
          <div className="section-header center">
            <p className="section-label">Menú y precios — Manzanillo, Colima</p>
            <h2 className="section-title">Pasteles y postres<br />para cada celebración</h2>
            <div className="urgency-badge">
              <span className="urgency-dot" />
              Agenda limitada — reserva con 2 a 3 días de anticipación
            </div>
            <p className="section-desc">
              Pasteles personalizados, tartas artesanales y cheesecakes en Manzanillo.
              Escríbenos por WhatsApp para confirmar disponibilidad y apartamos tu fecha.
            </p>
          </div>
          <div className="menu-grid">
            <div className="menu-card">
              <div className="menu-card-icon">🎂</div>
              <h3>Pasteles por encargo</h3>
              <div className="menu-sizes">
                {[
                  { n: 'Individual', p: '$270', px: '1-2 pers.' },
                  { n: 'Pequeño',    p: '$490', px: '6-8 pers.' },
                  { n: 'Mediano',    p: '$580', px: '10-12 pers.' },
                  { n: 'Grande',     p: '$700', px: '15-20 pers.' },
                ].map((s) => (
                  <div key={s.n} className="size-chip">
                    <div className="sz-name">{s.n}</div>
                    <div className="sz-price">{s.p}</div>
                    <div className="sz-pax">{s.px}</div>
                  </div>
                ))}
              </div>
              <ul>
                {['Pingüino','Zanahoria','Vainilla clásico','Limón Silvestre','Banoffee','Mármol de chocolate','Doble cacao','+ rellenos extras $30'].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="menu-card">
              <div className="menu-card-icon">🥧</div>
              <h3>Tartas & Cheesecakes</h3>
              <div className="menu-sizes">
                {[
                  { n: 'Chico',   p: '$320', px: '3-4 pers.' },
                  { n: 'Mediano', p: '$480', px: '6-8 pers.' },
                  { n: 'Grande',  p: '$670', px: '10-12 pers.' },
                ].map((s) => (
                  <div key={s.n} className="size-chip">
                    <div className="sz-name">{s.n}</div>
                    <div className="sz-price">{s.p}</div>
                    <div className="sz-pax">{s.px}</div>
                  </div>
                ))}
              </div>
              <ul>
                {['Baileys','Snicker','Banoffee','Guayaba','Limón','Pay de manzana','Frutos rojos','Café','Tropical'].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="menu-card">
              <div className="menu-card-icon">🍪</div>
              <h3>Galletas, Brownies & Alfajores</h3>
              <div className="menu-sizes">
                {[
                  { n: '6 piezas',  p: '$240', px: '' },
                  { n: '9 piezas',  p: '$360', px: '' },
                  { n: '12 piezas', p: '$480', px: '' },
                ].map((s) => (
                  <div key={s.n} className="size-chip">
                    <div className="sz-name">{s.n}</div>
                    <div className="sz-price">{s.p}</div>
                  </div>
                ))}
              </div>
              <ul>
                {['Postres clásicos','Tiramisú','Pastel alemán','Pastel de crepas','Tres leches'].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="menu-cta">
            <a href={WPP_COTIZAR} className="btn-primary" target="_blank" rel="noopener">
              {WPP_SVG}
              Quiero cotizar mi pedido
            </a>
            <span className="microcopy" style={{ color: 'var(--cafe-med)' }}>
              Te respondemos en menos de 1 hora · Asesoría gratis
            </span>
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section id="proceso">
        <div className="container">
          <div className="proceso-grid">
            <div>
              <p className="section-label">Nuestra historia · Manzanillo, Colima</p>
              <h2 className="section-title">5 años creando<br />momentos dulces</h2>
              <p className="section-desc">
                Pácapo nació del amor por la repostería de precisión. Cada postre es elaborado a mano con
                recetas propias — porque tu celebración merece algo especial, no genérico.
              </p>
              <div className="steps">
                {[
                  { n: 1, t: 'Escoge tu postre', d: 'Revisa nuestro menú y elige el tamaño y sabor que más te guste.' },
                  { n: 2, t: 'Escríbenos por WhatsApp', d: 'Confirma disponibilidad y fecha de entrega con 2 a 3 días de anticipación.' },
                  { n: 3, t: 'Recibe tu pedido', d: 'Lo preparamos con dedicación y lo tienes listo para tu celebración.' },
                ].map((s) => (
                  <div key={s.n} className="step">
                    <div className="step-num">{s.n}</div>
                    <div>
                      <h4>{s.t}</h4>
                      <p>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="proceso-imgs">
              <img src="/images/cheesecakes-proceso-decoracion.jpg" alt="Decoración de cheesecakes" loading="lazy" />
              <img src="/images/cookies-chocolate-decoracion.jpg" alt="Decoración de cookies" loading="lazy" />
              <img src="/images/alfajores-azucar-glass.jpg" alt="Alfajores artesanales" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* PEDIDO CTA */}
      <section id="pedido">
        <div className="container">
          <div className="pedido-card">
            <p className="section-label">¿Lista tu fecha? Aparta tu lugar</p>
            <h2>Tu celebración merece<br />el postre perfecto</h2>
            <p>
              Cuéntanos la ocasión, cuántas personas y tu fecha — te asesoramos gratis y creamos
              exactamente lo que imaginas. Agenda limitada cada semana.
            </p>
            <a href={WPP_COTIZAR} className="btn-wpp" target="_blank" rel="noopener">
              {WPP_SVG}
              Cotizar por WhatsApp — es gratis
            </a>
            <span className="microcopy" style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '0.7rem' }}>
              Respondemos en menos de 1 hora · Sin compromiso
            </span>
            <div className="info-chips">
              <span className="chip">📍 Manzanillo, Colima</span>
              <span className="chip">⏰ Agenda con 2-3 días de anticipación</span>
              <span className="chip">🎂 Cumpleaños · Bodas · Baby shower</span>
            </div>
          </div>
        </div>
      </section>

      {/* REDES */}
      <section id="redes">
        <div className="container">
          <div className="section-header center">
            <p className="section-label">Síguenos</p>
            <h2 className="section-title">Encuéntranos en<br />redes sociales</h2>
          </div>
          <div className="redes-grid">
            <a href={WPP_COTIZAR} className="red-card rc-wpp" target="_blank" rel="noopener">
              <div className="red-icon">{WPP_SVG}</div>
              <div>
                <h4>WhatsApp Business</h4>
                <p>314 144 1119 — Escríbenos directo</p>
              </div>
            </a>
            <a href="https://www.instagram.com/pacapo.reposteria?igsh=MWlpZ2lsN2h3amRuaQ==" className="red-card rc-ig" target="_blank" rel="noopener">
              <div className="red-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div>
                <h4>Instagram</h4>
                <p>@pacapo.reposteria</p>
              </div>
            </a>
            <a href="https://www.facebook.com/share/18KoQ8JAZx/?mibextid=wwXIfr" className="red-card rc-fb" target="_blank" rel="noopener">
              <div className="red-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <h4>Facebook</h4>
                <p>Pácapo Repostería</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <img className="footer-logo" src="/images/logo-cereza-icono.jpg" alt="Pácapo logo" />
        <div className="brand-name">Pácapo Repostería</div>
        <div className="tagline">Hecho con amor en Manzanillo, Colima</div>
        <div className="footer-links">
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#menu">Menú</a>
          <a href="#proceso">Nosotros</a>
          <a href="mailto:hcanacarolina@gmail.com">hcanacarolina@gmail.com</a>
          <a href="tel:+523141441119">314 144 1119</a>
        </div>
        <p className="copy">&copy; 2026 Pácapo Repostería. Todos los derechos reservados.</p>
      </footer>

      {/* FLOATING WPP */}
      <a href={WPP_COTIZAR} className="wpp-float" target="_blank" rel="noopener" aria-label="Contactar por WhatsApp">
        {WPP_SVG}
      </a>
    </>
  )
}

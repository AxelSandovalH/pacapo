'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import type { Opcion, Producto } from '@/lib/supabase'
import s from './admin.module.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const BUCKET = 'productos'
const MAX_PX  = 1920
const QUALITY = 0.85

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      let { width, height } = img
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) { height = Math.round(height * MAX_PX / width); width = MAX_PX }
        else                 { width  = Math.round(width  * MAX_PX / height); height = MAX_PX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas vacío')), 'image/jpeg', QUALITY)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const CATEGORIAS = [
  'Pasteles por encargo',
  'Tartas & Cheesecakes',
  'Galletas & Alfajores',
  'Brownies',
  'Cupcakes',
  'Macarons',
  'Postres especiales',
]

type FormState = {
  nombre: string
  categoria: string
  descripcion: string
  precio_base: string
  opciones: Opcion[]
  activo: boolean
}

const EMPTY: FormState = {
  nombre: '',
  categoria: '',
  descripcion: '',
  precio_base: '',
  opciones: [],
  activo: true,
}

// ── TOGGLE ───────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`${s.toggle} ${on ? s.on : ''}`}
    >
      <span className={s.toggleThumb} />
    </button>
  )
}

// ── MAIN ─────────────────────────────────────────────────────
export default function AdminPage() {
  const [loading, setLoading]     = useState(true)
  const [authed, setAuthed]       = useState(false)

  // login form
  const [email, setEmail]         = useState('')
  const [pass, setPass]           = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [authErr, setAuthErr]     = useState('')
  const [authBusy, setAuthBusy]   = useState(false)

  // dashboard
  const [tab, setTab]             = useState<'agregar' | 'productos'>('agregar')
  const [productos, setProductos] = useState<Producto[]>([])
  const [form, setForm]           = useState<FormState>(EMPTY)
  const [imgFiles, setImgFiles]   = useState<File[]>([])
  const [imgPrevs, setImgPrevs]   = useState<string[]>([])
  const [busy, setBusy]           = useState(false)
  const [msg, setMsg]             = useState<{ ok: boolean; text: string } | null>(null)
  const [delId, setDelId]         = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  // ── auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setAuthed(true); load() }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
      if (session) load()
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setAuthBusy(true)
    setAuthErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setAuthErr('Correo o contraseña incorrectos.')
    setAuthBusy(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setAuthed(false)
    setProductos([])
    setForm(EMPTY)
    clearImg()
  }

  // ── data ──
  async function load() {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })
    setProductos((data as Producto[]) ?? [])
  }

  // ── form helpers ──
  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function addOpcion() {
    setField('opciones', [...form.opciones, { nombre: '', precio: 0, descripcion: '' }])
  }

  function updOpcion(i: number, key: keyof Opcion, val: string) {
    const ops = [...form.opciones]
    ops[i] = { ...ops[i], [key]: key === 'precio' ? Number(val) : val }
    setField('opciones', ops)
  }

  function remOpcion(i: number) {
    setField('opciones', form.opciones.filter((_, idx) => idx !== i))
  }

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setImgFiles(prev => [...prev, ...files])
    setImgPrevs(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImg(i: number) {
    setImgFiles(prev => prev.filter((_, idx) => idx !== i))
    setImgPrevs(prev => prev.filter((_, idx) => idx !== i))
  }

  function clearImg() {
    setImgFiles([])
    setImgPrevs([])
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── submit ──
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    const nombre      = form.nombre.trim()
    const descripcion = form.descripcion.trim()

    if (!nombre)      return setMsg({ ok: false, text: 'Escribe el nombre del producto.' })
    if (!form.categoria) return setMsg({ ok: false, text: 'Elige una categoría.' })
    if (!descripcion) return setMsg({ ok: false, text: 'Agrega una descripción.' })
    if (!form.precio_base) return setMsg({ ok: false, text: 'Escribe el precio base.' })

    setBusy(true)

    // Comprimir y subir todas las fotos
    const imagenes: string[] = []
    for (const file of imgFiles) {
      const blob = await compressImage(file)
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
      if (upErr) {
        setMsg({ ok: false, text: `Error subiendo imagen: ${upErr.message}` })
        setBusy(false)
        return
      }
      imagenes.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    }

    const { error } = await supabase.from('productos').insert({
      nombre,
      categoria:   form.categoria,
      descripcion,
      precio_base: Number(form.precio_base),
      opciones:    form.opciones.filter(o => o.nombre.trim()),
      imagen_url:  imagenes[0] ?? null,
      imagenes,
      activo:      form.activo,
    })

    if (error) {
      setMsg({ ok: false, text: `Error: ${error.message}` })
    } else {
      setMsg({ ok: true, text: `¡Producto guardado con ${imagenes.length || 0} foto${imagenes.length !== 1 ? 's' : ''}! Ya aparece en el sitio.` })
      setForm(EMPTY)
      clearImg()
      load()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setBusy(false)
  }

  async function toggleActivo(p: Producto) {
    await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    load()
  }

  async function confirmDel() {
    if (!delId) return
    await supabase.from('productos').delete().eq('id', delId)
    setDelId(null)
    load()
  }

  // ── renders ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className={s.loading}>
        <span className={s.loadingIcon}>—</span>
        Cargando...
      </div>
    )
  }

  if (!authed) {
    return (
      <div className={s.loginPage}>
        <div className={s.loginCard}>
          <div className={s.loginTop}>
            <h1 className={s.loginTitle}>Pácapo Admin</h1>
            <p className={s.loginSub}>Ingresa para gestionar tus productos</p>
          </div>

          <form onSubmit={login}>
            <div className={s.fGroup}>
              <label className={s.label} htmlFor="email">Correo electrónico</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                className={s.input} placeholder="correo@ejemplo.com"
              />
            </div>
            <div className={s.fGroup}>
              <label className={s.label} htmlFor="pass">Contraseña</label>
              <div className={s.passWrap}>
                <input
                  id="pass" type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                  value={pass} onChange={e => setPass(e.target.value)}
                  className={s.input} placeholder="••••••••"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" className={s.passToggle} onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {authErr && <div className={s.authError}>{authErr}</div>}

            <button type="submit" className={s.btnPrimary} disabled={authBusy}>
              {authBusy ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── dashboard ──
  return (
    <div className={s.wrap}>

      {/* HEADER */}
      <header className={s.header}>
        <span className={s.headerBrand}>Pácapo Admin</span>
        <div className={s.headerActions}>
          <a href="/" target="_blank" className={s.btnOutline}>Ver sitio</a>
          <button onClick={logout} className={s.btnOutline}>Salir</button>
        </div>
      </header>

      <main className={s.main}>

        {/* TABS DESKTOP */}
        <div className={s.topTabs}>
          {(['agregar', 'productos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`${s.topTabBtn} ${tab === t ? s.active : ''}`}
            >
              {t === 'agregar' ? '+ Agregar producto' : `Mis productos (${productos.length})`}
            </button>
          ))}
        </div>

        {/* ── FORM AGREGAR ── */}
        {tab === 'agregar' && (
          <form onSubmit={submit} noValidate>

            {msg && (
              <div className={msg.ok ? s.alertOk : s.alertErr}>{msg.text}</div>
            )}

            {/* FOTOS */}
            <div className={s.card}>
              <span className={s.cardLabel}>Fotos del producto</span>

              {/* input oculto, reutilizable */}
              <input
                ref={fileRef} type="file" accept="image/*" multiple
                onChange={handleImg} style={{ display: 'none' }}
              />

              {imgPrevs.length > 0 ? (
                <div className={s.fotosGrid}>
                  {imgPrevs.map((src, i) => (
                    <div key={i} className={`${s.fotoItem} ${i === 0 ? s.fotoPrimera : ''}`}>
                      <Image src={src} alt={`foto ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                      <button type="button" className={s.removePhoto} onClick={() => removeImg(i)}>✕</button>
                    </div>
                  ))}
                  {/* Botón para agregar más */}
                  <label className={s.addMasBtn}>
                    <input type="file" accept="image/*" multiple onChange={handleImg} style={{ display: 'none' }} />
                    <span className={s.addMasIcon}>＋</span>
                    <span>Agregar</span>
                  </label>
                </div>
              ) : (
                <label className={s.dropzone}>
                  <input type="file" accept="image/*" multiple onChange={handleImg} style={{ display: 'none' }} />
                  <span className={s.dropzoneTitle}>Toca para agregar fotos</span>
                  <span className={s.dropzoneSub}>Una o varias · Cámara o galería · JPG, PNG</span>
                </label>
              )}
            </div>

            {/* INFO BÁSICA */}
            <div className={s.card}>
              <span className={s.cardLabel}>Información básica</span>

              <div className={s.fGroup}>
                <label className={s.label} htmlFor="nombre">
                  Nombre del producto <span className={s.req}>*</span>
                </label>
                <input
                  id="nombre" type="text" maxLength={80}
                  value={form.nombre} onChange={e => setField('nombre', e.target.value)}
                  className={s.input} placeholder="Ej. Cheesecake de limón"
                />
              </div>

              <div className={s.fRow}>
                <div className={s.fGroup}>
                  <label className={s.label} htmlFor="categoria">
                    Categoría <span className={s.req}>*</span>
                  </label>
                  <select
                    id="categoria"
                    value={form.categoria} onChange={e => setField('categoria', e.target.value)}
                    className={s.select}
                  >
                    <option value="">— Elige —</option>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className={s.fGroup}>
                  <label className={s.label} htmlFor="precio">
                    Precio base ($) <span className={s.req}>*</span>
                  </label>
                  <input
                    id="precio" type="number" min={0} step={10} inputMode="numeric"
                    value={form.precio_base} onChange={e => setField('precio_base', e.target.value)}
                    className={s.input} placeholder="320"
                  />
                </div>
              </div>

              <div className={s.fGroup} style={{ marginBottom: 0 }}>
                <label className={s.label} htmlFor="desc">
                  Descripción <span className={s.req}>*</span>
                </label>
                <textarea
                  id="desc"
                  value={form.descripcion} onChange={e => setField('descripcion', e.target.value)}
                  className={s.textarea}
                  placeholder="Sabores, rellenos, ingredientes, para cuántas personas…"
                />
              </div>
            </div>

            {/* TAMAÑOS */}
            <div className={s.card}>
              <span className={s.cardLabel}>Tamaños u opciones</span>
              <p style={{ fontSize: '0.82rem', color: '#7A4A2A', marginBottom: '1rem', lineHeight: 1.5 }}>
                Si el producto tiene varios tamaños agrégalos aquí. Si no, déjalo vacío.
              </p>

              {form.opciones.map((o, i) => (
                <div key={i} className={s.opcionCard}>
                  <div className={s.opcionHeader}>
                    <span className={s.opcionNum}>Opción {i + 1}</span>
                    <button type="button" className={s.btnQuitar} onClick={() => remOpcion(i)}>Quitar</button>
                  </div>
                  <div className={s.opcionRow}>
                    <div>
                      <label className={s.label}>Nombre</label>
                      <input type="text" value={o.nombre}
                        onChange={e => updOpcion(i, 'nombre', e.target.value)}
                        className={s.inputSm} placeholder="Mediano" />
                    </div>
                    <div>
                      <label className={s.label}>Precio $</label>
                      <input type="number" value={o.precio || ''} min={0} inputMode="numeric"
                        onChange={e => updOpcion(i, 'precio', e.target.value)}
                        className={s.inputSm} placeholder="480" />
                    </div>
                  </div>
                  <div>
                    <label className={s.label}>Detalle (opcional)</label>
                    <input type="text" value={o.descripcion ?? ''}
                      onChange={e => updOpcion(i, 'descripcion', e.target.value)}
                      className={s.inputSm} placeholder="6-8 personas" />
                  </div>
                </div>
              ))}

              <button type="button" className={s.btnAddOpcion} onClick={addOpcion}>
                + Agregar tamaño / opción
              </button>
            </div>

            {/* VISIBILIDAD */}
            <div className={s.card}>
              <div className={s.visibilidadRow}>
                <div className={s.visibilidadText}>
                  <p>Visible en el sitio</p>
                  <p>Los clientes podrán ver este producto</p>
                </div>
                <Toggle on={form.activo} onChange={v => setField('activo', v)} />
              </div>
            </div>

            <button type="submit" className={s.btnPrimary} disabled={busy}>
              {busy ? 'Guardando...' : 'Guardar producto'}
            </button>
          </form>
        )}

        {/* ── LISTA PRODUCTOS ── */}
        {tab === 'productos' && (
          <div>
            <h2 className={s.listaHeader}>
              Mis productos
              <span className={s.conteo}>{productos.length}</span>
            </h2>

            {productos.length === 0 ? (
              <div className={`${s.card} ${s.empty}`}>
                <span className={s.emptyIcon} />
                <p className={s.emptyText}>Aún no tienes productos.<br />¡Agrega el primero!</p>
                <button className={s.btnEmptyCta} onClick={() => setTab('agregar')}>
                  + Agregar producto
                </button>
              </div>
            ) : (
              <div className={s.productosList}>
                {productos.map(p => (
                  <div key={p.id} className={s.productoCard}>
                    <div className={s.productoBody}>
                      <div className={s.productoThumb}>
                        {p.imagen_url
                          ? <Image src={p.imagen_url} alt={p.nombre} fill style={{ objectFit: 'cover' }} />
                          : '—'}
                      </div>
                      <div className={s.productoInfo}>
                        <p className={s.productoNombre}>{p.nombre}</p>
                        <p className={s.productoCategoria}>{p.categoria}</p>
                        <p className={s.productoPrecio}>Desde ${p.precio_base}</p>
                      </div>
                      <Toggle on={p.activo} onChange={() => toggleActivo(p)} />
                    </div>
                    <div className={s.productoAcciones}>
                      <span className={s.accionBtn} style={{ color: p.activo ? '#1a6a3a' : '#7A4A2A' }}>
                        {p.activo ? '● Visible' : '○ Oculto'}
                      </span>
                      <div className={s.accionDivider} />
                      <button className={`${s.accionBtn} ${s.accionEliminar}`} onClick={() => setDelId(p.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* BOTTOM TABS (mobile) */}
      <nav className={s.bottomTabs}>
        {([
          { key: 'agregar',   icon: '+', label: 'Agregar' },
          { key: 'productos', icon: '·', label: `Productos (${productos.length})` },
        ] as const).map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`${s.tabBtn} ${tab === key ? s.active : ''}`}
          >
            <span className={s.tabIcon}>{icon}</span>
            <span className={s.tabLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL ELIMINAR */}
      {delId && (
        <div className={s.modalOverlay} onClick={() => setDelId(null)}>
          <div className={s.modalBox} onClick={e => e.stopPropagation()}>
            <p className={s.modalTitle}>¿Eliminar producto?</p>
            <p className={s.modalText}>
              Esta acción no se puede deshacer. El producto dejará de aparecer en el sitio.
            </p>
            <div className={s.modalBtns}>
              <button className={s.btnPrimary} onClick={confirmDel}>Sí, eliminar</button>
              <button className={s.btnSecondary} onClick={() => setDelId(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

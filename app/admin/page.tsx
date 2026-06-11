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
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas vacío')), 'image/jpeg', QUALITY)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const CATEGORIAS = ['Pasteles', 'Cheesecakes', 'Postres Premium', 'Dulcería', 'Cupcakes', 'Macarons']

type Tab = 'agregar' | 'productos' | 'ordenes'

type Orden = {
  id: string
  stripe_session_id: string
  producto_nombre: string
  opcion_nombre: string | null
  opcion_precio: number
  customer_email: string | null
  customer_name: string | null
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
}

type FormState = {
  nombre: string
  categoria: string
  descripcion: string
  precio_base: string
  opciones: Opcion[]
  activo: boolean
}

const EMPTY: FormState = { nombre: '', categoria: '', descripcion: '', precio_base: '', opciones: [], activo: true }

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on}
      onClick={() => onChange(!on)} className={`${s.toggle} ${on ? s.on : ''}`}>
      <span className={s.toggleThumb} />
    </button>
  )
}

function StatusBadge({ status }: { status: Orden['status'] }) {
  const map = { paid: { label: 'Pagado', cls: s.badgePaid }, pending: { label: 'Pendiente', cls: s.badgePending }, cancelled: { label: 'Cancelado', cls: s.badgeCancelled } }
  const { label, cls } = map[status] ?? map.pending
  return <span className={`${s.badge} ${cls}`}>{label}</span>
}

export default function AdminPage() {
  const [loading, setLoading]     = useState(true)
  const [authed, setAuthed]       = useState(false)
  const [email, setEmail]         = useState('')
  const [pass, setPass]           = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [authErr, setAuthErr]     = useState('')
  const [authBusy, setAuthBusy]   = useState(false)

  const [tab, setTab]             = useState<Tab>('productos')
  const [productos, setProductos] = useState<Producto[]>([])
  const [ordenes, setOrdenes]     = useState<Orden[]>([])
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState<FormState>(EMPTY)
  const [imgFiles, setImgFiles]   = useState<File[]>([])
  const [imgPrevs, setImgPrevs]   = useState<string[]>([])
  const [existingImgs, setExistingImgs] = useState<string[]>([])
  const [busy, setBusy]           = useState(false)
  const [msg, setMsg]             = useState<{ ok: boolean; text: string } | null>(null)
  const [delId, setDelId]         = useState<string | null>(null)
  const [ordenFilter, setOrdenFilter] = useState<'all' | 'paid' | 'pending'>('all')

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setAuthed(true); loadAll() }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
      if (session) loadAll()
    })
    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setAuthBusy(true); setAuthErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setAuthErr('Correo o contraseña incorrectos.')
    setAuthBusy(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setAuthed(false); setProductos([]); setOrdenes([]); setForm(EMPTY); clearImg()
  }

  async function loadAll() {
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from('productos').select('*').order('created_at', { ascending: false }),
      supabase.from('ordenes').select('*').order('created_at', { ascending: false }),
    ])
    setProductos((prods as Producto[]) ?? [])
    setOrdenes((ords as Orden[]) ?? [])
  }

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function addOpcion() { setField('opciones', [...form.opciones, { nombre: '', precio: 0, descripcion: '' }]) }
  function updOpcion(i: number, key: keyof Opcion, val: string) {
    const ops = [...form.opciones]
    ops[i] = { ...ops[i], [key]: key === 'precio' ? Number(val) : val }
    setField('opciones', ops)
  }
  function remOpcion(i: number) { setField('opciones', form.opciones.filter((_, idx) => idx !== i)) }

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
  function removeExistingImg(i: number) { setExistingImgs(prev => prev.filter((_, idx) => idx !== i)) }
  function clearImg() { setImgFiles([]); setImgPrevs([]); setExistingImgs([]); if (fileRef.current) fileRef.current.value = '' }

  function startEdit(p: Producto) {
    setEditId(p.id)
    setForm({ nombre: p.nombre, categoria: p.categoria, descripcion: p.descripcion, precio_base: String(p.precio_base), opciones: p.opciones ?? [], activo: p.activo })
    setExistingImgs(p.imagenes ?? (p.imagen_url ? [p.imagen_url] : []))
    setImgFiles([]); setImgPrevs([])
    setMsg(null)
    setTab('agregar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditId(null); setForm(EMPTY); clearImg(); setMsg(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null)
    const nombre      = form.nombre.trim()
    const descripcion = form.descripcion.trim()
    if (!nombre)         return setMsg({ ok: false, text: 'Escribe el nombre del producto.' })
    if (!form.categoria) return setMsg({ ok: false, text: 'Elige una categoría.' })
    if (!descripcion)    return setMsg({ ok: false, text: 'Agrega una descripción.' })
    if (!form.precio_base) return setMsg({ ok: false, text: 'Escribe el precio base.' })
    setBusy(true)

    const nuevasUrls: string[] = []
    for (const file of imgFiles) {
      const blob = await compressImage(file)
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
      if (upErr) { setMsg({ ok: false, text: `Error subiendo imagen: ${upErr.message}` }); setBusy(false); return }
      nuevasUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    }

    const imagenes = [...existingImgs, ...nuevasUrls]
    const payload = {
      nombre, categoria: form.categoria, descripcion,
      precio_base: Number(form.precio_base),
      opciones: form.opciones.filter(o => o.nombre.trim()),
      imagen_url: imagenes[0] ?? null,
      imagenes,
      activo: form.activo,
    }

    let error
    if (editId) {
      ({ error } = await supabase.from('productos').update(payload).eq('id', editId))
    } else {
      ({ error } = await supabase.from('productos').insert(payload))
    }

    if (error) {
      setMsg({ ok: false, text: `Error: ${error.message}` })
    } else {
      const accion = editId ? 'Producto actualizado' : 'Producto guardado'
      setMsg({ ok: true, text: `¡${accion} con ${imagenes.length} foto${imagenes.length !== 1 ? 's' : ''}! Ya aparece en el sitio.` })
      setEditId(null); setForm(EMPTY); clearImg()
      loadAll()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setBusy(false)
  }

  async function toggleActivo(p: Producto) {
    await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    loadAll()
  }

  async function confirmDel() {
    if (!delId) return
    await supabase.from('productos').delete().eq('id', delId)
    setDelId(null); loadAll()
  }

  const ordenesFiltradas = ordenes.filter(o => ordenFilter === 'all' || o.status === ordenFilter)
  const totalPagado = ordenes.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.opcion_precio, 0)

  // ── renders ──────────────────────────────────────────────

  if (loading) return (
    <div className={s.loading}><span className={s.loadingIcon}>🍒</span>Cargando...</div>
  )

  if (!authed) return (
    <div className={s.loginPage}>
      <div className={s.loginCard}>
        <div className={s.loginTop}>
          <span className={s.loginEmoji}>🎂</span>
          <h1 className={s.loginTitle}>Pácapo Admin</h1>
          <p className={s.loginSub}>Ingresa para gestionar tus productos</p>
        </div>
        <form onSubmit={login}>
          <div className={s.fGroup}>
            <label className={s.label} htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              className={s.input} placeholder="correo@ejemplo.com" />
          </div>
          <div className={s.fGroup}>
            <label className={s.label} htmlFor="pass">Contraseña</label>
            <div className={s.passWrap}>
              <input id="pass" type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                value={pass} onChange={e => setPass(e.target.value)}
                className={s.input} placeholder="••••••••" style={{ paddingRight: '3rem' }} />
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

  return (
    <div className={s.wrap}>

      {/* HEADER */}
      <header className={s.header}>
        <span className={s.headerBrand}>🎂 Pácapo Admin</span>
        <div className={s.headerActions}>
          <a href="/" target="_blank" className={s.btnOutline}>Ver sitio ↗</a>
          <button onClick={logout} className={s.btnOutline}>Salir</button>
        </div>
      </header>

      <main className={s.main}>

        {/* TABS DESKTOP */}
        <div className={s.topTabs}>
          {([
            { key: 'productos', label: `Productos (${productos.length})` },
            { key: 'agregar',   label: editId ? '✏️ Editando producto' : '+ Agregar producto' },
            { key: 'ordenes',   label: `Órdenes (${ordenes.length})` },
          ] as { key: Tab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`${s.topTabBtn} ${tab === t.key ? s.active : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── FORM AGREGAR / EDITAR ── */}
        {tab === 'agregar' && (
          <form onSubmit={submit} noValidate>
            {editId && (
              <div className={s.editBanner}>
                ✏️ Editando producto
                <button type="button" className={s.btnCancelEdit} onClick={cancelEdit}>Cancelar edición</button>
              </div>
            )}

            {msg && <div className={msg.ok ? s.alertOk : s.alertErr}>{msg.text}</div>}

            {/* FOTOS */}
            <div className={s.card}>
              <span className={s.cardLabel}>Fotos del producto</span>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImg} style={{ display: 'none' }} />

              {(existingImgs.length > 0 || imgPrevs.length > 0) ? (
                <div className={s.fotosGrid}>
                  {existingImgs.map((src, i) => (
                    <div key={`ex-${i}`} className={`${s.fotoItem} ${i === 0 && imgPrevs.length === 0 ? s.fotoPrimera : ''}`}>
                      <Image src={src} alt={`foto existente ${i + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
                      <button type="button" className={s.removePhoto} onClick={() => removeExistingImg(i)}>✕</button>
                    </div>
                  ))}
                  {imgPrevs.map((src, i) => (
                    <div key={`new-${i}`} className={`${s.fotoItem} ${existingImgs.length === 0 && i === 0 ? s.fotoPrimera : ''}`}>
                      <Image src={src} alt={`foto nueva ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                      <button type="button" className={s.removePhoto} onClick={() => removeImg(i)}>✕</button>
                    </div>
                  ))}
                  <label className={s.addMasBtn}>
                    <input type="file" accept="image/*" multiple onChange={handleImg} style={{ display: 'none' }} />
                    <span className={s.addMasIcon}>＋</span>
                    <span>Agregar</span>
                  </label>
                </div>
              ) : (
                <label className={s.dropzone}>
                  <input type="file" accept="image/*" multiple onChange={handleImg} style={{ display: 'none' }} />
                  <span className={s.dropzoneIcon}>📷</span>
                  <span className={s.dropzoneTitle}>Toca para agregar fotos</span>
                  <span className={s.dropzoneSub}>Una o varias · Cámara o galería · JPG, PNG</span>
                </label>
              )}
            </div>

            {/* INFO BÁSICA */}
            <div className={s.card}>
              <span className={s.cardLabel}>Información básica</span>
              <div className={s.fGroup}>
                <label className={s.label} htmlFor="nombre">Nombre del producto <span className={s.req}>*</span></label>
                <input id="nombre" type="text" maxLength={80}
                  value={form.nombre} onChange={e => setField('nombre', e.target.value)}
                  className={s.input} placeholder="Ej. Cheesecake de limón" />
              </div>
              <div className={s.fRow}>
                <div className={s.fGroup}>
                  <label className={s.label} htmlFor="categoria">Categoría <span className={s.req}>*</span></label>
                  <select id="categoria" value={form.categoria} onChange={e => setField('categoria', e.target.value)} className={s.select}>
                    <option value="">— Elige —</option>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={s.fGroup}>
                  <label className={s.label} htmlFor="precio">Precio base ($) <span className={s.req}>*</span></label>
                  <input id="precio" type="number" min={0} step={10} inputMode="numeric"
                    value={form.precio_base} onChange={e => setField('precio_base', e.target.value)}
                    className={s.input} placeholder="320" />
                </div>
              </div>
              <div className={s.fGroup} style={{ marginBottom: 0 }}>
                <label className={s.label} htmlFor="desc">Descripción <span className={s.req}>*</span></label>
                <textarea id="desc" value={form.descripcion} onChange={e => setField('descripcion', e.target.value)}
                  className={s.textarea} placeholder="Sabores, rellenos, ingredientes, para cuántas personas…" />
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
                      <input type="text" value={o.nombre} onChange={e => updOpcion(i, 'nombre', e.target.value)}
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
                    <input type="text" value={o.descripcion ?? ''} onChange={e => updOpcion(i, 'descripcion', e.target.value)}
                      className={s.inputSm} placeholder="6-8 personas" />
                  </div>
                </div>
              ))}
              <button type="button" className={s.btnAddOpcion} onClick={addOpcion}>+ Agregar tamaño / opción</button>
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
              {busy ? 'Guardando...' : editId ? 'Actualizar producto' : 'Guardar producto'}
            </button>
          </form>
        )}

        {/* ── LISTA PRODUCTOS ── */}
        {tab === 'productos' && (
          <div>
            <div className={s.listaHeaderRow}>
              <h2 className={s.listaHeader}>
                Mis productos <span className={s.conteo}>{productos.length}</span>
              </h2>
              <button className={s.btnAddNew} onClick={() => { cancelEdit(); setTab('agregar') }}>+ Agregar</button>
            </div>

            {productos.length === 0 ? (
              <div className={`${s.card} ${s.empty}`}>
                <span className={s.emptyIcon}>🍒</span>
                <p className={s.emptyText}>Aún no tienes productos.<br />¡Agrega el primero!</p>
                <button className={s.btnEmptyCta} onClick={() => setTab('agregar')}>+ Agregar producto</button>
              </div>
            ) : (
              <div className={s.productosList}>
                {productos.map(p => (
                  <div key={p.id} className={s.productoCard}>
                    <div className={s.productoBody}>
                      <div className={s.productoThumb}>
                        {p.imagen_url
                          ? <Image src={p.imagen_url} alt={p.nombre} fill style={{ objectFit: 'cover' }} unoptimized />
                          : '🎂'}
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
                      <button className={s.accionBtn} onClick={() => startEdit(p)}>✏️ Editar</button>
                      <div className={s.accionDivider} />
                      <button className={`${s.accionBtn} ${s.accionEliminar}`} onClick={() => setDelId(p.id)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ÓRDENES ── */}
        {tab === 'ordenes' && (
          <div>
            {/* Stats */}
            <div className={s.statsRow}>
              <div className={s.statCard}>
                <p className={s.statNum}>{ordenes.filter(o => o.status === 'paid').length}</p>
                <p className={s.statLabel}>Pedidos pagados</p>
              </div>
              <div className={s.statCard}>
                <p className={s.statNum}>${totalPagado.toLocaleString('es-MX')}</p>
                <p className={s.statLabel}>Total recaudado</p>
              </div>
              <div className={s.statCard}>
                <p className={s.statNum}>{ordenes.filter(o => o.status === 'pending').length}</p>
                <p className={s.statLabel}>Pendientes</p>
              </div>
            </div>

            {/* Filtros */}
            <div className={s.filtros}>
              {(['all', 'paid', 'pending'] as const).map(f => (
                <button key={f} onClick={() => setOrdenFilter(f)}
                  className={`${s.filtroBtn} ${ordenFilter === f ? s.filtroActive : ''}`}>
                  {{ all: 'Todas', paid: 'Pagadas', pending: 'Pendientes' }[f]}
                </button>
              ))}
            </div>

            {ordenesFiltradas.length === 0 ? (
              <div className={`${s.card} ${s.empty}`}>
                <span className={s.emptyIcon}>📋</span>
                <p className={s.emptyText}>No hay órdenes aún.<br />Aparecerán aquí cuando alguien pague.</p>
              </div>
            ) : (
              <div className={s.ordenesList}>
                {ordenesFiltradas.map(o => (
                  <div key={o.id} className={s.ordenCard}>
                    <div className={s.ordenTop}>
                      <div>
                        <p className={s.ordenProducto}>{o.producto_nombre}</p>
                        {o.opcion_nombre && <p className={s.ordenOpcion}>{o.opcion_nombre}</p>}
                      </div>
                      <div className={s.ordenRight}>
                        <p className={s.ordenPrecio}>${o.opcion_precio.toLocaleString('es-MX')}</p>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    <div className={s.ordenMeta}>
                      {o.customer_name && <span>{o.customer_name}</span>}
                      {o.customer_email && <span>{o.customer_email}</span>}
                      <span>{new Date(o.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
          { key: 'productos', icon: '📦', label: `Productos` },
          { key: 'agregar',   icon: '＋',  label: editId ? 'Editar' : 'Agregar' },
          { key: 'ordenes',   icon: '🧾',  label: 'Órdenes' },
        ] as { key: Tab; icon: string; label: string }[]).map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`${s.tabBtn} ${tab === key ? s.active : ''}`}>
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
            <p className={s.modalText}>Esta acción no se puede deshacer. El producto dejará de aparecer en el sitio.</p>
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

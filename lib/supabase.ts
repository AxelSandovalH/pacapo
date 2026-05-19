import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export type Opcion = {
  nombre: string
  precio: number
  descripcion?: string
}

export type Producto = {
  id: string
  nombre: string
  categoria: string
  descripcion: string
  precio_base: number
  opciones: Opcion[]
  imagen_url: string | null  // primera imagen (para las cards del sitio)
  imagenes: string[]          // todas las imágenes
  activo: boolean
  created_at: string
}

// Client singleton — works in both server and browser contexts for our use case
export const supabase = createClient(url, anon)

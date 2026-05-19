import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pácapo Repostería | Pasteles y Postres Personalizados en Manzanillo, Colima',
  description:
    'Repostería artesanal en Manzanillo, Colima. Pasteles personalizados por encargo, tartas, cheesecakes y más. Más de 5 años endulzando celebraciones. Pedidos por WhatsApp al 314 144 1119.',
  keywords:
    'pasteles en Manzanillo, repostería Manzanillo Colima, pasteles personalizados, cheesecake Manzanillo, postres por encargo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}

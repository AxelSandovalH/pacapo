import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { productoId, productoNombre, opcionNombre, opcionPrecio, categoria } =
      await req.json()

    if (!productoNombre || !opcionPrecio) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const origin = req.headers.get('origin') ?? 'https://pacapobakery.com'

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      locale: 'es-419',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: opcionNombre
                ? `${productoNombre} — ${opcionNombre}`
                : productoNombre,
              description: categoria ?? undefined,
            },
            unit_amount: Math.round(opcionPrecio * 100), // centavos MXN
          },
          quantity: 1,
        },
      ],
      payment_method_types: ['card'],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#productos`,
      metadata: {
        producto_id: productoId ?? '',
        producto_nombre: productoNombre,
        opcion_nombre: opcionNombre ?? '',
        opcion_precio: String(opcionPrecio),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

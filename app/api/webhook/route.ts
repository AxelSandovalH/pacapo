import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Necesario para leer el body crudo que Stripe firma
export const runtime = 'nodejs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}

    await supabaseAdmin.from('ordenes').insert({
      stripe_session_id: session.id,
      stripe_payment_id: session.payment_intent as string | null,
      producto_id: meta.producto_id || null,
      producto_nombre: meta.producto_nombre,
      opcion_nombre: meta.opcion_nombre || null,
      opcion_precio: Number(meta.opcion_precio),
      customer_email: session.customer_details?.email ?? null,
      customer_name: session.customer_details?.name ?? null,
      status: 'paid',
    })
  }

  return NextResponse.json({ received: true })
}

// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno&no-check"

// Configuração do Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-08-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Assinatura do Webhook (será configurada nas variáveis de ambiente depois)
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature || !endpointSecret) {
    return new Response('Webhook signature missing', { status: 400 })
  }

  let event
  const body = await req.text() // Ler como texto para verificação

  try {
    // 1. Verificar se o evento veio mesmo do Stripe
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret
    )
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400 })
  }

  // 2. Inicializar Supabase Admin (para poder escrever na tabela subscriptions sem estar logado como usuário)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 3. Processar os Eventos
  try {
    switch (event.type) {
      // Evento A: Compra finalizada no Checkout
      case 'checkout.session.completed': {
        const session = event.data.object
        
        // Pegar dados que salvamos no metadata durante o checkout
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id
        
        if (userId && planId) {
          // Atualizar ou criar assinatura no banco
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan_id: planId,
              status: 'active',
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString()
            })
          console.log(`✅ Assinatura ativada para ${userId}`)
        }
        break
      }

      // Evento B: Atualização de assinatura (renovação, cancelamento, falta de pagto)
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Buscar quem é o dono dessa assinatura no nosso banco
        const { data: userSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (userSub) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: subscription.status, // 'active', 'past_due', 'canceled'
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userSub.user_id)
          
          console.log(`🔄 Status atualizado para ${subscription.status} (User: ${userSub.user_id})`)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})

// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let body;
    try {
      body = await req.json()
    } catch (e) {
      throw new Error("Corpo da requisição inválido ou vazio")
    }
    
    const planIdParam = body.planId || body.plan_id
    
    if (!planIdParam) {
      throw new Error("Parâmetro 'plan_id' é obrigatório")
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("Header Authorization faltando")

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Usuário não autenticado')

    // ⚠️ SUBSTITUA PELOS SEUS PRICE IDS REAIS DO STRIPE
    const prices: Record<string, string> = {
      'pro': 'price_1SbUtdGoW23H3x15iq8rjnhW',    // Troque isso pelo seu Price ID real
      'agency': 'price_1SbUuOGoW23H3x15Ighe0AiA',  // Troque isso pelo seu Price ID real
    }
    
    const priceId = prices[planIdParam]
    if (!priceId) {
      throw new Error(`Plano '${planIdParam}' não encontrado. Price IDs configurados: ${Object.keys(prices).join(', ')}`)
    }

    console.log(`✅ Checkout para: ${user.email} | Plano: ${planIdParam} | Price: ${priceId}`)

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planIdParam
      }
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error("❌ ERRO:", error.message)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

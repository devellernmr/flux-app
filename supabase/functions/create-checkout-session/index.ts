// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno" 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // LOG PARA VERIFICAR DEPLOY
  console.log("🚀 [v2.0.3] Iniciando create-checkout-session")

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

    // ✅ Usando variáveis de ambiente para os Price IDs (Mais seguro e flexível)
    const prices: Record<string, string> = {
      'pro': Deno.env.get('STRIPE_PRO_PRICE_ID') || 'price_1Svp6UK455PYItaBoorrK3OM',
      'agency': Deno.env.get('STRIPE_AGENCY_PRICE_ID') || 'price_1SvpGCK455PYItaBtaUxFM27',
    }
    
    const priceId = prices[planIdParam]
    
    // --- DIAGNÓSTICOS ---
    console.log(`🔍 Diagnóstico:`)
    console.log(`   - Plan ID recebido: ${planIdParam}`)
    console.log(`   - Price ID mapeado: ${priceId}`)
    console.log(`   - Stripe Key Prefix: ${stripeKey.substring(0, 7)}...`)
    
    if (!priceId) {
      throw new Error(`Plano '${planIdParam}' não encontrado. Price IDs configurados: ${Object.keys(prices).join(', ')}`)
    }

    // Verificar se o preço existe no Stripe antes de tentar o checkout
    try {
      const stripePrice = await stripe.prices.retrieve(priceId)
      console.log(`   - Preço no Stripe: ${stripePrice.active ? 'Ativo' : 'Inativo'} | Moeda: ${stripePrice.currency}`)
    } catch (err: any) {
      console.error(`   - ❌ Erro ao validar preço no Stripe: ${err.message}`)
      throw new Error(`O Price ID '${priceId}' não foi encontrado na conta Stripe associada a esta chave (${stripeKey.substring(0, 7)}...). Verifique se você está usando a chave de Teste ou Live correta.`)
    }
    // ----------------------

    console.log(`✅ Checkout para: ${user.email} | Plano: ${planIdParam} | Price: ${priceId}`)

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      payment_method_types: ['card'],
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

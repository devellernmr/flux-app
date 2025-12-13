import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratamento de CORS para requisições OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Configurar Stripe e Supabase Client
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16', // Mantenha a versão consistente com a outra function
      httpClient: Stripe.createFetchHttpClient(),
    })

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("Header Authorization faltando")

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 2. Obter Usuário Logado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Usuário não autenticado')

    // 3. Buscar o Customer ID do Stripe no banco de dados
    // IMPORTANTE: Sua tabela de perfil ou subscriptions deve ter o 'stripe_customer_id' salvo
    // Se você não salva isso no banco, precisará buscar no Stripe pelo email (menos performático)
    
    // Tentativa 1: Buscar do banco (AJUSTE "profiles" E O CAMPO CONFORME SEU BANCO)
    /*
    const { data: profile } = await supabaseClient
       .from('profiles') 
       .select('stripe_customer_id')
       .eq('id', user.id)
       .single()
    let customerId = profile?.stripe_customer_id;
    */

    // Tentativa 2 (Fallback): Buscar no Stripe pelo email se não tiver no banco
    let customerId;
    if (!customerId) {
        console.log(`🔍 Buscando customer no Stripe pelo email: ${user.email}`);
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
        });
        
        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        }
    }

    if (!customerId) {
        throw new Error("Cliente não encontrado no Stripe. O usuário pode não ter uma assinatura ativa ainda.");
    }

    console.log(`✅ Criando Portal Session para: ${user.email} | Customer ID: ${customerId}`)

    // 4. Criar a Sessão do Portal de Faturamento
    // A URL de retorno deve ser a página de dashboard do seu app
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`, 
    });

    // 5. Retornar a URL
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

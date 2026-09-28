import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const { topic, format } = await req.json();

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY faltando");

    const prompt = `
      Aja como um estrategista de conteúdo para Instagram de elite. 
      Crie um post para o Instagram sobre o tema: "${topic}".
      O formato escolhido é: "${format}" (square, portrait ou story).

      Retorne APENAS um JSON válido com esta estrutura exata, sem markdown:
      {
        "hook": "Um título ou frase inicial impactante para a imagem/capa",
        "visual_suggestion": "Uma descrição detalhada de como deve ser a imagem ou os elementos visuais do post para atrair atenção",
        "caption": "A legenda completa do post, incluindo emojis, estruturada para retenção",
        "cta": "Uma chamada para ação (CTA) poderosa",
        "hashtags": "#hashtag1 #hashtag2 #hashtag3"
      }

      Regras:
      - Use um tom profissional, mas magnético e moderno.
      - A legenda deve ter parágrafos curtos.
      - O hook deve ser impossível de ignorar.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("IA não respondeu nada.");
    }

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    return new Response(text, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: error.message
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});


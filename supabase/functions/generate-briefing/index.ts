import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { niche, projectType } = await req.json();

    // Sua chave deve estar configurada no .env ou hardcoded aqui
    const geminiKey = Deno.env.get("GEMINI_API_KEY"); 
    if (!geminiKey) throw new Error("GEMINI_API_KEY faltando");

    const prompt = `
      Aja como um gerente de projetos. Crie um briefing para um projeto de "${projectType}" no nicho de "${niche}".
      Retorne APENAS um JSON válido com esta estrutura exata, sem markdown:
      {
        "title": "Título curto para o projeto",
        "questions": [
           "Pergunta estratégica 1?",
           "Pergunta estratégica 2?",
           "Pergunta estratégica 3?",
           "Pergunta estratégica 4?",
           "Pergunta estratégica 5?"
        ]
      }
    `;

    // USANDO O MODELO QUE APARECEU NA SUA LISTA: gemini-2.0-flash
// No fetch, use exatamente esta URL:
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
  }),
});


    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates) throw new Error("IA não respondeu nada.");

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/``````/g, "").trim();

    return new Response(JSON.stringify(JSON.parse(text)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
        title: "Erro na Geração", 
        questions: ["Erro: " + error.message] 
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { comments } = await req.json();

        if (!comments || !Array.isArray(comments) || comments.length === 0) {
            return new Response(JSON.stringify({
                summary: "Nenhum comentário para analisar.",
                sentiment: "neutral",
                actionable_points: []
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) throw new Error("GEMINI_API_KEY faltando");

        const commentsText = comments.map((c: any) => `- ${c.content}`).join("\n");

        const prompt = `
      Aja como um assistente sênior de design. Analise os seguintes comentários de feedback de um cliente sobre um design:
      
      ${commentsText}
      
      Forneça um resumo executivo curto, identifique o sentimento predominante (positivo, neutro ou negativo) e extraia pontos de ação claros.
      
      Retorne APENAS um JSON válido com esta estrutura exata, sem markdown:
      {
        "summary": "Resumo em uma ou duas frases",
        "sentiment": "positivo | neutro | negativo",
        "actionable_points": [
           "Ponto de ação 1",
           "Ponto de ação 2",
           ...
        ]
      }
    `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

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
        // Limpar possíveis blocos de código se a IA retornar markdown
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return new Response(JSON.stringify(JSON.parse(text)), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Erro na função analyze-feedback:", error);
        return new Response(JSON.stringify({
            summary: "Erro ao analisar feedback.",
            sentiment: "neutral",
            actionable_points: ["Erro: " + error.message]
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
});

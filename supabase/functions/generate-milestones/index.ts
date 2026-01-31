import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

    try {
        const { briefingContent, projectName } = await req.json();

        const geminiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiKey) throw new Error("GEMINI_API_KEY faltando");

        const briefingSummary = briefingContent
            .map((b: any) => `${b.label}: ${b.answer || 'Não respondido'}`)
            .join("\n");

        const prompt = `
      Aja como um gerente de operações de uma agência de design. Com base no briefing do projeto "${projectName}" abaixo, crie um roadmap de 6 etapas claras para a entrega.
      
      Briefing:
      ${briefingSummary}
      
      Retorne APENAS um JSON válido (um array de objetos) com esta estrutura exata, sem markdown:
      [
        { "label": "Nome da Etapa 1", "desc": "Status curto (Ex: Concluído)" },
        { "label": "Nome da Etapa 2", "desc": "Status curto (Ex: Em Progresso)" },
        { "label": "Nome da Etapa 3", "desc": "Status curto (Ex: Pendente)" },
        { "label": "Nome da Etapa 4", "desc": "Status curto (Ex: Pendente)" },
        { "label": "Nome da Etapa 5", "desc": "Status curto (Ex: Pendente)" },
        { "label": "Nome da Etapa 6", "desc": "Status curto (Ex: Conclusão)" }
      ]
      
      Certifique-se de que a primeira etapa seja relacionada ao setup/briefing e a última à entrega final.
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
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return new Response(text, {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Erro na função generate-milestones:", error);
        return new Response(JSON.stringify([
            { label: "Briefing", desc: "Erro na IA" },
            { label: "Setup", desc: "Pendente" },
            { label: "Design", desc: "Pendente" },
            { label: "Feedback", desc: "Pendente" },
            { label: "Entrega", desc: "Pendente" },
            { label: "Finalizado", desc: "Conclusão" }
        ]), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 // Retornamos 200 para evitar que o frontend quebre
        });
    }
});

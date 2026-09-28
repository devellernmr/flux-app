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
    const { messages, projectName, projectDescription } = await req.json();

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) throw new Error("GEMINI_API_KEY não configurada");

    const systemPrompt = `Você é o Assistente IA do Fluxs., uma plataforma de gestão de projetos criativos para agências.
Você está ajudando o cliente de um projeto chamado "${projectName || "Projeto"}".
${projectDescription ? `Descrição do projeto: ${projectDescription}` : ""}

Suas responsabilidades:
- Tirar dúvidas gerais sobre o projeto
- Explicar como usar as funcionalidades do Fluxs. (briefing, aprovações, arquivos, financeiro, etc.)
- Ajudar o cliente a entender o status e próximos passos
- Ser cordial, objetivo e profissional
- Responder sempre em português do Brasil
- Manter respostas curtas e diretas (máximo 3-4 parágrafos)

Não faça nada fora desse escopo. Se perguntarem algo não relacionado ao projeto ou à plataforma, redirecione gentilmente.`;

    // Formata o histórico de mensagens para o Gemini
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || !data.candidates[0]) throw new Error("IA não respondeu.");

    const text = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ reply: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Erro no project-ai-chat:", error);
    return new Response(
      JSON.stringify({ reply: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em instantes." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});

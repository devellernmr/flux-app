// supabase/functions/send-team-invite-email/index.ts

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "https://seu-app.com";

type Payload = {
  email: string;
  token: string;
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return new Response("Server misconfigured", { status: 500 });
  }

  const { email, token } = (await req.json()) as Payload;

  if (!email || !token) {
    return new Response("Missing fields", { status: 400 });
  }

  const inviteLink = `${APP_URL}/invite/${token}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Leonardo Eller <leooieller@gmail.com>",
      to: [email],
      subject: "Convite para participar de um projeto no Fluxo",
      html: `
        <p>Você foi convidado para colaborar em um projeto no Fluxo.</p>
        <p>Clique no link abaixo para aceitar o convite:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <p>Se você não esperava este convite, pode ignorar este e-mail.</p>
      `,
    }),
  }); // [web:71][web:86]

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error:", text);
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

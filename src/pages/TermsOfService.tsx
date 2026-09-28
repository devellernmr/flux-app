import { Link } from "react-router-dom";
import { ArrowLeft, Scale, CheckCircle2, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Termos de Uso | Fluxs.";
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <span className="font-black text-white text-xs">F.</span>
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              FLUXS<span className="text-blue-500">.</span>
            </span>
          </Link>

          <Link to="/">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-2 rounded-xl text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-12">
        {/* Title Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" /> Acordo de Serviço SaaS
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Termos de Uso
          </h1>
          <p className="text-sm text-zinc-500">
            Última atualização: 28 de Setembro de 2026
          </p>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed pt-2">
            Bem-vindo ao <strong className="text-white">Fluxs</strong>. Ao acessar nossa plataforma ou criar uma conta, você concorda com as condições e termos estabelecidos a seguir.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Disponibilidade e Uptime</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Trabalhamos continuamente para garantir alta disponibilidade e desempenho em nossos serviços em nuvem.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Propriedade Intelectual</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você mantém total e exclusiva propriedade intelectual de todos os arquivos, marcas e briefings gerenciados no app.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Cancelamento Flexível</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Planos pagos podem ser cancelados ou gerenciados a qualquer momento pelo portal de autoatendimento.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-zinc-300 text-sm md:text-base leading-relaxed divide-y divide-white/5">
          {/* Section 1 */}
          <section className="space-y-4 pt-8 first:pt-0">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">01.</span> Aceitação dos Termos
            </h2>
            <p>
              Ao utilizar o serviço Fluxs (disponibilizado via web), você confirma ter capacidade civil para contratar e aceitar integralmente estes Termos de Uso. Caso discorde de qualquer cláusula, solicitamos que não utilize nossos serviços.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">02.</span> Descrição dos Serviços
            </h2>
            <p>
              O Fluxs é uma plataforma SaaS (Software as a Service) projetada para agências, designers e profissionais criativos organizarem briefings, gerenciarem rodadas de aprovação e feedbacks com clientes, calcularem rentabilidade e compartilharem roadmaps de projetos.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">03.</span> Cadastro e Segurança da Conta
            </h2>
            <ul className="space-y-2.5 list-none pl-0">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Você é responsável por manter a confidencialidade de suas credenciais de acesso (e-mail e senha).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Todas as atividades realizadas sob sua conta são de sua responsabilidade legal e operacional.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Notifique imediatamente a equipe Fluxs caso suspeite de acesso não autorizado à sua conta.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">04.</span> Planos, Cobrança e Cancelamento
            </h2>
            <p>
              O Fluxs oferece planos gratuitos e por assinatura mensal com diferentes limites de projetos, armazenamento e recursos de IA.
            </p>
            <ul className="space-y-2 list-disc pl-5 text-zinc-400">
              <li><strong className="text-white">Cobrança Recorrente:</strong> As assinaturas são renovadas automaticamente a cada ciclo mensal até que ocorra o cancelamento.</li>
              <li><strong className="text-white">Cancelamento:</strong> O usuário pode cancelar a renovação da sua assinatura a qualquer momento através do painel da conta. O acesso aos recursos pagos permanece ativo até o fim do período já pago.</li>
              <li><strong className="text-white">Reembolsos:</strong> Em conformidade com o Código de Defesa do Consumidor, reembolsos podem ser solicitados em até 7 dias corridos após a primeira contratação.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">05.</span> Uso Aceitável da Plataforma
            </h2>
            <p>
              É expressamente proibido utilizar o Fluxs para:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-zinc-400">
              <li>Armazenar ou transmitir arquivos ilegais, difamatórios, maliciosos ou protegidos por direitos autorais de terceiros sem a devida autorização;</li>
              <li>Tentar violar a segurança, autenticação ou integridade dos servidores e banco de dados;</li>
              <li>Fazer engenharia reversa ou reproduzir os recursos proprietários da plataforma sem autorização formal.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">06.</span> Limitação de Responsabilidade
            </h2>
            <p>
              Em nenhuma circunstância o Fluxs será responsável por lucros cessantes, perdas indiretas de dados ou danos decorrentes de falhas de conexão de internet do usuário ou de prestadores de serviços terceirizados (ex: instabilidades transitórias de gateways de pagamento).
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">07.</span> Contato e Suporte
            </h2>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2 mt-4">
              <p className="text-white font-bold">Fluxs Atendimento ao Cliente</p>
              <p className="text-zinc-400 text-sm">E-mail: <a href="mailto:fluxs.company@gmail.com" className="text-blue-400 hover:underline">fluxs.company@gmail.com</a></p>
              <p className="text-zinc-400 text-sm">WhatsApp de Atendimento: +55 (32) 99883-3302</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-xs text-zinc-600">
        <p>© 2026 Fluxs. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

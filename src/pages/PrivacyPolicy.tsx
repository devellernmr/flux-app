import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Política de Privacidade | Fluxs.";
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
            <Shield className="w-3.5 h-3.5" /> Conformidade com a LGPD (Lei nº 13.709/2018)
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Política de Privacidade
          </h1>
          <p className="text-sm text-zinc-500">
            Última atualização: 28 de Setembro de 2026
          </p>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed pt-2">
            A sua privacidade e a segurança dos dados da sua agência e dos seus clientes são pilares fundamentais no <strong className="text-white">Fluxs</strong>. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações.
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Criptografia Ponta a Ponta</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Todos os dados trafegam via HTTPS/TLS e são armazenados com segurança de nível bancário.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Seus Dados São Seus</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nunca comercializamos ou compartilhamos seus briefings e arquivos com terceiros para fins de marketing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Total Transparência</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você pode solicitar a exportação ou exclusão definitiva de sua conta e dados a qualquer momento.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-zinc-300 text-sm md:text-base leading-relaxed divide-y divide-white/5">
          {/* Section 1 */}
          <section className="space-y-4 pt-8 first:pt-0">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">01.</span> Informações que Coletamos
            </h2>
            <p>
              Ao utilizar a plataforma Fluxs, podemos coletar os seguintes tipos de informações:
            </p>
            <ul className="space-y-2.5 list-none pl-0">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Dados de Cadastro:</strong> Nome completo, endereço de e-mail, senha criptografada e dados da sua empresa ou agência.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Conteúdo e Projetos:</strong> Textos de briefings, arquivos de design enviados para aprovação, comentários e informações preenchidas nos formulários de projetos.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Dados de Pagamento:</strong> O processamento de pagamentos e assinaturas é realizado por gateways certificados (como Stripe). Não armazenamos números completos de cartões de crédito em nossos servidores.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span><strong className="text-white">Dados de Acesso e Navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas e dados coletados via cookies técnicos para manter sua sessão ativa.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">02.</span> Finalidade do Uso dos Dados
            </h2>
            <p>
              Utilizamos as informações coletadas estritamente para:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-zinc-400">
              <li>Fornecer, operar, manter e aprimorar as funcionalidades da plataforma Fluxs;</li>
              <li>Permitir a colaboração entre você, membros de sua equipe e seus clientes externos;</li>
              <li>Processar pagamentos e gerenciar assinaturas;</li>
              <li>Enviar notificações importantes sobre prazos, aprovações de tarefas e atualizações de segurança;</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes ou acessos não autorizados.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">03.</span> Cookies e Tecnologias de Rastreamento (Pixels)
            </h2>
            <p>
              Utilizamos cookies e tecnologias similares (como Meta Pixel e Google Analytics) para entender como nossa landing page é utilizada e otimizar nossas campanhas de anúncios:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-zinc-400">
              <li><strong className="text-white">Cookies Essenciais:</strong> Necessários para autenticação e segurança da sua conta.</li>
              <li><strong className="text-white">Cookies de Desempenho e Análise:</strong> Ajudam a mensurar o tráfego e identificar melhorias na usabilidade.</li>
              <li><strong className="text-white">Pixels de Publicidade:</strong> Permitem medir a eficácia de nossos anúncios no Meta (Facebook/Instagram) e Google. Você pode desativar o rastreamento através das configurações do seu navegador ou de ferramentas de privacidade.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">04.</span> Compartilhamento de Informações
            </h2>
            <p>
              O Fluxs não vende, aluga ou compartilha suas informações pessoais com terceiros para fins comerciais. O compartilhamento ocorre apenas quando estritamente necessário para:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-zinc-400">
              <li>Provedores de infraestrutura e hospedagem em nuvem (ex: Supabase, Vercel);</li>
              <li>Processadores de pagamento autorizados (ex: Stripe);</li>
              <li>Cumprimento de obrigações legais ou ordens judiciais emitidas por autoridades competentes.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">05.</span> Seus Direitos (LGPD)
            </h2>
            <p>
              Conforme estabelecido pela Lei Geral de Proteção de Dados (LGPD), você possui o direito de:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-zinc-400">
              <li>Confirmar a existência de tratamento e acessar seus dados;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Revogar o consentimento e solicitar a exclusão integral de sua conta.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-blue-500 font-mono text-lg">06.</span> Contato e Encarregado de Dados (DPO)
            </h2>
            <p>
              Caso tenha dúvidas sobre esta Política de Privacidade ou deseje exercer seus direitos de titular de dados, entre em contato com nosso time:
            </p>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-2 mt-4">
              <p className="text-white font-bold">Fluxs Tecnologia e Gestão</p>
              <p className="text-zinc-400 text-sm">E-mail: <a href="mailto:fluxs.company@gmail.com" className="text-blue-400 hover:underline">fluxs.company@gmail.com</a></p>
              <p className="text-zinc-400 text-sm">WhatsApp de Suporte: +55 (32) 99883-3302</p>
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

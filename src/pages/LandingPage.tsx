import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Zap,
  MousePointerClick,
  ShieldCheck,
  Lock,
  Globe,
  LayoutTemplate,
  MessageSquare,
  FileBox,
  Star,
  Mail,
  Instagram,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// --- COMPONENTS ---

const Navbar = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-black text-white text-xs">F.</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Fluxs.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Recursos
          </a>
          <a
            href="#benefits"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Benefícios
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Preços
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Contato
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={session ? "/dashboard" : "/login"}
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors hidden sm:block"
          >
            {session ? "Dashboard" : "Entrar"}
          </Link>
          <Link to={session ? "/dashboard" : "/login"}>
            <Button className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-105 active:scale-95">
              {session ? "Acessar Plataforma" : "Começar Grátis"}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Star className="w-3 h-3 fill-blue-400" />
            Nova Era para Agências
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
            Aprovação de clientes <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              até 3x mais rápida. Sem WhatsApp.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Centralize briefings, arquivos e feedbacks em um único link. <br />
            Chega de áudio confuso, refação infinita e cliente perdido.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                Criar Workspace em 2 minutos
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-xs text-zinc-500 font-medium mt-2 sm:mt-0">
              Não precisa de cartão • Plano grátis para sempre
            </p>
          </div>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full opacity-30 pointer-events-none" />
    </section>
  );
};

const Testimonials = () => (
  <section className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-16 tracking-tighter">
        Quem usa,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          não volta pro WhatsApp.
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: "Gabriel M.",
            role: "Dono de Agência",
            text: "Antes eu perdia 2h por dia cobrando cliente. Hoje o Fluxs faz isso por mim. O cliente aprova no celular e eu só recebo o 'ok'. Surreal.",
          },
          {
            name: "Ana P.",
            role: "Freelancer UI/UX",
            text: "O visual do briefing impressiona muito nas reuniões. Fechei um contrato de R$ 5k só porque o cliente achou minha organização 'de outro nível'.",
          },
          {
            name: "Lucas S.",
            role: "Gestor de Tráfego",
            text: "Centralizar arquivos e senhas num lugar só salvou minha vida. O suporte é rápido e a ferramenta não buga. Recomendo.",
          },
        ].map((t, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl bg-zinc-900/20 border border-white/5 hover:border-blue-500/30 transition-all"
          >
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-4 h-4 fill-yellow-500 text-yellow-500"
                />
              ))}
            </div>
            <p className="text-zinc-300 mb-6 leading-relaxed">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                {t.name[0]}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const InfoTicker = () => {
  const items = [
    "Aprovação 3x mais rápida",
    "Fim do caos no WhatsApp",
    "Centralização de arquivos",
    "Branding profissional",
    "Briefings inteligentes",
    "Feedbacks interativos",
    "Gestão simplificada",
    "White-label completo",
    "Mais de 500 agências já usam",
  ];

  return (
    <div className="border-y border-white/5 bg-zinc-950/20 backdrop-blur-sm overflow-hidden py-6 relative">
      {/* Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 50,
              ease: "linear",
            },
          }}
          className="flex gap-16 items-center pr-16"
        >
          {[...items, ...items, ...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="w-1 h-1 bg-blue-500/50 rounded-full" />
              <span className="text-[10px] md:text-xs font-bold text-zinc-400/60 uppercase tracking-[0.2em] hover:text-white transition-colors cursor-default whitespace-nowrap">
                {item}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const ProblemAgitation = () => (
  <section className="py-24 md:py-32 relative">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
          Sua agência ainda trabalha no{" "}
          <span className="text-red-500">Modo Sobrevivência</span>?
        </h2>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Se sua rotina é apagar incêndio, sua operação está vazando tempo,
          dinheiro e autoridade. Os verdadeiros inimigos:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: MessageSquare,
            color: "text-green-500",
            title: "📞 Telefone Sem Fio",
            desc: "Feedback por áudio vira erro, esquecimento e refação desnecessária.",
          },
          {
            icon: FileBox,
            color: "text-orange-500",
            title: "📁 Limbo dos Assets",
            desc: '"Me manda o arquivo de novo?" vira rotina quando tudo está espalhado.',
          },
          {
            icon: MousePointerClick,
            color: "text-red-500",
            title: "🎯 Aprovação Cega",
            desc: '"Muda alguma coisa ali" gera V1, V2, V7… até ninguém aguentar mais.',
          },
          {
            icon: Layers,
            color: "text-purple-500",
            title: "🚫 Percepção Amadora",
            desc: "Links soltos de Drive fazem sua agência parecer pequena — e barata.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all hover:bg-zinc-900/50 group"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              <item.icon className={"w-6 h-6 " + item.color} />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ValuePillars = () => (
  <section
    id="features"
    className="py-24 bg-zinc-900/20 border-y border-white/5"
  >
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
          Um fluxo criado para eliminar ruído — não criar mais uma ferramenta.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Zap,
            title: "Briefing Guiado",
            subtitle: 'Chega do "faz algo criativo aí".',
            desc: "O cliente responde perguntas certas, no momento certo. Você recebe escopo claro, não achismo.",
            gradient: "from-blue-500 to-blue-600",
          },
          {
            icon: LayoutTemplate,
            title: "Gestão Centralizada",
            subtitle: "Tudo em um lugar só.",
            desc: "Status, arquivos, versões e aprovações em uma tela única. Sem 10 abas abertas e sem procurar conversa antiga.",
            gradient: "from-purple-500 to-purple-600",
          },
          {
            icon: CheckCircle2,
            title: "Aprovação Visual",
            subtitle: "Feedback preciso. Decisão rápida.",
            desc: "Seu cliente clica diretamente no design para deixar comentários pinados. Menos interpretação, mais decisão.",
            gradient: "from-emerald-500 to-emerald-600",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden group rounded-3xl bg-[#080808] border border-white/5 p-1"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full bg-zinc-950/80 rounded-[20px] p-8 overflow-hidden">
              {/* Glow Effect */}
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${card.gradient} blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity`}
              />

              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-8 shadow-lg`}
              >
                <card.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                {card.title}
              </h3>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-4">
                {card.subtitle}
              </p>
              <p className="text-zinc-500 leading-relaxed text-sm font-medium">
                {card.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeatureHighlight = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <Globe className="w-3 h-3" />
            White-Label
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
            A tecnologia é nossa. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              A autoridade é sua.
            </span>
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Personalize o portal com seu logo, cores e domínio. Entregue uma
            Área do Cliente que faz sua agência parecer maior, mais organizada e
            mais profissional.
          </p>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 blur-[100px] rounded-full" />
          <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video transform rotate-3 hover:rotate-0 transition-transform duration-700">
            {/* Fake UI Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-xl mx-auto flex items-center justify-center shadow-xl">
                  <span className="font-black text-black text-2xl">A.</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Powered by
                  </div>
                  <div className="text-xl font-bold text-white">
                    Sua Agência
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Comparison = () => (
  <section className="py-24 border-t border-white/5 bg-[#030303]">
    <div className="max-w-4xl mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter text-center mb-16">
        A matemática da eficiência.
      </h2>

      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-2 text-center text-sm font-bold uppercase tracking-widest border-b border-white/5">
          <div className="p-6 bg-red-500/5 text-red-400">Modo Caos</div>
          <div className="p-6 bg-blue-500/5 text-blue-400">Fluxs</div>
        </div>
        {[
          ["5 ferramentas desconectadas", "1 centro de comando"],
          ["Cobrança manual", "Status automático"],
          ["Cliente inseguro", "Cliente acompanhando"],
          ["Refação infinita", "Aprovação objetiva"],
        ].map(([bad, good], i) => (
          <div
            key={i}
            className="grid grid-cols-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="p-6 text-zinc-500 font-medium flex gap-3 text-sm">
              <span className="text-red-500 shrink-0">✕</span> {bad}
            </div>
            <div className="p-6 text-white font-medium flex gap-3 text-sm bg-blue-500/[0.02]">
              <span className="text-blue-500 shrink-0">✓</span> {good}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-32 relative">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Escolha o plano ideal
        </h2>
        <p className="text-zinc-500">Comece pequeno, cresça rápido.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto gap-8">
        {/* Starter Plan */}
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 flex flex-col hover:border-zinc-700 transition-colors">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
            <p className="text-sm text-zinc-500 h-10">
              Ideal para testar com cliente real.
            </p>
          </div>
          <div className="text-4xl font-black text-white mb-8 tracking-tighter">
            Grátis
          </div>
          <div className="space-y-4 mb-8 flex-1">
            {[
              "1 Projeto Ativo",
              "Branding Fluxs",
              "1GB Armazenamento",
              "Suporte por Email",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <CheckCircle2 className="w-4 h-4 text-zinc-600" /> {f}
              </div>
            ))}
          </div>
          <Link to="/login">
            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-12 rounded-xl">
              Criar Conta Grátis
            </Button>
          </Link>
        </div>

        {/* Professional Plan */}
        <div className="p-8 rounded-3xl bg-zinc-900/80 border border-blue-600/30 flex flex-col relative shadow-2xl shadow-blue-900/20 group">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-[22px] uppercase tracking-widest">
            Recomendado
          </div>
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent -z-10" />

          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
            <p className="text-sm text-blue-200/60 h-10">
              Para criadores profissionais.
            </p>
          </div>
          <div className="text-4xl font-black text-white mb-8 tracking-tighter text-blue-50">
            R$ 49
            <span className="text-base font-medium text-blue-200/40">/mês</span>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            {[
              "Projetos Ilimitados",
              "Remove Branding Fluxs",
              "Domínio Personalizado",
              "50GB Armazenamento",
              "Exportação em 4K",
              "Prioridade no Suporte",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm text-white font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400" /> {f}
              </div>
            ))}
          </div>
          <Link to="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-600/25">
              Escolher Professional
            </Button>
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            <Lock className="w-3 h-3" /> Pagamento Seguro
          </div>
        </div>

        {/* Agency Plan */}
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-purple-600/20 flex flex-col hover:border-purple-600/40 transition-colors group">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Agency</h3>
            <p className="text-sm text-zinc-500 h-10">
              Para agências em crescimento.
            </p>
          </div>
          <div className="text-4xl font-black text-white mb-8 tracking-tighter">
            R$ 149
            <span className="text-base font-medium text-zinc-500">/mês</span>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            {[
              "Tudo do Professional",
              "White-Label Completo",
              "Múltiplos Usuários",
              "500GB Armazenamento",
              "Acesso via API",
              "Infraestrutura para Escala",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> {f}
              </div>
            ))}
          </div>
          <Link to="/login">
            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-12 rounded-xl border border-purple-500/20">
              Escolher Agency
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        },
      ]);

      if (!error) {
        toast.success("Mensagem enviada com sucesso!", {
          description: "Entraremos em contato em breve.",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        console.error("Supabase Error:", error);
        toast.error("Erro ao enviar mensagem", {
          description: "Por favor, tente novamente ou use o WhatsApp.",
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Erro de conexão", {
        description: "Verifique sua internet e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                Vamos elevar o <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  nível do seu jogo?
                </span>
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
                Tire suas dúvidas, peça uma demo ou apenas diga oi. Estamos
                prontos para transformar sua agência.
              </p>
            </div>

            <div className="space-y-6">
              <a
                href="https://wa.me/5532998833302"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Phone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    WhatsApp
                  </div>
                  <div className="text-white font-bold">
                    +55 (32) 99883-3302
                  </div>
                </div>
              </a>

              <a
                href="mailto:fluxs.company@gmail.com"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-purple-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    E-mail
                  </div>
                  <div className="text-white font-bold">
                    fluxs.company@gmail.com
                  </div>
                </div>
              </a>

              <a
                href="https://www.instagram.com/fluxs.company/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-pink-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                  <Instagram className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Instagram
                  </div>
                  <div className="text-white font-bold">@fluxs.company</div>
                </div>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
            <form
              onSubmit={handleSubmit}
              className="relative p-8 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Nome Completo
                </label>
                <Input
                  required
                  name="name"
                  placeholder="Seu nome..."
                  className="bg-black/50 border-white/5 h-12 rounded-xl focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  E-mail Profissional
                </label>
                <Input
                  required
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="bg-black/50 border-white/5 h-12 rounded-xl focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Como podemos ajudar?
                </label>
                <Textarea
                  required
                  name="message"
                  placeholder="Conte-nos um pouco sobre seu desafio..."
                  className="bg-black/50 border-white/5 min-h-[150px] rounded-xl focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-20 border-t border-white/5 bg-black">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-zinc-800 rounded-md flex items-center justify-center">
              <span className="font-black text-white text-[10px]">F.</span>
            </div>
            <span className="text-lg font-bold text-white">Fluxs.</span>
          </div>
          <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
            O Centro de Comando para Agências de Elite. Transforme sua operação
            e encante seus clientes.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6">Produto</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li>
              <a href="#" className="hover:text-blue-400">
                Briefing IA
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Gestão Visual
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                White-Label
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Preços
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6">Legal</h4>
          <ul className="space-y-4 text-sm text-zinc-500">
            <li>
              <a href="#" className="hover:text-blue-400">
                Termos de Uso
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Privacidade
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-blue-400">
                Contato
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-zinc-600">
          © 2026 Fluxs. Todos os direitos reservados.
        </p>
        <div className="flex gap-4">
          <ShieldCheck className="w-4 h-4 text-zinc-700" />
          <Lock className="w-4 h-4 text-zinc-700" />
        </div>
      </div>
    </div>
  </footer>
);

export function LandingPage() {
  useEffect(() => {
    document.title =
      "Fluxs. — O Sistema Operacional de Aprovação para Agências Profissionais";
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <Navbar />
      <Hero />
      <InfoTicker />
      <ProblemAgitation />
      <ValuePillars />
      <FeatureHighlight />
      <Testimonials />
      <Comparison />

      {/* Final CTA Strip */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            Sua agência não precisa <br /> trabalhar no improviso.
          </h2>
          <p className="text-xl text-blue-200/60 font-medium">
            Organize seu processo, encante seus clientes e cobre como
            profissional.
          </p>
          <Link to="/login">
            <Button className="h-16 px-10 bg-white text-black hover:bg-zinc-200 font-bold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform">
              Começar Grátis Agora
            </Button>
          </Link>
        </div>
      </section>

      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}

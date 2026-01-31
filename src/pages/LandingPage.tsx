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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
            Planos
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

const HeroAnimation = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans select-none">
      {/* Fake Browser Header */}
      <div className="h-9 bg-[#0A0A0A] border-b border-white/5 flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
        </div>
        <div className="mx-auto bg-zinc-900/50 px-3 py-1 rounded-md border border-white/5 text-[10px] text-zinc-500 font-medium flex items-center gap-1.5">
          <Lock className="w-2.5 h-2.5 opacity-70" />
          fluxs.app/v/design-system-v2
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        <div className="w-56 hidden md:flex flex-col gap-4 border-r border-white/5 bg-zinc-950/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              F.
            </div>
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-full rounded-lg bg-white/5 border border-white/5 flex items-center px-3"
              >
                <div className="h-2 w-20 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
          <div className="mt-auto space-y-2">
            <div className="h-20 w-full rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <div className="h-2 w-12 bg-blue-500/30 rounded mb-2" />
              <div className="h-2 w-24 bg-blue-500/20 rounded" />
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-[#050505] relative overflow-hidden flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]/50 backdrop-blur-sm">
            <div>
              <div className="h-3 w-32 bg-zinc-800 rounded mb-1.5" />
              <div className="h-2 w-20 bg-zinc-900 rounded" />
            </div>
            {/* Status Badge */}
            <motion.div
              animate={{
                backgroundColor: [
                  "rgba(251, 191, 36, 0.1)", // Yellow base
                  "rgba(251, 191, 36, 0.1)",
                  "rgba(34, 197, 94, 0.1)", // Green
                  "rgba(34, 197, 94, 0.1)",
                ],
                borderColor: [
                  "rgba(251, 191, 36, 0.2)",
                  "rgba(251, 191, 36, 0.2)",
                  "rgba(34, 197, 94, 0.2)",
                  "rgba(34, 197, 94, 0.2)",
                ],
              }}
              transition={{
                duration: 8,
                times: [0, 0.65, 0.66, 1],
                repeat: Infinity,
              }}
              className="px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <motion.div
                animate={{
                  backgroundColor: ["#fbbf24", "#fbbf24", "#22c55e", "#22c55e"],
                }}
                transition={{
                  duration: 8,
                  times: [0, 0.65, 0.66, 1],
                  repeat: Infinity,
                }}
                className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
              />
              <span className="relative overflow-hidden w-24 h-3 block">
                <motion.span
                  className="absolute inset-0 text-yellow-500"
                  animate={{ y: ["0%", "0%", "-100%", "-100%"] }}
                  transition={{
                    duration: 8,
                    times: [0, 0.65, 0.66, 1],
                    repeat: Infinity,
                  }}
                >
                  Em Revisão
                </motion.span>
                <motion.span
                  className="absolute inset-0 text-green-500"
                  initial={{ y: "100%" }}
                  animate={{ y: ["100%", "100%", "0%", "0%"] }}
                  transition={{
                    duration: 8,
                    times: [0, 0.65, 0.66, 1],
                    repeat: Infinity,
                  }}
                >
                  Aprovado
                </motion.span>
              </span>
            </motion.div>
          </div>

          {/* Design Mockup */}
          <div className="p-8 flex-1 flex items-center justify-center relative">
            <div className="w-full max-w-sm aspect-square bg-[#0F0F0F] rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
              {/* Abstract Art */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20" />
              <div className="absolute inset-4 border border-zinc-800 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full p-4">
                  <div className="h-20 bg-zinc-800/30 rounded-lg" />
                  <div className="h-20 bg-zinc-800/30 rounded-lg" />
                  <div className="h-20 bg-zinc-800/30 rounded-lg col-span-2" />
                </div>
              </div>

              {/* Comment Pin Animation */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 1, 1, 0],
                  opacity: [0, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 8,
                  times: [0.15, 0.2, 0.25, 0.55, 0.6],
                  repeat: Infinity,
                }}
                className="absolute top-1/3 left-1/2 -ml-3"
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center relative z-10">
                    <span className="text-[10px] font-bold text-white">1</span>
                  </div>
                  {/* Tooltip */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 }}
                    className="absolute left-full top-0 ml-2 w-32 bg-white rounded-lg p-2 shadow-xl z-20"
                  >
                    <div className="h-1.5 w-16 bg-zinc-200 rounded mb-1.5" />
                    <div className="h-1.5 w-10 bg-zinc-200 rounded" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-16 border-t border-white/5 bg-[#0A0A0A] flex items-center justify-between px-6">
            <div className="flex -space-x-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#0A0A0A]"
                />
              ))}
              <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-[#0A0A0A] border-dashed flex items-center justify-center text-[10px] text-zinc-500">
                +
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              animate={{
                backgroundColor: ["#27272A", "#27272A", "#22C55E", "#22C55E"], // zinc-800 -> green-500
                color: ["#A1A1AA", "#A1A1AA", "#FFFFFF", "#FFFFFF"],
              }}
              transition={{
                duration: 8,
                times: [0, 0.65, 0.66, 1],
                repeat: Infinity,
              }}
              className="px-6 py-2.5 rounded-lg bg-zinc-800 text-sm font-bold text-zinc-400 transition-colors flex items-center gap-2"
            >
              <span className="relative w-24 h-5 block overflow-hidden text-center">
                <motion.span
                  className="absolute inset-0 flex items-center justify-center gap-2"
                  animate={{ y: ["0%", "0%", "-150%", "-150%"] }}
                  transition={{
                    duration: 8,
                    times: [0, 0.65, 0.66, 1],
                    repeat: Infinity,
                  }}
                >
                  Aprovar Arte
                </motion.span>
                <motion.span
                  className="absolute inset-0 flex items-center justify-center gap-2"
                  initial={{ y: "150%" }}
                  animate={{ y: ["150%", "150%", "0%", "0%"] }}
                  transition={{
                    duration: 8,
                    times: [0, 0.65, 0.66, 1],
                    repeat: Infinity,
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Aprovado
                </motion.span>
              </span>
            </motion.button>
          </div>
        </div>

        {/* MOUSE POINTER OVERLAY */}
        <motion.div
          initial={{ x: "100%", y: "100%", opacity: 0 }}
          animate={{
            x: ["130%", "50%", "50%", "90%", "90%", "130%"],
            y: ["100%", "33%", "33%", "90%", "90%", "100%"],
            opacity: [0, 1, 1, 1, 1, 0],
          }}
          transition={{
            duration: 8,
            times: [0, 0.15, 0.55, 0.65, 0.9, 1],
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
        >
          <div className="relative w-full h-full">
            <MousePointerClick className="w-6 h-6 text-black fill-white drop-shadow-md absolute -translate-x-1/2 -translate-y-1/2" />

            {/* Click Ripple 1 (Comment) */}
            <motion.div
              animate={{ scale: [0, 2], opacity: [1, 0] }}
              transition={{
                duration: 0.5,
                delay: 1.2,
                repeat: Infinity,
                repeatDelay: 7.5,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white/50"
            />

            {/* Click Ripple 2 (Approve) */}
            <motion.div
              animate={{ scale: [0, 2], opacity: [1, 0] }}
              transition={{
                duration: 0.5,
                delay: 5.2,
                repeat: Infinity,
                repeatDelay: 7.5,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-500/50"
            />
          </div>
        </motion.div>
      </div>
    </div>
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

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
            Aprovação de Clientes <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              3x mais rápida.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Transforme o Caos Criativo em uma Operação de Elite. Centralize
            briefings, arquivos e feedbacks em um único link que seu cliente
            realmente ama abrir.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                Criar Workspace em 2 min
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-xs text-zinc-500 font-medium mt-2 sm:mt-0">
              Não requer cartão de crédito • Plano Grátis Vitalício
            </p>
          </div>
        </div>

        {/* Hero Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 md:mt-24 relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-3xl blur opacity-20"></div>
          <HeroAnimation />
        </motion.div>
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

const TrustBar = () => (
  <div className="border-y border-white/5 bg-zinc-950/50 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-6 py-10">
      <p className="text-center text-xs font-bold text-zinc-600 uppercase tracking-widest mb-8">
        +500 Agências e Freelancers organizaram a casa com o Fluxs.
      </p>
      <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-30 grayscale mix-blend-screen">
        {/* Placeholder Logos */}
        <div className="text-xl font-black text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full" /> STUDIO ALPHA
        </div>
        <div className="text-xl font-black text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md" /> VANGUARDA
        </div>
        <div className="text-xl font-black text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-white rotate-45" /> ELEVATE
        </div>
        <div className="text-xl font-black text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-sm" /> PIXEL PUSH
        </div>
        <div className="text-xl font-black text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-tr-lg" /> CREATIVE LABS
        </div>
      </div>
    </div>
  </div>
);

const ProblemAgitation = () => (
  <section className="py-24 md:py-32 relative">
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
          Sua agência ainda vive no{" "}
          <span className="text-red-500">"Modo Sobrevivência"</span>?
        </h2>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Se sua rotina se resume a apagar incêndios, sua operação está
          sangrando dinheiro. Identifique o inimigo:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: MessageSquare,
            color: "text-green-500",
            title: 'O "Telefone Sem Fio"',
            desc: "O cliente manda alteração por áudio no WhatsApp, sua equipe esquece, e a refação acontece.",
          },
          {
            icon: FileBox,
            color: "text-orange-500",
            title: "O Limbo dos Assets",
            desc: '"Me manda o logo de novo?". Arquivos importantes se perdem em conversas antigas ou links expirados.',
          },
          {
            icon: MousePointerClick,
            color: "text-red-500",
            title: 'Aprovação "Cega"',
            desc: '"Não gostei, muda algo ali". Feedbacks vagos geram ciclos infinitos de V1, V2, V15...',
          },
          {
            icon: Layers,
            color: "text-purple-500",
            title: "Percepção Amadora",
            desc: 'Entregar links soltos de Drive faz sua agência parecer "mais uma", dificultando cobrar tickets altos.',
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
          Um fluxo desenhado para Controle Total.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Zap,
            title: "Briefing Blindado",
            subtitle: 'O Fim do "Faz algo criativo aí".',
            desc: "Envie links de briefing interativos onde o cliente é guiado a dizer exatamente o que precisa. Transformamos ideias vagas em escopos técnicos.",
            gradient: "from-blue-500 to-blue-600",
          },
          {
            icon: LayoutTemplate,
            title: "Gestão Centralizada",
            subtitle: "Sua verdade em um único lugar.",
            desc: "Abandone as 10 abas abertas. Visualize o status real de cada projeto, centralize arquivos finais e saiba exatamente quem está devendo o quê.",
            gradient: "from-purple-500 to-purple-600",
          },
          {
            icon: CheckCircle2,
            title: "Aprovação Visual",
            subtitle: "Feedback preciso. Aprovação rápida.",
            desc: "Seu cliente clica diretamente na imagem do design para deixar comentários pinados. Sem e-mails longos, apenas feedback acionável.",
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
              A fama é sua.
            </span>
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Não envie seus clientes para uma ferramenta genérica. Com o{" "}
            <strong>White-Label do Fluxs</strong>, você personaliza o portal com
            seu logo, suas cores e seu domínio.
            <br />
            <br />
            Entregue uma "Área do Cliente" exclusiva que transmite autoridade e
            faz sua agência parecer uma gigante multinacional.
          </p>
          <Button
            variant="outline"
            className="border-zinc-800 text-white hover:bg-zinc-900 h-12 rounded-xl px-6"
          >
            Ver Exemplo de Portal
          </Button>
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
          <div className="p-6 bg-red-500/5 text-red-400">Modo Caos (Atual)</div>
          <div className="p-6 bg-blue-500/5 text-blue-400">
            Modo Elite (Fluxs)
          </div>
        </div>
        {[
          [
            "5 Ferramentas soltas (Zap, Trello, Drive)",
            "1 Único Centro de Comando",
          ],
          ["Cobranças manuais desgastantes", "Status visível e automático"],
          [
            "Cliente ansioso perguntando 'como está?'",
            "Cliente seguro acompanhando progresso",
          ],
          [
            "Refação por falha de interpretação",
            "Aprovação cirúrgica de primeira",
          ],
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
              Para freelancers iniciantes.
            </p>
          </div>
          <div className="text-4xl font-black text-white mb-8 tracking-tighter">
            Grátis
          </div>
          <div className="space-y-4 mb-8 flex-1">
            {[
              "2 Projetos Ativos",
              "1GB Armazenamento",
              "Exportação Básica",
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
              "50GB Armazenamento",
              "Exportação 4K",
              "Prioridade no Suporte",
              "Domínio Personalizado",
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
              "Tudo do Pro",
              "500GB Armazenamento",
              "Múltiplos Usuários",
              "White-Label Completo",
              "Acesso via API",
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
              <a href="#" className="hover:text-blue-400">
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
    document.title = "Fluxs. - O Sistema Operacional para Agências de Elite";
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Global Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <Navbar />
      <Hero />
      <TrustBar />
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
            Sua agência merece <br /> esse upgrade.
          </h2>
          <p className="text-xl text-blue-200/60 font-medium">
            Pare de perder tempo gerenciando bagunça. Comece a focar no
            crescimento.
          </p>
          <Link to="/login">
            <Button className="h-16 px-10 bg-white text-black hover:bg-zinc-200 font-bold text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      <Pricing />
      <Footer />
    </div>
  );
}

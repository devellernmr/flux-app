import { useState, useEffect } from "react";
import {
  Sparkles,
  Lightbulb,
  Calendar,
  Grid,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User, Project, PlanType } from "@/types";

// --- LISTA DE DICAS ---
const PRO_TIPS = [
  {
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    title: "Use o Briefing com IA",
    desc: "Economize tempo gerando perguntas automáticas baseadas no nicho do cliente.",
  },
  {
    icon: <Grid className="w-4 h-4 text-blue-400" />,
    title: "Organize por Fases",
    desc: "Mantenha o cliente atualizado movendo os cards no Roadmap do projeto.",
  },
  {
    icon: <Mail className="w-4 h-4 text-emerald-400" />,
    title: "Aprovações Rápidas",
    desc: "Envie o link público para o cliente aprovar o briefing sem precisar de login.",
  },
  {
    icon: <UserIcon className="w-4 h-4 text-purple-400" />,
    title: "Personalize seu Perfil",
    desc: "Adicione sua foto e nome nas configurações para dar um toque profissional.",
  },
];

interface DashboardStatsProps {
  user: User | null;
  projects: Project[];
  plan: PlanType;
}

export function DashboardStats({ user, projects, plan }: DashboardStatsProps) {
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Usuário";
  const [currentTip, setCurrentTip] = useState(0);

  // Lógica: Próxima Entrega Real
  const nextProject = projects
    ?.filter((p) => p.due_date && new Date(p.due_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )[0];

  const today = new Date();
  const dateStr = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });

  // Ciclo das Dicas (Looping infinito a cada 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % PRO_TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {/* CARD 1: BOAS VINDAS + EFEITO SCAN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group"
      >
        {/* ANIMAÇÃO ESTÁTICA: Linha de Scan passando */}
        <motion.div
          animate={{ left: ["-100%", "200%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 3, // Espera 3s antes de passar de novo
            ease: "easeInOut",
          }}
          className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none z-0"
        />

        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1 capitalize">
            {dateStr}
          </p>
          <h2 className="text-2xl font-bold text-white mb-2">
            Olá, <span className="text-blue-400">{firstName}</span>
          </h2>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-300 font-medium capitalize">
              Plano {plan}
            </span>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: DICAS (SUBSTITUIU "PROJETOS ATIVOS") */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Dica Rápida
          </span>
          {/* Indicadores de bolinha */}
          <div className="flex gap-1">
            {PRO_TIPS.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-colors ${
                  i === currentTip ? "bg-zinc-200" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative h-full flex items-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="flex items-center gap-2 mb-1 text-zinc-200 font-medium text-sm">
                {PRO_TIPS[currentTip].icon}
                {PRO_TIPS[currentTip].title}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {PRO_TIPS[currentTip].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CARD 3: PRÓXIMA ENTREGA (Mantido) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-zinc-700 transition-colors"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
            Próxima Entrega
          </span>
          <Calendar className="w-4 h-4 text-zinc-600 group-hover:text-purple-500 transition-colors" />
        </div>

        {nextProject ? (
          <div>
            <h3
              className="text-lg font-medium text-zinc-200 truncate mb-1 line-clamp-1"
              title={nextProject.name}
            >
              {nextProject.name}
            </h3>
            <p className="text-sm text-purple-400 font-medium">
              {nextProject.due_date
                ? format(new Date(nextProject.due_date), "dd 'de' MMMM", {
                    locale: ptBR,
                  })
                : "Sem data"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-end h-full">
            <span className="text-zinc-500 text-sm">Nenhum prazo próximo.</span>
            <span className="text-zinc-700 text-xs mt-1">
              Tudo tranquilo por aqui.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

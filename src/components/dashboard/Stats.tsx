
import { useState, useEffect } from "react";
import {
  Calendar,
  Mail,
  Zap,
  TrendingUp,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User, Project, PlanType } from "@/types";

const PRO_TIPS = [
  {
    icon: <Target className="w-3.5 h-3.5 text-blue-400" />,
    title: "Briefing com IA",
    desc: "Gere perguntas estratégicas automaticamente para seus clientes.",
  },
  {
    icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
    title: "Roadmap Ágil",
    desc: "Mantenha o progresso visível movendo os cards de entrega.",
  },
  {
    icon: <Mail className="w-3.5 h-3.5 text-emerald-400" />,
    title: "Links Públicos",
    desc: "Compartilhe o briefing e receba aprovações sem login.",
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

  const nextProject = projects
    ?.filter((p) => p.due_date && new Date(p.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];

  const dateStr = format(new Date(), "EE, d MMM", { locale: ptBR });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % PRO_TIPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">

      {/* CARD 1: WELCOME & PERFORMANCE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="md:col-span-12 lg:col-span-5 bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between min-h-[220px] group shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/15 transition-all duration-700" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-zinc-950/50 border border-zinc-800 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {dateStr}
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Network Online
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            Bem-vindo <span className="text-zinc-500">{firstName}</span>
          </h2>
          <p className="text-sm text-zinc-400 font-medium max-w-xs">
            Seu centro de comando está pronto para novas integrações hoje.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 mt-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Workspace</span>
            <span className="text-sm font-bold text-zinc-200 capitalize">{plan} Active</span>
          </div>
          <div className="h-8 w-[1px] bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Fluxos</span>
            <span className="text-sm font-bold text-zinc-200">{projects.length} Online</span>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: NEXT DEADLINE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-6 lg:col-span-4 bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between group shadow-xl"
      >
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-600/5 blur-[50px] rounded-full group-hover:bg-purple-600/10 transition-all duration-700" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/50 px-3 py-1 rounded-full border border-zinc-800">Próxima Meta</span>
        </div>

        <div className="relative z-10 mt-6">
          {nextProject ? (
            <>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Impacto Imediato</p>
              <h3 className="text-xl font-bold text-white truncate mb-1">
                {nextProject.name}
              </h3>
              <span className="text-sm font-black text-purple-400">
                {format(new Date(nextProject.due_date!), "dd/MM", { locale: ptBR })} — {format(new Date(nextProject.due_date!), "EEEE", { locale: ptBR })}
              </span>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-zinc-500">Fluxo em Dia</h3>
              <p className="text-xs text-zinc-600 font-medium">Nenhum prazo crítico detectado.</p>
            </>
          )}
        </div>
      </motion.div>

      {/* CARD 3: PRO TIPS (COMPACT INTEL) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="md:col-span-6 lg:col-span-3 bg-zinc-950/50 border border-white/5 p-8 rounded-[40px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between group shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fluxo Intel</span>
            <div className="flex gap-1">
              {PRO_TIPS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentTip ? "w-4 bg-blue-500" : "w-1 bg-zinc-800"}`} />
              ))}
            </div>
          </div>

          <div className="min-h-[100px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    {PRO_TIPS[currentTip].icon}
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-tight">{PRO_TIPS[currentTip].title}</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                  {PRO_TIPS[currentTip].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

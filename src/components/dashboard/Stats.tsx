import { useState, useEffect } from "react";
import { Calendar, Mail, Zap, TrendingUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR, enUS, es, fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import type { User, Project, PlanType } from "@/types";

const localeMap: Record<string, any> = {
  pt: ptBR,
  en: enUS,
  es: es,
  fr: fr,
};

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
  const { t, i18n: i18nInstance } = useTranslation();
  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || t("common.user");
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: <Target className="w-3.5 h-3.5 text-blue-400" />,
      title: t("stats.tips.ai_briefing.title"),
      desc: t("stats.tips.ai_briefing.desc"),
    },
    {
      icon: <Zap className="w-3.5 h-3.5 text-yellow-400" />,
      title: t("stats.tips.agile_roadmap.title"),
      desc: t("stats.tips.agile_roadmap.desc"),
    },
    {
      icon: <Mail className="w-3.5 h-3.5 text-emerald-400" />,
      title: t("stats.tips.public_links.title"),
      desc: t("stats.tips.public_links.desc"),
    },
  ];

  const nextProject = projects
    ?.filter((p) => p.due_date && new Date(p.due_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime(),
    )[0];

  const currentLang = i18nInstance.language?.split("-")[0] || "en";
  const dateStr = format(new Date(), "EE, d MMM", {
    locale: localeMap[currentLang] || enUS,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tips.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">
      {/* CARD 1: WELCOME & PERFORMANCE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="md:col-span-12 lg:col-span-12 xl:col-span-5 bg-[#080808] border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between min-h-[180px] md:min-h-[220px] group shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full group-hover:bg-blue-600/15 transition-all duration-700" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
            <div className="px-2.5 py-1 bg-zinc-950/50 border border-zinc-800 rounded-full text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
              <Calendar className="h-3 w-3" />
              {dateStr}
            </div>
            <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Network Online
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">
            {t("stats.welcome")}{" "}
            <span className="text-zinc-400">{firstName}</span>
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 font-medium max-w-xs leading-relaxed">
            {t("stats.command_desc")}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 mt-6">
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              {t("stats.workspace")}
            </span>
            <span className="text-xs md:text-sm font-bold text-zinc-200 capitalize">
              {plan} {t("stats.active")}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              Fluxs.
            </span>
            <span className="text-xs md:text-sm font-bold text-zinc-200">
              {projects.length} {t("stats.online")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: NEXT DEADLINE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-6 lg:col-span-6 xl:col-span-4 bg-[#080808] border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between group shadow-xl"
      >
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-600/5 blur-[50px] rounded-full group-hover:bg-purple-600/10 transition-all duration-700" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="p-2.5 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/50 px-2.5 py-1 rounded-full border border-zinc-800">
            Próxima Meta
          </span>
        </div>

        <div className="relative z-10 mt-6 md:mt-0">
          {nextProject ? (
            <>
              <p className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                Impacto Imediato
              </p>
              <h3 className="text-lg md:text-xl font-bold text-white truncate mb-1">
                {nextProject.name}
              </h3>
              <span className="text-xs md:text-sm font-black text-purple-400">
                {format(new Date(nextProject.due_date!), "dd/MM", {
                  locale: ptBR,
                })}{" "}
                —{" "}
                {format(new Date(nextProject.due_date!), "EEEE", {
                  locale: ptBR,
                })}
              </span>
            </>
          ) : (
            <>
              <h3 className="text-lg md:text-xl font-bold text-zinc-500">
                Fluxs. em Dia
              </h3>
              <p className="text-[11px] md:text-xs text-zinc-600 font-medium">
                Nenhum prazo crítico detectado.
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* CARD 3: PRO TIPS (COMPACT INTEL) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="md:col-span-6 lg:col-span-6 xl:col-span-3 bg-[#080808] border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[40px] relative overflow-hidden backdrop-blur-md flex flex-col justify-between group shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 md:mb-8 text-center md:text-left">
            <span className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Fluxs. Intel
            </span>
            <div className="flex gap-1">
              {PRO_TIPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${i === currentTip ? "w-4 bg-blue-500" : "w-1 bg-zinc-800"}`}
                />
              ))}
            </div>
          </div>

          <div className="min-h-[80px] md:min-h-[100px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 md:p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    {PRO_TIPS[currentTip].icon}
                  </div>
                  <span className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-tight">
                    {PRO_TIPS[currentTip].title}
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-zinc-500 font-medium leading-relaxed">
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

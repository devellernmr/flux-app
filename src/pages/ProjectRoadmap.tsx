import { motion } from "framer-motion";
import { Check, Circle, Loader2, Map as MapIcon } from "lucide-react";
import { useMemo } from "react";

interface ProjectRoadmapProps {
  briefingStatus:
    | "empty"
    | "draft"
    | "awaiting_response"
    | "sent"
    | "approved"
    | "active"
    | "completed"; // ✅ Adicionado
  projectStatus: "active" | "paused" | "done" | "archived";
}

export function ProjectRoadmap({
  briefingStatus,
  projectStatus,
}: ProjectRoadmapProps) {
  // 1. Definição das 6 Etapas Solicitadas
  const steps = [
    { label: "Briefing", desc: "Rascunho" }, // 0: Draft
    { label: "Send", desc: "Enviado" }, // 1: Enviado
    { label: "Response", desc: "Resposta" }, // 2: Análise/Resposta
    { label: "Developed", desc: "Em Desenv." }, // 3: Desenvolvimento
    { label: "Feedback", desc: "Revisão" }, // 4: Revisão/Feedback
    { label: "Approved", desc: "Aprovado" }, // 5: Conclusão
  ];

  // 2. Lógica Refinada para as 6 Etapas
  const currentStepIndex = useMemo(() => {
    if (projectStatus === "done" || projectStatus === "archived") return 5;
    if (briefingStatus === "approved") return 3;
    if (briefingStatus === "sent") return 2;
    if (briefingStatus === "awaiting_response") return 1;
    if (briefingStatus === "draft") return 0;
    return 0;
  }, [briefingStatus, projectStatus]);

  // Calcula a porcentagem da barra de progresso
  const progressWidth = `${(currentStepIndex / (steps.length - 1)) * 100}%`;

  return (
    <div
      id="project-dash-roadmap"
      className="mt-6 mb-12 w-full rounded-3xl border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-sm overflow-hidden relative group"
    >
      {/* HEADER DO CARD */}
      <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MapIcon className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-200 tracking-tight">
              Roadmap do Projeto
            </h4>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              {steps[currentStepIndex].label}
            </p>
          </div>
        </div>

        {/* Badge de Status Geral */}
        <div
          className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border ${
            projectStatus === "done"
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-blue-500/10 border-blue-500/20"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                projectStatus === "done" ? "bg-emerald-400" : "bg-blue-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                projectStatus === "done" ? "bg-emerald-500" : "bg-blue-500"
              }`}
            ></span>
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${
              projectStatus === "done" ? "text-emerald-300" : "text-blue-300"
            }`}
          >
            {projectStatus === "done" ? "Concluído" : "Em Progresso"}
          </span>
        </div>
      </div>

      {/* CORPO DO ROADMAP */}
      <div className="p-6 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800/50 pb-8">
        <div className="min-w-[700px] flex items-center justify-between relative px-4">
          {/* Linha de Fundo */}
          <div className="absolute left-0 right-0 top-5 h-[2px] bg-zinc-800/50 -z-10 rounded-full" />

          {/* Linha de Progresso Ativa */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute left-0 top-5 h-[2px] -z-10 rounded-full ${
              projectStatus === "done"
                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                : "bg-gradient-to-r from-blue-600 to-blue-400"
            }`}
          />

          {steps.map((step, i) => {
            const isDone = i < currentStepIndex || projectStatus === "done";
            const isCurrent =
              i === currentStepIndex && projectStatus !== "done";

            return (
              <div
                key={i}
                className="flex flex-col items-center gap-4 relative group/step cursor-default w-24"
              >
                {/* Ícone da Etapa */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10
                    ${
                      isDone
                        ? "bg-zinc-900 border-zinc-800 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        : isCurrent
                        ? "bg-blue-600 border-zinc-950 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110"
                        : "bg-zinc-950 border-zinc-800 text-zinc-700"
                    }`}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" strokeWidth={3} />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4 fill-zinc-900" />
                  )}
                </motion.div>

                {/* Textos */}
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span
                    className={`text-xs font-bold tracking-tight transition-colors ${
                      isCurrent
                        ? "text-white"
                        : isDone
                        ? "text-zinc-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      isCurrent
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-300"
                        : "bg-transparent border-transparent text-zinc-600"
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Efeito de luz sutil no fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-blue-500/5 blur-3xl -z-20 pointer-events-none" />
    </div>
  );
}

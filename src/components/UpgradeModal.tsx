import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, BarChart3, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase, getFunctionUrl } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { PlanType } from "@/types";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  currentPlan?: PlanType;
}

export function UpgradeModal({
  open,
  onOpenChange,
  featureName,
  currentPlan = "starter",
}: UpgradeModalProps) {
  // Features exclusivas do Agency (não disponíveis no Pro)
  const agencyOnlyFeatures = ["Analytics Avançado", "Financeiro Avançado"];
  const isAgencyOnly = agencyOnlyFeatures.includes(featureName);

  // Se usuário já tem Pro ou feature é Agency-only, só mostrar Agency
  const showProOption = currentPlan === "starter" && !isAgencyOnly;

  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("agency");

  // Atualizar seleção quando modal abrir
  useEffect(() => {
    if (open) {
      setSelectedPlan(showProOption ? "pro" : "agency");
    }
  }, [open, showProOption]);

  // --- CARROSSEL DE BENEFÍCIOS ---
  const highlights = [
    {
      id: "ai",
      icon: (
        <Sparkles className="w-10 h-10 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
      ),
      title: "Potencialize com IA",
      subtitle: "Briefings e Roadmaps Automáticos",
      description:
        "Deixe a inteligência artificial cuidar do trabalho estratégico e técnico por você.",
      gradient: "from-indigo-600 via-purple-700 to-[#0A0A0A]",
      benefits: [
        "Briefings ilimitados",
        "Roadmaps dinâmicos",
        "Assistente inteligente",
        "Automação total",
      ],
    },
    {
      id: "finance",
      icon: (
        <DollarSign className="w-10 h-10 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
      ),
      title: "Financeiro Master",
      subtitle: "Controle de Lucros e Gastos",
      description:
        "Gerencie orçamentos, custos de equipe e rentabilidade real de cada fluxo.",
      gradient: "from-emerald-600 via-emerald-800 to-[#0A0A0A]",
      benefits: [
        "Gestão de orçamentos",
        "Cálculo de lucro real",
        "Relatórios de ROI",
        "Previsão de ganhos",
      ],
    },
    {
      id: "brand",
      icon: (
        <Check className="w-10 h-10 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
      ),
      title: "White-Label Premium",
      subtitle: "Sua Marca em Primeiro Lugar",
      description:
        "Remova a marca do Fluxs e utilize seu próprio domínio e identidade visual.",
      gradient: "from-blue-600 via-blue-800 to-[#0A0A0A]",
      benefits: [
        "Domínio personalizado",
        "Logotipo exclusivo",
        "Cores da sua agência",
        "Layout exclusivo",
      ],
    },
    {
      id: "analytics",
      icon: (
        <BarChart3 className="w-10 h-10 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
      ),
      title: "Analytics Avançado",
      subtitle: "Dados que Geram Valor",
      description:
        "Acompanhe a performance de todo o seu time e a saúde dos seus projetos em tempo real.",
      gradient: "from-amber-500 via-amber-700 to-[#0A0A0A]",
      benefits: [
        "Taxa de conversão",
        "Tempo de aprovação",
        "KPIs de produtividade",
        "Exportação em PDF/Excel",
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play do carrosel
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % highlights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  // Se o modal foi aberto por uma feature específica, começamos por ela
  useEffect(() => {
    if (open) {
      if (featureName === "Assistente IA") setActiveIndex(0);
      else if (featureName === "Financeiro Avançado") setActiveIndex(1);
      else if (featureName === "White-label") setActiveIndex(2);
      else if (featureName === "Analytics Avançado") setActiveIndex(3);
    }
  }, [open, featureName]);

  const activeContent = highlights[activeIndex];

  const handleUpgrade = async () => {
    toast.loading(`Iniciando checkout...`);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const functionUrl = getFunctionUrl("create-checkout-session");

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan_id: selectedPlan }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao processar");

      if (data?.url) window.location.href = data.url;
    } catch (error: any) {
      toast.dismiss();
      toast.error("Erro: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-[95vw] max-w-3xl overflow-hidden rounded-[32px] max-h-[90vh]">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                duration: 0.4,
              }}
              className="relative w-full overflow-y-auto max-h-[90vh] no-scrollbar rounded-[32px]"
            >
              {/* Glow Effect Dynamically Linked to Carousel */}
              <motion.div
                key={`glow-${activeContent.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1 }}
                className={`absolute -inset-2 rounded-[40px] blur-3xl bg-gradient-to-br ${activeContent.gradient} -z-10`}
              />

              <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative">
                {/* Hero Section with Animation */}
                <div className="relative overflow-hidden min-h-[320px] md:min-h-[360px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeContent.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`absolute inset-0 bg-gradient-to-br ${activeContent.gradient} p-6 md:p-12 flex flex-col items-center justify-center text-center`}
                    >
                      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                      <div className="relative z-10 flex flex-col items-center max-w-xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl mb-6">
                          {activeContent.icon}
                        </div>

                        <DialogTitle className="text-3xl md:text-5xl font-black text-white leading-tight mb-2 tracking-tighter">
                          {activeContent.title}
                        </DialogTitle>

                        <p className="text-white text-base md:text-xl font-bold mb-3 opacity-90">
                          {activeContent.subtitle}
                        </p>

                        <DialogDescription className="text-white/70 text-xs md:text-base leading-relaxed max-w-md">
                          {activeContent.description}
                        </DialogDescription>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress Indicators */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {highlights.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          activeIndex === i
                            ? "w-6 bg-white"
                            : "w-3 bg-white/20 opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Benefits & Plans Grid */}
                <div className="p-6 md:p-8 bg-[#090909]">
                  <div className="mb-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`benefits-${activeContent.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                      >
                        {activeContent.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121212] border border-white/[0.03] group hover:border-white/10 transition-colors"
                          >
                            <div className="flex-shrink-0 w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center border border-white/5">
                              <Check className="w-3 h-3 text-zinc-400" />
                            </div>
                            <span className="text-xs font-bold text-zinc-400">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Plan Selection */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">
                      Upgrade de Workflow
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Pro Plan */}
                      <div
                        onClick={() => setSelectedPlan("pro")}
                        className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === "pro"
                            ? "border-blue-600 bg-blue-600/5 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)]"
                            : "border-zinc-800/50 bg-zinc-900/10 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedPlan === "pro"
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-zinc-800"
                              }`}
                            >
                              {selectedPlan === "pro" && (
                                <Check
                                  className="w-3.5 h-3.5 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex flex-col leading-none">
                                <span className="text-2xl font-black text-white">
                                  R$ 49
                                </span>
                                <span className="text-[10px] text-zinc-600 font-bold mt-1">
                                  /mês
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`text-base font-black ${selectedPlan === "pro" ? "text-blue-500" : "text-white"}`}
                            >
                              Professional
                            </span>
                            <p className="text-[10px] text-zinc-600 font-bold mt-1">
                              Para freelancers em escala.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Agency Plan */}
                      <div
                        onClick={() => setSelectedPlan("agency")}
                        className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === "agency"
                            ? "border-purple-600 bg-purple-600/5 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)]"
                            : "border-zinc-800/50 bg-zinc-900/10 hover:border-zinc-700"
                        }`}
                      >
                        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-tighter rounded-bl-xl rounded-tr-[22px]">
                          Agência de Elite
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedPlan === "agency"
                                  ? "border-purple-600 bg-purple-600"
                                  : "border-zinc-800"
                              }`}
                            >
                              {selectedPlan === "agency" && (
                                <Check
                                  className="w-3.5 h-3.5 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex flex-col leading-none">
                                <span className="text-2xl font-black text-white">
                                  R$ 149
                                </span>
                                <span className="text-[10px] text-zinc-600 font-bold mt-1">
                                  /mês
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span
                              className={`text-base font-black ${selectedPlan === "agency" ? "text-purple-500" : "text-white"}`}
                            >
                              Agency
                            </span>
                            <p className="text-[10px] text-zinc-600 font-bold mt-1">
                              Para times de elite.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-6">
                    <Button
                      onClick={handleUpgrade}
                      className={`w-full font-black h-16 rounded-2xl shadow-2xl transition-all text-white text-base group uppercase tracking-widest ${
                        selectedPlan === "pro"
                          ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                          : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
                      }`}
                    >
                      <Zap className="w-4 h-4 mr-2 fill-current group-hover:rotate-12 transition-transform" />
                      Assinar Plano {selectedPlan === "pro" ? "Pro" : "Agency"}
                    </Button>

                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-black uppercase tracking-[0.1em]">
                        <Check className="w-3 h-3" />
                        Sem Condições
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-black uppercase tracking-[0.1em]">
                        <Check className="w-3 h-3" />
                        Teste Grátis
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-black uppercase tracking-[0.1em]">
                        <Check className="w-3 h-3" />
                        SSL Seguro
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

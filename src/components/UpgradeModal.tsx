import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  featureName,
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "agency">("pro");

  // Configurações visuais baseadas no gatilho
  const getContent = () => {
    switch (featureName) {
      case "Compartilhamento com Cliente":
        return {
          icon: (
            <Rocket className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          ),
          title: "Profissionalize suas Entregas",
          description: "Envie links de aprovação profissionais.",
          gradient: "from-blue-600 via-blue-900 to-[#0A0A0A]",
        };
      case "Limite de Projetos":
        return {
          icon: (
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          ),
          title: "Crie sem Limites",
          description: "Chega de arquivar. Tenha espaço infinito.",
          gradient: "from-purple-600 via-purple-900 to-[#0A0A0A]",
        };
      default:
        return {
          icon: (
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          ),
          title: "Desbloqueie o Potencial",
          description: "Acesse ferramentas exclusivas.",
          gradient: "from-amber-500 via-amber-700 to-[#0A0A0A]",
        };
    }
  };

  const content = getContent();

  const handleUpgrade = async () => {
    toast.loading(`Iniciando checkout...`);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const functionUrl =
        "https://wdybtosjzpexycvgreph.supabase.co/functions/v1/create-checkout-session";

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
      <DialogContent className="p-0 border-0 bg-transparent shadow-none w-[95vw] max-w-sm sm:max-w-2xl overflow-hidden rounded-[24px]">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              className="relative w-full"
            >
              {/* Brilho de Fundo */}
              <div
                className={`absolute -inset-1 rounded-[30px] blur-xl opacity-30 bg-gradient-to-br ${content.gradient} -z-10`}
              />

              <div className="bg-[#09090b] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl relative flex flex-col sm:flex-row max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible no-scrollbar">
                {/* Lado Visual (Topo no Mobile / Esquerda no Desktop) */}
                <div
                  className={`relative sm:w-2/5 bg-gradient-to-b ${content.gradient} flex flex-col p-5 sm:p-6 shrink-0`}
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                  <div className="relative z-10 flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0 h-full justify-between">
                    <div className="flex items-center sm:block gap-4">
                      <div className="p-2.5 bg-white/10 w-fit rounded-xl border border-white/20 backdrop-blur-md shadow-lg shrink-0">
                        {content.icon}
                      </div>
                      <div>
                        <DialogTitle className="text-lg sm:text-xl font-bold text-white leading-tight mt-0 sm:mt-4">
                          {content.title}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-200/80 text-xs mt-1 leading-relaxed hidden sm:block">
                          {content.description}
                        </DialogDescription>
                      </div>
                    </div>

                    {/* Lista de features (Escondida em mobile muito pequeno para economizar espaço) */}
                    <div className="mt-0 sm:mt-8 space-y-2 hidden sm:block">
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <Check className="w-3 h-3 text-white" /> Projetos
                        Ilimitados
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <Check className="w-3 h-3 text-white" /> Links de
                        Aprovação
                      </div>
                    </div>
                  </div>
                </div>

                {/* Área de Seleção */}
                <div className="flex-1 p-5 sm:p-6 bg-[#09090b] flex flex-col">
                  <div className="space-y-3 mb-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Escolha seu plano
                    </h3>

                    {/* Card PRO */}
                    <div
                      onClick={() => setSelectedPlan("pro")}
                      className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        selectedPlan === "pro"
                          ? "border-blue-600 bg-blue-600/10"
                          : "border-zinc-800 bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              selectedPlan === "pro"
                                ? "text-blue-400"
                                : "text-white"
                            }`}
                          >
                            Pro
                          </span>
                          {selectedPlan === "pro" && (
                            <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-base font-bold text-white">
                          R$ 49
                          <span className="text-[10px] font-normal text-zinc-500">
                            /mês
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Ideal para freelancers solo
                      </div>
                    </div>

                    {/* Card AGENCY */}
                    <div
                      onClick={() => setSelectedPlan("agency")}
                      className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                        selectedPlan === "agency"
                          ? "border-purple-600 bg-purple-600/10"
                          : "border-zinc-800 bg-zinc-900/40"
                      }`}
                    >
                      {selectedPlan === "agency" && (
                        <div className="absolute -top-2 right-2 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                          RECOMENDADO
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              selectedPlan === "agency"
                                ? "text-purple-400"
                                : "text-white"
                            }`}
                          >
                            Agency
                          </span>
                          {selectedPlan === "agency" && (
                            <div className="h-4 w-4 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-base font-bold text-white">
                          R$ 199
                          <span className="text-[10px] font-normal text-zinc-500">
                            /mês
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Para times & agências
                      </div>
                    </div>
                  </div>

                  {/* Botões - Fixados na base do fluxo visual */}
                  <div className="space-y-3 mt-auto pt-4 border-t border-white/5">
                    <Button
                      onClick={handleUpgrade}
                      className={`w-full font-bold h-11 rounded-xl shadow-lg transition-all text-white text-sm
                        ${
                          selectedPlan === "pro"
                            ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                            : "bg-purple-600 hover:bg-purple-500 shadow-purple-900/20"
                        }`}
                    >
                      Fazer Upgrade ({selectedPlan === "pro" ? "Pro" : "Agency"}
                      )
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="w-full text-xs text-zinc-500 hover:text-zinc-300 hover:bg-transparent h-auto py-1"
                    >
                      Continuar no Free
                    </Button>
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

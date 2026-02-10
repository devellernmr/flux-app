import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, CreditCard, Loader2 } from "lucide-react";
import type { PlanType } from "@/types";

export const PLANS: {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: "R$ 0",
    period: "/mês",
    description: "Para quem está começando a organizar freelas.",
    features: [
      "Até 1 Projeto",
      "Briefing Básico",
      "1GB de Armazenamento",
      "Suporte por Email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Perfeito para freelancers e designers independentes.",
    features: [
      "Projetos Ilimitados",
      "10GB de Armazenamento",
      "Compartilhamento com Cliente",
      "Prioridade no Suporte",
    ],
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "R$ 149",
    period: "/mês",
    description: "Para pequenas agências e times em crescimento.",
    features: [
      "Tudo do Pro",
      "Múltiplos Usuários",
      "1TB de Armazenamento",
      "Domínio Personalizado",
      "Gestor de Conta Dedicado",
    ],
  },
];

interface SubscriptionPlansProps {
  currentPlan: PlanType;
  isRedirectingPortal: boolean;
  onSubscribe: (planId: string) => void;
  onManageSubscription: () => void;
}

export function SubscriptionPlans({
  currentPlan,
  isRedirectingPortal,
  onSubscribe,
  onManageSubscription,
}: SubscriptionPlansProps) {
  return (
    <Card className="bg-zinc-900/20 border-zinc-800/60 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-500" />
          Assinatura e Planos
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Escolha o plano ideal para o seu momento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => {
            const isActive = p.id === currentPlan;
            const planOrder = { starter: 0, pro: 1, agency: 2 };
            // @ts-ignore
            const currentLevel = planOrder[currentPlan] || 0;
            // @ts-ignore
            const cardLevel = planOrder[p.id];
            const isDowngrade = cardLevel < currentLevel;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`relative rounded-xl p-6 border transition-all duration-300 flex flex-col overflow-hidden group hover:shadow-lg ${
                  isActive
                    ? "bg-blue-600/5 border-blue-500/50 shadow-lg shadow-blue-900/10"
                    : "bg-zinc-950/40 border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900/60 hover:shadow-lg hover:shadow-blue-900/5"
                }`}
              >
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}

                {isActive && (
                  <motion.div
                    initial={{ scale: 0, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -top-px -right-px"
                  >
                    <Badge className="bg-blue-500 hover:bg-blue-600 rounded-bl-xl rounded-tr-xl rounded-tl-none rounded-br-none px-3 py-1 text-[10px] font-bold tracking-wider shadow-lg shadow-blue-900/50">
                      PLANO ATUAL
                    </Badge>
                  </motion.div>
                )}

                {p.highlight && !isActive && (
                  <motion.div
                    initial={{ scale: 0, y: -10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="absolute -top-2 right-4"
                  >
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold px-2 py-0.5 shadow-lg shadow-purple-900/50">
                      RECOMENDADO
                    </Badge>
                  </motion.div>
                )}

                <div className="mb-4 relative z-10">
                  <h3
                    className={`font-bold text-lg mb-2 ${
                      isActive
                        ? "text-blue-400"
                        : "text-zinc-200 group-hover:text-white transition-colors"
                    }`}
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-white">
                      {p.price}
                    </span>
                    <span className="text-xs text-zinc-500">{p.period}</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed h-10 ${
                      isActive
                        ? "text-blue-300/80"
                        : "text-zinc-400 group-hover:text-zinc-300 transition-colors"
                    }`}
                  >
                    {p.description}
                  </p>
                </div>

                <div className="space-y-3 mb-6 flex-1 relative z-10">
                  {p.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="flex items-start gap-2 text-xs text-zinc-300"
                    >
                      <Check
                        className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                          isActive
                            ? "text-blue-400"
                            : "text-zinc-600 group-hover:text-zinc-500 transition-colors"
                        }`}
                      />
                      <span className="leading-relaxed">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{
                    scale: isActive || isDowngrade ? 1 : 1.02,
                  }}
                  whileTap={{
                    scale: isActive || isDowngrade ? 1 : 0.98,
                  }}
                  className="relative z-10 mt-auto"
                >
                  <Button
                    onClick={() => {
                      if (!isActive && !isDowngrade) {
                        onSubscribe(p.id);
                      }
                    }}
                    disabled={isActive || isDowngrade}
                    className={`w-full text-xs font-semibold h-10 rounded-lg transition-all ${
                      isActive
                        ? "border-blue-500/30 text-blue-400 bg-blue-500/10 cursor-default border"
                        : isDowngrade
                          ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed hover:bg-zinc-900 opacity-70"
                          : p.highlight
                            ? "bg-white text-black hover:bg-zinc-100 shadow-lg shadow-white/20 border-0"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                    }`}
                  >
                    {isActive
                      ? "✓ Plano Atual"
                      : isDowngrade
                        ? "✓ Já Incluído"
                        : p.highlight
                          ? "Fazer Upgrade para Pro"
                          : "Mudar para Agency"}
                  </Button>

                  {isActive && p.id !== "starter" && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      disabled={isRedirectingPortal}
                      onClick={onManageSubscription}
                      className="w-full flex items-center justify-center gap-2 text-center text-[10px] text-zinc-500 hover:text-red-400 mt-3 underline decoration-zinc-800 hover:decoration-red-400/50 underline-offset-4 transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isRedirectingPortal ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Carregando portal...
                        </>
                      ) : (
                        "Gerenciar ou Cancelar assinatura"
                      )}
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

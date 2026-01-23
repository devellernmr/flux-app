import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, Crown, CreditCard, Loader2 } from "lucide-react";
import type { PlanType } from "@/types";
import { toast } from "sonner";
import { useState } from "react";
import { supabase, getFunctionUrl } from "@/lib/supabase";

interface PlansTabProps {
    currentPlan: PlanType;
    usage: {
        projects: number;
        storage: number;
    };
}

export function PlansTab({ currentPlan, usage }: PlansTabProps) {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const plans = [
        {
            id: "starter",
            name: "Starter",
            price: "Grátis",
            description: "Para freelancers iniciantes.",
            features: ["2 Projetos Ativos", "1GB Armazenamento", "Exportação Básica", "Suporte por Email"],
            limit: 2,
            color: "zinc"
        },
        {
            id: "pro",
            name: "Professional",
            price: "R$ 49/mês",
            description: "Para criadores profissionais.",
            features: ["Projetos Ilimitados", "50GB Armazenamento", "Exportação 4K", "Prioridade no Suporte", "Domínio Personalizado"],
            recommended: true,
            limit: 9999,
            color: "blue"
        },
        {
            id: "agency",
            name: "Agency",
            price: "R$ 199/mês",
            description: "Para agências em crescimento.",
            features: ["Tudo do Pro", "500GB Armazenamento", "Múltiplos Usuários", "White-Label Completo", "API Access"],
            limit: 9999,
            color: "purple"
        }
    ];

    const currentPlanDetails = plans.find(p => p.id === currentPlan) || plans[0];
    const projectPercentage = Math.min((usage.projects / (currentPlan === 'starter' ? 2 : 100)) * 100, 100);

    const handlePlanChange = async (planId: string) => {
        if (planId === currentPlan) return;

        setLoadingPlan(planId);
        toast.loading("Iniciando checkout...");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.dismiss();
                toast.error("Você precisa estar logado");
                setLoadingPlan(null);
                return;
            }

            const functionUrl = getFunctionUrl("create-checkout-session");

            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ plan_id: planId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao processar");

            toast.dismiss();
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast.dismiss();
            toast.error("Erro ao iniciar checkout", {
                description: error.message
            });
            setLoadingPlan(null);
        }
    };

    const handleManageBilling = async () => {
        toast.loading("Abrindo portal de faturamento...");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.dismiss();
                toast.error("Você precisa estar logado");
                return;
            }

            const functionUrl = getFunctionUrl("create-portal-session");

            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao processar");

            toast.dismiss();
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast.dismiss();
            toast.error("Erro ao abrir portal", {
                description: error.message
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* CURRENT PLAN OVERVIEW */}
            <Card className="bg-[#0A0A0A] border-zinc-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">Seu Plano Atual</CardTitle>
                            <Badge variant="outline" className={`
                                ${currentPlan === 'starter' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : ''}
                                ${currentPlan === 'pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                                ${currentPlan === 'agency' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ''}
                                px-2 py-0.5 text-[10px] font-black uppercase tracking-widest
                            `}>
                                {currentPlan} Tier
                            </Badge>
                        </div>
                        <CardDescription>Gerencie sua assinatura e limites de uso.</CardDescription>
                    </div>
                    {currentPlan === 'starter' && (
                        <Button
                            onClick={() => handlePlanChange('pro')}
                            disabled={loadingPlan !== null}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-lg shadow-blue-500/20"
                        >
                            {loadingPlan === 'pro' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Zap className="h-4 w-4 mr-2 fill-current" />
                            Fazer Upgrade
                        </Button>
                    )}
                    {currentPlan !== 'starter' && (
                        <Button
                            variant="outline"
                            className="border-zinc-800 text-zinc-400 hover:text-white"
                            onClick={handleManageBilling}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Gerenciar Fatura
                        </Button>
                    )}
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
                    {/* Usage Stats */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-zinc-400">Projetos Ativos</span>
                                <span className="text-white">{usage.projects} / {currentPlan === 'starter' ? '2' : '∞'}</span>
                            </div>
                            <Progress value={projectPercentage} className="h-2 bg-zinc-900" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-zinc-400">Armazenamento</span>
                                <span className="text-white">{(usage.storage / 1024).toFixed(1)}GB Utilizado</span>
                            </div>
                            <Progress value={usage.storage > 0 ? 10 : 2} className="h-2 bg-zinc-900" />
                        </div>
                    </div>

                    {/* Next Billing Info (Mock) */}
                    <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/50 flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Crown className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Próxima Renovação</p>
                                <p className="text-xs text-zinc-500">12 de Fevereiro de 2026</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-end">
                            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Valor Estimado</span>
                            <span className="text-xl font-black text-white">{currentPlanDetails.price}</span>
                        </div>
                        {currentPlan !== 'starter' && (
                            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <Button
                                    variant="ghost"
                                    onClick={handleManageBilling}
                                    className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 h-auto py-2"
                                >
                                    Cancelar Assinatura
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* COMPARISON */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative group rounded-2xl border p-6 transition-all hover:-translate-y-1 duration-300 ${plan.id === currentPlan
                                ? "bg-zinc-900/40 border-blue-500/50 shadow-xl shadow-blue-500/10"
                                : "bg-[#0A0A0A] border-zinc-800/60 hover:border-zinc-700"
                            }`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                                Recomendado
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-lg font-black text-white tracking-tight mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-white">{plan.price}</span>
                                {plan.price !== "Grátis" && <span className="text-xs text-zinc-500">/mês</span>}
                            </div>
                            <p className="text-xs text-zinc-500 mt-2 h-8">{plan.description}</p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2 text-xs text-zinc-300">
                                    <Check className="h-4 w-4 text-blue-500 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={() => handlePlanChange(plan.id)}
                            disabled={loadingPlan === plan.id || plan.id === currentPlan}
                            className={`w-full font-bold ${plan.id === currentPlan
                                    ? "bg-zinc-800 text-zinc-400 cursor-default hover:bg-zinc-800"
                                    : plan.recommended
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
                                }`}
                        >
                            {loadingPlan === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {plan.id === currentPlan ? "Plano Atual" : "Escolher Plano"}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

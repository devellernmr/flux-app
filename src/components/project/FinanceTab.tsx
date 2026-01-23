import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Save,
    Loader2,
    Receipt,
    Plus,
    Trash2,
    Clock,
    MessageSquare,
    Copy,
    Wallet,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { logProjectActivity } from "@/lib/activity";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from "recharts";

interface ExpenseItem {
    id: string;
    label: string;
    value: number;
    category: "software" | "assets" | "outsourcing" | "other";
}

interface FinanceTabProps {
    projectId: string;
    initialBudget?: number;
    initialExpenses?: number;
    initialEstimatedHours?: number;
    initialTargetHourlyRate?: number;
    currency?: string;
    projectName?: string;
}

const CATEGORY_COLORS = {
    software: "#3b82f6",
    assets: "#ec4899",
    outsourcing: "#8b5cf6",
    other: "#64748b"
};

const CATEGORY_LABELS = {
    software: "Software",
    assets: "Assets/Recursos",
    outsourcing: "Terceirização",
    other: "Outros"
};

export function FinanceTab({
    projectId,
    initialBudget = 0,
    initialExpenses = 0,
    initialEstimatedHours = 0,
    initialTargetHourlyRate = 0,
    currency = "BRL",
    projectName = "Projeto"
}: FinanceTabProps) {
    const [budget, setBudget] = useState(initialBudget);
    const [estimatedHours, setEstimatedHours] = useState(initialEstimatedHours);
    const [targetHourlyRate, setTargetHourlyRate] = useState(initialTargetHourlyRate);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([
        { id: "1", label: "Despesa Inicial", value: initialExpenses, category: "other" }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [showBillingAssistant, setShowBillingAssistant] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.value, 0), [expenses]);
    const profit = budget - totalExpenses;
    const margin = budget > 0 ? (profit / budget) * 100 : 0;

    const realHourlyRate = estimatedHours > 0 ? profit / estimatedHours : 0;
    const hourlyRateDiff = targetHourlyRate > 0 ? ((realHourlyRate - targetHourlyRate) / targetHourlyRate) * 100 : 0;

    const healthScore = useMemo(() => {
        if (budget === 0) return 0;
        let score = 100;
        const expenseRatio = totalExpenses / budget;
        if (expenseRatio > 0.3) score -= (expenseRatio - 0.3) * 100;
        if (targetHourlyRate > 0 && realHourlyRate < targetHourlyRate) {
            score -= ((targetHourlyRate - realHourlyRate) / targetHourlyRate) * 50;
        }
        return Math.max(0, Math.min(100, score));
    }, [budget, totalExpenses, realHourlyRate, targetHourlyRate]);

    const chartData = useMemo(() => {
        const grouped = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.value;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([name, value]) => ({
            name: CATEGORY_LABELS[name as keyof typeof CATEGORY_LABELS],
            value,
            color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS]
        })).filter(d => d.value > 0);
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [expenses, searchQuery]);

    const billingMessage = `Olá! 👋 Acabamos de atualizar o status do projeto "${projectName}". Conforme combinado, seguem os detalhes para a próxima etapa de pagamento no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(budget * 0.5)}. Aguardo o comprovante para darmos continuidade!`;

    const handleAddExpense = () => {
        setExpenses([{
            id: Date.now().toString(),
            label: "",
            value: 0,
            category: "other"
        }, ...expenses]);
    };

    const handleRemoveExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const handleUpdateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const copyBillingMessage = () => {
        navigator.clipboard.writeText(billingMessage);
        toast.success("Mensagem de cobrança copiada!");
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("projects")
                .update({
                    budget: Number(budget) || 0,
                    expenses: totalExpenses,
                    estimated_hours: Number(estimatedHours) || 0,
                    target_hourly_rate: Number(targetHourlyRate) || 0,
                    branding: { expense_items: expenses }
                })
                .eq("id", Number(projectId));

            if (error) throw error;

            await logProjectActivity({
                projectId,
                content: `🚀 Finanças: Lucro de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(profit)} (${margin.toFixed(1)}% margem). Estrela de saúde em ${healthScore.toFixed(0)}%.`,
                type: "finance"
            });

            toast.success("Estratégia financeira sincronizada!");
        } catch (err: any) {
            toast.error("Erro ao salvar.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurr = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(val);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700 pb-24">

            {/* --- TOP ROW: KPI BAR --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Health Score Mini Card */}
                <div id="project-finance-health" className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center gap-4 group hover:border-zinc-700 transition-colors backdrop-blur-md">
                    <div className="relative h-14 w-14 shrink-0">
                        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-800" strokeWidth="3" />
                            <motion.circle
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: `${healthScore}, 100` }}
                                cx="18" cy="18" r="16" fill="none"
                                className={`${healthScore > 70 ? 'stroke-emerald-500' : healthScore > 40 ? 'stroke-yellow-500' : 'stroke-red-500'}`}
                                strokeWidth="3" strokeDasharray="100, 100" strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-black text-white">{healthScore.toFixed(0)}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Saúde Financeira</p>
                        <h4 className="text-xs font-bold text-zinc-300 mt-0.5">
                            {healthScore > 70 ? 'Excelente' : healthScore > 40 ? 'Regular' : 'Crítico'}
                        </h4>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all backdrop-blur-md">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Receita Total</p>
                        <h3 className="text-xl font-black text-white tabular-nums mt-0.5">{formatCurr(budget)}</h3>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                        <Wallet className="h-5 w-5" />
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all backdrop-blur-md">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Custos Diretos</p>
                        <h3 className="text-xl font-black text-white tabular-nums mt-0.5">{formatCurr(totalExpenses)}</h3>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
                        <TrendingDown className="h-5 w-5" />
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className={`bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between group transition-all backdrop-blur-md ${profit >= 0 ? 'hover:border-emerald-500/30' : 'hover:border-red-500/30'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lucro Líquido</p>
                            <Badge className={`${profit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} text-[9px] h-4 px-1.5`}>{margin.toFixed(0)}%</Badge>
                        </div>
                        <h3 className={`text-xl font-black tabular-nums mt-0.5 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurr(profit)}</h3>
                    </div>
                    <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${profit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* --- MAIN DASHBOARD CONTENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Record Management (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="bg-[#0A0A0A] border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm flex flex-col min-h-[600px] shadow-2xl">
                        {/* Section Header */}
                        <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/20 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="p-2.5 bg-zinc-800 rounded-xl border border-zinc-700">
                                    <Receipt className="h-4 w-4 text-zinc-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate">Gestão de Fluxo</h3>
                                    <p className="text-[10px] text-zinc-500 font-medium truncate">Controle de entrada e saída</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full xl:w-auto">
                                <div className="relative group flex-1 xl:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 h-9 pl-9 pr-3 rounded-xl text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                                    />
                                </div>
                                <Button onClick={handleAddExpense} size="sm" className="bg-white text-black hover:bg-zinc-200 h-9 px-4 rounded-xl text-xs font-black gap-2 shrink-0">
                                    <Plus className="h-3.5 w-3.5" /> Adicionar
                                </Button>
                            </div>
                        </div>

                        {/* Summary Input Row */}
                        <div className="p-6 bg-zinc-900/10 border-b border-zinc-800/50">
                            <div className="max-w-md space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Receita Total do Projeto ({currency})</label>
                                <div className="relative group">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        type="number"
                                        value={budget || ""}
                                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                                        onChange={(e) => setBudget(e.target.value === "" ? 0 : Number(e.target.value))}
                                        className="pl-12 bg-zinc-950/80 border-zinc-800 h-12 text-lg font-black tracking-tight rounded-2xl group-hover:border-zinc-700 transition-all focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Expenses List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 no-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {filteredExpenses.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center py-20 text-zinc-600 space-y-3">
                                        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50">
                                            <Receipt className="h-8 w-8 opacity-20" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-40">Nenhum registro encontrado</p>
                                    </div>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <motion.div
                                            key={expense.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-2xl flex flex-col md:flex-row gap-4 items-center group hover:bg-zinc-900/50 transition-all"
                                        >
                                            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3 w-full">
                                                <div className="xl:col-span-12 2xl:col-span-5 relative group/input">
                                                    <Input
                                                        value={expense.label}
                                                        placeholder="Ex: Assinatura Adobe..."
                                                        onChange={(e) => handleUpdateExpense(expense.id, "label", e.target.value)}
                                                        className="bg-transparent border-none h-10 text-sm font-bold text-white placeholder:text-zinc-700 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                                                    />
                                                    <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-zinc-800 group-focus-within/input:bg-blue-500/50 transition-colors" />
                                                </div>
                                                <div className="xl:col-span-6 2xl:col-span-3 relative group/input">
                                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600">{currency}</div>
                                                    <Input
                                                        type="number"
                                                        value={expense.value || ""}
                                                        placeholder="0.00"
                                                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                                                        onChange={(e) => handleUpdateExpense(expense.id, "value", e.target.value === "" ? 0 : Number(e.target.value))}
                                                        className="bg-transparent border-none h-10 text-sm font-black text-white text-right focus-visible:ring-0 focus-visible:ring-offset-0 pl-10 pr-2"
                                                    />
                                                    <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-zinc-800 group-focus-within/input:bg-emerald-500/50 transition-colors" />
                                                </div>
                                                <div className="xl:col-span-6 2xl:col-span-4">
                                                    <select
                                                        value={expense.category}
                                                        onChange={(e) => handleUpdateExpense(expense.id, "category", e.target.value)}
                                                        className="w-full bg-zinc-950 border border-zinc-800 h-10 rounded-xl text-[10px] px-3 text-zinc-400 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all font-medium"
                                                    >
                                                        <option value="software">Software / SaaS</option>
                                                        <option value="assets">Assets / Design</option>
                                                        <option value="outsourcing">Terceirização</option>
                                                        <option value="other">Outros</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveExpense(expense.id)}
                                                className="text-zinc-700 hover:text-red-400 hover:bg-red-400/10 h-10 w-10 shrink-0 self-center"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Insights & Tools (Span 4) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Time-Value Analysis */}
                    <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Clock className="h-4 w-4 text-blue-400" />
                            </div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Time x Value</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5 line-clamp-1">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Horas Estimadas</label>
                                <Input
                                    type="number"
                                    value={estimatedHours || ""}
                                    onFocus={(e) => e.target.value === "0" && e.target.select()}
                                    onChange={(e) => setEstimatedHours(e.target.value === "" ? 0 : Number(e.target.value))}
                                    className="bg-zinc-950/50 border-zinc-800 h-10 text-sm font-bold font-mono"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Meta Valor/Hora</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600">{currency}</div>
                                    <Input
                                        type="number"
                                        value={targetHourlyRate || ""}
                                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                                        onChange={(e) => setTargetHourlyRate(e.target.value === "" ? 0 : Number(e.target.value))}
                                        className="pl-12 bg-zinc-950/50 border-zinc-800 h-10 text-sm font-bold font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Atual em tempo real</p>
                                <h5 className={`text-xl font-black tabular-nums tracking-tighter ${realHourlyRate >= targetHourlyRate ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatCurr(realHourlyRate)} <span className="text-[10px] text-zinc-500 font-bold">/ h</span>
                                </h5>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-tighter border ${hourlyRateDiff >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {hourlyRateDiff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {hourlyRateDiff >= 0 ? '+' : ''}{hourlyRateDiff.toFixed(0)}%
                            </div>
                        </div>
                    </section>

                    {/* Chart Card */}
                    <section className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                <PieChartIcon className="h-4 w-4 text-purple-400" />
                            </div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Distribuição</h3>
                        </div>
                        <div className="h-48 w-full min-w-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {chartData.map((d) => (
                                <div key={d.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-[10px] font-bold text-zinc-500">{d.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400">{((d.value / totalExpenses) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Billing Assistant Trigger */}
                    <div className="space-y-4">
                        <Button
                            id="project-finance-billing"
                            onClick={() => setShowBillingAssistant(!showBillingAssistant)}
                            className={`w-full h-20 rounded-3xl transition-all duration-500 flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${showBillingAssistant ? 'bg-zinc-950 border border-blue-500/30 text-blue-400' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20 border-t border-white/20'}`}
                        >
                            <MessageSquare className={`h-5 w-5 ${showBillingAssistant ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
                            <span className="text-xs font-black uppercase tracking-widest">Assistente de Cobrança</span>
                        </Button>

                        <AnimatePresence>
                            {showBillingAssistant && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="bg-blue-600/5 border border-blue-500/20 rounded-3xl p-6 space-y-4 relative"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded-xl shrink-0">
                                            <SparklesIcon className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                                            Preparei uma mensagem profissional para você solicitar o próximo pagamento de <span className="text-blue-400 font-black">{formatCurr(budget * 0.5)}</span>.
                                        </p>
                                    </div>
                                    <div className="bg-zinc-950/80 p-4 rounded-xl border border-blue-500/10 font-mono text-[10px] text-zinc-400 leading-relaxed italic select-all">
                                        "{billingMessage}"
                                    </div>
                                    <Button size="sm" className="w-full bg-blue-600 text-white rounded-xl gap-2 font-black h-10" onClick={copyBillingMessage}>
                                        <Copy className="h-3.5 w-3.5" /> Copiar Texto
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- FIXED ACTION BAR --- */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-sm">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-14 bg-white text-black hover:scale-[1.02] transition-transform font-black rounded-2xl shadow-2xl gap-3 text-sm border-t border-white/20"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Sincronizar Estratégia
                    <ArrowUpRight className="h-4 w-4 opacity-50" />
                </Button>
            </div>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    )
}

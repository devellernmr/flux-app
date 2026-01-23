import { motion } from "framer-motion";
import {
    HelpCircle,
    Zap,
    Target,
    DollarSign,
    ArrowUpRight
} from "lucide-react";

export function HelpTab() {
    const categories = [
        {
            title: "Inteligência Financeira",
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            items: [
                {
                    q: "O que é o Health Score?",
                    a: "É um algoritmo que cruza sua margem de lucro atual com a meta de valor/hora. Se você estiver gastando demais ou cobrando pouco pelo tempo investido, o score cai."
                },
                {
                    q: "Como funciona a Meta Hora?",
                    a: "Você define quanto sua hora deveria valer (ex: R$ 150). O sistema calcula o lucro do projeto dividido pelas horas estimadas para ver se você está ganhando mais ou menos que sua meta."
                }
            ]
        },
        {
            title: "Automação com IA",
            icon: Zap,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            items: [
                {
                    q: "Briefing Inteligente",
                    a: "Nossa IA analisa o nome e descrição do projeto para sugerir perguntas que realmente importam, evitando retrabalho por falta de informação."
                },
                {
                    q: "Assistente de Cobrança",
                    a: "Localizado na aba financeira, ele gera textos profissionais baseados no status do projeto para você enviar via WhatsApp ou Email com um clique."
                }
            ]
        },
        {
            title: "Entregas e Prazos",
            icon: Target,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            items: [
                {
                    q: "Prazos Críticos",
                    a: "O dashboard principal destaca deadlines em vermelho quando faltam menos de 48h. Mantenha o Roadmap atualizado para que os alertas sejam precisos."
                },
                {
                    q: "Versão de Arquivos",
                    a: "Sempre que subir um novo arquivo com o mesmo nome, o Fluxo cria uma nova versão (v2, v3...), mantendo o histórico de aprovação intacto."
                }
            ]
        }
    ];

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
            {/* Header section */}
            <div className="relative p-12 rounded-[40px] bg-zinc-950 border border-white/5 overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-600/10 transition-colors" />
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <HelpCircle className="h-3 w-3 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Central de Inteligência</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                        Como podemos <span className="text-blue-500">acelerar</span> seu trabalho hoje?
                    </h2>
                    <p className="text-zinc-500 max-w-xl font-medium leading-relaxed">
                        Bem-vindo à central de suporte do Fluxo. Aqui você entende nossas métricas de alta performance e aprende a extrair o máximo da nossa IA.
                    </p>
                </div>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => (
                    <motion.div
                        key={cat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 rounded-[32px] bg-zinc-950/50 border border-white/5 hover:border-white/10 transition-all space-y-6"
                    >
                        <div className={`w-12 h-12 ${cat.bg} rounded-2xl flex items-center justify-center`}>
                            <cat.icon className={`h-6 w-6 ${cat.color}`} />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{cat.title}</h3>
                        <div className="space-y-6">
                            {cat.items.map((item) => (
                                <div key={item.q} className="space-y-2">
                                    <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wide">{item.q}</h4>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Action Card */}
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600 to-purple-600 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-500/10 border border-white/20">
                <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-white leading-none">Ainda tem dúvidas?</h3>
                    <p className="text-white/70 text-sm font-medium">Nossa equipe de suporte técnico está pronta para te ajudar a qualquer momento.</p>
                </div>
                <button className="px-8 h-14 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 text-sm">
                    Falar com Suporte <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

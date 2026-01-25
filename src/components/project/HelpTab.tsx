import { motion } from "framer-motion";
import {
    HelpCircle,
    Zap,
    Target,
    DollarSign,
    ArrowUpRight,
    Mail,
    MessageCircle,
    Send
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function HelpTab() {
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportMessage, setSupportMessage] = useState("");
    const [supportSubject, setSupportSubject] = useState("");

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
                    a: "Sempre que subir um novo arquivo com o mesmo nome, o Fluxs. cria uma nova versão (v2, v3...), mantendo o histórico de aprovação intacto."
                }
            ]
        }
    ];

    const handleEmailSupport = () => {
        const subject = encodeURIComponent("Suporte Fluxo - Preciso de Ajuda");
        const body = encodeURIComponent("Olá equipe Fluxo,\n\nPreciso de ajuda com:\n\n");
        window.location.href = `mailto:suporte@fluxo.app?subject=${subject}&body=${body}`;
        setShowSupportModal(false);
    };

    const handleWhatsAppSupport = () => {
        const message = encodeURIComponent("Olá! Preciso de ajuda com o Fluxs.");
        window.open(`https://wa.me/5532998833302?text=${message}`, '_blank');
        setShowSupportModal(false);
    };

    const handleSendTicket = async () => {
        if (!supportSubject || !supportMessage) {
            toast.error("Preencha todos os campos");
            return;
        }

        const loadingToast = toast.loading("Enviando seu ticket...");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Você precisa estar logado para enviar um ticket.");
                return;
            }

            const { error } = await supabase
                .from('support_tickets')
                .insert([
                    {
                        user_id: user.id,
                        subject: supportSubject,
                        message: supportMessage,
                        status: 'open'
                    }
                ]);

            if (error) throw error;

            // 3. Create notifications for admins
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .eq('is_admin', true);

            if (admins && admins.length > 0) {
                const notifications = admins.map(admin => ({
                    user_id: admin.id,
                    type: 'system',
                    title: 'Novo Ticket de Suporte',
                    content: `Um novo ticket foi aberto por ${user.user_metadata.full_name || 'um usuário'}: "${supportSubject}"`,
                    link: '/admin'
                }));

                await supabase.from('notifications').insert(notifications);
            }

            toast.success("Ticket enviado com sucesso!", {
                description: "Nossa equipe responderá em até 24 horas."
            });

            setSupportSubject("");
            setSupportMessage("");
            setShowSupportModal(false);
        } catch (error: any) {
            console.error("Error sending ticket:", error);
            toast.error("Erro ao enviar ticket: " + error.message);
        } finally {
            toast.dismiss(loadingToast);
        }
    };

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
                        Bem-vindo à central de suporte do Fluxs. Aqui você entende nossas métricas de alta performance e aprende a extrair o máximo da nossa IA.
                    </p>
                    <div className="pt-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                localStorage.removeItem("tutorial_completed");
                                window.location.reload();
                            }}
                            className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-blue-500/50 rounded-xl h-10 px-6 transition-all font-bold text-xs uppercase tracking-widest"
                        >
                            <Zap className="w-3.5 h-3.5 mr-2 text-blue-500" />
                            Ver Tutorial de Boas-vindas
                        </Button>
                    </div>
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
                <button
                    onClick={() => setShowSupportModal(true)}
                    className="px-8 h-14 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 text-sm"
                >
                    Falar com Suporte <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>

            {/* Support Modal */}
            <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
                <DialogContent className="bg-[#0A0A0A] border-zinc-800 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white">Como podemos ajudar?</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Escolha a melhor forma de entrar em contato com nossa equipe
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                        {/* Quick Contact Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleEmailSupport}
                                className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-900/80 transition-all group"
                            >
                                <Mail className="h-8 w-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-bold mb-1">Email</h3>
                                <p className="text-xs text-zinc-500">fluxs.company@gmail.com</p>
                                <p className="text-xs text-zinc-600 mt-2">Resposta em até 24h</p>
                            </button>

                            <button
                                onClick={handleWhatsAppSupport}
                                className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-green-500/50 hover:bg-zinc-900/80 transition-all group"
                            >
                                <MessageCircle className="h-8 w-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-bold mb-1">WhatsApp</h3>
                                <p className="text-xs text-zinc-500">(11) 99999-9999</p>
                                <p className="text-xs text-zinc-600 mt-2">Atendimento imediato</p>
                            </button>
                        </div>

                        {/* Support Ticket Form */}
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Send className="h-4 w-4 text-purple-400" />
                                Ou envie um ticket
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="subject" className="text-zinc-400 text-xs">Assunto</Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        value={supportSubject}
                                        onChange={(e) => setSupportSubject(e.target.value)}
                                        placeholder="Ex: Dúvida sobre financeiro"
                                        className="bg-zinc-900 border-zinc-800 text-white mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="message" className="text-zinc-400 text-xs">Mensagem</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={supportMessage}
                                        onChange={(e) => setSupportMessage(e.target.value)}
                                        placeholder="Descreva sua dúvida ou problema..."
                                        className="bg-zinc-900 border-zinc-800 text-white mt-1 min-h-[100px]"
                                    />
                                </div>

                                <Button
                                    onClick={handleSendTicket}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar Ticket
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

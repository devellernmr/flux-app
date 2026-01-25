import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
    Ticket,
    Search,
    MessageSquare,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    User,
    ArrowLeft,
    Loader2,
    RefreshCw,
    Send,
    Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { SupportTicket } from "@/types";

export function AdminDashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
    const [search, setSearch] = useState("");
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [updating, setUpdating] = useState(false);
    const [responseText, setResponseText] = useState("");

    async function handleSendResponse() {
        if (!selectedTicket || !responseText.trim()) {
            toast.error("Escreva uma resposta antes de enviar.");
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({
                    admin_response: responseText,
                    status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status
                })
                .eq("id", selectedTicket.id);

            if (error) throw error;

            // Criar notificação para o usuário
            await supabase.from('notifications').insert({
                user_id: selectedTicket.user_id,
                type: 'system',
                title: 'Resposta ao seu Ticket',
                message: `Um administrador respondeu ao seu ticket: "${selectedTicket.subject}"`,
                link: '/dashboard' // Link para onde o usuário pode ver o suporte (HelpTab)
            });

            toast.success("Resposta enviada com sucesso!");
            fetchTickets();
            setSelectedTicket({
                ...selectedTicket,
                admin_response: responseText,
                status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status
            });
        } catch (err: any) {
            toast.error("Erro ao enviar resposta: " + err.message);
        } finally {
            setUpdating(false);
        }
    }

    async function fetchTickets() {
        setLoading(true);
        try {
            // Tenta buscar com o perfil (JOIN)
            console.log("Iniciando busca de tickets...");
            const { data, error } = await supabase
                .from("support_tickets")
                .select("*, profiles(full_name, avatar_url)")
                .order("created_at", { ascending: false });

            if (error) {
                console.warn("Erro ao buscar com perfis, tentando busca simples:", error);

                // Fallback: Busca apenas os tickets se o JOIN falhar
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from("support_tickets")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (fallbackError) throw fallbackError;
                setTickets(fallbackData || []);
                toast.info("Tickets carregados sem dados de perfil (Erro 400 resolvido via fallback)");
            } else {
                console.log("Tickets carregados com sucesso:", data);
                setTickets(data || []);
            }
        } catch (err: any) {
            console.error("Erro fatal ao carregar tickets:", err);
            toast.error("Erro ao carregar tickets: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    async function updateTicketStatus(id: string, newStatus: SupportTicket["status"]) {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from("support_tickets")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            toast.success(`Status atualizado para ${newStatus}`);
            fetchTickets();
            if (selectedTicket?.id === id) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        } catch (err: any) {
            toast.error("Erro ao atualizar status: " + err.message);
        } finally {
            setUpdating(false);
        }
    }

    const filteredTickets = tickets.filter(t => {
        const matchesStatus = filter === "all" || t.status === filter;
        const matchesSearch =
            t.subject.toLowerCase().includes(search.toLowerCase()) ||
            t.message.toLowerCase().includes(search.toLowerCase()) ||
            (t.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "in_progress": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case "resolved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    };

    function handleExportTickets() {
        if (tickets.length === 0) {
            toast.error("Nenhum ticket para exportar.");
            return;
        }

        const headers = ["ID", "Data", "Usuário", "Assunto", "Mensagem", "Status", "Resposta Admin"];
        const rows = tickets.map(t => [
            t.id,
            new Date(t.created_at).toLocaleString(),
            t.profiles?.full_name || "N/A",
            t.subject,
            t.message.replace(/\n/g, " "),
            t.status,
            (t.admin_response || "").replace(/\n/g, " ")
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `fluxs-tickets-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Relatório de tickets exportado com sucesso!");
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "open": return <AlertCircle className="w-3 h-3 mr-1" />;
            case "in_progress": return <Clock className="w-3 h-3 mr-1" />;
            case "resolved": return <CheckCircle className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar ao Dashboard
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                                <Ticket className="w-6 h-6 text-white" />
                            </div>
                            Suporte Admin<span className="text-blue-500">.</span>
                        </h1>
                        <p className="text-zinc-500 font-medium">Gerencie e responda os pedidos de ajuda da plataforma Fluxs.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleExportTickets()}
                            className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => fetchTickets()}
                            disabled={loading}
                            className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="glass-card p-6 rounded-[32px] border border-white/5 space-y-6">
                            <div>
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Filtrar por Status</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: "all", label: "Todos os Tickets", icon: Ticket },
                                        { id: "open", label: "Abertos", icon: AlertCircle, color: "text-red-400" },
                                        { id: "in_progress", label: "Em Progresso", icon: Clock, color: "text-amber-400" },
                                        { id: "resolved", label: "Resolvidos", icon: CheckCircle, color: "text-emerald-400" }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setFilter(item.id as any)}
                                            className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all font-bold text-sm ${filter === item.id
                                                ? "bg-white text-black shadow-xl"
                                                : "text-zinc-500 hover:bg-zinc-900/50 hover:text-white"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-4 h-4 ${filter !== item.id ? item.color : ''}`} />
                                                {item.label}
                                            </div>
                                            <ChevronRight className={`w-4 h-4 opacity-30 ${filter === item.id ? 'hidden' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Buscar</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        id="ticket-search"
                                        name="ticket-search"
                                        placeholder="Assunto ou usuário..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-zinc-900/50 border-zinc-800 pl-10 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        {loading ? (
                            <div className="glass-card h-96 rounded-[40px] flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <p className="text-zinc-500 animate-pulse font-medium">Carregando tickets...</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="glass-card h-96 rounded-[40px] flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800">
                                    <Ticket className="w-8 h-8 text-zinc-700" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Nenhum ticket encontrado</h3>
                                <p className="text-zinc-500 max-w-xs font-medium">Tente ajustar seus filtros ou busca para encontrar o que procura.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTickets.map((ticket) => (
                                    <motion.div
                                        key={ticket.id}
                                        layoutId={ticket.id}
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            setResponseText(ticket.admin_response || "");
                                        }}
                                        className={`glass-card p-6 rounded-[32px] border transition-all cursor-pointer group flex items-center justify-between gap-6 ${selectedTicket?.id === ticket.id
                                            ? "border-blue-500/50 bg-blue-500/5 shadow-2xl"
                                            : "border-white/5 hover:border-white/10 hover:bg-zinc-900/20 shadow-lg"
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                                    {getStatusIcon(ticket.status)}
                                                    {ticket.status === 'in_progress' ? 'Em Progresso' : ticket.status}
                                                </Badge>
                                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                                                    {new Date(ticket.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">
                                                {ticket.subject}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                                                    {ticket.profiles?.avatar_url ? (
                                                        <img src={ticket.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-3 h-3 text-zinc-500" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-zinc-500 font-medium">{ticket.profiles?.full_name || 'Usuário'}</span>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Ticket Detail Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTicket(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl glass-card border border-white/10 rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] no-scrollbar"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/40">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedTicket.status)}`}>
                                            {getStatusIcon(selectedTicket.status)}
                                            {selectedTicket.status}
                                        </Badge>
                                        <span className="text-xs text-zinc-600 font-bold">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white leading-tight">{selectedTicket.subject}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="p-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:border-white/20 transition-all self-start"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5 overflow-hidden shadow-lg">
                                            {selectedTicket.profiles?.avatar_url ? (
                                                <img src={selectedTicket.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-zinc-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{selectedTicket.profiles?.full_name || 'Usuário'}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Enviou uma mensagem</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-[24px] text-zinc-300 leading-relaxed font-medium">
                                        {selectedTicket.message}
                                    </div>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-white/5">
                                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Resposta Administrativa</h3>
                                    <div className="space-y-4">
                                        <Textarea
                                            placeholder="Digite sua resposta oficial aqui..."
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            className="bg-zinc-900 border-zinc-800 text-white min-h-[120px] rounded-2xl focus:ring-blue-500/50"
                                        />
                                        <Button
                                            disabled={updating || !responseText.trim()}
                                            onClick={handleSendResponse}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 rounded-2xl shadow-lg shadow-blue-900/20"
                                        >
                                            {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-3" />}
                                            Enviar Resposta Oficial
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-white/5">
                                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Ações Rápidas</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Button
                                            disabled={updating || selectedTicket.status === 'in_progress'}
                                            onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-14 rounded-2xl shadow-lg shadow-amber-900/20"
                                        >
                                            <Clock className="w-5 h-5 mr-3" /> Marcar em Progresso
                                        </Button>
                                        <Button
                                            disabled={updating || selectedTicket.status === 'resolved'}
                                            onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 rounded-2xl shadow-lg shadow-emerald-900/20"
                                        >
                                            <CheckCircle className="w-5 h-5 mr-3" /> Resolver Ticket
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

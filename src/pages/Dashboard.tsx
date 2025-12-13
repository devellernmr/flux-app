import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Folder,
  LogOut,
  Settings,
  Loader2,
  Trash2,
  AlertTriangle,
  Menu,
  Sparkles,
  Search,
  Grid,
  User,
  Save,
  Mail,
  CreditCard,
  Check,
  PanelRightClose,
  Lightbulb,
  Calendar,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- HOOKS E COMPONENTES ---
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";

import { AIBriefingGenerator } from "@/components/AIBriefingGenerator";

// Definição local para evitar erros de importação
type PlanType = "starter" | "pro" | "agency";

const PLANS: {
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
      "Até 2 Projetos",
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
    price: "R$ 199",
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

// --- VARIANTES DE ANIMAÇÃO ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { // Mude "show" para "visible" se quiser seguir o padrão, ou mantenha "show"
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

// --- LISTA DE DICAS ---
const PRO_TIPS = [
  {
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    title: "Use o Briefing com IA",
    desc: "Economize tempo gerando perguntas automáticas baseadas no nicho do cliente.",
  },
  {
    icon: <Grid className="w-4 h-4 text-blue-400" />,
    title: "Organize por Fases",
    desc: "Mantenha o cliente atualizado movendo os cards no Roadmap do projeto.",
  },
  {
    icon: <Mail className="w-4 h-4 text-emerald-400" />,
    title: "Aprovações Rápidas",
    desc: "Envie o link público para o cliente aprovar o briefing sem precisar de login.",
  },
  {
    icon: <User className="w-4 h-4 text-purple-400" />,
    title: "Personalize seu Perfil",
    desc: "Adicione sua foto e nome nas configurações para dar um toque profissional.",
  },
];

// --- COMPONENTE DE STATS ---
function DashboardStats({ user, projects, plan }: any) {
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Usuário";
  const [currentTip, setCurrentTip] = useState(0);

  // Lógica: Próxima Entrega Real
  const nextProject = projects
    ?.filter((p: any) => p.due_date && new Date(p.due_date) > new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )[0];

  const today = new Date();
  const dateStr = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });

  // Ciclo das Dicas (Looping infinito a cada 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % PRO_TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {/* CARD 1: BOAS VINDAS + EFEITO SCAN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group"
      >
        {/* ANIMAÇÃO ESTÁTICA: Linha de Scan passando */}
        <motion.div
          animate={{ left: ["-100%", "200%"] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 3, // Espera 3s antes de passar de novo
            ease: "easeInOut",
          }}
          className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none z-0"
        />

        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div className="relative z-10">
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1 capitalize">
            {dateStr}
          </p>
          <h2 className="text-2xl font-bold text-white mb-2">
            Olá, <span className="text-blue-400">{firstName}</span>
          </h2>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-300 font-medium capitalize">
              Plano {plan}
            </span>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: DICAS (SUBSTITUIU "PROJETOS ATIVOS") */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Dica Rápida
          </span>
          {/* Indicadores de bolinha */}
          <div className="flex gap-1">
            {PRO_TIPS.map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-colors ${
                  i === currentTip ? "bg-zinc-200" : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative h-full flex items-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="flex items-center gap-2 mb-1 text-zinc-200 font-medium text-sm">
                {PRO_TIPS[currentTip].icon}
                {PRO_TIPS[currentTip].title}
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {PRO_TIPS[currentTip].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CARD 3: PRÓXIMA ENTREGA (Mantido) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-zinc-700 transition-colors"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
            Próxima Entrega
          </span>
          <Calendar className="w-4 h-4 text-zinc-600 group-hover:text-purple-500 transition-colors" />
        </div>

        {nextProject ? (
          <div>
            <h3
              className="text-lg font-medium text-zinc-200 truncate mb-1 line-clamp-1"
              title={nextProject.name}
            >
              {nextProject.name}
            </h3>
            <p className="text-sm text-purple-400 font-medium">
              {format(new Date(nextProject.due_date), "dd 'de' MMMM", {
                locale: ptBR,
              })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col justify-end h-full">
            <span className="text-zinc-500 text-sm">Nenhum prazo próximo.</span>
            <span className="text-zinc-700 text-xs mt-1">
              Tudo tranquilo por aqui.
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  // --- TRAVAS DO PLANO ---
  const { plan, usage, can, loading: planLoading, refreshPlan } = usePlan();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  // PROJECT STATES
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // UI STATES
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("projects");
  const [isRedirectingPortal, setIsRedirectingPortal] = useState(false);

  // SETTINGS STATES
  const [settingsName, setSettingsName] = useState("");
  const [settingsAvatar, setSettingsAvatar] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setSettingsName(user.user_metadata?.full_name || "");
        setSettingsAvatar(user.user_metadata?.avatar_url || "");

        // Buscar Projetos
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (projectsData) {
          setProjects(projectsData);
        }
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreateProject = async () => {
    // Dupla verificação de segurança
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: newProjectName,
          owner_id: user.id,
          description: aiBriefing,
        })
        .select()
        .single();

      setNewProjectName("");
      setAiBriefing("");

      if (error) throw error;

      setProjects([data, ...projects]);
      setIsNewProjectOpen(false);
      setNewProjectName("");
      toast.success("Projeto criado!");

      // Recarrega para atualizar contador do plano no hook
      window.location.reload();
    } catch (error: any) {
      toast.error("Erro", { description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

 const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true); // <--- Liga o loader

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);

      if (error) throw error;

      toast.success("Excluído.");
      
      // Atualiza visualmente a lista
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      
      // Atualiza o plano (sem reload)
      await refreshPlan(); 
      
      // FECHA O MODAL E LIMPA O ESTADO
      setProjectToDelete(null); // <--- Isso fecha o dialog de confirmação

    } catch (error: any) {
      toast.error("Erro ao excluir.");
    } finally {
      setIsDeleting(false); // <--- Desliga o loader (garantido)
    }
  };


  const handleUpdateProfile = async () => {
    setIsSavingSettings(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: settingsName, avatar_url: settingsAvatar },
      });

      if (error) throw error;

      setUser(data.user);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil", { description: error.message });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === "starter") return;

    toast.loading("Iniciando checkout...");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Você precisa estar logado.");
        return;
      }

      const functionUrl =
        "https://wdybtosjzpexycvgreph.supabase.co/functions/v1/create-checkout-session";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId: planId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro no checkout");
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      console.error("Erro no Front", err);
      toast.error("Erro: " + err.message);
    }
  };

  // --- NOVA FUNÇÃO DE GERENCIAR ASSINATURA ---
  const handleManageSubscription = async () => {
    setIsRedirectingPortal(true);
    toast.loading("Redirecionando para o portal de assinaturas...");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Erro de sessão");
        return;
      }

      // IMPORTANTE: URL DA NOVA FUNCTION
      const functionUrl =
        "https://wdybtosjzpexycvgreph.supabase.co/functions/v1/create-portal-session";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao abrir portal");

      // Redireciona o usuário para a página da Stripe
      if (data.url) window.location.href = data.url;
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao acessar portal", { description: error.message });
      setIsRedirectingPortal(false);
    }
  };

  const handleInstantCreateFromAI = async (briefingData: {
    title: string;
    questions: string[];
  }) => {
    // Validação básica
    if (!user) return toast.error("Usuário não identificado");

    setIsCreating(true); // Ativa o loading

    // Formata o briefing
    const formattedBriefing = briefingData.questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n\n");

    try {
      // 1. Cria o projeto no Supabase
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: briefingData.title, // Usa o título da IA como nome do projeto
          owner_id: user.id,
          description: formattedBriefing, // Salva o briefing direto
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Fecha os modais
      setIsAIModalOpen(false);
      setIsNewProjectOpen(false);

      // 3. Redireciona para o projeto novo
      toast.success("Projeto criado com Inteligência Artificial! 🚀");
      navigate(`/project/${data.id}`); // <--- O PULO DO GATO
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar projeto: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // --- COMPONENTE DE NAV DA SIDEBAR ---
  const NavLinks = ({
    active,
    onChange,
  }: {
    active: string;
    onChange: (val: string) => void;
  }) => (
    <nav className="flex-1 px-4 space-y-2 mt-8">
      {[
        { id: "projects", label: "Projetos", icon: Folder },
        { id: "settings", label: "Configurações", icon: Settings },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
            active === item.id
              ? "text-white"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
          }`}
        >
          {active === item.id && (
            <motion.div
              layoutId="menu-active"
              className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 rounded-lg z-0"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {item.label}
          </span>
          {active === item.id && (
            <motion.div
              layoutId="menu-glow"
              className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans overflow-hidden selection:bg-blue-500/30 relative">
      {/* MODAL DE UPGRADE */}
      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName={upgradeFeature}
      />

      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-zinc-800/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="w-72 bg-[#050505] border-r border-zinc-900 hidden md:flex flex-col sticky top-0 h-screen z-20 relative">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              FLUXO.
            </span>
          </div>
        </div>

        <NavLinks active={activeMenu} onChange={setActiveMenu} />

        {/* INDICADOR DE LIMITES */}
        <div className="px-6 pb-4">
          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-400">Projetos</span>
              <span className="text-white font-medium">
                {plan === "starter" ? `${usage.projects} / 2` : "Ilimitado"}
              </span>
            </div>
            {plan === "starter" && (
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((usage.projects / 2) * 100, 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900 mt-auto">
          <div className="bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/50 flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-zinc-800">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-zinc-800 text-xs">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-medium truncate text-zinc-200">
                {user?.user_metadata?.full_name || "Usuário"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate capitalize">
                Plano {plan}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="md:hidden h-16 border-b border-zinc-900 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4 text-blue-500" /> FLUXO.
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5 text-zinc-400" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeMenu === "projects" ? (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <DashboardStats user={user} projects={projects} plan={plan} />

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div>
                      <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                        Meus Projetos
                      </h1>
                      <p className="text-zinc-400 max-w-md">
                        Gerencie, acompanhe e compartilhe seus trabalhos em um
                        único lugar.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="relative group flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          placeholder="Buscar..."
                          className="pl-9 bg-zinc-900/50 border-zinc-800 focus:border-blue-500/30 focus:ring-blue-500/10 w-full md:w-64 h-10 text-sm"
                        />
                      </div>

                      <Dialog
                        open={isNewProjectOpen}
                        onOpenChange={setIsNewProjectOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            disabled={planLoading}
                            onClick={(e) => {
                              if (planLoading) {
                                e.preventDefault();
                                return;
                              }

                              if (!can("create_project")) {
                                e.preventDefault();
                                setUpgradeFeature("Limite de Projetos");
                                setShowUpgrade(true);
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 h-10 px-4"
                          >
                            {planLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="mr-2 h-4 w-4" />
                            )}
                            Novo Projeto
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Criar Novo Projeto</DialogTitle>
                            <DialogDescription className="text-zinc-500">
                              Dê um nome para começar a trabalhar.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-t-6 py-4">
                            <Label className="text-xs text-zinc-400 uppercase mb-2 block">
                              Nome do Projeto
                            </Label>
                            <Input
                              placeholder="Ex: Redesign Site Institucional..."
                              className="bg-zinc-900 border-zinc-800 focus:ring-blue-600/20 focus:border-blue-600/50"
                              value={newProjectName}
                              onChange={(e) =>
                                setNewProjectName(e.target.value)
                              }
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-zinc-800"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-[#0A0A0A] px-2 text-zinc-500">
                                Ou comece com IA
                              </span>
                            </div>
                          </div>
                          {/* BOTÃO DA IA COM TRAVA DE PLANO */}
                          <Button
                            type="button"
                            variant="outline"
                            className={`w-full border-dashed border-zinc-700 text-zinc-400 hover:text-purple-400 hover:border-purple-500/50 transition-all group ${
                              plan === "starter" ? "opacity-90" : ""
                            }`}
                            onClick={() => {
                              // LÓGICA DE BLOQUEIO
                              if (plan === "starter") {
                                setUpgradeFeature("Briefing com IA"); // Define o texto do modal de venda
                                setShowUpgrade(true); // Abre o modal de pagar
                                return;
                              }

                              // Se for Pro ou Agency, libera
                              setIsAIModalOpen(true);
                            }}
                          >
                            <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                            Gerar Briefing com IA
                            {/* Ícone de Cadeado para usuários Free */}
                            {plan === "starter" && (
                              <span className="ml-auto flex items-center gap-1 text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                                <Lock className="w-3 h-3" /> PRO
                              </span>
                            )}
                          </Button>
                          <DialogFooter>
                            <Button
                              variant="ghost"
                              onClick={() => setIsNewProjectOpen(false)}
                              className="hover:bg-zinc-900 hover:text-white"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleCreateProject}
                              disabled={isCreating}
                              className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                              {isCreating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Criar Projeto"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                        <AIBriefingGenerator
                          isOpen={isAIModalOpen}
                          onClose={() => setIsAIModalOpen(false)}
                          // Agora o onUse chama a função que cria e redireciona
                          onUse={(briefing) =>
                            handleInstantCreateFromAI(briefing)
                          }
                        />
                      </Dialog>
                    </div>
                  </div>

                  {projects.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 rounded-2xl h-64 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20">
                      <Grid className="h-10 w-10 mb-3 opacity-20" />
                      <p>Nenhum projeto encontrado.</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                      {projects.map((project) => (
                        <motion.div key={project.id} variants={itemVariants}>
                          <Link to={`/project/${project.id}`}>
                            <div className="group relative bg-zinc-900/20 border border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/60 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                              <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center group-hover:border-blue-500/30 group-hover:text-blue-500 transition-colors duration-300 text-zinc-500 shadow-sm">
                                  <Folder className="h-5 w-5" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                                  <Button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setProjectToDelete(project);
                                    }}
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <h3 className="font-medium text-zinc-200 group-hover:text-white truncate mb-1 pr-4 transition-colors">
                                {project.name}
                              </h3>
                              <p className="text-xs text-zinc-500">
                                Atualizado há{" "}
                                {format(
                                  new Date(project.created_at),
                                  "d 'de' MMM",
                                  {
                                    locale: ptBR,
                                  }
                                )}
                              </p>

                              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-zinc-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                                  Ativo
                                </span>
                                <span className="text-zinc-600 group-hover:text-blue-400 transition-colors font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300">
                                  Abrir <span className="text-[10px]">→</span>
                                </span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-10">
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                      Configurações
                    </h1>
                    <p className="text-zinc-400 max-w-md">
                      Gerencie suas preferências e assinatura.
                    </p>
                  </div>

                  <div className="grid gap-8 max-w-5xl">
                    {/* CARD PERFIL */}
                    <Card className="bg-zinc-900/20 border-zinc-800/60 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-500" /> Perfil
                        </CardTitle>
                        <CardDescription className="text-zinc-500">
                          Atualize suas informações públicas.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-20 w-20 border-2 border-zinc-800">
                            <AvatarImage src={settingsAvatar} />
                            <AvatarFallback className="bg-zinc-800 text-xl text-zinc-400">
                              {user?.email?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs text-zinc-400 uppercase">
                              Avatar URL
                            </Label>
                            <Input
                              value={settingsAvatar}
                              onChange={(e) =>
                                setSettingsAvatar(e.target.value)
                              }
                              placeholder="https://..."
                              className="bg-zinc-950/50 border-zinc-800 text-sm"
                            />
                            <p className="text-[10px] text-zinc-500">
                              Cole o link de uma imagem para seu avatar.
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-zinc-400 uppercase">
                              Nome Completo
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                              <Input
                                value={settingsName}
                                onChange={(e) =>
                                  setSettingsName(e.target.value)
                                }
                                className="pl-9 bg-zinc-950/50 border-zinc-800"
                                placeholder="Seu nome"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 opacity-50 pointer-events-none">
                            <Label className="text-xs text-zinc-400 uppercase">
                              Email
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                              <Input
                                value={user?.email}
                                readOnly
                                className="pl-9 bg-zinc-950/50 border-zinc-800"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Button
                            onClick={handleUpdateProfile}
                            disabled={isSavingSettings}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            {isSavingSettings ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Salvar Alterações
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* CARD PLANOS */}
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
                            const isActive = p.id === plan;

                            const planOrder = { starter: 0, pro: 1, agency: 2 };
                            // @ts-ignore
                            const currentLevel = planOrder[plan] || 0;
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
                                    <span className="text-xs text-zinc-500">
                                      {p.period}
                                    </span>
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
                                      <span className="leading-relaxed">
                                        {feature}
                                      </span>
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
                                        handleSubscribe(p.id);
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
                                      onClick={handleManageSubscription}
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-[#0A0A0A] border-r border-zinc-800 z-50 md:hidden flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">FLUXO.</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PanelRightClose className="h-5 w-5 text-zinc-500" />
                </Button>
              </div>

              <div className="flex-1">
                <nav className="space-y-2">
                  {[
                    { id: "projects", label: "Projetos", icon: Folder },
                    { id: "settings", label: "Configurações", icon: Settings },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeMenu === item.id
                          ? "bg-blue-600/10 text-blue-500 border border-blue-600/20"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-9 w-9 border border-zinc-800">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-zinc-800">
                      {user?.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate text-zinc-200">
                      {user?.user_metadata?.full_name || "Usuário"}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-red-400 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sair da conta
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE DELETAR PROJETO */}
      <Dialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white">
          <DialogHeader>
            <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center">Excluir projeto?</DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Essa ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setProjectToDelete(null)}
              className="w-full border border-zinc-800 hover:bg-zinc-900 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-900"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir Definitivamente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

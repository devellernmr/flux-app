import { useState, useEffect } from "react";
import { supabase, getFunctionUrl } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Loader2,
  Menu,
  Sparkles,
  Search,
  Lock,
  User as UserIcon,
  AlertTriangle,
  PanelRightClose,
  Folder,
  Settings,
  LogOut,
  Mail,
  Check,
  Save,
  CreditCard,
} from "lucide-react";
import { NotificationSystem } from "@/components/NotificationSystem";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- HOOKS E COMPONENTES ---
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";

import { AIBriefingGenerator } from "@/components/AIBriefingGenerator";
import { DashboardStats } from "@/components/dashboard/Stats";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { startTour } from "@/components/dashboard/TourGuide";

import type { Project, User, PlanType } from "@/types";

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

// --- COMPONENTE PRINCIPAL ---
export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

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
  const [settingsFigmaToken, setSettingsFigmaToken] = useState("");
  const [settingsAgencyName, setSettingsAgencyName] = useState("");
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
        setSettingsFigmaToken(user.user_metadata?.figma_token || "");
        setSettingsAgencyName(user.user_metadata?.agency_name || "");

        // Buscar Projetos
        // 1) Projetos que eu sou dono
        const { data: ownProjects, error: ownError } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (ownError) {
          console.error(ownError);
        }

        // 2) Projetos em que eu sou membro (via team_members)
        const { data: memberRows, error: memberError } = await supabase
          .from("team_members")
          .select("project:projects(*)")
          .eq("user_id", user.id);

        if (memberError) {
          console.error(memberError);
        }

        const memberProjects =
          memberRows?.map((row: any) => row.project).filter(Boolean) ?? [];

        // 3) Unir, remover duplicados e ordenar
        const allProjectsMap = new Map<string, any>();

        (ownProjects ?? []).forEach((p: any) => allProjectsMap.set(p.id, p));
        memberProjects.forEach((p: any) => allProjectsMap.set(p.id, p));
        const allProjects = Array.from(allProjectsMap.values())
          .map((p: any) => ({
            ...p,
            isShared: p.owner_id !== user.id, // true se não é dono
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

        setProjects(allProjects);
      }
    };

    fetchData();

    // Check for activeMenu in location state (e.g. from Analytics)
    if (location.state?.activeMenu) {
      setActiveMenu(location.state.activeMenu);
    }

    // REALTIME: Monitorar projetos e membros para manter o dashboard atualizado
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_members" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreateProject = async () => {
    if (!user) return;
    // Dupla verificação de segurança

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: newProjectName,
          owner_id: user.id,
          description: aiBriefing,
          agency_name: settingsAgencyName,
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
        data: {
          full_name: settingsName,
          avatar_url: settingsAvatar,
          figma_token: settingsFigmaToken,
          agency_name: settingsAgencyName,
        },
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

      const functionUrl = getFunctionUrl("create-checkout-session");

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
      const functionUrl = getFunctionUrl("create-portal-session");

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

    try {
      // 1. Cria o projeto no Supabase
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: briefingData.title, // Usa o título da IA como nome do projeto
          owner_id: user.id,
          description: `Gerado por IA para o nicho de ${briefingData.title}`,
          agency_name: settingsAgencyName,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Transforma perguntas em blocos de briefing
      const blocks = briefingData.questions.map((q, i) => ({
        id: (i + 1).toString(),
        type: "textarea",
        label: q,
        placeholder: "Sua resposta aqui...",
      }));

      // 3. Salva na tabela de briefings
      const { error: briefingError } = await supabase.from("briefings").insert({
        project_id: data.id,
        content: blocks,
        status: "draft",
        template_type: "custom",
      });

      if (briefingError) {
        console.error("Erro ao salvar briefing:", briefingError);
        toast.error("Projeto criado, mas houve erro ao salvar o briefing.");
      }

      // 4. Fecha os modais
      setIsAIModalOpen(false);
      setIsNewProjectOpen(false);

      // 5. Redireciona para o projeto novo
      toast.success("Projeto e Briefing criados com IA! 🚀");
      navigate(`/project/${data.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar projeto: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // --- ONBOARDING (Guided Tour) ---
  useEffect(() => {
    if (user && !user.user_metadata?.has_seen_tour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

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
      <Sidebar
        user={user}
        plan={plan}
        usage={usage}
        activeMenu={activeMenu}
        setActiveMenu={(menu) => {
          if (menu === "analytics") {
            navigate("/analytics");
            return;
          }
          setActiveMenu(menu);
        }}
        onLogout={handleLogout}
        onShowTutorial={() => startTour()}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="md:hidden h-16 border-b border-zinc-900 flex items-center justify-between px-4 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4 text-blue-500" /> FLUXO.
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-zinc-400" />
            </Button>
          </div>
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
                  <div id="dashboard-stats-wrapper">
                    <DashboardStats
                      user={user}
                      projects={projects}
                      plan={plan}
                    />
                  </div>

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
                      <div
                        id="dashboard-search-bar"
                        className="relative group flex-1 md:flex-none"
                      >
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
                            id="dashboard-new-project-btn"
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

                  <ProjectList
                    projects={projects}
                    onDelete={setProjectToDelete}
                  />
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
                          <UserIcon className="h-5 w-5 text-blue-500" /> Perfil
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
                              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
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

                        <div className="space-y-2 pt-4 border-t border-zinc-800">
                          <Label className="text-xs text-zinc-400 uppercase flex items-center gap-2">
                            Nome da Agência
                            <span className="text-[9px] normal-case bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                              White-Label
                            </span>
                          </Label>
                          <Input
                            value={settingsAgencyName}
                            onChange={(e) =>
                              setSettingsAgencyName(e.target.value)
                            }
                            className="bg-zinc-950/50 border-zinc-800"
                            placeholder="Ex: MeuStudio Design"
                          />
                          <p className="text-[10px] text-zinc-500 mb-2">
                            Personalize o nome exibido nas visualizações
                            públicas enviadas aos clientes.
                          </p>

                          {/* PREVIEW */}
                          <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">
                              Preview da Visualização do Cliente
                            </p>
                            <div className="bg-[#050505] rounded-md p-3 border border-zinc-900 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                                  <Sparkles className="h-3 w-3 text-white" />
                                </div>
                                <span className="text-sm font-bold text-white">
                                  {settingsAgencyName || "FLUXO."}
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-500">
                                Briefing Compartilhado
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-zinc-800">
                          <Label className="text-xs text-zinc-400 uppercase flex items-center gap-2">
                            Figma API Token
                            <span className="text-[9px] normal-case bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
                              Brand Kit Inteligente
                            </span>
                          </Label>
                          <Input
                            type="password"
                            value={settingsFigmaToken}
                            onChange={(e) =>
                              setSettingsFigmaToken(e.target.value)
                            }
                            className="bg-zinc-950/50 border-zinc-800 font-mono text-xs"
                            placeholder="figd_..."
                          />
                          <p className="text-[10px] text-zinc-500">
                            Cole seu token de acesso do Figma para habilitar
                            extração automática de cores.{" "}
                            <a
                              href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              Como obter?
                            </a>
                          </p>
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

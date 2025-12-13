import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Folder,
  Loader2,
  Sparkles,
  ArrowLeft,
  Plus,
  Palette,
  Globe,
  Layout,
  Menu,
  X,
  Trash2,
  ExternalLink,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  LogOut,
  Copy,
  PenLine,
  MessageSquare,
  ChevronRight,
  Calendar,
  Save,
  MoreVertical,
  Share2,
  UploadCloud,
  FileText,
  LayoutDashboard,
  Users,
  MessageCircle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProjectFiles } from "./ProjectFiles";
import { ProjectActivity } from "@/components/ProjectActivity";
import { ProjectRoadmap } from "./ProjectRoadmap";

import { TeamManager } from "@/components/TeamManager";

function BriefingSuccessAction({
  onCopyLink,
}: {
  onCopyLink: () => void;
  onShare?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-center relative overflow-hidden group shadow-2xl shadow-emerald-900/10"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Briefing Salvo com Sucesso!
          </h3>
          <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
            O conteúdo está pronto. Agora envie o link para o cliente preencher
            ou revisar as informações.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full justify-center">
          <Button
            onClick={onCopyLink}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 font-medium"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar Link do Briefing
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// --- TIPAGEM E TEMPLATES ---
export type BriefingBlockType = "text" | "textarea" | "select" | "upload";

export type BriefingBlock = {
  id: string;
  type: BriefingBlockType;
  label: string;
  placeholder?: string;
  options?: string[];
  answer?: string;
};

const BRIEFING_TEMPLATES = {
  custom: {
    name: "Começar do Zero",
    description: "Crie suas próprias perguntas.",
    blocks: [
      {
        id: "1",
        type: "text",
        label: "Nome do Projeto",
        placeholder: "Ex: Campanha de Natal",
      },
    ] as BriefingBlock[],
  },
  branding: {
    name: "Identidade Visual (Logo)",
    description: "Essencial para criar marcas fortes.",
    blocks: [
      {
        id: "1",
        type: "text",
        label: "Nome da Marca",
        placeholder: "Como a empresa se chama exatamente?",
      },
      {
        id: "2",
        type: "textarea",
        label: "O que a empresa faz?",
        placeholder: "Descreva os produtos/serviços e o diferencial.",
      },
      {
        id: "3",
        type: "select",
        label: "Arquétipo / Personalidade",
        options: [
          "Séria e Corporativa",
          "Jovem e Divertida",
          "Luxuosa e Exclusiva",
          "Minimalista e Tech",
          "Rústica e Natural",
        ],
      },
      {
        id: "4",
        type: "textarea",
        label: "Público Alvo",
        placeholder: "Quem compra? Idade, interesses, classe social...",
      },
      {
        id: "5",
        type: "textarea",
        label: "Concorrentes",
        placeholder: "Cite 3 concorrentes diretos (links ou nomes).",
      },
      {
        id: "6",
        type: "text",
        label: "Cores de Preferência",
        placeholder: "Ex: Azul marinho, Dourado... ou 'Evitar Vermelho'",
      },
      {
        id: "7",
        type: "select",
        label: "Tipo de Logo Preferido",
        options: [
          "Apenas Tipografia (Wordmark)",
          "Símbolo Abstrato",
          "Mascote/Ilustrativo",
          "Emblema/Brasão",
          "Deixo a critério do designer",
        ],
      },
    ] as BriefingBlock[],
  },
  landing_page: {
    name: "Landing Page / Site",
    description: "Estruture o conteúdo para conversão.",
    blocks: [
      {
        id: "1",
        type: "text",
        label: "Objetivo Principal",
        placeholder: "Vender produto, Capturar Leads (Email), Agendar Reunião?",
      },
      {
        id: "2",
        type: "textarea",
        label: "Promessa Única (Headline)",
        placeholder:
          "Qual a frase principal do topo do site? Ex: 'Emagreça em 30 dias'",
      },
      {
        id: "3",
        type: "textarea",
        label: "Benefícios do Produto",
        placeholder: "Liste 3 a 5 benefícios principais.",
      },
      {
        id: "4",
        type: "text",
        label: "Link para Compra/Ação",
        placeholder: "Para onde o botão deve levar? (Whatsapp, Checkout...)",
      },
      {
        id: "5",
        type: "textarea",
        label: "Referências de Design",
        placeholder: "Cole links de sites que você acha bonitos.",
      },
      {
        id: "6",
        type: "select",
        label: "Estilo do Layout",
        options: ["Clean e Branco", "Dark Mode", "Colorido e Vibrante"],
      },
      {
        id: "7",
        type: "textarea",
        label: "Depoimentos (Prova Social)",
        placeholder: "Cole aqui textos de clientes satisfeitos (se tiver).",
      },
    ] as BriefingBlock[],
  },
  social_media: {
    name: "Social Media Pack",
    description: "Posts para Instagram/Linkedin.",
    blocks: [
      {
        id: "1",
        type: "select",
        label: "Rede Social Principal",
        options: ["Instagram", "LinkedIn", "Facebook", "TikTok/Reels"],
      },
      {
        id: "2",
        type: "textarea",
        label: "Temas dos Posts",
        placeholder: "Ex: 1. Dica técnica, 2. Meme, 3. Promoção",
      },
      {
        id: "3",
        type: "text",
        label: "Link da Pasta de Fotos",
        placeholder: "Drive/Dropbox com fotos do produto (se tiver)",
      },
      {
        id: "4",
        type: "textarea",
        label: "Legendas / Textos",
        placeholder: "O texto deve ir na imagem ou na legenda?",
      },
      {
        id: "5",
        type: "select",
        label: "Frequência",
        options: ["Post Único", "Pacote Mensal (12 posts)", "Stories"],
      },
    ] as BriefingBlock[],
  },
  video_edit: {
    name: "Edição de Vídeo",
    description: "Roteiro e estilo para vídeos.",
    blocks: [
      {
        id: "1",
        type: "text",
        label: "Duração Aproximada",
        placeholder: "Ex: 15s (Stories), 1min (Reels), 10min (YouTube)",
      },
      {
        id: "2",
        type: "select",
        label: "Formato",
        options: ["Vertical (9:16)", "Horizontal (16:9)", "Quadrado (1:1)"],
      },
      {
        id: "3",
        type: "text",
        label: "Link do Material Bruto",
        placeholder: "Onde estão os arquivos de vídeo?",
      },
      {
        id: "4",
        type: "textarea",
        label: "Referência de Estilo",
        placeholder:
          "Link de um vídeo com edição parecida (Ex: Cortes rápidos, estilo Alex Hormozi)",
      },
      {
        id: "5",
        type: "text",
        label: "Música / Trilha",
        placeholder: "Alguma preferência de gênero musical?",
      },
    ] as BriefingBlock[],
  },
};

export function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // UI STATES
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileActivityOpen, setIsMobileActivityOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "briefing" | "files" | "members" | "chat"
  >("dashboard");

  // BRIEFING STATES
  const [briefingStatus, setBriefingStatus] = useState<
    "empty" | "draft" | "sent" | "awaiting_response" | "approved"
  >("empty");

  const [blocks, setBlocks] = useState<BriefingBlock[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isSavingBriefing, setIsSavingBriefing] = useState(false);

  // SETTINGS STATES
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState<
    "active" | "paused" | "done" | "archived"
  >("active");
  const [projectDueDate, setProjectDueDate] = useState<string>("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [archiving] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      // Use 'visible' ou 'show', tanto faz, mas seja consistente
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      // FILHO: Mude de 'show' para 'visible' para bater com o pai
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // 1. USEEFFECT PRINCIPAL E REALTIME (CORRIGIDO)
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user && id) {
        const { data: proj } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();
        if (proj) {
          setProject(proj);
          setProjectName(proj.name || "");
          setProjectDescription(proj.description || "");
          setProjectStatus((proj.status || "active") as any);
          setProjectDueDate(
            proj.due_date ? proj.due_date.substring(0, 10) : ""
          );
        }

        const { data: brief } = await supabase
          .from("briefings")
          .select("*")
          .eq("project_id", Number(id))
          .maybeSingle();

        if (brief) {
          // Cenário 1: Já existe um briefing oficial na tabela 'briefings'
          setBriefingStatus(brief.status as any);
          if (brief.content && brief.content.length > 0)
            setBlocks(brief.content);
        } else if (proj.description && proj.description.length > 10) {
          // TENTA QUEBRAR O TEXTO EM PERGUNTAS INDIVIDUAIS
          const lines = proj.description
            .split("\n")
            .filter((line: string) => line.trim().length > 0);

          const aiBlocks = lines.map((line: string, index: number) => {
            // Remove numeração (ex: "1. Qual o objetivo?" vira "Qual o objetivo?")
            const cleanLabel = line.replace(/^\d+[\.\)]\s*/, "").trim();

            return {
              id: `ai-q-${index}`,
              type: "textarea", // Assume que toda pergunta pede uma resposta longa
              label: cleanLabel,
              placeholder: "Responda aqui...",
              answer: "", // Começa vazio para o cliente responder
            };
          });

          // Se por acaso a quebra falhar e der array vazio, usa o fallback do blocão
          if (aiBlocks.length === 0) {
            setBlocks([
              {
                id: "ai-fallback",
                type: "textarea",
                label: "Estratégia IA",
                answer: proj.description,
              },
            ]);
          } else {
            setBlocks(aiBlocks);
          }

          setBriefingStatus("draft");
          setIsEditing(true);
        }
      }
      setLoading(false);
    };
    fetchData();

    // CONFIGURAÇÃO DO REALTIME
    const channel = supabase
      .channel(`project-updates-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "briefings",
          filter: `project_id=eq.${id}`,
        },
        (payload: any) => {
          console.log("⚡ Alteração recebida:", payload);

          // 1. Atualiza o status instantaneamente
          if (payload.new?.status) {
            setBriefingStatus(payload.new.status);
            if (payload.new.status === "sent") {
              toast.success("O cliente respondeu o briefing!");
            }
          }

          // 2. Atualiza as respostas instantaneamente
          if (payload.new?.content) {
            setBlocks(payload.new.content);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // 2. FUNÇÃO APPROVE BRIEFING (CORRIGIDA E POSICIONADA)
  const approveBriefing = async () => {
    if (!id) return;

    const { error } = await supabase
      .from("briefings")
      .update({ status: "approved" })
      .eq("project_id", Number(id));

    if (error) {
      toast.error("Erro ao aprovar.");
    } else {
      toast.success("Briefing aprovado! Iniciando desenvolvimento.");
      setBriefingStatus("approved");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const loadTemplate = (key: string) => {
    // @ts-ignore
    const templateBlocks = BRIEFING_TEMPLATES[key]?.blocks || [];
    const newBlocks = templateBlocks.map((b: any) => ({
      ...b,
      id: Date.now().toString() + Math.random(),
    }));
    setBlocks(newBlocks);
    setIsEditing(true);
  };

  const updateBlock = (i: number, field: keyof BriefingBlock, value: any) => {
    const newBlocks = [...blocks];
    newBlocks[i] = { ...newBlocks[i], [field]: value };
    setBlocks(newBlocks);
  };

  const removeBlock = (i: number) =>
    setBlocks(blocks.filter((_, x) => x !== i));

  const addBlock = () =>
    setBlocks([
      ...blocks,
      { id: Date.now().toString(), type: "text", label: "", placeholder: "" },
    ]);

  const saveBriefing = async () => {
    // Se id for undefined ou string vazia
    if (!id) {
      toast.error("Erro Crítico: ID do projeto não encontrado na URL.");
      return;
    }

    const projectIdNumber = Number(id);
    if (isNaN(projectIdNumber)) {
      toast.error(`ID inválido: ${id}`);
      return;
    }

    setIsSavingBriefing(true);

    try {
      // 1. Tenta buscar se já tem ID (para tentar update direto)
      const { data: existingBrief } = await supabase
        .from("briefings")
        .select("id")
        .eq("project_id", projectIdNumber)
        .maybeSingle();

      let error;

      // Objeto base para salvar (com a correção do template_type)
      const payload = {
        project_id: projectIdNumber,
        content: blocks,
        status: "awaiting_response", // Cliente ainda não respondeu

        template_type: "custom", // <--- ADICIONADO: Valor padrão para satisfazer a constraint NOT NULL
        // Removido updated_at/created_at pois geralmente o banco gerencia isso ou não existe a coluna
      };

      if (existingBrief?.id) {
        // UPDATE direto pelo ID que temos certeza que existe
        const { error: updateError } = await supabase
          .from("briefings")
          .update(payload) // Usa o payload corrigido
          .eq("id", existingBrief.id);
        error = updateError;
      } else {
        // INSERT novo
        const { error: insertError } = await supabase
          .from("briefings")
          .insert(payload); // Usa o payload corrigido
        error = insertError;
      }

      if (error) {
        console.warn("Erro no fluxo normal, tentando UPSERT...", error);

        // No fallback do UPSERT também usamos o payload corrigido
        const { error: upsertError } = await supabase
          .from("briefings")
          .upsert(payload, { onConflict: "project_id" });

        if (upsertError) throw upsertError;
      }

      toast.success("Briefing Salvo com Sucesso!");
      setBriefingStatus("awaiting_response");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      toast.error("Erro ao salvar: " + (err.message || "Erro desconhecido"));
    } finally {
      setIsSavingBriefing(false);
    }
  };

  const copyLink = async () => {
    const { data } = await supabase
      .from("briefings")
      .select("id")
      .eq("project_id", Number(id))
      .single();
    if (data) {
      navigator.clipboard.writeText(
        `${window.location.origin}/share/${data.id}`
      );
      toast.success("Link copiado!");
    } else toast.error("Salve o briefing primeiro.");
  };

  const confirmReset = async () => {
    await supabase.from("briefings").delete().eq("project_id", Number(id));
    setBlocks([]);
    setBriefingStatus("empty");
    setIsEditing(false);
    setShowResetDialog(false);
    toast.success("Briefing resetado!");
  };

  const saveProjectSettings = async () => {
    if (!id) return;
    try {
      setSavingSettings(true);
      const isoDate = projectDueDate
        ? new Date(projectDueDate + "T12:00:00").toISOString()
        : null;

      const { error } = await supabase
        .from("projects")
        .update({
          name: projectName,
          description: projectDescription,
          status: projectStatus,
          due_date: isoDate,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Configurações atualizadas!");
      setProject((prev: any) => ({
        ...prev,
        name: projectName,
        description: projectDescription,
        status: projectStatus,
        due_date: isoDate,
      }));

      setIsSettingsOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar.");
    } finally {
      setSavingSettings(false);
    }
  };

  const archiveProject = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: "archived" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Projeto arquivado com sucesso.");
      setProjectStatus("archived");
      setIsSettingsOpen(false);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Erro ao arquivar projeto.");
    }
  };

  const toggleActivity = () => {
    if (window.innerWidth >= 1280) {
      setIsActivityOpen(!isActivityOpen);
    } else {
      setIsMobileActivityOpen(true);
    }
  };

  // --- SUB-COMPONENTES DE UI REUTILIZÁVEIS ---

  const NavLinks = () => (
    <nav className="flex-1 px-4 mt-6">
      <Link to="/dashboard">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 px-2 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Voltar para Projetos</span>
        </button>
      </Link>
      <div className="space-y-6">
        {/* GRUPO: PROJETO */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 font-mono">
            Projeto
          </p>
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "briefing", label: "Briefing", icon: Layout },
            { id: "files", label: "Arquivos", icon: Folder },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                activeTab === item.id
                  ? "text-white bg-zinc-900/50"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/30"
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="menu-active"
                  className="absolute inset-0 bg-blue-500/10 border-l-2 border-blue-500 rounded-r-sm z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-3 ${
                  activeTab === item.id ? "text-blue-400" : ""
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* GRUPO: SOCIAL */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 font-mono">
            Social
          </p>
          {[
            { id: "members", label: "Membros", icon: Users },
            { id: "chat", label: "Chat do Time", icon: MessageCircle },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
                activeTab === item.id
                  ? "text-white bg-zinc-900/50"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/30"
              }`}
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="menu-active"
                  className="absolute inset-0 bg-blue-500/10 border-l-2 border-blue-500 rounded-r-sm z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-3 ${
                  activeTab === item.id ? "text-blue-400" : ""
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  const UserProfileFooter = () => (
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
          <p className="text-[10px] text-zinc-500 truncate">Plano Pro</p>
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
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans overflow-hidden selection:bg-blue-500/30 relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-zinc-800/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* DIALOGS */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Resetar?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Isso apagará tudo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowResetDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SETTINGS DIALOG */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações do Projeto</DialogTitle>
            <DialogDescription hidden>
              Ajuste os detalhes do projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs uppercase">Nome</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs uppercase">
                Descrição
              </Label>
              <Textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400 text-xs uppercase">
                  Status
                </Label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500/50"
                >
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="done">Concluído</option>
                  <option value="archived">Arquivado</option>
                </select>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs uppercase">
                  Data Entrega
                </Label>
                <Input
                  type="date"
                  value={projectDueDate}
                  onChange={(e) => setProjectDueDate(e.target.value)}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t border-zinc-900 mt-2">
              <Button
                variant="ghost"
                className="text-zinc-500 hover:text-red-400 hover:bg-red-900/10"
                onClick={archiveProject}
                disabled={archiving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Arquivar
              </Button>
              <Button
                onClick={saveProjectSettings}
                disabled={savingSettings}
                className="bg-blue-600 text-white"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MENU MOBILE (DRAWER) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-[#050505] border-r border-zinc-800 z-50 flex flex-col md:hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">
                    FLUXO.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </Button>
              </div>

              <div className="flex flex-col flex-1">
                <NavLinks />
                <UserProfileFooter />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- ACTIVITY DRAWER MOBILE (XL DOWN) --- */}
      <AnimatePresence>
        {isMobileActivityOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileActivityOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 xl:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-zinc-900 z-50 flex flex-col xl:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-white">
                    Atividade do Projeto
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileActivityOpen(false)}
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-4 bg-[#050505]">
                {id ? <ProjectActivity projectId={id} /> : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR DESKTOP --- */}
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

        <NavLinks />
        <UserProfileFooter />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 ">
        <header className="h-16 md:h-20 border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-col gap-0.5">
              <div className="hidden xs:flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                <span>Projetos</span>
                <ChevronRight className="h-3 w-3 text-zinc-700" />
                <span className="text-blue-500">Detalhes</span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight truncate max-w-[200px] md:max-w-2xl">
                  {project?.name}
                </h1>

                <Badge
                  variant="outline"
                  className={`hidden md:flex text-[10px] h-5 border-zinc-800 uppercase tracking-wider px-2 ${
                    projectStatus === "active"
                      ? "text-emerald-400 bg-emerald-400/5"
                      : "text-zinc-400"
                  }`}
                >
                  {projectStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* AÇÕES DESKTOP */}
          <div className="hidden md:flex gap-3 items-center">
            <div className="hidden lg:flex items-center gap-2 mr-4 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400 font-medium">
                Entrega:{" "}
                {project?.due_date
                  ? format(new Date(project.due_date), "dd 'de' MMM", {
                      locale: ptBR,
                    })
                  : "--/--"}
              </span>
            </div>
            <Button
              onClick={copyLink}
              variant="outline"
              size="sm"
              className="h-9 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <ExternalLink className="mr-2 h-3 w-3" /> Share
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-zinc-800 mx-1 block" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActivity}
              className="flex h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-900 relative rounded-lg"
            >
              {isActivityOpen ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* AÇÕES MOBILE (Dropdown Menu) */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActivity}
              className="text-zinc-400 hover:text-white relative"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#0A0A0A] border-zinc-800 text-zinc-200"
              >
                <DropdownMenuLabel>Ações do Projeto</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={copyLink}
                  className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Compartilhar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsSettingsOpen(true)}
                  className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-2 text-xs text-zinc-500">
                  Entrega:{" "}
                  {project?.due_date
                    ? format(new Date(project.due_date), "dd/MM/yyyy")
                    : "Sem data"}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* BARRA DE INFO MOBILE */}
        <div className="md:hidden bg-zinc-900/30 border-b border-zinc-900 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                projectStatus === "active" ? "bg-emerald-500" : "bg-zinc-600"
              }`}
            />
            <span className="text-zinc-400 uppercase tracking-wider font-medium">
              {projectStatus === "active" ? "Em Andamento" : projectStatus}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Calendar className="h-3 w-3" />
            <span>
              {project?.due_date
                ? format(new Date(project.due_date), "dd MMM")
                : "--"}
            </span>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="max-w-[1800px] mx-auto flex gap-10 items-start h-full pt-2">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {/* --- ABA DASHBOARD (VISÃO GERAL) --- */}
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8 pb-8"
                  >
                    <div>
                      <h2 className="text-2xl font-semibold text-white tracking-tight">
                        Visão Geral
                      </h2>
                      <p className="text-zinc-400 mt-1 text-sm">
                        Resumo e atividades recentes do projeto.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 mb-10 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {/* CARD 1: PRAZO */}
                      <motion.div
                        whileHover={{
                          y: -4,
                          borderColor: "rgba(59, 130, 246, 0.5)",
                        }}
                        whileTap={{
                          x: [0, -5, 5, -5, 5, 0],
                          transition: { duration: 0.4 },
                        }}
                        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 cursor-pointer relative overflow-hidden group shadow-lg shadow-black/20"
                      >
                        {/* ANIMAÇÃO PASSIVA (Aurora Azul) */}
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 20, 0],
                            y: [0, -20, 0],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500 rounded-full blur-[80px] pointer-events-none"
                        />

                        <div className="flex justify-between items-start z-10">
                          <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-700/50 backdrop-blur-md shadow-sm">
                            <Calendar className="h-5 w-5 text-blue-400" />
                          </div>
                          {project?.due_date && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                              DATA
                            </span>
                          )}
                        </div>

                        <div className="z-10">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            Entrega Prevista
                          </p>
                          <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums">
                            {project?.due_date
                              ? format(new Date(project.due_date), "dd/MM", {
                                  locale: ptBR,
                                })
                              : "--/--"}
                          </h3>
                        </div>
                      </motion.div>

                      {/* CARD 2: BRIEFING */}
                      <motion.div
                        onClick={() => setActiveTab("briefing")}
                        whileHover={{
                          y: -4,
                          borderColor: "rgba(16, 185, 129, 0.5)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 cursor-pointer relative overflow-hidden group shadow-lg shadow-black/20"
                      >
                        {/* ANIMAÇÃO PASSIVA (Aurora Verde) */}
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.1, 0.25, 0.1],
                            x: [0, -20, 0],
                            y: [0, 10, 0],
                          }}
                          transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                          }}
                          className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] pointer-events-none"
                        />

                        <div className="flex justify-between items-start z-10">
                          <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-700/50 backdrop-blur-md">
                            <Layout className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="p-1 rounded-full hover:bg-zinc-800 transition-colors">
                            <ArrowLeft className="h-4 w-4 text-zinc-600 rotate-180 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>

                        <div className="z-10 w-full">
                          <div className="flex justify-between items-end mb-2">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                              Briefing
                            </p>
                            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-400/10 px-1.5 rounded">
                              {briefingStatus === "sent"
                                ? "100%"
                                : briefingStatus === "draft"
                                ? "80%"
                                : "0%"}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-3 capitalize">
                            {briefingStatus === "approved"
                              ? "Aprovado"
                              : briefingStatus === "sent"
                              ? "Respondido"
                              : briefingStatus === "awaiting_response"
                              ? "Aguardando Resposta"
                              : briefingStatus === "draft"
                              ? "Rascunho"
                              : "Não Iniciado"}
                          </h3>

                          {/* Barra de progresso com brilho */}
                          <div className="w-full bg-zinc-800/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width:
                                  briefingStatus === "approved"
                                    ? "100%"
                                    : briefingStatus === "sent"
                                    ? "100%"
                                    : briefingStatus === "awaiting_response"
                                    ? "50%"
                                    : briefingStatus === "draft"
                                    ? "40%"
                                    : "0%",
                              }}
                              className={`h-full relative ${
                                briefingStatus === "approved"
                                  ? "bg-emerald-500"
                                  : "bg-emerald-500/80"
                              }`}
                            >
                              {/* Brilho correndo na barra */}
                              <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                  delay: 2,
                                }}
                                className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                              />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      {/* CARD 3: STATUS */}
                      <motion.div
                        onClick={() => setIsSettingsOpen(true)}
                        whileHover={{
                          y: -4,
                          borderColor: "rgba(236, 72, 153, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 cursor-pointer relative overflow-hidden group shadow-lg shadow-black/20"
                      >
                        {/* ANIMAÇÃO PASSIVA (Aurora Rosa) */}
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.05, 0.15, 0.05],
                            rotate: [0, 45, 0],
                          }}
                          transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                          }}
                          className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500 rounded-full blur-[100px] pointer-events-none"
                        />

                        <div className="flex justify-between items-start z-10">
                          <div className="p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-700/50 relative backdrop-blur-md">
                            <Sparkles className="h-5 w-5 text-pink-400" />
                            {projectStatus === "active" && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                              </span>
                            )}
                          </div>
                          <Settings className="h-4 w-4 text-zinc-600 group-hover:text-pink-400 group-hover:rotate-90 transition-all duration-700 ease-out" />
                        </div>

                        <div className="z-10">
                          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">
                            Status Atual
                          </p>
                          <h3 className="text-2xl font-bold text-white capitalize truncate leading-tight">
                            {projectStatus === "active"
                              ? "Em Andamento"
                              : projectStatus}
                          </h3>
                        </div>
                      </motion.div>
                    </div>
                    <ProjectRoadmap
                      briefingStatus={briefingStatus}
                      projectStatus={projectStatus as any} // 'as any' garante compatibilidade dos tipos de string
                    />
                  </motion.div>
                )}

                {/* --- ABA BRIEFING --- */}
                {activeTab === "briefing" && (
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-6 md:mb-8 flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                          Briefing
                        </h2>
                        <p className="text-zinc-400 mt-1 text-sm">
                          Dados estratégicos e alinhamento.
                        </p>
                      </div>
                    </div>

                    {/* SEÇÃO PRINCIPAL: Card de Conteúdo */}
                    <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-4 md:p-10 backdrop-blur-sm relative overflow-hidden shadow-xl shadow-black/20">
                      {/* 
          CENÁRIO 1: MODO VISUALIZAÇÃO (Já Salvo)
          Exibe: Ação de Sucesso (Topo) + Respostas (Baixo)
      */}
                      {(briefingStatus === "sent" ||
                        briefingStatus === "approved" ||
                        briefingStatus === "awaiting_response") &&
                      !isEditing ? (
                        <div className="space-y-8">
                          {/* COMPONENTE DE SUCESSO AQUI */}
                          <BriefingSuccessAction onCopyLink={copyLink} />
                          {/* Divisor Visual */}
                          <div className="flex justify-between items-center border-b border-zinc-800/50 pb-6 pt-2">
                            <div className="flex items-center gap-3">
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                              <h3 className="font-medium text-zinc-200 text-sm tracking-wide uppercase">
                                Respostas do Cliente
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditing(true)}
                              className="text-zinc-500 hover:text-white hover:bg-zinc-800 h-8 text-xs gap-2 px-3 rounded-full border border-transparent hover:border-zinc-700 transition-all"
                            >
                              <PenLine className="h-3.5 w-3.5" />{" "}
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                          </div>

                          {/* Lista de Respostas (Opacidade reduzida para foco no topo) */}
                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 opacity-90 hover:opacity-100 transition-opacity duration-300"
                          >
                            {blocks.map((block: any, i) => (
                              <motion.div
                                key={block.id}
                                variants={itemVariants as any}
                                className="group relative p-5 md:p-6 rounded-2xl bg-zinc-950/40 border border-zinc-800/40 hover:border-zinc-700/60 transition-all hover:shadow-lg hover:shadow-black/40 overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-500/10 text-[11px] font-bold text-blue-400 border border-blue-500/20 font-mono">
                                    {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                  </span>
                                  <h3 className="text-sm font-semibold text-zinc-200 tracking-tight leading-snug">
                                    {block.label}
                                  </h3>
                                </div>

                                {/* Conteúdo da Resposta */}
                                <div className="pl-0 md:pl-10 relative z-10">
                                  {block.type === "upload" ? (
                                    block.answer ? (
                                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 max-w-sm">
                                        <div className="h-10 w-10 bg-zinc-800 rounded flex items-center justify-center text-blue-500">
                                          {block.answer.match(
                                            /\.(jpg|jpeg|png|gif)$/i
                                          ) ? (
                                            <ImageIcon className="h-5 w-5" />
                                          ) : (
                                            <FileText className="h-5 w-5" />
                                          )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                          <p className="text-sm text-zinc-300 truncate font-medium">
                                            Arquivo Anexado
                                          </p>
                                          <a
                                            href={block.answer}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:underline truncate block"
                                          >
                                            Baixar
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="italic text-zinc-600 flex items-center gap-2">
                                        <UploadCloud className="h-4 w-4" />{" "}
                                        Nenhum arquivo.
                                      </span>
                                    )
                                  ) : (
                                    <p className="text-sm text-zinc-300 leading-7 whitespace-pre-wrap font-light">
                                      {block.answer || (
                                        <span className="italic text-zinc-600">
                                          Ainda não respondido.
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                          {/* No final da exibição das respostas, adicione: */}

                          {briefingStatus === "sent" && (
                            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                              <Button
                                onClick={approveBriefing}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Aprovar e Iniciar Desenvolvimento
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {briefingStatus === "empty" && !isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <TemplateCard
                                onClick={() => loadTemplate("custom")}
                                icon={<Plus className="h-5 w-5" />}
                                title="Em Branco"
                                desc="Começar do zero"
                                color="blue"
                              />
                              <TemplateCard
                                onClick={() => loadTemplate("branding")}
                                icon={<Palette className="h-5 w-5" />}
                                title="Identidade"
                                desc="Branding & Logo"
                                color="pink"
                              />
                              <TemplateCard
                                onClick={() => loadTemplate("landing_page")}
                                icon={<Globe className="h-5 w-5" />}
                                title="Website"
                                desc="Landing Pages"
                                color="emerald"
                              />
                            </div>
                          )}

                          {(isEditing ||
                            briefingStatus === "draft" ||
                            briefingStatus === "sent") && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                                <h3 className="font-medium text-zinc-200">
                                  Editor de Perguntas
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowResetDialog(true)}
                                  className="text-zinc-500 hover:text-red-400 text-xs h-7"
                                >
                                  Limpar Tudo
                                </Button>
                              </div>

                              {/* Loop dos Blocos de Edição (Inputs) */}
                              {blocks.map((block, i) => (
                                <div
                                  key={block.id}
                                  className="group bg-zinc-950/50 hover:bg-zinc-900/80 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-4 items-start"
                                >
                                  <div className="flex items-center gap-2 w-full md:w-auto">
                                    <span className="text-xs text-zinc-600 font-mono pt-0 md:pt-3">
                                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeBlock(i)}
                                      className="md:hidden ml-auto text-zinc-600 hover:text-red-400 h-6 w-6"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="flex-1 space-y-3 w-full">
                                    <Input
                                      value={block.label}
                                      onChange={(e) =>
                                        updateBlock(i, "label", e.target.value)
                                      }
                                      className="bg-transparent border-none text-sm font-medium px-0 h-auto focus-visible:ring-0 text-zinc-200 placeholder:text-zinc-700"
                                      placeholder="Digite a pergunta aqui..."
                                    />
                                    {/* ... Resto dos inputs de edição (Placeholder, Select Type) ... */}
                                    {/* (Mantido igual ao original para economizar espaço aqui, mas use o código do paste.txt) */}
                                    <div className="flex flex-wrap gap-2 items-center opacity-100 md:opacity-50 group-hover:opacity-100 transition-opacity">
                                      <select
                                        value={block.type}
                                        onChange={(e) =>
                                          updateBlock(i, "type", e.target.value)
                                        }
                                        className="bg-[#050505] text-xs text-zinc-400 border border-zinc-800 rounded px-2 py-1 focus:outline-none w-full md:w-auto"
                                      >
                                        <option value="text">
                                          Texto Curto
                                        </option>
                                        <option value="textarea">
                                          Texto Longo
                                        </option>
                                        <option value="select">
                                          Múltipla Escolha
                                        </option>
                                        <option value="upload">
                                          Upload de Arquivo
                                        </option>
                                      </select>
                                      {/* Input de placeholder... */}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeBlock(i)}
                                    className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}

                              {/* Botões de Ação do Editor */}
                              <div className="flex flex-col md:flex-row justify-between pt-6 gap-3">
                                <Button
                                  variant="outline"
                                  onClick={addBlock}
                                  className="border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 w-full md:w-auto"
                                >
                                  <Plus className="mr-2 h-4 w-4" /> Nova
                                  Pergunta
                                </Button>
                                <Button
                                  onClick={saveBriefing}
                                  disabled={isSavingBriefing}
                                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 shadow-lg shadow-blue-900/20 relative min-w-[160px] w-full md:w-auto"
                                >
                                  {isSavingBriefing ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                                      Salvando...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" /> Salvar e
                                      Finalizar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- ABA FILES --- */}
                {activeTab === "files" && (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {id ? <ProjectFiles projectId={id} /> : null}
                  </motion.div>
                )}

                {/* --- ABA MEMBERS --- */}
                {activeTab === "members" && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-white tracking-tight">
                        Membros
                      </h2>
                      <p className="text-zinc-400 mt-1 text-sm">
                        Gerencie quem tem acesso a este projeto.
                      </p>
                    </div>
                    <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-6">
                      {id ? <TeamManager projectId={id} /> : null}
                    </div>
                  </motion.div>
                )}

                {/* --- ABA CHAT --- */}
                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-[600px] flex items-center justify-center bg-zinc-900/20 border border-zinc-800/60 rounded-3xl border-dashed"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                        <MessageCircle className="h-8 w-8 text-zinc-600" />
                      </div>
                      <h3 className="text-lg font-medium text-white">
                        Chat do Time
                      </h3>
                      <p className="text-zinc-500 max-w-xs mx-auto mt-2">
                        Um espaço dedicado para discussão em tempo real sobre
                        este projeto.
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-4 border-blue-500/30 text-blue-400 bg-blue-500/10"
                      >
                        Em Breve
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isActivityOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0, x: 20 }}
                  animate={{ width: 380, opacity: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="hidden xl:block shrink-0 h-[calc(100vh-120px)] sticky top-28"
                >
                  <div className="h-full pl-8 border-l border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <MessageSquare className="h-4 w-4 text-zinc-500" />
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Atividade
                      </h3>
                    </div>
                    <div className="h-[calc(100%-40px)] shadow-2xl rounded-xl overflow-hidden ring-1 ring-zinc-800/50 bg-[#050505]">
                      <ProjectActivity projectId={id!} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function TemplateCard({ icon, title, desc, color, onClick }: any) {
  const colors: any = {
    blue: "text-blue-500",
    pink: "text-pink-500",
    emerald: "text-emerald-500",
  };
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start p-5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl hover:border-zinc-700 transition-all text-left w-full overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div
        className={`h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-3 ${colors[color]} group-hover:scale-110 transition-transform relative z-10`}
      >
        {icon}
      </div>
      <h3 className="font-medium text-zinc-200 text-sm group-hover:text-white relative z-10">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 mt-1 relative z-10">{desc}</p>
    </button>
  );
}

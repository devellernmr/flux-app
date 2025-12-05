import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import {
  Folder,
  Settings,
  Loader2,
  Sparkles,
  ArrowLeft,
  Plus,
  Palette,
  Globe,
  Video,
  Image as ImageIcon,
  Layout,
  Menu,
  X,
  Share2,
  CheckCircle2,
  Trash2,
  Save,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";

// --- COMPONENTES ---
import { ProjectFiles } from "./ProjectFiles";
import { ProjectActivity } from "@/components/ProjectActivity";

// --- TEMPLATES ---
const PRESET_TEMPLATES: any = {
  custom: [],
  identidade: [
    { id: "1", type: "text", label: "Qual o nome da marca?" },
    {
      id: "2",
      type: "textarea",
      label: "Qual a história e os valores da empresa?",
    },
    { id: "3", type: "text", label: "Quem é o público-alvo?" },
    { id: "4", type: "text", label: "Quais são os principais concorrentes?" },
    {
      id: "5",
      type: "textarea",
      label: "Quais cores você imagina para a marca? (Opcional)",
    },
  ],
  site: [
    { id: "1", type: "text", label: "Qual o objetivo principal do site?" },
    {
      id: "2",
      type: "select",
      label: "Quais seções o site precisa ter?",
      options: ["Home", "Sobre", "Serviços", "Contato", "Blog"],
    },
    {
      id: "3",
      type: "textarea",
      label: "Liste 3 sites que você gosta como referência.",
    },
    { id: "4", type: "text", label: "Você já possui domínio e hospedagem?" },
  ],
  social: [
    {
      id: "1",
      type: "select",
      label: "Para quais redes sociais são os posts?",
      options: ["Instagram", "LinkedIn", "TikTok", "Facebook"],
    },
    { id: "2", type: "textarea", label: "Quais os temas/pilares de conteúdo?" },
    { id: "3", type: "text", label: "Qual a frequência de postagem desejada?" },
  ],
  video: [
    { id: "1", type: "text", label: "Qual a duração estimada do vídeo?" },
    {
      id: "2",
      type: "select",
      label: "Qual o formato?",
      options: ["Horizontal (Youtube)", "Vertical (Reels/TikTok)"],
    },
    {
      id: "3",
      type: "textarea",
      label: "Descreva o roteiro ou a ideia principal.",
    },
  ],
};

export function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estado para controlar a Sidebar de Atividade (Chat)
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  // Estados do Briefing
  const [activeTab, setActiveTab] = useState<"briefing" | "files">("briefing");
  const [briefingStatus, setBriefingStatus] = useState<
    "empty" | "draft" | "sent" | "approved"
  >("empty");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Hooks Visuais
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const maskImage = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, black, transparent 100%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }: any) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // --- FETCH DATA ---
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
        if (proj) setProject(proj);

        const { data: brief } = await supabase
          .from("briefings")
          .select("*")
          .eq("project_id", id)
          .single();
        if (brief) {
          setBriefingStatus(brief.status as any);
          if (brief.content && brief.content.length > 0)
            setBlocks(brief.content);
        }
      }
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel("briefing-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "briefings",
          filter: `project_id=eq.${id}`,
        },
        () => {
          toast.info("O cliente atualizou o briefing!");
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // --- LÓGICA DO BRIEFING ---
  const loadTemplate = (key: string) => {
    const templateBlocks = PRESET_TEMPLATES[key] || [];
    const newBlocks = templateBlocks.map((b: any) => ({
      ...b,
      id: Date.now().toString() + Math.random(),
    }));
    setBlocks(newBlocks);
    setIsEditing(true);
    toast.success("Template carregado!");
  };

  const updateBlock = (i: number, f: any, v: any) => {
    const n = [...blocks];
    n[i] = { ...n[i], [f]: v };
    setBlocks(n);
  };

  const removeBlock = (i: number) =>
    setBlocks(blocks.filter((_, x) => x !== i));
  const addBlock = () =>
    setBlocks([
      ...blocks,
      { id: Date.now().toString(), type: "text", label: "" },
    ]);

  const saveBriefing = async () => {
    const contentToSave = blocks.map((b) => ({ ...b, answer: b.answer || "" }));
    const { data: existing } = await supabase
      .from("briefings")
      .select("id")
      .eq("project_id", id)
      .single();

    let error;
    if (existing) {
      error = (
        await supabase
          .from("briefings")
          .update({ content: contentToSave, status: "draft" })
          .eq("id", existing.id)
      ).error;
    } else {
      error = (
        await supabase.from("briefings").insert({
          project_id: id,
          content: contentToSave,
          status: "draft",
          template_type: "custom",
        })
      ).error;
    }

    if (error) toast.error("Erro ao salvar");
    else {
      toast.success("Briefing Salvo!");
      setBriefingStatus("draft");
      setIsEditing(false);
    }
  };

  const copyLink = async () => {
    const { data } = await supabase
      .from("briefings")
      .select("id")
      .eq("project_id", id)
      .single();
    if (data) {
      navigator.clipboard.writeText(
        `${window.location.origin}/share/${data.id}`
      );
      toast.success("Link copiado!");
    } else {
      toast.error("Salve o briefing primeiro.");
    }
  };

  const confirmReset = async () => {
    await supabase.from("briefings").delete().eq("project_id", id);
    setBlocks([]);
    setBriefingStatus("empty");
    setIsEditing(false);
    setShowResetDialog(false);
    toast.success("Briefing resetado!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[size:32px_32px] bg-grid-slate-700/[0.1]" />
        <div className="flex flex-col items-center gap-4 z-10">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#020617] text-slate-100 flex font-sans overflow-x-hidden selection:bg-blue-500/30 relative"
      onMouseMove={handleMouseMove}
    >
      {/* MODAL RESET */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center">Resetar Briefing?</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Isso apagará todas as perguntas atuais. Ação irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowResetDialog(false)}
              className="w-full hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReset}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sim, Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MENU MOBILE */}
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
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-xs bg-[#020617] border-r border-slate-800 z-50 p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="h-8 font-bold text-xl text-blue-500 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> FLUXO.
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-slate-400" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeTab === "briefing"
                      ? "text-blue-400 bg-blue-950/20"
                      : "text-slate-400"
                  }`}
                  onClick={() => {
                    setActiveTab("briefing");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Layout className="mr-2 h-4 w-4" /> Briefing
                </Button>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeTab === "files"
                      ? "text-blue-400 bg-blue-950/20"
                      : "text-slate-400"
                  }`}
                  onClick={() => {
                    setActiveTab("files");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Folder className="mr-2 h-4 w-4" /> Arquivos
                </Button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 fixed">
        <div className="absolute inset-0 opacity-[0.03] bg-[size:32px_32px] bg-grid-slate-700/[0.1]" />
        <motion.div
          className="absolute inset-0 opacity-80 mix-blend-screen"
          style={{
            backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            maskImage: maskImage,
            WebkitMaskImage: maskImage,
          }}
        />
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-[#020617] border-r border-slate-800 hidden md:flex flex-col sticky top-0 h-screen z-20 transition-all duration-300">
        <div className="p-6 flex items-center justify-start">
          <Link to="/dashboard">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-8 font-bold text-xl text-blue-500 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-6 w-6" />{" "}
              <span className="tracking-widest">FLUXO.</span>
            </motion.div>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-4 mt-4 flex flex-col items-stretch">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="mr-3 h-5 w-5" /> <span>Voltar</span>
            </Button>
          </Link>
          <div className="h-px bg-slate-800 w-full my-2" />
          <Button
            variant="ghost"
            onClick={() => setActiveTab("briefing")}
            className={`w-full justify-start border-l-2 rounded-r-lg rounded-l-none transition-all ${
              activeTab === "briefing"
                ? "text-blue-400 bg-blue-950/20 border-blue-500"
                : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Layout className="mr-3 h-5 w-5" /> <span>Briefing</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("files")}
            className={`w-full justify-start border-l-2 rounded-r-lg rounded-l-none transition-all ${
              activeTab === "files"
                ? "text-blue-400 bg-blue-950/20 border-blue-500"
                : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Folder className="mr-3 h-5 w-5" /> <span>Arquivos</span>
          </Button>
        </nav>
        <div className="p-4 border-t border-slate-800 mt-auto">
          <Avatar className="h-10 w-10 border border-slate-700 ring-2 ring-slate-800 cursor-pointer">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-slate-800 text-slate-300">
              {user?.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-16 md:h-20 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4 max-w-[70%]">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
              <Folder className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
                <span className="truncate">{project?.name}</span>
                <Badge
                  variant="outline"
                  className="hidden sm:flex border-green-500/30 text-green-400 bg-green-500/10 text-[10px] px-2 py-0.5 h-5"
                >
                  ATIVO
                </Badge>
              </h1>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={copyLink}
              variant="outline"
              className="hidden md:flex border-slate-700 text-slate-400 hover:text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Briefing Link
            </Button>
            <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
              Compartilhar
            </Button>

            {/* BOTÃO TOGGLE CHAT */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              className="hidden xl:flex text-slate-400 hover:text-blue-400 hover:bg-slate-800 border border-slate-700 ml-2"
              title={isActivityOpen ? "Fechar Atividade" : "Abrir Atividade"}
            >
              {isActivityOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="max-w-5xl mx-auto flex gap-6">
            <div className="flex-1 min-w-0">
              {" "}
              {/* min-w-0 evita overflow flex */}
              {activeTab === "briefing" ? (
                <>
                  <div className="mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                      Briefing
                    </h2>
                    <p className="text-sm md:text-base text-slate-400">
                      Dados e requisitos do projeto.
                    </p>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 md:p-8 backdrop-blur-sm">
                    {(briefingStatus === "sent" ||
                      briefingStatus === "approved") &&
                    !isEditing ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-green-900/20 p-4 rounded-lg border border-green-900/50">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                              <h3 className="font-bold text-white text-sm">
                                Respondido pelo cliente
                              </h3>
                              <p className="text-[10px] text-slate-400">
                                Status: {briefingStatus}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="text-xs h-7"
                          >
                            Editar
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {blocks.map((block: any, index) => (
                            <div
                              key={block.id}
                              className="border-b border-slate-800 pb-4 last:border-0"
                            >
                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                                0{index + 1} — {block.label}
                              </p>
                              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {block.answer || (
                                  <span className="italic opacity-50">
                                    Sem resposta
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {briefingStatus === "empty" && !isEditing && (
                          <>
                            <h3 className="text-lg font-medium text-white mb-1 text-center">
                              Escolha um Template
                            </h3>
                            <p className="text-slate-500 text-sm text-center mb-6 md:mb-8">
                              Estruturas prontas para você não perder tempo.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                              <TemplateCard
                                onClick={() => loadTemplate("custom")}
                                icon={<Plus className="h-5 w-5" />}
                                title="Começar do Zero"
                                desc="Crie suas próprias perguntas."
                                color="blue"
                              />
                              <TemplateCard
                                onClick={() => loadTemplate("identidade")}
                                icon={<Palette className="h-5 w-5" />}
                                title="Identidade Visual"
                                desc="Essencial para criar marcas fortes."
                                color="pink"
                              />
                              <TemplateCard
                                onClick={() => loadTemplate("site")}
                                icon={<Globe className="h-5 w-5" />}
                                title="Landing Page / Site"
                                desc="Estruture o conteúdo para conversão."
                                color="emerald"
                              />
                              <TemplateCard
                                onClick={() => loadTemplate("social")}
                                icon={<ImageIcon className="h-5 w-5" />}
                                title="Social Media Pack"
                                desc="Posts para Instagram/Linkedin."
                                color="purple"
                              />
                              <TemplateCard
                                onClick={() => loadTemplate("video")}
                                icon={<Video className="h-5 w-5" />}
                                title="Edição de Vídeo"
                                desc="Roteiro e estilo para vídeos."
                                color="orange"
                              />
                            </div>
                          </>
                        )}

                        {(isEditing ||
                          briefingStatus === "draft" ||
                          briefingStatus === "sent") && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                              <h3 className="font-medium text-slate-300 text-sm">
                                Editando Perguntas
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResetDialog(true)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-7 text-xs"
                              >
                                <Trash2 className="mr-2 h-3 w-3" /> Resetar
                              </Button>
                            </div>
                            {blocks.map((block, index) => (
                              <div
                                key={block.id}
                                className="bg-slate-950 p-4 rounded border border-slate-800 flex gap-3 items-start group"
                              >
                                <span className="text-xs text-slate-500 pt-3 font-mono">
                                  {index + 1}.
                                </span>
                                <div className="flex-1 space-y-2">
                                  <Input
                                    value={block.label}
                                    onChange={(e) =>
                                      updateBlock(
                                        index,
                                        "label",
                                        e.target.value
                                      )
                                    }
                                    className="bg-transparent border-none text-sm font-medium focus-visible:ring-0 px-0"
                                    placeholder="Sua pergunta aqui..."
                                  />
                                  <div className="flex gap-2">
                                    <select
                                      value={block.type}
                                      onChange={(e) =>
                                        updateBlock(
                                          index,
                                          "type",
                                          e.target.value
                                        )
                                      }
                                      className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
                                    >
                                      <option value="text">Texto Curto</option>
                                      <option value="textarea">
                                        Texto Longo
                                      </option>
                                      <option value="select">Seleção</option>
                                      <option value="upload">Upload</option>
                                    </select>
                                    {block.type === "select" && (
                                      <Input
                                        value={block.options?.join(",") || ""}
                                        onChange={(e) =>
                                          updateBlock(
                                            index,
                                            "options",
                                            e.target.value.split(",")
                                          )
                                        }
                                        className="h-6 text-xs bg-slate-900 border-slate-700 w-40"
                                        placeholder="Opções (vírgula)"
                                      />
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBlock(index)}
                                  className="h-6 w-6 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex justify-between pt-4 border-t border-slate-800 mt-6">
                              <Button
                                variant="ghost"
                                onClick={addBlock}
                                size="sm"
                                className="text-slate-400 hover:text-white"
                              >
                                <Plus className="h-4 w-4 mr-2" /> Nova Pergunta
                              </Button>
                              <Button
                                onClick={saveBriefing}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold"
                              >
                                <Save className="h-4 w-4 mr-2" /> Salvar
                                Alterações
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 backdrop-blur-sm min-h-[400px]">
                  <ProjectFiles projectId={id!} />
                </div>
              )}
            </div>

            {/* ACTIVITY SIDEBAR (COLLAPSIBLE) */}
            <AnimatePresence>
              {isActivityOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="hidden xl:block shrink-0 border-l border-slate-800 pl-6 overflow-hidden"
                >
                  <div className="w-80">
                    <ProjectActivity projectId={id!} />
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
  const colorClasses: any = {
    blue: "group-hover:bg-blue-500/20 group-hover:text-blue-400 hover:border-blue-500/50",
    pink: "group-hover:bg-pink-500/20 group-hover:text-pink-400 hover:border-pink-500/50",
    emerald:
      "group-hover:bg-emerald-500/20 group-hover:text-emerald-400 hover:border-emerald-500/50",
    purple:
      "group-hover:bg-purple-500/20 group-hover:text-purple-400 hover:border-purple-500/50",
    orange:
      "group-hover:bg-orange-500/20 group-hover:text-orange-400 hover:border-orange-500/50",
  };

  return (
    <Card
      onClick={onClick}
      className={`bg-slate-950 border-slate-800 hover:bg-slate-900 transition-all cursor-pointer group ${colorClasses[
        color
      ]
        .split(" ")
        .pop()}`}
    >
      <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
        <div
          className={`h-10 w-10 rounded-md bg-slate-800 flex items-center justify-center transition-colors ${colorClasses[
            color
          ].replace("hover:border-" + color + "-500/50", "")}`}
        >
          {icon}
        </div>
        <div>
          <CardTitle className="text-sm md:text-base text-slate-200 group-hover:text-white">
            {title}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-slate-500">
            {desc}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

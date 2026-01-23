import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  X,
  Plus,
  Minus,
  LayoutList,
  ChevronDown,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sendNotification } from "@/lib/notifications";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FeedbackView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  // UI States
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel(`room-${fileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `file_id=eq.${fileId}`,
        },
        (payload) => {
          console.log("Realtime change in comments (FeedbackView):", payload);
          if (payload.eventType === "INSERT") {
            setComments((prev) => {
              if (prev.some((c) => c.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else {
            // Para UPDATE ou DELETE, recarrega tudo para garantir consistência
            fetchData();
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for file ${fileId}:`, status);
      });
    return () => {
      console.log(`Removing realtime channel for file ${fileId}`);
      supabase.removeChannel(channel);
    };
  }, [fileId]);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    const { data: fileData } = await supabase
      .from("files")
      .select("*, projects(name, custom_logo_url, agency_name)")
      .eq("id", fileId)
      .single();
    setFile(fileData);

    if (fileData?.project_id) {
      const { data: membersData } = await supabase
        .from("team_members_with_email")
        .select("user_id, email")
        .eq("project_id", fileData.project_id);
      if (membersData) setMembers(membersData);
    }

    // CORREÇÃO DO ERRO 400: Removido o join complexo 'profiles:user_id(email)'
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*") // Busca simples para evitar erro de Foreign Key
      .eq("file_id", fileId)
      .order("created_at", { ascending: true });

    setComments(commentsData || []);
  };

  const getEmbedUrl = (rawUrl: string) => {
    if (rawUrl.includes("figma.com")) {
      if (rawUrl.includes("figma.com/embed")) return rawUrl;
      return `https://www.figma.com/embed?embed_host=fluxo&url=${encodeURIComponent(
        rawUrl
      )}`;
    }
    if (rawUrl.includes("canva.com")) {
      if (rawUrl.includes("embed")) return rawUrl;
      // Ensure it uses /view instead of /edit or other suffixes
      let cleanUrl = rawUrl.split("?")[0];
      if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);

      const parts = cleanUrl.split("/");
      const lastPart = parts[parts.length - 1];

      // If it doesn't end in view or watch, try to replace the last part or append view
      if (lastPart !== "view" && lastPart !== "watch") {
        if (cleanUrl.includes("/design/")) {
          // Replace the action (edit/publish) with view if present
          cleanUrl = cleanUrl.replace(/\/(edit|publish|watch)$/, "/view");
          if (!cleanUrl.endsWith("/view")) cleanUrl += "/view";
        }
      }
      return `${cleanUrl}?embed`;
    }
    return rawUrl;
  };

  // Move this after the guard
  // const isExternalLink =
  //   file?.url?.includes("figma.com") || file?.url?.includes("canva.com");

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.01), 4);
      setScale(newScale);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTempPin({ x, y });
    setActiveCommentId(null);
  };

  const handleSendComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    const temp = { content: newComment, x: tempPin?.x, y: tempPin?.y };
    setNewComment("");
    setTempPin(null);

    const { data, error } = await supabase
      .from("comments")
      .insert({
        file_id: fileId,
        user_id: user?.id,
        content: temp.content,
        position_x: temp.x || null,
        position_y: temp.y || null,
      })
      .select()
      .single();

    if (!error) {
      setComments((prev) => {
        // Evita duplicatas do Realtime
        if (prev.some((c) => c.id === data.id)) return prev;
        return [...prev, data];
      });

      // Notificar outros membros sobre o novo feedback
      const otherMembers = members.filter((m) => m.user_id !== user?.id);
      for (const member of otherMembers) {
        await sendNotification({
          userId: member.user_id,
          title: "Novo feedback no design",
          message: `${user?.user_metadata?.full_name || "Alguém"
            } deixou um comentário em ${file.name}`,
          type: "comment",
          link: `/feedback/${fileId}`,
        });
      }

      toast.success("Enviado!");
    } else {
      console.error(error);
      toast.error("Erro ao enviar");
    }
  };

  const updateFileStatus = async (newStatus: "approved" | "rejected") => {
    if (!fileId) return;
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("files")
        .update({ status: newStatus })
        .eq("id", fileId);

      if (error) throw error;

      setFile((prev: any) => ({ ...prev, status: newStatus }));

      // Notificar sobre a mudança de status
      const otherMembers = members.filter((m) => m.user_id !== user?.id);
      for (const member of otherMembers) {
        await sendNotification({
          userId: member.user_id,
          title:
            newStatus === "approved"
              ? "Design Aprovado! 🎉"
              : "Ajustes Solicitados 📝",
          message: `O arquivo ${file.name} foi ${newStatus === "approved" ? "aprovado" : "marcado para ajustes"
            }.`,
          type: "approval",
          link: `/feedback/${fileId}`,
        });
      }

      toast.success(
        newStatus === "approved"
          ? "Design aprovado com sucesso!"
          : "Ajustes solicitados!"
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAnalyzeFeedback = async () => {
    if (comments.length === 0) {
      toast.info("Ainda não há comentários para analisar.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-feedback", {
        body: { comments }
      });

      if (error) throw error;
      setAiAnalysis(data);
      toast.success("Análise concluída!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao analisar feedback.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!file)
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 animate-pulse">
        Carregando Design...
      </div>
    );

  const isExternalLink =
    file?.url?.includes("figma.com") || file?.url?.includes("canva.com");

  return (
    <TooltipProvider>
      <div className="h-screen bg-[#09090b] flex flex-col fixed inset-0 overflow-hidden touch-none selection:bg-blue-500/30 font-sans">
        {/* HEADER (Mantido igual) */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 md:px-6 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-3 md:gap-4 pointer-events-auto bg-black/40 backdrop-blur-md p-1.5 pr-4 md:p-2 md:pr-6 rounded-full border border-white/5 shadow-xl mt-4 md:mt-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>

            {/* WHITE-LABEL LOGO OR AGENCY NAME */}
            <div className="flex items-center gap-3">
              {file.projects?.custom_logo_url ? (
                <img
                  src={file.projects.custom_logo_url}
                  className="h-6 w-auto max-w-[100px] object-contain hidden md:block"
                  alt="Agency Logo"
                />
              ) : (
                file.projects?.agency_name && (
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden md:block border-r border-zinc-700 pr-3 mr-1">
                    {file.projects.agency_name}
                  </span>
                )
              )}
              <div className="flex flex-col justify-center max-w-[120px] md:max-w-none">
                <h1 className="font-semibold text-xs md:text-sm text-zinc-100 leading-tight truncate">
                  {file.name}
                </h1>
                <span className="text-[9px] md:text-[10px] text-zinc-500 font-medium tracking-wide uppercase truncate">
                  {file.projects?.name}
                </span>
              </div>
            </div>
          </div>

          {/* AÇÕES DE APROVAÇÃO (DESKTOP) */}
          <div className="hidden md:flex items-center gap-2 pointer-events-auto bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-xl">
            {file.status === "approved" ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aprovado
              </div>
            ) : file.status === "rejected" ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                <RotateCcw className="h-3.5 w-3.5" />
                Ajustes Solicitados
              </div>
            ) : (
              <>
                <Button
                  onClick={() => updateFileStatus("rejected")}
                  disabled={isUpdatingStatus}
                  variant="ghost"
                  className="h-9 px-4 rounded-full text-zinc-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all text-[11px] font-bold uppercase tracking-tight"
                >
                  <RotateCcw
                    className={`h-3.5 w-3.5 mr-2 ${isUpdatingStatus ? "animate-spin" : ""
                      }`}
                  />
                  Pedir Ajustes
                </Button>
                <div className="w-px h-4 bg-zinc-800" />
                <Button
                  onClick={() => updateFileStatus("approved")}
                  disabled={isUpdatingStatus}
                  className="h-9 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 text-[11px] font-bold uppercase tracking-wider"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                  )}
                  Aprovar Design
                </Button>
              </>
            )}
          </div>

          {/* Botão Chat Mobile (Apenas Mobile) */}
          <div className="md:hidden pointer-events-auto mt-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSheetOpen(true)}
              className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-zinc-400 relative"
            >
              <MessageSquare className="h-5 w-5" />
              {comments.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-black" />
              )}
            </Button>
          </div>

          {/* Avatar Desktop (Mantido) */}
          <div className="hidden md:flex items-center gap-3 pointer-events-auto bg-black/20 backdrop-blur-md p-2 pl-6 rounded-full border border-white/5 shadow-xl">
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider">
              v1.0
            </span>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-300 font-medium">Você</span>
              <Avatar className="h-8 w-8 border border-zinc-700">
                <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-400">
                  ME
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </motion.header>

        {/* CANVAS (Mantido igual) */}
        <div
          className="flex-1 relative bg-[#050505] overflow-hidden cursor-grab active:cursor-grabbing group/canvas"
          ref={containerRef}
          onWheel={handleWheel}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.2]"
            style={{
              backgroundImage: "radial-gradient(#52525b 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#09090b]/50 to-[#09090b]" />

          <motion.div
            className="w-full h-full flex items-center justify-center p-4 md:p-20"
            drag
            dragConstraints={containerRef}
            dragElastic={0.2}
            style={{ cursor: tempPin ? "crosshair" : "grab" }}
          >
            <div
              className={`relative shadow-2xl shadow-black overflow-hidden ring-1 ring-zinc-800/50 bg-[#09090b] ${isExternalLink
                  ? "w-[90vw] md:w-[85vw] h-[75vh] md:h-[80vh] rounded-xl"
                  : "rounded-sm"
                }`}
              style={{ transform: `scale(${scale})` }}
            >
              {isExternalLink ? (
                <>
                  <iframe
                    src={getEmbedUrl(file.url)}
                    className="w-full h-full border-0 pointer-events-auto"
                    allowFullScreen
                  />
                  {/* Camada invisível para capturar cliques de pins e scroll, permitindo zoom do container */}
                  <div
                    className="absolute inset-0 z-20 cursor-crosshair"
                    onClick={handleImageClick}
                    ref={imageRef as any}
                  />
                </>
              ) : (
                <img
                  ref={imageRef}
                  src={file.url}
                  alt="Design"
                  className="max-w-[95vw] md:max-w-[80vw] max-h-[70vh] md:max-h-[75vh] select-none pointer-events-auto"
                  onClick={handleImageClick}
                  draggable={false}
                />
              )}
              <AnimatePresence>
                {comments.map(
                  (comment, idx) =>
                    comment.position_x && (
                      <motion.button
                        key={comment.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Mobile: Abre o sheet ao clicar no pin para ver o comentário
                          if (window.innerWidth < 768) {
                            setIsSheetOpen(true);
                            setActiveCommentId(comment.id);
                          } else {
                            setActiveCommentId(
                              activeCommentId === comment.id ? null : comment.id
                            );
                          }
                        }}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow-lg z-10 transition-colors
                            ${activeCommentId === comment.id
                            ? "bg-blue-600 border-white text-white z-50 ring-4 ring-blue-500/20"
                            : "bg-zinc-900 border-zinc-600 text-zinc-400 hover:bg-blue-500 hover:text-white"
                          }
                        `}
                        style={{
                          left: `${comment.position_x}%`,
                          top: `${comment.position_y}%`,
                        }}
                      >
                        {idx + 1}
                        {/* Popover (Apenas Desktop) */}
                        <div className="hidden md:block">
                          {activeCommentId === comment.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 p-4 rounded-2xl w-64 text-left shadow-2xl z-50"
                            >
                              <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                                <span className="text-xs font-bold text-zinc-200">
                                  Usuário
                                </span>
                                <span className="text-[9px] text-zinc-500 uppercase">
                                  Agora
                                </span>
                              </div>
                              <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                                {comment.content}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    )
                )}
              </AnimatePresence>
              {tempPin && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute w-4 h-4 -ml-2 -mt-2 bg-pink-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(236,72,153,0.8)] z-50 pointer-events-none"
                  style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}
                >
                  <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* DOCK CENTRAL (Mobile: Simplificado / Desktop: Completo) */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] md:max-w-2xl px-0 flex flex-col items-center gap-3">
            <AnimatePresence>
              {tempPin && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 p-2 pl-4 rounded-full shadow-2xl flex gap-2 ring-1 ring-black/50 items-center"
                >
                  <Input
                    autoFocus
                    placeholder="Escreva..."
                    className="border-0 bg-transparent focus-visible:ring-0 h-10 text-base md:text-sm text-zinc-100 placeholder:text-zinc-500 flex-1 p-0"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-blue-600 text-white shrink-0"
                    onClick={handleSendComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-zinc-500 shrink-0"
                    onClick={() => setTempPin(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dock visível apenas Desktop ou Mobile sem pin */}
            {!tempPin && (
              <motion.div
                className="flex items-center gap-2 p-1.5 md:p-2 bg-[#18181b]/90 backdrop-blur-2xl border border-white/5 rounded-full shadow-2xl shadow-black/50 ring-1 ring-black/50"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
              >
                <div className="flex items-center gap-1 px-2 border-r border-white/10 mr-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-zinc-400"
                    onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-mono w-10 text-center text-zinc-500 select-none">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-zinc-400"
                    onClick={() => setScale((s) => Math.min(s + 0.2, 4))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* Botão Timeline Desktop */}
                <div className="hidden md:block">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isSheetOpen ? "secondary" : "ghost"}
                        size="icon"
                        className={`h-10 w-10 rounded-full ${isSheetOpen
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-zinc-400"
                          }`}
                        onClick={() => setIsSheetOpen(true)}
                      >
                        <div className="relative">
                          <LayoutList className="h-5 w-5" />
                          {comments.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-[#18181b]" />
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Timeline</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  className="h-10 rounded-full px-4 md:px-5 bg-white/5 text-zinc-300 border border-white/5 ml-1 text-xs font-medium"
                  onClick={() =>
                    toast("Toque na imagem para comentar", {
                      position: "top-center",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2 text-blue-500" />{" "}
                  <span className="hidden md:inline">Novo Comentário</span>
                  <span className="md:hidden">Novo</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* SHEET / CHAT (Responsivo Mobile e Desktop) */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent
            side={window.innerWidth < 768 ? "bottom" : "right"}
            className="w-full h-[85vh] md:h-full sm:max-w-md bg-[#09090b]/95 backdrop-blur-xl border-t md:border-l border-white/10 p-0 flex flex-col shadow-2xl rounded-t-3xl md:rounded-none"
          >
            {/* Header do Sheet com Botão Fechar Mobile */}
            <SheetHeader className="p-4 md:p-5 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
              <SheetTitle className="text-zinc-100 text-base font-semibold flex items-center gap-2">
                <LayoutList className="h-4 w-4 text-blue-500" /> Timeline
                <span className="ml-2 text-[10px] font-normal text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {comments.length}
                </span>
              </SheetTitle>
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSheetOpen(false)}
                  className="h-8 w-8 -mr-2 text-zinc-400"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-0 pb-20 md:pb-0">
              {/* SEÇÃO AI INSIGHTS */}
              {comments.length > 0 && (
                <div className="p-4 border-b border-white/5 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  {!aiAnalysis && !isAnalyzing ? (
                    <Button
                      onClick={handleAnalyzeFeedback}
                      className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 text-xs font-bold uppercase tracking-wider"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                      Analisar com IA
                    </Button>
                  ) : isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center p-6 space-y-3 bg-zinc-900/40 rounded-2xl border border-zinc-800 animate-pulse">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                      <span className="text-xs text-zinc-400 font-medium tracking-tight">Destilando feedbacks...</span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#18181b]/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl overflow-hidden relative group"
                    >
                      {/* Efeito de brilho AI */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10" />

                      <div className="flex items-center justify-between mb-3 relative">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-400" />
                          <h4 className="text-sm font-bold text-white">AI Insights</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${aiAnalysis.sentiment === 'positivo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            aiAnalysis.sentiment === 'negativo' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                          }`}>
                          {aiAnalysis.sentiment}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed mb-4 font-light italic">
                        "{aiAnalysis.summary}"
                      </p>

                      <div className="space-y-2 relative">
                        {aiAnalysis.actionable_points.map((point: string, i: number) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <div className="h-4 w-4 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            </div>
                            <span className="text-[11px] text-zinc-400 leading-tight">{point}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setAiAnalysis(null)}
                        className="mt-4 w-full py-2 text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors"
                      >
                        Recarregar Análise
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 opacity-50" />
                  </div>
                  <span className="text-sm font-medium">
                    Tudo limpo por aqui!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/5">
                  {comments.map((comment, idx) => (
                    <div
                      key={comment.id}
                      className={`flex gap-4 p-5 hover:bg-white/[0.02] cursor-pointer group transition-colors ${activeCommentId === comment.id ? "bg-blue-500/5" : ""
                        }`}
                      onClick={() => {
                        setIsSheetOpen(false);
                        setActiveCommentId(comment.id);
                      }}
                    >
                      <div className="shrink-0 mt-1">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${activeCommentId === comment.id
                              ? "bg-blue-500 border-blue-400 text-white"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400"
                            }`}
                        >
                          {comment.position_x ? (
                            idx + 1
                          ) : (
                            <MessageSquare className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-300">
                            {comment.user_id === user?.id
                              ? user?.user_metadata?.full_name || "Você"
                              : members.find(
                                (m) => m.user_id === comment.user_id
                              )?.email || "Usuário"}
                          </span>
                          <span className="text-[10px] text-zinc-600">
                            {new Date(comment.created_at).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed font-light break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Reply (Fixo no fundo) */}
            <div className="p-4 border-t border-white/5 bg-[#09090b] md:bg-black/20 absolute bottom-0 left-0 right-0 md:relative">
              <form onSubmit={handleSendComment} className="relative">
                <Input
                  placeholder="Comentário geral..."
                  className="bg-zinc-900 md:bg-zinc-900/50 border-white/10 rounded-xl pr-10 text-base md:text-sm focus-visible:ring-blue-500/30 transition-all h-11 md:h-10"
                  value={!tempPin ? newComment : ""}
                  onChange={(e) => {
                    setTempPin(null);
                    setNewComment(e.target.value);
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 h-9 w-9 md:h-8 md:w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all"
                  disabled={!newComment && !tempPin}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

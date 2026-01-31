import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  X,
  MessageSquare,
  User,
  Loader2,
  MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

interface FileData {
  id: string;
  name: string;
  url: string;
  status: string;
  projects?: { name: string; custom_logo_url?: string; agency_name?: string };
}

interface CommentData {
  id: string;
  position_x: number;
  position_y: number;
  content: string;
  user_name: string;
  created_at: string;
}

export function PublicFeedback() {
  const { t } = useTranslation();
  const { fileId } = useParams();
  const [file, setFile] = useState<FileData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado do Pin Temporário
  const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [approved, setApproved] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (fileId) fetchFileAndComments();
  }, [fileId]);

  const fetchFileAndComments = async () => {
    try {
      const { data: fileData, error } = await supabase
        .from("files")
        .select("*, projects(name, custom_logo_url, agency_name)")
        .eq("id", fileId)
        .single();
      if (error) throw error;

      setFile(fileData);
      if (fileData?.projects?.name) {
        document.title = `Feedback | ${fileData.projects.name}`;
      }
      if (fileData?.status === "approved") setApproved(true);

      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: true });
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error(t("public_feedback.toast.not_found"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (
      approved ||
      file?.name.startsWith("Client_") ||
      file?.name.startsWith("Asset_")
    )
      return;
    if (!imgRef.current) return;

    // Se já tiver um pin aberto, fecha ele ou move? Vamos fechar o anterior e abrir novo.
    if (tempPin) setTempPin(null);

    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Pequeno delay para dar sensação tátil
    setTimeout(() => setTempPin({ x, y }), 50);
  };

  const saveComment = async () => {
    if (!commentText.trim() || !guestName.trim() || !tempPin) {
      if (!guestName.trim())
        toast.error(t("public_feedback.toast.name_required"));
      else toast.error(t("public_feedback.toast.comment_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          file_id: fileId,
          position_x: tempPin.x,
          position_y: tempPin.y,
          content: commentText,
          user_name: guestName,
        })
        .select()
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setTempPin(null);
      setCommentText("");
      toast.success(t("public_feedback.toast.comment_added"));
      setShowSidebar(true); // Abre a sidebar para ver o comentário novo
    } catch (error) {
      toast.error(t("public_feedback.toast.comment_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm(t("public_feedback.confirm.approve"))) return;

    const { error } = await supabase
      .from("files")
      .update({ status: "approved" })
      .eq("id", fileId);

    if (!error) {
      setApproved(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#ffffff"],
      });
      toast.success(t("public_feedback.toast.approved"));
    } else {
      toast.error(t("public_feedback.toast.approve_error"));
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  if (!file)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-500">
        {t("public_feedback.canvas.file_not_found")}
      </div>
    );

  return (
    <div className="h-screen bg-black flex flex-col text-white overflow-hidden font-sans selection:bg-blue-500/30 relative">
      {/* GLOBAL OVERLAYS */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      {/* HEADER (Minimalista) */}
      <header className="h-16 border-b border-zinc-800/50 bg-black/60 backdrop-blur-xl flex items-center px-6 justify-between z-50 sticky top-0 relative">
        <div className="flex items-center gap-4">
          {file.projects?.custom_logo_url ? (
            <img
              src={file.projects.custom_logo_url}
              alt="Logo"
              className="h-8 max-w-[120px] object-contain rounded"
            />
          ) : (
            <div className="h-8 w-8 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
              {file.projects?.agency_name ? (
                <span className="font-bold text-xs text-white">
                  {file.projects.agency_name.charAt(0).toUpperCase()}.
                </span>
              ) : (
                <span className="font-bold text-xs text-white">F.</span>
              )}
            </div>
          )}
          <div className="h-6 w-px bg-zinc-800 mx-1" />
          <div>
            <h1 className="font-medium text-sm text-zinc-200 tracking-wide">
              {file.projects?.name}
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
              {file.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className={`hidden md:flex text-zinc-400 hover:text-white ${
              showSidebar ? "bg-zinc-900" : ""
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {showSidebar
              ? t("public_feedback.header.hide_comments")
              : t("public_feedback.header.show_comments")}
            <span className="ml-2 bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          </Button>

          {approved ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-bold text-xs tracking-wider">
                {t("public_feedback.header.approved")}
              </span>
            </div>
          ) : file.name.match(/^(Asset|Assets|Client)_/i) ||
            file.name.includes("_Briefing_") ? (
            <Button
              onClick={() => window.open(file.url, "_blank")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
            >
              Baixar Arquivo
            </Button>
          ) : (
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
            >
              {t("public_feedback.header.approve_button")}
            </Button>
          )}
          <LanguageSelector />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* ÁREA DA IMAGEM (CANVAS) */}
        <div className="flex-1 bg-[#030303] relative overflow-auto flex items-center justify-center p-8 md:p-16 cursor-grab active:cursor-grabbing scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {/* Background Grid Sutil */}
          <div className="absolute inset-0 pointer-events-none bg-[size:40px_40px] bg-grid-white/[0.01]" />

          <div className="relative group inline-block shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] rounded-sm transition-transform duration-300">
            {/* MENSAGEM DE INSTRUÇÃO NO HOVER */}
            {!approved &&
              !tempPin &&
              !file.name.match(/^(Asset|Assets|Client)_/i) &&
              !file.name.includes("_Briefing_") && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 flex items-center gap-2">
                  <MousePointerClick className="h-3 w-3" />{" "}
                  {t("public_feedback.canvas.click_to_comment")}
                </div>
              )}

            <img
              ref={imgRef}
              src={file.url}
              alt="Design Preview"
              className={`max-w-full max-h-[85vh] block rounded-sm select-none ring-1 ring-zinc-800 ${
                approved ? "opacity-90 grayscale-[0.2]" : "cursor-crosshair"
              }`}
              onClick={handleImageClick}
              draggable={false}
            />

            {/* PINS RENDERIZADOS NA IMAGEM */}
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute w-8 h-8 -ml-4 -mt-4 z-30 group/pin"
                style={{ left: `${c.position_x}%`, top: `${c.position_y}%` }}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold relative z-10 cursor-pointer hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                {/* Tooltip Rápido no Hover do Pin */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] bg-black text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="font-bold text-zinc-400 block text-[10px]">
                    {c.user_name}
                  </span>
                  {c.content}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black" />
                </div>
              </motion.div>
            ))}

            {/* PIN TEMPORÁRIO (MODAL DE CRIAÇÃO) */}
            <AnimatePresence>
              {tempPin && !approved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute z-50 w-[300px]"
                  style={{
                    left: `${tempPin.x}%`,
                    top: `${tempPin.y}%`,
                    transform: "translate(-50%, 20px)",
                  }}
                >
                  {/* Ponto de origem visual */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-sm animate-pulse z-0" />

                  <div className="mt-4 bg-[#18181B] border border-zinc-700 rounded-xl shadow-2xl p-4 relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {t("public_feedback.comment_modal.title")}
                      </span>
                      <button onClick={() => setTempPin(null)}>
                        <X className="h-4 w-4 text-zinc-500 hover:text-white transition-colors" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <input
                          autoFocus
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                          placeholder={t(
                            "public_feedback.comment_modal.name_placeholder",
                          )}
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                      <textarea
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all"
                        placeholder={t(
                          "public_feedback.comment_modal.comment_placeholder",
                        )}
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.metaKey) saveComment();
                        }} // Cmd+Enter envia
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-500 text-white h-8 px-4 text-xs font-medium"
                          onClick={saveComment}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            t("public_feedback.comment_modal.submit_button")
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* SIDEBAR DE COMENTÁRIOS */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#050505] border-l border-zinc-800 flex flex-col shrink-0 z-40 absolute md:relative right-0 h-full shadow-2xl md:shadow-none"
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
                <h3 className="font-semibold text-sm text-zinc-200">
                  {t("public_feedback.sidebar.title")}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 bg-[#050505]">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                      <MessageSquare className="h-5 w-5 opacity-50" />
                    </div>
                    <p className="text-xs text-center px-4">
                      Clique em qualquer lugar na imagem para deixar um
                      comentário.
                    </p>
                  </div>
                ) : (
                  comments.map((c, i) => (
                    <div
                      key={c.id}
                      className="group bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-zinc-300">
                              {c.user_name}
                            </span>
                            <span className="text-[10px] text-zinc-600">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed font-light">
                            {c.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

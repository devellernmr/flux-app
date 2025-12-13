import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export function PublicFeedback() {
  const { fileId } = useParams();
  const [file, setFile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
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
        .select("*, projects(name)")
        .eq("id", fileId)
        .single();
      if (error) throw error;

      setFile(fileData);
      if (fileData?.status === "approved") setApproved(true);

      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: true });
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error("Design not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (approved) return;
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
        toast.error("Please enter your name so we know who you are.");
      else toast.error("Please write a comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          file_id: fileId,
          x: tempPin.x,
          y: tempPin.y,
          text: commentText,
          user_name: guestName,
        })
        .select()
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setTempPin(null);
      setCommentText("");
      toast.success("Feedback added!");
      setShowSidebar(true); // Abre a sidebar para ver o comentário novo
    } catch (error) {
      toast.error("Error saving comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this design?")) return;

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
      toast.success("Design Approved! 🎉");
    } else {
      toast.error("Error approving design");
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
        File not found.
      </div>
    );

  return (
    <div className="h-screen bg-[#050505] flex flex-col text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* HEADER (Minimalista) */}
      <header className="h-16 border-b border-zinc-800 bg-[#050505]/80 backdrop-blur-md flex items-center px-6 justify-between z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center">
            <span className="font-bold text-xs text-white">F.</span>
          </div>
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
            {showSidebar ? "Hide Comments" : "Show Comments"}
            <span className="ml-2 bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full">
              {comments.length}
            </span>
          </Button>

          {approved ? (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-bold text-xs tracking-wider">APPROVED</span>
            </div>
          ) : (
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
            >
              Approve Design
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* ÁREA DA IMAGEM (CANVAS) */}
        <div className="flex-1 bg-[#0A0A0A] relative overflow-auto flex items-center justify-center p-8 md:p-16 cursor-grab active:cursor-grabbing scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {/* Background Grid Sutil */}
          <div className="absolute inset-0 pointer-events-none bg-[size:20px_20px] bg-grid-zinc-800/[0.05]" />

          <div className="relative group inline-block shadow-2xl shadow-black/50 rounded-sm transition-transform duration-300">
            {/* MENSAGEM DE INSTRUÇÃO NO HOVER */}
            {!approved && !tempPin && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 flex items-center gap-2">
                <MousePointerClick className="h-3 w-3" /> Click anywhere to
                comment
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
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold relative z-10 cursor-pointer hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                {/* Tooltip Rápido no Hover do Pin */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] bg-black text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-50">
                  <span className="font-bold text-zinc-400 block text-[10px]">
                    {c.user_name}
                  </span>
                  {c.text}
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
                        New Comment
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
                          placeholder="Your Name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                      </div>
                      <textarea
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all"
                        placeholder="What would you like to change?"
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
                            "Post Comment"
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
                  Feedback List
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
                      Click anywhere on the image to leave a comment.
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
                          <p className="text-sm text-zinc-400 leading-relaxed">
                            {c.text}
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

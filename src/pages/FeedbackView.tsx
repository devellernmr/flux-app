import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, Send, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

export function FeedbackView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);
  const [user, setUser] = useState<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchData();

    // Realtime para novos comentários
    const channel = supabase
      .channel("file-comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `file_id=eq.${fileId}`,
        },
        (payload) => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fileId]);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    // Busca o arquivo
    const { data: fileData } = await supabase
      .from("files")
      .select("*, projects(name)")
      .eq("id", fileId)
      .single();
    setFile(fileData);

    fetchComments();
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("file_id", fileId)
      .order("created_at", { ascending: true });
    setComments(data || []);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPin({ x, y });
  };

  const handleSendComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim()) return;

    console.log("Enviando comentário...", {
      fileId,
      userId: user.id,
      newComment,
      tempPin,
    });

    // INSERT CORRETO (Compatível com a nova tabela)
    const { error } = await supabase.from("comments").insert({
      file_id: fileId,
      user_id: user.id,
      content: newComment, // Nome correto: content
      position_x: tempPin?.x || null, // Nome correto: position_x
      position_y: tempPin?.y || null, // Nome correto: position_y
    });

    if (error) {
      console.error("Erro Supabase:", error);
      toast.error("Erro ao comentar: " + error.message);
    } else {
      setNewComment("");
      setTempPin(null);
      fetchComments();
      toast.success("Comentário adicionado!");
    }
  };

  if (!file)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        Carregando...
      </div>
    );

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-white">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </Button>
          <div>
            <h1 className="font-bold text-sm">{file.name}</h1>
            <p className="text-xs text-slate-500">{file.projects?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-500/20">
            <MousePointer2 className="h-3 w-3" />
            Clique na imagem para comentar
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Área da Imagem (Canvas) */}
        <div
          className="flex-1 bg-[#0F172A] relative overflow-auto flex items-center justify-center p-8 cursor-crosshair"
          onClick={() => setTempPin(null)}
        >
          <div
            className="relative shadow-2xl shadow-black/50 group"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              ref={imageRef}
              src={file.url}
              className="max-h-[85vh] max-w-full rounded-lg border border-slate-800 select-none"
              onClick={handleImageClick}
              alt="Design"
            />

            {/* PINS EXISTENTES (Renderização corrigida) */}
            {comments.map(
              (comment, index) =>
                comment.position_x && (
                  <div
                    key={comment.id}
                    className="absolute w-8 h-8 -ml-4 -mt-4 bg-blue-600 text-white rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
                    style={{
                      left: `${comment.position_x}%`,
                      top: `${comment.position_y}%`,
                    }}
                  >
                    {index + 1}
                  </div>
                )
            )}

            {/* PIN TEMPORÁRIO */}
            {tempPin && (
              <div
                className="absolute w-8 h-8 -ml-4 -mt-4 bg-pink-600 text-white rounded-full border-2 border-white flex items-center justify-center animate-bounce z-20 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
                style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}
              >
                <PlusIcon />
              </div>
            )}
          </div>

          {/* INPUT FLUTUANTE */}
          {tempPin && (
            <div
              className="absolute z-50 bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-2xl w-72 animate-in zoom-in-95 duration-200"
              style={{
                left: `calc(50% - 144px)`,
                bottom: "10%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">
                Novo Comentário
              </p>
              <form onSubmit={handleSendComment} className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="O que precisa ajustar?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-slate-950 border-slate-800 focus-visible:ring-pink-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar de Comentários */}
        <aside className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-950/50">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              Feedback ({comments.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 && (
              <div className="text-center text-slate-500 py-10 text-sm">
                Nenhum comentário ainda.
                <br />
                Clique na imagem para começar.
              </div>
            )}
            {comments.map((comment, index) => (
              <div key={comment.id} className="flex gap-3 group">
                <div className="shrink-0 mt-1">
                  {comment.position_x ? (
                    <div className="w-6 h-6 bg-slate-800 text-blue-400 rounded-full border border-slate-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-slate-800 rounded-full" />
                  )}
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 w-full group-hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-300">
                      Usuário
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(comment.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Geral */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/30">
            <form onSubmit={handleSendComment} className="flex gap-2">
              <Input
                placeholder="Comentário geral..."
                value={!tempPin ? newComment : ""}
                onChange={(e) => {
                  setTempPin(null);
                  setNewComment(e.target.value);
                }}
                className="bg-slate-950 border-slate-800"
              />
              <Button type="submit" size="icon" variant="secondary">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

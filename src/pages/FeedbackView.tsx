import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, X, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export function FeedbackView() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (fileId) fetchFileAndComments();
  }, [fileId]);

  const fetchFileAndComments = async () => {
    // Pega o arquivo
    const { data: fileData } = await supabase
      .from("files")
      .select("*, projects(name)")
      .eq("id", fileId)
      .single();
    setFile(fileData);

    if (fileId) {
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: true }); // Ordem cronológica
      setComments(commentsData || []);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;

    // Calcula posição em % para ser responsivo
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPin({ x, y });
  };

  const saveComment = async () => {
    if (!commentText.trim() || !tempPin) return;

    try {
      // Salva no Supabase
      const { data, error } = await supabase
        .from("comments")
        .insert({
          file_id: fileId,
          x: tempPin.x,
          y: tempPin.y,
          text: commentText,
          user_name: "Designer", // Depois pegaremos do user auth
        })
        .select()
        .single();

      if (error) throw error;

      // Adiciona na tela imediatamente
      setComments([...comments, data]);
      setTempPin(null);
      setCommentText("");
      toast.success("Feedback pinned!");
    } catch (error) {
      toast.error("Error saving comment");
    }

    // Aqui depois vamos salvar no Supabase
  };

  if (!file)
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="h-screen bg-[#050505] flex flex-col text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-[#020617] z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            className="bg-white text-slate-900 hover:bg-slate-200"
            onClick={() => {
              const link = `${window.location.origin}/share/design/${fileId}`;
              navigator.clipboard.writeText(link);
              toast.success("Public link copied!");
            }}
          >
            Share Link
          </Button>
          <div>
            <h1 className="font-medium text-sm">{file.name}</h1>
            <p className="text-xs text-slate-500">{file.projects?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MessageSquare className="h-4 w-4" /> Click anywhere to comment
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-[#0F1216] relative cursor-crosshair p-10">
        <div className="relative inline-block shadow-2xl">
          <img
            ref={imgRef}
            src={file.url}
            alt="Design"
            className="max-w-full max-h-[85vh] rounded-sm select-none"
            onClick={handleImageClick}
          />

          {/* Pins Existentes */}
          {comments.map((c) => (
            <div
              key={c.id}
              className="absolute w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:z-50"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <span className="text-xs font-bold">
                {comments.indexOf(c) + 1}
              </span>

              {/* Tooltip do Comentário */}
              <div className="absolute left-full top-0 ml-2 w-64 bg-white text-slate-900 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
                <p className="text-sm font-medium mb-1">Comment</p>
                <p className="text-sm text-slate-600">{c.text}</p>
              </div>
            </div>
          ))}

          {/* Novo Pin (Sendo criado) */}
          {tempPin && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50"
              style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}
            >
              <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white shadow-lg animate-pulse mb-2 mx-auto"></div>

              {/* Caixa de Texto */}
              <div className="bg-white text-slate-900 p-3 rounded-lg shadow-xl w-72">
                <textarea
                  autoFocus
                  className="w-full text-sm p-2 border border-slate-200 rounded resize-none focus:outline-none focus:border-blue-500"
                  placeholder="What should be changed?"
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTempPin(null)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveComment}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Pin
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

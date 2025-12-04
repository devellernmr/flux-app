import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import confetti from "canvas-confetti"; // Vamos instalar isso já já

export function PublicFeedback() {
  const { fileId } = useParams();
  const [file, setFile] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [tempPin, setTempPin] = useState<{x: number, y: number} | null>(null);
  const [commentText, setCommentText] = useState("");
  const [guestName, setGuestName] = useState(""); // Nome do cliente
  const [approved, setApproved] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (fileId) fetchFileAndComments();
  }, [fileId]);

  const fetchFileAndComments = async () => {
    const { data: fileData } = await supabase.from('files').select('*, projects(name)').eq('id', fileId).single();
    setFile(fileData);
    if (fileData?.status === 'approved') setApproved(true);

    const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: true });
    setComments(commentsData || []);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (approved) return; // Não permite comentar se já aprovou
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTempPin({ x, y });
  };

  const saveComment = async () => {
    if (!commentText.trim() || !guestName.trim() || !tempPin) {
        if (!guestName.trim()) toast.error("Please enter your name");
        return;
    }

    const { data, error } = await supabase.from('comments').insert({
        file_id: fileId,
        x: tempPin.x,
        y: tempPin.y,
        text: commentText,
        user_name: guestName // Salva o nome do cliente
    }).select().single();

    if (!error) {
        setComments([...comments, data]);
        setTempPin(null);
        setCommentText("");
        toast.success("Feedback sent!");
    }
  };

  const handleApprove = async () => {
    // 1. Atualiza status no banco (precisamos criar essa coluna 'status' na tabela files se não existir)
    // Por enquanto vamos salvar num campo metadata ou apenas simular visualmente se não tiver a coluna.
    // Vamos assumir que vamos criar a coluna 'status' na tabela 'files' no próximo passo.
    
    /* 
       -- SQL Necessário: 
       alter table files add column status text default 'pending'; 
       create policy "Public can update files" on files for update using (true);
    */

    const { error } = await supabase.from('files').update({ status: 'approved' }).eq('id', fileId);
    
    if (!error) {
        setApproved(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        toast.success("Design Approved! 🎉");
    } else {
        toast.error("Error approving design");
    }
  };

  if (!file) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white">Loading Design...</div>;

  return (
    <div className="h-screen bg-[#050505] flex flex-col text-white overflow-hidden font-sans">
      {/* Header Público */}
      <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-[#020617] z-50 shadow-md">
        <div className="flex items-center gap-3">
           <div className="bg-slate-800 p-2 rounded text-xs font-bold text-slate-300">FLUXO</div>
           <div>
             <h1 className="font-semibold text-sm text-white">{file.projects?.name}</h1>
             <p className="text-xs text-slate-500">{file.name}</p>
           </div>
        </div>
        
        <div>
            {approved ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-950/30 px-4 py-2 rounded-full border border-green-900">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-bold text-sm">APPROVED</span>
                </div>
            ) : (
                <Button 
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 shadow-[0_0_15px_rgba(22,163,74,0.5)] transition-all hover:scale-105"
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Design
                </Button>
            )}
        </div>
      </header>

      {/* Área da Imagem */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-[#0F1216] relative cursor-crosshair p-10">
         <div className="relative inline-block shadow-2xl">
            <img 
                ref={imgRef}
                src={file.url} 
                alt="Design" 
                className={`max-w-full max-h-[80vh] rounded-sm select-none transition-all ${approved ? 'opacity-80 grayscale-[0.3]' : ''}`}
                onClick={handleImageClick}
            />
            
            {/* Pins */}
            {comments.map((c) => (
                <div key={c.id} className="absolute w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left: `${c.x}%`, top: `${c.y}%` }}>
                    <span className="text-xs font-bold">{comments.indexOf(c) + 1}</span>
                    <div className="absolute left-full top-0 ml-2 w-64 bg-white text-slate-900 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">{c.user_name}</p>
                        <p className="text-sm text-slate-800">{c.text}</p>
                    </div>
                </div>
            ))}

            {/* Novo Comentário (Modal Flutuante) */}
            {tempPin && !approved && (
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50" style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}>
                    <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white shadow-lg animate-pulse mb-2 mx-auto"></div>
                    <div className="bg-white text-slate-900 p-4 rounded-lg shadow-2xl w-72 border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Add Comment</h3>
                        
                        {/* Input Nome */}
                        <div className="flex items-center gap-2 mb-2 bg-slate-100 p-2 rounded border border-slate-200">
                            <User className="h-4 w-4 text-slate-400" />
                            <input 
                                className="bg-transparent text-sm w-full focus:outline-none" 
                                placeholder="Your Name" 
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                            />
                        </div>

                        <textarea 
                            autoFocus
                            className="w-full text-sm p-2 border border-slate-200 rounded resize-none focus:outline-none focus:border-blue-500 mb-2"
                            placeholder="What should be changed?"
                            rows={2}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setTempPin(null)} className="h-7 text-xs">Cancel</Button>
                            <Button size="sm" onClick={saveComment} className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">Send</Button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
}

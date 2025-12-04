import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback,  } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

interface ActivityItem {
  id: number;
  text: string;
  user_name: string;
  created_at: string;
  files: {
    name: string;
  };
}

export function ProjectActivity({ projectId }: { projectId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    fetchActivity();
    setupRealtime();
  }, [projectId]);

  const fetchActivity = async () => {
    // Busca comentários de TODOS os arquivos deste projeto
    // O truque é usar o !inner para filtrar pela tabela relacionada
    const { data, error } = await supabase
      .from('comments')
      .select('*, files!inner(project_id, name)')
      .eq('files.project_id', projectId)
      .order('created_at', { ascending: false }) // Mais recentes no topo
      .limit(20);

    if (data) setActivities(data as any);
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('project-activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          // Quando entra um comentário novo, recarregamos a lista
          // (Poderíamos otimizar pra checar se é desse projeto, mas fetch é rápido)
          fetchActivity(); 
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 border-l border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          Atividade Recente
        </h3>
        <p className="text-xs text-slate-500">Histórico de comentários e feedbacks</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-center text-xs text-slate-600 mt-10">Nenhuma atividade ainda.</p>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="flex gap-3 relative group">
                {/* Linha vertical conectando (estilo timeline) */}
                <div className="absolute left-[14px] top-8 bottom-[-24px] w-[1px] bg-slate-800 group-last:hidden"></div>

                <Avatar className="h-7 w-7 border border-slate-700">
                  <AvatarFallback className="bg-slate-800 text-[10px] text-slate-300">
                    {item.user_name?.slice(0, 2).toUpperCase() || "CL"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-200">{item.user_name || "Cliente"}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div className="bg-slate-800 p-2 rounded-lg rounded-tl-none border border-slate-700/50">
                    <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 pl-1">
                    em <span className="text-blue-400">{item.files?.name}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

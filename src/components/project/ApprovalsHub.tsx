import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  RotateCcw,
  Clock,
  ExternalLink,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FileData {
  id: string;
  name: string;
  url: string;
  status: "approved" | "pending" | "rejected";
  created_at: string;
}

export function ApprovalsHub({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FileData["status"] | "all">("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();

    const channel = supabase
      .channel(`approvals-hub-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files",
          filter: `project_id=eq.${projectId}`,
        },
        () => fetchFiles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error("Erro ao buscar arquivos:", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: files.length,
    approved: files.filter((f) => f.status === "approved").length,
    pending: files.filter((f) => f.status === "pending").length,
    rejected: files.filter((f) => f.status === "rejected").length,
  };

  const filteredFiles =
    filter === "all" ? files : files.filter((f) => f.status === filter);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div id="project-approvals-hub" className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Central de Aprovações
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Gerencie e acompanhe o status de cada entrega.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === s
                  ? "bg-zinc-800 text-white shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "all"
                ? "Todos"
                : s === "pending"
                ? "Pendentes"
                : s === "approved"
                ? "Aprovados"
                : "Ajustes"}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Search, color: "zinc" },
          {
            label: "Pendentes",
            value: stats.pending,
            icon: Clock,
            color: "amber",
          },
          {
            label: "Aprovados",
            value: stats.approved,
            icon: CheckCircle2,
            color: "emerald",
          },
          {
            label: "Com Ajustes",
            value: stats.rejected,
            icon: RotateCcw,
            color: "rose",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`h-4 w-4 text-${item.color}-500`} />
              <span
                className={`text-[10px] font-bold text-${item.color}-500 uppercase tracking-widest`}
              >
                {item.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{item.value}</div>
          </div>
        ))}
      </div>

      {/* LISTA DE ARQUIVOS */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Design / Entrega
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-zinc-600 text-sm"
                  >
                    Nenhum arquivo encontrado com este status.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-zinc-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 overflow-hidden">
                          {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={file.url}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                          ) : (
                            <ExternalLink className="h-4 w-4 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {new Date(file.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                            file.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : file.status === "rejected"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {file.status === "approved"
                            ? "Aprovado"
                            : file.status === "rejected"
                            ? "Com Ajustes"
                            : "Pendente"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/feedback/${file.id}`)}
                        className="h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        Ver Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

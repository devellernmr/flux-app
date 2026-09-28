import { Link } from "react-router-dom";
import { Folder, Trash2, ArrowUpRight, Clock, Users, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectListProps {
  projects: any[];
  onDelete: (project: any) => void;
  onNewProject?: () => void;
}

export function ProjectList({ projects, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden border border-white/10 rounded-[36px] min-h-[360px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-2xl shadow-blue-500/10 mb-2">
            <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Nenhum fluxo criado ainda
          </h3>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Organize briefings, aprove entregas e centralize a comunicação com seus clientes em um único lugar.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group h-full"
        >
          <Link to={`/project/${project.id}`} className="block h-full">
            <div className="h-full relative bg-[#080808] border border-white/10 hover:border-blue-500/40 rounded-[32px] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col backdrop-blur-md">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 blur-[60px] group-hover:bg-blue-500/15 transition-all duration-500" />

              {/* Card Header */}
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-3.5">
                  {project.custom_logo_url ? (
                    <div className="h-12 w-12 bg-zinc-900/90 border border-white/10 rounded-2xl p-1.5 flex items-center justify-center group-hover:border-blue-500/40 transition-colors shadow-lg overflow-hidden">
                      <img
                        src={project.custom_logo_url}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all text-zinc-300 shadow-xl group-hover:bg-blue-500/10">
                      <Folder className="h-5 w-5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    {project.category && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-[0.1em] font-black">
                        {project.category}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      {format(new Date(project.created_at), "d 'de' MMM", {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(project);
                  }}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Title & Description */}
              <div className="flex-1 space-y-2 relative z-10">
                <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors leading-snug">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                    </span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      {project.status === "done" ? "Concluído" : "Ativo"}
                    </span>
                  </div>

                  {project.due_date && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(project.due_date), "dd/MM")}
                    </div>
                  )}

                  {project.member_count > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold">
                      <Users className="h-2.5 w-2.5" />
                      {project.member_count}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-white px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <span>Abrir</span>
                  <ArrowUpRight className="h-3 w-3 text-blue-400" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

import { Link } from "react-router-dom";
import { Folder, Trash2, Grid, ArrowUpRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Variants removed in favor of direct animation props for stability

interface ProjectListProps {
  projects: any[];
  onDelete: (project: any) => void;
}

export function ProjectList({ projects, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-dashed border-zinc-800 rounded-[32px] h-80 flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/10 backdrop-blur-sm"
      >
        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50 mb-4">
          <Grid className="h-8 w-8 opacity-20" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest opacity-40">Nenhum fluxo encontrado</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
    >
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group h-full"
        >
          <Link to={`/project/${project.id}`} className="block h-full">
            <div className="h-full relative bg-zinc-900/30 border border-zinc-800/80 hover:border-blue-500/40 rounded-[32px] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">

              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] group-hover:bg-blue-500/10 transition-colors" />

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all duration-300 text-zinc-500 shadow-xl group-hover:bg-blue-500/5">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    {project.category && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-[0.1em] font-black">
                        {project.category}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold group-hover:text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {format(new Date(project.created_at), "d 'de' MMM", { locale: ptBR })}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(project);
                  }}
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-black text-white group-hover:text-blue-50 transition-colors leading-tight mb-2">
                  {project.name}
                </h3>
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    </span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-emerald-500/80 transition-colors">Ativo</span>
                  </div>

                  {project.isShared && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <Users className="h-3 w-3 text-zinc-500" />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">Colab.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-black text-white px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shadow-2xl">
                  LOG <ArrowUpRight className="h-3 w-3 text-blue-500" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

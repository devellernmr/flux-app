import { Link } from "react-router-dom";
import { Folder, Trash2, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- VARIANTES DE ANIMAÇÃO ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface ProjectListProps {
  projects: any[];
  onDelete: (project: any) => void;
}

export function ProjectList({ projects, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-zinc-800 rounded-2xl h-64 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20">
        <Grid className="h-10 w-10 mb-3 opacity-20" />
        <p>Nenhum projeto encontrado.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={itemVariants}>
          <Link to={`/project/${project.id}`}>
            <div className="group relative bg-zinc-900/20 border border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/60 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center group-hover:border-blue-500/30 group-hover:text-blue-500 transition-colors duration-300 text-zinc-500 shadow-sm">
                  <Folder className="h-5 w-5" />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(project);
                    }}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h3 className="font-medium text-zinc-200 group-hover:text-white truncate mb-1 pr-4 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-zinc-500">
                Atualizado há{" "}
                {format(new Date(project.created_at), "d 'de' MMM", {
                  locale: ptBR,
                })}
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                  Ativo
                </span>
                <span className="text-zinc-600 group-hover:text-blue-400 transition-colors font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300">
                  Abrir <span className="text-[10px]">→</span>
                </span>
                <h3 className="font-medium text-zinc-200 group-hover:text-white truncate mb-1 pr-4 transition-colors flex items-center gap-2">
                  {project.isShared && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/40 whitespace-nowrap">
                      Em equipe
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

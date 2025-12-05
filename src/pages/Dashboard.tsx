import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Folder,
  LogOut,
  Settings,
  Loader2,
  Trash2,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIGURAÇÕES VISUAIS REFINADAS (Ethereal) ---
const SPINE_LENGTH = 40; // Mais longa para ser mais elegante
const SPINE_SPACING = 6; // Segmentos mais próximos para suavidade
const RIB_WIDTH_SCALE = 2.0; // Um pouco mais fina
// Cores mais sofisticadas (Sky Blue / Cyan)
// const COLOR_CORE = "rgba(224, 242, 254, 0.8)"; // Branco azulado
// const COLOR_GLOW = "rgba(14, 165, 233, 0.4)"; // Sky Blue suave

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setProjects(data);
      }
    };
    fetchData();
  }, []);

  // --- ENGINE GRÁFICA: ETHEREAL SERPENT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let spine: { x: number; y: number }[] = [];
    for (let i = 0; i < SPINE_LENGTH; i++) {
      spine.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const animate = () => {
      if (!ctx || !canvas) return;

      // Limpeza com transparência total a cada frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Física da Cabeça (Lerp suave)
      const head = spine[0];
      head.x += (mouseRef.current.x - head.x) * 0.12; // Um pouco mais lenta para elegância
      head.y += (mouseRef.current.y - head.y) * 0.12;

      // Cinemática Inversa (Corpo)
      for (let i = 1; i < spine.length; i++) {
        const prev = spine[i - 1];
        const curr = spine[i];
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        const angle = Math.atan2(dy, dx);
        const targetX = prev.x - Math.cos(angle) * SPINE_SPACING;
        const targetY = prev.y - Math.sin(angle) * SPINE_SPACING;
        curr.x += (targetX - curr.x) * 0.5;
        curr.y += (targetY - curr.y) * 0.5;
      }

      // --- RENDERIZAÇÃO SUTIL ---
      // Configuração de Glow Global (Bloom)
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(14, 165, 233, 0.3)";
      ctx.lineCap = "round";

      // 1. Desenhar Costelas (Ribs) com Gradiente
      for (let i = 1; i < spine.length - 1; i++) {
        const prev = spine[i - 1];
        const curr = spine[i];
        const next = spine[i + 1];

        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const angle = Math.atan2(dy, dx);

        // Tamanho baseado em seno para formato orgânico (fino nas pontas, gordo no meio)
        const size =
          Math.sin((i / SPINE_LENGTH) * Math.PI) *
          (SPINE_SPACING * RIB_WIDTH_SCALE);

        const rx1 = curr.x + Math.cos(angle - Math.PI / 2) * size;
        const ry1 = curr.y + Math.sin(angle - Math.PI / 2) * size;
        const rx2 = curr.x + Math.cos(angle + Math.PI / 2) * size;
        const ry2 = curr.y + Math.sin(angle + Math.PI / 2) * size;

        // O TRUQUE DA SUTILEZA: Gradiente Linear na Costela
        // Transparente nas pontas, cor no meio.
        const gradient = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
        gradient.addColorStop(0, "rgba(14, 165, 233, 0)"); // Ponta transparente
        // O meio fica mais transparente conforme chega na cauda (fade out)
        const opacity = 0.6 * (1 - i / SPINE_LENGTH);
        gradient.addColorStop(0.5, `rgba(14, 165, 233, ${opacity})`);
        gradient.addColorStop(1, "rgba(14, 165, 233, 0)"); // Ponta transparente

        ctx.beginPath();
        ctx.moveTo(rx1, ry1);
        ctx.lineTo(rx2, ry2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5; // Linha fina e elegante
        ctx.stroke();
      }

      // 2. Desenhar Espinha Dorsal (Linha central finíssima)
      ctx.beginPath();
      ctx.moveTo(spine[0].x, spine[0].y);
      for (let i = 1; i < spine.length; i++) {
        const xc = (spine[i].x + spine[i - 1].x) / 2;
        const yc = (spine[i].y + spine[i - 1].y) / 2;
        ctx.quadraticCurveTo(spine[i - 1].x, spine[i - 1].y, xc, yc);
      }
      // Muito sutil, quase invisível, só pra conectar visualmente
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 3. Cabeça (Halo de Energia)
      const headX = spine[0].x;
      const headY = spine[0].y;

      // Halo externo (Glow)
      const glowGradient = ctx.createRadialGradient(
        headX,
        headY,
        0,
        headX,
        headY,
        15
      );
      glowGradient.addColorStop(0, "rgba(56, 189, 248, 0.3)");
      glowGradient.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(headX, headY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo (Pequeno ponto brilhante)
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(headX, headY, 2, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - left, y: e.clientY - top };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ name: newProjectName, owner_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setProjects([data, ...projects]);
      setIsNewProjectOpen(false);
      setNewProjectName("");
      toast.success("Projeto criado!");
    } catch (error: any) {
      toast.error("Erro", { description: error.message });
    } finally {
      setIsCreating(false);
    }
  };
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);
      if (error) throw error;
      toast.success("Excluído.");
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (error: any) {
      toast.error("Erro.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex font-sans overflow-x-hidden selection:bg-blue-500/30 relative">
      {/* --- MENU MOBILE --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-[#020617] border-r border-slate-800 z-50 p-6 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="h-8 font-bold text-xl text-blue-500 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> FLUXO.
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-slate-400" />
                </Button>
              </div>
              <NavLinks />
              <UserInfo user={user} handleLogout={handleLogout} mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR DESKTOP --- */}
      <aside className="w-64 bg-[#020617] border-r border-slate-800 hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-8 font-bold text-xl text-blue-500 tracking-widest flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-blue-400" /> FLUXO.
          </motion.div>
        </div>
        <NavLinks />
        <UserInfo user={user} handleLogout={handleLogout} />
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main
        className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#020617] group"
        onMouseMove={handleMouseMove}
      >
        {/* --- LAYER 1: GRID ESTÁTICO SUTIL --- */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
            backgroundSize: "32px 32px", // Grid um pouco menor para mais detalhe
            maskImage:
              "radial-gradient(ellipse at center, black 50%, transparent 100%)",
          }}
        />

        {/* --- LAYER 2: ETHEREAL SERPENT (CANVAS) --- */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0"
          style={{ mixBlendMode: "screen" }} // Importante para o brilho funcionar bem
        />

        {/* Header Mobile */}
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-slate-300" />
          </Button>
          <div className="font-bold text-blue-500 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> FLUXO.
          </div>
          <Avatar className="h-8 w-8 border border-slate-700">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-slate-800 text-xs">
              {user?.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-700 z-10 relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                  Projetos
                </h1>
                <motion.p className="text-slate-400">
                  Gerencie seus trabalhos e feedbacks
                </motion.p>
              </motion.div>

              <Dialog
                open={isNewProjectOpen}
                onOpenChange={setIsNewProjectOpen}
              >
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative overflow-hidden rounded-md"
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-900/20 w-full md:w-auto relative z-10">
                      <Plus className="mr-2 h-4 w-4" /> Novo Projeto
                    </Button>
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "linear",
                        repeatDelay: 1,
                      }}
                      className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    />
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Criar Projeto</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nome do Projeto</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Landing Page Cliente X"
                        className="bg-slate-950 border-slate-800 focus-visible:ring-blue-500"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsNewProjectOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={isCreating}
                      className="bg-blue-600 text-white"
                    >
                      {isCreating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}{" "}
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* MODAL DE EXCLUSÃO */}
            <Dialog
              open={!!projectToDelete}
              onOpenChange={(open) => !open && setProjectToDelete(null)}
            >
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <DialogTitle className="text-center">
                    Excluir projeto?
                  </DialogTitle>
                  <DialogDescription className="text-center text-slate-400">
                    Isso apagará tudo de{" "}
                    <strong>{projectToDelete?.name}</strong> permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => setProjectToDelete(null)}
                    className="w-full hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Sim, excluir"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* GRID DE PROJETOS */}
            {projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="border border-dashed border-slate-800 rounded-xl h-80 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 relative overflow-hidden backdrop-blur-sm z-10 shadow-2xl"
              >
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                  }}
                  className="bg-slate-900/80 p-6 rounded-full mb-4 border border-slate-800 shadow-xl relative z-10"
                >
                  <Folder className="h-10 w-10 text-slate-600" />
                </motion.div>
                <p className="font-medium text-slate-400 relative z-10">
                  Nenhum projeto encontrado.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                <AnimatePresence mode="popLayout">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        type: "spring",
                        bounce: 0.4,
                      }}
                      layout
                    >
                      <Link to={`/project/${project.id}`}>
                        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden relative h-full hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1">
                          <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-x-0 md:translate-x-4 md:group-hover:translate-x-0">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8 bg-slate-950/80 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-800"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setProjectToDelete(project);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="h-36 bg-gradient-to-b from-slate-900 to-slate-950 w-full flex items-center justify-center border-b border-slate-800 group-hover:from-blue-950/30 group-hover:to-slate-900 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                              <Folder className="h-12 w-12 text-slate-700 group-hover:text-blue-500 transition-colors duration-300" />
                            </motion.div>
                          </div>
                          <CardHeader className="p-5">
                            <CardTitle className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                              {project.name}
                            </CardTitle>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse"></span>
                              Ativo • Criado em{" "}
                              {new Date(
                                project.created_at
                              ).toLocaleDateString()}
                            </p>
                          </CardHeader>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLinks() {
  return (
    <nav className="flex-1 px-4 space-y-3 mt-8">
      <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          className="w-full justify-start text-blue-400 bg-blue-950/20 font-medium border-l-2 border-blue-500 rounded-r-lg rounded-l-none pl-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-500/10 translate-x-[-100%] animate-[shimmer_2s_infinite] opacity-0 hover:opacity-100 transition-opacity" />
          <Folder className="mr-3 h-5 w-5" /> Projetos
        </Button>
      </motion.div>
      <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors pl-4"
        >
          <Settings className="mr-3 h-5 w-5" /> Configurações
        </Button>
      </motion.div>
    </nav>
  );
}

function UserInfo({ user, handleLogout, mobile }: any) {
  return (
    <div className={`p-4 border-t border-slate-800 ${mobile ? "mt-auto" : ""}`}>
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-10 w-10 border border-slate-700 ring-2 ring-slate-800">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">
            {user?.email?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate text-slate-200">
            {user?.user_metadata?.full_name || "Usuário"}
          </p>
          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
            <span className="text-blue-500">★</span> Plano Pro
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-slate-700 bg-slate-900/50 text-slate-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/50 transition-all"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </div>
  );
}

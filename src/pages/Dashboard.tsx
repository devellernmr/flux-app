import { useState, useEffect } from "react";
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
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Folder, LogOut, Settings, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Estados de Criação
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Estados de Exclusão (Novo)
  const [projectToDelete, setProjectToDelete] = useState<any>(null); // Guarda o objeto do projeto
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
      toast.success("Projeto criado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao criar projeto", { description: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  // 1. Abre o Modal de Confirmação
  const confirmDelete = (e: React.MouseEvent, project: any) => {
      e.preventDefault();
      e.stopPropagation();
      setProjectToDelete(project);
  };

  // 2. Executa a Exclusão Real
  const executeDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
        const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
        
        if (error) throw error;

        toast.success("Projeto excluído permanentemente.");
        setProjects(projects.filter(p => p.id !== projectToDelete.id));
        setProjectToDelete(null); // Fecha o modal
    } catch (error: any) {
        console.error(error);
        toast.error("Erro ao excluir.", { description: "Verifique se há arquivos vinculados." });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#020617] border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6">
          <div className="h-8 w-auto font-bold text-xl text-blue-500">FLUXO.</div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-blue-500 bg-blue-950/20 font-medium">
            <Folder className="mr-2 h-4 w-4" /> Projects
          </Button>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-slate-800 text-slate-300">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-slate-200">{user?.user_metadata?.full_name || "Usuário"}</p>
              <p className="text-xs text-slate-500 truncate">Free Plan</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" onClick={handleLogout}>
            <LogOut className="mr-2 h-3 w-3" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
            <p className="text-slate-400">Manage your design feedbacks</p>
          </div>

          {/* Modal de Criação */}
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-900/20">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-300">Project Name</Label>
                  <Input id="name" placeholder="Ex: Landing Page Client X" className="bg-slate-950 border-slate-800 text-white focus:ring-blue-600" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsNewProjectOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                <Button onClick={handleCreateProject} disabled={isCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {/* MODAL DE EXCLUSÃO (PERIGOSO) */}
        <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <DialogTitle className="text-center text-xl">Excluir projeto?</DialogTitle>
                    <DialogDescription className="text-center text-slate-400 pt-2">
                        Você está prestes a excluir <strong>{projectToDelete?.name}</strong>. <br/>
                        Essa ação é irreversível e excluirá todos os arquivos e comentários.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:justify-center mt-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => setProjectToDelete(null)} 
                        className="w-full border border-slate-700 hover:bg-slate-800"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={executeDelete} 
                        disabled={isDeleting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, excluir projeto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Grid de Projetos */}
        {projects.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl h-96 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20">
            <div className="bg-slate-900 p-4 rounded-full mb-4 border border-slate-800">
              <Folder className="h-8 w-8 text-slate-600" />
            </div>
            <p className="font-medium text-slate-400">No projects found.</p>
            <Button variant="outline" className="border-slate-700 text-blue-400 hover:text-blue-300 hover:bg-slate-900 mt-4" onClick={() => setIsNewProjectOpen(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id}>
                <Card className="bg-slate-900 border-slate-800 hover:border-blue-600/50 transition-all cursor-pointer group overflow-hidden relative">
                  
                  {/* BOTÃO DE DELETAR (TRIGGER) */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 bg-slate-950/80 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-800 hover:border-red-500 transition-all backdrop-blur-sm"
                        onClick={(e) => confirmDelete(e, project)}
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>

                  <div className="h-32 bg-slate-950 w-full flex items-center justify-center border-b border-slate-800">
                    <Folder className="h-10 w-10 text-slate-700 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold text-white truncate">{project.name}</CardTitle>
                    <p className="text-xs text-slate-500">Created {new Date(project.created_at).toLocaleDateString()}</p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

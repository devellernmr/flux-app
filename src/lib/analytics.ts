import { supabase } from "@/lib/supabase";

export interface AnalyticsStats {
  activeProjects: number;
  totalFiles: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  approvalRate: number;
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
    completed?: number;
    pending?: number;
}

export async function getAnalyticsStats(userId: string): Promise<AnalyticsStats> {
  // 1. Get all projects where user is owner
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, status")
    .eq("owner_id", userId)
    .neq("status", "archived"); 

  if (projectsError) throw projectsError;

  const activeProjects = projects?.length || 0;
  
  if(activeProjects === 0) {
      return {
          activeProjects: 0,
          totalFiles: 0,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          approvalRate: 0
      }
  }

  const projectIds = projects.map(p => p.id);

  // 2. Get all files for these projects
  const { data: files, error: filesError } = await supabase
    .from("files")
    .select("status")
    .in("project_id", projectIds);

  if (filesError) throw filesError;

  const totalFiles = files?.length || 0;
  const approvedCount = files?.filter(f => f.status === 'approved').length || 0;
  const pendingCount = files?.filter(f => f.status === 'pending').length || 0;
  const rejectedCount = files?.filter(f => f.status === 'rejected').length || 0;
  
  const approvalRate = totalFiles > 0 ? Math.round((approvedCount / totalFiles) * 100) : 0;

  return {
    activeProjects,
    totalFiles,
    approvedCount,
    pendingCount,
    rejectedCount,
    approvalRate
  };
}

export async function getUploadsHistory(userId: string) {
    // Busca arquivos criados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: files } = await supabase
        .from("files")
        .select("created_at, projects!inner(owner_id)") // project!inner filtra
        .eq("projects.owner_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

    // Agrupar por dia (dd/MM)
    const grouped: Record<string, number> = {};
    
    // Inicializa últimos 30 dias com 0
    for(let i=0; i<30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29-i)); // Começa 30 dias atrás até hoje
        const key = d.getDate().toString().padStart(2, '0'); // Apenas o dia
        grouped[key] = 0;
    }

    files?.forEach(f => {
        const d = new Date(f.created_at);
        const key = d.getDate().toString().padStart(2, '0');
        if(grouped[key] !== undefined) grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, uploads]) => ({ name, uploads }));
}

export async function getProjectPerformance(userId: string) {
    const { data: projects } = await supabase
        .from("projects")
        .select("id, name, files(status)")
        .eq("owner_id", userId)
        .neq("status", "archived")
        .limit(5); // Top 5
    
    if(!projects) return [];
  
    return projects.map(p => {
        const files = (p.files as { status: string }[]) || [];
        const completed = files.filter(f => f.status === 'approved').length;
        const pending = files.filter(f => f.status === 'pending' || f.status === 'rejected').length;
  
        return {
            name: p.name,
            completed,
            pending
        }
    });
}

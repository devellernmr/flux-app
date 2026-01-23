import { supabase } from "@/lib/supabase";

export interface AnalyticsStats {
    activeProjects: number;
    totalFiles: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    approvalRate: number;
    totalBudget: number;
    totalExpenses: number;
    estimatedProfit: number;
    avgMargin: number;
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
    completed?: number;
    pending?: number;
}

function getDateThreshold(range: string): Date {
    const date = new Date();
    switch (range) {
        case '7d':
            date.setDate(date.getDate() - 7);
            break;
        case '90d':
            date.setDate(date.getDate() - 90);
            break;
        case '30d':
        default:
            date.setDate(date.getDate() - 30);
            break;
    }
    return date;
}

export async function getAnalyticsStats(userId: string, range: string = '30d'): Promise<AnalyticsStats> {
    const startDate = getDateThreshold(range).toISOString();

    // 1. Get projects (active) - We filter by created_at or updated_at to show relevant activity?
    // For "Active Projects" count, we usually just want *current* active projects regardless of date.
    // However, for financial metrics (Pipeline, Profit), let's show ALL active projects to give a full picture,
    // OR filtering by creation date? 
    // Usually "Analytics" with a date filter implies "data generated within this period".
    // Let's filter PROJECTS by created_at for the "Pipeline generated" metric.

    // For KPI consistency:
    // "Projetos Ativos" -> currently active (all time)
    // "Arquivos Enviados" -> created >= startDate
    // "Financeiro" -> associated with projects created >= startDate OR all active? 
    // Let's go with ALL Active Projects for the "Active Projects" count, but filter FILES for file metrics.

    // Fetch ALL active projects first for the baseline "Active Projects" count and Finance (usually represents total active pipeline)
    const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, status, budget, expenses, created_at")
        .eq("user_id", userId)
        .neq("status", "archived");

    if (projectsError) throw projectsError;

    // Filter for finance metrics based on date range? Or keep total?
    // User expectation for "30d": "What new business did I generate?" (Projects created) OR "What is my total run rate?"
    // Let's separate: 
    // - Active Projects = Total Active (snapshot)
    // - New Projects = Created in range
    // - Files = Created in range

    // For now, to keep existing metrics logic but bounded by date where it makes sense (Files):

    const activeProjects = projects?.length || 0;

    if (activeProjects === 0) {
        return {
            activeProjects: 0,
            totalFiles: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0,
            approvalRate: 0,
            totalBudget: 0,
            totalExpenses: 0,
            estimatedProfit: 0,
            avgMargin: 0
        }
    }

    const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
    const totalExpenses = projects.reduce((acc, p) => acc + (Number(p.expenses) || 0), 0);
    const estimatedProfit = totalBudget - totalExpenses;
    const avgMargin = totalBudget > 0 ? (estimatedProfit / totalBudget) * 100 : 0;

    // 2. Get files for these projects, FILTERED by date range
    const { data: files, error: filesError } = await supabase
        .from("files")
        .select(`
        *,
        project:projects (
          id,
          name,
          budget,
          expenses,
          created_at
        )
      `)
        .eq("project.user_id", userId) // Filter by user_id through the join? No, RLS handles it, but better explicit
        .gte("created_at", startDate);

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
        approvalRate,
        totalBudget, // Showing TOTAL pipeline (all active projects) regardless of date range is usually safer for "Active Projects" view
        totalExpenses,
        estimatedProfit,
        avgMargin
    };
}

export async function getUploadsHistory(userId: string, range: string = '30d') {
    const startDate = getDateThreshold(range);
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;

    const { data: files } = await supabase
        .from("files")
        .select("created_at, projects!inner(user_id)")
        .eq("projects.user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

    // Ensure we have a point for every day/interval
    const grouped: Record<string, number> = {};

    // Create skeleton
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - ((days - 1) - i));

        let key = "";
        if (range === '90d') {
            // For 90d, maybe group by week or just show less pervasive ticks?
            // Keeping DD/MM format is fine, Recharts handles many points okay or we can format later.
            // Let's use simpler DD/MM
            key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
            key = d.getDate().toString().padStart(2, '0');
        }

        // Use full date key for uniqueness if needed, but for now simple day is okay for 30d
        if (range === '90d') {
            // For 90 days, collisions on "Day number" happen (e.g. 1st of Jan, 1st of Feb).
            // MUST use Month/Day combination.
        } else {
            // For 7d/30d, Day number is sufficient usually, but Month/Day is safer.
            key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        }

        grouped[key] = 0;
    }

    files?.forEach(f => {
        const d = new Date(f.created_at);
        const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (grouped[key] !== undefined) grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped).map(([name, uploads]) => ({ name, uploads }));
}

export async function getProjectPerformance(userId: string, range: string = '30d') {
    // Top 5 projects with most activity in the range?
    // Or just Top 5 active projects?
    // Let's stick to "All Active Projects" performance but filtered file counts by date?
    // Or just keep it simple: Top 5 Active Projects, counting ALL their files?
    // The prompt implies "7d/30d/90d" filter. Let's filter the file counts by date.

    const startDate = getDateThreshold(range).toISOString();

    // Actually, simple .select("..., files(...)") returns all files unless we filter inside.
    // The .gte("files.created_at"...) filters the PARENT rows if no files match (inner join behavior).
    // Better strategy: Fetch projects, then manually filter files in JS. 
    // Since we limit to Top 5, manual filtering is fine for scale.

    const { data: allProjects } = await supabase
        .from("projects")
        .select("id, name, files(status, created_at)")
        .eq("user_id", userId)
        .neq("status", "archived");

    if (!allProjects) return [];

    const processed = allProjects.map(p => {
        const files = (p.files as { status: string, created_at: string }[]) || [];
        // Filter files by range
        const validFiles = files.filter(f => f.created_at >= startDate);

        const completed = validFiles.filter(f => f.status === 'approved').length;
        const pending = validFiles.filter(f => f.status === 'pending' || f.status === 'rejected').length;

        return {
            name: p.name,
            completed,
            pending,
            total: completed + pending
        }
    });

    // Sort by total activity and take top 5
    return processed
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(({ name, completed, pending }) => ({ name, completed, pending }));
}

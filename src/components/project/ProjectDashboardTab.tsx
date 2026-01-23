import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Layout,
    CheckCircle2,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { ProjectRoadmap } from "@/pages/ProjectRoadmap";
// import { startProjectTour } from "@/components/dashboard/TourGuide";
import type { Project } from "@/types";

interface ProjectDashboardTabProps {
    project: Project | null;
    briefingStatus: any;
    pendingApprovalsCount: number;
    setActiveTab: (tab: string) => void;
    projectStatus: "active" | "paused" | "done" | "archived";
    milestones?: { label: string; desc: string }[];
}

export const ProjectDashboardTab = memo(({
    project,
    briefingStatus,
    pendingApprovalsCount,
    setActiveTab,
    projectStatus,
    milestones,
}: ProjectDashboardTabProps) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    id="project-dash-card-deadline"
                    className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                            <Calendar className="h-5 w-5 text-blue-400" />
                        </div>
                        <Badge
                            variant="outline"
                            className="text-[10px] border-zinc-800 text-zinc-500 uppercase tracking-widest"
                        >
                            Prazo
                        </Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                            Entrega Prevista
                        </p>
                        <h3 className="text-2xl font-bold text-white tabular-nums">
                            {project?.due_date
                                ? format(new Date(project.due_date), "dd/MM")
                                : "--/--"}
                        </h3>
                    </div>
                </div>

                <div
                    id="project-dash-card-briefing"
                    onClick={() => setActiveTab("briefing")}
                    className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 cursor-pointer hover:border-zinc-700 transition-all"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                            <Layout className="h-5 w-5 text-emerald-400" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-700" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                            Briefing
                        </p>
                        <h3 className="text-xl font-bold text-white capitalize">
                            {briefingStatus ? briefingStatus.replace("_", " ") : "Carregando..."}
                        </h3>
                    </div>
                </div>

                <div
                    id="project-dash-card-approvals"
                    onClick={() => setActiveTab("approvals")}
                    className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-40 cursor-pointer hover:border-zinc-700 transition-all"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                        </div>
                        <Badge
                            variant="outline"
                            className="text-[10px] border-zinc-800 text-amber-500 bg-amber-500/5"
                        >
                            {pendingApprovalsCount}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                            Aprovações
                        </p>
                        <h3 className="text-xl font-bold text-white">
                            {pendingApprovalsCount} Pendentes
                        </h3>
                    </div>
                </div>

                {/* TUTORIAL CARD */}
                <div
                    id="project-dash-card-help"
                    // onClick={() => startProjectTour(setActiveTab)} // TODO: Integrar novo sistema
                    className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl flex flex-col justify-between h-40 cursor-pointer hover:bg-blue-600/10 hover:border-blue-500/40 transition-all group"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/20 group-hover:bg-blue-600/20 transition-colors">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-blue-500/50" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest mb-1.5">
                            Tutorial & Suporte
                        </p>
                        <h3 className="text-xl font-bold text-white">
                            Guia do Fluxo 🎯
                        </h3>
                    </div>
                </div>
            </div>
            <ProjectRoadmap
                briefingStatus={briefingStatus}
                projectStatus={projectStatus}
                milestones={milestones}
            />
        </div>
    );
});

ProjectDashboardTab.displayName = "ProjectDashboardTab";

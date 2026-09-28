import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Layout,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { ProjectRoadmap } from "@/pages/ProjectRoadmap";
import { useTutorial } from "@/components/tutorial/TutorialContext";
import type { Project } from "@/types";

interface ProjectDashboardTabProps {
  project: Project | null;
  briefingStatus: any;
  pendingApprovalsCount: number;
  setActiveTab: (tab: string) => void;
  projectStatus: "active" | "paused" | "done" | "archived";
  milestones?: { label: string; desc: string }[];
}

export const ProjectDashboardTab = memo(
  ({
    project,
    briefingStatus,
    pendingApprovalsCount,
    setActiveTab,
    projectStatus,
    milestones,
  }: ProjectDashboardTabProps) => {
    const { startTutorial } = useTutorial();
    const { t } = useTranslation();

    const isBriefingApproved = briefingStatus === "approved";
    const isBriefingPending = briefingStatus === "sent" || briefingStatus === "in_review";

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* 1. Deadline Card */}
          <div
            id="project-dash-card-deadline"
            className="relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-white/10 p-6 rounded-[28px] flex flex-col justify-between h-44 shadow-xl backdrop-blur-md group hover:border-blue-500/40 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold border-white/10 text-zinc-400 uppercase tracking-widest bg-white/5"
              >
                {t("project_dashboard.deadline_label")}
              </Badge>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                {t("project_dashboard.expected_delivery")}
              </p>
              <h3 className="text-2xl font-black text-white tabular-nums tracking-tight">
                {project?.due_date
                  ? format(new Date(project.due_date), "dd/MM/yyyy")
                  : "Não definido"}
              </h3>
            </div>
          </div>

          {/* 2. Briefing Card */}
          <div
            id="project-dash-card-briefing"
            onClick={() => setActiveTab("briefing")}
            className="relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-white/10 p-6 rounded-[28px] flex flex-col justify-between h-44 cursor-pointer hover:border-emerald-500/40 transition-all duration-300 shadow-xl backdrop-blur-md group hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Layout className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold group-hover:text-emerald-400 transition-colors">
                <span>Ver Briefing</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    isBriefingApproved
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      : isBriefingPending
                        ? "bg-amber-400 animate-pulse"
                        : "bg-zinc-500"
                  }`}
                />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t("project_dashboard.briefing_label")}
                </p>
              </div>
              <h3 className="text-xl font-black text-white capitalize tracking-tight">
                {briefingStatus
                  ? briefingStatus.replace("_", " ")
                  : t("common.loading")}
              </h3>
            </div>
          </div>

          {/* 3. Approvals Card */}
          <div
            id="project-dash-card-approvals"
            onClick={() => setActiveTab("approvals")}
            className="relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-white/10 p-6 rounded-[28px] flex flex-col justify-between h-44 cursor-pointer hover:border-amber-500/40 transition-all duration-300 shadow-xl backdrop-blur-md group hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  pendingApprovalsCount > 0
                    ? "border-amber-500/30 text-amber-400 bg-amber-500/10 animate-pulse"
                    : "border-white/10 text-zinc-400 bg-white/5"
                }`}
              >
                {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pendente` : "Em dia"}
              </Badge>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                {t("project_dashboard.approvals_label")}
              </p>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-between">
                <span>
                  {pendingApprovalsCount} {t("project_dashboard.pending")}
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </h3>
            </div>
          </div>

          {/* 4. Tutorial & Support Card */}
          <div
            id="project-dash-card-help"
            onClick={() => startTutorial("project")}
            className="relative overflow-hidden bg-gradient-to-b from-blue-950/30 to-zinc-950/80 border border-blue-500/20 p-6 rounded-[28px] flex flex-col justify-between h-44 cursor-pointer hover:border-blue-500/50 transition-all duration-300 shadow-xl backdrop-blur-md group hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-blue-400/60 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider mb-1">
                {t("project_dashboard.tutorial_support_label")}
              </p>
              <h3 className="text-xl font-black text-white tracking-tight">
                {t("project_dashboard.fluxs_guide")}
              </h3>
            </div>
          </div>
        </div>

        {/* Roadmap section */}
        <ProjectRoadmap
          briefingStatus={briefingStatus}
          projectStatus={projectStatus}
          milestones={milestones}
        />
      </div>
    );
  },
);

ProjectDashboardTab.displayName = "ProjectDashboardTab";

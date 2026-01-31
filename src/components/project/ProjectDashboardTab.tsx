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
                {t("project_dashboard.deadline_label")}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                {t("project_dashboard.expected_delivery")}
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
                {t("project_dashboard.briefing_label")}
              </p>
              <h3 className="text-xl font-bold text-white capitalize">
                {briefingStatus
                  ? briefingStatus.replace("_", " ")
                  : t("common.loading")}
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
                {t("project_dashboard.approvals_label")}
              </p>
              <h3 className="text-xl font-bold text-white">
                {pendingApprovalsCount} {t("project_dashboard.pending")}
              </h3>
            </div>
          </div>

          {/* TUTORIAL CARD */}
          <div
            id="project-dash-card-help"
            onClick={() => startTutorial("project")}
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
                {t("project_dashboard.tutorial_support_label")}
              </p>
              <h3 className="text-xl font-bold text-white">
                {t("project_dashboard.fluxs_guide")}
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
  },
);

ProjectDashboardTab.displayName = "ProjectDashboardTab";

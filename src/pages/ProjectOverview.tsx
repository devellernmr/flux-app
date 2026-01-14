import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Folder,
  Loader2,
  Sparkles,
  ArrowLeft,
  Layout,
  Menu,
  X,
  Settings,
  LogOut,
  MessageSquare,
  ChevronRight,
  Calendar,
  MoreVertical,
  Share2,
  LayoutDashboard,
  Users,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { BrandKitTab } from "@/components/project/BrandKitTab";
import { ApprovalsHub } from "@/components/project/ApprovalsHub";
import { NotificationSystem } from "@/components/NotificationSystem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { startProjectTour } from "@/components/dashboard/TourGuide";
import { format } from "date-fns";
import { ProjectFiles } from "./ProjectFiles";
import { ProjectActivity } from "@/components/ProjectActivity";
import { ProjectRoadmap } from "./ProjectRoadmap";

import { TeamManager } from "@/components/TeamManager";
import { BriefingTab } from "@/components/project/BriefingTab";
import { SettingsModal } from "@/components/project/SettingsModal";
import { BRIEFING_TEMPLATES } from "@/lib/templates";
import type { BriefingBlock } from "@/lib/templates";
import type { Project, User } from "@/types";
// --- TIPAGEM E TEMPLATES ---

type MemberColor = "blue" | "pink" | "emerald" | "amber" | "violet";

const MEMBER_COLORS: MemberColor[] = [
  "blue",
  "pink",
  "emerald",
  "amber",
  "violet",
];

export function getDefaultColor(email: string): MemberColor {
  const hash = email.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return MEMBER_COLORS[hash % MEMBER_COLORS.length];
}

export const colorMap: Record<MemberColor, { bg: string; ring: string }> = {
  blue: { bg: "bg-blue-500/20", ring: "ring-blue-500/50" },
  pink: { bg: "bg-pink-500/20", ring: "ring-pink-500/50" },
  emerald: { bg: "bg-emerald-500/20", ring: "ring-emerald-500/50" },
  amber: { bg: "bg-amber-500/20", ring: "ring-amber-500/50" },
  violet: { bg: "bg-violet-500/20", ring: "ring-violet-500/50" },
};

export function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // States para abas e modals
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileActivityOpen, setIsMobileActivityOpen] = useState(false);

  // Briefing
  const [blocks, setBlocks] = useState<BriefingBlock[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingBriefing, setIsSavingBriefing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [briefingStatus, setBriefingStatus] = useState<
    | "empty"
    | "active"
    | "awaiting_response"
    | "sent"
    | "approved"
    | "completed"
    | "draft"
  >("empty");

  // Configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState<
    "active" | "paused" | "done" | "archived"
  >("active");
  const [projectDueDate, setProjectDueDate] = useState<string>("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [archiving] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>("");
  const [agencyName, setAgencyName] = useState<string>("");

  const fetchPendingCount = useCallback(async () => {
    if (!id) return;
    const { count } = await supabase
      .from("files")
      .select("*", { count: "exact", head: true })
      .eq("project_id", Number(id))
      .eq("status", "pending");
    setPendingApprovalsCount(count || 0);
  }, [id]);

  // 1. USEEFFECT PRINCIPAL E REALTIME
  useEffect(() => {
    const checkTutorial = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && !user.user_metadata?.has_seen_project_tour) {
        // Small delay to ensure elements are mounted
        setTimeout(() => startProjectTour(setActiveTab), 1000);
      }
    };
    checkTutorial();

    const fetchData = async () => {
      if (!id) return;

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser as any);

      if (authUser && id) {
        const { data: proj } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (proj) {
          setProject(proj);
          setProjectName(proj.name || "");
          setProjectDescription(proj.description || "");
          setProjectStatus((proj.status || "active") as any);
          setProjectDueDate(
            proj.due_date ? proj.due_date.substring(0, 10) : ""
          );
          setCustomLogoUrl(proj.custom_logo_url || "");
          setAgencyName(proj.agency_name || "");

          const { data: brief } = await supabase
            .from("briefings")
            .select("*")
            .eq("project_id", Number(id))
            .maybeSingle();

          if (brief) {
            setBriefingStatus(brief.status as any);
            if (brief.content && brief.content.length > 0) {
              setBlocks(brief.content);
            }
          }
        }
      }
      setLoading(false);
      fetchPendingCount();
    };

    fetchData();

    const filesChannel = supabase
      .channel("files-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "files",
          filter: `project_id=eq.${id}`,
        },
        () => fetchPendingCount()
      )
      .subscribe();

    const projectChannel = supabase
      .channel(`project-overview-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.new) {
            const proj = payload.new as Project;
            setProject(proj);
            setProjectName(proj.name || "");
            setProjectDescription(proj.description || "");
            setProjectStatus((proj.status || "active") as any);
            setProjectDueDate(
              proj.due_date ? proj.due_date.substring(0, 10) : ""
            );
            setCustomLogoUrl(proj.custom_logo_url || "");
            setAgencyName(proj.agency_name || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(filesChannel);
      supabase.removeChannel(projectChannel);
    };
  }, [id, fetchPendingCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const useTemplate = (templateName: string) => {
    // @ts-ignore
    const template = BRIEFING_TEMPLATES[templateName];
    if (!template) return;

    const newBlocks = template.blocks.map((b: BriefingBlock) => ({
      ...b,
      id: Date.now().toString() + Math.random(),
    }));
    setBlocks(newBlocks);
    setIsEditing(true);
  };

  const updateBlock = (i: number, field: keyof BriefingBlock, value: any) => {
    const newBlocks = [...blocks];
    newBlocks[i] = { ...newBlocks[i], [field]: value };
    setBlocks(newBlocks);
  };

  const removeBlock = (i: number) =>
    setBlocks(blocks.filter((_, x) => x !== i));

  const addBlock = (block?: BriefingBlock) =>
    setBlocks([
      ...blocks,
      block || {
        id: Date.now().toString(),
        type: "text",
        label: "",
        placeholder: "",
      },
    ]);

  const saveBriefing = async () => {
    if (!id) return;
    const projectIdNumber = Number(id);
    setIsSavingBriefing(true);
    try {
      const { data: existingBrief } = await supabase
        .from("briefings")
        .select("id")
        .eq("project_id", projectIdNumber)
        .maybeSingle();
      const payload = {
        project_id: projectIdNumber,
        content: blocks,
        status: "awaiting_response",
        template_type: "custom",
      };
      if (existingBrief?.id) {
        await supabase
          .from("briefings")
          .update(payload)
          .eq("id", existingBrief.id);
      } else {
        await supabase.from("briefings").insert(payload);
      }
      toast.success("Briefing Salvo!");
      setBriefingStatus("awaiting_response");
      setIsEditing(false);
    } catch (err: any) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSavingBriefing(false);
    }
  };

  const copyLink = async () => {
    const { data } = await supabase
      .from("briefings")
      .select("id")
      .eq("project_id", Number(id))
      .single();
    if (data) {
      navigator.clipboard.writeText(
        `${window.location.origin}/share/${data.id}`
      );
      toast.success("Link copiado!");
    } else toast.error("Salve o briefing primeiro.");
  };

  const saveProjectSettings = async () => {
    if (!id) return;
    try {
      setSavingSettings(true);
      const isoDate = projectDueDate
        ? new Date(projectDueDate + "T12:00:00").toISOString()
        : null;
      await supabase
        .from("projects")
        .update({
          name: projectName,
          description: projectDescription,
          status: projectStatus,
          due_date: isoDate,
          custom_logo_url: customLogoUrl,
          agency_name: agencyName,
        })
        .eq("id", id);
      toast.success("Configurações atualizadas!");
      setProject((prev: any) => ({
        ...prev,
        name: projectName,
        description: projectDescription,
        status: projectStatus,
        due_date: isoDate,
        custom_logo_url: customLogoUrl,
        agency_name: agencyName,
      }));
      setIsSettingsOpen(false);
    } catch (err: any) {
      toast.error("Erro ao salvar.");
    } finally {
      setSavingSettings(false);
    }
  };

  const archiveProject = async () => {
    if (!id) return;
    try {
      await supabase
        .from("projects")
        .update({ status: "archived" })
        .eq("id", id);
      navigate("/dashboard");
    } catch (err) {
      toast.error("Erro ao arquivar.");
    }
  };

  const confirmReset = async () => {
    await supabase.from("briefings").delete().eq("project_id", Number(id));
    setBlocks([]);
    setBriefingStatus("empty");
    setIsEditing(false);
    setShowResetDialog(false);
    toast.success("Resetado!");
  };

  const toggleActivity = () => {
    if (window.innerWidth >= 1280) setIsActivityOpen(!isActivityOpen);
    else setIsMobileActivityOpen(true);
  };

  // Nav Components
  const NavLinks = () => (
    <nav className="flex-1 px-4 mt-6">
      <Link to="/dashboard">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 px-2 transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Voltar para Projetos</span>
        </button>
      </Link>
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 font-mono">
            Projeto
          </p>
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "briefing", label: "Briefing", icon: Layout },
            { id: "identidade", label: "Identidade", icon: Palette },
            { id: "approvals", label: "Aprovações", icon: CheckCircle2 },
            { id: "files", label: "Arquivos", icon: Folder },
            { id: "members", label: "Membros", icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              id={`project-tab-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-zinc-900 text-white shadow-sm border border-zinc-800"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <item.icon
                className={`h-4 w-4 ${
                  activeTab === item.id ? "text-blue-500" : ""
                }`}
              />
              {item.label}
              {item.id === "approvals" && pendingApprovalsCount > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* HELP BUTTON */}
      <div className="mt-8 pt-6 border-t border-zinc-900/50">
        <button
          id="project-sidebar-help-btn"
          onClick={() => startProjectTour(setActiveTab)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors group"
        >
          <div className="w-5 h-5 rounded-full border border-zinc-700 group-hover:border-blue-500/50 flex items-center justify-center text-[10px] font-bold">
            ?
          </div>
          <span>Tutorial do Projeto</span>
        </button>
      </div>
    </nav>
  );

  const UserProfileFooter = () => (
    <div className="p-4 border-t border-zinc-900 mt-auto">
      <div className="bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/50 flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-zinc-800">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-zinc-800 text-xs">
            {user?.email?.substring(0, 2).toUpperCase() || "US"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden min-w-0">
          <p className="text-sm font-medium truncate text-zinc-200">
            {user?.user_metadata?.full_name || "Usuário"}
          </p>
          <p className="text-[10px] text-zinc-500 truncate">Plano Pro</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex font-sans overflow-hidden selection:bg-blue-500/30 relative">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-zinc-800/[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 z-40 md:hidden backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-[#050505] border-r border-zinc-900 z-50 flex flex-col md:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Logo"
                      className="h-8 max-w-[120px] object-contain rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Sparkles className="h-4 w-4 text-blue-500" /> FLUXO.
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </Button>
              </div>
              <NavLinks />
              <UserProfileFooter />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileActivityOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileActivityOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 xl:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-zinc-900 z-50 flex flex-col xl:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Logo"
                      className="h-6 max-w-[80px] object-contain rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Sparkles className="h-4 w-4 text-blue-500" /> FLUXO.
                    </div>
                  )}
                  <span className="font-semibold text-white ml-2">
                    Atividade
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileActivityOpen(false)}
                >
                  <X className="h-5 w-5 text-zinc-500" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden p-4 bg-[#050505]">
                {id ? <ProjectActivity projectId={id} /> : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <aside className="w-72 bg-[#050505] border-r border-zinc-900 hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2.5 px-2">
            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="Logo"
                className="h-8 max-w-[120px] object-contain rounded"
              />
            ) : (
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="h-4 w-4 text-blue-500" /> FLUXO.
              </div>
            )}
          </div>
        </div>
        <NavLinks />
        <UserProfileFooter />
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-16 md:h-20 border-b border-zinc-900 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-zinc-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-col gap-0.5">
              <div className="hidden xs:flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                <span>Projetos</span>{" "}
                <ChevronRight className="h-3 w-3 text-zinc-700" />{" "}
                <span className="text-blue-500">Detalhes</span>
              </div>
              <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight truncate max-w-[200px] md:max-w-xl">
                {projectName || "Projeto"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationSystem />
            <div className="h-6 w-px bg-zinc-900 mx-1 hidden md:block" />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActivity}
              className={`text-zinc-400 transition-colors relative ${
                isActivityOpen ? "bg-zinc-900/50" : ""
              }`}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#0A0A0A] border-zinc-800 text-zinc-300"
              >
                <DropdownMenuLabel>Opções do Projeto</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
                  <Share2 className="mr-2 h-4 w-4" /> Link do Briefing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsSettingsOpen(true)}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" /> Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <div className="p-2 text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Entrega:{" "}
                  {project?.due_date
                    ? format(new Date(project.due_date), "dd/MM")
                    : "S/D"}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#030303]">
          <div className="max-w-[1600px] mx-auto flex gap-10 h-full">
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <div
                    key="dash"
                    className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
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
                            {briefingStatus.replace("_", " ")}
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
                        onClick={() => startProjectTour(setActiveTab)}
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
                    />
                  </div>
                )}

                {activeTab === "briefing" && (
                  <div key="brief" className="h-full">
                    <BriefingTab
                      briefingStatus={briefingStatus}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      blocks={blocks}
                      onUpdateBlock={updateBlock}
                      onRemoveBlock={removeBlock}
                      onAddBlock={addBlock}
                      onSave={saveBriefing}
                      isSaving={isSavingBriefing}
                      onLoadTemplate={useTemplate}
                      onCopyLink={copyLink}
                      onApprove={() => {
                        /* Logic to approve briefing if needed, or maybe it's just a status update */
                        setBriefingStatus("approved");
                      }}
                      onOpenResetDialog={() => setShowResetDialog(true)}
                      containerVariants={{}}
                      itemVariants={{}}
                    />
                  </div>
                )}
                {activeTab === "identidade" && (
                  <div key="brand">
                    <BrandKitTab projectId={id || ""} />
                  </div>
                )}
                {activeTab === "files" && (
                  <div key="files">
                    <ProjectFiles projectId={id || ""} />
                  </div>
                )}
                {activeTab === "approvals" && (
                  <div key="approvals">
                    <ApprovalsHub projectId={id || ""} />
                  </div>
                )}
                {activeTab === "members" && (
                  <div key="members">
                    <TeamManager projectId={id || ""} />
                  </div>
                )}
                {activeTab === "chat" && (
                  <div key="chat" className="h-[calc(100vh-200px)]">
                    <ProjectActivity projectId={id || ""} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isActivityOpen && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="hidden xl:block shrink-0 h-[calc(100vh-120px)] sticky top-28"
                >
                  <div className="h-full pl-8 border-l border-zinc-800/50">
                    <div className="flex items-center justify-between mb-6 px-1 text-zinc-500">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">
                          Atividade
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsActivityOpen(false)}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="h-[calc(100%-40px)] rounded-xl overflow-hidden ring-1 ring-zinc-800/50 bg-[#050505]">
                      <ProjectActivity projectId={id!} />
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        projectName={projectName}
        setProjectName={setProjectName}
        projectDescription={projectDescription}
        setProjectDescription={setProjectDescription}
        projectStatus={projectStatus}
        setProjectStatus={setProjectStatus}
        projectDueDate={projectDueDate}
        setProjectDueDate={setProjectDueDate}
        onSave={saveProjectSettings}
        isSaving={savingSettings}
        onArchive={archiveProject}
        isArchiving={archiving}
        customLogoUrl={customLogoUrl}
        setCustomLogoUrl={setCustomLogoUrl}
        agencyName={agencyName}
        setAgencyName={setAgencyName}
      />

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="bg-[#0A0A0A] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Resetar?</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Isso apagará tudo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowResetDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Resetar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

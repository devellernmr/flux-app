import { useState, useEffect, useCallback } from "react";
import { supabase, getFunctionUrl } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import type { Project, User } from "@/types";

export function useDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // --- TRAVAS DO PLANO ---
    const { plan, usage, can, loading: planLoading, refreshPlan } = usePlan();
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState("");

    // PROJECT STATES
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectCategory, setNewProjectCategory] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // UI STATES
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("projects");
    const [isRedirectingPortal, setIsRedirectingPortal] = useState(false);

    // SETTINGS STATES
    const [settingsName, setSettingsName] = useState("");
    const [settingsAvatar, setSettingsAvatar] = useState("");
    const [settingsFigmaToken, setSettingsFigmaToken] = useState("");
    const [settingsAgencyName, setSettingsAgencyName] = useState("");
    const [settingsPrimaryColor, setSettingsPrimaryColor] = useState("#3b82f6");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [aiBriefing, setAiBriefing] = useState<string>("");

    const fetchData = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            setSettingsName(user.user_metadata?.full_name || "");
            setSettingsAvatar(user.user_metadata?.avatar_url || "");
            setSettingsFigmaToken(user.user_metadata?.figma_token || "");
            setSettingsAgencyName(user.user_metadata?.agency_name || "");
            setSettingsPrimaryColor(user.user_metadata?.primary_color || "#3b82f6");

            // Buscar Projetos
            const { data: ownProjects, error: ownError } = await supabase
                .from("projects")
                .select("*, team_members(count)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (ownError) console.error(ownError);

            const { data: memberRows, error: memberError } = await supabase
                .from("team_members")
                .select("project:projects(*)")
                .eq("user_id", user.id);

            if (memberError) console.error(memberError);

            const memberProjects =
                memberRows?.map((row: any) => row.project).filter(Boolean) ?? [];

            const allProjectsMap = new Map<string, any>();

            (ownProjects ?? []).forEach((p: any) => {
                const memberCount = p.team_members?.[0]?.count || 0;
                allProjectsMap.set(p.id, { ...p, member_count: memberCount });
            });

            memberProjects.forEach((p: any) => {
                // Para projetos compartilhados, não temos o count direto aqui, 
                // mas podemos assumir que se o usuário é membro, tem pelo menos 1
                allProjectsMap.set(p.id, { ...p, member_count: p.member_count || 1 });
            });

            const allProjects = Array.from(allProjectsMap.values())
                .map((p: any) => ({
                    ...p,
                    isShared: p.user_id !== user.id,
                }))
                .sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );

            setProjects(allProjects);
        }
        setIsInitialLoading(false);
    }, []);

    useEffect(() => {
        fetchData();

        if (location.state?.activeMenu) {
            setActiveMenu(location.state.activeMenu);
        }

        const channel = supabase
            .channel("dashboard-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "projects" },
                () => fetchData()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "project_members" },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData, location.state]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const handleCreateProject = async () => {
        if (!user) return;

        if (!can("create_project")) {
            setUpgradeFeature("Limite de Projetos");
            setShowUpgrade(true);
            setIsNewProjectOpen(false);
            return;
        }

        setIsCreating(true);

        try {
            const { data, error } = await supabase
                .from("projects")
                .insert({
                    name: newProjectName,
                    user_id: user.id,
                    description: aiBriefing,
                    agency_name: settingsAgencyName,
                    category: newProjectCategory,
                })
                .select()
                .single();

            if (error) throw error;

            setProjects([data, ...projects]);
            setIsNewProjectOpen(false);
            setNewProjectName("");
            setAiBriefing("");
            toast.success("Projeto criado!");
            window.location.reload();
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
            await refreshPlan();
            setProjectToDelete(null);
        } catch (error: any) {
            toast.error("Erro ao excluir.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateProfile = async () => {
        setIsSavingSettings(true);
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: {
                    full_name: settingsName,
                    avatar_url: settingsAvatar,
                    figma_token: settingsFigmaToken,
                    agency_name: settingsAgencyName,
                    primary_color: settingsPrimaryColor,
                },
            });

            if (error) throw error;

            setUser(data.user);
            toast.success("Perfil atualizado com sucesso!");
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil", { description: error.message });
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        if (planId === "starter") return;

        toast.loading("Iniciando checkout...");
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Você precisa estar logado.");
                return;
            }

            const functionUrl = getFunctionUrl("create-checkout-session");
            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ planId: planId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro no checkout");
            if (data?.url) window.location.href = data.url;
        } catch (err: any) {
            toast.error("Erro: " + err.message);
        }
    };

    const handleManageSubscription = async () => {
        setIsRedirectingPortal(true);
        toast.loading("Redirecionando para o portal de assinaturas...");

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Erro de sessão");
                return;
            }

            const functionUrl = getFunctionUrl("create-portal-session");
            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao abrir portal");
            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            toast.error("Erro ao acessar portal", { description: error.message });
            setIsRedirectingPortal(false);
        }
    };

    const handleInstantCreateFromAI = async (briefingData: {
        title: string;
        questions: string[];
    }) => {
        if (!user) return toast.error("Usuário não identificado");

        if (!can("create_project")) {
            setUpgradeFeature("Limite de Projetos");
            setShowUpgrade(true);
            setIsAIModalOpen(false);
            return;
        }

        setIsCreating(true);

        try {
            const { data, error } = await supabase
                .from("projects")
                .insert({
                    name: briefingData.title,
                    user_id: user.id,
                    description: `Gerado por IA para o nicho de ${briefingData.title}`,
                    agency_name: settingsAgencyName,
                })
                .select()
                .single();

            if (error) throw error;

            const blocks = briefingData.questions.map((q, i) => ({
                id: (i + 1).toString(),
                type: "textarea",
                label: q,
                placeholder: "Sua resposta aqui...",
            }));

            await supabase.from("briefings").insert({
                project_id: data.id,
                content: blocks,
                status: "draft",
                template_type: "custom",
            });

            setIsAIModalOpen(false);
            setIsNewProjectOpen(false);
            toast.success("Projeto e Briefing criados com IA! 🚀");
            navigate(`/project/${data.id}`);
        } catch (err: any) {
            toast.error("Erro ao criar projeto: " + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    return {
        user,
        projects,
        plan,
        usage,
        can,
        planLoading,
        isInitialLoading,
        showUpgrade,
        setShowUpgrade,
        upgradeFeature,
        setUpgradeFeature,
        isNewProjectOpen,
        setIsNewProjectOpen,
        newProjectName,
        setNewProjectName,
        newProjectCategory,
        setNewProjectCategory,
        isCreating,
        projectToDelete,
        setProjectToDelete,
        isDeleting,
        isAIModalOpen,
        setIsAIModalOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        activeMenu,
        setActiveMenu,
        isRedirectingPortal,
        settingsName,
        setSettingsName,
        settingsAvatar,
        setSettingsAvatar,
        settingsFigmaToken,
        setSettingsFigmaToken,
        settingsAgencyName,
        setSettingsAgencyName,
        settingsPrimaryColor,
        setSettingsPrimaryColor,
        isSavingSettings,
        handleLogout,
        handleCreateProject,
        handleDeleteProject,
        handleUpdateProfile,
        handleSubscribe,
        handleManageSubscription,
        handleInstantCreateFromAI,
    };
}

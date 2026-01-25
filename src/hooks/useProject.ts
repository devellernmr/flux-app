import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import type { Project, User } from "@/types";
import type { BriefingBlock } from "@/lib/templates";
import { BRIEFING_TEMPLATES } from "@/lib/templates";
import { logProjectActivity } from "@/lib/activity";

export function useProject(id: string | undefined) {
    const navigate = useNavigate();
    const { can } = usePlan();
    const [user, setUser] = useState<User | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    // Briefing States
    const [blocks, setBlocks] = useState<BriefingBlock[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingBriefing, setIsSavingBriefing] = useState(false);
    const [briefingStatus, setBriefingStatus] = useState<
        | "empty"
        | "active"
        | "awaiting_response"
        | "sent"
        | "approved"
        | "completed"
        | "draft"
    >("empty");

    // Project Settings States
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectStatus, setProjectStatus] = useState<
        "active" | "paused" | "done" | "archived"
    >("active");
    const [projectDueDate, setProjectDueDate] = useState<string>("");
    const [savingSettings, setSavingSettings] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [customLogoUrl, setCustomLogoUrl] = useState<string>("");
    const [agencyName, setAgencyName] = useState<string>("");
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

    // New financial states
    const [budget, setBudget] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [estimatedHours, setEstimatedHours] = useState(0);
    const [targetHourlyRate, setTargetHourlyRate] = useState(0);

    const fetchPendingCount = useCallback(async () => {
        if (!id) return;
        const { count } = await supabase
            .from("files")
            .select("*", { count: "exact", head: true })
            .eq("project_id", Number(id))
            .eq("status", "pending");
        setPendingApprovalsCount(count || 0);
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            setUser(authUser as unknown as User);

            if (authUser && id) {
                const { data: proj } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("id", Number(id))
                    .single();

                if (proj) {
                    setProject(proj);
                    setProjectName(proj.name);
                    setProjectDescription(proj.description || "");
                    setProjectStatus(proj.status);
                    setProjectDueDate(proj.due_date || "");
                    setCustomLogoUrl(proj.custom_logo_url || "");
                    setAgencyName(proj.agency_name || "");
                    setBudget(proj.budget || 0);
                    setExpenses(proj.expenses || 0);
                    setEstimatedHours(proj.estimated_hours || 0);
                    setTargetHourlyRate(proj.target_hourly_rate || 0);

                    const { data: brief } = await supabase
                        .from("briefings")
                        .select("*")
                        .eq("project_id", Number(id))
                        .maybeSingle();

                    if (brief) {
                        setBriefingStatus(brief.status as "empty" | "active" | "awaiting_response" | "sent" | "approved" | "completed" | "draft");
                        if (brief.content && Array.isArray(brief.content)) {
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
            .channel(`files-changes-${id}`)
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
                        const proj = payload.new as unknown as Project;
                        setProject(proj);
                        setProjectName(proj.name || "");
                        setProjectDescription(proj.description || "");
                        setProjectStatus((proj.status || "active") as "active" | "paused" | "done" | "archived");
                        setProjectDueDate(
                            proj.due_date ? proj.due_date.substring(0, 10) : ""
                        );
                        setCustomLogoUrl(proj.custom_logo_url || "");
                        setAgencyName(proj.agency_name || "");
                        setBudget(proj.budget || 0);
                        setExpenses(proj.expenses || 0);
                        setEstimatedHours(proj.estimated_hours || 0);
                        setTargetHourlyRate(proj.target_hourly_rate || 0);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(filesChannel);
            supabase.removeChannel(projectChannel);
        };
    }, [id, fetchPendingCount]);

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
            setBriefingStatus("awaiting_response");
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving briefing:", err);
            toast.error("Erro ao salvar.");
        } finally {
            setIsSavingBriefing(false);
        }
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
                    budget: budget,
                    expenses: expenses,
                    estimated_hours: estimatedHours,
                    target_hourly_rate: targetHourlyRate,
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
                budget: budget,
                expenses: expenses,
            }));
        } catch (err) {
            console.error("Error saving settings:", err);
            toast.error("Erro ao salvar.");
        } finally {
            setSavingSettings(false);
        }
    };

    const archiveProject = async () => {
        if (!id) return;
        setIsArchiving(true);
        try {
            const { error } = await supabase
                .from("projects")
                .update({ status: "archived" })
                .eq("id", Number(id));
            if (error) throw error;
            toast.success("Projeto arquivado!");
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao arquivar projeto.");
        } finally {
            setIsArchiving(false);
        }
    };

    const handleApproveBriefing = async () => {
        if (!id || !project) return;
        try {
            // 1. Atualizar status do briefing
            const { error: briefErr } = await supabase
                .from("briefings")
                .update({ status: "approved" })
                .eq("project_id", Number(id));

            if (briefErr) throw briefErr;

            // 2. Gerar Milestones (com IA ou Padrão)
            if (can("ai")) {
                toast.promise(
                    (async () => {
                        const { data: aiMilestones, error: aiErr } = await supabase.functions.invoke("generate-milestones", {
                            body: { briefingContent: blocks, projectName: project.name }
                        });

                        if (aiErr) throw aiErr;

                        await supabase
                            .from("projects")
                            .update({
                                status: "active",
                                milestones: aiMilestones
                            })
                            .eq("id", id);

                        setBriefingStatus("approved");
                        setProject(prev => prev ? { ...prev, status: "active", milestones: aiMilestones } : null);

                        await logProjectActivity({
                            projectId: id!,
                            content: "Briefing aprovado e Roadmap dinâmico gerado com IA.",
                            type: "approve"
                        });
                    })(),
                    {
                        loading: 'Gerando roadmap personalizado...',
                        success: 'Projeto iniciado com roadmap dinâmico!',
                        error: 'Briefing aprovado, mas erro ao gerar roadmap.',
                    }
                );
            } else {
                // FALLBACK PADRÃO PARA STARTER (Sem IA)
                const standardMilestones = [
                    { label: "Briefing", desc: "Concluído" },
                    { label: "Setup", desc: "Pendente" },
                    { label: "Design", desc: "Pendente" },
                    { label: "Feedback", desc: "Pendente" },
                    { label: "Entrega", desc: "Pendente" },
                    { label: "Finalizado", desc: "Pendente" }
                ];

                await supabase
                    .from("projects")
                    .update({
                        status: "active",
                        milestones: standardMilestones
                    })
                    .eq("id", id);

                setBriefingStatus("approved");
                setProject(prev => prev ? { ...prev, status: "active", milestones: standardMilestones } : null);

                await logProjectActivity({
                    projectId: id!,
                    content: "Briefing aprovado e Roadmap padrão criado.",
                    type: "approve"
                });

                toast.success("Briefing aprovado! Projeto iniciado.");
            }

        } catch (err: any) {
            console.error(err);
            toast.error("Erro ao aprovar briefing.");
        }
    };

    const useTemplate = (templateName: string) => {
        const template = BRIEFING_TEMPLATES[templateName as keyof typeof BRIEFING_TEMPLATES];
        if (!template) return;

        const newBlocks = template.blocks.map((b: BriefingBlock) => ({
            ...b,
            id: Date.now().toString() + Math.random(),
        }));
        setBlocks(newBlocks);
        setIsEditing(true);
    };

    const updateBlock = (i: number, field: keyof BriefingBlock, value: any) => {
        setBlocks(prev => {
            const newBlocks = [...prev];
            newBlocks[i] = { ...newBlocks[i], [field]: value };
            return newBlocks;
        });
    };

    const removeBlock = (i: number) =>
        setBlocks(prev => prev.filter((_, x) => x !== i));

    const addBlock = (block?: BriefingBlock) =>
        setBlocks(prev => [
            ...prev,
            block || {
                id: Date.now().toString() + Math.random(),
                type: "text",
                label: "",
                placeholder: "",
            },
        ]);

    const resetBriefing = async () => {
        if (!id) return;
        await supabase.from("briefings").delete().eq("project_id", Number(id));
        setBlocks([]);
        setBriefingStatus("empty");
        setIsEditing(false);
        toast.success("Resetado!");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const copyLink = async () => {
        if (!id) return;
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

    return {
        user,
        project,
        loading,
        blocks,
        setBlocks,
        isEditing,
        setIsEditing,
        isSavingBriefing,
        briefingStatus,
        setBriefingStatus,
        projectName,
        setProjectName,
        projectDescription,
        setProjectDescription,
        projectStatus,
        setProjectStatus,
        projectDueDate,
        setProjectDueDate,
        savingSettings,
        customLogoUrl,
        setCustomLogoUrl,
        agencyName,
        setAgencyName,
        pendingApprovalsCount,
        saveBriefing,
        saveProjectSettings,
        archiveProject,
        resetBriefing,
        handleLogout,
        copyLink,
        useTemplate,
        updateBlock,
        removeBlock,
        addBlock,
        handleApproveBriefing,
        isArchiving,
        budget,
        expenses,
        estimatedHours,
        targetHourlyRate,
    };
}

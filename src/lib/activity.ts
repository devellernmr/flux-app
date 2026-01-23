import { supabase } from "./supabase";
import { sendNotification } from "./notifications";

export type ActivityType =
    | "chat"
    | "upload"
    | "approve"
    | "reject"
    | "finance"
    | "member_add"
    | "member_remove"
    | "system";

interface LogActivityProps {
    projectId: string;
    content: string;
    type: ActivityType;
    userId?: string;
}

/**
 * Logs an activity to the unified project timeline.
 * Uses the project_comments table with specific types.
 */
export async function logProjectActivity({
    projectId,
    content,
    type,
    userId
}: LogActivityProps) {
    try {
        let finalUserId = userId;

        if (!finalUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            finalUserId = user?.id;
        }

        if (!finalUserId) return;

        const { error } = await supabase.from("project_comments").insert({
            project_id: projectId,
            content: content,
            user_id: finalUserId,
            type: type
        });

        if (error) throw error;

        // Auto-trigger notifications to other members
        const { data: members } = await supabase
            .from("team_members")
            .select("user_id")
            .eq("project_id", Number(projectId));

        if (members) {
            const otherMembers = members.filter(m => m.user_id !== finalUserId);
            for (const member of otherMembers) {
                await sendNotification({
                    userId: member.user_id,
                    title: "Atividade no Projeto",
                    message: content,
                    type: "system",
                    link: `/project/${projectId}`
                });
            }
        }
    } catch (err) {
        console.error("Failed to log project activity:", err);
    }
}

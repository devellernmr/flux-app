import { supabase } from "./supabase";

export type NotificationType = "comment" | "approval" | "system";

interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Envia uma notificação interna para o banco de dados.
 * Falha silenciosamente se a tabela não existir.
 */
export async function sendNotification({
  userId,
  title,
  message,
  type,
  link,
}: SendNotificationParams) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: false,
    });

    if (error) {
      if (error.code === "PGRST116" || error.message?.includes("notifications")) {
        console.warn("Recurso de notificações desativado (tabela ausente).");
      } else {
        console.error("Erro ao enviar notificação:", error);
      }
    }
  } catch (err) {
    // Silently fail to not break the main app flow
    console.warn("Falha ao processar gatilho de notificação:", err);
  }
}

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Loader2,
  Clock,
  User,
  FileUp,
  CheckCircle2,
  MousePointer2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS, es, fr } from "date-fns/locale";
import { sendNotification } from "@/lib/notifications";
import { useTranslation } from "react-i18next";

const localeMap: Record<string, any> = {
  pt: ptBR,
  en: enUS,
  es: es,
  fr: fr
};

export function ProjectActivity({ projectId }: { projectId: string }) {
  const [activity, setActivity] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const { t, i18n } = useTranslation();

  const fetchActivity = useCallback(async () => {
    if (!projectId) return;

    try {
      // 1. Buscar Membros para ter os nomes/emails
      const { data: membersData } = await supabase
        .from("team_members_with_email")
        .select("user_id, email")
        .eq("project_id", projectId);

      if (membersData) setMembers(membersData);

      const { data: chatData, error: chatError } = await supabase
        .from("project_comments")
        .select("*")
        .eq("project_id", projectId);

      if (chatError) throw chatError;

      const { data: files } = await supabase
        .from("files")
        .select("id, name")
        .eq("project_id", projectId);

      let feedbackData: any[] = [];

      if (files && files.length > 0) {
        const fileIds = files.map((f) => f.id);
        const { data: feedbacks, error: feedError } = await supabase
          .from("comments")
          .select("*, files(name)")
          .in("file_id", fileIds);

        if (!feedError && feedbacks) {
          feedbackData = feedbacks.map((f) => ({
            ...f,
            type: "feedback_entry",
            fileName: f.files?.name,
          }));
        }
      }

      const allActivity = [...(chatData || []), ...feedbackData].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      setActivity(allActivity);
    } catch (error) {
      console.error("Erro ao carregar atividade:", error);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
    fetchActivity();

    const channel = supabase
      .channel(`project-activity-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_comments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log("Realtime: Novo comentário no chat", payload);
          fetchActivity();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        (_payload) => {
          // Só recarrega se o comentário for de um arquivo deste projeto
          // Como não temos o project_id no payload do comment (vem file_id),
          // recarregamos para garantir, mas de forma menos ruidosa.
          console.log("Realtime: Novo feedback detectado");
          fetchActivity();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("🔥 Realtime Chat Conectado!");
        }
      });

    return () => {
      console.log(`Removing realtime channel for project ${projectId}`);
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchActivity]);

  const currentLang = i18n.language?.split("-")[0] || "en";

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [activity]);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    const textToSend = newComment;
    setNewComment("");
    setSending(true);

    try {
      const { error } = await supabase.from("project_comments").insert({
        project_id: projectId,
        content: textToSend,
        user_id: user.id,
        type: "chat",
      });

      if (error) throw error;
      fetchActivity();

      // Enviar notificações para outros membros do projeto
      const otherMembers = members.filter((m) => m.user_id !== user.id);
      for (const member of otherMembers) {
        await sendNotification({
          userId: member.user_id,
          title: "Nova mensagem no chat",
          message: `${user.user_metadata?.full_name || user.email
            } enviou uma mensagem.`,
          type: "comment",
          link: `/project/${projectId}?tab=chat`,
        });
      }
    } catch (error: any) {
      toast.error("Erro ao enviar.");
      setNewComment(textToSend);
    } finally {
      setSending(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <FileUp className="h-3 w-3 text-blue-400" />;
      case "approve":
        return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
      case "reject":
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      case "finance":
        return <TrendingUp className="h-3 w-3 text-amber-400" />;
      case "member_add":
        return <UserPlus className="h-3 w-3 text-purple-400" />;
      case "member_remove":
        return <UserMinus className="h-3 w-3 text-zinc-400" />;
      default:
        return <Clock className="h-3 w-3 text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/20 rounded-2xl overflow-hidden relative backdrop-blur-sm border border-zinc-800/50 shadow-inner">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-950/40 flex items-center justify-between shrink-0 backdrop-blur-md">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">
          {t("activity.unified_timeline")}
        </span>
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
      </div>

      {/* LISTA DE MENSAGENS */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 relative"
        ref={scrollRef}
      >
        {activity.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 space-y-3 opacity-60 pointer-events-none pb-12">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center rotate-3 shadow-lg">
              <User className="h-6 w-6 -rotate-3 text-zinc-500" />
            </div>
            <p className="text-xs font-medium tracking-wide">
              {t("activity.no_activity")}
            </p>
          </div>
        ) : (
          activity.map((item) => {
            const isMe = item.user_id === user?.id;
            const isLog =
              item.type !== "chat" &&
              item.type !== "feedback_entry" &&
              item.type !== null;

            if (isLog) {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 justify-center opacity-70 my-6"
                >
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-zinc-800" />
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800/50">
                    {getLogIcon(item.type)} {item.content}
                  </div>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-zinc-800" />
                </div>
              );
            }

            if (item.type === "feedback_entry") {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-1.5 my-3 pl-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-pink-500/10 border border-pink-500/20">
                      <MousePointer2 className="h-3 w-3 text-pink-500" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {isMe
                        ? t("activity.you")
                        : members.find((m) => m.user_id === item.user_id)
                          ?.email || t("activity.client")}{" "}
                      {t("activity.commented_on")}{" "}
                      <span className="text-zinc-300 font-semibold">
                        {item.fileName || t("activity.a_file")}
                      </span>
                    </span>
                  </div>
                  <div
                    onClick={() =>
                      window.open(
                        `${window.location.origin}/feedback/${item.file_id}`,
                        "_blank"
                      )
                    }
                    className="bg-zinc-900/60 border border-zinc-800 border-l-2 border-l-pink-500 p-3 rounded-r-xl rounded-bl-xl text-sm text-zinc-300 italic relative shadow-sm cursor-pointer hover:bg-zinc-900 transition-colors group/feedback"
                  >
                    "{item.content}"
                    <span className="absolute -bottom-5 right-0 text-[9px] text-zinc-600">
                      {item.created_at &&
                        formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                          locale: localeMap[currentLang] || enUS,
                        })}
                    </span>
                    <div className="absolute right-2 top-2 opacity-0 group-hover/feedback:opacity-100 transition-opacity">
                      <MousePointer2 className="h-3 w-3 text-pink-500/50" />
                    </div>
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <Avatar className="h-8 w-8 border border-zinc-800 ring-2 ring-zinc-950 shrink-0 shadow-sm">
                  <AvatarFallback
                    className={`text-[10px] font-bold ${isMe
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400"
                      }`}
                  >
                    {isMe
                      ? user?.user_metadata?.full_name
                        ?.substring(0, 2)
                        .toUpperCase() || "EU"
                      : members
                        .find((m) => m.user_id === item.user_id)
                        ?.email?.substring(0, 2)
                        .toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col max-w-[85%] ${isMe ? "items-end" : "items-start"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-zinc-400">
                      {isMe
                        ? user?.user_metadata?.full_name || t("activity.you")
                        : members.find((m) => m.user_id === item.user_id)
                          ?.email || t("common.user")}
                    </span>
                    <span className="text-[9px] text-zinc-600">
                      {item.created_at &&
                        formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                          locale: localeMap[currentLang] || enUS,
                        })}
                    </span>
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md border relative group transition-all duration-200
                      ${isMe
                        ? "bg-blue-600 text-white border-blue-500/50 rounded-tr-none shadow-blue-900/10 hover:bg-blue-500"
                        : "bg-zinc-900 text-zinc-200 border-zinc-800 rounded-tl-none hover:bg-zinc-800 hover:border-zinc-700"
                      }`}
                  >
                    {item.content}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        {/* Espaçador invisível para garantir que a última mensagem não fique escondida atrás do input */}
        <div className="h-2" />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/50 shrink-0 z-10 backdrop-blur-xl">
        <div className="relative flex items-end gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-800 transition-all shadow-inner">
          <Textarea
            placeholder={t("activity.type_message")}
            className="min-h-[44px] max-h-32 bg-transparent border-none focus:ring-0 resize-none text-sm py-3 px-3 scrollbar-hide placeholder:text-zinc-600 text-zinc-200 w-full"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            className={`h-9 w-9 shrink-0 rounded-xl transition-all duration-300 mb-0.5 mr-0.5 shadow-lg ${newComment.trim()
              ? "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 hover:shadow-blue-500/20"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            onClick={handleSend}
            disabled={sending || !newComment.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

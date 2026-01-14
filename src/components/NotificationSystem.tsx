import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  CheckCheck,
  FileUp,
  FileText,
  Info,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  read: boolean; // Usando 'read' para consistência com a tabela
  is_read?: boolean; // Fallback para compatibilidade se necessário
  created_at: string;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      fetchNotifications(user.id);

      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            if (mounted) fetchNotifications(user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return;

    // Normalizando o campo read/is_read dependendo do que vem do banco
    const normalizedData = (data || []).map((n) => ({
      ...n,
      read: n.read !== undefined ? n.read : n.is_read,
    }));

    setNotifications(normalizedData);
    setUnreadCount(normalizedData.filter((n) => !n.read).length);
  };

  const markAsRead = async (id: string, link?: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await supabase
      .from("notifications")
      .update({ read: true, is_read: true })
      .eq("id", id);

    if (link) {
      setIsOpen(false);
      navigate(link);
    }
  };

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    await supabase
      .from("notifications")
      .update({ read: true, is_read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    toast.success("Todas marcadas como lidas");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case "approval":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "file_upload":
        return <FileUp className="h-4 w-4 text-purple-400" />;
      case "briefing_response":
        return <FileText className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group"
        >
          <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-[#050505] shadow-[0_0_15px_rgba(59,130,246,0.6)]"
              />
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 md:w-96 p-0 bg-zinc-950/90 backdrop-blur-xl border-zinc-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-900/50 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="group flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-blue-400 uppercase font-bold tracking-tight transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              Ler Tudo
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[450px]">
          <div className="p-1">
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800/50 relative">
                    <Bell className="h-7 w-7 text-zinc-700" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-800 rounded-full border-2 border-zinc-950" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Tudo em dia!
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Você não tem notificações novas.
                    </p>
                  </div>
                </motion.div>
              ) : (
                notifications.map((n, index) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => markAsRead(n.id, n.link)}
                    className={`p-4 rounded-xl cursor-pointer transition-all relative group flex gap-4 ${
                      !n.read
                        ? "bg-blue-500/[0.03] hover:bg-blue-500/[0.06]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Status Indicator */}
                    {!n.read && (
                      <div className="absolute left-1 top-4 bottom-4 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}

                    {/* Icon */}
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                        !n.read
                          ? "bg-zinc-900 border-zinc-700 text-white shadow-lg"
                          : "bg-zinc-950 border-zinc-900 text-zinc-500"
                      }`}
                    >
                      {getIcon(n.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            !n.read ? "text-white" : "text-zinc-400"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-medium whitespace-nowrap pt-0.5">
                          {formatDistanceToNow(new Date(n.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <p
                        className={`text-[11px] line-clamp-2 leading-relaxed ${
                          !n.read ? "text-zinc-300" : "text-zinc-500"
                        }`}
                      >
                        {n.message}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-white/[0.01] border-t border-zinc-900/50 text-center">
            <button className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
              Histórico Completo
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

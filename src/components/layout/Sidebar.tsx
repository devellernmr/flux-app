import { Sparkles, Settings, LogOut, BarChart3, Zap, Layers } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { User, PlanType } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  user: User | null;
  plan: PlanType;
  usage: { projects: number; storage: number };
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
  onShowTutorial?: () => void;
}

export function Sidebar({
  user,
  plan,
  usage,
  activeMenu,
  setActiveMenu,
  onLogout,
  onShowTutorial,
}: SidebarProps) {
  /* NAVIGATION LOGIC REMOVED FROM PROPS, RESTORING INTERNAL HANDLER */

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (item: { id: string; label: string; icon: any; path?: string }) => {
    if (item.id === "analytics") {
      navigate("/analytics");
    } else if (item.id === "projects" || item.id === "settings") {
      if (location.pathname !== "/dashboard") {
        navigate("/dashboard", { state: { activeMenu: item.id } });
      } else {
        setActiveMenu(item.id);
      }
    } else {
      setActiveMenu(item.id);
    }
  };

  const NavLinks = () => (
    <nav className="flex-1 px-4 space-y-1.5 mt-10">
      {[
        { id: "projects", label: "Meus Fluxos", icon: Layers },
        { id: "analytics", label: "Insights", icon: BarChart3 },
        { id: "settings", label: "Preferences", icon: Settings },
      ].map((item) => (
        <button
          key={item.id}
          id={`sidebar-nav-${item.id}`}
          onClick={() => handleNavigation(item)}
          className={`w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 relative overflow-hidden ${activeMenu === item.id
            ? "bg-white text-black shadow-2xl shadow-white/5"
            : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
        >
          {activeMenu === item.id && (
            <motion.div
              layoutId="main-menu-active"
              className="absolute inset-0 bg-white"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <item.icon className={`h-4 w-4 relative z-10 ${activeMenu === item.id ? "text-black" : "group-hover:text-blue-400 transition-colors"}`} />
          <span className="relative z-10 uppercase tracking-tight">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <aside className="w-80 bg-[#030303] border-r border-zinc-900/50 hidden md:flex flex-col sticky top-0 h-screen z-20">
      <div className="p-8 pb-2">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            FLUXO.
          </span>
        </div>
      </div>

      <NavLinks />

      {/* HELP BUTTON */}
      <div className="px-5 mt-auto mb-6">
        <button
          id="sidebar-help-btn"
          onClick={onShowTutorial}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
        >
          <div className="p-2 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
            <Zap className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tighter">Support Node</span>
            <span className="text-[9px] text-zinc-600 font-medium">Abrir central de ajuda</span>
          </div>
        </button>
      </div>

      {/* INDICADOR DE LIMITES */}
      <div className="px-6 mb-4">
        <div className="bg-zinc-950 rounded-2xl p-4 border border-white/5">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-3">
            <span className="text-zinc-500">Fluxos de Atividade</span>
            <span className="text-blue-500">
              {plan === "starter" ? `${usage.projects}/2` : "∞ Level"}
            </span>
          </div>
          {plan === "starter" ? (
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((usage.projects / 2) * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full bg-blue-500/50 w-2/3 blur-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-[#080808]">
        <div
          id="sidebar-user-profile"
          className="bg-zinc-900/20 rounded-[28px] p-3 border border-white/5 flex items-center gap-3 group transition-all"
        >
          <div className="relative">
            <Avatar className="h-10 w-10 border border-zinc-800 p-0.5 bg-zinc-900">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-blue-600 text-xs font-black text-white">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-[#090909] rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-xs font-black truncate text-zinc-100 group-hover:text-white transition-colors">
              {user?.user_metadata?.full_name || "Usuário"}
            </p>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.1em] truncate capitalize">
              System Node • {plan}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

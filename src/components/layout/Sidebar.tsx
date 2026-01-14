import { Sparkles, Folder, Settings, LogOut, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { User, PlanType } from "@/types";

// ... (existing imports)

// Notification system is integrated via pages to maintain header context

interface SidebarProps {
  user: User | null;
  plan: PlanType;
  usage: { projects: number; storage: number };
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
  onShowTutorial: () => void;
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
  const NavLinks = () => (
    <nav className="flex-1 px-4 space-y-2 mt-8">
      {[
        { id: "projects", label: "Projetos", icon: Folder },
        { id: "analytics", label: "Relatórios", icon: BarChart3 },
        { id: "settings", label: "Configurações", icon: Settings },
      ].map((item) => (
        <button
          key={item.id}
          id={`sidebar-nav-${item.id}`}
          onClick={() => setActiveMenu(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
            activeMenu === item.id
              ? "text-white"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
          }`}
        >
          {activeMenu === item.id && (
            <motion.div
              layoutId="menu-active"
              className="absolute inset-0 bg-blue-600/10 border border-blue-600/20 rounded-lg z-0"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {item.label}
          </span>
          {activeMenu === item.id && (
            <motion.div
              layoutId="menu-glow"
              className="absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          )}
        </button>
      ))}
    </nav>
  );

  return (
    <aside className="w-72 bg-[#050505] border-r border-zinc-900 hidden md:flex flex-col sticky top-0 h-screen z-20 relative">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            FLUXO.
          </span>
        </div>
      </div>

      <NavLinks />

      {/* HELP BUTTON */}
      <div className="px-4 mt-auto mb-4">
        <button
          id="sidebar-help-btn"
          onClick={onShowTutorial}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors group"
        >
          <div className="w-5 h-5 rounded-full border border-zinc-700 group-hover:border-blue-500/50 flex items-center justify-center text-[10px] font-bold">
            ?
          </div>
          <span>Tutorial & Ajuda</span>
        </button>
      </div>

      {/* INDICADOR DE LIMITES */}
      <div className="px-6 pb-4">
        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-400">Projetos</span>
            <span className="text-white font-medium">
              {plan === "starter" ? `${usage.projects} / 2` : "Ilimitado"}
            </span>
          </div>
          {plan === "starter" && (
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((usage.projects / 2) * 100, 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-900 mt-auto">
        <div
          id="sidebar-user-profile"
          className="bg-zinc-900/30 rounded-xl p-3 border border-zinc-800/50 flex items-center gap-3"
        >
          <Avatar className="h-9 w-9 border border-zinc-800">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-zinc-800 text-xs">
              {user?.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-sm font-medium truncate text-zinc-200">
              {user?.user_metadata?.full_name || "Usuário"}
            </p>
            <p className="text-[10px] text-zinc-500 truncate capitalize">
              Plano {plan}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/10"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

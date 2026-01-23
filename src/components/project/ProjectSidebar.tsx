import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    LayoutDashboard,
    Layout,
    Palette,
    CheckCircle2,
    Folder,
    Users,
    Sparkles,
    LogOut,
    X,
    DollarSign,
    Box,
    Zap,
    HelpCircle as HelpIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { startProjectTour } from "@/components/dashboard/TourGuide";
import type { User } from "@/types";

interface ProjectSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    user: User | null;
    customLogoUrl?: string;
    pendingApprovalsCount: number;
    handleLogout: () => void;
    setIsMobileMenuOpen: (open: boolean) => void;
    isOwner: boolean;
    className?: string;
    mobileMode?: boolean;
    desktopMode?: boolean;
}

export const ProjectSidebar = memo(function ProjectSidebar({
    activeTab,
    setActiveTab,
    user,
    customLogoUrl,
    pendingApprovalsCount,
    handleLogout,
    setIsMobileMenuOpen,
    isOwner,
    className,
    mobileMode,
    desktopMode,
}: ProjectSidebarProps) {

    const NavLinks = () => {
        const allLinks = [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "briefing", label: "Briefing", icon: Layout },
            { id: "identidade", label: "Identidade", icon: Palette },
            { id: "approvals", label: "Entregas", icon: CheckCircle2 },
            { id: "files", label: "Arquivos", icon: Folder },
            { id: "members", label: "Equipe", icon: Users },
            { id: "finance", label: "Financeiro", icon: DollarSign },
            { id: "help", label: "Ajuda", icon: HelpIcon },
        ];

        const filteredLinks = allLinks.filter(item => {
            if (!isOwner) {
                return !["finance", "members"].includes(item.id);
            }
            return true;
        });

        return (
            <nav className="flex-1 px-4 mt-8 flex flex-col">
                <Link to="/dashboard" className="mb-10 px-2">
                    <button className="flex items-center gap-3 text-zinc-500 hover:text-zinc-200 transition-all group">
                        <div className="p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg group-hover:border-zinc-700 transition-colors">
                            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest leading-none">Voltar</span>
                    </button>
                </Link>

                <div className="space-y-8 flex-1">
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">
                            Workflow
                        </p>
                        <div className="space-y-1.5">
                            {filteredLinks.map((item) => (
                                <button
                                    key={item.id}
                                    id={`project-tab-${item.id}`}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 relative overflow-hidden ${activeTab === item.id
                                        ? "text-white shadow-xl shadow-white/5 border border-white/10"
                                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50"
                                        }`}
                                >
                                    {activeTab === item.id && (
                                        <motion.div
                                            layoutId="activeTabBg"
                                            className="absolute inset-0 bg-white/10 backdrop-blur-md"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <item.icon
                                        className={`h-4 w-4 relative z-10 ${activeTab === item.id ? "text-blue-400" : "group-hover:text-blue-400 transition-colors"}`}
                                    />
                                    <span className="relative z-10">{item.label}</span>
                                    {item.id === "approvals" && pendingApprovalsCount > 0 && (
                                        <span className={`ml-auto relative z-10 text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-black text-white' : 'bg-blue-600 text-white'}`}>
                                            {pendingApprovalsCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* UTILS AREA */}
                <div className="mt-auto mb-6 px-1">
                    <button
                        id="project-sidebar-help-btn"
                        // onClick={() => startProjectTour(setActiveTab)} // TODO: Novo sistema
                        className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                    >
                        <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Zap className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tighter">Fluxo Assist</span>
                            <span className="text-[9px] text-zinc-500 font-medium">Abrir tutorial interativo</span>
                        </div>
                    </button>
                </div>
            </nav>
        );
    };

    const UserProfileFooter = () => (
        <div className="p-4 bg-[#080808]">
            <div className="bg-zinc-900/20 rounded-[28px] p-3 border border-white/5 flex items-center gap-3 group transition-all">
                <div className="relative">
                    <Avatar className="h-10 w-10 border border-zinc-800 p-0.5 bg-zinc-900">
                        <AvatarImage src={user?.user_metadata?.avatar_url as string} className="rounded-full" />
                        <AvatarFallback className="bg-blue-600 text-xs font-black text-white">
                            {user?.email?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-[#121212] rounded-full" />
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-xs font-black truncate text-zinc-100 group-hover:text-white transition-colors">
                        {user?.user_metadata?.full_name as string || "Usuário"}
                    </p>
                    <div className="flex items-center gap-1">
                        <Box className="h-2.5 w-2.5 text-zinc-600" />
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest group-hover:text-blue-500 transition-colors">Pro Node</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <div className={className}>
            {/* Desktop Sidebar */}
            {(!mobileMode || desktopMode) && (
                <aside className="w-72 bg-[#030303] border-r border-zinc-900/50 hidden md:flex flex-col sticky top-0 h-screen z-20">
                    <div className="p-8 pb-2">
                        <div className="flex items-center gap-3 px-2">
                            {customLogoUrl ? (
                                <img
                                    src={customLogoUrl}
                                    alt="Logo"
                                    className="h-6 max-w-[140px] object-contain rounded"
                                />
                            ) : (
                                <div className="flex items-center gap-2 font-black text-white text-xl tracking-tighter">
                                    <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    FLUXO.
                                </div>
                            )}
                        </div>
                    </div>
                    <NavLinks />
                    <UserProfileFooter />
                </aside>
            )}

            {/* Mobile Sidebar Content */}
            {(!desktopMode || mobileMode) && (
                <div className="bg-[#030303] h-full flex flex-col">
                    <div className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter">FLUXO.</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all h-10 w-10"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="h-5 w-5 text-zinc-400" />
                        </Button>
                    </div>
                    <NavLinks />
                    <UserProfileFooter />
                </div>
            )}
        </div>
    );

});

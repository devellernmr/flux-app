import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
    Menu,
    ChevronRight,
    MessageSquare,
    Settings,
    MoreVertical,
    Share2,
    ArrowUpRight
} from "lucide-react";
import { NotificationSystem } from "@/components/NotificationSystem";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { Project } from "@/types";

interface ProjectHeaderProps {
    projectName: string;
    setIsMobileMenuOpen: (open: boolean) => void;
    toggleActivity: () => void;
    isActivityOpen: boolean;
    copyLink: () => void;
    setIsSettingsOpen: (open: boolean) => void;
    project: Project | null;
}

export const ProjectHeader = memo(function ProjectHeader({
    projectName,
    setIsMobileMenuOpen,
    toggleActivity,
    isActivityOpen,
    copyLink,
    setIsSettingsOpen,
    project,
}: ProjectHeaderProps) {
    return (
        <header className="h-20 md:h-24 border-b border-white/5 bg-[#030303]/80 backdrop-blur-2xl flex items-center justify-between px-6 md:px-12 sticky top-0 z-30">
            <div className="flex items-center gap-6 overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl h-10 w-10 shrink-0"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mb-1">
                        <span className="hover:text-zinc-300 transition-colors cursor-pointer">Projects</span>
                        <ChevronRight className="h-3 w-3 text-zinc-800" />
                        <span className="text-blue-500">Node_Overview</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter truncate max-w-[200px] md:max-w-xl">
                            {projectName || "Flux Node"}
                        </h1>
                        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tight">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 mr-4">
                    <Button
                        onClick={copyLink}
                        className="bg-white text-black hover:bg-zinc-200 h-10 px-4 rounded-xl text-xs font-black gap-2 transition-all active:scale-95 shadow-xl"
                    >
                        <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                </div>

                <div className="h-8 w-px bg-zinc-900 mx-2 hidden md:block" />

                <div className="flex items-center gap-2">
                    <NotificationSystem />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleActivity}
                        className={`h-11 w-11 rounded-xl transition-all border ${isActivityOpen
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                            : "bg-zinc-900/40 border-zinc-800/80 text-zinc-500 hover:text-zinc-200 hover:border-zinc-700"
                            }`}
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-64 bg-[#0A0A0A]/95 backdrop-blur-xl border-white/5 text-zinc-300 rounded-2xl p-2 shadow-2xl"
                        >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-2">Node Operations</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5 mx-2" />
                            <DropdownMenuItem
                                onClick={() => setIsSettingsOpen(true)}
                                className="cursor-pointer rounded-xl focus:bg-white focus:text-black py-3 px-3 transition-colors"
                            >
                                <Settings className="mr-3 h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-tight">Node Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={copyLink}
                                className="cursor-pointer rounded-xl focus:bg-white focus:text-black py-3 px-3 transition-colors"
                            >
                                <ArrowUpRight className="mr-3 h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-tight">Export Public Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 mx-2" />
                            <div className="px-3 py-2">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-1">Target Deadline</span>
                                <div className="text-[11px] text-zinc-400 font-bold">
                                    {project?.due_date
                                        ? format(new Date(project.due_date), "dd MMMM, yyyy")
                                        : "Undefined"}
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
});

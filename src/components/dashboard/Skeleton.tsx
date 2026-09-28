import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-14">
            {/* Welcome Card Skeleton */}
            <div className="md:col-span-12 lg:col-span-5 h-[220px] rounded-[40px] bg-zinc-900/30 border border-white/5 p-8 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                </div>
            </div>

            {/* Meta Card Skeleton */}
            <div className="md:col-span-6 lg:col-span-4 h-[220px] rounded-[40px] bg-zinc-900/30 border border-white/5 p-8 flex flex-col justify-between">
                <div className="flex justify-between">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </div>

            {/* Intel Card Skeleton */}
            <div className="md:col-span-6 lg:col-span-3 h-[220px] rounded-[40px] bg-zinc-900/30 border border-white/5 p-8">
                <div className="flex justify-between mb-8">
                    <Skeleton className="h-3 w-16" />
                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-1 w-4 rounded-full" />)}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            </div>
        </div>
    );
}

/**
 * Full app shell placeholder (sidebar + stats + project grid).
 * Used while the plan/billing data is still being resolved so the
 * dashboard never flashes the "starter" defaults to a paying user.
 */
export function DashboardShellSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-black text-white overflow-hidden relative selection:bg-blue-500/30">
            <div className="pointer-events-none fixed inset-0 z-0 bg-[url('/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

            <aside className="w-80 bg-[#030303] border-r border-zinc-900/50 hidden md:flex flex-col sticky top-0 h-screen z-20 p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                </div>
                <div className="space-y-3 pt-6">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl opacity-70" />
                    <Skeleton className="h-10 w-full rounded-xl opacity-50" />
                    <Skeleton className="h-10 w-full rounded-xl opacity-30" />
                </div>
                <div className="mt-auto space-y-3">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-6 w-40 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <DashboardStatsSkeleton />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80 max-w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <ProjectCardSkeleton key={i} />
                    ))}
                </div>
            </main>
        </div>
    );
}

export function ProjectCardSkeleton() {
    return (
        <div className="h-[280px] rounded-[32px] bg-zinc-900/30 border border-white/10 p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
            </div>
            <div className="pt-5 border-t border-white/5 flex justify-between items-center">
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 rounded-xl" />
            </div>
        </div>
    );
}

/** Generic panel placeholder for gated tabs (e.g. Financeiro) while the plan resolves. */
export function ContentPanelSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-live="polite">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 space-y-3">
                        <Skeleton className="h-3 w-24 rounded-full" />
                        <Skeleton className="h-7 w-32" />
                    </div>
                ))}
            </div>
            <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-6 space-y-4">
                <Skeleton className="h-4 w-40" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Full project workspace placeholder (sidebar + header + content) while the project loads. */
export function ProjectShellSkeleton() {
    return (
        <div className="min-h-screen bg-black text-zinc-100 flex font-sans overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute -top-[10%] -left-[5%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <aside className="w-80 bg-[#030303] border-r border-zinc-900/50 hidden md:flex flex-col sticky top-0 h-screen z-20 p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-2 pt-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                </div>
                <div className="mt-auto space-y-3">
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto h-screen relative z-10">
                <header className="sticky top-0 z-30 px-4 md:px-8 py-5 border-b border-zinc-900/50 bg-black/60 backdrop-blur-xl flex items-center justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-52" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-28 rounded-xl" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </header>
                <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-[32px]" />
                        ))}
                    </div>
                    <Skeleton className="h-64 rounded-[32px]" />
                    <Skeleton className="h-40 rounded-[32px]" />
                </div>
            </main>
        </div>
    );
}

/** Public client-review page placeholder (header + canvas + comments panel). */
export function PublicReviewSkeleton() {
    return (
        <div className="h-screen bg-black flex flex-col text-white overflow-hidden">
            <header className="h-16 border-b border-zinc-800/50 bg-black/60 flex items-center px-6 justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-28 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                    <Skeleton className="h-full w-full max-w-4xl rounded-3xl" />
                </div>
                <aside className="hidden lg:flex flex-col w-[400px] border-l border-zinc-800/50 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                    <Skeleton className="h-32 w-full rounded-2xl mt-auto" />
                </aside>
            </div>
        </div>
    );
}

/** Public briefing form placeholder (progress bar + question cards). */
export function PublicBriefingSkeleton() {
    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans pb-20 overflow-x-hidden">
            <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
                <div className="h-full w-1/3 bg-blue-600/60 animate-pulse" />
            </div>
            <div className="max-w-2xl mx-auto px-6 pt-20 space-y-8">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-8 w-2/3 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card rounded-[32px] border border-white/5 p-6 space-y-4">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                ))}
                <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
        </div>
    );
}

export function TicketCardSkeleton() {
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-2/3" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-28 rounded-full" />
                </div>
            </div>
            <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
        </div>
    );
}

/** Ticket list placeholder used by the admin support dashboard. */
export function TicketListSkeleton({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
            {Array.from({ length: items }).map((_, i) => (
                <TicketCardSkeleton key={i} />
            ))}
        </div>
    );
}

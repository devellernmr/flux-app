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

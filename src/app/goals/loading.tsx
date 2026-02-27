import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            <div className="px-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm h-[200px] flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" /> {/* Icon */}
                                    <Skeleton className="h-6 w-32" /> {/* Title */}
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="space-y-1 text-right">
                                    <Skeleton className="h-3 w-12 ml-auto" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

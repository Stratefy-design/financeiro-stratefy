import CreateGoalControl from "@/components/goals/CreateGoalControl";
import GoalList from "@/components/goals/GoalList";
import { getGoals } from "@/app/actions/goals";
import { getCurrentProfileId } from "@/app/actions/settings";
import { getDashboardSummary } from "@/app/actions/dashboard";

import { redirect } from "next/navigation";

export default async function GoalsPage() {
    const currentProfileId = await getCurrentProfileId();
    if (!currentProfileId) redirect('/sign-in');

    const goals = await getGoals();
    const summary = await getDashboardSummary();

    // Inject Agency Revenue into Goals (same logic as Dashboard)
    const goalsWithRevenue = goals.map(g => ({
        ...g,
        currentAmount: summary.agencyRevenue
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Finance</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Metas</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Metas Financeiras</h1>
                </div>

                <div className="flex items-center gap-3">
                    <CreateGoalControl currentProfileId={currentProfileId} />
                </div>
            </div>

            <div className="px-8 pb-10">
                <GoalList goals={goalsWithRevenue} />
            </div>
        </div>
    );
}

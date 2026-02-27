import { ExpenseCategoryList, CreateExpenseCategoryControl } from "@/components/expense-categories/ExpenseCategoryComponents";
import { getExpenseCategories } from "@/app/actions/expense-categories";
import { getCurrentProfileId } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function ExpenseCategoriesPage() {
    const currentProfileId = await getCurrentProfileId();
    if (!currentProfileId) redirect('/sign-in');

    const categories = await getExpenseCategories(currentProfileId);

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Gestão</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Categorias</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Despesas</h1>
                </div>

                <div className="flex items-center gap-3">
                    <CreateExpenseCategoryControl currentProfileId={currentProfileId} />
                </div>
            </div>

            <div className="px-8 pb-10">
                <ExpenseCategoryList categories={categories} />
            </div>
        </div>
    );
}

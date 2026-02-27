import { getDebts } from "@/app/actions/debts";
import { DebtList, CreateDebtControl } from "@/components/debts/DebtComponents";
import { CreditCard } from "lucide-react";

export default async function DebtsPage() {
    const debts = await getDebts();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between px-8 py-6 mb-2 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Gestão</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Dívidas</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Gestão de Dívidas</h1>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1">
                        Gerencie seus compromissos financeiros de longo prazo e empréstimos.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <CreateDebtControl />
                </div>
            </div>

            <div className="px-8 pb-10">
                <DebtList debts={debts} />
            </div>
        </div>
    );
}

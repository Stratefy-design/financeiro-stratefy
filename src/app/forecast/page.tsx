import { getPaymentForecast } from "@/app/actions/forecast";
import { ForecastCalendar } from "@/components/forecast/ForecastCalendar";
import { DashboardFilter } from "@/components/dashboard/DashboardFilter";
import { getClients } from "@/app/actions/clients";
import { getServices } from "@/app/actions/services";
import { getDebts } from "@/app/actions/debts";
import { getExpenseCategories } from "@/app/actions/transactions";
import { getCurrentProfileId } from "@/app/actions/settings";
import { redirect } from "next/navigation";

export default async function ForecastPage({
    searchParams
}: {
    searchParams: Promise<{ month?: string, year?: string }>
}) {
    const currentProfileId = await getCurrentProfileId();
    if (!currentProfileId) redirect('/sign-in');

    const params = await searchParams;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthParam = params?.month ? parseInt(params.month) : currentMonth;
    const yearParam = params?.year ? parseInt(params.year) : currentYear;

    const [forecastData, clients, services, debts, expenseCategories] = await Promise.all([
        getPaymentForecast(monthParam, yearParam),
        getClients(),
        getServices(currentProfileId),
        getDebts(),
        getExpenseCategories()
    ]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between px-8 py-6 mb-2 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Principal</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Previsão</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Calendário de Pagamentos</h1>
                    <p className="text-gray-500 dark:text-zinc-400 mt-1">
                        Visualize seus próximos compromissos, contas recorrentes e parcelas de dívidas.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <DashboardFilter />
                </div>
            </div>

            <div className="px-8 pb-10">
                <ForecastCalendar
                    initialData={forecastData}
                    currentMonth={monthParam}
                    currentYear={yearParam}
                    clients={clients}
                    services={services}
                    debts={debts}
                    currentProfileId={currentProfileId}
                    expenseCategories={expenseCategories}
                />
            </div>
        </div>
    );
}

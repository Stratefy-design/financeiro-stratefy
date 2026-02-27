import { getReportData } from "@/app/actions/reports";
import { Header } from "@/components/layout/Header";

export default async function ReportsPage() {
    const data = await getReportData();

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-500 mb-1">
                        <span>Management</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-zinc-100 font-medium">Relatórios</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Análise Financeira</h1>
                </div>
            </div>

            <div className="px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                {/* Despesas por Categoria */}
                {/* Despesas por Categoria */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Despesas por Categoria</h3>
                    <div className="space-y-4">
                        {data.expensesByCategory.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-zinc-500">Sem dados de despesas.</p>
                        ) : (
                            data.expensesByCategory.map((item) => (
                                <div key={item.category} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <span className="text-sm text-gray-700 dark:text-zinc-300">{item.category}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{toCurrency(item.amount)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Resumo do Mês */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Este Mês</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/20 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">Receitas</span>
                                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{toCurrency(data.currentMonth.income)}</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-500/20 rounded-lg border border-red-100 dark:border-red-500/20">
                                <span className="text-xs text-red-600 dark:text-red-400 font-medium uppercase">Despesas</span>
                                <p className="text-xl font-bold text-red-700 dark:text-red-400 mt-1">{toCurrency(data.currentMonth.expense)}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-zinc-400">Resultado Líquido</span>
                            <span className={`text-lg font-bold ${data.currentMonth.income - data.currentMonth.expense >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                                {toCurrency(data.currentMonth.income - data.currentMonth.expense)}
                            </span>
                        </div>
                    </div>

                    {/* Maiores Entradas */}
                    {/* Maiores Entradas */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Maiores Entradas (Top 5)</h3>
                        <div className="space-y-3">
                            {data.topIncomes.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-zinc-500">Sem dados de entradas.</p>
                            ) : (
                                data.topIncomes.map((t: any) => (
                                    <div key={t.id} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-zinc-700 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.description}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-zinc-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{toCurrency(t.amount)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

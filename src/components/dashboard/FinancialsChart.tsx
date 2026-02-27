'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function FinancialsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm italic">
                Sem dados suficientes para o período.
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
    };

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-700/30" />
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(128, 88, 255, 0.05)' }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-3 border-b border-gray-50 dark:border-zinc-700 pb-2">
                                        {formatDate(label as string)}
                                    </p>
                                    <div className="space-y-3">
                                        {payload.map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full shadow-lg shadow-current" style={{ backgroundColor: entry.fill, color: entry.fill }}></div>
                                                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-tight">{entry.name}</span>
                                                </div>
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{toCurrency(entry.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }}
                />

                <Bar
                    dataKey="income"
                    name="Receitas"
                    fill="url(#incomeGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                />
                <Bar
                    dataKey="expense"
                    name="Despesas"
                    fill="url(#expenseGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

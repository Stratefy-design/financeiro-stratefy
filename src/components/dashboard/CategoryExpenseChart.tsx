'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryIcon } from '@/lib/icons';
import { useState } from 'react';

const COLORS = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#6366F1'  // Indigo
];

export function CategoryExpenseChart({ data }: { data: any[] }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    };

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm italic">
                Aguardando transações...
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Chart Area */}
            <div className="relative w-full aspect-square max-h-[280px] mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="90%"
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={10}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    className="outline-none cursor-pointer transition-all duration-300"
                                    style={{
                                        filter: activeIndex !== null && activeIndex !== index ? 'grayscale(0.5) opacity(0.3)' : 'none',
                                        transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                                        transformOrigin: '50% 50%'
                                    }}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    const index = data.findIndex(d => d.name === item.name);
                                    const currentColor = COLORS[index % COLORS.length];
                                    const percentage = ((item.value / total) * 100).toFixed(1);

                                    return (
                                        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 z-[100] min-w-[180px]">
                                            <div className="flex items-center gap-3 mb-3 border-b border-gray-100 dark:border-zinc-800 pb-2">
                                                <div
                                                    className="p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 transition-colors"
                                                    style={{ color: currentColor }}
                                                >
                                                    {getCategoryIcon(item.name, 18)}
                                                </div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Valor Gasto</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p
                                                        className="text-xl font-black tracking-tighter transition-colors"
                                                        style={{ color: currentColor }}
                                                    >
                                                        {toCurrency(item.value)}
                                                    </p>
                                                    <p className="text-xs font-bold text-gray-400 dark:text-zinc-500">{percentage}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Summary Label */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ${activeIndex !== null ? 'opacity-10 scale-90 blur-[4px]' : 'opacity-100 scale-100'}`}>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Gastos do Mês</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                        {toCurrency(total)}
                    </p>
                </div>
            </div>

            {/* Legend - Improved Responsive Grid */}
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 px-2">
                {data.map((item, index) => (
                    <div
                        key={item.name}
                        className={`flex items-center gap-2 transition-all duration-300 ${activeIndex !== null && activeIndex !== index ? 'opacity-30' : 'opacity-100'}`}
                    >
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest truncate">
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

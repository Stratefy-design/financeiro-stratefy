'use client';

import { Target, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';

interface Goal {
    id: number;
    title: string;
    currentAmount: number;
    targetAmount: number;
}

export function DashboardGoalsWidget({ goals }: { goals: any[] }) {
    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (goals.length === 0) {
        return (
            <div className="py-6">
                <EmptyState
                    title="Nenhuma meta definida"
                    description="Defina metas financeiras para acompanhar seu progresso."
                    icon={Target}
                    action={
                        <Link href="/goals" className="text-xs font-bold text-white bg-[#8058FF] px-4 py-2 rounded-lg hover:bg-[#8058FF]/90 transition-colors mt-2 inline-block">
                            Criar primeira meta
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {goals.slice(0, 3).map((goal: Goal) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                return (
                    <div key={goal.id} className="group">
                        {/* Header with Title and Target Icon */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-[#8058FF]">
                                    <Target size={18} />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{goal.title}</span>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-700/50 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        {/* Big Metric: Current Amount */}
                        <div className="mb-4 pl-1">
                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white block tracking-tight">
                                {toCurrency(goal.currentAmount)}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-wider">
                                Arrecadado
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 dark:bg-zinc-700/50 rounded-full h-3.5 mb-3 overflow-hidden border border-gray-100 dark:border-zinc-700/30">
                            <div
                                className="bg-gradient-to-r from-[#8058FF] to-purple-500 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(128,88,255,0.4)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Details Footer */}
                        <div className="flex justify-between items-center text-xs pl-1">
                            <div className="text-gray-500 dark:text-zinc-500 flex items-center gap-1">
                                Meta: <span className="font-bold text-gray-900 dark:text-zinc-300">{toCurrency(goal.targetAmount)}</span>
                            </div>
                            {remaining > 0 ? (
                                <div className="text-[#8058FF] font-bold bg-[#8058FF]/5 dark:bg-[#8058FF]/10 px-2.5 py-1 rounded-lg">
                                    Falta: {toCurrency(remaining)}
                                </div>
                            ) : (
                                <div className="text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                    <Trophy size={12} /> Concluída!
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            {goals.length > 3 && (
                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <Link href="/goals" className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-zinc-400 hover:text-[#8058FF] font-medium transition-colors py-2">
                        Ver mais {goals.length - 3} metas <ArrowRight size={12} />
                    </Link>
                </div>
            )}
        </div>
    );
}

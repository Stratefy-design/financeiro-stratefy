'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Calendar } from 'lucide-react';

export function DashboardFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Get params or default to current
    const paramMonth = searchParams.get('month');
    const paramYear = searchParams.get('year');

    const selectedMonth = paramMonth ? parseInt(paramMonth) : currentMonth;
    const selectedYear = paramYear ? parseInt(paramYear) : currentYear;

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'this-month') {
            params.set('month', currentMonth.toString());
            params.set('year', currentYear.toString());
        } else if (value === 'last-month') {
            let lastMonth = currentMonth - 1;
            let year = currentYear;
            if (lastMonth < 0) {
                lastMonth = 11;
                year -= 1;
            }
            params.set('month', lastMonth.toString());
            params.set('year', year.toString());
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
            router.refresh();
        });
    };

    const isThisMonth = selectedMonth === currentMonth && selectedYear === currentYear;

    return (
        <div className="flex bg-white dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700 shadow-sm">
            <button
                onClick={() => handleFilterChange('this-month')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isThisMonth
                    ? 'bg-[#8058FF] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700'
                    }`}
            >
                <Calendar size={14} />
                Este Mês
            </button>
            <button
                onClick={() => handleFilterChange('last-month')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!isThisMonth
                    ? 'bg-[#8058FF] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700'
                    }`}
            >
                Mês Passado
            </button>
        </div>
    );
}

'use server'

import prisma from '@/lib/db'
import { getCurrentProfileId } from './settings'

export async function getReportData() {
    const currentProfileId = await getCurrentProfileId();

    // Agrupamento por Categoria
    const expensesByCategory = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
            type: 'expense',
            profileId: currentProfileId
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } }
    });

    // Top Clientes / Entradas
    const topIncomes = await prisma.transaction.findMany({
        where: {
            type: 'income',
            profileId: currentProfileId
        },
        orderBy: { amount: 'desc' },
        take: 5,
        include: { profile: true }
    });

    // Balanço do Mês Atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthStats = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
            profileId: currentProfileId,
            date: {
                gte: firstDay,
                lte: lastDay
            }
        },
        _sum: { amount: true }
    });

    // Projeção de Recorrentes (Consistência com Dashboard)
    const recurringExpensesFromPast = await prisma.transaction.findMany({
        where: {
            profileId: currentProfileId,
            type: 'expense',
            isRecurring: true,
            date: { lt: firstDay }
        },
        distinct: ['description'],
        select: { description: true, amount: true }
    });

    const currentMonthRecurringDescriptions = await prisma.transaction.findMany({
        where: {
            profileId: currentProfileId,
            date: { gte: firstDay, lte: lastDay },
            type: 'expense',
            description: { in: recurringExpensesFromPast.map(r => r.description) }
        },
        select: { description: true }
    });

    const missingRecurringAmount = recurringExpensesFromPast
        .filter(past => !currentMonthRecurringDescriptions.some(curr => curr.description === past.description))
        .reduce((sum, item) => sum + item.amount, 0);

    const totalIncome = currentMonthStats.find(s => s.type === 'income')?._sum.amount || 0;
    const totalExpense = (currentMonthStats.find(s => s.type === 'expense')?._sum.amount || 0) + missingRecurringAmount;

    return {
        expensesByCategory: expensesByCategory.map(e => ({
            category: e.category,
            amount: e._sum.amount || 0
        })),
        topIncomes,
        currentMonth: {
            income: totalIncome,
            expense: totalExpense
        }
    };
}

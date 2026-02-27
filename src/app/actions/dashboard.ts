'use server'

import prisma from '@/lib/db'

export interface DashboardSummary {
    totalBalance: number
    agencyRevenue: number
    personalIncome: number
    totalExpenses: number
    revenueGoal: number
    pendingRevenue: number
    pendingExpenses: number
    projectedBalance: number
    totalDebts: number
    allIncome: number
}

import { getCurrentProfileId } from './settings';

export async function getDashboardSummary(profileId?: number, month?: number, year?: number): Promise<DashboardSummary> {
    const activeProfileId = profileId || await getCurrentProfileId();
    const whereProfile = { profileId: activeProfileId };

    // Date Filtering Logic
    const now = new Date();
    const currentMonth = month !== undefined ? month : now.getMonth();
    const currentYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const whereDate = {
        date: {
            gte: startDate,
            lte: endDate
        }
    };

    // 1 & 2. Execute all independent aggregates in parallel
    const [
        allIncomeAgg,
        allExpenseAgg,
        incomeAgg,
        expenseAgg,
        personalAgg,
        pendingAgg,
        pendingExpensesAgg,
        debtAgg
    ] = await Promise.all([
        // Income up to selected month
        prisma.transaction.aggregate({
            where: { ...whereProfile, type: 'income', status: { in: ['completed', 'paid'] }, date: { lte: endDate } },
            _sum: { amount: true }
        }),
        // Expense up to selected month
        prisma.transaction.aggregate({
            where: { ...whereProfile, type: 'expense', status: { in: ['completed', 'paid'] }, date: { lte: endDate } },
            _sum: { amount: true }
        }),
        // Monthly income (already has whereDate)
        prisma.transaction.aggregate({
            where: { ...whereProfile, ...whereDate, type: 'income', status: { in: ['completed', 'paid'] } },
            _sum: { amount: true }
        }),
        // Monthly expense (already has whereDate)
        prisma.transaction.aggregate({
            where: { ...whereProfile, ...whereDate, type: 'expense', status: { in: ['completed', 'paid'] } },
            _sum: { amount: true }
        }),
        // Personal Income (Monthly)
        prisma.transaction.aggregate({
            where: { ...whereProfile, ...whereDate, type: 'income', status: { in: ['completed', 'paid'] } },
            _sum: { amount: true }
        }),
        // Pending Income (Monthly only)
        prisma.transaction.aggregate({
            where: { ...whereProfile, ...whereDate, type: 'income', status: 'pending' },
            _sum: { amount: true }
        }),
        // Pending/Overdue Expenses (Monthly only)
        prisma.transaction.aggregate({
            where: { ...whereProfile, ...whereDate, type: 'expense', status: { in: ['pending', 'overdue'] } },
            _sum: { amount: true }
        }),
        // Total Active Debts (contextual balance would be better but keeping all-time for consistency with previous behavior)
        (prisma as any).debt.aggregate({
            where: { ...whereProfile },
            _sum: { amount: true }
        })
    ]);

    const totalDebts = debtAgg._sum.amount || 0;
    const cumulativeBalance = (allIncomeAgg._sum.amount || 0) - (allExpenseAgg._sum.amount || 0);

    // 3. Recurring Expense Projection
    const recurringExpensesFromPast = await prisma.transaction.findMany({
        where: {
            ...whereProfile,
            type: 'expense',
            isRecurring: true,
            date: { lt: startDate }
        },
        distinct: ['description'],
        select: { description: true, amount: true }
    });

    const currentMonthRecurringDescriptions = await prisma.transaction.findMany({
        where: {
            ...whereProfile,
            ...whereDate,
            type: 'expense',
            description: { in: recurringExpensesFromPast.map(r => r.description) }
        },
        select: { description: true }
    });

    const missingRecurringAmount = recurringExpensesFromPast
        .filter(past => !currentMonthRecurringDescriptions.some(curr => curr.description === past.description))
        .reduce((sum, item) => sum + item.amount, 0);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpenses = (expenseAgg._sum.amount || 0) + missingRecurringAmount;
    const pendingRevenue = pendingAgg._sum.amount || 0;

    // Monthly Debt planning calculation
    const currentMonthDebts = await (prisma as any).debt.findMany({
        where: { profileId: activeProfileId, amount: { gt: 0 } },
        include: {
            paymentPlans: {
                where: { month: currentMonth, year: currentYear }
            }
        }
    });

    const monthlyDebtPayments = currentMonthDebts.reduce((sum: number, debt: any) => {
        if (debt.paymentPlans && debt.paymentPlans.length > 0) {
            // Sum all specific plans for this debt in this month
            return sum + debt.paymentPlans.reduce((pSum: number, plan: any) => pSum + plan.amount, 0);
        }
        return sum + (debt.installmentValue || 0);
    }, 0);

    // DISPLAY: Pending Expenses only includes real, non-paid transactions from this month
    const pendingExpenses = pendingExpensesAgg._sum.amount || 0;

    // CALCULATION: Total liabilities for projected balance includes projections
    const totalLiabilitiesForProjection = pendingExpenses + missingRecurringAmount + monthlyDebtPayments;

    // Revenue used for Goal Tracking (Net Profit: Income - Expenses)
    const netAgencyProfit = totalIncome - totalExpenses;

    // Buscar meta do perfil
    const profile = await prisma.profile.findUnique({
        where: { id: activeProfileId },
        select: { revenueGoal: true }
    });

    return {
        totalBalance: cumulativeBalance,
        agencyRevenue: totalIncome,
        personalIncome: personalAgg._sum.amount || 0,
        totalExpenses: totalExpenses,
        revenueGoal: profile?.revenueGoal || 0,
        pendingRevenue: pendingRevenue,
        pendingExpenses: pendingExpenses,
        projectedBalance: cumulativeBalance + pendingRevenue - totalLiabilitiesForProjection,
        totalDebts: totalDebts,
        allIncome: allIncomeAgg._sum.amount || 0
    }
}

export async function getRecentTransactions(month?: number, year?: number) {
    const activeProfileId = await getCurrentProfileId();

    // Optional: Filter by date if provided, otherwise just take recent
    let whereDate = {};
    if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        whereDate = {
            date: { gte: startDate, lte: endDate }
        };
    }

    return await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            ...whereDate
        },
        take: 5,
        orderBy: { date: 'desc' },
        include: {
            // Incluir se necessário profile, client, etc.
            profile: { select: { name: true, type: true } }
        }
    })
}

export async function getDailyFinancials(month?: number, year?: number) {
    const activeProfileId = await getCurrentProfileId();

    const now = new Date();
    const currentMonth = month !== undefined ? month : now.getMonth();
    const currentYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            date: { gte: startDate, lte: endDate }
        },
        orderBy: { date: 'asc' }
    });

    const dailyData = transactions.reduce((acc, transaction) => {
        const dateKey = transaction.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
        }
        if (transaction.type === 'income') {
            acc[dateKey].income += transaction.amount;
        } else {
            acc[dateKey].expense += transaction.amount;
        }
        return acc;
    }, {} as Record<string, { date: string, income: number, expense: number }>);

    return Object.values(dailyData);
}

export async function getRevenueByClient(month?: number, year?: number) {
    const activeProfileId = await getCurrentProfileId();

    const now = new Date();
    const currentMonth = month !== undefined ? month : now.getMonth();
    const currentYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Aggregate income by client, excluding transactions without client
    const revenueByClient = await prisma.transaction.groupBy({
        by: ['clientId'],
        where: {
            profileId: activeProfileId,
            type: 'income',
            clientId: { not: null },
            date: { gte: startDate, lte: endDate } // Date Filtered
        },
        _sum: {
            amount: true
        }
    });

    // Fetch client names
    const clientIds = revenueByClient.map(item => item.clientId).filter(id => id !== null) as number[];
    const clients = await prisma.client.findMany({
        where: { id: { in: clientIds } },
        select: { id: true, name: true }
    });

    // Map names to results and format
    return revenueByClient.map(item => {
        const client = clients.find(c => c.id === item.clientId);
        return {
            name: client?.name || 'Desconhecido',
            value: item._sum.amount || 0
        };
    }).sort((a, b) => b.value - a.value).slice(0, 5); // Return top 5
}
export async function getExpensesByCategory(month?: number, year?: number) {
    const activeProfileId = await getCurrentProfileId();

    const now = new Date();
    const currentMonth = month !== undefined ? month : now.getMonth();
    const currentYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    const expensesByCategory = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
            profileId: activeProfileId,
            type: 'expense',
            date: { gte: startDate, lte: endDate }
        },
        _sum: {
            amount: true
        }
    });

    return expensesByCategory.map(item => ({
        name: item.category,
        value: item._sum.amount || 0
    })).sort((a, b) => b.value - a.value);
}

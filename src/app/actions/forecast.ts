'use server'

import prisma from '@/lib/db'
import { getCurrentProfileId } from './settings'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns'

export interface ForecastItem {
    id: string | number;
    debtId?: number; // Linked debt ID for planning
    description: string;
    amount: number;
    date: Date;
    type: 'pending' | 'recurring' | 'debt' | 'income' | 'appointment';
    location?: string;
    clientId?: number;
    transactionId?: number;
    rawDescription?: string;
}

// Helper to calculate the 5th business day (Mon-Sat, skipping Sundays)
// Helper to calculate the 5th business day
function calculateFifthBusinessDay(month: number, year: number, config: 'mon-fri' | 'mon-sat' = 'mon-sat'): number {
    let businessDaysCount = 0;
    const date = new Date(year, month, 1);

    while (businessDaysCount < 5) {
        // 0 is Sunday
        const dayOfWeek = date.getDay();
        const isBusinessDay = config === 'mon-fri'
            ? (dayOfWeek !== 0 && dayOfWeek !== 6) // Skip Sat & Sun
            : (dayOfWeek !== 0); // Skip only Sun

        if (isBusinessDay) {
            businessDaysCount++;
        }
        if (businessDaysCount < 5) {
            date.setDate(date.getDate() + 1);
        }
    }
    return date.getDate();
}

export async function getPaymentForecast(month?: number, year?: number) {
    const activeProfileId = await getCurrentProfileId();
    if (!activeProfileId) return [];

    const profile = await prisma.profile.findUnique({
        where: { id: activeProfileId }
    });
    if (!profile) return [];

    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const startDate = startOfMonth(new Date(targetYear, targetMonth));
    const endDate = endOfMonth(new Date(targetYear, targetMonth));

    // 1. Pending Expenses
    const pendingExpenses = await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            type: 'expense',
            status: { in: ['pending', 'overdue'] },
            dueDate: {
                gte: startDate,
                lte: endDate
            }
        },
        select: { id: true, description: true, amount: true, dueDate: true, clientId: true }
    });

    // 2. Recurring Expenses (not yet created for this month)
    const recurringFromPast = await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            type: 'expense',
            isRecurring: true,
            date: { lt: startDate }
        },
        distinct: ['description'],
        select: { description: true, amount: true, date: true }
    });

    const currentMonthRecurring = await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            date: { gte: startDate, lte: endDate },
            description: { in: recurringFromPast.map(r => r.description) }
        },
        select: { description: true }
    });

    const projectionItems = recurringFromPast
        .filter(past => !currentMonthRecurring.some(curr => curr.description === past.description))
        .map(item => {
            // Estimate date based on the same day from past records
            const day = item.date.getDate();
            const forecastDate = new Date(targetYear, targetMonth, Math.min(day, endDate.getDate()));
            return {
                id: `recurring-${item.description}`,
                description: `(Recorrente) ${item.description}`,
                amount: item.amount,
                date: forecastDate,
                type: 'recurring' as const
            };
        });

    // 3. Debt Installments with Amortization Simulation
    const debts = await (prisma as any).debt.findMany({
        where: {
            profileId: activeProfileId,
            amount: { gt: 0 }
        }
    });

    const debtItems = [];

    for (const debt of debts) {
        // 3.1 Calculate total planned payments between current month and target month
        // We need to know how much will be paid BEFORE the target month to know the starting balance

        let projectedBalance = debt.amount;

        // Iterate through months from now until the month BEFORE targetMonth/targetYear
        let currentSimDate = new Date();
        currentSimDate.setDate(1); // Start at beginning of current month

        const targetSimDate = new Date(targetYear, targetMonth, 1);

        while (currentSimDate < targetSimDate) {
            const simMonth = currentSimDate.getMonth();
            const simYear = currentSimDate.getFullYear();

            // Get plans for this simulation month
            const plans = await (prisma as any).debtPaymentPlan.findMany({
                where: { debtId: debt.id, month: simMonth, year: simYear }
            });

            if (plans.length > 0) {
                const monthlyTotal = plans.reduce((sum: number, p: any) => sum + p.amount, 0);
                projectedBalance -= monthlyTotal;
            } else if (debt.installmentValue && debt.installmentValue > 0) {
                projectedBalance -= debt.installmentValue;
            }

            // Move to next month
            currentSimDate.setMonth(currentSimDate.getMonth() + 1);
            if (projectedBalance <= 0) break;
        }

        // 3.2 If balance is already zero BEFORE reaching target month, skip this debt
        if (projectedBalance <= 0) continue;

        // 3.3 Check plans for the ACTUAL target month
        const targetPlans = await (prisma as any).debtPaymentPlan.findMany({
            where: { debtId: debt.id, month: targetMonth, year: targetYear }
        });

        if (targetPlans.length > 0) {
            for (const plan of targetPlans) {
                if (projectedBalance <= 0) break;

                const paymentItemAmount = Math.min(plan.amount, projectedBalance);
                const forecastDate = new Date(targetYear, targetMonth, Math.min(plan.day, endDate.getDate()));

                debtItems.push({
                    id: `debt-plan-${plan.id}`,
                    debtId: debt.id,
                    description: `(Dívida) ${debt.description}`,
                    amount: paymentItemAmount,
                    date: forecastDate,
                    type: 'debt' as const
                });

                projectedBalance -= paymentItemAmount;
            }
        } else if (debt.installmentValue && debt.installmentValue > 0) {
            const paymentItemAmount = Math.min(debt.installmentValue, projectedBalance);
            const day = debt.paymentDay || 1;
            const forecastDate = new Date(targetYear, targetMonth, Math.min(day, endDate.getDate()));

            debtItems.push({
                id: `debt-default-${debt.id}`,
                debtId: debt.id,
                description: `(Dívida) ${debt.description}`,
                amount: paymentItemAmount,
                date: forecastDate,
                type: 'debt' as const
            });
        }
    }

    // 4. Actual Income Transactions (Already registered for this month)
    const actualIncomeTransactions = await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            type: 'income',
            date: { gte: startDate, lte: endDate }
        }
    });

    const actualIncomeItems = actualIncomeTransactions.map(t => ({
        id: `actual-income-${t.id}`,
        transactionId: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: 'income' as const,
        clientId: t.clientId || undefined
    }));

    // 5. Recurring Income Projections (Not yet registered for this month)
    const recurringIncomeFromPast = await prisma.transaction.findMany({
        where: {
            profileId: activeProfileId,
            type: 'income',
            isRecurring: true,
            date: { lt: startDate } // Look for recurring income before the current month
        },
        distinct: ['description'],
        select: { description: true, amount: true, date: true, clientId: true, serviceId: true }
    });

    // Skip projections if an actual income with the same description, client, or service already exists in this month
    const incomeItems = recurringIncomeFromPast
        .filter(past => {
            const hasMatch = actualIncomeTransactions.some(curr => {
                // Check description (fuzzy/case-insensitive)
                const descMatch = curr.description.toLowerCase().includes(past.description.toLowerCase()) ||
                    past.description.toLowerCase().includes(curr.description.toLowerCase());

                // Check client/service IDs
                const clientMatch = past.clientId && curr.clientId === past.clientId;
                const serviceMatch = past.serviceId && curr.serviceId === past.serviceId;

                return descMatch || clientMatch || serviceMatch;
            });
            return !hasMatch;
        })
        .map(item => {
            // Logic for "Salário" - 5th Business Day
            const cleanDesc = item.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
            const isSalary = cleanDesc.includes('salario');

            // Item-specific override detection
            let itemConfig: 'mon-fri' | 'mon-sat' = (profile as any).businessDaysConfig || 'mon-sat';
            if (item.description.toLowerCase().includes('seg-sex') || item.description.toLowerCase().includes('5 dias')) {
                itemConfig = 'mon-fri';
            } else if (item.description.toLowerCase().includes('seg-sáb') || item.description.toLowerCase().includes('6 dias')) {
                itemConfig = 'mon-sat';
            }

            const day = isSalary ? calculateFifthBusinessDay(targetMonth, targetYear, itemConfig) : item.date.getDate();

            const forecastDate = new Date(targetYear, targetMonth, Math.min(day, endDate.getDate()));
            return {
                id: `recurring-income-${item.description}`,
                description: `(Projetado) ${item.description}`,
                amount: item.amount,
                date: forecastDate,
                type: 'income' as const
            };
        });

    // 6. Appointments
    const appointments = await (prisma as any).appointment.findMany({
        where: {
            profileId: activeProfileId,
            date: { gte: startDate, lte: endDate }
        }
    });

    const appointmentItems = appointments.map((a: any) => ({
        id: `appointment-${a.id}`,
        description: `(Agenda) ${a.title}`,
        rawDescription: a.description,
        amount: 0,
        date: a.date,
        type: 'appointment' as const,
        location: a.location,
        clientId: a.clientId
    }));

    // Consolidate everything
    const forecast: ForecastItem[] = [
        ...pendingExpenses.map(e => ({
            id: e.id,
            transactionId: e.id,
            description: e.description,
            amount: e.amount,
            date: e.dueDate!,
            type: 'pending' as const,
            location: (e as any).location,
            clientId: e.clientId || undefined
        })),
        ...projectionItems,
        ...debtItems,
        ...actualIncomeItems,
        ...incomeItems,
        ...appointmentItems
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return forecast;
}

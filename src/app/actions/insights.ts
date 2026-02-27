'use server'

import prisma from '@/lib/db'
import { getCurrentProfileId } from './settings'
import { getDashboardSummary } from './dashboard'

export interface SmartInsight {
    type: 'alert' | 'success' | 'info' | 'warning'
    title: string
    message: string
}

export async function getSmartInsights(providedSummary?: any): Promise<SmartInsight[]> {
    const profileId = await getCurrentProfileId();
    if (!profileId) return [];

    const summary = providedSummary || await getDashboardSummary(profileId);
    const insights: SmartInsight[] = [];

    // 1. Check Cash Flow Health
    if (summary.projectedBalance < 0) {
        insights.push({
            type: 'alert',
            title: 'Alerta de Fluxo de Caixa',
            message: 'Suas despesas previstas superam seu saldo atual. Considere renegociar prazos ou reduzir gastos.'
        });
    } else if (summary.pendingExpenses > summary.totalBalance * 0.8) {
        insights.push({
            type: 'warning',
            title: 'Atenção aos Pagamentos',
            message: 'Suas contas pendentes representam mais de 80% do seu saldo atual. Planeje seus pagamentos com cuidado.'
        });
    }

    // 2. High Spending Category Analysis
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const expensesByCategory = await prisma.transaction.groupBy({
        by: ['category'],
        where: {
            profileId,
            type: 'expense',
            date: { gte: monthStart }
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1
    });

    if (expensesByCategory.length > 0 && summary.totalExpenses > 0) {
        const top = expensesByCategory[0];
        const percentage = ((top._sum.amount || 0) / summary.totalExpenses) * 100;

        if (percentage > 40) {
            insights.push({
                type: 'info',
                title: 'Foco de Gastos',
                message: `A categoria "${top.category}" representa ${percentage.toFixed(0)}% das suas despesas este mês. Que tal analisar esses custos?`
            });
        }
    }

    // 3. Goal Contribution
    if (summary.totalBalance > 2000 && summary.projectedBalance > 1000) {
        const goals = await prisma.goal.findMany({
            where: { profileId },
            orderBy: { targetAmount: 'asc' },
            take: 1
        });

        if (goals.length > 0) {
            insights.push({
                type: 'success',
                title: 'Oportunidade de Investimento',
                message: `Você tem um saldo saudável! Que tal destinar uma parte para sua meta "${goals[0].title}"?`
            });
        }
    }

    // Default insight if none triggered
    if (insights.length === 0) {
        insights.push({
            type: 'info',
            title: 'Tudo Sob Controle',
            message: 'Suas finanças parecem equilibradas este mês. Continue acompanhando suas transações regularmente.'
        });
    }

    return insights.slice(0, 3); // Return top 3 most relevant
}

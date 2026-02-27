'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentProfileId } from './settings'

export async function getDebts() {
    const activeProfileId = await getCurrentProfileId();
    return await (prisma as any).debt.findMany({
        where: { profileId: activeProfileId },
        include: { paymentPlans: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createDebt(data: {
    description: string;
    amount: number;
    installmentValue?: number;
    paymentDay?: number;
}) {
    const activeProfileId = await getCurrentProfileId();
    if (!activeProfileId) throw new Error("No active profile found");

    await (prisma as any).debt.create({
        data: {
            ...data,
            profileId: activeProfileId
        }
    });

    revalidatePath('/debts');
    revalidatePath('/');
}

export async function updateDebtAmount(id: number, delta: number, mode: 'increase' | 'decrease') {
    const debt = await (prisma as any).debt.findUnique({
        where: { id },
        select: { amount: true }
    });

    if (!debt) throw new Error("Debt not found");

    const newAmount = mode === 'increase' ? debt.amount + delta : debt.amount - delta;

    await (prisma as any).debt.update({
        where: { id },
        data: { amount: Math.max(0, newAmount) }
    });

    revalidatePath('/debts');
    revalidatePath('/');
}

export async function deleteDebt(id: number) {
    await (prisma as any).debt.delete({
        where: { id }
    });

    revalidatePath('/debts');
    revalidatePath('/');
}

export async function updateDebt(id: number, data: {
    description: string;
    amount: number;
    installmentValue?: number;
    paymentDay?: number;
}) {
    await (prisma as any).debt.update({
        where: { id },
        data
    });

    revalidatePath('/debts');
    revalidatePath('/forecast');
    revalidatePath('/');
}

export async function upsertPaymentPlan(debtId: number, day: number, month: number, year: number, amount: number, isRecurring?: boolean) {
    await (prisma as any).debtPaymentPlan.upsert({
        where: {
            debtId_day_month_year: {
                debtId,
                day,
                month,
                year
            }
        },
        update: { amount },
        create: {
            debtId,
            day,
            month,
            year,
            amount
        }
    });

    if (isRecurring) {
        await (prisma as any).debt.update({
            where: { id: debtId },
            data: {
                installmentValue: amount,
                paymentDay: day
            }
        });
    }

    revalidatePath('/forecast');
    revalidatePath('/debts');
    revalidatePath('/');
}

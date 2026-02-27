'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

import { getCurrentProfileId } from './settings';

export async function getGoals() {
    const activeProfileId = await getCurrentProfileId();
    return await prisma.goal.findMany({
        where: { profileId: activeProfileId },
        orderBy: { createdAt: 'desc' },
        include: {
            profile: true
        }
    });
}

export async function createGoal(data: {
    title: string;
    targetAmount: number;
    deadline?: Date;
    profileId: number;
}) {
    await prisma.goal.create({
        data: {
            ...data,
            currentAmount: 0 // Começa com 0
        }
    });

    revalidatePath('/goals');
    revalidatePath('/');
}

export async function deleteGoal(id: number) {
    await prisma.goal.delete({
        where: { id }
    });

    revalidatePath('/goals');
    revalidatePath('/');
}

export async function updateGoalAmount(id: number, amount: number) {
    await prisma.goal.update({
        where: { id },
        data: { currentAmount: amount }
    });
    revalidatePath('/goals');
}

export async function updateGoal(id: number, data: { title: string; targetAmount: number; deadline?: Date }) {
    await prisma.goal.update({
        where: { id },
        data: {
            title: data.title,
            targetAmount: data.targetAmount,
            deadline: data.deadline
        }
    });
    revalidatePath('/goals');
    revalidatePath('/');
}

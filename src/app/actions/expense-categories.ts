'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getExpenseCategories(profileId?: number) {
    const where = profileId ? { profileId } : {};
    return await prisma.expenseCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
            profile: true
        }
    });
}

export async function createExpenseCategory(data: {
    name: string;
    profileId: number;
}) {
    await prisma.expenseCategory.create({
        data
    });

    revalidatePath('/expense-categories');
    revalidatePath('/');
}

export async function deleteExpenseCategory(id: number) {
    await prisma.expenseCategory.delete({
        where: { id }
    });

    revalidatePath('/expense-categories');
    revalidatePath('/');
    revalidatePath('/transactions'); // Update transactions creation list if needed
}

export async function updateExpenseCategory(id: number, data: {
    name?: string;
}) {
    await prisma.expenseCategory.update({
        where: { id },
        data
    });

    revalidatePath('/expense-categories');
    revalidatePath('/');
    revalidatePath('/transactions');
}

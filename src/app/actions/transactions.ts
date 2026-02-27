'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

import { getCurrentProfileId } from './settings';

export async function getTransactions(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const activeProfileId = await getCurrentProfileId();

    const [transactions, total] = await Promise.all([
        prisma.$queryRaw<any[]>`
            SELECT t.*, 
                   p.name as profileName, p.type as profileType,
                   c.name as clientName,
                   s.name as serviceName
            FROM "Transaction" t
            LEFT JOIN "Profile" p ON t.profileId = p.id
            LEFT JOIN "Client" c ON t.clientId = c.id
            LEFT JOIN "Service" s ON t.serviceId = s.id
            WHERE t.profileId = ${activeProfileId}
            ORDER BY t.date DESC
            LIMIT ${pageSize} OFFSET ${skip}
        `,
        prisma.transaction.count({ where: { profileId: activeProfileId } })
    ]);

    // Format the raw results to match the expected structure
    const formattedTransactions = transactions.map(t => ({
        ...t,
        profile: { name: t.profileName, type: t.profileType },
        client: t.clientName ? { name: t.clientName } : null,
        service: t.serviceName ? { name: t.serviceName } : null,
        date: new Date(t.date),
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
    }));

    return { transactions: formattedTransactions, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getExpenseCategories() {
    // 1. Standard Fallback Categories (Portuguese)
    const standardCategories = [
        'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer',
        'Moradia', 'Trabalho', 'Serviços', 'Assinaturas', 'Impostos', 'Outros'
    ];

    try {
        const activeProfileId = await getCurrentProfileId();

        if (!activeProfileId) {
            // If no profile, we still want the UI to have options
            return standardCategories.map((name, index) => ({ id: `std-${index}`, name }));
        }

        // Get predefined categories from DB
        const dbCategories = await prisma.expenseCategory.findMany({
            where: { profileId: activeProfileId },
            select: { name: true }
        });

        // Get unique categories from actual transactions
        const txCategories = await prisma.transaction.findMany({
            where: { profileId: activeProfileId, type: 'expense' },
            distinct: ['category'],
            select: { category: true }
        });

        // Merge, clean and deduplicate
        const allNames = new Set([
            ...standardCategories,
            ...dbCategories.map(c => c.name),
            ...txCategories.map(t => t.category)
        ]);

        return Array.from(allNames)
            .filter(name => name && name.trim() !== '')
            .sort((a, b) => a.localeCompare(b))
            .map((name, index) => ({ id: `cat-${index}-${activeProfileId}`, name }));
    } catch (error) {
        console.error('Critical failure fetching categories:', error);
        return standardCategories.map((name, index) => ({ id: `std-err-${index}`, name }));
    }
}

export async function getUpcomingExpenses(profileId: number, daysThreshold: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysThreshold);
    futureDate.setHours(23, 59, 59, 999);

    return await prisma.transaction.findMany({
        where: {
            profileId,
            type: 'expense',
            OR: [
                { status: 'pending' },
                { status: 'overdue' }
            ],
            dueDate: {
                lte: futureDate
            }
        },
        orderBy: {
            dueDate: 'asc'
        }
    });
}

export async function createTransaction(data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
    dueDate?: Date;
    profileId: number;
    clientId?: number;
    serviceId?: number;
    quantity?: number;
    status?: string;
    isRecurring?: boolean;
    newServiceName?: string;
    newClientName?: string;
}) {
    let finalServiceId = data.serviceId;
    let finalClientId = data.clientId;

    // Handle new service creation
    if (data.newServiceName) {
        const service = await prisma.service.create({
            data: {
                name: data.newServiceName,
                profileId: data.profileId
            }
        });
        finalServiceId = service.id;
    }

    // Handle new client creation
    if (data.newClientName) {
        const client = await prisma.client.create({
            data: {
                name: data.newClientName,
                profileId: data.profileId
            }
        });
        finalClientId = client.id;
    }

    // If it's an expense and has a category, check/create the category
    if (data.type === 'expense' && data.category) {
        const categoryName = data.category.trim();
        if (categoryName) {
            const existing = await prisma.expenseCategory.findFirst({
                where: {
                    profileId: data.profileId,
                    name: categoryName
                }
            });

            if (!existing) {
                await prisma.expenseCategory.create({
                    data: {
                        profileId: data.profileId,
                        name: categoryName
                    }
                });
            }
        }
    }

    await prisma.transaction.create({
        data: {
            description: data.description,
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: data.date,
            dueDate: data.dueDate,
            quantity: data.quantity || 1, // Default 1
            status: data.status || 'completed',
            isRecurring: data.isRecurring || false,
            clientId: finalClientId,
            serviceId: finalServiceId,
            profileId: data.profileId
        } as any
    });

    revalidatePath('/transactions');
    revalidatePath('/');
    revalidatePath('/services');
    revalidatePath('/clients');
}

export async function deleteTransaction(id: number) {
    await prisma.transaction.delete({
        where: { id }
    });

    revalidatePath('/transactions');
    revalidatePath('/');
}

export async function updateTransaction(id: number, data: {
    description?: string;
    amount?: number;
    type?: 'income' | 'expense';
    category?: string;
    date?: Date;
    dueDate?: Date;
    quantity?: number;
    status?: string;
    isRecurring?: boolean;
    clientId?: number;
    serviceId?: number;
}) {
    await prisma.transaction.update({
        where: { id },
        data
    });

    revalidatePath('/transactions');
    revalidatePath('/');
}

export async function getTransactionsByIds(ids: number[]) {
    const profileId = await getCurrentProfileId();

    // Se não houver IDs, retornar array vazio para evitar erro no Prisma
    if (!ids || ids.length === 0) {
        return [];
    }

    const idsString = ids.join(',');
    const transactions = await prisma.$queryRawUnsafe<any[]>(`
        SELECT t.*, 
               p.name as profileName, p.type as profileType,
               c.name as clientName,
               s.name as serviceName
        FROM "Transaction" t
        LEFT JOIN "Profile" p ON t.profileId = p.id
        LEFT JOIN "Client" c ON t.clientId = c.id
        LEFT JOIN "Service" s ON t.serviceId = s.id
        WHERE t.profileId = ${profileId} AND t.id IN (${idsString})
        ORDER BY t.date DESC
    `);

    return transactions.map(t => ({
        ...t,
        invoiceGenerated: t.invoiceGenerated === 1 || t.invoiceGenerated === true,
        profile: { name: t.profileName, type: t.profileType },
        client: t.clientName ? { name: t.clientName } : null,
        service: t.serviceName ? { name: t.serviceName } : null,
        date: new Date(t.date),
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
    }));
}

export async function markAsInvoiced(ids: number[]) {
    console.log('markAsInvoiced [RAW] called with ids:', ids);
    const profileId = await getCurrentProfileId();

    // Using raw SQL to ensure bypass of stale Prisma Client
    const idsString = ids.join(',');
    await prisma.$executeRawUnsafe(
        `UPDATE "Transaction" SET invoiceGenerated = 1 WHERE profileId = ${profileId} AND id IN (${idsString})`
    );

    revalidatePath('/transactions');
    revalidatePath('/');
}

'use server'

import prisma from '@/lib/db'
import { getCurrentProfileId } from './settings'
import { revalidatePath } from 'next/cache'

export async function getQuotes() {
    const profileId = await getCurrentProfileId();
    return await prisma.quote.findMany({
        where: { profileId },
        include: {
            client: true,
            service: true
        },
        orderBy: { date: 'desc' }
    });
}

export async function getQuoteById(id: number) {
    const profileId = await getCurrentProfileId();
    return await prisma.quote.findFirst({
        where: { id, profileId },
        include: {
            client: true,
            service: true
        }
    });
}

export async function createQuote(data: {
    description: string;
    amount: number;
    quantity?: number;
    date: Date;
    expiresAt?: Date;
    clientId?: number;
    serviceId?: number;
}) {
    const profileId = await getCurrentProfileId();
    const quote = await prisma.quote.create({
        data: {
            ...data,
            profileId,
            quantity: data.quantity || 1,
            status: 'pending'
        }
    });
    revalidatePath('/quotes');
    return quote;
}

export async function updateQuote(id: number, data: any) {
    const profileId = await getCurrentProfileId();
    const quote = await prisma.quote.update({
        where: { id, profileId },
        data
    });
    revalidatePath('/quotes');
    revalidatePath(`/quotes/${id}`);
    return quote;
}

export async function deleteQuote(id: number) {
    const profileId = await getCurrentProfileId();
    await prisma.quote.delete({
        where: { id, profileId }
    });
    revalidatePath('/quotes');
}

export async function convertQuoteToTransaction(id: number) {
    const profileId = await getCurrentProfileId();

    const quote = await prisma.quote.findUnique({
        where: { id, profileId },
        include: { service: true }
    });

    if (!quote) throw new Error("Orçamento não encontrado");

    // Create transaction
    const transaction = await prisma.transaction.create({
        data: {
            profileId,
            description: quote.description,
            amount: quote.amount,
            type: 'income',
            category: quote.service?.name || 'Serviços',
            date: new Date(),
            status: 'completed',
            quantity: quote.quantity,
            clientId: quote.clientId,
            serviceId: quote.serviceId,
        }
    });

    // Update quote status
    await prisma.quote.update({
        where: { id },
        data: { status: 'converted' }
    });

    revalidatePath('/quotes');
    revalidatePath('/transactions');
    return transaction;
}

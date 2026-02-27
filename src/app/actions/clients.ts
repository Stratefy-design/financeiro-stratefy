'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getClients() {
    return await prisma.client.findMany({
        orderBy: { name: 'asc' },
        include: {
            profile: true
        }
    });
}

export async function createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    profileId: number;
}) {
    await prisma.client.create({
        data
    });

    revalidatePath('/clients');
}

export async function deleteClient(id: number) {
    await prisma.client.delete({
        where: { id }
    });

    revalidatePath('/clients');
}

export async function updateClient(id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
}) {
    await prisma.client.update({
        where: { id },
        data
    });

    revalidatePath('/clients');
}

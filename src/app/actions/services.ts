'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getServices(profileId?: number) {
    const where = profileId ? { profileId } : {};
    return await prisma.service.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
            profile: true
        }
    });
}

export async function createService(data: {
    name: string;
    defaultPrice?: number;
    profileId: number;
}) {
    await prisma.service.create({
        data
    });

    revalidatePath('/services');
    revalidatePath('/');
}

export async function deleteService(id: number) {
    await prisma.service.delete({
        where: { id }
    });

    revalidatePath('/services');
    revalidatePath('/');
}

export async function updateService(id: number, data: {
    name?: string;
    defaultPrice?: number;
}) {
    await prisma.service.update({
        where: { id },
        data
    });

    revalidatePath('/services');
    revalidatePath('/');
}

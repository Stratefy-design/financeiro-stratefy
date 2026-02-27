'use server'

import prisma from '@/lib/db'
import { getCurrentProfileId } from './settings'
import { revalidatePath } from 'next/cache'

export async function createAppointment(data: {
    title: string;
    description?: string;
    date: Date;
    location?: string;
    clientId?: number;
}) {
    const profileId = await getCurrentProfileId();
    if (!profileId) throw new Error('Unauthorized');

    const appointment = await (prisma as any).appointment.create({
        data: {
            ...data,
            profileId
        }
    });

    revalidatePath('/forecast');
    return appointment;
}

export async function updateAppointment(id: number, data: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
    clientId?: number;
}) {
    const profileId = await getCurrentProfileId();
    if (!profileId) throw new Error('Unauthorized');

    const appointment = await (prisma as any).appointment.update({
        where: { id, profileId },
        data
    });

    revalidatePath('/forecast');
    return appointment;
}

export async function deleteAppointment(id: number) {
    const profileId = await getCurrentProfileId();
    if (!profileId) throw new Error('Unauthorized');

    await (prisma as any).appointment.delete({
        where: { id, profileId }
    });

    revalidatePath('/forecast');
}

export async function getAppointments(month?: number, year?: number) {
    const profileId = await getCurrentProfileId();
    if (!profileId) return [];

    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    return await (prisma as any).appointment.findMany({
        where: {
            profileId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            client: {
                select: { name: true }
            }
        },
        orderBy: { date: 'asc' }
    });
}

'use server'

import prisma from '@/lib/db'
import { getCurrentProfileId } from './settings'

export async function getUninvoicedIncomes() {
    const activeProfileId = await getCurrentProfileId();

    const transactions = await prisma.$queryRaw<any[]>`
        SELECT t.*, 
               p.name as profileName, p.type as profileType,
               c.name as clientName,
               s.name as serviceName
        FROM "Transaction" t
        LEFT JOIN "Profile" p ON t.profileId = p.id
        LEFT JOIN "Client" c ON t.clientId = c.id
        LEFT JOIN "Service" s ON t.serviceId = s.id
        WHERE t.profileId = ${activeProfileId} 
          AND t.type = 'income'
          AND (t.invoiceGenerated = 0 OR t.invoiceGenerated IS NULL OR t.invoiceGenerated = false)
        ORDER BY t.date DESC
    `;

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

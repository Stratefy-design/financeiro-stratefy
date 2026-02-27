const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const activeProfileId = 2;
        const targetMonth = 1; // February
        const targetYear = 2026;
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

        console.log("\n--- CLIENT REVENUE CHART VERIFICATION ---");
        const getRevenueByClient = async (month, year) => {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59);
            const revenueAgg = await prisma.transaction.groupBy({
                by: ['clientId'],
                where: { profileId: activeProfileId, type: 'income', clientId: { not: null }, date: { gte: startDate, lte: endDate } },
                _sum: { amount: true }
            });
            return revenueAgg;
        };

        const febRevenue = await getRevenueByClient(1, 2026);
        const totalFebChart = febRevenue.reduce((sum, r) => sum + r._sum.amount, 0);
        console.log("Total Feb Chart Revenue (should be 4690):", totalFebChart);

        console.log("\n--- GOAL PROGRESS VERIFICATION ---");
        const allIncomeAgg = await prisma.transaction.aggregate({
            where: { profileId: activeProfileId, type: 'income', status: { in: ['completed', 'paid'] }, date: { lte: endDate } },
            _sum: { amount: true }
        });
        console.log("Cumulative Income (up to Feb):", allIncomeAgg._sum.amount);

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

run();

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    console.log(`--- Checking for ${currentMonth + 1}/${currentYear} ---`);

    const transactions = await prisma.transaction.findMany({
        where: {
            date: { gte: startDate, lte: endDate }
        }
    });

    console.log("\n--- Monthly Transactions ---");
    transactions.forEach(t => {
        console.log(`[${t.status}] ${t.type} - ${t.description}: ${t.amount} (${t.date.toISOString()})`);
    });

    const pendingExpenses = transactions
        .filter(t => t.type === 'expense' && (t.status === 'pending' || t.status === 'overdue'))
        .reduce((sum, t) => sum + t.amount, 0);
    
    console.log(`\nActual Pending Transactions Sum: ${pendingExpenses}`);

    const recurringPast = await prisma.transaction.findMany({
        where: {
            type: 'expense',
            isRecurring: true,
            date: { lt: startDate }
        },
        distinct: ['description'],
        select: { description: true, amount: true }
    });

    console.log("\n--- Recurring Expenses from Past ---");
    recurringPast.forEach(r => console.log(`${r.description}: ${r.amount}`));

    const currentRecurring = transactions
        .filter(t => t.type === 'expense' && recurringPast.some(r => r.description === t.description))
        .map(t => t.description);
    
    const missingRecurring = recurringPast.filter(r => !currentRecurring.includes(r.description));
    const missingRecurringAmount = missingRecurring.reduce((sum, r) => sum + r.amount, 0);

    console.log("\n--- Missing Recurring Projections ---");
    missingRecurring.forEach(r => console.log(`${r.description}: ${r.amount}`));
    console.log(`Missing Recurring Amount: ${missingRecurringAmount}`);

    const debts = await prisma.debt.findMany({
        where: { amount: { gt: 0 } },
        include: {
            paymentPlans: {
                where: { month: currentMonth, year: currentYear }
            }
        }
    });

    console.log("\n--- Debts & Payment Plans ---");
    let monthlyDebtPayments = 0;
    debts.forEach(d => {
        let debtPay = 0;
        if (d.paymentPlans.length > 0) {
            debtPay = d.paymentPlans.reduce((sum, p) => sum + p.amount, 0);
            console.log(`${d.description} (Plan): ${debtPay}`);
        } else {
            debtPay = d.installmentValue || 0;
            console.log(`${d.description} (Installment): ${debtPay}`);
        }
        monthlyDebtPayments += debtPay;
    });
    console.log(`Total Monthly Debt Payments Projection: ${monthlyDebtPayments}`);

    const totalPending = pendingExpenses + missingRecurringAmount + monthlyDebtPayments;
    console.log(`\n>>> TOTAL CALCULATED PENDING EXPENSES: ${totalPending}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

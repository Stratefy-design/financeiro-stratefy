import { Header } from "@/components/layout/Header";
import { getDashboardSummary, getRecentTransactions, getDailyFinancials, getRevenueByClient } from "./actions/dashboard";
import { FinancialsChart } from "@/components/dashboard/FinancialsChart";
import { ClientRevenueChart } from "@/components/dashboard/ClientRevenueChart";
import { getGoals } from "./actions/goals";
import { getExpensesByCategory } from "./actions/dashboard";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { Transaction, Profile } from "@prisma/client";
import { DashboardGoalsWidget } from "@/components/goals/DashboardGoalsWidget";
import Link from "next/link";
import CreateTransactionControl from "@/components/transactions/CreateTransactionControl";
import { getClients } from "./actions/clients";
import { getServices } from "./actions/services";
import { getCurrentProfileId, getCurrentProfile } from "./actions/settings";
import { getTransactions, getExpenseCategories } from "./actions/transactions";
import prisma from "@/lib/db";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import {
  Wallet, TrendingDown, Clock, AlertCircle, PiggyBank,
  ShoppingCart, Utensils, Car, Home as HomeIcon, Briefcase, Heart, Zap,
  Smartphone, Plane, GraduationCap, Dumbbell, Gift, FileText,
  CreditCard, CircleDollarSign
} from "lucide-react";

// Utils
type TransactionWithProfile = Transaction & { profile: Profile };

import { NotificationBell } from "@/components/layout/NotificationBell";
import { DashboardFilter } from "@/components/dashboard/DashboardFilter";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSmartInsights } from "./actions/insights";
import { SmartInsightsWidget } from "@/components/dashboard/SmartInsightsWidget";

import { redirect } from "next/navigation";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ month?: string, year?: string }>
}) {
  const params = await searchParams;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthParam = params?.month ? parseInt(params.month) : currentMonth;
  const yearParam = params?.year ? parseInt(params.year) : currentYear;

  const currentProfileId = await getCurrentProfileId();
  if (!currentProfileId) redirect('/sign-in');

  // Load basic info and summary in parallel
  const [summary, prevSummary, recentTransactions, dailyFinancials, clientRevenue, categoryExpenses, goals, clients, services, expenseCategories] = await Promise.all([
    getDashboardSummary(currentProfileId, monthParam, yearParam),
    getDashboardSummary(currentProfileId, (monthParam - 1 < 0 ? 11 : monthParam - 1), (monthParam - 1 < 0 ? yearParam - 1 : yearParam)),
    getRecentTransactions(monthParam, yearParam),
    getDailyFinancials(monthParam, yearParam),
    getRevenueByClient(monthParam, yearParam),
    getExpensesByCategory(monthParam, yearParam),
    getGoals(),
    getClients(),
    getServices(currentProfileId),
    getExpenseCategories()
  ]);

  // Now that we have summary, get insights (avoiding redundant calls inside)
  const insights = await getSmartInsights(summary);

  const currentProfile = await prisma.profile.findUnique({ where: { id: currentProfileId } });

  // Calculate Variation
  const currentBalance = summary.totalBalance;
  const previousBalance = prevSummary.totalBalance;

  let percentageChange = 0;
  if (previousBalance !== 0) {
    percentageChange = ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;
  } else if (currentBalance !== 0) {
    percentageChange = 100;
  }

  const isPositive = percentageChange >= 0;
  const formattedChange = `${isPositive ? '+' : ''}${percentageChange.toFixed(2)}%`;

  // Formatador de Moeda
  const toCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  };

  const hour = new Date().getHours();
  let greeting = "Bom dia";
  if (hour >= 12) greeting = "Boa tarde";
  if (hour >= 18) greeting = "Boa noite";

  const firstName = currentProfile?.name.split(' ')[0] || 'Visitante';
  const progressPercentage = summary.revenueGoal > 0 ? (summary.totalBalance / summary.revenueGoal) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Humanized Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between px-8 py-6 mb-2 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
            <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {greeting}, <span className="text-[#8058FF] dark:text-[#8058FF]">{firstName}</span>.
          </h1>
          <p className="text-gray-500 dark:text-zinc-400">
            {summary.totalBalance > 0
              ? "O fluxo de caixa está positivo hoje. Ótimo trabalho! 🚀"
              : "Vamos organizar as finanças e buscar novas metas! 💪"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CreateTransactionControl
            clients={clients}
            services={services}
            currentProfileId={currentProfileId}
            expenseCategories={expenseCategories}
          />
        </div>
      </header>

      {/* Filters */}
      <div className="px-8 flex justify-end">
        <DashboardFilter />
      </div>

      {/* KPI Cards (Moved back to top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 px-8 mb-8">
        {/* HERO CARD - Saldo Total */}
        <div className="bg-[#8058FF] p-6 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/30">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="text-white" size={24} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive
              ? 'bg-white/20 text-white'
              : 'bg-red-500/20 text-white'
              }`}>
              {formattedChange}
            </span>
          </div>
          <h3 className="text-sm font-medium text-indigo-100 mb-1">Saldo Total</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-all">
            {toCurrency(summary.totalBalance)}
          </p>
        </div>

        {/* Despesas Totais */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingDown className="text-red-500" size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Despesas Totais</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight break-all">- {toCurrency(summary.totalExpenses)}</p>
        </div>

        {/* Receita Pendente */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="text-yellow-500" size={24} />
            </div>
            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">A Receber</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Receita Pendente</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight break-all">
            {toCurrency(summary.pendingRevenue)}
          </p>
        </div>

        {/* Despesas Pendentes */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">A Pagar</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Despesas Pendentes</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight break-all">
            {toCurrency(summary.pendingExpenses)}
          </p>
        </div>

        {/* Saldo Previsto */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group text-left">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl group-hover:scale-110 transition-transform">
              <PiggyBank className="text-[#8058FF]" size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Saldo Previsto</h3>
          <p className={`text-2xl sm:text-3xl font-bold tracking-tight break-all ${summary.projectedBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
            {toCurrency(summary.projectedBalance)}
          </p>
        </div>

        {/* Total em Dívidas (Destaque) */}
        <Link href="/debts" className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group text-left">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard className="text-red-500" size={24} />
            </div>
            <span className="text-xs font-bold text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Dívidas Ativas</span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-1">Total em Dívidas</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight break-all">
            {toCurrency(summary.totalDebts)}
          </p>
        </Link>
      </div>

      {/* Recent Activity & Insights */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transações Recentes</h3>
            <Link href="/transactions" className="text-xs font-medium text-[#8058FF] hover:text-[#8058FF]/80">Ver todas</Link>
          </div>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <EmptyState
                title="Sem transações"
                description="Nenhuma transação encontrada para este período."
                action={
                  <Link href="/transactions" className="text-sm font-medium text-[#8058FF] hover:underline">
                    Registrar nova transação
                  </Link>
                }
              />
            ) : (
              recentTransactions.map((t: any) => {
                const transaction = t as TransactionWithProfile;
                return (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-zinc-700/50 last:border-0 group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 px-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#8058FF] transition-colors">{transaction.description}</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500">{formatDate(new Date(transaction.date))} • {transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {toCurrency(transaction.amount)}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${transaction.status === 'paid' || transaction.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : transaction.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                        {transaction.status === 'completed' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <SmartInsightsWidget insights={insights} />
        </div>
      </div>

      {/* Charts Section (Placeholder + Real Transactions) */}
      <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fluxo de Caixa (30 dias)</h3>
          </div>
          <div className="h-[300px]">
            <FinancialsChart data={dailyFinancials} />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Despesas por Categoria</h3>
          </div>
          <div className="flex-1 min-h-[300px]">
            <CategoryExpenseChart data={categoryExpenses} />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Faturamento por Cliente</h3>
          </div>
          <div className="h-[300px]">
            <ClientRevenueChart data={clientRevenue} />
          </div>
        </div>

        {/* Minhas Metas - Moved down or kept separate */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm min-h-[200px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Minhas Metas</h3>
            <Link href="/goals" className="text-xs font-medium text-[#8058FF] hover:text-[#8058FF]/80">Gerenciar</Link>
          </div>
          <DashboardGoalsWidget goals={goals.map(g => ({ ...g, currentAmount: summary.totalBalance }))} />
        </div>
      </div>
    </div>
  );
}

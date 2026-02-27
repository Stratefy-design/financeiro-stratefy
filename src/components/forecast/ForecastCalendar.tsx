'use client';

import { useState, useMemo, useTransition } from 'react';
import {
    Calendar as CalendarIcon,
    List,
    Clock,
    CreditCard,
    AlertTriangle,
    Edit2,
    Check,
    X as LucideX,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    CircleDollarSign,
    ChevronLeft,
    ChevronRight,
    Plus,
    CalendarCheck,
    ArrowRight
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    format,
    isToday,
    isSameMonth
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ForecastItem } from '@/app/actions/forecast';
import { upsertPaymentPlan } from '@/app/actions/debts';
import { useToast } from '@/contexts/ToastContext';
import TransactionModal from '../transactions/TransactionModal';
import { AppointmentModal } from './AppointmentModal';

interface ForecastCalendarProps {
    initialData: ForecastItem[];
    currentMonth: number;
    currentYear: number;
    clients?: any[];
    services?: any[];
    debts?: any[];
    currentProfileId?: number;
    expenseCategories?: any[];
}

export function ForecastCalendar({
    initialData,
    currentMonth,
    currentYear,
    clients = [],
    services = [],
    debts = [],
    currentProfileId = 0,
    expenseCategories = []
}: ForecastCalendarProps) {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editDay, setEditDay] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);

    // Edit states for modals
    const [editAppointment, setEditAppointment] = useState<any>(null);
    const [editTransaction, setEditTransaction] = useState<any>(null);
    const [isFetchingItem, setIsFetchingItem] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { addToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Interactivity state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showDebtSelector, setShowDebtSelector] = useState(false);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);

    const handleEditItem = async (item: ForecastItem) => {
        if (item.type === 'debt') {
            setEditingId(item.id);
            setEditValue(item.amount.toString());
            setEditDay(new Date(item.date).getDate().toString());
            return;
        }

        if (item.type === 'appointment') {
            const appointmentId = typeof item.id === 'string' ? parseInt(item.id.replace('appointment-', '')) : item.id;
            setEditAppointment({
                id: appointmentId,
                title: item.description.replace('(Agenda) ', ''),
                description: item.rawDescription,
                location: item.location,
                clientId: item.clientId,
                date: item.date
            });
            setShowAppointmentModal(true);
            return;
        }

        if (item.transactionId) {
            setIsFetchingItem(true);
            try {
                const { getTransactionsByIds } = await import('@/app/actions/transactions');
                const transactions = await getTransactionsByIds([item.transactionId]);
                if (transactions && transactions.length > 0) {
                    setEditTransaction(transactions[0]);
                    setShowTransactionModal(true);
                }
            } catch (error) {
                addToast('Erro ao carregar dados da transação.', 'error');
            } finally {
                setIsFetchingItem(false);
            }
            return;
        }

        // Handle projected/recurring items (no transactionId)
        if (item.type === 'income' || item.type === 'recurring' || item.type === 'pending') {
            const cleanDescription = item.description.replace(/^\((Projetado|Recorrente|Pendente)\)\s*/i, '');
            const itemType = item.type === 'income' ? 'income' : 'expense';

            setEditTransaction({
                description: cleanDescription,
                amount: item.amount,
                type: itemType,
                category: itemType === 'income' ? cleanDescription : '',
                date: item.date,
                dueDate: item.type === 'pending' || item.type === 'recurring' ? item.date : undefined,
                status: 'pending',
                isRecurring: item.type === 'recurring',
                clientId: item.clientId,
                quantity: 1
            } as any);
            setShowTransactionModal(true);
        }
    };

    const currentPeriod = useMemo(() => new Date(currentYear, currentMonth), [currentYear, currentMonth]);

    const handleNavigate = (direction: 'prev' | 'next') => {
        const date = new Date(currentYear, currentMonth);
        if (direction === 'prev') date.setMonth(date.getMonth() - 1);
        else date.setMonth(date.getMonth() + 1);

        const params = new URLSearchParams(searchParams.toString());
        params.set('month', date.getMonth().toString());
        params.set('year', date.getFullYear().toString());

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
            router.refresh();
        });
    };

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentPeriod), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(currentPeriod), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentPeriod]);

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSavePlan = async (debtId: number, day: number, amount: number, isRecurring?: boolean) => {
        try {
            await upsertPaymentPlan(debtId, day, currentMonth, currentYear, amount, isRecurring);
            addToast('Planejamento atualizado', 'success');
            setEditingId(null);
            setShowDebtSelector(false);
            setSelectedDate(null);
            setIsRecurring(false);
            router.refresh();
        } catch (error) {
            addToast('Erro ao atualizar planejamento', 'error');
        }
    };

    const getTypeStyles = (type: ForecastItem['type']) => {
        switch (type) {
            case 'pending': return {
                icon: AlertTriangle,
                bg: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
                cardBg: 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
                text: 'text-red-700 dark:text-red-300',
                dot: 'bg-red-500',
                label: 'Vencimento'
            };
            case 'recurring': return {
                icon: Clock,
                bg: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
                cardBg: 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
                text: 'text-red-700 dark:text-red-300',
                dot: 'bg-red-500',
                label: 'Recorrente'
            };
            case 'debt': return {
                icon: CreditCard,
                bg: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
                cardBg: 'bg-red-50/50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',
                text: 'text-red-700 dark:text-red-300',
                dot: 'bg-red-500',
                label: 'Dívida'
            };
            case 'income': return {
                icon: CircleDollarSign,
                bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
                cardBg: 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
                text: 'text-emerald-700 dark:text-emerald-300',
                dot: 'bg-emerald-500',
                label: 'Receita'
            };
            case 'appointment': return {
                icon: CalendarCheck,
                bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
                cardBg: 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
                text: 'text-blue-700 dark:text-blue-300',
                dot: 'bg-blue-500',
                label: 'Compromisso'
            };
        }
    };

    const totalExpenses = initialData.filter(i => i.type !== 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = initialData.filter(i => i.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const projectedBalance = totalIncome - totalExpenses;

    const X = LucideX;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-6">
                    <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-3 lg:gap-8">
                        <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-0 bg-red-50/50 lg:bg-transparent dark:bg-red-900/10 lg:dark:bg-transparent rounded-xl">
                            <div className="p-2 lg:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg lg:rounded-xl">
                                <TrendingDown className="text-red-500 size-4 lg:size-6" />
                            </div>
                            <div>
                                <h3 className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">A Pagar</h3>
                                <p className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white leading-none">{toCurrency(totalExpenses)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-0 bg-emerald-50/50 lg:bg-transparent dark:bg-emerald-900/10 lg:dark:bg-transparent rounded-xl">
                            <div className="p-2 lg:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg lg:rounded-xl">
                                <TrendingUp className="text-emerald-500 size-4 lg:size-6" />
                            </div>
                            <div>
                                <h3 className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">A Receber</h3>
                                <p className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white leading-none">{toCurrency(totalIncome)}</p>
                            </div>
                        </div>

                        <div className="col-span-2 flex items-center gap-3 lg:gap-4 p-3 lg:p-0 bg-indigo-50/50 lg:bg-transparent dark:bg-indigo-900/10 lg:dark:bg-transparent rounded-xl">
                            <div className="p-2 lg:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg lg:rounded-xl">
                                <PiggyBank className="text-[#8058FF] size-4 lg:size-6" />
                            </div>
                            <div>
                                <h3 className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Saldo Previsto</h3>
                                <p className={`text-base lg:text-xl font-bold leading-none ${projectedBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                                    {toCurrency(projectedBalance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-zinc-700">
                            <button
                                onClick={() => handleNavigate('prev')}
                                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[120px] text-center capitalize">
                                {format(currentPeriod, 'MMMM yyyy', { locale: ptBR })}
                            </span>
                            <button
                                onClick={() => handleNavigate('next')}
                                className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
                            >
                                <List size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
                            >
                                <CalendarIcon size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        {/* Mobile List (Cards) */}
                        <div className="lg:hidden divide-y divide-gray-50 dark:divide-zinc-700/50">
                            {initialData.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 italic text-sm">Nenhum pagamento previsto.</div>
                            ) : (
                                initialData.map((item) => {
                                    const { icon: Icon, bg, text } = getTypeStyles(item.type)!;
                                    return (
                                        <div key={item.id} onClick={() => handleEditItem(item)} className="p-4 active:bg-gray-50 dark:active:bg-zinc-700/50 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{format(new Date(item.date), 'dd/MM/yyyy')}</span>
                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${bg}`}>
                                                    <Icon size={10} /> {item.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-bold truncate max-w-[200px] ${text}`}>{item.description}</span>
                                                <span className={`text-sm font-black ${text}`}>
                                                    {item.type === 'income' ? '+' : '-'} {toCurrency(item.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop Table */}
                        <table className="hidden lg:table w-full text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Descrição</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Valor</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Tipo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-700">
                                {initialData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Nenhum pagamento previsto.</td>
                                    </tr>
                                ) : (
                                    initialData.map((item) => {
                                        const { icon: Icon, bg, label, text } = getTypeStyles(item.type)!;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {format(new Date(item.date), 'dd/MM', { locale: ptBR })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm group-hover:text-[#8058FF] transition-colors ${text}`}>{item.description}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-sm font-bold ${text}`}>{item.type === 'income' ? '+' : '-'} {toCurrency(item.amount)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bg}`}>
                                                        <Icon size={12} /> {label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* CALENDAR GRID VIEW */
                <div className="bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl relative animate-in fade-in duration-500 overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                            <div key={idx} className="py-2.5 lg:py-4 text-center text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-[minmax(60px,auto)] lg:auto-rows-[minmax(120px,auto)]">
                        {calendarDays.map((day, idx) => {
                            const dayItems = initialData.filter(item => isSameDay(new Date(item.date), day));
                            const isCurrentMonth = isSameMonth(day, currentPeriod);

                            return (
                                <div
                                    key={idx}
                                    onClick={() => isCurrentMonth && setSelectedDate(day)}
                                    className={`p-1 lg:p-2 border-r border-b border-gray-50 dark:border-zinc-800/50 transition-all group relative cursor-pointer min-h-[60px] lg:min-h-[120px]
                                        ${!isCurrentMonth ? 'bg-gray-50/30 dark:bg-zinc-800/10' : 'bg-white dark:bg-zinc-900'}
                                        ${idx % 7 === 6 ? 'border-r-0' : ''}
                                        ${selectedDate && isSameDay(selectedDate, day) ? 'z-[100] ring-2 lg:ring-4 ring-indigo-500/20 shadow-2xl scale-[1.02] bg-white dark:bg-zinc-800' : 'hover:z-10 hover:bg-gray-50 dark:hover:bg-zinc-800/40'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1 lg:mb-2 text-[10px] lg:text-xs">
                                        <span className={`font-bold tabular-nums w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center rounded-full
                                            ${isToday(day) ? 'bg-[#8058FF] text-white' : isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-zinc-600'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {isCurrentMonth && (
                                            <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus size={14} className="text-[#8058FF]" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-0.5 lg:space-y-1">
                                        {dayItems.map((item) => {
                                            const { dot, cardBg, text } = getTypeStyles(item.type)!;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditItem(item);
                                                    }}
                                                    className={`flex flex-col p-1 lg:p-1.5 rounded-md lg:rounded-lg border transition-all cursor-pointer overflow-hidden group/item ${cardBg}`}
                                                >
                                                    <div className="flex items-center gap-1 lg:gap-1.5 mb-0.5 lg:mb-1 shrink-0">
                                                        <div className={`w-1 lg:w-1.5 h-1 lg:h-1.5 rounded-full ${dot} shrink-0`} />
                                                        <span className={`text-[8px] lg:text-[10px] font-bold truncate leading-tight ${text}`}>
                                                            {item.description.replace(/\(.*\)\s*/, '')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-1">
                                                        {item.type !== 'appointment' && (
                                                            <span className={`text-[8px] lg:text-[10px] font-bold whitespace-nowrap ${text}`}>
                                                                {toCurrency(item.amount)}
                                                            </span>
                                                        )}
                                                        {item.type === 'debt' && (
                                                            <div className="hidden lg:block opacity-0 group-hover/item:opacity-100 p-0.5 text-gray-400 hover:text-inherit rounded-sm transition-all">
                                                                <Edit2 size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Menu overlay - Updated for better visibility/spacing */}
                                    {selectedDate && isSameDay(selectedDate, day) && !editingId && !showDebtSelector && (
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%+24px)] min-w-[140px] bg-white dark:bg-zinc-900 p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in duration-200 border border-indigo-500/30 dark:border-indigo-500/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] sm:w-[120%]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between px-1">
                                                <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Ações</h4>
                                                <button
                                                    onClick={() => setSelectedDate(null)}
                                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <LucideX size={14} />
                                                </button>
                                            </div>

                                            <div className="space-y-1.5">
                                                <button
                                                    onClick={() => setShowTransactionModal(true)}
                                                    className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95"
                                                >
                                                    <Plus size={14} className="stroke-[3]" />
                                                    Transação
                                                </button>

                                                <button
                                                    onClick={() => setShowDebtSelector(true)}
                                                    className="w-full py-2 px-3 text-xs font-bold text-indigo-600 bg-indigo-500/5 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/10 transition-all flex items-center gap-2 active:scale-95"
                                                >
                                                    <CreditCard size={14} className="stroke-[2.5]" />
                                                    Dívida
                                                </button>

                                                <button
                                                    onClick={() => setShowAppointmentModal(true)}
                                                    className="w-full py-2 px-3 text-xs font-bold text-blue-600 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all flex items-center gap-2 active:scale-95"
                                                >
                                                    <CalendarCheck size={14} className="stroke-[2.5]" />
                                                    Agenda
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Debt Selection overlay - Floating outside cell boundaries */}
                                    {showDebtSelector && selectedDate && isSameDay(selectedDate, day) && (
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-[calc(100%+40px)] min-h-[140px] max-h-[180px] bg-white dark:bg-zinc-900 p-3 flex flex-col animate-in slide-in-from-bottom-2 duration-200 border border-indigo-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between mb-2 border-b border-gray-100 dark:border-zinc-800 pb-1.5 shrink-0">
                                                <div>
                                                    <h4 className="text-[9px] font-black uppercase text-indigo-500">Selecionar</h4>
                                                    <p className="text-[7px] text-gray-400 font-medium leading-none">Qual dívida?</p>
                                                </div>
                                                <button onClick={() => setShowDebtSelector(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                                    <LucideX size={12} className="text-gray-400" />
                                                </button>
                                            </div>

                                            <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
                                                {debts.filter(d => d.amount > 0).map(debt => (
                                                    <button
                                                        key={debt.id}
                                                        onClick={() => {
                                                            setEditingId(`new-plan-${debt.id}`);
                                                            setEditValue((debt.installmentValue || 0).toString());
                                                            setEditDay(selectedDate!.getDate().toString());
                                                        }}
                                                        className="w-full text-left p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-gray-50 dark:border-zinc-800 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all group"
                                                    >
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <p className="text-[9px] font-black text-gray-700 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{debt.description}</p>
                                                            <ArrowRight size={8} className="text-gray-300 group-hover:text-indigo-500 transition-all" />
                                                        </div>
                                                        <p className="text-[8px] font-bold text-gray-400">Saldo: <span className="text-indigo-500/70">{toCurrency(debt.amount)}</span></p>
                                                    </button>
                                                ))}
                                                {debts.filter(d => d.amount > 0).length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                                                        <CreditCard size={20} className="text-gray-200" />
                                                        <p className="text-[10px] text-center text-gray-400 font-medium">Nenhuma dívida<br />em aberto.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Edit/Schedule overlay - Floating outside cell boundaries */}
                                    {editingId && (isSameDay(day, selectedDate || new Date()) || dayItems.some(i => i.id === editingId)) && (
                                        <div
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[calc(100%+30px)] bg-white dark:bg-zinc-900 p-3 flex flex-col justify-center gap-2.5 animate-in fade-in scale-in duration-200 border border-emerald-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="text-center">
                                                <h4 className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                                                    {typeof editingId === 'string' && editingId.startsWith('new-plan-') ? 'Agendar' : 'Ajustar'}
                                                </h4>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                                                    <label className="text-[7px] text-gray-400 uppercase font-black mb-0.5 block">Valor</label>
                                                    <div className="relative">
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-500">R$</span>
                                                        <input
                                                            autoFocus
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full bg-transparent pl-4 pr-1 py-0 text-xs font-black text-gray-900 dark:text-white outline-none focus:ring-0"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-1.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                                                    <label className="text-[7px] text-gray-400 uppercase font-black mb-0.5 block">Dia</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="31"
                                                        className="w-full bg-transparent px-0 py-0 text-xs font-bold text-gray-900 dark:text-white outline-none focus:ring-0"
                                                        value={editDay}
                                                        onChange={(e) => setEditDay(e.target.value)}
                                                    />
                                                </div>

                                                <label className="flex items-center gap-2 px-1 py-1 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            id="is-recurring-forecast"
                                                            checked={isRecurring}
                                                            onChange={(e) => setIsRecurring(e.target.checked)}
                                                        />
                                                        <div className={`w-3.5 h-3.5 border-2 rounded transition-colors ${isRecurring ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 dark:border-zinc-700'}`}>
                                                            {isRecurring && <Check size={10} className="text-white mx-auto" />}
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-tighter">Recorrente?</span>
                                                </label>
                                            </div>

                                            <div className="flex gap-1.5 mt-0.5">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setShowDebtSelector(false);
                                                        setSelectedDate(null);
                                                        setIsRecurring(false);
                                                    }}
                                                    className="flex-1 py-1.5 text-[9px] font-bold text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                                >
                                                    Sair
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        let debtIdToSave: number;
                                                        if (typeof editingId === 'string' && editingId.startsWith('new-plan-')) {
                                                            debtIdToSave = parseInt(editingId.replace('new-plan-', ''));
                                                        } else {
                                                            debtIdToSave = dayItems.find(i => i.id === editingId)!.debtId!;
                                                        }
                                                        handleSavePlan(debtIdToSave, parseInt(editDay), parseFloat(editValue), isRecurring);
                                                    }}
                                                    className="flex-1 py-1.5 text-[9px] font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                                                >
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Reusable Transaction Modal */}
            <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => {
                    setShowTransactionModal(false);
                    setSelectedDate(null);
                    setEditTransaction(null);
                    router.refresh();
                }}
                clients={clients}
                services={services}
                currentProfileId={currentProfileId}
                expenseCategories={expenseCategories}
                initialDate={selectedDate || undefined}
                initialData={editTransaction}
            />

            {/* Appointment Modal */}
            <AppointmentModal
                isOpen={showAppointmentModal}
                onClose={() => {
                    setShowAppointmentModal(false);
                    setSelectedDate(null);
                    setEditAppointment(null);
                    router.refresh();
                }}
                selectedDate={selectedDate || undefined}
                clients={clients}
                initialData={editAppointment}
            />

            {isFetchingItem && (
                <div className="fixed inset-0 z-[300] bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-100 dark:border-zinc-800">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Carregando dados...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

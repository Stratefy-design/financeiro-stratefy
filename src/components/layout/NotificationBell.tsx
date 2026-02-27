'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, AlertCircle } from 'lucide-react';
import { getUpcomingExpenses, updateTransaction } from '@/app/actions/transactions';
import { useToast } from '@/contexts/ToastContext';

interface UpcomingExpense {
    id: number;
    description: string;
    amount: number;
    dueDate?: Date | null;
    date: Date;
    status: string;
}

export function NotificationBell({ profileId }: { profileId: number }) {
    const [expenses, setExpenses] = useState<UpcomingExpense[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<UpcomingExpense | null>(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Sem data';
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
    };

    const { addToast } = useToast();

    const markAsPaid = async (id: number) => {
        try {
            await updateTransaction(id, { status: 'completed' });
            addToast('Conta marcada como paga! ✅', 'success');
            // Optimistically remove from list
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error(error);
            addToast('Erro ao atualizar conta.', 'error');
        }
    };

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await getUpcomingExpenses(profileId);
                // Map to ensure dueDate is present (fallback to date if needed)
                const mappedData: UpcomingExpense[] = data.map((item: any) => ({
                    ...item,
                    dueDate: item.dueDate ? new Date(item.dueDate) : new Date(item.date)
                }));
                setExpenses(mappedData);

                // Check for overdue expenses and show discrete popup
                // Show ONLY if not shown before in this session
                const overdue = mappedData.filter(e => e.dueDate && new Date(e.dueDate) < new Date() && e.status !== 'completed' && e.status !== 'paid');
                const hasShownKey = `hasShownOverdueToast_${profileId}`;
                const hasShown = sessionStorage.getItem(hasShownKey);

                if (overdue.length > 0 && !hasShown) {
                    addToast(`Você tem ${overdue.length} conta(s) vencida(s). Verifique suas notificações.`, 'error');
                    sessionStorage.setItem(hasShownKey, 'true');
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();
    }, [profileId, addToast]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const overdueCount = expenses.filter(e => {
        if (!e.dueDate) return false;
        return new Date(e.dueDate) < new Date() && e.status !== 'completed';
    }).length;

    const upcomingCount = expenses.length;
    const hasNotifications = upcomingCount > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
                <Bell size={20} />
                {hasNotifications && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notificações</h3>
                        {upcomingCount > 0 && <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">{upcomingCount} pendentes</span>}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-xs text-gray-500">Carregando...</div>
                        ) : upcomingCount === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Tudo em dia! 🎉</p>
                                <p className="text-xs text-gray-400 dark:text-zinc-500">Nenhuma conta vencendo em breve.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {expenses.map(expense => {
                                    const isOverdue = expense.dueDate && new Date(expense.dueDate) < new Date() && new Date(expense.dueDate).toDateString() !== new Date().toDateString();
                                    const isToday = expense.dueDate && new Date(expense.dueDate).toDateString() === new Date().toDateString();

                                    return (
                                        <div
                                            key={expense.id}
                                            onClick={() => {
                                                setIsOpen(false);
                                                setSelectedExpense(expense);
                                            }}
                                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{expense.description}</p>
                                                <span className="text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap ml-2">{toCurrency(expense.amount)}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2">
                                                    {isOverdue ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md">
                                                            <AlertCircle size={10} />
                                                            Vencida
                                                        </span>
                                                    ) : isToday ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md">
                                                            <AlertCircle size={10} />
                                                            Vence Hoje
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-zinc-400">
                                                            <Calendar size={10} />
                                                            {formatDate(expense.dueDate ? new Date(expense.dueDate) : null)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedExpense && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Detalhes da Conta</h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">O que você gostaria de fazer?</p>

                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-zinc-400">Descrição</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedExpense.description}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-zinc-400">Valor</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{toCurrency(selectedExpense.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-zinc-400">Vencimento</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedExpense.dueDate ? new Date(selectedExpense.dueDate) : null)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedExpense(null)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Lembrar Depois
                                </button>
                                <button
                                    onClick={() => {
                                        markAsPaid(selectedExpense.id);
                                        setSelectedExpense(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                                >
                                    Pagar Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Info, Calendar, Pencil } from 'lucide-react';
import { createDebt, deleteDebt, updateDebtAmount, upsertPaymentPlan, updateDebt as updateDebtAction } from '@/app/actions/debts';
import { useToast } from '@/contexts/ToastContext';

export function DebtList({ debts }: { debts: any[] }) {
    const { addToast } = useToast();
    const [isAdjusting, setIsAdjusting] = useState<number | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentMode, setAdjustmentMode] = useState<'increase' | 'decrease'>('decrease');
    const [isScheduling, setIsScheduling] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState<any | null>(null);
    const [editIsPending, setEditIsPending] = useState(false);
    const [scheduleData, setScheduleData] = useState({
        amount: '',
        day: new Date().getDate().toString(),
        month: (new Date().getMonth()).toString(),
        year: new Date().getFullYear().toString(),
        isRecurring: false
    });

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const calculatePayoffDate = (debt: any) => {
        if (!debt.amount || debt.amount <= 0) return null;

        // Simulação de amortização mensal
        let balance = debt.amount;
        let currentDate = new Date();
        currentDate.setDate(1); // Inicia no mês atual

        const MAX_MONTHS = 360; // Limite de 30 anos para evitar loops infinitos
        let months = 0;

        while (balance > 0 && months < MAX_MONTHS) {
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            // Verifica planos de pagamento específicos para este mês
            const monthPlans = debt.paymentPlans?.filter((p: any) => p.month === currentMonth && p.year === currentYear) || [];

            if (monthPlans.length > 0) {
                const plansTotal = monthPlans.reduce((sum: number, p: any) => sum + p.amount, 0);
                balance -= plansTotal;
            } else if (debt.installmentValue && debt.installmentValue > 0) {
                balance -= debt.installmentValue;
            } else {
                // Se não houver parcela cadastrada, não há como prever a quitação
                return 'Indefinida (Sem parcelas)';
            }

            if (balance <= 0) break;

            // Avança para o próximo mês
            currentDate.setMonth(currentDate.getMonth() + 1);
            months++;
        }

        if (months >= MAX_MONTHS) return 'Indefinida (+30 anos)';

        return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);
    };

    const handleAdjust = async (id: number) => {
        const amount = parseFloat(adjustmentAmount);
        if (isNaN(amount) || amount <= 0) {
            addToast('Valor inválido', 'error');
            return;
        }

        try {
            await updateDebtAmount(id, amount, adjustmentMode);
            addToast('Dívida atualizada com sucesso', 'success');
            setIsAdjusting(null);
            setAdjustmentAmount('');
        } catch (error) {
            addToast('Erro ao atualizar dívida', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta dívida? Isso não poderá ser desfeito.')) {
            try {
                await deleteDebt(id);
                addToast('Dívida excluída', 'success');
            } catch (error) {
                addToast('Erro ao excluir dívida', 'error');
            }
        }
    };

    const handleSchedule = async (id: number) => {
        const amount = parseFloat(scheduleData.amount);
        const day = parseInt(scheduleData.day);
        const month = parseInt(scheduleData.month);
        const year = parseInt(scheduleData.year);
        const isRecurring = (scheduleData as any).isRecurring;

        if (isNaN(amount) || amount <= 0 || isNaN(day) || day < 1 || day > 31) {
            addToast('Dados inválidos. Verifique o valor e o dia.', 'error');
            return;
        }

        try {
            await upsertPaymentPlan(id, day, month, year, amount, isRecurring);
            addToast('Parcela agendada com sucesso', 'success');
            setIsScheduling(null);
            setScheduleData(prev => ({ ...prev, amount: '', isRecurring: false }));
        } catch (error) {
            addToast('Erro ao agendar parcela', 'error');
        }
    };

    if (debts.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-zinc-700">
                <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Info size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sem dívidas ativas</h3>
                <p className="text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Você ainda não cadastrou nenhuma dívida. Use o botão acima para começar.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debts.map((debt) => (
                <div key={debt.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#8058FF] transition-colors">{debt.description}</h4>
                            <span className="text-xs text-gray-400">Cadastrada em {new Date(debt.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button
                            onClick={() => handleDelete(debt.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Excluir dívida"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase">Saldo Atual</span>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {toCurrency(debt.amount)}
                            </p>
                            {debt.amount > 0 && (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit border border-emerald-100 dark:border-emerald-500/20">
                                    <span className="uppercase opacity-70">Quitação:</span>
                                    <span className="capitalize">{calculatePayoffDate(debt)}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setIsEditing(debt)}
                            className="p-2 text-gray-400 hover:text-[#8058FF] hover:bg-[#8058FF]/5 rounded-lg transition-all"
                            title="Editar informações"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>

                    {debt.installmentValue && (
                        <div className="mb-6 grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                            <div>
                                <span className="text-[10px] text-gray-400 block uppercase">Parcela</span>
                                <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{toCurrency(debt.installmentValue)}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block uppercase">Dia Pagto</span>
                                <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Dia {debt.paymentDay}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsAdjusting(debt.id);
                                setAdjustmentMode('decrease');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                        >
                            <ArrowDownCircle size={14} />
                            Abater
                        </button>
                        <button
                            onClick={() => {
                                setIsAdjusting(debt.id);
                                setAdjustmentMode('increase');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <ArrowUpCircle size={14} />
                            Aumentar
                        </button>
                        <button
                            onClick={() => {
                                setIsScheduling(debt.id);
                                if (debt.installmentValue) {
                                    setScheduleData(prev => ({ ...prev, amount: debt.installmentValue!.toString() }));
                                }
                                if (debt.paymentDay) {
                                    setScheduleData(prev => ({ ...prev, day: debt.paymentDay!.toString() }));
                                }
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold bg-indigo-50 text-[#8058FF] dark:bg-[#8058FF]/10 dark:text-[#8058FF] rounded-lg hover:bg-indigo-100 dark:hover:bg-[#8058FF]/20 transition-colors"
                        >
                            <Calendar size={14} />
                            Agendar
                        </button>
                    </div>

                    {isAdjusting === debt.id && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex items-center justify-center p-6 z-10 animate-in fade-in duration-200">
                            <div className="w-full space-y-4">
                                <h5 className="font-bold text-gray-900 dark:text-white text-center">
                                    {adjustmentMode === 'decrease' ? 'Abater valor da dívida' : 'Aumentar valor da dívida'}
                                </h5>
                                <input
                                    autoFocus
                                    type="number"
                                    step="0.01"
                                    placeholder="0,00"
                                    value={adjustmentAmount}
                                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-2 text-sm focus:ring-2 focus:ring-[#8058FF]/20 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsAdjusting(null)}
                                        className="flex-1 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleAdjust(debt.id)}
                                        className="flex-1 py-2 text-xs font-bold text-white bg-[#8058FF] rounded-lg hover:bg-[#7048E8] transition-colors shadow-sm"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isScheduling === debt.id && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex items-center justify-center p-6 z-20 animate-in fade-in duration-200">
                            <div className="w-full space-y-3">
                                <h5 className="font-bold text-gray-900 dark:text-white text-center text-sm">
                                    Agendar Parcela
                                </h5>

                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Valor (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={scheduleData.amount}
                                                onChange={(e) => setScheduleData(prev => ({ ...prev, amount: e.target.value }))}
                                                className="w-full rounded-md border border-gray-200 dark:border-zinc-700 px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Dia</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={scheduleData.day}
                                                onChange={(e) => setScheduleData(prev => ({ ...prev, day: e.target.value }))}
                                                className="w-full rounded-md border border-gray-200 dark:border-zinc-700 px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Mês</label>
                                            <select
                                                value={scheduleData.month}
                                                onChange={(e) => setScheduleData(prev => ({ ...prev, month: e.target.value }))}
                                                className="w-full rounded-md border border-gray-200 dark:border-zinc-700 px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            >
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <option key={i} value={i}>
                                                        {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2024, i, 1))}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Ano</label>
                                            <input
                                                type="number"
                                                value={scheduleData.year}
                                                onChange={(e) => setScheduleData(prev => ({ ...prev, year: e.target.value }))}
                                                className="w-full rounded-md border border-gray-200 dark:border-zinc-700 px-2 py-1.5 text-xs bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 px-1 pt-1">
                                        <input
                                            type="checkbox"
                                            id={`is-recurring-debt-${debt.id}`}
                                            checked={(scheduleData as any).isRecurring}
                                            onChange={(e) => setScheduleData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                            className="w-3 h-3 rounded border-gray-300 text-[#8058FF] focus:ring-[#8058FF]/20"
                                        />
                                        <label htmlFor={`is-recurring-debt-${debt.id}`} className="text-[10px] font-bold text-gray-500 uppercase tracking-tight cursor-pointer">
                                            Definir como pagamento recorrente?
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setIsScheduling(null)}
                                        className="flex-1 py-2 text-[10px] font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleSchedule(debt.id)}
                                        className="flex-1 py-2 text-[10px] font-bold text-white bg-[#8058FF] rounded-lg hover:bg-[#7048E8] transition-colors shadow-sm"
                                    >
                                        Agendar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Edit Debt Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm shadow-2xl">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Editar Dívida</h3>
                            <button onClick={() => setIsEditing(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setEditIsPending(true);
                                const formData = new FormData(e.currentTarget);
                                try {
                                    await updateDebtAction(isEditing.id, {
                                        description: formData.get('description') as string,
                                        amount: parseFloat(formData.get('amount') as string),
                                        installmentValue: formData.get('installmentValue') ? parseFloat(formData.get('installmentValue') as string) : undefined,
                                        paymentDay: formData.get('paymentDay') ? parseInt(formData.get('paymentDay') as string) : undefined,
                                    });
                                    addToast('Dívida atualizada com sucesso', 'success');
                                    setIsEditing(null);
                                } catch (error) {
                                    addToast('Erro ao atualizar dívida', 'error');
                                } finally {
                                    setEditIsPending(false);
                                }
                            }}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Descrição</label>
                                <input
                                    name="description"
                                    required
                                    type="text"
                                    defaultValue={isEditing.description}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Valor Total (R$)</label>
                                <input
                                    name="amount"
                                    required
                                    type="number"
                                    step="0.01"
                                    defaultValue={isEditing.amount}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="bg-indigo-50/30 dark:bg-[#8058FF]/5 p-4 rounded-xl space-y-4 border border-[#8058FF]/10">
                                <p className="text-[10px] font-bold text-[#8058FF] uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Configuração de Parcelas
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Valor da Parcela</label>
                                        <input
                                            name="installmentValue"
                                            type="number"
                                            step="0.01"
                                            defaultValue={isEditing.installmentValue}
                                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Dia de Vencimento</label>
                                        <input
                                            name="paymentDay"
                                            type="number"
                                            min="1"
                                            max="31"
                                            defaultValue={isEditing.paymentDay}
                                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                                <button type="button" onClick={() => setIsEditing(null)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={editIsPending} className="px-4 py-2 text-sm font-medium text-white bg-[#8058FF] hover:bg-[#7048E8] rounded-lg disabled:opacity-50 transition-colors shadow-sm shadow-indigo-500/20">
                                    {editIsPending ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CreateDebtControl() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const amount = parseFloat(formData.get('amount') as string);
            const installmentValue = formData.get('installmentValue')
                ? parseFloat(formData.get('installmentValue') as string)
                : undefined;
            const paymentDay = formData.get('paymentDay')
                ? parseInt(formData.get('paymentDay') as string)
                : undefined;

            await createDebt({
                description: formData.get('description') as string,
                amount,
                installmentValue,
                paymentDay
            });

            addToast('Dívida cadastrada com sucesso', 'success');
            setIsOpen(false);
        } catch (error) {
            addToast('Erro ao cadastrar dívida', 'error');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-[#8058FF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7048E8] transition-colors shadow-sm shadow-indigo-500/20"
            >
                <Plus size={16} />
                <span>Nova Dívida</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Cadastrar Dívida</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Descrição</label>
                                <input name="description" required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" placeholder="Ex: Empréstimo BNDES" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Valor Total (R$)</label>
                                <input name="amount" required type="number" step="0.01" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" placeholder="0,00" />
                            </div>

                            <div className="bg-indigo-50/30 dark:bg-[#8058FF]/5 p-4 rounded-xl space-y-4 border border-[#8058FF]/10">
                                <p className="text-[10px] font-bold text-[#8058FF] uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Configuração de Parcelas (Opcional)
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Valor da Parcela</label>
                                        <input name="installmentValue" type="number" step="0.01" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" placeholder="0,00" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1">Dia de Vencimento</label>
                                        <input name="paymentDay" type="number" min="1" max="31" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" placeholder="1-31" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400">Parcelas configuradas aparecerão automaticamente no seu Calendário Financeiro.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-[#8058FF] hover:bg-[#7048E8] rounded-lg disabled:opacity-50 transition-colors shadow-sm shadow-indigo-500/20">
                                    {isPending ? 'Salvando...' : 'Cadastrar Dívida'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}


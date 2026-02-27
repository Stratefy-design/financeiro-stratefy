'use client';

import { useState } from 'react';
import { Transaction, Profile } from "@prisma/client";
import { Trash2, Edit2, Check, X, ChevronUp, ChevronDown, Repeat } from "lucide-react";
import { deleteTransaction, updateTransaction } from "@/app/actions/transactions";
import { useToast } from "@/contexts/ToastContext";

type TransactionWithProfile = Transaction & { profile: Profile } & { quantity?: number; isRecurring?: boolean; dueDate?: Date | null; invoiceGenerated?: boolean };

interface TransactionItemProps {
    transaction: TransactionWithProfile;
    isSelected?: boolean;
    onToggleSelect?: (checked: boolean) => void;
}

export default function TransactionItem({ transaction, isSelected, onToggleSelect }: TransactionItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState(transaction.status || 'completed');
    const [isRecurring, setIsRecurring] = useState(transaction.isRecurring || false);
    const { addToast } = useToast();

    // Form Stats
    // Form Stats
    const [description, setDescription] = useState(transaction.description);
    const [amount, setAmount] = useState(transaction.amount.toString());
    const [quantity, setQuantity] = useState(transaction.quantity?.toString() || '1');
    const [unitPrice, setUnitPrice] = useState(transaction.amount / (transaction.quantity || 1));
    const [type, setType] = useState<'income' | 'expense'>(transaction.type as 'income' | 'expense');
    const [category, setCategory] = useState(transaction.category);
    const [date, setDate] = useState(new Date(transaction.date).toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '');

    const handleQuantityChange = (newQuantity: string) => {
        setQuantity(newQuantity);
        const q = parseFloat(newQuantity);
        if (!isNaN(q) && q > 0) {
            setAmount((unitPrice * q).toFixed(2));
        }
    };

    const handleAmountChange = (newAmount: string) => {
        setAmount(newAmount);
        const a = parseFloat(newAmount);
        const q = parseFloat(quantity);
        if (!isNaN(a) && !isNaN(q) && q > 0) {
            setUnitPrice(a / q);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    };

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateTransaction(transaction.id, {
                description,
                amount: parseFloat(amount),
                type,
                category,
                date: new Date(date),
                dueDate: dueDate ? new Date(dueDate) : undefined,
                quantity: parseInt(quantity),
                status,
                isRecurring
            });
            addToast('Transação atualizada com sucesso!', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update transaction", error);
            addToast('Erro ao atualizar transação.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    const handleCancel = () => {
        setDescription(transaction.description);
        setAmount(transaction.amount.toString());
        setQuantity(transaction.quantity?.toString() || '1');
        setType(transaction.type as 'income' | 'expense');
        setCategory(transaction.category);
        setDate(new Date(transaction.date).toISOString().split('T')[0]);
        setDueDate(transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '');
        setStatus(transaction.status || 'completed');
        setIsRecurring(transaction.isRecurring || false);
        setIsEditing(false);
    };

    const handleToggleStatus = async () => {
        const newStatus = (status === 'completed' || status === 'paid') ? 'pending' : 'completed';
        setStatus(newStatus); // Optimistic update
        try {
            await updateTransaction(transaction.id, { status: newStatus });
            addToast(newStatus === 'completed' ? 'Transação marcada como paga!' : 'Transação marcada como pendente.', 'info');
        } catch (error) {
            console.error("Failed to toggle status", error);
            setStatus(status); // Revert on error
            addToast('Erro ao atualizar status.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
        try {
            await deleteTransaction(transaction.id);
            addToast('Transação removida com sucesso.', 'info');
        } catch (error) {
            console.error("Failed to delete transaction", error);
            addToast('Erro ao remover transação.', 'error');
        }
    };

    if (isEditing) {
        return (
            <tr className="bg-gray-50 dark:bg-zinc-800/50">
                <td className="px-6 py-4">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggleSelect?.(e.target.checked)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                </td>
                <td className="px-6 py-4">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-sm border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-2 py-1"
                    />
                    <div className="flex gap-2 mt-1">
                        {type === 'income' && (
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full text-xs text-gray-400 border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-zinc-400 px-2 py-1"
                            />
                        )}
                        {type === 'expense' && (
                            <div className="flex-1">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    title="Data de Vencimento"
                                    className="w-full text-xs text-red-500 border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-red-400 px-2 py-1"
                                />
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-sm border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-2 py-1"
                        list={`edit-categories-${transaction.id}`}
                    />
                    <datalist id={`edit-categories-${transaction.id}`}>
                        {/* Assuming we might want to pass categories here too, but for now we'll use existing name as suggestion */}
                        <option value={transaction.category} />
                    </datalist>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${transaction.profile.type === 'business'
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                        : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                        }`}>
                        {transaction.profile.type === 'business' ? 'Empresa' : 'Pessoal'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                            className="text-xs border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-1 py-1"
                        >
                            <option value="income">Entrada (+)</option>
                            <option value="expense">Saída (-)</option>
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            className="w-12 text-sm text-center border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-1 py-1"
                            title="Quantidade"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-xs border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-1 py-1"
                        >
                            <option value="completed">Pago</option>
                            <option value="pending">Pendente</option>
                        </select>
                        <button
                            onClick={() => setIsRecurring(!isRecurring)}
                            className={`p-1 rounded-md transition-colors ${isRecurring ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'}`}
                            title="Recorrente?"
                        >
                            <Repeat size={14} />
                        </button>
                        <span className="text-xs text-gray-400">x</span>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-24 text-sm text-right border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-2 py-1"
                        />
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <button onClick={handleSave} disabled={isPending} className="text-emerald-600 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <Check size={16} />
                        </button>
                        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors group">
            <td className="px-6 py-4">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onToggleSelect?.(e.target.checked)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
            </td>
            <td className="px-6 py-4">
                <p className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    {transaction.description}
                    {transaction.isRecurring && (
                        <span title="Despesa Recorrente"><Repeat size={12} className="text-blue-500" /></span>
                    )}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                    {transaction.type === 'expense' && transaction.dueDate
                        ? `Vence: ${formatDate(new Date(transaction.dueDate))}`
                        : formatDate(new Date(transaction.date))
                    }
                </p>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-zinc-200">
                    {transaction.category}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${transaction.profile.type === 'business'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
                    }`}>
                    {transaction.profile.type === 'business' ? 'Empresa' : 'Pessoal'}
                </span>
            </td>
            <td className={`px-6 py-4 text-right font-bold text-base ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                <div className="flex flex-col items-end">
                    <span>{transaction.type === 'income' ? '+' : '-'} {toCurrency(transaction.amount)}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        {(transaction as any).invoiceGenerated && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 uppercase tracking-tighter whitespace-nowrap">
                                NF Gerada
                            </span>
                        )}
                        <button
                            onClick={handleToggleStatus}
                            className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold transition-colors ${(status === 'completed' || status === 'paid')
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 hover:bg-yellow-200'
                                }`}
                            title={(status === 'completed' || status === 'paid') ? 'Marcar como Pendente' : 'Marcar como Pago'}
                        >
                            {(status === 'completed' || status === 'paid') ? 'Pago' : 'Pendente'}
                        </button>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Editar"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Excluir"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

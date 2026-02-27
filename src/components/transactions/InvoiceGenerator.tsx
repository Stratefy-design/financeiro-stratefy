'use client';

import { X, Copy, Check, FileCheck } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { markAsInvoiced } from '@/app/actions/transactions';
import { useRouter } from 'next/navigation';

interface InvoiceGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTransactions: any[];
}

export default function InvoiceGenerator({ isOpen, onClose, selectedTransactions }: InvoiceGeneratorProps) {
    const [copied, setCopied] = useState(false);
    const [shouldMarkAsInvoiced, setShouldMarkAsInvoiced] = useState(true);
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();
    const router = useRouter();

    if (!isOpen) return null;

    const totalAmount = selectedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const clientName = selectedTransactions[0]?.client?.name || 'Cliente';

    // Group services and sum quantities
    const servicesMap = selectedTransactions.reduce((acc, t) => {
        const key = t.description;
        if (!acc[key]) {
            acc[key] = { qty: 0, amount: 0 };
        }
        acc[key].qty += (t.quantity || 1);
        acc[key].amount += (t.amount || 0);
        return acc;
    }, {} as Record<string, { qty: number, amount: number }>);

    const servicesList = Object.entries(servicesMap).map(([name, data]: [string, any]) => {
        return `${name}${data.qty > 1 ? ` (x${data.qty})` : ''}`;
    }).join(', ');

    const now = new Date();
    const currentMonthYear = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(now);

    const invoiceDescription = `Prestação de serviços de ${servicesList}. total de R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Competência: ${currentMonthYear}.`;

    const handleCopy = async () => {
        setIsPending(true);
        try {
            await navigator.clipboard.writeText(invoiceDescription);
            setCopied(true);

            if (shouldMarkAsInvoiced) {
                const ids = selectedTransactions.map(t => t.id);
                await markAsInvoiced(ids);
            }

            addToast('Descrição copiada e itens marcados!', 'success');
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1500);
        } catch (err) {
            addToast('Erro ao processar ação.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Gerar Descrição NFSe</h3>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{clientName} • {selectedTransactions.length} item(s)</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700/50">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Texto Gerado</label>
                        <textarea
                            readOnly
                            value={invoiceDescription}
                            className="w-full h-32 bg-transparent text-sm text-gray-700 dark:text-zinc-300 resize-none focus:outline-none border-none p-0"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={shouldMarkAsInvoiced}
                                onChange={(e) => setShouldMarkAsInvoiced(e.target.checked)}
                                className="rounded border-gray-300 text-[#8058FF] focus:ring-[#8058FF] w-4 h-4"
                            />
                            <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium group-hover:text-gray-900 dark:group-hover:text-zinc-200 transition-colors">
                                Marcar itens selecionados como "NF Gerada"
                            </span>
                        </label>

                        <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-[#8058FF]/5 rounded-lg border border-[#8058FF]/10">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#8058FF] uppercase">Valor Total Sugerido</span>
                                <span className="text-lg font-black text-gray-900 dark:text-white">
                                    {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopy}
                                disabled={isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-[#8058FF] text-white rounded-lg text-sm font-medium hover:bg-[#7048E8] transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {isPending ? <Check size={16} className="animate-pulse" /> : (copied ? <FileCheck size={16} /> : <Copy size={16} />)}
                                {isPending ? 'Processando...' : (copied ? 'Concluído!' : 'Copiar e Marcar')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

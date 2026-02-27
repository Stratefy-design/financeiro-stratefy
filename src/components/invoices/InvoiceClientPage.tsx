'use client';

import { useState, useMemo } from 'react';
import { Search, FileText, ExternalLink, Copy, Check, FileCheck, Trash2 } from 'lucide-react';
import { markAsInvoiced } from '@/app/actions/transactions';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

interface InvoiceClientPageProps {
    initialTransactions: any[];
}

export default function InvoiceClientPage({ initialTransactions }: InvoiceClientPageProps) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [copied, setCopied] = useState(false);
    const { addToast } = useToast();
    const router = useRouter();

    const filteredTransactions = useMemo(() => {
        return initialTransactions.filter(t => {
            const matchesSearch =
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.client?.name && t.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        });
    }, [initialTransactions, searchTerm]);

    const selectedTransactions = useMemo(() => {
        return initialTransactions.filter(t => selectedIds.has(t.id));
    }, [initialTransactions, selectedIds]);

    const totalAmount = useMemo(() => {
        return selectedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    }, [selectedTransactions]);

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedIds(newSelected);
    };

    const invoiceDescription = useMemo(() => {
        if (selectedTransactions.length === 0) return '';

        const servicesMap = selectedTransactions.reduce((acc, t) => {
            const key = t.description;
            if (!acc[key]) {
                acc[key] = { qty: 0 };
            }
            acc[key].qty += (t.quantity || 1);
            return acc;
        }, {} as Record<string, { qty: number }>);

        const servicesList = Object.entries(servicesMap).map(([name, data]: [string, any]) => {
            return `${name}${data.qty > 1 ? ` (x${data.qty})` : ''}`;
        }).join(', ');

        const now = new Date();
        const currentMonthYear = new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(now);

        return `Prestação de serviços de ${servicesList}. total de R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Competência: ${currentMonthYear}.`;
    }, [selectedTransactions, totalAmount]);

    const handleCopyAndMark = async () => {
        setIsPending(true);
        try {
            await navigator.clipboard.writeText(invoiceDescription);
            setCopied(true);

            const ids = Array.from(selectedIds);
            await markAsInvoiced(ids);

            addToast('Descrição copiada e itens marcados!', 'success');
            setTimeout(() => {
                setCopied(false);
                setSelectedIds(new Set());
                router.refresh();
            }, 1000);
        } catch (err) {
            addToast('Erro ao processar ação.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Gestão</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Emitir Nota Fiscal</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Faturamento</h1>
                </div>

                <a
                    href="https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=/EmissorNacional/"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700"
                >
                    <ExternalLink size={16} />
                    <span>Abrir Emissor Nacional</span>
                </a>
            </div>

            <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                {/* Selection List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex items-center justify-between">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar serviços ou clientes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#8058FF]/20 transition-all"
                            />
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                            {initialTransactions.length} itens pendentes
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded border-gray-300 text-[#8058FF] focus:ring-[#8058FF]"
                                        />
                                    </th>
                                    <th className="px-6 py-4">Descrição/Cliente</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                                            Nenhum item pendente de nota fiscal encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((t) => (
                                        <tr
                                            key={t.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors cursor-pointer ${selectedIds.has(t.id) ? 'bg-purple-50/50 dark:bg-[#8058FF]/5' : ''}`}
                                            onClick={() => handleSelectOne(t.id, !selectedIds.has(t.id))}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(t.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectOne(t.id, e.target.checked);
                                                    }}
                                                    className="rounded border-gray-300 text-[#8058FF] focus:ring-[#8058FF]"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight">{t.description}</p>
                                                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{t.client?.name || 'Cliente Geral'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{toCurrency(t.amount)}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
                                                    {new Date(t.date).toLocaleDateString('pt-BR')}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Generator Panel */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm sticky top-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-[#8058FF]" />
                            Resumo da Nota
                        </h3>

                        {selectedIds.size === 0 ? (
                            <div className="py-12 text-center space-y-3 px-4">
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-full w-fit mx-auto text-gray-400">
                                    <Check size={24} />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">
                                    Selecione os itens da lista ao lado para gerar a descrição da nota fiscal.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-700/50">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2 block">Texto Consolidado</label>
                                    <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed italic">
                                        "{invoiceDescription}"
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-zinc-400">Total Selecionado:</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-lg">{toCurrency(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Itens Marcados:</span>
                                        <span className="font-medium bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">{selectedIds.size}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCopyAndMark}
                                    disabled={isPending}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8058FF] text-white rounded-xl font-bold hover:bg-[#7048E8] transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <Check size={18} className="animate-pulse" />
                                    ) : (
                                        copied ? <FileCheck size={18} /> : <Copy size={18} />
                                    )}
                                    {isPending ? 'Processando...' : (copied ? 'Copiado e Marcado!' : 'Copiar e Marcar como Faturado')}
                                </button>

                                <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center leading-tight">
                                    Ao copiar, os itens serão movidos automaticamente para a lista de faturados (tag "NF Gerada").
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

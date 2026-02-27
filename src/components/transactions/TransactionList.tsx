'use client';

import Link from "next/link";
import TransactionItem from "./TransactionItem";
import { Transaction, Profile } from "@prisma/client";
import { useState, useMemo } from "react";
import { Search, FileText, Printer, TrendingUp, TrendingDown } from "lucide-react";
import { getCategoryIcon } from "@/lib/icons";
import { useRouter } from "next/navigation";

type TransactionWithProfile = Transaction & { profile: Profile } & { quantity?: number };

interface TransactionListProps {
    initialTransactions: any[];
}

export default function TransactionList({ initialTransactions }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

    const uniqueClients = useMemo(() => {
        const clients = initialTransactions
            .map(t => t.client?.name)
            .filter(Boolean);
        return Array.from(new Set(clients)).sort();
    }, [initialTransactions]);

    const uniqueCategories = useMemo(() => {
        const categories = initialTransactions.map(t => t.category);
        return Array.from(new Set(categories)).sort();
    }, [initialTransactions]);

    const filteredTransactions = useMemo(() => {
        return initialTransactions.filter(t => {
            const matchesTab = t.type === activeTab;
            const matchesSearch =
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.client?.name && t.client.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesClient = selectedClient ? t.client?.name === selectedClient : true;
            const matchesCategory = selectedCategory ? t.category === selectedCategory : true;

            let matchesDate = true;
            if (startDate || endDate) {
                const transactionDate = new Date(t.date).toISOString().split('T')[0];
                if (startDate && transactionDate < startDate) matchesDate = false;
                if (endDate && transactionDate > endDate) matchesDate = false;
            }

            return matchesTab && matchesSearch && matchesClient && matchesCategory && matchesDate;
        });
    }, [initialTransactions, activeTab, searchTerm, selectedClient, selectedCategory, startDate, endDate]);

    const totalAmount = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    }, [filteredTransactions]);

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

    const handleGenerateReport = () => {
        if (selectedIds.size === 0) return;
        const ids = Array.from(selectedIds).join(',');
        router.push(`/reports/custom?ids=${ids}`);
    };

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('income')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'income'
                        ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                        }`}
                >
                    Receitas
                </button>
                <button
                    onClick={() => setActiveTab('expense')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'expense'
                        ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm'
                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                        }`}
                >
                    Despesas
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1 flex-wrap">
                    <div className="relative w-full max-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all text-gray-500 dark:text-zinc-400"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all text-gray-500 dark:text-zinc-400"
                        />
                    </div>

                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full md:w-40 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all"
                    >
                        <option value="">Clientes</option>
                        {uniqueClients.map(clientName => (
                            <option key={clientName} value={clientName}>{clientName}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full md:w-40 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all"
                    >
                        <option value="">Categorias</option>
                        {uniqueCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <div className="text-sm text-gray-500 dark:text-zinc-400 whitespace-nowrap">
                        {selectedIds.size} selecionado(s)
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={selectedIds.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FileText size={16} />
                        <span className="hidden sm:inline">Gerar Relatório</span>
                    </button>
                </div>
            </div>

            {/* Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex items-center justify-between group transition-all hover:border-[#8058FF]/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-all group-hover:scale-110 shadow-sm ${activeTab === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                            {selectedCategory
                                ? getCategoryIcon(selectedCategory, 20)
                                : (activeTab === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />)
                            }
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest leading-tight">
                                {selectedCategory ? `Total em ${selectedCategory}` : `Total ${activeTab === 'income' ? 'Recebido' : 'em Despesas'}`}
                            </p>
                            <p className={`text-2xl font-black tracking-tight ${activeTab === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                {toCurrency(totalAmount)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right border-l border-gray-100 dark:border-zinc-700 pl-4 h-full flex flex-col justify-center">
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Items</p>
                        <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{filteredTransactions.length}</p>
                    </div>
                </div>

                {selectedIds.size > 0 && (
                    <div className="bg-[#8058FF]/5 dark:bg-[#8058FF]/10 p-4 rounded-xl border border-[#8058FF]/20 flex items-center justify-between animate-in slide-in-from-right-4 duration-300 shadow-sm group hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#8058FF] text-white rounded-lg shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Printer size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#8058FF] font-bold uppercase tracking-widest leading-tight">Soma da Seleção</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {toCurrency(filteredTransactions.filter(t => selectedIds.has(t.id)).reduce((s, t) => s + t.amount, 0))}
                                </p>
                            </div>
                        </div>
                        <div className="text-right border-l border-[#8058FF]/20 pl-4 h-full flex flex-col justify-center">
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">Marcados</p>
                            <p className="text-lg font-black text-[#8058FF] leading-none">{selectedIds.size}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#F9FAFB] dark:bg-zinc-900 text-gray-500 dark:text-zinc-300 font-medium border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                            </th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Perfil</th>
                            <th className="px-6 py-4 text-right">Valor</th>
                            <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-zinc-400">
                                    Nenhuma transação encontrada.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((t: any) => (
                                <TransactionItem
                                    key={t.id}
                                    transaction={t}
                                    isSelected={selectedIds.has(t.id)}
                                    onToggleSelect={(checked) => handleSelectOne(t.id, checked)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

'use client';

import { useState, useMemo } from "react";
import { Search, FileText, CheckCircle2, Clock } from "lucide-react";
import QuoteItem from "./QuoteItem";

interface QuoteListProps {
    initialQuotes: any[];
}

export default function QuoteList({ initialQuotes }: QuoteListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const filteredQuotes = useMemo(() => {
        return initialQuotes.filter(q => {
            const matchesSearch =
                q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (q.client?.name && q.client.name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = selectedStatus ? q.status === selectedStatus : true;

            return matchesSearch && matchesStatus;
        });
    }, [initialQuotes, searchTerm, selectedStatus]);

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1 flex-wrap">
                    <div className="relative w-full max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por descrição ou cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all"
                        />
                    </div>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full md:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 transition-all"
                    >
                        <option value="">Todos os Status</option>
                        <option value="pending">Pendentes</option>
                        <option value="approved">Aprovados</option>
                        <option value="converted">Convertidos em Venda</option>
                        <option value="rejected">Rejeitados</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#F9FAFB] dark:bg-zinc-900 text-gray-500 dark:text-zinc-300 font-medium border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Cliente / Serviço</th>
                            <th className="px-6 py-4 text-right">Valor Total</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                        {filteredQuotes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-zinc-400">
                                    Nenhum orçamento encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredQuotes.map((q: any) => (
                                <QuoteItem key={q.id} quote={q} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

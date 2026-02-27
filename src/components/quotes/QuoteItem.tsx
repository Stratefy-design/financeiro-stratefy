'use client';

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { FileDown, MoreVertical, CheckCircle2, RefreshCw, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { convertQuoteToTransaction, deleteQuote, updateQuote } from "@/app/actions/quotes";
import { useToast } from "@/contexts/ToastContext";

export default function QuoteItem({ quote }: { quote: any }) {
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleConvert = async () => {
        if (!confirm('Deseja converter este orçamento em uma venda confirmada?')) return;
        setIsPending(true);
        try {
            await convertQuoteToTransaction(quote.id);
            addToast('Orçamento convertido em transação!', 'success');
        } catch (error) {
            addToast('Erro ao converter orçamento.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Excluir este orçamento permanentemente?')) return;
        setIsPending(true);
        try {
            await deleteQuote(quote.id);
            addToast('Orçamento excluído.', 'success');
        } catch (error) {
            addToast('Erro ao excluir.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    const statusStyles = {
        pending: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        approved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        converted: "bg-[#8058FF]/10 text-[#8058FF] dark:bg-[#8058FF]/20 dark:text-[#8058FF] border-[#8058FF]/20",
        rejected: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-900/30",
    };

    const statusLabels = {
        pending: "Pendente",
        approved: "Aprovado",
        converted: "Convertido",
        rejected: "Rejeitado",
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-zinc-400">
                {format(new Date(quote.date), "dd MMM, yyyy", { locale: ptBR })}
            </td>
            <td className="px-6 py-4">
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-[#8058FF] transition-colors">
                    {quote.description}
                </div>
                {quote.quantity > 1 && (
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-0.5">
                        {quote.quantity} unidades
                    </div>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="text-gray-900 dark:text-white font-medium">{quote.client?.name || '---'}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-500">{quote.service?.name}</div>
            </td>
            <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                {toCurrency(quote.amount * quote.quantity)}
            </td>
            <td className="px-6 py-4 text-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[quote.status as keyof typeof statusStyles]}`}>
                    {statusLabels[quote.status as keyof typeof statusLabels]}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                    {quote.status === 'pending' && (
                        <button
                            onClick={handleConvert}
                            disabled={isPending}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-all"
                            title="Aprovar e Converter em Venda"
                        >
                            <CheckCircle2 size={18} />
                        </button>
                    )}
                    <Link
                        href={`/quotes/${quote.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#8058FF] hover:bg-[#8058FF]/10 rounded-md transition-all"
                        title="Ver / Gerar PDF"
                    >
                        <Eye size={18} />
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

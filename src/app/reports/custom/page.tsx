import { getTransactionsByIds } from "@/app/actions/transactions";
import { getCurrentProfile } from "@/app/actions/settings";
import Link from "next/link";
import PrintButton from "@/components/ui/PrintButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Printer } from "lucide-react";

export default async function CustomReportPage(props: { searchParams: Promise<{ ids: string }> }) {
    const searchParams = await props.searchParams;
    const ids = searchParams.ids?.split(',').map(Number).filter(n => !isNaN(n)) || [];

    if (ids.length === 0) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nenhuma transação selecionada</h1>
                <p className="text-gray-500 mt-2">Volte e selecione as transações que deseja incluir no relatório.</p>
            </div>
        );
    }

    const [transactions, profile] = await Promise.all([
        getTransactionsByIds(ids),
        getCurrentProfile()
    ]);



    return (
        <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 p-8 print:p-0">
            {/* Top Bar (Visible only on screen) */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden">
                <Link
                    href="/transactions"
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <span className="text-lg">←</span> Voltar para Transações
                </Link>
                <PrintButton />
            </div>

            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 print:max-w-none print:!bg-white print:!text-black px-4 md:px-0">
                {/* Header Section: Two Columns */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-[#8058FF] pb-10 mb-10 gap-8 print:flex-row print:items-end">
                    {/* Left: Report Info */}
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8058FF]/10 text-[#8058FF] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#8058FF]/20 print:border-[#8058FF]/40">
                            Relatório Oficial
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[1.1] mb-3 print:text-4xl print:!text-black">
                                DEMONSTRATIVO <br />
                                <span className="text-[#8058FF] print:!text-[#8058FF]">DE SERVIÇOS</span>
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest print:!text-gray-600">
                                EMITIDO EM: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    {/* Right: Company Info */}
                    <div className="md:text-right flex flex-col items-start md:items-end print:items-end print:text-right">
                        {profile?.companyAvatar ? (
                            <img src={profile.companyAvatar} alt="Logo" className="w-16 h-16 object-contain mb-4 rounded-xl shadow-sm print:shadow-none" />
                        ) : (
                            <div className="w-14 h-14 bg-[#F3F0FF] dark:bg-[#8058FF]/10 rounded-2xl flex items-center justify-center mb-4 border border-[#8058FF]/20 print:border-[#8058FF]/40">
                                <span className="text-2xl font-black text-[#8058FF] print-force-brand">
                                    {(profile?.companyName || profile?.name || 'S')[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                        <h2 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight print:!text-black leading-none mb-2">
                            {profile?.companyName || profile?.name}
                        </h2>
                        <div className="space-y-1 text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tight print:!text-gray-700">
                            {profile?.companyAddress && <p className="max-w-[250px] leading-tight mb-2 print:max-w-none">{profile.companyAddress}</p>}
                            <div className="flex flex-col md:items-end gap-1 print:items-end">
                                {profile?.companyEmail && <span className="text-[#8058FF] print:!text-[#8058FF] tracking-normal normal-case">{profile.companyEmail}</span>}
                                {profile?.companyPhone && <span className="tracking-normal">{profile.companyPhone}</span>}
                                {profile?.companyWebsite && <span className="text-[#8058FF] print:!text-[#8058FF] underline decoration-dotted decoration-1 underline-offset-4 tracking-normal normal-case">{profile.companyWebsite.replace(/^https?:\/\//, '')}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-sm text-left mb-12 border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-900 dark:border-zinc-100 print:!border-black">
                                <th className="py-4 px-2 w-[12%] text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest print:!text-gray-500">Data</th>
                                <th className="py-4 px-2 w-[18%] text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest print:!text-gray-500">Cliente</th>
                                <th className="py-4 px-2 w-[35%] text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest print:!text-gray-500">Descrição</th>
                                <th className="py-4 px-2 w-[8%] text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-center print:!text-gray-500">Qtd</th>
                                <th className="py-4 px-2 w-[12%] text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-right print:!text-gray-500">Unit.</th>
                                <th className="py-4 px-2 w-[15%] text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-right print:!text-gray-500">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 print:!divide-gray-200">
                            {transactions.map((t: any) => {
                                const quantity = t.quantity || 1;
                                const unitValue = Number(t.amount) / quantity;

                                return (
                                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors print:!bg-transparent">
                                        <td className="py-5 px-2 whitespace-nowrap text-[11px] font-bold text-gray-500 dark:text-zinc-400 print:!text-black">
                                            {format(new Date(t.date), "dd/MM/yyyy")}
                                        </td>
                                        <td className="py-5 px-2">
                                            <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter text-[11px] print:!text-black leading-tight">
                                                {t.client?.name || 'Cliente Geral'}
                                            </p>
                                        </td>
                                        <td className="py-5 px-2">
                                            <p className="font-bold text-gray-900 dark:text-white text-xs print:!text-black leading-snug">
                                                {t.description}
                                            </p>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest print:!text-gray-500">{t.category}</span>
                                        </td>
                                        <td className="py-5 px-2 text-center font-bold text-gray-500 dark:text-zinc-400 print:!text-black">
                                            {quantity}
                                        </td>
                                        <td className="py-5 px-2 text-right text-[11px] font-medium text-gray-500 dark:text-zinc-400 print:!text-black">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitValue)}
                                        </td>
                                        <td className="py-5 px-2 text-right font-black text-gray-900 dark:text-white text-sm print:!text-black">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(t.amount))}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tbody className="border-t-4 border-gray-900 dark:border-zinc-100 print:!border-black">
                            <tr className="print:!border-black">
                                <td colSpan={5} className="py-12 text-right">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 mr-4 print:!text-gray-500">
                                        Valor Total do Demonstrativo
                                    </span>
                                </td>
                                <td className="py-12 text-right">
                                    <span className="font-black text-4xl text-[#8058FF] print-force-brand tracking-tighter">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transactions.reduce((acc: number, t: any) => acc + Number(t.amount), 0))}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-zinc-800 pt-8 mt-12 text-center text-xs text-gray-400 dark:text-zinc-500">
                    <p>Relatório gerado automaticamente pelo sistema Fynance by Stratefy.</p>
                </div>
            </div>
        </div>
    );
}


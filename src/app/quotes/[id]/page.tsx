import { getQuoteById } from "@/app/actions/quotes";
import { getCurrentProfile } from "@/app/actions/settings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
    const quote = await getQuoteById(parseInt(params.id));
    const profile = await getCurrentProfile();

    if (!quote) redirect('/quotes');

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20 print:bg-white print:pb-0">
            {/* Header / Actions - Hidden in Print */}
            <div className="max-w-4xl mx-auto px-6 py-8 flex justify-between items-center print:hidden">
                <Link
                    href="/quotes"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Voltar para Orçamentos</span>
                </Link>

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-[#8058FF] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#7048E8] transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Printer size={20} />
                    <span>Imprimir / Gerar PDF</span>
                </button>
            </div>

            {/* Quote Document */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none selection:bg-[#8058FF]/20">
                {/* Visual Header Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-12 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                        <div className="inline-flex items-center px-3 py-1 bg-[#8058FF]/10 text-[#8058FF] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#8058FF]/20 print:border-[#8058FF]">
                            Orçamento de Serviço
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[1.1] mb-3 print:!text-black">
                                PROPOSTA <br />
                                <span className="text-[#8058FF]">COMERCIAL</span>
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest print:!text-gray-600">
                                EMITIDO EM: {format(new Date(quote.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:items-end text-left md:text-right">
                        <div className="w-16 h-16 bg-[#8058FF] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20 print:shadow-none">
                            <Logo size={40} />
                        </div>
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

                <div className="p-12 space-y-12">
                    {/* Client Info Section */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] text-[#8058FF] font-black uppercase tracking-widest mb-3">CONTRATANTE</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase print:!text-black">
                                {quote.client?.name || 'Cliente Particular'}
                            </h3>
                            <div className="mt-2 text-xs text-gray-500 dark:text-zinc-400 font-medium space-y-1">
                                {quote.client?.email && <p>{quote.client.email}</p>}
                                {quote.client?.phone && <p>{quote.client.phone}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1">CÓDIGO PROPOSTA</p>
                            <p className="font-mono text-gray-900 dark:text-white font-bold opacity-50">#{quote.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div>
                        <p className="text-[10px] text-[#8058FF] font-black uppercase tracking-widest mb-4">ESPECIFICAÇÃO DOS SERVIÇOS</p>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 border border-gray-100 dark:border-zinc-800 print:bg-gray-50 print:!text-black">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 print:!text-black">{quote.description}</h4>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed print:!text-gray-600">
                                Serviço de {quote.service?.name || 'Consultoria Especializada'} conforme requisitos discutidos.
                            </p>
                        </div>
                    </div>

                    {/* Table for Totals */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#F9FAFB] dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-8 py-4 font-black uppercase text-[10px] text-[#8058FF] tracking-widest">Item</th>
                                    <th className="px-8 py-4 font-black uppercase text-[10px] text-[#8058FF] tracking-widest text-center">Quantidade</th>
                                    <th className="px-8 py-4 font-black uppercase text-[10px] text-[#8058FF] tracking-widest text-right">Valor Unitário</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                <tr>
                                    <td className="px-8 py-6 font-bold text-gray-900 dark:text-white print:!text-black">
                                        {quote.service?.name || quote.description}
                                    </td>
                                    <td className="px-8 py-6 text-center text-gray-500 dark:text-zinc-400 font-medium print:!text-black">
                                        {quote.quantity}x
                                    </td>
                                    <td className="px-8 py-6 text-right text-gray-900 dark:text-white font-bold print:!text-black">
                                        {toCurrency(quote.amount)}
                                    </td>
                                </tr>
                                <tr className="bg-gray-50/50 dark:bg-zinc-800/30">
                                    <td colSpan={2} className="px-8 py-10 text-right">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500 mr-4">
                                            Valor Total da Proposta
                                        </span>
                                    </td>
                                    <td className="px-8 py-10 text-right">
                                        <span className="text-3xl font-black text-[#8058FF] tracking-tighter">
                                            {toCurrency(quote.amount * quote.quantity)}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Validity */}
                    <div className="flex flex-col md:flex-row justify-between pt-12 border-t border-gray-100 dark:border-zinc-800 gap-8">
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-2">Validade</p>
                            <p className="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-tight">
                                {quote.expiresAt
                                    ? `Proposta válida até ${format(new Date(quote.expiresAt), "dd/MM/yyyy")}`
                                    : "Proposta válida por 7 dias a partir da data de emissão."
                                }
                            </p>
                        </div>
                        <div className="flex-1 md:text-right">
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-6">Assinatura</p>
                            <div className="inline-block w-48 border-b-2 border-[#8058FF]"></div>
                        </div>
                    </div>
                </div>

                {/* Final Branding Stripe */}
                <div className="h-2 bg-gradient-to-r from-[#8058FF] via-[#4F2BD3] to-[#8058FF]"></div>
            </div>
        </div>
    );
}

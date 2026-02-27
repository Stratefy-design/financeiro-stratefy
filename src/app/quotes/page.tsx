import { getServices } from "@/app/actions/services";
import { getCurrentProfileId } from "@/app/actions/settings";
import { getClients } from "@/app/actions/clients";
import { getQuotes } from "@/app/actions/quotes";
import QuoteList from "@/components/quotes/QuoteList";
import CreateQuoteControl from "@/components/quotes/CreateQuoteControl";

import { redirect } from "next/navigation";

export default async function QuotesPage() {
    const currentProfileId = await getCurrentProfileId();
    if (!currentProfileId) redirect('/sign-in');

    const clients = await getClients();
    const services = await getServices(currentProfileId);
    const quotes = await getQuotes();

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Gestão</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Orçamentos</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Orçamentos</h1>
                </div>

                <div className="flex items-center gap-3">
                    <CreateQuoteControl clients={clients} services={services} currentProfileId={currentProfileId} />
                </div>
            </div>

            <div className="px-8">
                <QuoteList initialQuotes={quotes} />
            </div>
        </div>
    );
}

import { getUninvoicedIncomes } from "@/app/actions/invoices";
import { getCurrentProfileId } from "@/app/actions/settings";
import { redirect } from "next/navigation";
import InvoiceClientPage from "@/components/invoices/InvoiceClientPage";

export default async function InvoicesPage() {
    const currentProfileId = await getCurrentProfileId();
    if (!currentProfileId) redirect('/sign-in');

    const transactions = await getUninvoicedIncomes();

    return <InvoiceClientPage initialTransactions={transactions} />;
}

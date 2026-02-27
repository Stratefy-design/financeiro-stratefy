import { ClientList, CreateClientControl } from "@/components/clients/ClientComponents";
import { getClients } from "@/app/actions/clients";

export default async function ClientsPage() {
    const clients = await getClients();

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Management</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Clientes</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Carteira de Clientes</h1>
                </div>

                <div className="flex items-center gap-3">
                    <CreateClientControl />
                </div>
            </div>

            <div className="px-8 pb-10">
                <ClientList clients={clients} />
            </div>
        </div>
    );
}

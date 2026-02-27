import { ServiceList, CreateServiceControl } from "@/components/services/ServiceComponents";
import { getServices } from "@/app/actions/services";

export default async function ServicesPage() {
    const services = await getServices();

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between px-8 py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Management</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Serviços</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Catálogo de Serviços</h1>
                </div>

                <div className="flex items-center gap-3">
                    <CreateServiceControl />
                </div>
            </div>

            <div className="px-8 pb-10">
                <ServiceList services={services} />
            </div>
        </div>
    );
}

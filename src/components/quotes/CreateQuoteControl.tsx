'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import QuoteModal from './QuoteModal';

export default function CreateQuoteControl({
    clients,
    services = [],
    currentProfileId
}: {
    clients: any[],
    services?: any[],
    currentProfileId: number
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-[#8058FF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7048E8] transition-colors shadow-sm shadow-indigo-500/20"
            >
                <Plus size={16} />
                <span>Novo Orçamento</span>
            </button>

            <QuoteModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                clients={clients}
                services={services}
                currentProfileId={currentProfileId}
            />
        </>
    );
}

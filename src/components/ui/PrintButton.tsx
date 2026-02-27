'use client';

import { Printer } from "lucide-react";

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
        >
            <Printer size={16} />
            Imprimir ou Salvar PDF
        </button>
    )
}

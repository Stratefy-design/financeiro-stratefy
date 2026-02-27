'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ptBR } from '@clerk/localizations';
import { useEffect, useState } from 'react';
import { ToastProvider } from '@/contexts/ToastContext';

/**
 * Sub-component that handles the Clerk configuration. 
 * Needs to be inside ThemeProvider to use `useTheme()`.
 */
function ClerkThemeWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // While not mounted, we can still render ClerkProvider with a default or system theme
    // standard practice is to use dark as default given our cinematic splash
    const clerkTheme = mounted && resolvedTheme === 'dark' ? dark : undefined;

    return (
        <ClerkProvider
            localization={ptBR}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            appearance={{
                baseTheme: clerkTheme,
                variables: {
                    colorPrimary: "#8058FF",
                    colorInputBackground: mounted && resolvedTheme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                    colorInputText: mounted && resolvedTheme === 'dark' ? "white" : "#111827",
                },
                elements: {
                    rootBox: "w-full",
                    card: "shadow-none",
                    cardBox: "shadow-none",
                    scrollBox: "shadow-none font-sans",
                    pageScrollBox: "shadow-none",

                    userButtonPopoverCard: "border border-white/10 shadow-xl",
                    userButtonPopoverActionButton: "hover:bg-white/5 transition-colors",
                    userButtonBox: "rounded-lg p-1",

                    header: "hidden",
                    main: "gap-2",
                    headerTitle: "font-bold",

                    socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border border-white/10",
                    dividerLine: "opacity-20",
                },
            }}
        >
            {children}
        </ClerkProvider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ClerkThemeWrapper>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </ClerkThemeWrapper>
        </ThemeProvider>
    );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Logo } from "@/components/ui/Logo";
import { getCurrentProfileId, getProfiles } from "@/app/actions/settings";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fynance - Inteligência Financeira",
  description: "Gestão Financeira Inteligente",
};

import { Providers } from "@/app/providers";

// ... imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentProfileId = await getCurrentProfileId();
  const profiles = await getProfiles();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${font.variable} font-sans antialiased bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100`}>
        <Providers>
          <div className="flex min-h-screen transition-colors duration-300">
            {currentProfileId ? (
              /* --- DASHBOARD LAYOUT (Authenticated) --- */
              <>
                <div className="print:hidden fixed inset-y-0 z-50">
                  <Sidebar currentProfileId={currentProfileId} profiles={profiles} />
                </div>
                <main className="flex-1 md:ml-[280px] print:ml-0 p-4 md:p-6 print:p-0 overflow-y-auto h-screen print:h-auto print:overflow-visible pt-16 md:pt-6 animate-in fade-in duration-500">
                  <Header profileId={currentProfileId} profiles={profiles} />
                  {children}
                </main>
              </>
            ) : (
              /* --- SPLASH SCREEN LAYOUT (Unauthenticated) --- */
              <main className="relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center p-4">

                {/* 1. Background Gradient (Purple/Emerald) - Hidden on mobile for performance */}
                <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[70%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8058FF]/40 via-purple-900/20 to-transparent blur-3xl opacity-80 pointer-events-none" />

                {/* 2. Secondary Glow (Emerald) */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                {/* 3. Noise Overlay - Keep light */}
                <div className="absolute inset-0 bg-noise opacity-[0.02] lg:opacity-[0.03] pointer-events-none mix-blend-overlay" />

                {/* 4. Advanced Layered Ambient Irradiance - Hidden on mobile */}
                <div className="hidden lg:block absolute left-0 lg:left-[5%] top-1/2 -translate-y-1/2 w-full lg:w-[1200px] h-[800px] pointer-events-none overflow-hidden container-glow">
                  {/* Layer 1: The Core (Warmth) */}
                  <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 m-auto w-[400px] h-[400px] rounded-full opacity-30 animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(128,88,255,0.2) 0%, transparent 70%)',
                      filter: 'blur(80px)',
                      animationDuration: '24s'
                    }}
                  />
                  {/* Layer 2: The Mid-Spread (Emerald/Purple blend) */}
                  <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 m-auto w-[700px] h-[700px] rounded-full opacity-20 animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(128,88,255,0.05) 50%, transparent 100%)',
                      filter: 'blur(140px)',
                      animationDuration: '32s',
                      animationDelay: '-4s'
                    }}
                  />
                  {/* Layer 3: The Deep Ambient (Wide Falloff - The Banding Killer) */}
                  <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 m-auto w-[1200px] h-[1200px] rounded-full opacity-10"
                    style={{
                      background: 'radial-gradient(circle, rgba(128,88,255,0.05) 0%, transparent 80%)',
                      filter: 'blur(220px)',
                    }}
                  />
                </div>

                {/* Main Card Container - Responsive: Vertical on Mobile, Horizontal on Desktop */}
                <div className="relative z-10 w-full max-w-[400px] lg:max-w-5xl lg:h-[600px] bg-[#050505]/95 lg:bg-[#050505]/90 lg:backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5 flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 lg:duration-700 duration-300">

                  {/* LEFT SECTION: BRANDING (Desktop) / TOP (Mobile) */}
                  <div className="relative w-full lg:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
                    {/* Decorative Glow inside card - very subtle */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#8058FF]/10 to-emerald-500/10 opacity-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center lg:items-start space-y-4 lg:space-y-6">
                      {/* Logo */}
                      <div className="relative group">
                        {/* Smoother, massive blurred glow around logo icon */}
                        <div
                          className="absolute -inset-16 lg:-inset-24 rounded-full opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-500 lg:animate-pulse"
                          style={{
                            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(128,88,255,0.2) 50%, transparent 100%)',
                            filter: 'blur(80px)',
                          }}
                        ></div>
                        <div className="relative w-16 h-16 lg:w-24 lg:h-24 bg-black/60 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:ring-white/20 transition-all">
                          <Logo size={52} />
                        </div>
                      </div>

                      <div className="space-y-2 lg:space-y-4">
                        <h1 className="text-2xl lg:text-5xl font-bold tracking-tighter text-white drop-shadow-lg text-center lg:text-left">
                          Fynance
                        </h1>
                        <p className="text-[10px] lg:text-base text-zinc-400 font-medium tracking-widest uppercase max-w-[240px] lg:max-w-xs mx-auto lg:mx-0">
                          Controle total das suas finanças com a tecnologia <span className="text-[#8058FF] font-bold">Stratefy</span>.
                        </p>
                      </div>
                      <div className="hidden lg:block mt-auto pt-8">
                        <div className="flex gap-2">
                          <div className="w-10 h-1 bg-[#8058FF] rounded-full"></div>
                          <div className="w-2 h-1 bg-zinc-800 rounded-full"></div>
                          <div className="w-2 h-1 bg-zinc-800 rounded-full"></div>
                        </div>
                        <p className="mt-4 text-xs text-zinc-600">
                          © {new Date().getFullYear()} Stratefy Inc.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SECTION: LOGIN FORM (Desktop) / BOTTOM (Mobile) */}
                  <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col items-center justify-center -mt-8 lg:mt-0">
                    <div className="w-full max-w-sm space-y-4">
                      <div className="lg:hidden text-center mb-4">
                        <span className="text-xs text-zinc-500">Acesse sua conta para continuar</span>
                      </div>
                      {children}
                    </div>
                    <p className="lg:hidden mt-8 text-[10px] text-zinc-500 tracking-wide text-center">
                      © {new Date().getFullYear()} Stratefy Inc.
                    </p>
                  </div>
                </div>
              </main>
            )}
          </div>
        </Providers>
      </body>
    </html>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Sidebar from '../Components/Sidebar';
import { Waveform, List, SidebarSimple, Sparkle } from '@phosphor-icons/react';

export default function AppLayout({ 
    children, 
    currentRoute = 'home', 
    activeTab = 'calls', 
    onTabChange = null,
    title = null,
    subtitle = null,
    actions = null
}) {
    // Mobile slide-over drawer state
    const [mobileOpen, setMobileOpen] = useState(false);

    // Desktop collapsible state: default false (open). Read from localStorage
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('voic_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const toggleCollapse = () => {
        setCollapsed(prev => {
            const nextState = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('voic_sidebar_collapsed', nextState ? 'true' : 'false');
            }
            return nextState;
        });
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
            
            {/* Sidebar (Desktop Collapsible w-64 + Mobile Drawer) */}
            <Sidebar
                currentRoute={currentRoute}
                activeTab={activeTab}
                onTabChange={onTabChange}
                collapsed={collapsed}
                onToggleCollapse={toggleCollapse}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {/* Mobile Top App Bar (visible on < lg) */}
            <header className="lg:hidden sticky top-0 z-20 bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 h-13 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-blue-900 dark:text-slate-300 dark:hover:text-white hover:bg-blue-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Buka Menu Navigasi"
                    >
                        <List size={20} weight="bold" />
                    </button>

                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-6.5 h-6.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xs ring-1 ring-blue-500/20">
                            <Waveform size={14} weight="bold" />
                        </div>
                        <span className="font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-white">
                            VOIC
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/40 text-[11px] font-mono text-blue-900 dark:text-blue-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Gemini 3.6</span>
                    </div>
                </div>
            </header>

            {/* Main Content Area: smooth padding transition when collapsed or expanded */}
            <div className={`flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
                collapsed ? 'lg:pl-0' : 'lg:pl-64'
            }`}>
                
                {/* Desktop Top Floating / Bar when sidebar is collapsed */}
                {collapsed && (
                    <div className="hidden lg:flex sticky top-0 z-20 bg-white/90 dark:bg-[#0c0e14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 h-12 items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleCollapse}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-blue-950 dark:text-slate-300 dark:hover:text-white hover:bg-blue-50/70 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                                title="Buka Sidebar Navigasi"
                            >
                                <SidebarSimple size={18} />
                                <span>Buka Menu</span>
                            </button>

                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center ring-1 ring-blue-500/20 shadow-2xs">
                                    <Waveform size={14} weight="bold" />
                                </div>
                                <span className="font-mono font-bold text-xs tracking-wider text-slate-900 dark:text-white">
                                    VOIC
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/40 text-[11px] font-mono text-blue-900 dark:text-blue-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Optional Page Header Bar if title or actions provided */}
                {(title || actions) && (
                    <div className="bg-white/70 dark:bg-[#0c0e14]/70 backdrop-blur-sm border-b border-slate-200/70 dark:border-slate-800/70 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-10">
                        <div>
                            {title && (
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {actions && (
                            <div className="flex items-center gap-2.5 shrink-0">
                                {actions}
                            </div>
                        )}
                    </div>
                )}

                {/* Page Content Slot */}
                <main className="flex-1 w-full relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

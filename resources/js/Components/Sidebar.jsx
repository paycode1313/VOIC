import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import VocalWarmupModal from './VocalWarmupModal';
import { 
    Waveform, 
    VideoCamera, 
    Sparkle, 
    Target, 
    ClockCounterClockwise, 
    Wind, 
    Sliders, 
    SignOut, 
    Sun, 
    Moon, 
    X,
    User,
    SidebarSimple,
    CaretRight,
    SignIn,
    UserPlus
} from '@phosphor-icons/react';

export default function Sidebar({ 
    currentRoute = 'home', 
    activeTab = 'calls', 
    onTabChange = null,
    collapsed = false,
    onToggleCollapse = null,
    mobileOpen = false,
    onCloseMobile = null 
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [warmupOpen, setWarmupOpen] = useState(false);

    // Theme state: default 'light'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('voic_theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentTheme = localStorage.getItem('voic_theme') || 'light';
            setTheme(currentTheme);
            if (currentTheme === 'dark') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('voic_theme', nextTheme);
            if (nextTheme === 'dark') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
        }
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const formatRole = (role) => {
        switch (role) {
            case 'student': return 'Akademisi & Riset';
            case 'job_seeker': return 'Job Seeker';
            case 'executive': return 'Executive Leader';
            default: return 'Member Latihan';
        }
    };

    // Diversified feature navigation items with distinct, tasteful signature colors
    const navItems = [
        {
            id: 'calls',
            label: 'Panggilan AI',
            subtitle: 'Simulasi Penguji & Rekan',
            badge: 'Live',
            badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50',
            icon: VideoCamera,
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-50 dark:bg-blue-950/50',
            activeIndicator: 'bg-blue-600',
            route: 'call',
            href: '/?tab=calls'
        },
        {
            id: 'chat',
            label: 'Chat Gemini',
            subtitle: 'Formulasi Naskah & STAR',
            badge: '3.6',
            badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/70 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/50',
            icon: Sparkle,
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-50 dark:bg-purple-950/50',
            activeIndicator: 'bg-purple-600',
            route: 'chat',
            href: '/?tab=chat'
        },
        {
            id: 'studio',
            label: 'Studio Mandiri',
            subtitle: 'Bilik Rekam & Telemetri',
            icon: Target,
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-50 dark:bg-amber-950/50',
            activeIndicator: 'bg-amber-600',
            route: 'studio',
            href: '/studio'
        },
        {
            id: 'history',
            label: 'Riwayat Sesi',
            subtitle: 'Histori & Analisis Skor',
            icon: ClockCounterClockwise,
            iconColor: 'text-teal-600 dark:text-teal-400',
            iconBg: 'bg-teal-50 dark:bg-teal-950/50',
            activeIndicator: 'bg-teal-600',
            route: 'history',
            href: '/history'
        }
    ];

    const handleItemClick = (item, e) => {
        if (onCloseMobile) onCloseMobile();
        
        if (onTabChange && currentRoute === 'home') {
            if (['calls', 'chat', 'studio', 'history'].includes(item.id)) {
                e.preventDefault();
                onTabChange(item.id);
                return;
            }
        }
        
        if (item.href) {
            e.preventDefault();
            router.visit(item.href);
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full justify-between bg-white dark:bg-[#0c0e14] text-slate-800 dark:text-slate-200 border-r border-slate-200/70 dark:border-slate-800/70 transition-colors">
            
            {/* Top Area: Brand & Main Navigation */}
            <div className="flex flex-col flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
                
                {/* Brand Header */}
                <div className="flex items-center justify-between px-1.5 pt-0.5">
                    <Link 
                        href="/" 
                        className="flex items-center gap-2.5 group select-none"
                        onClick={() => onCloseMobile && onCloseMobile()}
                    >
                        <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                            <Waveform size={20} weight="bold" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-base tracking-wider text-slate-900 dark:text-white">
                                    VOIC
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                                    STUDIO
                                </span>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal tracking-tight -mt-0.5">
                                AI Speech Coach
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Collapse Button / Mobile Close Button */}
                    <div className="flex items-center gap-1">
                        {onToggleCollapse && (
                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Tutup sidebar"
                                aria-label="Tutup sidebar"
                            >
                                <SidebarSimple size={18} />
                            </button>
                        )}
                        {onCloseMobile && (
                            <button
                                type="button"
                                onClick={onCloseMobile}
                                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                aria-label="Tutup navigasi"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Section 1: Workspace Utama */}
                <div className="space-y-1">
                    <div className="px-2 pb-1 text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        Workspace
                    </div>

                    <nav className="space-y-0.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isCurrent = currentRoute === 'home'
                                ? activeTab === item.id
                                : currentRoute === item.route;

                            return (
                                <a
                                    key={item.id}
                                    id={`sidebar-item-${item.id}`}
                                    href={item.href}
                                    onClick={(e) => handleItemClick(item, e)}
                                    className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer select-none ${
                                        isCurrent
                                            ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800/80 dark:text-white'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {/* Subtle active left pill */}
                                    {isCurrent && (
                                        <div className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${item.activeIndicator}`} />
                                    )}

                                    <div className="flex items-center gap-2.5 min-w-0 pl-1">
                                        <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                            isCurrent 
                                                ? `${item.iconBg} ${item.iconColor}`
                                                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                                        }`}>
                                            <Icon size={17} weight={isCurrent ? 'bold' : 'regular'} />
                                        </div>
                                        <div className="flex flex-col truncate text-left">
                                            <span className={`leading-tight ${isCurrent ? 'text-slate-900 dark:text-white' : 'font-normal'}`}>
                                                {item.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                                {item.subtitle}
                                            </span>
                                        </div>
                                    </div>

                                    {item.badge && (
                                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border shrink-0 ${item.badgeClass}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* Section 2: Alat Latihan */}
                <div className="space-y-1 pt-1">
                    <div className="px-2 pb-1 text-[11px] font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        Alat Latihan
                    </div>

                    <div className="space-y-0.5">
                        {/* Vocal Warmup Modal Trigger */}
                        <button
                            type="button"
                            onClick={() => {
                                setWarmupOpen(true);
                                if (onCloseMobile) onCloseMobile();
                            }}
                            className="w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer select-none"
                            title="Latihan pernapasan diafragma 30 detik sebelum mulai"
                        >
                            <div className="flex items-center gap-2.5 pl-1">
                                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
                                    <Wind size={17} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-slate-700 dark:text-slate-300 leading-tight font-medium">
                                        Pemanasan Vokal
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        Pernapasan diafragma 30s
                                    </span>
                                </div>
                            </div>
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                Buka
                            </span>
                        </button>

                        {/* Profile Calibration Settings */}
                        <Link
                            href="/onboarding"
                            onClick={() => onCloseMobile && onCloseMobile()}
                            className={`w-full group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors select-none ${
                                currentRoute === 'onboarding'
                                    ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800/80 dark:text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 pl-1">
                                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                                    <Sliders size={17} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-slate-700 dark:text-slate-300 leading-tight font-medium">
                                        Kalibrasi Profil
                                    </span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        Target bicara & mic
                                    </span>
                                </div>
                            </div>
                            <CaretRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

            </div>

            {/* Bottom Footer: System Engine, Theme Toggle & User Info */}
            <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2 bg-slate-50/40 dark:bg-slate-900/20">
                
                {/* Engine Status Line */}
                <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-mono">Gemini 3.6 Flash</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                </div>

                {/* Theme Mode Switcher */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                >
                    <div className="flex items-center gap-2">
                        {theme === 'dark' ? (
                            <Sun size={15} className="text-amber-400" />
                        ) : (
                            <Moon size={15} className="text-slate-600" />
                        )}
                        <span className="text-[11px]">
                            {theme === 'dark' ? 'Tema Gelap' : 'Tema Terang'}
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {theme}
                    </span>
                </button>

                {/* User Profile Card or Auth Options */}
                {user ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                                <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                    {user.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate">
                                    {formatRole(user.target_role)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                            title="Keluar dari akun"
                            aria-label="Logout"
                        >
                            <SignOut size={15} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <Link
                            href="/login"
                            onClick={() => onCloseMobile && onCloseMobile()}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                            <SignIn size={13} />
                            <span>Masuk</span>
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => onCloseMobile && onCloseMobile()}
                            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium transition-colors"
                        >
                            <UserPlus size={13} />
                            <span>Daftar</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Vocal Warmup Modal */}
            <VocalWarmupModal
                isOpen={warmupOpen}
                onClose={() => setWarmupOpen(false)}
                onFinish={() => setWarmupOpen(false)}
            />
        </div>
    );

    return (
        <>
            {/* Desktop Collapsible Sidebar (w-64) */}
            <aside 
                className={`hidden lg:block fixed inset-y-0 left-0 w-64 z-30 transition-transform duration-300 ease-in-out ${
                    collapsed ? '-translate-x-full' : 'translate-x-0'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Slide-Over Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 flex">
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onCloseMobile}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                        />

                        {/* Drawer content */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
                            className="relative w-72 max-w-[85vw] h-full z-10 shadow-xl"
                        >
                            {sidebarContent}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

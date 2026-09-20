import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import VocalWarmupModal from './VocalWarmupModal';
import { 
    Microphone, 
    ClockCounterClockwise, 
    Waveform, 
    User, 
    SignOut, 
    CaretDown,
    ShieldCheck, 
    SignIn, 
    UserPlus, 
    Wind, 
    Sliders, 
    VideoCamera,
    Sparkle,
    Target,
    Sun,
    Moon
} from '@phosphor-icons/react';

export default function Header({ currentRoute = 'home', activeTab = 'calls', onTabChange = null }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [warmupOpen, setWarmupOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Theme state: 'dark' | 'light'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('voic_theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentTheme = localStorage.getItem('voic_theme') || 'dark';
            setTheme(currentTheme);
            if (currentTheme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('voic_theme', nextTheme);
            if (nextTheme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    const formatRole = (role) => {
        switch (role) {
            case 'student': return 'Akademisi';
            case 'job_seeker': return 'Job Seeker';
            case 'executive': return 'Leader';
            default: return 'Member';
        }
    };

    const navFeatures = [
        {
            id: 'calls',
            label: 'Panggilan AI',
            badge: 'Live',
            icon: VideoCamera,
            route: 'call',
            href: '/?tab=calls'
        },
        {
            id: 'chat',
            label: 'Chat Gemini',
            badge: '3.6',
            icon: Sparkle,
            route: 'chat',
            href: '/?tab=chat'
        },
        {
            id: 'studio',
            label: 'Studio Mandiri',
            icon: Target,
            route: 'studio',
            href: '/?tab=studio'
        },
        {
            id: 'history',
            label: 'Riwayat Sesi',
            icon: ClockCounterClockwise,
            route: 'history',
            href: '/?tab=history'
        }
    ];

    const handleFeatureClick = (feat, e) => {
        if (onTabChange && currentRoute === 'home') {
            e.preventDefault();
            onTabChange(feat.id);
        } else if (currentRoute !== 'home') {
            e.preventDefault();
            router.visit(feat.href);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#08090d]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    
                    {/* Left: Brand / Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-200 shadow-sm">
                                <Waveform size={18} weight="bold" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-base tracking-wider text-slate-900 dark:text-white">
                                        VOIC
                                    </span>
                                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#141822] text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                        STUDIO
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide -mt-0.5 hidden sm:block">
                                    Autonomous AI Coach
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Feature Navigation Hub */}
                    <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-inner font-mono text-xs transition-colors">
                        {navFeatures.map((feat) => {
                            const Icon = feat.icon;
                            const isCurrent = currentRoute === 'home' 
                                ? activeTab === feat.id 
                                : currentRoute === feat.route;

                            return (
                                <a
                                    key={feat.id}
                                    id={`nav-tab-${feat.id}`}
                                    href={feat.href}
                                    onClick={(e) => handleFeatureClick(feat, e)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none relative ${
                                        isCurrent
                                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <Icon size={14} weight={isCurrent ? 'bold' : 'regular'} className={isCurrent ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                                    <span>{feat.label}</span>
                                    {feat.badge && (
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                            isCurrent 
                                                ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-400/30' 
                                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                                        }`}>
                                            {feat.badge}
                                        </span>
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Right: Engine Status Badge, Theme Toggle, Vocal Warmup & Auth */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* Gemini 3.6 Flash Engine Status */}
                        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#10131a] border border-slate-200 dark:border-emerald-500/30 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                            <span>Gemini 3.6 Flash</span>
                        </div>

                        {/* Light / Dark Mode Toggle Button */}
                        <button
                            type="button"
                            id="theme-toggle-btn"
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#10131a] dark:hover:bg-[#161a24] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95 shadow-sm"
                            title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
                            aria-label={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                        >
                            {theme === 'dark' ? (
                                <Sun size={17} weight="bold" className="text-amber-400 animate-[spin_16s_linear_infinite]" />
                            ) : (
                                <Moon size={17} weight="bold" className="text-indigo-600" />
                            )}
                        </button>

                        {/* Vocal Warmup Button */}
                        <button
                            type="button"
                            onClick={() => setWarmupOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#10131a] dark:hover:bg-[#161a24] border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer active:scale-[0.98]"
                            title="Latihan pernapasan diafragma 30 detik"
                        >
                            <Wind size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden md:inline">Pemanasan</span>
                        </button>

                        {/* User Profile Dropdown or Login / Register */}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#121620] border border-slate-200 dark:border-white/[0.1] hover:border-slate-300 dark:hover:border-white/[0.2] transition-colors cursor-pointer"
                                >
                                    <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">
                                            {user.name}
                                        </div>
                                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 leading-tight">
                                            {formatRole(user.target_role)}
                                        </div>
                                    </div>
                                    <CaretDown size={12} className={`text-slate-500 dark:text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-slate-700 dark:text-slate-300"
                                        >
                                            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={toggleTheme}
                                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer"
                                            >
                                                {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
                                                <span>{theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}</span>
                                            </button>

                                            <Link
                                                href="/onboarding"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                                            >
                                                <Sliders size={15} />
                                                <span>Kalibrasi Profil & Target</span>
                                            </Link>

                                            <Link
                                                href="/history"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                                            >
                                                <ClockCounterClockwise size={15} />
                                                <span>Riwayat Sesi Saya</span>
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                                            >
                                                <SignOut size={15} />
                                                <span>Keluar dari Akun</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <Link
                                    href="/login"
                                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-500/30 rounded-xl transition-colors"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Feature Strip (visible only on small screens) */}
                <div className="md:hidden flex items-center justify-around px-3 py-2 bg-slate-50 dark:bg-[#0a0d13] border-t border-slate-200 dark:border-white/[0.06] font-mono text-[11px] overflow-x-auto transition-colors">
                    {navFeatures.map((feat) => {
                        const Icon = feat.icon;
                        const isCurrent = currentRoute === 'home' 
                            ? activeTab === feat.id 
                            : currentRoute === feat.route;

                        return (
                            <a
                                key={feat.id}
                                id={`mobile-nav-tab-${feat.id}`}
                                href={feat.href}
                                onClick={(e) => handleFeatureClick(feat, e)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                                    isCurrent 
                                        ? 'bg-emerald-600 text-white font-bold' 
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Icon size={13} weight={isCurrent ? 'bold' : 'regular'} />
                                <span>{feat.label}</span>
                            </a>
                        );
                    })}
                </div>
            </header>

            {/* Vocal Warmup Modal */}
            <VocalWarmupModal
                isOpen={warmupOpen}
                onClose={() => setWarmupOpen(false)}
                onFinish={() => setWarmupOpen(false)}
            />
        </>
    );
}

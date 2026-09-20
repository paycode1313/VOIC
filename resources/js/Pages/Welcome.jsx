import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import AppLayout from '../Layouts/AppLayout';
import AudioOscilloscope from '../Components/AudioOscilloscope';
import VocalWarmupModal from '../Components/VocalWarmupModal';
import InteractiveBeforeAfterDemo from '../Components/InteractiveBeforeAfterDemo';
import DashboardGeminiChat from '../Components/DashboardGeminiChat';
import { 
    Microphone, 
    ArrowRight, 
    ShieldCheck, 
    GraduationCap, 
    Briefcase, 
    Presentation, 
    Clock, 
    Sliders, 
    Eye, 
    Target, 
    Check, 
    Play, 
    Wind, 
    VideoCamera, 
    PhoneCall, 
    ChatCircleDots,
    Sparkle,
    Lightning,
    ClockCounterClockwise,
    Waveform,
    User,
    CheckCircle
} from '@phosphor-icons/react';

export default function Welcome({ recentSessions = [] }) {
    const shouldReduceMotion = useReducedMotion();
    const { auth } = usePage().props;
    const user = auth?.user;

    // Active Dashboard Workspace Tab: 'calls' | 'chat' | 'studio' | 'history'
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (['calls', 'chat', 'studio', 'history'].includes(tabParam)) {
                return tabParam;
            }
        }
        return 'calls';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Sync URL query param when tab changes
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabId);
            window.history.replaceState({}, '', url.toString());
        }
    };

    // Listen to browser forward/backward buttons
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (['calls', 'chat', 'studio', 'history'].includes(tabParam)) {
                setActiveTab(tabParam);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Audio calibration state
    const [testStream, setTestStream] = useState(null);
    const [isTestingMic, setIsTestingMic] = useState(false);
    const [warmupOpen, setWarmupOpen] = useState(false);

    // Scenario selection state for Studio Tab
    const [activeScenario, setActiveScenario] = useState('thesis');

    const toggleMicTest = async () => {
        if (isTestingMic) {
            if (testStream) {
                testStream.getTracks().forEach(track => track.stop());
                setTestStream(null);
            }
            setIsTestingMic(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setTestStream(stream);
                setIsTestingMic(true);
            } catch (err) {
                alert('Izin mikrofon diperlukan untuk menguji kalibrasi suara bilik latihan.');
            }
        }
    };

    const personas = [
        {
            id: 'rifai',
            name: 'Rifai',
            role: 'AI Lokal Cerdas & Teman Ngobrol',
            organization: 'VOIC Autonomous Studio',
            badge: 'AI Lokal Buatan Kita',
            avatar: 'RF',
            avatar_color: 'from-emerald-500 to-teal-700',
            border_glow: 'hover:border-emerald-500/50',
            accent: 'emerald',
            style: 'Santai, luwes, cerdas, hangat, asik diajak ngobrol apa saja, berbahasa Indonesia alami (aku-kamu).',
            tags: ['AI Lokal', 'Teman Ngobrol', 'Bebas Kaku', 'Diskusi Seru'],
            sample_question: 'Halo! Aku Rifai, AI lokal buatan kita. Mau ngobrol atau bahas ide apa hari ini?'
        }
    ];

    const scenarios = {
        thesis: {
            id: 'thesis',
            type: 'thesis_defense',
            title: 'Sidang Skripsi & Tesis',
            tag: 'Akademik & Penelitian',
            description: 'Uji argumentasi ilmiah di hadapan dewan penguji. Evaluasi kestabilan tatapan mata saat mempresentasikan slide dan eliminasi kata jeda non-produktif.',
            duration: '3 - 5 Menit per Sesi',
            metrics: [
                { label: 'Target Kontak Mata', value: '> 80%', detail: 'Fokus ke lensa penguji' },
                { label: 'Batas Filler Words', value: '< 2 kata/menit', detail: 'Eliminasi "anu, kayak"' },
                { label: 'Kestabilan Tempo', value: '120 - 145 WPM', detail: 'Artikulasi akademis' },
            ],
            rubrics: [
                'Argumen tesis berbasis data terstruktur',
                'Ketahanan menjawab sanggahan kritis',
                'Ketenangan vokal di bawah tekanan'
            ],
            cta: 'Mulai Simulasi Sidang'
        },
        interview: {
            id: 'interview',
            type: 'job_interview',
            title: 'Wawancara HR & User',
            tag: 'Karier & Rekrutmen',
            description: 'Latih ketajaman formulasi metode STAR (Situation, Task, Action, Result) dan penyampaian proposisi nilai diri tanpa terdengar kaku.',
            duration: '2 - 4 Menit per Sesi',
            metrics: [
                { label: 'Target Kontak Mata', value: '> 85%', detail: 'Membangun impresi personal' },
                { label: 'Batas Filler Words', value: '< 1 kata/menit', detail: 'Kepercayaan diri tinggi' },
                { label: 'Kestabilan Tempo', value: '130 - 150 WPM', detail: 'Irama persuasif wajar' },
            ],
            rubrics: [
                'Struktur STAR ringkas dan berorientasi dampak',
                'Komunikasi nilai tambah personal otentik',
                'Ketenangan ekspresi wajah & kontak visual'
            ],
            cta: 'Mulai Simulasi Wawancara'
        },
        pitch: {
            id: 'pitch',
            type: 'public_speech',
            title: 'Executive Pitch & Pidato',
            tag: 'Leadership & Bisnis',
            description: 'Bangun wibawa panggung (executive presence), modulasi intonasi persuasif, dan manfaatkan jeda hening strategis untuk memikat audiens.',
            duration: '3 - 6 Menit per Sesi',
            metrics: [
                { label: 'Target Kontak Mata', value: '> 75%', detail: 'Penyebaran fokus audiens' },
                { label: 'Batas Filler Words', value: '0 kata/menit', detail: 'Otoritas vokal mutlak' },
                { label: 'Kestabilan Tempo', value: '110 - 135 WPM', detail: 'Jeda hening terencana' },
            ],
            rubrics: [
                'Modulasi pitch & intonasi terarah',
                'Penggunaan tactical pause sebelum poin kunci',
                'Kontak visual tegas dan terkalibrasi'
            ],
            cta: 'Mulai Simulasi Pitch'
        }
    };

    const current = scenarios[activeScenario];

    return (
        <AppLayout currentRoute="home" activeTab={activeTab} onTabChange={handleTabChange}>
            <Head title="Dashboard Command Center : VOIC Autonomous AI Coach" />

            {/* Ambient Radial Accent */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-blue-600/[0.04] dark:bg-blue-600/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 relative z-10">
                
                {/* 1. Executive Welcome & Live Telemetry Header Bar */}
                <section className="bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-xs dark:shadow-2xl relative overflow-hidden transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                        
                        {/* User Greeting & Status */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/50 font-mono text-[11px] text-blue-900 dark:text-blue-200 font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    <span>EXECUTIVE COMMAND CENTER</span>
                                </span>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                                    {user?.role === 'student' ? 'Akademisi & Riset' : user?.role === 'job_seeker' ? 'Kandidat Profesional' : 'Executive Leader'}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                <span>Selamat Datang, {user?.name || 'Praktisi Komunikasi'}</span>
                            </h1>

                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                Bilik latihan vokal dan simulasi wawancara otonom. Beralih antar fitur Panggilan AI, Chat Gemini, Studio Mandiri, dan Riwayat Sesi dengan cepat melalui sidebar navigasi.
                            </p>
                        </div>

                        {/* Telemetry Status Gauges & Utility CTAs */}
                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            {/* Gemini Status Badge */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40 font-mono text-xs text-blue-900 dark:text-blue-200 shadow-2xs transition-colors">
                                <Sparkle size={15} weight="fill" className="text-blue-600 dark:text-blue-400" />
                                <span>Gemini 3.6 Flash</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>

                            {/* Vocal Warmup 30s Modal Trigger */}
                            <button
                                type="button"
                                onClick={() => setWarmupOpen(true)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50/60 dark:bg-[#141822] dark:hover:bg-rose-950/30 border border-slate-200/80 dark:border-white/[0.1] text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
                                title="Latihan pernapasan diafragma 30 detik"
                            >
                                <Wind size={15} className="text-rose-500 dark:text-rose-400" />
                                <span>Pemanasan Vokal</span>
                            </button>

                            {/* Mic Calibration Toggle */}
                            <button
                                type="button"
                                onClick={toggleMicTest}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer shadow-2xs ${
                                    isTestingMic 
                                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-900 dark:text-blue-200' 
                                        : 'bg-white hover:bg-slate-50 dark:bg-[#141822] dark:hover:bg-slate-800 border-slate-200/80 dark:border-white/[0.1] text-slate-700 dark:text-slate-300'
                                }`}
                                title="Uji kalibrasi gelombang mikrofon bilik"
                            >
                                <Microphone size={15} className={isTestingMic ? 'text-blue-600 animate-pulse' : 'text-slate-500'} />
                                <span>{isTestingMic ? 'Stop Uji Audio' : 'Kalibrasi Mic'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Performance Metrics Quick Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.06] font-mono">
                        <div className="p-3 bg-slate-50 dark:bg-[#0a0d13]/80 rounded-2xl border border-slate-200/70 dark:border-white/[0.04]">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">KELANCARAN RATA-RATA</span>
                            <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">86.4<span className="text-xs text-slate-400">/100</span></div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-[#0a0d13]/80 rounded-2xl border border-slate-200/70 dark:border-white/[0.04]">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">KONTAK MATA TERJAGA</span>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">88% <span className="text-[10px] text-teal-600 dark:text-teal-400 font-normal">Stabil</span></div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-[#0a0d13]/80 rounded-2xl border border-slate-200/70 dark:border-white/[0.04]">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">TEMPO WPM OPTIMAL</span>
                            <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">138 <span className="text-[10px] text-slate-400 font-normal">WPM</span></div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-[#0a0d13]/80 rounded-2xl border border-slate-200/70 dark:border-white/[0.04]">
                            <span className="text-[10px] text-slate-500 uppercase block font-medium">TOTAL SESI BERLATIH</span>
                            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{recentSessions.length > 0 ? recentSessions.length : 8} <span className="text-[10px] text-slate-400 font-normal">Sesi</span></div>
                        </div>
                    </div>
                </section>

                {/* 2. Active Workspace Section (Navigated from Top Navbar) */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {activeTab === 'calls' && 'Bilik Panggilan AI (Tatap Muka & Suara)'}
                                    {activeTab === 'chat' && 'Konsol Tanya Jawab Gemini 3.6 Flash'}
                                    {activeTab === 'studio' && 'Studio Latihan Mandiri & Kalibrasi Skenario'}
                                    {activeTab === 'history' && 'Riwayat Sesi & Evaluasi Komunikasi'}
                                </h2>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {activeTab === 'calls' && 'Pilih persona penguji untuk simulasi interaktif tatap muka langsung ditenagai Google Gemini 3.6 Flash.'}
                                {activeTab === 'chat' && 'Konsultasi materi, bedah argumen presentasi, dan susun naskah bicara bersama Google Gemini AI.'}
                                {activeTab === 'studio' && 'Rekam latihan mandiri dengan kalibrasi rubrik otomatis dan monitor gelombang vokal real-time.'}
                                {activeTab === 'history' && 'Tinjau rekaman audio sebelum dan sesudah latihan beserta catatan evaluasi performa vokal.'}
                            </p>
                        </div>

                        {/* Top Navbar Active Feature Indicator Pill */}
                        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.08] font-mono text-xs text-slate-700 dark:text-slate-300 shrink-0 shadow-sm transition-colors">
                            <span className="text-slate-400">Fitur Aktif:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                                {activeTab === 'calls' && (
                                    <>
                                        <VideoCamera size={14} weight="bold" />
                                        <span>Panggilan AI</span>
                                    </>
                                )}
                                {activeTab === 'chat' && (
                                    <>
                                        <Sparkle size={14} weight="fill" />
                                        <span>Chat Gemini</span>
                                    </>
                                )}
                                {activeTab === 'studio' && (
                                    <>
                                        <Target size={14} weight="bold" />
                                        <span>Studio Mandiri</span>
                                    </>
                                )}
                                {activeTab === 'history' && (
                                    <>
                                        <ClockCounterClockwise size={14} weight="bold" />
                                        <span>Riwayat Sesi</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* TAB CONTENT 1: AI CALL SUITE (VIDEO & VOICE CALL ROOMS) */}
                    {activeTab === 'calls' && (
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Pilih Persona Penguji untuk Mulai Panggilan
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Setiap persona ditenagai kecerdasan Google Gemini 3.6 Flash dengan gaya pengujian berbeda. Klik tombol Video Call atau Voice Call untuk langsung terhubung.
                                    </p>
                                </div>
                                <div className="text-[11px] font-mono text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-200/70 dark:border-blue-800/40 flex items-center gap-2 shrink-0">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    <span>WebRTC & Audio Analyser Siap</span>
                                </div>
                            </div>

                            {/* 4 Persona Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {personas.map((p) => (
                                    <div
                                        key={p.id}
                                        className="bg-white dark:bg-[#0f1219] hover:bg-slate-50 dark:hover:bg-[#121622] border border-slate-200/90 dark:border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-200 shadow-xs dark:shadow-xl flex flex-col justify-between space-y-5 group"
                                    >
                                        <div className="space-y-3.5">
                                            {/* Card Top: Avatar, Names & Badge */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 border border-white/[0.15] text-white font-mono font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                                                        {p.avatar}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                                            {p.name}
                                                        </h4>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                            {p.role} · {p.organization}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className="text-[10px] font-mono text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-200/80 dark:border-blue-800/40 font-semibold shrink-0">
                                                    {p.badge}
                                                </span>
                                            </div>

                                            {/* Persona Style Description */}
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {p.style}
                                            </p>

                                            {/* Sample Prompt / Question */}
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-white/[0.05] text-[11px] text-slate-600 dark:text-slate-400 font-sans italic">
                                                "{p.sample_question}"
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                                                {p.tags.map((t, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] text-slate-600 dark:text-slate-400">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Direct 1-Click Launch Actions */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2.5">
                                            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:block">
                                                Akses Langsung:
                                            </div>

                                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                                {/* Voice Call Button */}
                                                <Link
                                                    href={`/call/room?persona=${p.id}&mode=voice`}
                                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#181d2a] dark:hover:bg-[#222a3d] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all active:scale-[0.98] shadow-2xs"
                                                    title="Mulai Panggilan Suara Tanpa Kamera"
                                                >
                                                    <PhoneCall size={14} className="text-blue-700 dark:text-blue-400" />
                                                    <span>Voice Call</span>
                                                </Link>

                                                {/* Video Call Button */}
                                                <Link
                                                    href={`/call/room?persona=${p.id}&mode=video`}
                                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all active:scale-[0.98] shadow-xs"
                                                    title="Mulai Video Call Tatap Muka dengan Kamera"
                                                >
                                                    <VideoCamera size={14} weight="bold" />
                                                    <span>Video Call</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* TAB CONTENT 2: GEMINI ASSISTANT CHAT CONSOLE */}
                    {activeTab === 'chat' && (
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <DashboardGeminiChat />
                        </motion.div>
                    )}

                    {/* TAB CONTENT 3: STUDIO MANDIRI & KALIBRASI AUDIO */}
                    {activeTab === 'studio' && (
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Live Oscilloscope & Audio Test Bar */}
                            <div className="bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 shadow-xs dark:shadow-xl space-y-4 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            MONITOR GELOMBANG AUDIO BILIK
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleMicTest}
                                        className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                                            isTestingMic 
                                                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 text-blue-900 dark:text-blue-200' 
                                                : 'bg-white hover:bg-slate-50 dark:bg-[#141822] border-slate-200/80 dark:border-white/[0.1] text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {isTestingMic ? 'Matikan Monitor Audio' : 'Aktifkan Mikrofon Monitor'}
                                    </button>
                                </div>

                                <div className="rounded-xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] bg-[#090b10]">
                                    <AudioOscilloscope stream={testStream} isRecording={isTestingMic} height={140} />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                                    <div className="p-2.5 bg-slate-50 dark:bg-[#141822] rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                                        <span className="text-[9px] text-slate-500 uppercase block">FORMAT AUDIO</span>
                                        <span className="text-slate-900 dark:text-white font-bold">OPUS 48kHz</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 dark:bg-[#141822] rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                                        <span className="text-[9px] text-slate-500 uppercase block">LATENSI IRIS</span>
                                        <span className="text-blue-700 dark:text-blue-400 font-bold">0 ms</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 dark:bg-[#141822] rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                                        <span className="text-[9px] text-slate-500 uppercase block">STATUS MIC</span>
                                        <span className={isTestingMic ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-500 font-bold'}>
                                            {isTestingMic ? 'Terkalibrasi' : 'Standby'}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 dark:bg-[#141822] rounded-xl border border-slate-200/80 dark:border-white/[0.04]">
                                        <span className="text-[9px] text-slate-500 uppercase block">ENGINE STT</span>
                                        <span className="text-slate-900 dark:text-white font-bold">Whisper-v3</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3 Interactive Practice Scenarios */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Pilih Skenario Latihan Mandiri Terstruktur
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Kalibrasi rubrik otomatis disesuaikan dengan skenario yang Anda pilih.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    {/* Left: Scenario Switcher Tabs */}
                                    <div className="lg:col-span-4 space-y-2.5">
                                        {Object.values(scenarios).map((s) => {
                                             const isCurrent = activeScenario === s.id;
                                             return (
                                                 <button
                                                     key={s.id}
                                                     type="button"
                                                     onClick={() => setActiveScenario(s.id)}
                                                     className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer relative shadow-2xs ${
                                                         isCurrent 
                                                             ? 'bg-blue-50/80 dark:bg-[#141822] border-blue-300 dark:border-blue-700/60 text-slate-900 dark:text-white font-medium' 
                                                             : 'bg-white dark:bg-[#0f1219] border-slate-200/80 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-white/[0.14]'
                                                     }`}
                                                 >
                                                     <div className="flex items-center justify-between">
                                                         <span className="text-[10px] font-mono font-bold text-blue-800 dark:text-blue-300 uppercase">
                                                             {s.tag}
                                                         </span>
                                                         <span className="text-[11px] font-mono text-slate-400">
                                                             {s.duration}
                                                         </span>
                                                     </div>
                                                     <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                                                         {s.title}
                                                     </div>
                                                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                         {s.description}
                                                     </p>
                                                     {isCurrent && (
                                                         <div className="absolute inset-y-0 left-0 w-1 bg-blue-700 rounded-l-xl" />
                                                     )}
                                                 </button>
                                             );
                                        })}
                                    </div>

                                    {/* Right: Detailed Scenario Rubric */}
                                    <div className="lg:col-span-8 bg-white dark:bg-[#0f1219] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs dark:shadow-xl transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
                                            <div>
                                                <div className="text-[11px] font-mono text-blue-800 dark:text-blue-300 uppercase font-bold">
                                                    RUBRIK TERSTANDARISASI
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                                                    {current.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 bg-blue-50/70 dark:bg-[#141822] px-3 py-1.5 rounded-lg border border-blue-200/70 dark:border-white/[0.06]">
                                                <Clock size={14} className="text-blue-700 dark:text-blue-400" />
                                                <span>{current.duration}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {current.description}
                                        </p>

                                        {/* Metrics Calibration Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {current.metrics.map((m, idx) => (
                                                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] rounded-xl font-mono space-y-1">
                                                    <div className="text-[10px] text-slate-500 uppercase font-medium">{m.label}</div>
                                                    <div className="text-lg font-bold text-blue-800 dark:text-blue-300">{m.value}</div>
                                                    <div className="text-[10px] text-slate-400">{m.detail}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Focus Checklist */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                                                FOKUS EVALUASI OTOMATIS
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                {current.rubrics.map((r, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04]">
                                                        <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-blue-300/60 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0">
                                                            <Check size={10} weight="bold" />
                                                        </div>
                                                        <span>{r}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Launch CTA */}
                                        <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.06]">
                                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                                Rekam Latihan Mandiri
                                            </span>
                                            <Link
                                                href={`/studio?type=${current.type}`}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all active:scale-[0.98] shadow-xs"
                                            >
                                                <span>{current.cta}</span>
                                                <ArrowRight size={14} weight="bold" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB CONTENT 4: RIWAYAT SESI & ANALISIS SEBELUM/SESUDAH */}
                    {activeTab === 'history' && (
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Interactive Before vs After Audio Showcase */}
                            <InteractiveBeforeAfterDemo />

                            {/* Recent Sessions List */}
                            <div className="bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-4 shadow-md dark:shadow-xl transition-colors">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3 font-mono text-xs">
                                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        LOG REKAMAN SESI LATIHAN TERBARU
                                    </h3>
                                    <Link href="/history" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1">
                                        <span>Lihat Seluruh Riwayat</span>
                                        <ArrowRight size={12} weight="bold" />
                                    </Link>
                                </div>

                                {recentSessions.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                        {recentSessions.map((session) => (
                                            <div key={session.id} className="py-3.5 flex items-center justify-between gap-4 font-mono text-xs">
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="text-slate-900 dark:text-white font-bold truncate">
                                                        {session.session_type === 'thesis_defense' ? 'Sidang Skripsi' : session.session_type === 'job_interview' ? 'Wawancara STAR' : 'Executive Pitch'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {new Date(session.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {Math.round(session.duration_seconds || 120)}s
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="text-right">
                                                        <span className="text-slate-400 text-[10px] block">SKOR TOTAL</span>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                            {session.feedback?.overall_score || session.metric?.overall_score || 82.5}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/sessions/${session.id}`}
                                                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141822] dark:hover:bg-[#1a202d] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] transition-colors"
                                                    >
                                                        Detail
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-slate-400 text-xs font-mono">
                                        Belum ada rekaman sesi sebelumnya. Mulai sesi panggilan AI atau latihan studio Anda sekarang!
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </section>
            </div>

            {/* Vocal Warmup Modal */}
            <VocalWarmupModal isOpen={warmupOpen} onClose={() => setWarmupOpen(false)} />
        </AppLayout>
    );
}

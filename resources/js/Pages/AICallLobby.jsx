import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import axios from 'axios';
import AppLayout from '../Layouts/AppLayout';
import { 
    VideoCamera, 
    PhoneCall, 
    Microphone, 
    ArrowRight, 
    GraduationCap, 
    Briefcase, 
    Presentation, 
    Sparkle, 
    ShieldCheck, 
    Check, 
    Sliders,
    ChatTeardropText
} from '@phosphor-icons/react';

export default function AICallLobby({ personas = [] }) {
    const shouldReduce = useReducedMotion();
    const [selectedMode, setSelectedMode] = useState('video'); // 'video' | 'voice'
    const [engineStatus, setEngineStatus] = useState(null);

    const rifaiPersona = personas[0] || {
        id: 'rifai',
        name: 'Rifai',
        role: 'AI Lokal Cerdas & Teman Ngobrol',
        organization: 'VOIC Autonomous Studio',
        style: 'Santai, luwes, cerdas, hangat, asik diajak ngobrol apa saja, berbahasa Indonesia alami (aku-kamu).',
        initial_greeting: 'Halo! Aku Rifai, AI lokal buatan kita. Senang banget bisa ngobrol langsung sama kamu. Mau bahas apa hari ini? Cerita aja, aku siap dengerin!'
    };

    useEffect(() => {
        axios.get('/api/assistant/engine-status')
            .then(res => {
                if (res.data?.status) setEngineStatus(res.data.status);
            })
            .catch(() => {});
    }, []);

    const handleStartCall = () => {
        router.visit(`/call/room?persona=rifai&mode=${selectedMode}`);
    };

    return (
        <AppLayout currentRoute="call">
            <Head title="Ngobrol dengan Rifai (AI Lokal) : VOIC" />

            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
                {/* Header Banner */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-slate-900/80 border border-blue-200/80 dark:border-blue-900/50 text-blue-950 dark:text-blue-200 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span>AI LOKAL MANDIRI · INTERAKTIF DUA ARAH · REAL-TIME VOICE</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Ngobrol Langsung dengan Rifai (AI Lokal)
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        Rifai adalah AI lokal cerdas buatan kita yang siap diajak ngobrol santai, bertukar pikiran, atau mendiskusikan ide apa saja secara langsung tanpa koneksi internet luar.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Call Mode & AI Companion Profile (Col 7) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Call Mode Selector */}
                        <div className="space-y-3">
                            <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                1. PILIH FORMAT PANGGILAN
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Video Call Card */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedMode('video')}
                                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all cursor-pointer relative ${
                                        selectedMode === 'video'
                                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/60 text-slate-900 dark:text-white ring-1 ring-blue-500/40 shadow-xs'
                                            : 'bg-white dark:bg-[#0f1219] border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.18]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2.5 rounded-xl ${selectedMode === 'video' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-[#161a24] dark:text-slate-400'}`}>
                                            <VideoCamera size={22} weight="bold" />
                                        </div>
                                        {selectedMode === 'video' && (
                                            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center">
                                                <Check size={12} weight="bold" />
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            Panggilan Video (Video Call)
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                            Kamera dan mikrofon aktif. Tatap muka langsung dengan avatar Rifai serta deteksi kinetika tatapan mata dan ekspresi.
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-mono font-semibold text-blue-700 dark:text-blue-400">
                                        Rekomendasi: Interaksi Penuh & Tatap Muka
                                    </div>
                                </button>

                                {/* Voice Call Card */}
                                <button
                                    type="button"
                                    onClick={() => setSelectedMode('voice')}
                                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all cursor-pointer relative ${
                                        selectedMode === 'voice'
                                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/60 text-slate-900 dark:text-white ring-1 ring-blue-500/40 shadow-xs'
                                            : 'bg-white dark:bg-[#0f1219] border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.18]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2.5 rounded-xl ${selectedMode === 'voice' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-[#161a24] dark:text-slate-400'}`}>
                                            <PhoneCall size={22} weight="bold" />
                                        </div>
                                        {selectedMode === 'voice' && (
                                            <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center">
                                                <Check size={12} weight="bold" />
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            Panggilan Suara (Voice Call)
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                            Hanya mikrofon tanpa kamera. Konsol panggilan audio santai dengan visualizer gelombang suara vokal.
                                        </p>
                                    </div>
                                    <div className="text-[10px] font-mono font-semibold text-blue-700 dark:text-blue-400">
                                        Rekomendasi: Ngobrol Santai & Phone Chat
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* 2. Featured AI Companion: Rifai */}
                        <div className="space-y-3">
                            <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                                2. PARTNER AI LOKAL ANDA
                            </label>
                            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0f1219] border border-blue-500/20 shadow-xs space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0 border border-blue-400/30">
                                        R
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">Rifai</span>
                                            <span className="text-[10px] font-mono text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60 font-semibold">
                                                AI Lokal Buatan Kita
                                            </span>
                                        </div>
                                        <div className="text-xs font-mono text-blue-700 dark:text-blue-400 mt-0.5 font-medium">
                                            {rifaiPersona.role}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                            {rifaiPersona.style}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                                    <span className="text-[11px] font-mono bg-slate-50 text-slate-700 dark:bg-white/[0.05] dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08]">
                                        ✓ Bahasa Santai (Aku-Kamu)
                                    </span>
                                    <span className="text-[11px] font-mono bg-slate-50 text-slate-700 dark:bg-white/[0.05] dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08]">
                                        ✓ 100% On-Device & Privat
                                    </span>
                                    <span className="text-[11px] font-mono bg-slate-50 text-slate-700 dark:bg-white/[0.05] dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08]">
                                        ✓ Tanpa Kuota / Bebas Internet
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Persona Inspector & Call Launcher (Col 5) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs relative overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold">
                                    PRATINJAU SESI PANGGILAN
                                </span>
                                <span className="text-[10px] font-mono font-bold text-blue-800 dark:text-blue-300 uppercase bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/40">
                                    {selectedMode === 'video' ? 'VIDEO CALL' : 'VOICE ONLY'}
                                </span>
                            </div>

                            {/* Persona Badge Card */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-[#141822] rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0 border border-blue-400/30">
                                    R
                                </div>
                                <div className="min-w-0">
                                    <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                                        Rifai
                                    </div>
                                    <div className="text-xs font-mono text-blue-700 dark:text-blue-400 font-medium">
                                        {rifaiPersona.role}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                        VOIC Local Intelligence
                                    </div>
                                </div>
                            </div>

                            {/* AI Engine Status Indicator */}
                            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] text-xs font-mono">
                                <span className="text-slate-500 dark:text-slate-400">Mesin AI:</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${engineStatus?.ollama?.is_running ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-amber-500'}`} />
                                    <span className={engineStatus?.ollama?.is_running ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                                        {engineStatus?.ollama?.is_running ? `${engineStatus?.ollama?.default_model || 'voic-qwen'} (Lokal Aktif)` : 'Memeriksa Ollama...'}
                                    </span>
                                </div>
                            </div>

                            {/* Initial Icebreaker Message */}
                            <div className="space-y-1.5 text-xs">
                                <div className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase font-semibold">
                                    SAPAAN PEMBUKA DARI RIFAI:
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                    "{rifaiPersona.initial_greeting}"
                                </div>
                            </div>

                            {/* Session Capabilities */}
                            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-blue-700 dark:text-blue-400" />
                                    <span>100% Percakapan privat di komputermu sendiri</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sliders size={16} className="text-blue-700 dark:text-blue-400" />
                                    <span>Fitur interupsi suara & tombol sela instan</span>
                                </div>
                            </div>

                            {/* Launch Action */}
                            <button
                                type="button"
                                onClick={handleStartCall}
                                className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                            >
                                <span>{selectedMode === 'video' ? 'Mulai Video Call dengan Rifai' : 'Mulai Panggilan Suara dengan Rifai'}</span>
                                <ArrowRight size={16} weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
    Eye, 
    Clock, 
    WarningCircle, 
    CheckCircle, 
    Play, 
    Pause, 
    ArrowRight, 
    Sparkle, 
    Sliders,
    Microphone
} from '@phosphor-icons/react';

export default function InteractiveBeforeAfterDemo() {
    const shouldReduce = useReducedMotion();
    const [mode, setMode] = useState('before'); // 'before' | 'after'
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 2.5;
                });
            }, 100);
        } else {
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    const handleToggleMode = (newMode) => {
        setMode(newMode);
        setIsPlaying(false);
        setProgress(0);
    };

    return (
        <div className="bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 shadow-md dark:shadow-xl relative overflow-hidden transition-colors">
            {/* Top Bar: Title & Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
                <div>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                        BUKTI PERUBAHAN NYATA
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        Dengar & Bandingkan: Sebelum vs Sesudah VOIC
                    </h3>
                </div>

                {/* Tactile Toggle Switch */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] rounded-xl self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => handleToggleMode('before')}
                        className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            mode === 'before' ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        {mode === 'before' && (
                            <motion.div
                                layoutId="before-after-tab-pill"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="absolute inset-0 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 rounded-lg shadow-sm"
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            <WarningCircle size={14} />
                            <span>Sebelum Latihan</span>
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleToggleMode('after')}
                        className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            mode === 'after' ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        {mode === 'after' && (
                            <motion.div
                                layoutId="before-after-tab-pill"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="absolute inset-0 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 rounded-lg shadow-sm"
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            <CheckCircle size={14} />
                            <span>Setelah 3 Sesi VOIC</span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Dynamic Content: Speech Simulation & Telemetry Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Speech Transcript Preview (Col 7) */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="p-5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-3 relative">
                        <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-200 dark:border-white/[0.06] pb-2">
                            <span className={mode === 'before' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                                {mode === 'before' ? 'REKAMAN AWAL (SESI 1)' : 'REKAMAN TERKALIBRASI (SESI 3)'}
                            </span>
                            <span className="text-slate-400">SIMULASI TRANSKRIP REAL-TIME</span>
                        </div>

                        {mode === 'before' ? (
                            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                                "Selamat pagi dewan penguji... <span className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-500/40 font-mono text-xs font-bold line-through">eung</span> saya di sini mau... <span className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-500/40 font-mono text-xs font-bold line-through">anu</span> mempresentasikan topik skripsi saya... yang... <span className="bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-500/40 font-mono text-xs font-bold line-through">kayak</span> membahas optimasi algoritma..."
                            </p>
                        ) : (
                            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                                "Selamat pagi dewan penguji yang terhormat. Hari ini saya memaparkan temuan utama riset optimasi algoritma yang berhasil memangkas latensi sistem hingga 34% secara terukur."
                            </p>
                        )}

                        {/* Interactive Audio Wave Progress */}
                        <div className="pt-2 flex items-center gap-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                            <button
                                type="button"
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`p-2 rounded-lg text-white transition-all cursor-pointer ${
                                    mode === 'before' ? 'bg-rose-700 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-500'
                                }`}
                            >
                                {isPlaying ? <Pause size={14} weight="bold" /> : <Play size={14} weight="bold" />}
                            </button>
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-[#090b10] rounded-full overflow-hidden border border-slate-300 dark:border-white/[0.08]">
                                <div 
                                    className={`h-full transition-all duration-100 ${
                                        mode === 'before' ? 'bg-rose-500' : 'bg-emerald-500 dark:bg-emerald-400'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="tabular-nums text-slate-600 dark:text-slate-300 text-[11px]">
                                {((progress / 100) * 4).toFixed(1)}s / 4.0s
                            </span>
                        </div>
                    </div>
                </div>

                {/* Score & Telemetry Difference (Col 5) */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-0.5">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">KONTAK MATA</div>
                            <div className={`text-2xl font-bold tabular-nums ${mode === 'before' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {mode === 'before' ? '48%' : '93%'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                                {mode === 'before' ? 'Sering menunduk' : 'Mantap ke lensa'}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-0.5">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">KATA PENGISI</div>
                            <div className={`text-2xl font-bold tabular-nums ${mode === 'before' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {mode === 'before' ? '12 kata/m' : '0 kata'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                                {mode === 'before' ? 'Tanda gugup tinggi' : 'Artikulasi bersih'}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-0.5">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">TEMPO BICARA</div>
                            <div className={`text-2xl font-bold tabular-nums ${mode === 'before' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                {mode === 'before' ? '184 WPM' : '135 WPM'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                                {mode === 'before' ? 'Terburu-buru' : 'Optimal & teratur'}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-0.5">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">SKOR RUBRIK</div>
                            <div className={`text-2xl font-bold tabular-nums ${mode === 'before' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {mode === 'before' ? '54/100' : '92/100'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                                {mode === 'before' ? 'Ragu-ragu' : 'Sangat Percaya Diri'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

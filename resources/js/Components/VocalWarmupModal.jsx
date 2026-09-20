import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
    X, 
    Wind, 
    ChatCircleDots, 
    Eye, 
    Play, 
    Pause, 
    ArrowRight, 
    ArrowLeft, 
    CheckCircle, 
    Sparkle,
    Microphone
} from '@phosphor-icons/react';

export default function VocalWarmupModal({ isOpen, onClose, onFinish }) {
    const shouldReduce = useReducedMotion();
    const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' | 'twister' | 'posture'

    // Breathing exercise state (4s Inhale, 4s Hold, 4s Exhale)
    const [breathPhase, setBreathPhase] = useState('Tarik Napas (Inhale)');
    const [breathCount, setBreathCount] = useState(4);
    const [isBreathingActive, setIsBreathingActive] = useState(false);
    const breathTimerRef = useRef(null);
    const breathStepRef = useRef(0); // 0: inhale, 1: hold, 2: exhale

    // Tongue twister index
    const [twisterIndex, setTwisterIndex] = useState(0);
    const twisters = [
        {
            title: 'Latihan Artikulasi "R" & "B"',
            text: 'Satu ribu, dua biru, tiga ribu, empat biru, lima ribu, enam biru.',
            tip: 'Ucapkan perlahan terlebih dahulu, lalu percepat tanpa tergelincir.',
            target: 'Kelenturan bibir dan lidah'
        },
        {
            title: 'Latihan Ketajaman Huruf "K"',
            text: 'Kuku kaki kakek-kakekku kaku-kaku karena ketusuk paku karat.',
            tip: 'Fokus pada letupan pangkal lidah agar suara terdengar jernih dan tegas.',
            target: 'Artikulasi konsonan tegas'
        },
        {
            title: 'Latihan Getaran Vokal & Diksi',
            text: 'Rika tarik-tarik rok Rina, Rina tarik-tarik rok Rika sampai robek-robek.',
            tip: 'Buka rongga mulut lebar-lebar dan gunakan napas perut dari diafragma.',
            target: 'Volume proyeksi vokal'
        }
    ];

    // Breathing cycle loop
    useEffect(() => {
        if (!isOpen || activeTab !== 'breathing' || !isBreathingActive) {
            if (breathTimerRef.current) clearInterval(breathTimerRef.current);
            return;
        }

        let secondsRemaining = 4;
        let currentStep = 0; // 0: Inhale, 1: Hold, 2: Exhale

        const phases = [
            'Tarik Napas Perlahan (Inhale)',
            'Tahan Napas di Diafragma (Hold)',
            'Hembuskan Rileks (Exhale)'
        ];

        setBreathPhase(phases[0]);
        setBreathCount(4);

        breathTimerRef.current = setInterval(() => {
            secondsRemaining -= 1;
            if (secondsRemaining <= 0) {
                currentStep = (currentStep + 1) % 3;
                secondsRemaining = 4;
                setBreathPhase(phases[currentStep]);
                breathStepRef.current = currentStep;
            }
            setBreathCount(secondsRemaining);
        }, 1000);

        return () => {
            if (breathTimerRef.current) clearInterval(breathTimerRef.current);
        };
    }, [isOpen, activeTab, isBreathingActive]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                <motion.div
                    initial={shouldReduce ? false : { opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-xl bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.12] rounded-2xl shadow-xl p-6 sm:p-7 text-slate-900 dark:text-slate-100 overflow-hidden font-sans"
                >
                    {/* Top Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                                <Wind size={18} weight="bold" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                    Pemanasan Vokal & Ketenangan (30 Detik)
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                    Hilangkan gugup dan lenturkan artikulasi sebelum mulai rekaman
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Exercise Tabs */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#141822] rounded-xl my-5 border border-slate-200/80 dark:border-white/[0.06]">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('breathing'); setIsBreathingActive(true); }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'breathing'
                                    ? 'bg-white dark:bg-[#1e2434] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.12] shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <Wind size={15} />
                            <span>Napas Diafragma</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('twister')}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'twister'
                                    ? 'bg-white dark:bg-[#1e2434] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.12] shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <ChatCircleDots size={15} />
                            <span>Pelentur Lidah</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('posture')}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'posture'
                                    ? 'bg-white dark:bg-[#1e2434] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.12] shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            <Eye size={15} />
                            <span>Postur & Tatapan</span>
                        </button>
                    </div>

                    {/* Tab 1: Breathing Exercise */}
                    {activeTab === 'breathing' && (
                        <div className="py-4 text-center space-y-5">
                            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                                {/* Animated Pulsing Ring */}
                                <motion.div
                                    animate={
                                        isBreathingActive
                                            ? breathStepRef.current === 0
                                                ? { scale: [1, 1.35], opacity: [0.4, 0.85] }
                                                : breathStepRef.current === 1
                                                    ? { scale: 1.35, opacity: 0.85 }
                                                    : { scale: [1.35, 1], opacity: [0.85, 0.4] }
                                            : { scale: 1, opacity: 0.4 }
                                    }
                                    transition={{ duration: 4, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full border-2 border-emerald-500 bg-emerald-500/10"
                                />

                                <div className="relative z-10 space-y-1">
                                    <div className="text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {breathCount}s
                                    </div>
                                    <div className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide max-w-[130px] leading-tight">
                                        {breathPhase}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Pola pernapasan 4-4-4 menurunkan detak jantung dan meredakan getaran suara tegang sebelum Anda berbicara.
                            </p>

                            <button
                                type="button"
                                onClick={() => setIsBreathingActive(!isBreathingActive)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#181d2a] dark:hover:bg-[#202738] text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                            >
                                {isBreathingActive ? <Pause size={14} /> : <Play size={14} />}
                                <span>{isBreathingActive ? 'Jeda Latihan Napas' : 'Mulai Panduan Napas'}</span>
                            </button>
                        </div>
                    )}

                    {/* Tab 2: Tongue Twisters */}
                    {activeTab === 'twister' && (
                        <div className="py-2 space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] rounded-xl space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                    <span className="text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
                                        {twisters[twisterIndex].title}
                                    </span>
                                    <span className="text-slate-500">
                                        {twisterIndex + 1} / {twisters.length}
                                    </span>
                                </div>

                                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed py-1">
                                    "{twisters[twisterIndex].text}"
                                </div>

                                <div className="text-xs text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-white/[0.06]">
                                    Tips: {twisters[twisterIndex].tip}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setTwisterIndex((twisterIndex - 1 + twisters.length) % twisters.length)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141822] dark:hover:bg-[#1a202d] text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.06] cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Sebelumnya</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTwisterIndex((twisterIndex + 1) % twisters.length)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141822] dark:hover:bg-[#1a202d] text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-white/[0.06] cursor-pointer"
                                >
                                    <span>Tantangan Berikutnya</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Posture & Gaze Guide */}
                    {activeTab === 'posture' && (
                        <div className="py-2 space-y-3 text-xs">
                            <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <div>
                                    <strong className="text-slate-900 dark:text-white">Sejajarkan Lensa Kamera Setinggi Mata</strong>
                                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Hindari kamera yang menunduk ke bawah atau mendongak ke atas. Posisi sejajar memberi kesan wibawa dan kontak mata yang wajar ke penguji.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <div>
                                    <strong className="text-slate-900 dark:text-white">Tegakkan Pundak & Longgarkan Leher</strong>
                                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Rongga dada yang terbuka memungkinkan aliran udara diafragma lebih leluasa, mencegah suara tercekik saat gugup.
                                    </p>
                                </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] rounded-xl flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-500/40 text-emerald-800 dark:text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <div>
                                    <strong className="text-slate-900 dark:text-white">Jeda Hening 1 Detik Sebelum Menjawab</strong>
                                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Jeda hening menunjukkan Anda berpikir taktis, bukan bingung. Ini cara paling ampuh memotong kata "anu" dan "eung".
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                        <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
                            VOIC Studio Warm-up
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                if (onFinish) onFinish();
                            }}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                        >
                            <CheckCircle size={15} weight="bold" />
                            <span>Saya Siap Masuk Bilik Latihan</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

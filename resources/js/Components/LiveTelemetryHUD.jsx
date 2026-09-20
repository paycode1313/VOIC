import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Waveform, 
    Eye, 
    Target, 
    Lightning, 
    Smiley, 
    Microphone, 
    Sparkle, 
    X,
    ShieldCheck
} from '@phosphor-icons/react';

export default function LiveTelemetryHUD({
    telemetry = {
        voiceTone: 'tenang',
        pitchHz: 185,
        volumeDb: -26,
        facialExpression: 'rileks',
        eyeContactPct: 88,
        isEyeOnTarget: true,
        speakingPaceWpm: 135
    },
    activeNudge = null,
    onDismissNudge = null,
    mode = 'overlay' // 'overlay' | 'inline'
}) {
    const formatToneLabel = (tone) => {
        const isInline = mode === 'inline';
        switch (tone) {
            case 'tegang': return { label: 'Nada Tegang / Meninggi', color: isInline ? 'text-amber-800 border-amber-300 bg-amber-50' : 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
            case 'monoton': return { label: 'Nada Datar / Monoton', color: isInline ? 'text-sky-800 border-sky-300 bg-sky-50' : 'text-sky-400 border-sky-500/40 bg-sky-950/40' };
            case 'dinamis': return { label: 'Nada Dinamis & Persuasif', color: isInline ? 'text-blue-900 border-blue-300 bg-blue-50' : 'text-blue-400 border-blue-500/40 bg-blue-950/40' };
            default: return { label: 'Nada Tenang & Terkontrol', color: isInline ? 'text-blue-900 border-blue-200 bg-blue-50' : 'text-blue-400 border-blue-500/40 bg-blue-950/40' };
        }
    };

    const formatExpressionLabel = (expr) => {
        const isInline = mode === 'inline';
        switch (expr) {
            case 'tegang': return { label: 'Wajah Tegang / Kaku', color: isInline ? 'text-amber-800 border-amber-300 bg-amber-50' : 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
            case 'tersenyum': return { label: 'Tersenyum & Ramah', color: isInline ? 'text-blue-900 border-blue-200 bg-blue-50' : 'text-blue-300 border-blue-500/40 bg-blue-950/40' };
            case 'ragu': return { label: 'Ekspresi Ragu / Menunduk', color: isInline ? 'text-rose-800 border-rose-300 bg-rose-50' : 'text-rose-400 border-rose-500/40 bg-rose-950/40' };
            default: return { label: 'Fokus & Percaya Diri', color: isInline ? 'text-slate-700 border-slate-300 bg-slate-100' : 'text-slate-200 border-white/[0.1] bg-[#141822]' };
        }
    };

    const toneConfig = formatToneLabel(telemetry.voiceTone);
    const exprConfig = formatExpressionLabel(telemetry.facialExpression);

    return (
        <div className={`space-y-2.5 ${mode === 'overlay' ? 'pointer-events-none' : ''}`}>
            {/* Live Telemetry Sensor Bar */}
            <div className={`p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
                mode === 'inline'
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                    : 'bg-slate-900/90 border border-white/[0.12] text-white backdrop-blur-md shadow-2xl pointer-events-auto'
            }`}>
                {/* Voice Tone & Pitch Gauge */}
                <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        mode === 'inline'
                            ? 'bg-blue-50 border border-blue-200 text-blue-600'
                            : 'bg-blue-950/80 border border-blue-500/40 text-blue-400'
                    }`}>
                        <Waveform size={12} weight="bold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 leading-none">NADA VOKAL</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${toneConfig.color}`}>
                                {toneConfig.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                {telemetry.pitchHz}Hz
                            </span>
                        </div>
                    </div>
                </div>

                {/* Facial Expression Reaction */}
                <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        mode === 'inline'
                            ? 'bg-purple-50 border border-purple-200 text-purple-600'
                            : 'bg-purple-950/80 border border-purple-500/40 text-purple-400'
                    }`}>
                        <Smiley size={12} weight="bold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 leading-none">REAKSI WAJAH</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border mt-0.5 ${exprConfig.color}`}>
                            {exprConfig.label}
                        </span>
                    </div>
                </div>

                {/* Eye Gaze Target Tracking */}
                <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        telemetry.isEyeOnTarget 
                            ? mode === 'inline' ? 'bg-teal-50 border-teal-200 text-teal-600' : 'bg-teal-950/80 border-teal-500/40 text-teal-400'
                            : mode === 'inline' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                    }`}>
                        <Target size={12} weight="bold" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 leading-none">KONTAK MATA</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-[10px] font-bold ${
                                telemetry.isEyeOnTarget 
                                    ? mode === 'inline' ? 'text-teal-700' : 'text-teal-400'
                                    : mode === 'inline' ? 'text-amber-700' : 'text-amber-400'
                            }`}>
                                {telemetry.eyeContactPct}%
                            </span>
                            <span className="text-[9px] text-slate-400">
                                {telemetry.isEyeOnTarget ? 'Fokus' : 'Melirik'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Blink Rate Kinetic Monitor */}
                {telemetry.blinkRateBpm !== undefined && (
                    <div className="hidden md:flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            mode === 'inline'
                                ? 'bg-sky-50 border border-sky-200 text-sky-600'
                                : 'bg-sky-950/80 border border-sky-500/40 text-sky-400'
                        }`}>
                            <Eye size={12} weight="bold" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 leading-none">KEDIPAN MATA</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[10px] font-bold ${
                                    telemetry.blinkRateBpm > 32 
                                        ? mode === 'inline' ? 'text-amber-700' : 'text-amber-400'
                                        : mode === 'inline' ? 'text-sky-700' : 'text-sky-300'
                                }`}>
                                    {telemetry.blinkRateBpm} bpm
                                </span>
                                <span className="text-[9px] text-slate-400">
                                    {telemetry.blinkRateBpm > 32 ? 'Tegang' : 'Alami'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Acoustic Sound Pressure Level (dB) */}
                <div className="hidden sm:flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        mode === 'inline'
                            ? 'bg-slate-100 border border-slate-200 text-slate-600'
                            : 'bg-slate-800 border border-white/[0.08] text-slate-300'
                    }`}>
                        <Microphone size={12} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 leading-none">INTENSITAS SUARA</span>
                        <span className={`text-[10px] mt-0.5 ${mode === 'inline' ? 'text-slate-700' : 'text-slate-200'}`}>
                            {telemetry.volumeDb} dB
                        </span>
                    </div>
                </div>
            </div>

            {/* AI Live Smart Nudge / Solution Banner */}
            <AnimatePresence>
                {activeNudge && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 rounded-xl shadow-md text-xs flex items-start justify-between gap-3 ${
                            mode === 'inline'
                                ? 'bg-white border border-blue-200 text-slate-800'
                                : 'bg-[#0f172a]/95 border border-blue-500/40 text-slate-100 backdrop-blur-md pointer-events-auto'
                        }`}
                    >
                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkle size={14} weight="bold" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 tracking-wider">
                                        SOLUSI REAL-TIME AI
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                        {activeNudge.category}
                                    </span>
                                </div>
                                <div className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed font-medium">
                                    {activeNudge.solution}
                                </div>
                            </div>
                        </div>

                        {onDismissNudge && (
                            <button
                                type="button"
                                onClick={onDismissNudge}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

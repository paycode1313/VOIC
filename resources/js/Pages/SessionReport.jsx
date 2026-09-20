import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { 
    Eye, 
    Waveform, 
    Lightning, 
    WarningCircle, 
    CheckCircle, 
    ArrowCounterClockwise, 
    Play, 
    Pause, 
    Clock,
    Target
} from '@phosphor-icons/react';

export default function SessionReport({ session }) {
    const { metric, feedback } = session;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const seekToWord = (timestamp) => {
        if (audioRef.current) {
            audioRef.current.currentTime = timestamp;
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const structuredTranscript = feedback?.structured_transcript || [];

    const scenarioLabel = matchSessionType(session.session_type);
    function matchSessionType(type) {
        switch (type) {
            case 'thesis_defense': return 'Sidang Skripsi';
            case 'job_interview': return 'Wawancara Kerja';
            case 'public_speech': return 'Executive Pitch';
            default: return 'Latihan Mandiri';
        }
    }

    return (
        <AppLayout currentRoute="report">
            <Head title={`Laporan Sesi: ${session.title} : VOIC`} />

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
                {/* 1. Header Banner & Overall Scorecard */}
                <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 dark:bg-slate-900/80 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 font-semibold uppercase tracking-wide">
                                {scenarioLabel}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                                Durasi: <strong className="text-slate-900 dark:text-white">{formatDuration(session.duration_seconds)}</strong>
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">|</span>
                            <span className="text-slate-500">
                                {new Date(session.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {session.title}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                            {feedback?.executive_summary || 'Evaluasi performa berbicara komprehensif.'}
                        </p>
                    </div>

                    {/* Overall Score Card */}
                    <div className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs shrink-0">
                        <div className="text-right space-y-0.5 font-mono">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                SKOR KESELURUHAN
                            </div>
                            <div className="text-4xl sm:text-5xl font-extrabold text-blue-900 dark:text-blue-400 tabular-nums">
                                {feedback?.overall_score || 85}
                                <span className="text-base text-slate-400 font-normal">/100</span>
                            </div>
                            <div className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                                {feedback?.overall_score >= 80 ? 'KOMPETEN & BERWIBAWA' : 'SIAP BERKEMBANG'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Quantitative Metric Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Metric 1: Eye Contact */}
                    <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                            <span>KONTAK MATA</span>
                            <Eye size={17} className="text-blue-700 dark:text-blue-400" weight="bold" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                            {metric?.eye_contact_percentage || 85}%
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            {metric?.eye_contact_percentage >= 75 ? 'Tatapan Lensa Stabil' : 'Tingkatkan Fokus'}
                        </div>
                    </div>

                    {/* Metric 2: WPM */}
                    <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                            <span>TEMPO BICARA</span>
                            <Clock size={17} className="text-slate-500 dark:text-slate-400" weight="bold" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                            {metric?.words_per_minute || 135} <span className="text-xs font-normal text-slate-400">WPM</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            Optimal: 120 - 150 WPM
                        </div>
                    </div>

                    {/* Metric 3: Filler Words */}
                    <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                            <span>KATA PENGISI</span>
                            <WarningCircle size={17} className="text-amber-600 dark:text-amber-400" weight="bold" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                            {metric?.filler_words_count || 0} <span className="text-xs font-normal text-slate-400">KATA</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            Contoh: "anu", "kayak"
                        </div>
                    </div>

                    {/* Metric 4: Nervousness Score */}
                    <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                            <span>INDEKS GUGUP</span>
                            <Target size={17} className="text-blue-700 dark:text-blue-400" weight="bold" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-400 font-mono tabular-nums">
                            {metric?.nervousness_score || 18} <span className="text-xs font-normal text-slate-400">/100</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                            Ketenangan Terkalibrasi
                        </div>
                    </div>
                </div>

                {/* 3. Audio Playback & Synchronized Interactive Transcript */}
                <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
                        <div className="flex items-center gap-2.5">
                            <Waveform size={20} className="text-blue-700 dark:text-blue-400" weight="bold" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                                Transkrip Rekaman & Deteksi Kata Jeda
                            </h2>
                        </div>

                        {/* Audio Controls */}
                        {session.audio_storage_path && (
                            <div className="flex items-center gap-3 font-mono text-xs">
                                <audio
                                    ref={audioRef}
                                    src={session.audio_storage_path}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleAudioEnded}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={handlePlayPause}
                                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                                >
                                    {isPlaying ? <Pause size={15} weight="bold" /> : <Play size={15} weight="bold" />}
                                    <span>{isPlaying ? 'Jeda Rekaman' : 'Putar Audio Rekaman'}</span>
                                </button>
                                <span className="text-slate-700 dark:text-slate-300 tabular-nums font-semibold px-2.5 py-1 bg-slate-100 dark:bg-[#161a24] border border-slate-200 dark:border-white/[0.08] rounded-lg">
                                    {currentTime.toFixed(1)}s
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Interactive Word Spans */}
                    <div className="p-6 bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl leading-relaxed text-sm sm:text-base font-sans">
                        {structuredTranscript.length > 0 ? (
                            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                                {structuredTranscript.map((item, idx) => {
                                    const isCurrent = currentTime >= item.start && currentTime <= item.end;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => seekToWord(item.start)}
                                            className={`transition-all rounded-lg px-2 py-0.5 text-left text-sm cursor-pointer ${
                                                item.is_filler 
                                                    ? 'bg-rose-50 text-rose-700 line-through decoration-rose-500 font-mono border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-500/40' 
                                                    : isCurrent 
                                                        ? 'bg-blue-700 text-white font-semibold scale-105 shadow-xs' 
                                                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.08]'
                                            }`}
                                            title={item.is_filler ? `Kata jeda terdeteksi (${item.start}s)` : `Klik untuk memutar dari ${item.start}s`}
                                        >
                                            {item.word}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 italic">
                                {feedback?.raw_transcript || 'Tidak ada transkrip yang tercatat.'}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 dark:bg-rose-950/60 dark:border-rose-500/40" />
                            <span>Kata Pengisi (*Filler Word*)</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-blue-700" />
                            <span>Kata Sedang Diputar</span>
                        </span>
                    </div>
                </div>

                {/* 4. Qualitative Rubric Evaluation & Action Plan Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Strengths, Weaknesses, Drills (Col 7) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Strengths Card */}
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
                                <CheckCircle size={18} weight="bold" className="text-blue-700 dark:text-blue-400" />
                                <span>POIN KELEBIHAN UTAMA</span>
                            </div>
                            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                                {(feedback?.strengths || []).map((s, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-blue-700 dark:text-blue-400 font-bold mt-0.5">•</span>
                                        <span className="leading-relaxed">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses Card */}
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                                <WarningCircle size={18} weight="bold" className="text-amber-600 dark:text-amber-400" />
                                <span>AREA YANG PERLU DIPERBAIKI</span>
                            </div>
                            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                                {(feedback?.weaknesses || []).map((w, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">•</span>
                                        <span className="leading-relaxed">{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actionable Drills */}
                        <div className="bg-white dark:bg-[#0f1219] border border-blue-500/20 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
                                <Lightning size={18} weight="bold" className="text-blue-700 dark:text-blue-400" />
                                <span>REKOMENDASI DRILL KONKRET</span>
                            </div>
                            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                                {(feedback?.actionable_drills || []).map((drill, i) => (
                                    <div key={i} className="p-4 bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] rounded-xl flex items-start gap-3.5">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 dark:text-blue-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="leading-relaxed">{drill}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Rubric Breakdown Bars & Action (Col 5) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
                                RINCIAN RUBRIK PENILAIAN
                            </div>

                            {feedback?.rubric_breakdown && (
                                <div className="space-y-4">
                                    {Object.entries(feedback.rubric_breakdown).map(([key, val]) => (
                                        <div key={key} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-mono">
                                                <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">{key}</span>
                                                <span className="font-bold text-blue-900 dark:text-blue-400 tabular-nums">{val}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-[#161a24] rounded-full overflow-hidden border border-slate-200/60 dark:border-white/[0.06]">
                                                <div 
                                                    className="h-full bg-blue-700 dark:bg-blue-600 rounded-full transition-all duration-500" 
                                                    style={{ width: `${val}%` }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                                <Link
                                    href={`/studio?type=${session.session_type}`}
                                    className="w-full py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
                                >
                                    <ArrowCounterClockwise size={16} weight="bold" />
                                    <span>Ulangi Sesi Latihan Ini</span>
                                </Link>

                                <Link
                                    href="/"
                                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141822] dark:hover:bg-[#1a202d] dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-white/[0.08] transition-all active:scale-[0.98]"
                                >
                                    <span>Kembali ke Beranda</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

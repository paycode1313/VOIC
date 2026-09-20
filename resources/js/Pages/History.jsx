import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import AppLayout from '../Layouts/AppLayout';
import { Microphone, Clock, ArrowRight, Eye, Calendar, Trophy } from '@phosphor-icons/react';

export default function History({ sessions }) {
    const shouldReduceMotion = useReducedMotion();
    const sessionList = sessions?.data || [];

    const formatSessionType = (type) => {
        switch (type) {
            case 'thesis_defense': return 'Sidang Skripsi';
            case 'job_interview': return 'Wawancara Kerja';
            case 'public_speech': return 'Executive Pitch';
            default: return 'Latihan Mandiri';
        }
    };

    return (
        <AppLayout currentRoute="history">
            <Head title="Riwayat Latihan Berbicara : VOIC" />

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-5">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Riwayat Sesi Latihan
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Pantau histori telemetri kontak mata, kestabilan tempo wicara, dan perolehan skor rubrik Anda.
                        </p>
                    </div>

                    <Link
                        href="/studio"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-xs shrink-0"
                    >
                        <Microphone size={16} weight="bold" />
                        <span>Mulai Sesi Baru</span>
                    </Link>
                </div>

                {sessionList.length === 0 ? (
                    <motion.div 
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-12 text-center space-y-4 shadow-xs max-w-xl mx-auto my-12"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                            <Trophy size={30} weight="light" className="text-blue-700 dark:text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Sesi Latihan</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Anda belum memiliki rekaman latihan di studio. Masuk ke bilik privat untuk mencoba simulasi pertama Anda.
                            </p>
                        </div>
                        <Link
                            href="/studio"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs"
                        >
                            <span>Buka Studio Latihan</span>
                            <ArrowRight size={14} weight="bold" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessionList.map((session, index) => {
                            const score = session.feedback?.overall_score || 85;
                            return (
                                <motion.div
                                    key={session.id}
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/sessions/${session.id}`}
                                        className="group bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 space-y-4 shadow-xs hover:shadow-md h-full block"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 dark:bg-slate-900/80 border border-blue-200/80 dark:border-blue-900/50 dark:text-blue-300 font-bold font-mono uppercase">
                                                    {formatSessionType(session.session_type)}
                                                </span>
                                                <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-400 tabular-nums">
                                                    SKOR: {score}/100
                                                </span>
                                            </div>

                                            <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                                {session.title}
                                            </h2>

                                            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                                                <div className="flex items-center gap-1.5">
                                                    <Eye size={15} className="text-blue-700 dark:text-blue-400" weight="bold" />
                                                    <span>Kontak: <strong className="text-slate-900 dark:text-white">{session.metric?.eye_contact_percentage || 85}%</strong></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={15} className="text-slate-400" weight="bold" />
                                                    <span>WPM: <strong className="text-slate-900 dark:text-white">{session.metric?.words_per_minute || 135}</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Calendar size={13} />
                                                <span>{new Date(session.created_at).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <span className="text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                                                Review Sesi &rarr;
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

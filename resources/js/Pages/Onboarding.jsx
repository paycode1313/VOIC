import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import AudioOscilloscope from '../Components/AudioOscilloscope';
import { 
    Waveform, 
    ArrowRight, 
    ArrowLeft, 
    Check, 
    ShieldCheck, 
    GraduationCap, 
    Briefcase, 
    Presentation, 
    Microphone, 
    Target, 
    Clock, 
    WarningCircle,
    Sliders,
    Sparkle
} from '@phosphor-icons/react';

export default function Onboarding({ initialRole = 'student', initialInstitution = '', savedSettings = {} }) {
    const shouldReduce = useReducedMotion();
    const [step, setStep] = useState(1);

    // Form states
    const [targetRole, setTargetRole] = useState(initialRole || 'student');
    const [primaryChallenge, setPrimaryChallenge] = useState(
        savedSettings.primary_challenge || 'filler_words'
    );
    const [targetDuration, setTargetDuration] = useState(
        savedSettings.target_duration || 180
    );
    const [targetInstitution, setTargetInstitution] = useState(initialInstitution || '');

    // Mic soundcheck states
    const [testStream, setTestStream] = useState(null);
    const [isTestingMic, setIsTestingMic] = useState(false);
    const [micVerified, setMicVerified] = useState(savedSettings.audio_calibrated || false);

    const toggleMic = async () => {
        if (isTestingMic) {
            if (testStream) {
                testStream.getTracks().forEach(t => t.stop());
                setTestStream(null);
            }
            setIsTestingMic(false);
        } else {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ audio: true });
                setTestStream(s);
                setIsTestingMic(true);
                setMicVerified(true);
            } catch (err) {
                alert('Izin mikrofon diperlukan untuk melakukan kalibrasi bilik.');
            }
        }
    };

    const challenges = [
        {
            id: 'filler_words',
            title: 'Banyak Kata Jeda / Pengisi',
            desc: 'Sering tanpa sadar mengucapkan "anu", "kayak", "eung" saat berpikir.',
            icon: WarningCircle,
            badge: 'Eliminasi Jeda Non-Produktif'
        },
        {
            id: 'pacing',
            title: 'Bicara Terlalu Cepat / Terburu-buru',
            desc: 'Tempo melaju di atas 170 WPM karena deg-degan, sehingga artikulasi kurang jelas.',
            icon: Clock,
            badge: 'Stabilisasi Tempo 130 WPM'
        },
        {
            id: 'eye_contact',
            title: 'Kontak Mata Kurang Mantap',
            desc: 'Cenderung melirik catatan slide atau ke bawah daripada menatap lensa penguji.',
            icon: Target,
            badge: 'Target Kontak > 80%'
        },
        {
            id: 'structure',
            title: 'Bingung Menstruktur Jawaban',
            desc: 'Menjawab berputar-putar tanpa kerangka argumen yang runtut dan berbobot.',
            icon: Sliders,
            badge: 'Metode STAR & Argumen Ilmiah'
        }
    ];

    const roles = [
        {
            id: 'student',
            title: 'Sidang Skripsi / Tesis',
            desc: 'Fokus argumentasi ilmiah, ketenangan di hadapan dewan penguji, dan penguasaan slide.',
            icon: GraduationCap,
            scenario: 'thesis_defense'
        },
        {
            id: 'job_seeker',
            title: 'Wawancara Kerja (HR & User)',
            desc: 'Fokus penyampaian metode STAR, nilai tambah personal, dan artikulasi profesional.',
            icon: Briefcase,
            scenario: 'job_interview'
        },
        {
            id: 'executive',
            title: 'Executive Pitch & Pidato',
            desc: 'Fokus wibawa panggung, modulasi intonasi persuasif, dan jeda hening taktis.',
            icon: Presentation,
            scenario: 'public_speech'
        }
    ];

    const durations = [
        { sec: 120, label: '2 Menit', detail: 'Simulasi Cepat (Elevator Pitch)' },
        { sec: 180, label: '3 Menit', detail: 'Standar Ideal (Jawaban STAR / Sub-Bab Tesis)' },
        { sec: 300, label: '5 Menit', detail: 'Simulasi Penuh (Presentasi Pembuka Sidang)' }
    ];

    const handleFinishOnboarding = () => {
        if (testStream) {
            testStream.getTracks().forEach(t => t.stop());
        }

        router.post('/onboarding', {
            target_role: targetRole,
            target_institution: targetInstitution,
            primary_challenge: primaryChallenge,
            target_duration: targetDuration,
            audio_calibrated: micVerified,
        });
    };

    const selectedChallengeObj = challenges.find(c => c.id === primaryChallenge) || challenges[0];
    const selectedRoleObj = roles.find(r => r.id === targetRole) || roles[0];

    return (
        <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600/20 selection:text-blue-950 relative overflow-hidden font-sans">
            <Head title="Kalibrasi Bilik Latihan : VOIC" />

            {/* Subtle Studio Geometry Grid */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Top Navigation */}
            <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shadow-xs">
                        <Waveform size={18} weight="bold" />
                    </div>
                    <span className="font-mono text-sm tracking-widest text-slate-800 font-semibold uppercase">
                        VOIC // ONBOARDING
                    </span>
                </Link>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                    <span>LANGKAH {step} DARI 4</span>
                </div>
            </header>

            {/* Main Step Container */}
            <main className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-center">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mb-8 border border-slate-300/40">
                    <motion.div 
                        animate={{ width: `${(step / 4) * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full bg-blue-700 rounded-full shadow-xs"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Primary Challenge Identification */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
                        >
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-mono text-blue-700 uppercase font-semibold">
                                    LANGKAH 1 : DIAGNOSTIK AWAL
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    Apa tantangan berbicara terbesar yang ingin Anda atasi?
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Sistem akan menyesuaikan sensitivitas telemetri dan rubrik penilaian AI sesuai prioritas Anda.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {challenges.map((c) => {
                                    const Icon = c.icon;
                                    const isSelected = primaryChallenge === c.id;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setPrimaryChallenge(c.id)}
                                            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer relative ${
                                                isSelected
                                                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 ring-1 ring-blue-500/40 shadow-xs'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                                    <Icon size={20} weight={isSelected ? 'bold' : 'regular'} />
                                                </div>
                                                {isSelected && (
                                                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-xs">
                                                        <Check size={12} weight="bold" />
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <div className="text-sm font-bold text-slate-900">
                                                    {c.title}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                    {c.desc}
                                                </p>
                                            </div>

                                            <div className="text-[10px] font-mono font-semibold text-blue-700">
                                                Fokus: {c.badge}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                                >
                                    <span>Lanjut ke Skenario</span>
                                    <ArrowRight size={15} weight="bold" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Scenario Target & Duration */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
                        >
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-mono text-blue-700 uppercase font-semibold">
                                    LANGKAH 2 : SASARAN & TEMPO
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    Skenario apa yang sedang Anda persiapkan saat ini?
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Pilih situasi nyata yang paling mendesak bagi Anda.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {roles.map((r) => {
                                    const Icon = r.icon;
                                    const isSelected = targetRole === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setTargetRole(r.id)}
                                            className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-blue-50/80 border-blue-500 text-slate-900 ring-1 ring-blue-500/40 shadow-xs'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                                            }`}
                                        >
                                            <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                                <Icon size={22} weight={isSelected ? 'bold' : 'regular'} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-slate-900">{r.title}</span>
                                                    {isSelected && <Check size={16} className="text-blue-700" weight="bold" />}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{r.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Duration Preference */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Target Durasi Rekaman per Sesi
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {durations.map((d) => (
                                        <button
                                            key={d.sec}
                                            type="button"
                                            onClick={() => setTargetDuration(d.sec)}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                targetDuration === d.sec
                                                    ? 'bg-blue-50/80 border-blue-500 text-blue-950 ring-1 ring-blue-500/30 shadow-xs'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/60'
                                            }`}
                                        >
                                            <div className="font-mono text-sm font-bold text-slate-900">{d.label}</div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{d.detail}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                                >
                                    <span>Lanjut Uji Suara</span>
                                    <ArrowRight size={15} weight="bold" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Live Audio Soundcheck */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
                        >
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-mono text-blue-700 uppercase font-semibold">
                                    LANGKAH 3 : KALIBRASI AUDIO BILIK
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    Uji Mikrofon & Kualitas Input Suara
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Pastikan peramban Anda dapat menangkap artikulasi suara dengan jelas sebelum masuk ke simulasi.
                                </p>
                            </div>

                            {/* Live Oscilloscope Component */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <AudioOscilloscope stream={testStream} isRecording={isTestingMic} height={120} />

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={toggleMic}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            isTestingMic
                                                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                                : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                                        }`}
                                    >
                                        <Microphone size={16} weight="bold" />
                                        <span>{isTestingMic ? 'Hentikan Uji Audio' : 'Bicara Sekarang untuk Menguji'}</span>
                                    </button>

                                    <div className="text-xs font-mono text-slate-600 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${micVerified ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span>{micVerified ? 'Mikrofon Terverifikasi' : 'Belum Teruji'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                                <div className="text-slate-900 font-semibold flex items-center gap-1.5">
                                    <ShieldCheck size={16} className="text-blue-700" />
                                    <span>Privasi Audio 100% On-Device</span>
                                </div>
                                <p className="leading-relaxed">
                                    Audio hanya diproses saat sesi latihan dimulai, dan tidak akan dibagikan ke pihak luar.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Kembali</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(4)}
                                    className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                                >
                                    <span>Lihat Cetak Biru Latihan</span>
                                    <ArrowRight size={15} weight="bold" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Personalized Practice Blueprint Card */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={shouldReduce ? false : { opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
                        >
                            <div className="space-y-1.5">
                                <div className="text-[11px] font-mono text-blue-700 uppercase font-semibold">
                                    LANGKAH 4 : CETAK BIRU SIAP
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    Rencana Latihan Personal Anda Telah Siap
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Bilik studio telah dikonfigurasi khusus untuk membantu Anda menaklukkan tantangan ini.
                                </p>
                            </div>

                            {/* Blueprint Card */}
                            <div className="p-5 sm:p-6 bg-slate-50 border border-blue-500/30 rounded-2xl space-y-4 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                                    <div>
                                        <span className="text-[10px] font-mono text-blue-700 uppercase font-bold">
                                            MODUL UTAMA
                                        </span>
                                        <div className="text-base font-bold text-slate-900">
                                            {selectedRoleObj.title}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                                        Target: {targetDuration / 60} Menit
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-xs">
                                        <div className="text-[10px] text-slate-500 uppercase">FOKUS PERBAIKAN</div>
                                        <div className="text-blue-700 font-bold text-sm">
                                            {selectedChallengeObj.title}
                                        </div>
                                        <div className="text-[10px] text-slate-600">{selectedChallengeObj.badge}</div>
                                    </div>

                                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-xs">
                                        <div className="text-[10px] text-slate-500 uppercase">TARGET KESTABILAN</div>
                                        <div className="text-slate-900 font-bold text-sm">
                                            120 - 145 WPM · Kontak &gt; 80%
                                        </div>
                                        <div className="text-[10px] text-slate-600">Terkalibrasi Standar Penguji</div>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-700 space-y-1 pt-1">
                                    <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">3 ATURAN UTAMA SESI INI:</div>
                                    <ul className="space-y-1 text-slate-600 text-xs pl-1">
                                        <li>• Tatap lensa kamera secara berkala saat menyampaikan poin inti.</li>
                                        <li>• Ambil napas jeda hening daripada menggumamkan "anu" atau "eung".</li>
                                        <li>• Tetap tenang, Anda bisa mengulang simulasi sebanyak yang Anda mau.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                                >
                                    <ArrowLeft size={14} />
                                    <span>Kembali</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleFinishOnboarding}
                                    className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold flex items-center gap-2.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                                >
                                    <span>Buka Bilik Latihan Sekarang</span>
                                    <ArrowRight size={16} weight="bold" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 text-center text-xs font-mono text-slate-400">
                VOIC (C) 2026 : AUTONOMOUS ORAL COMMUNICATION STUDIO
            </footer>
        </div>
    );
}

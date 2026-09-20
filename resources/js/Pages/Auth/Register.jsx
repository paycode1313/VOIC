import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import { 
    Waveform, 
    LockKey, 
    EnvelopeSimple, 
    User, 
    Eye, 
    EyeSlash, 
    ArrowRight, 
    ShieldCheck, 
    GraduationCap, 
    Briefcase, 
    Presentation, 
    Sparkle 
} from '@phosphor-icons/react';

export default function Register() {
    const shouldReduceMotion = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        target_role: 'student',
        target_institution: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const roles = [
        { id: 'student', label: 'Mahasiswa / Akademisi', icon: GraduationCap, hint: 'Sidang Skripsi & Tesis' },
        { id: 'job_seeker', label: 'Job Seeker', icon: Briefcase, hint: 'Wawancara HR & User' },
        { id: 'executive', label: 'Leader / Eksekutif', icon: Presentation, hint: 'Pitch & Pidato' },
    ];

    return (
        <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-900 relative overflow-hidden font-sans">
            <Head title="Daftar Akun : VOIC" />

            {/* Subtle Studio Geometry Grid */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Minimal Header */}
            <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-500/30 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-all duration-200 shadow-xs">
                        <Waveform size={18} weight="bold" />
                    </div>
                    <span className="font-mono text-sm tracking-widest text-slate-800 font-semibold uppercase">
                        VOIC // STUDIO
                    </span>
                </Link>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>REGISTRASI TERBUKA</span>
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
                <motion.div 
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-lg"
                >
                    {/* Mode Navigation Tabs */}
                    <div className="flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-xl mb-6">
                        <Link 
                            href="/login"
                            className="relative flex-1 text-center py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Masuk Akun
                        </Link>
                        <div className="relative flex-1 text-center">
                            <span className="relative z-10 block py-2 text-xs font-semibold text-slate-900">
                                Daftar Baru
                            </span>
                            <motion.div 
                                layoutId="auth-active-tab"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="absolute inset-0 bg-white border border-slate-200/80 rounded-lg shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative">
                        <div className="space-y-1.5 mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Buka Akun Studio Latihan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600">
                                Dapatkan ruang latihan privat dengan kalibrasi rubrik yang disesuaikan untuk target Anda.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Target Focus Role Selector */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700">
                                    Pilih Fokus Utama Anda
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {roles.map((r) => {
                                        const Icon = r.icon;
                                        const isSelected = data.target_role === r.id;
                                        return (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => setData('target_role', r.id)}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500/40 shadow-xs' 
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/60'
                                                }`}
                                            >
                                                <Icon size={18} weight={isSelected ? 'bold' : 'regular'} className={isSelected ? 'text-emerald-700' : 'text-slate-500'} />
                                                <div>
                                                    <div className="text-xs font-semibold leading-tight text-slate-900">
                                                        {r.label}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        {r.hint}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.target_role && (
                                    <p className="text-xs text-rose-500 pt-0.5">{errors.target_role}</p>
                                )}
                            </div>

                            {/* Name & Target Institution */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label 
                                        htmlFor="name"
                                        className="block text-xs font-semibold text-slate-700"
                                    >
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <User size={16} />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            autoComplete="name"
                                            placeholder="Nama Anda"
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-xs text-rose-500 pt-0.5">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label 
                                        htmlFor="target_institution"
                                        className="block text-xs font-semibold text-slate-700"
                                    >
                                        Kampus / Perusahaan <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        id="target_institution"
                                        type="text"
                                        name="target_institution"
                                        value={data.target_institution}
                                        placeholder="Contoh: UI / Tech Co."
                                        onChange={(e) => setData('target_institution', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label 
                                    htmlFor="email"
                                    className="block text-xs font-semibold text-slate-700"
                                >
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <EnvelopeSimple size={16} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        placeholder="nama@email.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-rose-500 pt-0.5">{errors.email}</p>
                                )}
                            </div>

                            {/* Password & Confirm */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label 
                                        htmlFor="password"
                                        className="block text-xs font-semibold text-slate-700"
                                    >
                                        Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <LockKey size={16} />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            autoComplete="new-password"
                                            placeholder="Min. 8 Karakter"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-rose-500 pt-0.5">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label 
                                        htmlFor="password_confirmation"
                                        className="block text-xs font-semibold text-slate-700"
                                    >
                                        Konfirmasi Sandi
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <LockKey size={16} />
                                        </div>
                                        <input
                                            id="password_confirmation"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            autoComplete="new-password"
                                            placeholder="Ulangi Sandi"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                        />
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-xs text-rose-500 pt-0.5">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                                <span>{processing ? 'Mendaftarkan Akun...' : 'Buat Akun & Mulai Latihan'}</span>
                                <ArrowRight size={16} weight="bold" />
                            </motion.button>
                        </form>

                        {/* Privacy Footer */}
                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-600" />
                                <span>Data Terisolasi & Privat</span>
                            </div>
                            <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                                Sudah punya akun? Masuk &rarr;
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Subtle Footer */}
            <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs font-mono text-slate-400">
                VOIC (C) 2026 : AUTONOMOUS ORAL COMMUNICATION STUDIO
            </footer>
        </div>
    );
}

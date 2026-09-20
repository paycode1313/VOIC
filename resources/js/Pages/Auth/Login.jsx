import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import { 
    Waveform, 
    LockKey, 
    EnvelopeSimple, 
    Eye, 
    EyeSlash, 
    ArrowRight, 
    ShieldCheck, 
    Sparkle, 
    CheckCircle 
} from '@phosphor-icons/react';

export default function Login() {
    const shouldReduceMotion = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-900 relative overflow-hidden font-sans">
            <Head title="Masuk Studio : VOIC" />

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
                    <span>SESI TERENKRIPSI</span>
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
                <motion.div 
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md"
                >
                    {/* Mode Navigation Tabs */}
                    <div className="flex items-center p-1 bg-slate-100 border border-slate-200/80 rounded-xl mb-6">
                        <div className="relative flex-1 text-center">
                            <span className="relative z-10 block py-2 text-xs font-semibold text-slate-900">
                                Masuk Akun
                            </span>
                            <motion.div 
                                layoutId="auth-active-tab"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                className="absolute inset-0 bg-white border border-slate-200/80 rounded-lg shadow-xs"
                            />
                        </div>
                        <Link 
                            href="/register"
                            className="relative flex-1 text-center py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Daftar Baru
                        </Link>
                    </div>

                    {/* Auth Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs relative">
                        <div className="space-y-1.5 mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Akses Studio Latihan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600">
                                Masuk untuk menyimpan rekaman analisis dan memantau progres vokal Anda.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email Field */}
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
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-rose-500 pt-0.5">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label 
                                        htmlFor="password"
                                        className="block text-xs font-semibold text-slate-700"
                                    >
                                        Kata Sandi
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <LockKey size={16} />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-rose-500 pt-0.5">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded bg-slate-50 border-slate-300 text-emerald-600 focus:ring-0 focus:ring-offset-0 transition-colors"
                                    />
                                    <span className="text-xs text-slate-600">Ingat sesi saya</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                                type="submit"
                                disabled={processing}
                                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                                <span>{processing ? 'Memproses...' : 'Masuk ke Studio'}</span>
                                <ArrowRight size={16} weight="bold" />
                            </motion.button>
                        </form>

                        {/* Privacy Footer */}
                        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-600" />
                                <span>On-Device Privacy</span>
                            </div>
                            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                                Belum punya akun? Daftar &rarr;
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

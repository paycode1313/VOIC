import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import CameraViewfinder from '../Components/CameraViewfinder';
import AudioOscilloscope from '../Components/AudioOscilloscope';
import { 
    Microphone, 
    Stop, 
    Pause, 
    Play, 
    Warning, 
    ShieldCheck, 
    SpinnerGap,
    Sliders,
    Sparkle,
    Handshake
} from '@phosphor-icons/react';

export default function Studio({ sessionType = 'thesis_defense', defaultTitle = 'Simulasi Sidang Skripsi' }) {
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [permissionError, setPermissionError] = useState('');

    // Telemetry aggregators
    const telemetryTimelineRef = useRef([]);
    const eyeContactScoresRef = useRef([]);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerIntervalRef = useRef(null);

    const [title, setTitle] = useState(defaultTitle);

    // Initialize Camera and Mic Stream
    useEffect(() => {
        let activeStream = null;

        async function initDevices() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
                    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 }
                });
                activeStream = mediaStream;
                setStream(mediaStream);
                setPermissionGranted(true);
            } catch (err) {
                console.error('Media devices error:', err);
                setPermissionError('Akses mikrofon atau kamera ditolak/tidak tersedia. Pastikan izin diaktifkan di peramban Anda.');
            }
        }

        initDevices();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // Timer Loop
    useEffect(() => {
        if (isRecording && !isPaused) {
            timerIntervalRef.current = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isRecording, isPaused]);

    // Handle Gaze Updates from Viewfinder
    const handleGazeUpdate = ({ eyeContact, onTarget, headPose }) => {
        if (!isRecording || isPaused) return;

        eyeContactScoresRef.current.push(eyeContact);
        telemetryTimelineRef.current.push({
            second: elapsedSeconds,
            eye_contact: eyeContact,
            on_target: onTarget,
            head_pose: headPose
        });
    };

    // Start Recording
    const startRecording = () => {
        if (!stream) return;

        audioChunksRef.current = [];
        telemetryTimelineRef.current = [];
        eyeContactScoresRef.current = [];
        setElapsedSeconds(0);

        try {
            const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? { mimeType: 'audio/webm;codecs=opus' }
                : { mimeType: 'audio/webm' };

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;

            setIsRecording(true);
            setIsPaused(false);
        } catch (err) {
            console.error('Failed to start MediaRecorder:', err);
            alert('Gagal memulai perekaman audio browser.');
        }
    };

    // Pause / Resume
    const togglePause = () => {
        if (!mediaRecorderRef.current) return;
        if (isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        } else {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        }
    };

    // Stop and Upload
    const completeSession = () => {
        if (!isRecording) return;
        setIsProcessing(true);

        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
        }

        setTimeout(() => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            const scores = eyeContactScoresRef.current;
            const avgEyeContact = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 85;

            const formData = new FormData();
            formData.append('title', title || 'Sesi Latihan VOIC');
            formData.append('session_type', sessionType);
            formData.append('duration_seconds', Math.max(elapsedSeconds, 1));
            formData.append('audio', audioBlob, 'session.webm');
            formData.append('eye_contact_percentage', avgEyeContact);
            formData.append('telemetry_timeline', JSON.stringify(telemetryTimelineRef.current));

            router.post('/api/sessions', formData, {
                forceFormData: true,
                onError: (errors) => {
                    console.error('Session submission error:', errors);
                    setIsProcessing(false);
                    alert('Terjadi kesalahan saat memproses sesi. Silakan coba kembali.');
                }
            });
        }, 300);
    };

    const scenarioLabel = matchSessionType(sessionType);

    function matchSessionType(type) {
        switch (type) {
            case 'thesis_defense': return 'Sidang Skripsi';
            case 'job_interview': return 'Wawancara Kerja';
            case 'public_speech': return 'Executive Pitch';
            default: return 'Latihan Mandiri';
        }
    }

    return (
        <AppLayout currentRoute="studio">
            <Head title={`Studio: ${title} : VOIC`} />

            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Top Studio Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
                            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-medium">
                                BILIK LATIHAN PRIVAT · {scenarioLabel}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isRecording}
                            className="text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-white/[0.2] focus:border-blue-600 focus:outline-none text-slate-900 dark:text-white w-full max-w-lg transition-colors py-0.5"
                        />
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                        <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#10131a] border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-2 shadow-2xs">
                            <Sliders size={15} className="text-blue-700 dark:text-blue-400" />
                            <span>KUALITAS AUDIO: <strong className="text-slate-900 dark:text-white">OPUS 48kHz</strong></span>
                        </div>
                    </div>
                </div>

                {/* Permission Warning if failed */}
                {permissionError && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
                        <Warning size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
                        <span>{permissionError}</span>
                    </div>
                )}

                {/* 2-Column Studio Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Camera Viewfinder & Guidance (Col 7) */}
                    <div className="lg:col-span-7 space-y-4">
                        <CameraViewfinder
                            stream={stream}
                            isRecording={isRecording && !isPaused}
                            elapsedSeconds={elapsedSeconds}
                            onGazeUpdate={handleGazeUpdate}
                        />

                        {/* Pre-flight Guidance Card */}
                        <div className="p-5 bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl text-xs space-y-2.5 shadow-xs">
                            <div className="text-slate-900 dark:text-white font-bold flex items-center gap-2 text-sm">
                                <Handshake size={18} className="text-blue-700 dark:text-blue-400" weight="bold" />
                                <span>Panduan Ketenangan & Kalibrasi Sesi</span>
                            </div>
                            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 leading-relaxed pl-1">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-700 dark:text-blue-400 font-bold mt-0.5">•</span>
                                    <span>Tarik napas perlahan sebelum mulai. Posisikan tubuh tegak dan nyaman di hadapan kamera.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-700 dark:text-blue-400 font-bold mt-0.5">•</span>
                                    <span>Pertahankan tatapan ke lensa kamera saat menyampaikan gagasan kunci.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-700 dark:text-blue-400 font-bold mt-0.5">•</span>
                                    <span>Gunakan jeda hening sejenak (1-2 detik) daripada mengisi kekosongan dengan "anu" atau "kayak".</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Audio Oscilloscope & Live Meters (Col 5) */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Audio Waveform Oscilloscope */}
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
                            <AudioOscilloscope
                                stream={stream}
                                isRecording={isRecording && !isPaused}
                                height={150}
                            />
                        </div>

                        {/* Live Pacing & Telemetry Status Board */}
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xs">
                            <div className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase border-b border-slate-100 dark:border-white/[0.06] pb-2">
                                STATUS TELEMETRI LANGSUNG
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] rounded-xl font-mono">
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">WAKTU SESI</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                                        {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
                                        {(elapsedSeconds % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">Target: 2 - 5 Menit</div>
                                </div>

                                <div className="p-3.5 bg-slate-50 dark:bg-[#141822] border border-slate-200/80 dark:border-white/[0.06] rounded-xl font-mono">
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">STATUS MIKROFON</div>
                                    <div className={`text-sm font-bold mt-2 ${isRecording ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500'}`}>
                                        {isRecording ? (isPaused ? 'DIJEDA' : 'MEREKAM') : 'STANDBY'}
                                    </div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">WebAudio 48kHz</div>
                                </div>
                            </div>

                            {/* Processing Indicator during upload */}
                            {isProcessing && (
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-3 animate-pulse">
                                    <SpinnerGap size={22} className="animate-spin text-blue-700 dark:text-blue-400 shrink-0" />
                                    <div>
                                        <div className="font-bold">MENGANALISIS SESI LATIHAN...</div>
                                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                            Groq Whisper STT & Rubrik Evaluator sedang mengkalkulasi skor performa wicara...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Physical Hardware Control Switcher */}
                        <div className="bg-white dark:bg-[#0f1219] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 space-y-3 shadow-xs">
                            <div className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                                KONTROL SESI
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {!isRecording ? (
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        disabled={!permissionGranted || isProcessing}
                                        className="flex-1 py-3.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                                    >
                                        <Microphone size={18} weight="bold" />
                                        <span>Mulai Latihan</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={togglePause}
                                            disabled={isProcessing}
                                            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#161a24] dark:hover:bg-[#1e2433] dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-white/[0.08] transition-all active:scale-[0.98] cursor-pointer"
                                        >
                                            {isPaused ? <Play size={16} weight="bold" /> : <Pause size={16} weight="bold" />}
                                            <span>{isPaused ? 'Lanjutkan' : 'Jeda'}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={completeSession}
                                            disabled={isProcessing || elapsedSeconds < 3}
                                            className="flex-1 py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40 shadow-xs cursor-pointer"
                                        >
                                            <Stop size={16} weight="bold" />
                                            <span>Selesaikan & Evaluasi</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

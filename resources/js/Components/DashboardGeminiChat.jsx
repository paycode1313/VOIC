import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { 
    Sparkle, 
    PaperPlaneRight, 
    Microphone, 
    MicrophoneSlash, 
    Copy, 
    Check, 
    SpeakerHigh, 
    ArrowRight, 
    Trash, 
    Lightning,
    ChatTeardropDots,
    Robot,
    User,
    ArrowsClockwise,
    Key,
    X
} from '@phosphor-icons/react';

export default function DashboardGeminiChat() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'assistant',
            text: 'Halo! Saya asisten komunikasi VOIC bertenaga Google Gemini. Butuh formulasi jawaban wawancara metode STAR, persiapan sanggahan sidang skripsi, atau naskah elevator pitch? Pilih topik di bawah atau ketik langsung pertanyaan Anda.',
            script: 'Selamat pagi rekan-rekan. [jeda 1s] Hari ini saya ingin memaparkan solusi terukur [jeda 1s] yang menjawab inti masalah operasional kita.',
            followups: [
                'Buatkan jawaban STAR untuk pengalaman memimpin proyek kritis',
                'Bagaimana merespons pertanyaan jebakan penguji skripsi?',
                'Cara mengatasi nada vokal gemetar saat gugup'
            ],
            recommendedAction: {
                label: 'Uji Coba Lisan di Bilik Panggilan AI',
                url: '/call'
            }
        }
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('voic-qwen');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [keyStatus, setKeyStatus] = useState({ has_key: false, source: 'none' });
    const [engineStatus, setEngineStatus] = useState(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isSavingKey, setIsSavingKey] = useState(false);
    const [keyMessage, setKeyMessage] = useState(null);

    // Fetch engine & key status on mount
    useEffect(() => {
        axios.get('/api/assistant/key-status')
            .then(res => {
                if (res.data) setKeyStatus(res.data);
            })
            .catch(() => {});

        axios.get('/api/assistant/engine-status')
            .then(res => {
                if (res.data?.status) setEngineStatus(res.data.status);
            })
            .catch(() => {});
    }, []);

    const handleSaveKey = async (e) => {
        e.preventDefault();
        setIsSavingKey(true);
        setKeyMessage(null);
        try {
            const res = await axios.post('/api/assistant/save-key', { api_key: apiKeyInput });
            if (res.data?.success) {
                setKeyStatus({ has_key: res.data.has_key, source: res.data.has_key ? 'session' : 'none' });
                setKeyMessage({ type: 'success', text: res.data.message });
                setTimeout(() => setShowKeyModal(false), 1500);
            }
        } catch (err) {
            setKeyMessage({ type: 'error', text: 'Gagal menyimpan kunci API. Periksa kembali format kunci.' });
        } finally {
            setIsSavingKey(false);
        }
    };

    const chatEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const starterPrompts = [
        {
            category: 'thesis',
            prompt: 'Bagaimana cara menjawab pertanyaan jebakan penguji tentang keterbatasan sampel data?',
            badge: 'Sidang Skripsi'
        },
        {
            category: 'interview',
            prompt: 'Buatkan formulasi jawaban metode STAR saat ditanya tentang kegagalan terbesar dalam karier.',
            badge: 'Wawancara STAR'
        },
        {
            category: 'pitch',
            prompt: 'Tuliskan pembuka (hook) 60 detik untuk pitch bisnis di hadapan investor ventura.',
            badge: 'Executive Pitch'
        },
        {
            category: 'vocal',
            prompt: 'Tips vokal agar intonasi tidak terdengar monoton dan nafas tidak habis di tengah kalimat.',
            badge: 'Teknik Vokal'
        }
    ];

    const filteredPrompts = selectedCategory === 'all' 
        ? starterPrompts 
        : starterPrompts.filter(p => p.category === selectedCategory);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Speech-to-Text Setup for Voice Prompting
    const toggleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Pengenalan suara tidak didukung di peramban ini. Silakan gunakan peramban Chrome atau Edge.');
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
        } else {
            const recognition = new SpeechRecognition();
            recognition.lang = 'id-ID';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            try {
                recognition.start();
                setIsListening(true);
            } catch (e) {
                setIsListening(false);
            }

            recognitionRef.current = recognition;
        }
    };

    // Send Message to API
    const handleSend = async (messageText = input) => {
        const text = (messageText || '').trim();
        if (!text || isLoading) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const historyPayload = updatedMessages.map(m => ({
                sender: m.sender,
                text: m.text
            }));

            const res = await axios.post('/api/assistant/chat', {
                message: text,
                history: historyPayload,
                model: selectedModel,
                scenario: selectedCategory === 'all' ? 'general' : selectedCategory
            });

            if (res.data?.success && res.data?.data) {
                const data = res.data.data;
                const assistantMsg = {
                    id: Date.now() + 1,
                    sender: 'assistant',
                    text: data.response,
                    script: data.speaking_script || null,
                    followups: data.suggested_followups || [],
                    recommendedAction: data.recommended_action || {
                        label: 'Latih di Bilik Panggilan AI',
                        url: '/call'
                    }
                };

                setMessages(prev => [...prev, assistantMsg]);
            }
        } catch (err) {
            console.error('Gemini chat error:', err);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'assistant',
                text: 'Koneksi ke asisten sedang mengalami perlambatan. Anda dapat tetap menggunakan naskah latihan di bawah atau mencoba kembali sesaat lagi.',
                script: 'Saya memahami tantangan ini, dan langkah strategis yang saya ambil adalah memprioritaskan pemecahan masalah secara berurutan.',
                followups: [
                    'Tips menjaga ketenangan saat presentasi',
                    'Struktur pembukaan sidang skripsi'
                ],
                recommendedAction: {
                    label: 'Masuk Bilik Panggilan AI',
                    url: '/call'
                }
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    // Copy script helper
    const handleCopyScript = (scriptText, index) => {
        navigator.clipboard.writeText(scriptText);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    // Text to Speech playback helper
    const handlePlayAudio = (scriptText) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const cleanText = scriptText.replace(/\[jeda \d+s\]/g, ', ');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: Date.now(),
                sender: 'assistant',
                text: 'Riwayat percakapan telah dibersihkan. Apa yang ingin Anda diskusikan atau formulasikan hari ini?',
                script: null,
                followups: [
                    'Buatkan jawaban STAR untuk wawancara kerja',
                    'Strategi menjawab sanggahan dosen penguji skripsi',
                    'Latihan vokal pernapasan diafragma 4-4-4'
                ],
                recommendedAction: {
                    label: 'Buka Panggilan AI',
                    url: '/call'
                }
            }
        ]);
    };

    return (
        <section id="gemini-assistant" className="bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.1] rounded-3xl p-6 sm:p-10 shadow-lg dark:shadow-2xl relative overflow-hidden space-y-6 transition-colors">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Identity, Engine Badge & Model Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.08] pb-5 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Sparkle size={18} weight="fill" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    VOIC Gemini AI Assistant
                                </h3>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                    LIVE AGENT
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                Tanya Jawab Skripsi, Formulasi STAR, Naskah Lisan, & Konsultasi Vokal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Model Engine Selector & Status Strip */}
                <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors">
                        <span className={`w-2 h-2 rounded-full ${(selectedModel.includes('qwen') || selectedModel.includes('voic')) ? (engineStatus?.ollama?.is_running ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500') : (keyStatus.has_key ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')}`} />
                        <span className="text-slate-800 dark:text-white font-medium">Model:</span>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="bg-transparent text-emerald-700 dark:text-emerald-300 font-semibold focus:outline-none cursor-pointer text-xs"
                        >
                            <option value="voic-qwen" className="bg-white dark:bg-[#141822] text-slate-900 dark:text-white">
                                VOIC Qwen 3B (Lokal Teroptimasi CPU)
                            </option>
                            <option value="qwen2.5:3b" className="bg-white dark:bg-[#141822] text-slate-900 dark:text-white">
                                Qwen 2.5 3B (Lokal Ollama Base)
                            </option>
                            <option value="qwen2.5:7b" className="bg-white dark:bg-[#141822] text-slate-900 dark:text-white">
                                Qwen 2.5 7B (Lokal Ollama)
                            </option>
                            <option value="gemini-1.5-flash" className="bg-white dark:bg-[#141822] text-slate-900 dark:text-white">
                                Google Gemini 1.5 Flash (Cloud API)
                            </option>
                            <option value="gemini-1.5-pro" className="bg-white dark:bg-[#141822] text-slate-900 dark:text-white">
                                Google Gemini 1.5 Pro (Deep Reasoning)
                            </option>
                        </select>
                    </div>

                    {/* Ollama Engine Status Badge & Modal Trigger */}
                    <button
                        type="button"
                        onClick={() => setShowKeyModal(true)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs transition-colors cursor-pointer ${
                            engineStatus?.ollama?.is_running
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500/40 text-amber-800 dark:text-amber-300'
                        }`}
                        title="Status Mesin AI Lokal Ollama"
                    >
                        <Sparkle size={13} weight="fill" className={engineStatus?.ollama?.is_running ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'} />
                        <span>{engineStatus?.ollama?.is_running ? 'Qwen (Ollama): Aktif' : 'Ollama: Siapkan Mesin'}</span>
                    </button>

                    {/* Gemini API Key Status Button */}
                    <button
                        type="button"
                        onClick={() => setShowKeyModal(true)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs transition-colors cursor-pointer ${
                            keyStatus.has_key
                                ? 'bg-slate-100 dark:bg-[#141822] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
                                : 'bg-slate-100 dark:bg-[#141822] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400'
                        }`}
                        title="Pengaturan Google Gemini Cloud API"
                    >
                        <Key size={13} weight={keyStatus.has_key ? 'fill' : 'regular'} className={keyStatus.has_key ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                        <span>{keyStatus.has_key ? 'Gemini: Siap' : 'Kunci Gemini'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClearChat}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141822] dark:hover:bg-[#1a202d] border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Bersihkan Percakapan"
                    >
                        <Trash size={15} />
                    </button>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 relative z-10 text-xs font-mono">
                {[
                    { id: 'all', label: 'Semua Topik' },
                    { id: 'thesis', label: 'Sidang Skripsi' },
                    { id: 'interview', label: 'Wawancara STAR' },
                    { id: 'pitch', label: 'Executive Pitch' },
                    { id: 'vocal', label: 'Teknik Vokal' }
                ].map(cat => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            selectedCategory === cat.id
                                ? 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-950/40'
                                : 'bg-slate-100 dark:bg-[#141822] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Starter Prompt Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10">
                {filteredPrompts.map((p, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(p.prompt)}
                        disabled={isLoading}
                        className="p-3 bg-slate-50 dark:bg-[#131722]/80 hover:bg-slate-100 dark:hover:bg-[#181d2a] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-xl text-left transition-all active:scale-[0.98] group cursor-pointer space-y-1.5 flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                                {p.badge}
                            </span>
                            <Sparkle size={12} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                            {p.prompt}
                        </p>
                    </button>
                ))}
            </div>

            {/* Interactive Chat Dialogue Feed */}
            <div className="bg-slate-50/70 dark:bg-[#090b10] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 sm:p-6 h-[420px] overflow-y-auto space-y-4 relative z-10 transition-colors">
                {messages.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        className={`flex gap-3 max-w-3xl ${
                            msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                        }`}
                    >
                        {msg.sender === 'assistant' && (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Robot size={17} weight="bold" />
                            </div>
                        )}

                        <div className={`space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            {/* Message Bubble */}
                            <div
                                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                    msg.sender === 'user'
                                        ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md'
                                        : 'bg-white dark:bg-[#141822] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] rounded-tl-sm shadow-sm'
                                }`}
                            >
                                <div className="whitespace-pre-line">{msg.text}</div>
                            </div>

                            {/* Speaking Script Card (if provided by Gemini) */}
                            {msg.sender === 'assistant' && msg.script && (
                                <div className="p-3.5 bg-emerald-50/70 dark:bg-[#0f141f] border border-emerald-500/30 rounded-xl space-y-2 text-xs">
                                    <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-white/[0.06] pb-2 font-mono text-[10px]">
                                        <span className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                                            <Lightning size={12} weight="fill" />
                                            NASKAH SIAP LISAN (DENGAN TACTICAL PAUSE)
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handlePlayAudio(msg.script)}
                                                className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                                                title="Dengarkan Suara Lisan"
                                            >
                                                <SpeakerHigh size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyScript(msg.script, index)}
                                                className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-white/[0.1] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                                title="Salin Naskah"
                                            >
                                                {copiedIndex === index ? (
                                                    <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <Copy size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic bg-white dark:bg-black/40 p-2.5 rounded-lg border border-emerald-200/40 dark:border-white/[0.04]">
                                        "{msg.script}"
                                    </div>

                                    {/* Action link: Practice this script in AI Call */}
                                    {msg.recommendedAction && (
                                        <div className="pt-1 flex justify-end">
                                            <Link
                                                href={msg.recommendedAction.url}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold transition-all active:scale-[0.98]"
                                            >
                                                <span>{msg.recommendedAction.label}</span>
                                                <ArrowRight size={13} weight="bold" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Suggested Followup Prompts */}
                            {msg.sender === 'assistant' && msg.followups && msg.followups.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {msg.followups.map((f, fIdx) => (
                                        <button
                                            key={fIdx}
                                            type="button"
                                            onClick={() => handleSend(f)}
                                            disabled={isLoading}
                                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141822] hover:bg-slate-100 dark:hover:bg-[#1a202c] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-mono transition-colors cursor-pointer shadow-sm"
                                        >
                                            {f} &rarr;
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <User size={16} weight="bold" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex items-center gap-3 mr-auto max-w-md">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Robot size={17} weight="bold" className="animate-spin" />
                        </div>
                        <div className="p-3.5 bg-white dark:bg-[#141822] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Gemini sedang merumuskan naskah & strategi komunikasi...</span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Form Bar with Speech-to-Text & Quick Send */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
                className="relative z-10 flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.1] rounded-2xl shadow-md dark:shadow-xl focus-within:border-emerald-500/50 transition-colors"
            >
                {/* Voice-to-Text Button */}
                <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isListening
                            ? 'bg-rose-100 dark:bg-rose-950/70 border-rose-500/60 text-rose-700 dark:text-rose-300 animate-pulse'
                            : 'bg-white dark:bg-[#181d2a] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm'
                    }`}
                    title={isListening ? 'Hentikan dikte suara' : 'Dikte pertanyaan dengan mikrofon'}
                >
                    {isListening ? <MicrophoneSlash size={16} weight="bold" /> : <Microphone size={16} />}
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                        isListening
                            ? 'Mendengarkan suara Anda...'
                            : 'Tanyakan formulasi naskah, sanggahan sidang, atau tips vokal...'
                    }
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-sans"
                />

                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-35 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                    <span>Kirim</span>
                    <PaperPlaneRight size={14} weight="bold" />
                </button>
            </form>

            {/* Modal Konfigurasi Google Gemini API Key */}
            <AnimatePresence>
                {showKeyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#0f1219] border border-slate-200 dark:border-white/[0.12] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                                    <Key size={18} className="text-emerald-600 dark:text-emerald-400" />
                                    <span>Google Gemini API Key</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowKeyModal(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p>
                                    VOIC dirancang untuk terhubung langsung dengan model <strong>Google Gemini 1.5 Flash / Pro</strong> untuk kecerdasan tanpa batas.
                                </p>

                                <div className="p-3 bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.06] rounded-xl space-y-1 text-[11px] font-mono">
                                    <div className="text-emerald-700 dark:text-emerald-300 font-bold">Status Saat Ini:</div>
                                    <div className="text-slate-700 dark:text-slate-300">
                                        {keyStatus.has_key
                                            ? 'Google Gemini API aktif (' + (keyStatus.source === 'env' ? 'via .env' : 'via sesi aktif') + ')'
                                            : 'Kunci Google Gemini belum terpasang di .env'}
                                    </div>
                                </div>

                                <form onSubmit={handleSaveKey} className="space-y-3 pt-1">
                                    <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                                        Tempel Kunci API Gemini Anda:
                                    </label>
                                    <input
                                        type="password"
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#141822] border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                                    />

                                    {keyMessage && (
                                        <div className={`p-2.5 rounded-lg text-[11px] font-mono ${
                                            keyMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-500/30'
                                        }`}>
                                            {keyMessage.text}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setApiKeyInput('');
                                                handleSaveKey({ preventDefault: () => {} });
                                            }}
                                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141822] dark:hover:bg-[#1a202d] text-slate-600 dark:text-slate-400 text-xs font-mono transition-colors cursor-pointer"
                                        >
                                            Hapus Kunci
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSavingKey}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/40"
                                        >
                                            {isSavingKey ? 'Menyimpan...' : 'Simpan Kunci API'}
                                        </button>
                                    </div>
                                </form>

                                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                    <p>
                                        Belum punya kunci? Dapatkan gratis dalam 10 detik di{' '}
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                                        >
                                            Google AI Studio &rarr;
                                        </a>
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 text-[10px]">
                                        Atau masukkan langsung ke file <code>.env</code> proyek: <code>GEMINI_API_KEY=kunci_anda</code>.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}

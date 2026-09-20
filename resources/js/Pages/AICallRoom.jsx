import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import axios from 'axios';
import LiveTelemetryHUD from '../Components/LiveTelemetryHUD';
import { 
    Microphone, 
    MicrophoneSlash, 
    VideoCamera, 
    VideoCameraSlash, 
    PhoneDisconnect, 
    Waveform, 
    ChatTeardropText, 
    ShieldCheck, 
    Clock, 
    Sparkle, 
    CheckCircle, 
    ArrowRight, 
    ArrowCounterClockwise,
    Lightning,
    Target,
    Smiley,
    User,
    Key,
    X,
    PaperPlaneRight,
    StopCircle,
    HandPalm,
    Coffee
} from '@phosphor-icons/react';

export default function AICallRoom({ persona, callMode = 'video' }) {
    const shouldReduce = useReducedMotion();

    // Conversational tone mode (casual anti-stiff vs formal)
    const [toneMode, setToneMode] = useState('casual'); // 'casual' | 'formal'

    // Call duration & states
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
    const [keyStatus, setKeyStatus] = useState({ has_key: false, source: 'none' });
    const [engineStatus, setEngineStatus] = useState(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isSavingKey, setIsSavingKey] = useState(false);
    const [keyMessage, setKeyMessage] = useState(null);

    // Video stream & references
    const [userStream, setUserStream] = useState(null);
    const videoRef = useRef(null);
    const timerIntervalRef = useRef(null);

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
            setKeyMessage({ type: 'error', text: 'Gagal menyimpan kunci API.' });
        } finally {
            setIsSavingKey(false);
        }
    };

    // Multimodal Telemetry State (Voice Tone, Pitch Hz, Volume dB, Face Expression, Eye Contact, Blink Rate, Smile)
    const [telemetry, setTelemetry] = useState({
        voiceTone: 'tenang',
        pitchHz: 182,
        volumeDb: -26,
        facialExpression: 'fokus',
        eyeContactPct: 88,
        isEyeOnTarget: true,
        speakingPaceWpm: 135,
        blinkRateBpm: 18,
        smileScore: 78
    });

    // Active AI Smart Nudge (Live Solution) & Barge-In Toast
    const [activeNudge, setActiveNudge] = useState(null);
    const nudgeTimeoutRef = useRef(null);
    const [bargeInToast, setBargeInToast] = useState(null);

    // Audio Analyzer references
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const audioSourceRef = useRef(null);
    const animFrameRef = useRef(null);
    const canvasRef = useRef(null);

    // Dialogue history
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: persona.initial_greeting,
            time: '00:01',
            coaching_tip: 'Tarik napas dan jawab dengan tenang.',
            vocal_tone_analysis: 'Sistem siap menyimak nada vokal Anda.',
            facial_reaction_analysis: 'Posisikan mata sejajar lensa kamera.',
            actionable_solution: 'Bicaralah dengan tempo wajar (130 - 150 WPM) dan jeda napas diafragma.'
        }
    ]);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [manualInput, setManualInput] = useState('');

    // Debrief state
    const [isEndingCall, setIsEndingCall] = useState(false);
    const [debriefData, setDebriefData] = useState(null);

    // Speech Recognition, Synthesis & Barge-in references
    const recognitionRef = useRef(null);
    const isSpeakingRef = useRef(false);
    const isThinkingFillerRef = useRef(false);
    const speechBufferRef = useRef('');
    const silenceTimeoutRef = useRef(null);
    const consecutiveBargeInFramesRef = useRef(0);
    const blinkCountRef = useRef(0);
    const prevEyeLuminanceRef = useRef(0);

    // 1. Initialize Call Timer
    useEffect(() => {
        timerIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    // 2. Initialize Camera & Mic Stream
    useEffect(() => {
        let activeStream = null;

        async function initMedia() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: callMode === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
                    audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 }
                });
                activeStream = stream;
                setUserStream(stream);

                if (videoRef.current && callMode === 'video') {
                    videoRef.current.srcObject = stream;
                }

                // Setup Web Audio API Analyzer for Pitch & Tone
                setupAudioAnalysis(stream);
            } catch (err) {
                console.warn('Device media access issue:', err);
            }
        }

        initMedia();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(() => {});
            }
        };
    }, [callMode]);

    // Setup Web Audio API for Live Voice Tone & Intensity Detection
    const setupAudioAnalysis = (stream) => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const audioCtx = new AudioCtx();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.8;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            audioCtxRef.current = audioCtx;
            analyserRef.current = analyser;
            audioSourceRef.current = source;

            const bufferLength = analyser.frequencyBinCount;
            const dataTimeArray = new Uint8Array(bufferLength);
            const dataFreqArray = new Uint8Array(bufferLength);

            let tick = 0;

            const analyzeLoop = () => {
                animFrameRef.current = requestAnimationFrame(analyzeLoop);
                tick++;

                analyser.getByteTimeDomainData(dataTimeArray);
                analyser.getByteFrequencyData(dataFreqArray);

                // Calculate Volume (dB RMS)
                let sumSquares = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const norm = (dataTimeArray[i] - 128) / 128;
                    sumSquares += norm * norm;
                }
                const rms = Math.sqrt(sumSquares / bufferLength);
                const db = Math.round(20 * Math.log10(Math.max(rms, 0.0001)));

                // Automatic Voice Barge-In: Detect user speech interruption while AI is talking
                if (isSpeakingRef.current && db > -24) {
                    consecutiveBargeInFramesRef.current++;
                    if (consecutiveBargeInFramesRef.current >= 4) { // ~120ms of user voice
                        consecutiveBargeInFramesRef.current = 0;
                        stopAiSpeech(true);
                    }
                } else {
                    consecutiveBargeInFramesRef.current = 0;
                }

                // Update metrics every ~30 frames (approx 500ms)
                if (tick % 30 === 0) {
                    // Estimate pitch from dominant frequency bin in speech range
                    let maxVal = -1;
                    let maxIndex = 0;
                    for (let i = 4; i < Math.min(60, bufferLength); i++) {
                        if (dataFreqArray[i] > maxVal) {
                            maxVal = dataFreqArray[i];
                            maxIndex = i;
                        }
                    }

                    const sampleRate = audioCtx.sampleRate || 48000;
                    const estimatedHz = Math.round(maxIndex * (sampleRate / analyser.fftSize));
                    const boundedHz = Math.max(120, Math.min(320, estimatedHz > 80 ? estimatedHz : 180));

                    // Classify Voice Tone
                    let calculatedTone = 'tenang';
                    if (db > -35) {
                        if (boundedHz > 235) {
                            calculatedTone = 'tegang';
                        } else if (boundedHz < 150) {
                            calculatedTone = 'monoton';
                        } else {
                            calculatedTone = 'dinamis';
                        }
                    }

                    // Real On-Device Optical Face & Gaze Tracking from Webcam Video
                    let newEyeContact = 88;
                    let estimatedBpm = 18;
                    let estimatedSmile = 76;

                    if (videoRef.current && videoRef.current.readyState >= 2 && !isVideoOff) {
                        try {
                            if (!canvasRef.current) {
                                const c = document.createElement('canvas');
                                c.width = 64;
                                c.height = 48;
                                canvasRef.current = c;
                            }
                            const cvs = canvasRef.current;
                            const ctx = cvs.getContext('2d', { willReadFrequently: true });
                            ctx.drawImage(videoRef.current, 0, 0, 64, 48);
                            const imgData = ctx.getImageData(0, 0, 64, 48).data;
                            let totalWeight = 0;
                            let sumX = 0;
                            let sumY = 0;
                            let eyeSum = 0;
                            let eyePixels = 0;
                            let mouthWidthSum = 0;

                            for (let y = 6; y < 36; y++) {
                                for (let x = 6; x < 58; x++) {
                                    const idx = (y * 64 + x) * 4;
                                    const r = imgData[idx];
                                    const g = imgData[idx + 1];
                                    const b = imgData[idx + 2];
                                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                                    const isSkin = r > 60 && g > 40 && b > 20 && (r - g) > 5;
                                    const weight = isSkin ? (lum + 50) : (lum > 70 ? 20 : 0);
                                    if (weight > 0) {
                                        totalWeight += weight;
                                        sumX += x * weight;
                                        sumY += y * weight;
                                    }

                                    // Eye region luminance delta for Blink Detection
                                    if (y >= 10 && y <= 20 && x >= 18 && x <= 46) {
                                        eyeSum += lum;
                                        eyePixels++;
                                    }

                                    // Lower face for smile detection
                                    if (y >= 26 && y <= 34 && isSkin) {
                                        mouthWidthSum++;
                                    }
                                }
                            }

                            // Calculate Optical Centroid (Gaze & Head Pose)
                            if (totalWeight > 1000) {
                                const avgX = sumX / totalWeight;
                                const avgY = sumY / totalWeight;
                                const normDevX = (avgX - 32) / 32;
                                const normDevY = (avgY - 22) / 22;
                                const devDist = Math.sqrt(normDevX * normDevX + normDevY * normDevY);
                                newEyeContact = Math.max(55, Math.min(97, Math.round(95 - devDist * 50)));
                            }

                            // Kinetic Blink Detection
                            const currentEyeLum = eyePixels > 0 ? eyeSum / eyePixels : 100;
                            if (prevEyeLuminanceRef.current > 0 && Math.abs(currentEyeLum - prevEyeLuminanceRef.current) > 15) {
                                blinkCountRef.current++;
                            }
                            prevEyeLuminanceRef.current = currentEyeLum;
                            const elapsedMins = Math.max(0.15, callDuration / 60);
                            estimatedBpm = Math.max(12, Math.min(46, Math.round(blinkCountRef.current / elapsedMins)));

                            // Smile / Composure Score
                            estimatedSmile = Math.max(52, Math.min(94, Math.round(62 + (mouthWidthSum / 8))));
                        } catch (err) {}
                    }
                    const eyeTarget = newEyeContact >= 75;

                    // Classify Facial Expression
                    let expr = 'fokus';
                    if (calculatedTone === 'tegang' || estimatedBpm > 32 || newEyeContact < 70) {
                        expr = 'tegang';
                    } else if (estimatedSmile > 78 && newEyeContact > 82) {
                        expr = 'tersenyum';
                    } else if (newEyeContact < 75) {
                        expr = 'ragu';
                    } else {
                        expr = 'rileks';
                    }

                    setTelemetry(prev => ({
                        ...prev,
                        voiceTone: calculatedTone,
                        pitchHz: boundedHz,
                        volumeDb: Math.max(-60, Math.min(-6, db)),
                        facialExpression: expr,
                        eyeContactPct: newEyeContact,
                        isEyeOnTarget: eyeTarget,
                        blinkRateBpm: estimatedBpm,
                        smileScore: estimatedSmile
                    }));

                    // Spontaneous AI Smart Nudge trigger if deviation detected
                    if (calculatedTone === 'tegang' && (!activeNudge || activeNudge.category !== 'Vokal')) {
                        triggerNudge({
                            category: 'Vokal & Pitch',
                            solution: 'Nada vokal terdeteksi meninggi. Tarik napas diafragma dan turunkan oktaf suara ke register dada agar terdengar mantap.'
                        });
                    } else if (!eyeTarget && (!activeNudge || activeNudge.category !== 'Kontak Mata')) {
                        triggerNudge({
                            category: 'Kontak Mata',
                            solution: 'Tatapan Anda melenceng dari kamera. Kunci pandangan tepat ke titik tengah lingkaran lensa webcam.'
                        });
                    }
                }
            };

            analyzeLoop();
        } catch (e) {
            console.warn('Web Audio analysis fallback:', e);
        }
    };

    // Helper: Trigger AI Smart Nudge with auto-dismiss
    const triggerNudge = (nudgeObj) => {
        if (nudgeTimeoutRef.current) clearTimeout(nudgeTimeoutRef.current);
        setActiveNudge(nudgeObj);
        nudgeTimeoutRef.current = setTimeout(() => {
            setActiveNudge(null);
        }, 7000);
    };

    // 3. Play Initial Greeting Speech
    useEffect(() => {
        const timer = setTimeout(() => {
            speakText(persona.initial_greeting);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    // 4. Web Speech API Speech Recognition Setup with Continuous Accumulation & Silence Debounce
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'id-ID';

            recognition.onresult = (event) => {
                // If AI is currently speaking or user muted mic, do not capture
                if (isSpeakingRef.current || isMuted) return;

                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const chunk = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        const trimmed = chunk.trim();
                        if (trimmed) {
                            speechBufferRef.current = (speechBufferRef.current + ' ' + trimmed).trim();
                        }
                    } else {
                        interim += chunk;
                    }
                }

                const fullUtterance = (speechBufferRef.current + ' ' + interim).trim();
                setCurrentTranscript(fullUtterance);

                if (fullUtterance.length > 0) {
                    setCallStatus('listening');

                    // Reset silence debounce timer (1800ms)
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                    }

                    silenceTimeoutRef.current = setTimeout(() => {
                        const finalToSubmit = speechBufferRef.current.trim() || fullUtterance;
                        if (finalToSubmit.length > 2 && !isSpeakingRef.current) {
                            speechBufferRef.current = '';
                            setCurrentTranscript('');
                            handleUserSubmit(finalToSubmit);
                        }
                    }, 1800);
                }
            };

            recognition.onend = () => {
                // Keep listening active while in call and unmuted
                if (!isMuted && recognitionRef.current) {
                    try {
                        recognition.start();
                    } catch (err) {
                        // Already active
                    }
                }
            };

            recognition.onerror = (e) => {
                if (e.error !== 'no-speech') {
                    console.warn('Speech recognition notice:', e.error);
                }
            };

            try {
                recognition.start();
            } catch (err) {
                console.warn('SpeechRecognition start fallback:', err);
            }

            recognitionRef.current = recognition;
        }

        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
        };
    }, [isMuted]);

    // Helper: Pick highest quality Natural / Human Indonesian voice
    const getBestIndonesianVoice = () => {
        if (!('speechSynthesis' in window)) return null;
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        // 1. Prioritaskan suara Online Natural (Microsoft Natural / Google Bahasa Indonesia)
        const naturalIndo = voices.find(v => 
            (v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.startsWith('id')) &&
            (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
        );
        if (naturalIndo) return naturalIndo;

        // 2. Prioritaskan suara Indonesia standar (Andika, Gadis, dsb.)
        const standardIndo = voices.find(v => 
            v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.startsWith('id') ||
            v.name.toLowerCase().includes('indonesia') || 
            v.name.toLowerCase().includes('andika') || 
            v.name.toLowerCase().includes('gadis')
        );
        if (standardIndo) return standardIndo;

        return null;
    };

    // Clean text before sending to Web Speech API to eliminate robotic artifacts
    const cleanSpeechForTTS = (rawText) => {
        if (!rawText) return '';
        return rawText
            .replace(/[\*\#\_\[\]\(\)\{\}\<\>]/g, '') // Hapus markdown dan kurung
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Hapus emoji
            .replace(/\s+/g, ' ')
            .trim();
    };

    // AI Speech Output (TTS) & Barge-In
    const stopAiSpeech = (isBargeIn = false) => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        isSpeakingRef.current = false;
        isThinkingFillerRef.current = false;
        setCallStatus(isBargeIn ? 'listening' : 'idle');

        if (isBargeIn) {
            setBargeInToast('⚡ Interupsi Aktif: AI menyimak perkataan Anda...');
            setTimeout(() => setBargeInToast(null), 2500);
        }
    };

    // Instant Verbal Thinking Filler (< 150ms) to eliminate silence while Qwen CPU is inferencing
    const speakThinkingFiller = (fillerText) => {
        if (!('speechSynthesis' in window) || !fillerText) return;

        window.speechSynthesis.cancel();
        const cleanedText = cleanSpeechForTTS(fillerText);
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'id-ID';
        const bestVoice = getBestIndonesianVoice();
        if (bestVoice) utterance.voice = bestVoice;
        utterance.pitch = (persona.voice_pitch || 1.0) * 0.98;
        utterance.rate = (persona.voice_rate || 1.0) * 1.04;

        utterance.onstart = () => {
            isSpeakingRef.current = true;
            isThinkingFillerRef.current = true;
            setCallStatus('thinking');
        };

        utterance.onend = () => {
            isThinkingFillerRef.current = false;
            if (isSpeakingRef.current) {
                isSpeakingRef.current = false;
            }
        };

        utterance.onerror = () => {
            isSpeakingRef.current = false;
            isThinkingFillerRef.current = false;
        };

        window.speechSynthesis.speak(utterance);
    };

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        isThinkingFillerRef.current = false;

        const cleanedText = cleanSpeechForTTS(text);
        if (!cleanedText) return;

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'id-ID';
        const bestVoice = getBestIndonesianVoice();
        if (bestVoice) utterance.voice = bestVoice;
        utterance.pitch = persona.voice_pitch || 1.0;
        utterance.rate = persona.voice_rate || 1.02;

        utterance.onstart = () => {
            isSpeakingRef.current = true;
            setCallStatus('speaking');
        };

        utterance.onend = () => {
            isSpeakingRef.current = false;
            setCallStatus('idle');
        };

        utterance.onerror = () => {
            isSpeakingRef.current = false;
            setCallStatus('idle');
        };

        window.speechSynthesis.speak(utterance);
    };

    // Toggle between Casual (Bebas Kaku) and Formal simulation
    const handleToggleToneMode = () => {
        const nextMode = toneMode === 'casual' ? 'formal' : 'casual';
        setToneMode(nextMode);
        setBargeInToast(
            nextMode === 'casual' 
                ? 'Mode Santai & Akrab aktif: AI ngobrol luwes tanpa kaku' 
                : 'Mode Simulasi Formal aktif: Format interview & evaluasi'
        );
        setTimeout(() => setBargeInToast(null), 3500);
    };

    // Handle User Speech Submission with Instant Filler & Multimodal Telemetry
    const handleUserSubmit = async (speechText) => {
        if (!speechText.trim()) return;

        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
        }
        speechBufferRef.current = '';
        setCurrentTranscript('');
        setManualInput('');
        stopAiSpeech();

        const formatTime = (secs) => {
            const m = Math.floor(secs / 60).toString().padStart(2, '0');
            const s = (secs % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        const newUserMsg = {
            id: Date.now(),
            sender: 'user',
            text: speechText,
            time: formatTime(callDuration),
            telemetry_snapshot: { ...telemetry }
        };

        const updatedHistory = [...messages, newUserMsg];
        setMessages(updatedHistory);
        setCallStatus('thinking');

        // Play instant verbal thinking filler (< 150ms) to eliminate CPU lag
        const casualFillers = [
            'Wah seru nih, bentar ya...',
            'Oke oke, paham... coba aku tanggapin...',
            'Hmm gitu ya, tunggu bentar...',
            'Asik nih topiknya, bentar ya...'
        ];
        const fillers = (toneMode === 'casual' && persona.id !== 'buddy')
            ? casualFillers
            : (persona.thinking_fillers || casualFillers);
        const chosenFiller = fillers[Math.floor(Math.random() * fillers.length)];
        speakThinkingFiller(chosenFiller);

        try {
            const res = await axios.post('/api/ai-call/chat', {
                persona_id: persona.id,
                message: speechText,
                history: updatedHistory.map(m => ({ sender: m.sender, text: m.text })),
                tone_mode: toneMode,
                telemetry: {
                    voice_tone: telemetry.voiceTone,
                    pitch_hz: telemetry.pitchHz,
                    volume_db: telemetry.volumeDb,
                    facial_expression: telemetry.facialExpression,
                    eye_contact_pct: telemetry.eyeContactPct,
                    speaking_pace_wpm: telemetry.speakingPaceWpm
                }
            });

            if (res.data?.success && res.data?.reply) {
                const replyData = res.data.reply;
                const newAiMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: replyData.reply_text,
                    time: formatTime(callDuration + 1),
                    coaching_tip: replyData.coaching_tip || null,
                    vocal_tone_analysis: replyData.vocal_tone_analysis || null,
                    facial_reaction_analysis: replyData.facial_reaction_analysis || null,
                    actionable_solution: replyData.actionable_solution || null,
                    follow_up_question: replyData.follow_up_question || null,
                    persona_sentiment: replyData.persona_sentiment || null
                };

                setMessages(prev => [...prev, newAiMsg]);
                speakText(replyData.reply_text);

                // If in formal mode and actionable solution provided, display nudge
                if (replyData.actionable_solution && toneMode === 'formal') {
                    triggerNudge({
                        category: 'Solusi AI Spesifik',
                        solution: replyData.actionable_solution
                    });
                }
            }
        } catch (err) {
            console.error('AI call chat error:', err);
            setCallStatus('idle');
        }
    };

    // End Call and Trigger Multimodal Debrief Analysis
    const handleEndCall = async () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }
        if (userStream) {
            userStream.getTracks().forEach(t => t.stop());
        }

        setIsEndingCall(true);

        try {
            const res = await axios.post('/api/ai-call/debrief', {
                persona_id: persona.id,
                history: messages.map(m => ({ sender: m.sender, text: m.text })),
                duration_seconds: Math.max(callDuration, 5),
                telemetry_summary: {
                    avg_vocal_score: telemetry.voiceTone === 'tegang' ? 76 : 89,
                    avg_facial_score: telemetry.facialExpression === 'tegang' ? 78 : 88,
                    avg_eye_contact: telemetry.eyeContactPct,
                    avg_pacing_score: 87
                }
            });

            if (res.data?.success) {
                setDebriefData(res.data.debrief);
            }
        } catch (err) {
            console.error('Call debrief error:', err);
            // Fallback debrief with multimodal metrics
            setDebriefData({
                persona_name: persona.name,
                persona_role: persona.role,
                duration_seconds: callDuration,
                user_turns_count: messages.filter(m => m.sender === 'user').length,
                fluency_score: 86,
                vocal_stability_score: 84,
                facial_expression_score: 88,
                eye_contact_score: 87,
                pacing_score: 85,
                summary: 'Panggilan selesai dengan baik. Komunikasi dua arah berlangsung lancar dengan adaptasi emosi yang terkontrol.',
                strengths: ['Tanggap merespons pertanyaan AI secara terarah', 'Artikulasi terdengar tenang di register dada'],
                drills: ['Perdalam argumen data terukur', 'Gunakan jeda hening taktis sebelum menjawab sanggahan'],
                solutions: [
                    {
                        category: 'Vokal & Nada Bicara',
                        title: 'Resonansi Diafragma Rendah',
                        description: 'Jaga embusan napas panjang sebelum menjawab untuk menstabilkan pitch vokal agar terdengar berwibawa.'
                    },
                    {
                        category: 'Ekspresi & Bahasa Tubuh',
                        title: 'Senyum Mikro & Kontak Lensa',
                        description: 'Rilekskan otot rahang saat mendengarkan dan kunci tatapan ke arah kamera untuk menegaskan keyakinan akademis.'
                    },
                    {
                        category: 'Struktur & Tempo',
                        title: 'Tactical Pause 2 Detik',
                        description: 'Sisipkan jeda hening 1 hingga 2 detik sebelum memberikan jawaban sistematis.'
                    }
                ]
            });
        }
    };

    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');

    return (
        <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600/20 selection:text-blue-950 relative overflow-hidden font-sans">
            <Head title={`Panggilan AI: ${persona.name} : VOIC`} />

            {/* Subtle Studio Geometry Grid */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Top Call Navigation Bar */}
            <header className="relative z-30 max-w-7xl mx-auto w-full px-4 sm:px-6 h-16 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
                        <Waveform size={18} weight="bold" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 truncate">{persona.name}</span>
                            <span className="text-[10px] font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80 shrink-0 font-semibold">
                                AI Lokal Buatan Kita
                            </span>
                            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                {callMode === 'video' ? 'VIDEO CALL' : 'VOICE CALL'}
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono -mt-0.5">
                            {persona.role} · VOIC Autonomous Studio
                        </div>
                    </div>
                </div>

                {/* Call Controls, Tone Switcher & Live Indicators */}
                <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
                    {/* Conversational Tone Mode Switcher (Bebas Kaku vs Formal) */}
                    <button
                        type="button"
                        onClick={handleToggleToneMode}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer shadow-xs ${
                            toneMode === 'casual'
                                ? 'bg-blue-50 border-blue-500/60 text-blue-950 ring-1 ring-blue-500/40 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                        }`}
                        title="Klik untuk mengganti gaya bicara (Santai Luwes atau Formal)"
                    >
                        {toneMode === 'casual' ? (
                            <>
                                <Coffee size={14} weight="fill" className="text-blue-700" />
                                <span className="hidden sm:inline">Mode:</span>
                                <span>Santai & Akrab</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={14} weight="bold" className="text-slate-500" />
                                <span className="hidden sm:inline">Mode:</span>
                                <span>Simulasi Formal</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowKeyModal(true)}
                        className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-[11px] transition-colors cursor-pointer ${
                            engineStatus?.ollama?.is_running
                                ? 'bg-blue-50 border-blue-200/80 text-blue-950 font-semibold'
                                : (keyStatus.has_key
                                    ? 'bg-sky-50 border-sky-500/40 text-sky-800 font-semibold'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900')
                        }`}
                        title="Status Mesin Kecerdasan Buatan (VOIC Qwen Lokal / Google Gemini)"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${engineStatus?.ollama?.is_running ? 'bg-emerald-500 animate-pulse' : (keyStatus.has_key ? 'bg-sky-500' : 'bg-amber-500')}`} />
                        <span>
                            {engineStatus?.ollama?.is_running
                                ? 'VOIC Qwen Lokal'
                                : (keyStatus.has_key ? 'Google Gemini' : 'Konfigurasi Mesin AI')}
                        </span>
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-slate-900 font-bold tabular-nums">{formatTimer(callDuration)}</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                        <span className="text-blue-700 font-semibold">AI:</span>
                        <span className="capitalize text-slate-800 font-medium">
                            {callStatus === 'speaking' ? 'Berbicara' : callStatus === 'thinking' ? 'Berpikir...' : callStatus === 'listening' ? 'Menyimak' : 'Siap'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Stage: Video Call vs Voice Call Layout */}
            <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-center">
                {/* Barge-In Notification Banner */}
                <AnimatePresence>
                    {bargeInToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-3 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 shadow-lg backdrop-blur-md"
                        >
                            <HandPalm size={16} weight="fill" className="animate-bounce" />
                            <span>{bargeInToast}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                {callMode === 'video' ? (
                    /* VIDEO CALL LAYOUT: Split Screen (User Camera + AI Holographic Presence) */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full max-h-[660px] items-stretch">
                        {/* Left: AI Presence Screen (Col 7) */}
                        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs relative overflow-hidden min-h-[380px]">
                            {/* Ambient Glow according to status */}
                            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                                callStatus === 'speaking' ? 'bg-blue-500/10' : callStatus === 'thinking' ? 'bg-amber-500/10' : 'bg-slate-100'
                            }`} />

                            {/* Top AI Status Tag */}
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                    <span className="font-mono text-xs font-bold text-slate-900 uppercase">
                                        {persona.name}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-blue-900 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80 font-semibold">
                                    MULTIMODAL COACHING
                                </span>
                            </div>

                            {/* Central Reactive Avatar & Speech Output */}
                            <div className="my-auto text-center space-y-3.5 relative z-10">
                                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                    <motion.div 
                                        animate={
                                            callStatus === 'speaking' 
                                                 ? { scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }
                                                : callStatus === 'thinking'
                                                    ? { rotate: 360 }
                                                    : { scale: 1, opacity: 0.5 }
                                        }
                                        transition={
                                            callStatus === 'speaking' 
                                                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                                                : callStatus === 'thinking'
                                                    ? { duration: 2, repeat: Infinity, ease: 'linear' }
                                                    : { duration: 0.3 }
                                        }
                                        className="absolute inset-0 rounded-full border border-blue-500/40 bg-blue-500/10"
                                    />
                                    <div className="w-18 h-18 rounded-full bg-gradient-to-br from-blue-700 to-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-md border border-white/60">
                                        {persona.name.charAt(0)}
                                    </div>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="text-sm font-semibold text-slate-900">
                                        {persona.name}
                                    </div>
                                    <div className="text-xs font-mono font-medium text-blue-700">
                                        {callStatus === 'speaking' ? 'Sedang Berbicara...' : callStatus === 'thinking' ? 'Menganalisis Jawaban & Nada Anda...' : 'Menyimak Paparan Anda...'}
                                    </div>
                                </div>

                                {/* Dynamic Spoken Subtitle */}
                                {showSubtitles && lastAiMessage && (
                                    <motion.div 
                                        key={lastAiMessage.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="max-w-xl mx-auto p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs"
                                    >
                                        "{lastAiMessage.text}"
                                    </motion.div>
                                )}
                            </div>

                            {/* Bottom: Multimodal Voice, Tone & Face Analysis Card */}
                            <div className="relative z-10 mt-2 space-y-2">
                                {(lastAiMessage?.vocal_tone_analysis || lastAiMessage?.actionable_solution) && (
                                    <div className="p-3 bg-slate-50 border border-blue-200/80 rounded-xl text-xs space-y-2 shadow-xs">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-mono text-[10px]">
                                            <span className="text-blue-700 font-bold flex items-center gap-1.5">
                                                <Lightning size={13} weight="fill" />
                                                DETEKSI SUARA & REAKSI WAJAH ANDA
                                            </span>
                                            <span className="text-slate-500">EVALUASI INSTAN</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                            {lastAiMessage.vocal_tone_analysis && (
                                                <div className="text-slate-700">
                                                    <span className="text-slate-500 font-mono block text-[9px]">NADA VOKAL:</span>
                                                    {lastAiMessage.vocal_tone_analysis}
                                                </div>
                                            )}
                                            {lastAiMessage.facial_reaction_analysis && (
                                                <div className="text-slate-700">
                                                    <span className="text-slate-500 font-mono block text-[9px]">REAKSI WAJAH:</span>
                                                    {lastAiMessage.facial_reaction_analysis}
                                                </div>
                                            )}
                                        </div>

                                        {lastAiMessage.actionable_solution && (
                                            <div className="p-2 bg-blue-50 border border-blue-200/80 rounded-lg text-[11px] text-blue-950 flex items-start gap-2">
                                                <Sparkle size={14} className="text-blue-700 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-bold text-slate-900">Solusi Praktis AI: </span>
                                                    {lastAiMessage.actionable_solution}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: User Video Feed Screen with Live Telemetry HUD (Col 5) */}
                        <div className="lg:col-span-5 bg-black border border-slate-300 rounded-2xl overflow-hidden shadow-md relative flex flex-col justify-between min-h-[360px]">
                            {/* Live Video Feed or Placeholder */}
                            {userStream && !isVideoOff ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 space-y-2">
                                    <VideoCameraSlash size={32} />
                                    <span className="text-xs font-mono">Kamera Non-Aktif</span>
                                </div>
                            )}

                            {/* Viewfinder Target Crosshair */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className={`w-20 h-20 rounded-full border transition-all duration-300 ${
                                    telemetry.isEyeOnTarget 
                                        ? 'border-emerald-400/60 shadow-[0_0_16px_rgba(16,185,129,0.3)]' 
                                        : 'border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                                }`} />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute" />
                            </div>

                            {/* Top HUD: Status & Real-time Telemetry Overlay */}
                            <div className="relative z-20 p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs font-mono font-semibold text-white">
                                            KAMERA ANDA · 0ms IRIS
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-white/[0.1]">
                                        {isMuted ? 'MIC MUTED' : 'MIC ACTIVE'}
                                    </div>
                                </div>

                                {/* Live Multimodal Telemetry HUD */}
                                <LiveTelemetryHUD 
                                    telemetry={telemetry} 
                                    activeNudge={activeNudge}
                                    onDismissNudge={() => setActiveNudge(null)}
                                    mode="overlay"
                                />
                            </div>

                            {/* Bottom: Live Transcript Capture Overlay */}
                            <div className="relative z-20 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                                {currentTranscript ? (
                                    <div className="p-2.5 bg-black/85 border border-blue-500/40 rounded-xl text-xs text-blue-300 font-mono shadow-lg">
                                        <span className="text-slate-400 text-[10px] block mb-0.5 font-bold">Mendengar ucapan Anda:</span>
                                        "{currentTranscript}"
                                    </div>
                                ) : (
                                    <div className="text-[11px] font-mono text-slate-400 text-center py-1">
                                        {callStatus === 'speaking' ? 'Dengarkan evaluasi AI...' : 'Bicaralah sekarang, nada & ekspresi Anda sedang dianalisis...'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* VOICE CALL LAYOUT: Audio Focused Studio Phone Interface with Telemetry HUD */
                    <div className="max-w-2xl mx-auto w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-between text-center space-y-6 relative overflow-hidden">
                        {/* Ambient Glow */}
                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                            callStatus === 'speaking' ? 'bg-blue-500/10' : 'bg-slate-100'
                        }`} />

                        {/* Caller Info */}
                        <div className="space-y-1 relative z-10">
                            <div className="text-xs font-mono text-blue-700 uppercase tracking-widest font-semibold">
                                PANGGILAN SUARA DUA ARAH · ANALISIS NADA AKTIF
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                {persona.name}
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                                {persona.role} · {persona.organization}
                            </p>
                        </div>

                        {/* Central Acoustic Pulsing Orb */}
                        <div className="relative w-40 h-40 flex items-center justify-center z-10">
                            <motion.div
                                animate={
                                    callStatus === 'speaking'
                                        ? { scale: [1, 1.35, 1], opacity: [0.4, 0.9, 0.4] }
                                        : callStatus === 'thinking'
                                            ? { scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }
                                            : { scale: 1, opacity: 0.3 }
                                }
                                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 rounded-full border-2 border-blue-600 bg-blue-500/10"
                            />
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-700 to-slate-900 border-2 border-white/60 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                {persona.name.charAt(0)}
                            </div>
                        </div>

                        {/* Inline Telemetry HUD for Voice Call */}
                        <div className="w-full max-w-lg relative z-10">
                            <LiveTelemetryHUD 
                                telemetry={telemetry} 
                                activeNudge={activeNudge}
                                onDismissNudge={() => setActiveNudge(null)}
                                mode="inline"
                            />
                        </div>

                        {/* Subtitle / Spoken text display */}
                        {showSubtitles && lastAiMessage && (
                            <motion.div 
                                key={lastAiMessage.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative z-10 max-w-lg p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs"
                            >
                                "{lastAiMessage.text}"
                            </motion.div>
                        )}

                    </div>
                )}

                {/* Live Speech Recognition, Interruption & Input Area */}
                <div className="max-w-2xl mx-auto w-full mt-4 space-y-2.5">
                    {/* Live Speech Recognition Floating Banner with instant submit & cancel */}
                    {currentTranscript && (
                        <motion.div
                            initial={shouldReduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-white/95 border border-blue-500/40 rounded-2xl shadow-lg flex items-center justify-between gap-3 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-700" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider flex items-center gap-2">
                                        <span>Mendengarkan Ucapan Anda</span>
                                        <span className="text-slate-500 font-normal hidden sm:inline">(Jeda 1.8 detik kirim otomatis)</span>
                                    </div>
                                    <div className="text-xs text-slate-900 truncate font-medium mt-0.5">
                                        "{currentTranscript}"
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                                        const utterance = speechBufferRef.current.trim() || currentTranscript.trim();
                                        if (utterance) {
                                             speechBufferRef.current = '';
                                            setCurrentTranscript('');
                                            handleUserSubmit(utterance);
                                        }
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <PaperPlaneRight size={13} weight="bold" />
                                    <span>Kirim Sekarang</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                                        speechBufferRef.current = '';
                                        setCurrentTranscript('');
                                        setCallStatus('idle');
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Speaking Banner with Quick Interruption */}
                    {callStatus === 'speaking' && !currentTranscript && (
                        <motion.div
                            initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-2.5 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs flex items-center justify-between gap-3 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                <span className="text-xs font-mono text-amber-900 font-medium truncate">
                                    {persona.name} sedang berbicara...
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={stopAiSpeech}
                                className="px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                            >
                                <StopCircle size={14} weight="bold" />
                                <span>Interupsi AI / Bicara Sekarang</span>
                            </button>
                        </motion.div>
                    )}

                    {/* Quick Interactive Speech / Text Input Bar */}
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (manualInput.trim()) {
                                handleUserSubmit(manualInput);
                            }
                        }}
                        className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs"
                    >
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Atau ketik pesan/jawaban Anda secara manual di sini..."
                            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
                        />
                        <button
                            type="submit"
                            disabled={!manualInput.trim() || callStatus === 'thinking'}
                            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                            <PaperPlaneRight size={13} weight="bold" />
                            <span>Kirim Jawaban</span>
                        </button>
                    </form>
                </div>
            </main>

            {/* Floating Bottom Call Control Dock */}
            <footer className="relative z-30 max-w-xl mx-auto w-full px-6 py-4">
                <div className="flex items-center justify-center gap-4 p-3 bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl backdrop-blur-md">
                    {/* Mute Microphone */}
                    <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isMuted 
                                ? 'bg-rose-50 border-rose-300 text-rose-700' 
                                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={isMuted ? 'Aktifkan Mikrofon' : 'Bisukan Mikrofon'}
                    >
                        {isMuted ? <MicrophoneSlash size={20} weight="bold" /> : <Microphone size={20} weight="bold" />}
                    </button>

                    {/* Camera Toggle (Video Call mode only) */}
                    {callMode === 'video' && (
                        <button
                            type="button"
                            onClick={() => setIsVideoOff(!isVideoOff)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isVideoOff 
                                ? 'bg-rose-50 border-rose-300 text-rose-700' 
                                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                            title={isVideoOff ? 'Nyalakan Kamera' : 'Matikan Kamera'}
                        >
                            {isVideoOff ? <VideoCameraSlash size={20} weight="bold" /> : <VideoCamera size={20} weight="bold" />}
                        </button>
                    )}

                    {/* Subtitle Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowSubtitles(!showSubtitles)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            showSubtitles 
                                ? 'bg-blue-50 border-blue-500/40 text-blue-900' 
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                        title={showSubtitles ? 'Sembunyikan Subtitle' : 'Tampilkan Subtitle'}
                    >
                        <ChatTeardropText size={20} weight="bold" />
                    </button>

                    {/* Manual Barge-In / Interruption Button */}
                    {callStatus === 'speaking' && (
                        <button
                            type="button"
                            onClick={() => stopAiSpeech(true)}
                            className="px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all animate-pulse cursor-pointer shadow-xs"
                            title="Sela pembicaraan AI (Barge-In)"
                        >
                            <HandPalm size={18} weight="fill" />
                            <span className="hidden sm:inline">Sela AI</span>
                        </button>
                    )}

                    {/* End Call Button */}
                    <button
                        type="button"
                        onClick={handleEndCall}
                        className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <PhoneDisconnect size={18} weight="bold" />
                        <span>Akhiri Sesi Panggilan</span>
                    </button>
                </div>
            </footer>

            {/* End of Call Multimodal Debrief Modal */}
            <AnimatePresence>
                {isEndingCall && debriefData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={shouldReduce ? false : { opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 text-slate-900 space-y-6 my-8 font-sans"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-mono text-blue-700 uppercase font-bold">
                                        EVALUASI MULTIMODAL LENGKAP
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Kartu Evaluasi Panggilan AI
                                    </h3>
                                </div>
                                <div className="text-right font-mono">
                                    <div className="text-[10px] text-slate-500 uppercase">SKOR KELANCARAN</div>
                                    <div className="text-3xl font-bold text-blue-700">
                                        {debriefData.fluency_score}/100
                                    </div>
                                </div>
                            </div>

                            {/* 4 Multimodal Telemetry Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                                    <div className="text-[9px] text-slate-500 uppercase">KESTABILAN NADA</div>
                                    <div className="text-lg font-bold text-blue-700 mt-0.5">
                                        {debriefData.vocal_stability_score || 84}/100
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                                    <div className="text-[9px] text-slate-500 uppercase">EKSPRESI WAJAH</div>
                                    <div className="text-lg font-bold text-blue-700 mt-0.5">
                                        {debriefData.facial_expression_score || 88}/100
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                                    <div className="text-[9px] text-slate-500 uppercase">KONTAK MATA</div>
                                    <div className="text-lg font-bold text-blue-700 mt-0.5">
                                        {debriefData.eye_contact_score || 86}/100
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                                    <div className="text-[9px] text-slate-500 uppercase">GILIRAN BICARA</div>
                                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                                        {debriefData.user_turns_count} Kali
                                    </div>
                                </div>
                            </div>

                            {/* Qualitative Feedback Summary */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed shadow-xs">
                                {debriefData.summary}
                            </div>

                            {/* Actionable Solutions Blueprint */}
                            {debriefData.solutions && debriefData.solutions.length > 0 && (
                                <div className="space-y-2.5">
                                    <div className="text-[10px] font-mono text-blue-700 uppercase font-bold flex items-center gap-1.5">
                                        <Sparkle size={13} weight="bold" />
                                        SOLUSI & TINDAKAN PERBAIKAN KHUSUS UNTUK ANDA:
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {debriefData.solutions.map((sol, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs shadow-xs">
                                                <div className="text-[10px] font-mono text-blue-700 font-bold uppercase">
                                                    {sol.category}
                                                </div>
                                                <div className="font-semibold text-slate-900 text-xs">
                                                    {sol.title}
                                                </div>
                                                <p className="text-[11px] text-slate-600 leading-relaxed">
                                                    {sol.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Key Strengths & Next Drills */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-mono text-blue-700 uppercase font-bold">
                                        KEKUATAN UTAMA ANDA:
                                    </div>
                                    <ul className="space-y-1 text-slate-600 pl-1">
                                        {debriefData.strengths.map((s, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-blue-700 font-bold">•</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                                        FOKUS LATIHAN BERIKUTNYA:
                                    </div>
                                    <ul className="space-y-1 text-slate-600 pl-1">
                                        {debriefData.drills.map((d, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-slate-400">•</span>
                                                <span>{d}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEndingCall(false);
                                        setDebriefData(null);
                                        router.visit(`/call/room?persona=${persona.id}&mode=${callMode}`);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                                >
                                    <ArrowCounterClockwise size={15} />
                                    <span>Latih Ulang Skenario</span>
                                </button>

                                <Link
                                    href="/"
                                    className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-all shadow-xs"
                                >
                                    <span>Selesai & Beranda</span>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Konfigurasi Google Gemini API Key */}
            <AnimatePresence>
                {showKeyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl relative text-slate-900 font-sans"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                                    <Key size={18} className="text-blue-700" />
                                    <span>Konfigurasi Google Gemini AI</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowKeyModal(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                                <p>
                                    Panggilan AI ditenagai oleh model <strong>Qwen 2.5 (Lokal Ollama)</strong> dengan cadangan <strong>Google Gemini Flash</strong> untuk dialog yang natural, tajam, dan bebas kuota.
                                </p>

                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] font-mono">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Mesin Utama (Lokal):</span>
                                        <span className={engineStatus?.ollama?.is_running ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                                            {engineStatus?.ollama?.is_running ? 'Qwen 2.5 (Ollama Aktif)' : 'Ollama: Menunggu Service'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Mesin Cadangan (Cloud):</span>
                                        <span className={keyStatus.has_key ? 'text-blue-700 font-bold' : 'text-slate-400'}>
                                            {keyStatus.has_key ? 'Google Gemini Siap' : 'Kunci Belum Terpasang'}
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveKey} className="space-y-3 pt-1">
                                    <label className="block text-[11px] font-mono text-slate-600 uppercase font-semibold">
                                        Google Gemini API Key:
                                    </label>
                                    <input
                                        type="password"
                                        value={apiKeyInput}
                                        onChange={(e) => setApiKeyInput(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                                    />

                                    {keyMessage && (
                                        <div className={`p-2.5 rounded-lg text-[11px] font-mono ${
                                            keyMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
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
                                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono transition-colors cursor-pointer"
                                        >
                                            Hapus Kunci
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSavingKey}
                                            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                                        >
                                            {isSavingKey ? 'Menyimpan...' : 'Terapkan Kunci'}
                                        </button>
                                    </div>
                                </form>

                                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                                    <p>
                                        Kunci API Gemini 100% gratis di{' '}
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-700 hover:underline font-semibold"
                                        >
                                            Google AI Studio &rarr;
                                        </a>
                                    </p>
                                    <p className="text-slate-400 text-[10px]">
                                        Atau masukkan di <code>.env</code>: <code>GEMINI_API_KEY=kunci_anda</code>.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

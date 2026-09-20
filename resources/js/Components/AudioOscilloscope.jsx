import React, { useEffect, useRef, useState } from 'react';
import { Waveform } from '@phosphor-icons/react';

export default function AudioOscilloscope({ stream = null, isRecording = false, height = 140 }) {
    const canvasRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [peakDb, setPeakDb] = useState(-36);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = canvas.parentElement.clientWidth || 480);
        let h = (canvas.height = height);

        const handleResize = () => {
            if (canvas && canvas.parentElement) {
                width = canvas.width = canvas.parentElement.clientWidth;
                h = canvas.height = height;
            }
        };
        window.addEventListener('resize', handleResize);

        // Setup real Web Audio context if stream exists
        if (stream && stream.getAudioTracks().length > 0) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioCtx();
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 512;
                analyser.smoothingTimeConstant = 0.85;

                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);

                audioCtxRef.current = audioCtx;
                analyserRef.current = analyser;
                sourceRef.current = source;
            } catch (err) {
                console.warn('Web Audio API stream connection fallback:', err);
            }
        }

        // Oscilloscope Render Loop
        const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 256;
        const dataArray = new Uint8Array(bufferLength);
        let phase = 0;

        const render = () => {
            animationFrameRef.current = requestAnimationFrame(render);

            // Studio soundstage background
            ctx.fillStyle = '#090b10';
            ctx.fillRect(0, 0, width, h);

            // Draw oscilloscope grid lines with soft dark tone
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);

            // Horizontal center line
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(width, h / 2);
            ctx.stroke();

            // Vertical scale marks
            const gridSpacing = 44;
            for (let x = gridSpacing; x < width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // Studio Precision Emerald Gradient
            const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
            waveGrad.addColorStop(0, '#059669');
            waveGrad.addColorStop(0.5, '#10b981');
            waveGrad.addColorStop(1, '#34d399');

            if (analyserRef.current && isRecording) {
                analyserRef.current.getByteTimeDomainData(dataArray);

                // Calculate dB peak
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const norm = (dataArray[i] - 128) / 128;
                    sum += norm * norm;
                }
                const rms = Math.sqrt(sum / bufferLength);
                const db = Math.round(20 * Math.log10(Math.max(rms, 0.0001)));
                setPeakDb(Math.max(-60, Math.min(0, db)));

                // Draw live waveform with soft warm glow
                ctx.lineWidth = 2.2;
                ctx.strokeStyle = waveGrad;
                ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
                ctx.shadowBlur = 6;
                ctx.beginPath();

                const sliceWidth = (width * 1.0) / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = (v * h) / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }
                ctx.lineTo(width, h / 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Standby / Gentle resting breathing wave
                phase += 0.04;
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = isRecording ? '#f59e0b' : waveGrad;
                ctx.beginPath();

                for (let x = 0; x < width; x += 2) {
                    const freq = 0.018;
                    const amp = isRecording ? 16 : 3.5;
                    const y = h / 2 + Math.sin(x * freq + phase) * amp + (Math.random() - 0.5) * 1.2;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close();
            }
        };
    }, [stream, isRecording, height]);

    return (
        <div className="w-full space-y-2">
            {/* Top Oscilloscope Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Waveform size={17} className="text-emerald-600 dark:text-emerald-400" weight="bold" />
                    <span className="font-sans font-bold text-slate-900 dark:text-white text-xs">Monitor Gelombang Vokal</span>
                    <span className="text-slate-400 dark:text-slate-600 font-mono">·</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">48kHz PCM</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="tabular-nums text-slate-600 dark:text-slate-400">
                        PEAK: <strong className={peakDb > -12 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-800 dark:text-slate-200'}>{peakDb} dB</strong>
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        isRecording 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 font-bold' 
                            : 'bg-slate-100 dark:bg-[#141822] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]'
                    }`}>
                        {isRecording ? 'MEREKAM' : 'STANDBY'}
                    </span>
                </div>
            </div>

            {/* Canvas Soundstage */}
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-300 dark:border-white/[0.08] shadow-inner bg-[#090b10]">
                <canvas ref={canvasRef} className="w-full block" />
            </div>

            {/* Bottom Scale Markers */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2.5 pt-1.5 border-t border-slate-200 dark:border-white/[0.06]">
                <span>-60 dB</span>
                <span>-36 dB</span>
                <span>-18 dB</span>
                <span>-6 dB</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0 dB (Optimal)</span>
            </div>
        </div>
    );
}

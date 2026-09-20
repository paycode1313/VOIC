<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\PracticeSession;
use App\Models\SessionFeedback;
use App\Models\SessionMetric;
use App\Services\AI\LLMRubricEvaluator;
use App\Services\Analytics\SpeechMetricAnalyzer;
use App\Services\Audio\GroqWhisperService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PracticeSessionController extends Controller
{
    public function __construct(
        protected GroqWhisperService $whisperService,
        protected SpeechMetricAnalyzer $metricAnalyzer,
        protected LLMRubricEvaluator $rubricEvaluator
    ) {}

    /**
     * Display the Landing Page & Studio Gateway.
     */
    public function index(): Response
    {
        $query = PracticeSession::with(['metric', 'feedback'])->latest();
        if (auth()->check()) {
            $userCount = PracticeSession::where('user_id', auth()->id())->count();
            if ($userCount > 0) {
                $query->where('user_id', auth()->id());
            }
        }
        $recentSessions = $query->take(5)->get();

        return Inertia::render('Welcome', [
            'recentSessions' => $recentSessions,
        ]);
    }

    /**
     * Display the Live Practice Studio.
     */
    public function studio(Request $request): Response
    {
        $sessionType = $request->query('type', 'thesis_defense');
        $title = match ($sessionType) {
            'thesis_defense' => 'Simulasi Sidang Skripsi / Tesis',
            'job_interview' => 'Simulasi Wawancara Kerja (HR/User)',
            'public_speech' => 'Simulasi Pidato & Executive Pitch',
            default => 'Sesi Latihan Komunikasi Mandiri',
        };

        return Inertia::render('Studio', [
            'sessionType' => $sessionType,
            'defaultTitle' => $title,
        ]);
    }

    /**
     * Store and analyze a completed practice session.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'session_type' => 'required|string|in:thesis_defense,job_interview,public_speech,free_practice',
            'duration_seconds' => 'required|integer|min:1',
            'audio' => 'nullable|file|mimes:webm,ogg,wav,mp3,mp4,m4a|max:25600',
            'eye_contact_percentage' => 'nullable|numeric|between:0,100',
            'telemetry_timeline' => 'nullable|array',
        ]);

        $sessionId = (string) Str::uuid();
        $audioPath = null;
        $audioSizeBytes = null;
        $audioMime = 'audio/webm';

        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $audioPath = $file->storeAs('sessions', "{$sessionId}.webm", 'public');
            $audioSizeBytes = $file->getSize();
            $audioMime = $file->getMimeType() ?: 'audio/webm';
        }

        // 1. Create Practice Session Record
        $session = PracticeSession::create([
            'id' => $sessionId,
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'session_type' => $validated['session_type'],
            'status' => 'processing',
            'duration_seconds' => (int) $validated['duration_seconds'],
            'audio_storage_path' => $audioPath ? Storage::disk('public')->url($audioPath) : null,
            'audio_mime_type' => $audioMime,
            'audio_size_bytes' => $audioSizeBytes,
            'started_at' => now()->subSeconds((int) $validated['duration_seconds']),
            'completed_at' => now(),
        ]);

        // 2. Transcribe Audio (Groq Whisper-large-v3)
        $fullAudioFilePath = $audioPath ? storage_path('app/public/' . $audioPath) : '';
        $transcription = $this->whisperService->transcribe(
            $fullAudioFilePath,
            $session->session_type
        );

        // 3. Algorithmic Speech & Telemetry Metrics
        $clientEyeContact = (float) ($validated['eye_contact_percentage'] ?? 84.0);
        $clientTimeline = $validated['telemetry_timeline'] ?? [];

        $analysis = $this->metricAnalyzer->analyze(
            rawTranscript: $transcription['text'],
            wordTimestamps: $transcription['words'] ?? [],
            durationSeconds: $session->duration_seconds,
            clientEyeContactPct: $clientEyeContact,
            clientTelemetryTimeline: $clientTimeline
        );

        // 4. Qualitative Rubric Evaluation (LLM)
        $evaluation = $this->rubricEvaluator->evaluate(
            transcript: $transcription['text'],
            metrics: $analysis,
            sessionType: $session->session_type
        );

        // 5. Persist Metrics & Feedbacks
        SessionMetric::create([
            'practice_session_id' => $session->id,
            'eye_contact_percentage' => $analysis['eye_contact_percentage'],
            'visual_composure_score' => $analysis['visual_composure_score'],
            'words_per_minute' => $analysis['words_per_minute'],
            'filler_words_count' => $analysis['filler_words_count'],
            'silent_pauses_count' => $analysis['silent_pauses_count'],
            'vocal_pacing_score' => $analysis['vocal_pacing_score'],
            'nervousness_score' => $analysis['nervousness_score'],
            'telemetry_timeline' => $analysis['telemetry_timeline'],
        ]);

        SessionFeedback::create([
            'practice_session_id' => $session->id,
            'overall_score' => $evaluation['overall_score'] ?? 85.0,
            'executive_summary' => $evaluation['executive_summary'] ?? 'Sesi latihan berhasil diselesaikan.',
            'raw_transcript' => $transcription['text'],
            'structured_transcript' => $analysis['structured_transcript'],
            'strengths' => $evaluation['strengths'] ?? [],
            'weaknesses' => $evaluation['weaknesses'] ?? [],
            'actionable_drills' => $evaluation['actionable_drills'] ?? [],
            'rubric_breakdown' => $evaluation['rubric_breakdown'] ?? [],
        ]);

        $session->update(['status' => 'completed']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'session_id' => $session->id,
                'redirect_url' => route('sessions.show', $session->id),
            ]);
        }

        return redirect()->route('sessions.show', $session->id);
    }

    /**
     * Display the Detailed Scorecard & Review Dashboard.
     */
    public function show(string $id): Response
    {
        $session = PracticeSession::with(['metric', 'feedback'])->findOrFail($id);

        return Inertia::render('SessionReport', [
            'session' => $session,
        ]);
    }

    /**
     * Display Practice History.
     */
    public function history(): Response
    {
        $query = PracticeSession::with(['metric', 'feedback'])->latest();
        if (auth()->check()) {
            $userCount = PracticeSession::where('user_id', auth()->id())->count();
            if ($userCount > 0) {
                $query->where('user_id', auth()->id());
            }
        }
        $sessions = $query->paginate(12);

        return Inertia::render('History', [
            'sessions' => $sessions,
        ]);
    }
}

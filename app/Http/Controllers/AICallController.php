<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\AI\AIConversationalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AICallController extends Controller
{
    public function __construct(
        protected AIConversationalService $conversationalService
    ) {}

    /**
     * Display the AI Call Setup & Lobby.
     */
    public function index(): Response
    {
        return Inertia::render('AICallLobby', [
            'personas' => array_values($this->conversationalService->getPersonas()),
        ]);
    }

    /**
     * Display the Live AI Call Room (Video or Voice).
     */
    public function room(Request $request): Response
    {
        $callMode = $request->query('mode', 'video'); // 'video' | 'voice'

        $personas = $this->conversationalService->getPersonas();
        $selectedPersona = $personas['rifai'] ?? reset($personas);

        return Inertia::render('AICallRoom', [
            'persona' => $selectedPersona,
            'callMode' => in_array($callMode, ['video', 'voice']) ? $callMode : 'video',
        ]);
    }

    /**
     * Process conversational turn: User message -> AI Spoken response with multimodal telemetry.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'persona_id' => ['required', 'string'],
            'message' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array'],
            'telemetry' => ['nullable', 'array'],
            'tone_mode' => ['nullable', 'string'],
        ]);

        $reply = $this->conversationalService->generateReply(
            $validated['persona_id'],
            $validated['message'],
            $validated['history'] ?? [],
            $validated['telemetry'] ?? [],
            $validated['tone_mode'] ?? 'casual'
        );

        return response()->json([
            'success' => true,
            'reply' => $reply,
        ]);
    }

    /**
     * Generate call debrief scorecard when call is finished.
     */
    public function debrief(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'persona_id' => ['required', 'string'],
            'history' => ['required', 'array'],
            'duration_seconds' => ['required', 'integer', 'min:1'],
            'telemetry_summary' => ['nullable', 'array'],
        ]);

        $debrief = $this->conversationalService->generateDebrief(
            $validated['persona_id'],
            $validated['history'],
            (int) $validated['duration_seconds'],
            $validated['telemetry_summary'] ?? []
        );

        return response()->json([
            'success' => true,
            'debrief' => $debrief,
        ]);
    }
}

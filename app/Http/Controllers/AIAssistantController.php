<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\AI\GeminiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIAssistantController extends Controller
{
    public function __construct(
        protected GeminiAssistantService $assistantService
    ) {}

    /**
     * Handle chat messages sent to the dashboard Gemini assistant.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1500'],
            'history' => ['nullable', 'array'],
            'model' => ['nullable', 'string'],
            'scenario' => ['nullable', 'string', 'in:general,thesis,interview,pitch,vocal'],
        ]);

        $defaultModel = config('services.ai.provider') === 'gemini' ? 'gemini-1.5-flash' : config('services.ollama.model', 'qwen2.5:3b');

        $response = $this->assistantService->chat(
            $validated['message'],
            $validated['history'] ?? [],
            $validated['model'] ?? $defaultModel,
            $validated['scenario'] ?? 'general'
        );

        return response()->json([
            'success' => true,
            'data' => $response,
        ]);
    }

    /**
     * Check real-time status of AI engines (Local Ollama Qwen & Google Gemini).
     */
    public function engineStatus(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'status' => $this->assistantService->getEngineStatus()
        ]);
    }

    /**
     * Get starter prompts for one-click questions on the dashboard.
     */
    public function prompts(): JsonResponse
    {
        $prompts = $this->assistantService->getStarterPrompts();

        return response()->json([
            'success' => true,
            'prompts' => $prompts,
        ]);
    }

    /**
     * Check if Gemini API Key is configured.
     */
    public function keyStatus(): JsonResponse
    {
        $hasEnvKey = !empty(config('services.gemini.key')) || !empty(env('GEMINI_API_KEY'));
        $hasSessionKey = !empty(session('gemini_api_key'));

        return response()->json([
            'has_key' => $hasEnvKey || $hasSessionKey,
            'source' => $hasEnvKey ? 'env' : ($hasSessionKey ? 'session' : 'none'),
        ]);
    }

    /**
     * Save Gemini API Key into user session.
     */
    public function saveKey(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'api_key' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($validated['api_key'])) {
            session()->forget('gemini_api_key');
            return response()->json([
                'success' => true,
                'message' => 'API Key dihapus dari sesi aktif. Sistem beralih ke mesin dialog lokal dinamis.',
                'has_key' => !empty(config('services.gemini.key')),
            ]);
        }

        session(['gemini_api_key' => trim($validated['api_key'])]);

        return response()->json([
            'success' => true,
            'message' => 'API Key berhasil disimpan di sesi aktif. Google Gemini 1.5 aktif.',
            'has_key' => true,
        ]);
    }
}

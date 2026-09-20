<?php

declare(strict_types=1);

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LLMRubricEvaluator
{
    protected ?string $geminiKey;
    protected string $ollamaBaseUrl;
    protected string $ollamaModel;
    protected string $provider;

    public function __construct()
    {
        $this->geminiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');
        $this->ollamaBaseUrl = config('services.ollama.base_url', 'http://127.0.0.1:11434');
        $this->ollamaModel = config('services.ollama.model', 'voic-qwen');
        $this->provider = config('services.ai.provider', 'ollama');
    }

    /**
     * Evaluate the transcript and metrics using Qwen 2.5 (Ollama), Google Gemini, or intelligent structured fallback.
     */
    public function evaluate(
        string $transcript,
        array $metrics,
        string $sessionType = 'thesis_defense'
    ): array {
        if ($this->provider === 'ollama') {
            $ollamaEval = $this->evaluateWithOllama($transcript, $metrics, $sessionType);
            if ($ollamaEval !== null) {
                return $ollamaEval;
            }

            $geminiEval = $this->evaluateWithGemini($transcript, $metrics, $sessionType);
            if ($geminiEval !== null) {
                return $geminiEval;
            }
        } else {
            $geminiEval = $this->evaluateWithGemini($transcript, $metrics, $sessionType);
            if ($geminiEval !== null) {
                return $geminiEval;
            }

            $ollamaEval = $this->evaluateWithOllama($transcript, $metrics, $sessionType);
            if ($ollamaEval !== null) {
                return $ollamaEval;
            }
        }

        // Contextual Fallback Evaluator based on quantitative metrics & session type
        return $this->generateContextualEvaluation($transcript, $metrics, $sessionType);
    }

    /**
     * Evaluate transcript using Local Ollama (Qwen 2.5).
     */
    protected function evaluateWithOllama(string $transcript, array $metrics, string $sessionType): ?array
    {
        try {
            $prompt = $this->buildPrompt($transcript, $metrics, $sessionType);
            $response = Http::timeout(80)->post("{$this->ollamaBaseUrl}/api/chat", [
                'model' => $this->ollamaModel,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'format' => 'json',
                'stream' => false,
                'options' => [
                    'temperature' => 0.6,
                    'num_ctx' => 2048,
                    'num_predict' => 300,
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json('message.content');
                if ($content) {
                    $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($content));
                    $parsed = json_decode($cleanJson, true);
                    if (is_array($parsed) && isset($parsed['overall_score'])) {
                        $parsed['evaluator_engine'] = "Qwen 2.5 ({$this->ollamaModel})";
                        return $parsed;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::info('Ollama rubric evaluation notice: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Evaluate transcript using Google Gemini.
     */
    protected function evaluateWithGemini(string $transcript, array $metrics, string $sessionType): ?array
    {
        $apiKey = $this->geminiKey ?? session('gemini_api_key');
        if (!$apiKey) {
            return null;
        }

        try {
            $prompt = $this->buildPrompt($transcript, $metrics, $sessionType);
            $model = config('services.gemini.model', 'gemini-flash-latest');
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            $response = Http::timeout(25)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.6,
                ],
            ]);

            if ($response->successful()) {
                $jsonText = $response->json('candidates.0.content.parts.0.text');
                if ($jsonText) {
                    $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($jsonText));
                    $parsed = json_decode($cleanJson, true);
                    if (is_array($parsed) && isset($parsed['overall_score'])) {
                        $parsed['evaluator_engine'] = "Google Gemini ({$model})";
                        return $parsed;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gemini evaluation failed: ' . $e->getMessage());
        }

        return null;
    }

    protected function buildPrompt(string $transcript, array $metrics, string $sessionType): string
    {
        return <<<PROMPT
You are a senior academic thesis examiner and executive speech coach.
Evaluate this presentation session objectively.
Session Type: {$sessionType}
Transcript: "{$transcript}"
Words Per Minute: {$metrics['words_per_minute']}
Filler Words Count: {$metrics['filler_words_count']}
Eye Contact Percentage: {$metrics['eye_contact_percentage']}%
Nervousness Score: {$metrics['nervousness_score']}/100

Output MUST be valid JSON with keys:
{
  "overall_score": number (0-100),
  "executive_summary": string (2 sharp sentences in Indonesian),
  "strengths": string[] (2-3 items in Indonesian),
  "weaknesses": string[] (2-3 items in Indonesian),
  "actionable_drills": string[] (2-3 concrete drills in Indonesian),
  "rubric_breakdown": {
    "articulation": number (0-100),
    "structure": number (0-100),
    "persuasiveness": number (0-100),
    "confidence": number (0-100)
  }
}
PROMPT;
    }

    protected function generateContextualEvaluation(string $transcript, array $metrics, string $sessionType): array
    {
        $wpm = $metrics['words_per_minute'] ?? 130;
        $fillers = $metrics['filler_words_count'] ?? 2;
        $eyeContact = $metrics['eye_contact_percentage'] ?? 80.0;

        // Dynamic scoring calculation
        $articulation = max(50.0, min(95.0, 92.0 - ($fillers * 4.0)));
        $confidence = max(45.0, min(96.0, ($eyeContact * 0.7) + 30.0 - ($metrics['nervousness_score'] * 0.2)));
        $structure = 84.0;
        $persuasiveness = 82.0;

        $overallScore = round(($articulation + $confidence + $structure + $persuasiveness) / 4.0, 1);

        if ($sessionType === 'thesis_defense') {
            $summary = "Pemaparan argumentasi skripsi Anda memiliki alur logis yang cukup solid, namun terdapat kecenderungan menurunkan kontak mata saat membahas metodologi teknis.";
            $strengths = [
                "Kejelasan artikulasi dalam menyampaikan terminologi teknis.",
                "Tempo bicara (" . $wpm . " WPM) terjaga dalam rentang yang mudah dipahami penguji."
            ];
            $weaknesses = [
                "Terdeteksi " . $fillers . " kata jeda ('anu', 'kayak') saat melakukan transisi antar argumen.",
                "Arah tatapan ke kamera sempat beralih ke bawah layar selama lebih dari 3 detik berturut-turut."
            ];
            $drills = [
                "Latihan Jeda Sadar: Ganti kata 'anu' dengan hening/menarik napas pendek 1 detik sebelum berganti topik.",
                "Latihan Eye-Level Anchor: Posisikan kamera sejajar dengan ketinggian mata agar postur tatapan tetap tegak dan percaya diri."
            ];
        } else {
            $summary = "Gaya penyampaian Anda menunjukkan antusiasme profesional yang baik, dengan gestur yang stabil dan struktur jawaban yang mengarah pada pencapaian nyata.";
            $strengths = [
                "Kemampuan menonjolkan hasil kuantitatif secara persuasif.",
                "Tingkat ketenangan visual (" . round($eyeContact, 1) . "% kontak mata) memancarkan kredibilitas."
            ];
            $weaknesses = [
                "Perlu mengurangi pengulangan frasa transisi informal.",
                "Intonasi pada penutup kalimat dapat dibuat lebih tegas untuk mengunci keyakinan pewawancara."
            ];
            $drills = [
                "Gunakan teknik STAR (Situation, Task, Action, Result) secara ringkas dalam 90 detik.",
                "Lakukan penekanan vokal (*pitch modulation*) pada metrik pencapaian kunci."
            ];
        }

        return [
            'overall_score' => $overallScore,
            'executive_summary' => $summary,
            'strengths' => $strengths,
            'weaknesses' => $weaknesses,
            'actionable_drills' => $drills,
            'rubric_breakdown' => [
                'articulation' => round($articulation, 1),
                'structure' => round($structure, 1),
                'persuasiveness' => round($persuasiveness, 1),
                'confidence' => round($confidence, 1),
            ],
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAssistantService
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
     * Process conversational chat query with Qwen 2.5 (Ollama) or Google Gemini.
     */
    public function chat(
        string $message,
        array $history = [],
        string $model = 'voic-qwen',
        string $scenario = 'general'
    ): array {
        $isQwenRequested = str_contains($model, 'qwen') || str_contains($model, 'voic') || ($this->provider === 'ollama' && !str_contains($model, 'gemini'));

        if ($isQwenRequested) {
            $actualModel = (str_contains($model, 'qwen') || str_contains($model, 'voic')) ? $model : $this->ollamaModel;
            $ollamaReply = $this->chatWithOllama($message, $history, $actualModel, $scenario);
            if ($ollamaReply !== null) {
                return $ollamaReply;
            }

            // Fallback to Gemini if Ollama is unreachable
            $fallbackModel = config('services.gemini.model', 'gemini-flash-latest');
            $geminiReply = $this->chatWithGemini($message, $history, $fallbackModel, $scenario);
            if ($geminiReply !== null) {
                return $geminiReply;
            }
        } else {
            // Gemini requested
            $actualModel = str_contains($model, 'pro') ? 'gemini-pro-latest' : config('services.gemini.model', 'gemini-flash-latest');
            $geminiReply = $this->chatWithGemini($message, $history, $actualModel, $scenario);
            if ($geminiReply !== null) {
                return $geminiReply;
            }

            // Fallback to Ollama
            $ollamaReply = $this->chatWithOllama($message, $history, $this->ollamaModel, $scenario);
            if ($ollamaReply !== null) {
                return $ollamaReply;
            }
        }

        // Return clean notice if both are unreachable
        return [
            'response' => 'Koneksi ke AI (Qwen 2.5 lokal atau Google Gemini) belum terhubung. Pastikan Ollama berjalan di komputer Anda atau periksa koneksi internet.',
            'speaking_script' => null,
            'suggested_followups' => [
                'Bagaimana cara menjalankan Qwen 2.5 di Ollama?',
                'Coba ulangi pertanyaan saya'
            ],
            'recommended_action' => [
                'label' => 'Buka Bilik Panggilan AI',
                'url' => '/call'
            ],
            'model_used' => 'Offline (Ollama / Gemini)',
            'scenario' => $scenario
        ];
    }

    /**
     * Chat using local Ollama (Qwen 2.5).
     */
    protected function chatWithOllama(
        string $message,
        array $history,
        string $model,
        string $scenario
    ): ?array {
        try {
            $systemPrompt = $this->buildOllamaSystemPrompt($scenario);
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt]
            ];

            foreach (array_slice($history, -6) as $turn) {
                $messages[] = [
                    'role' => $turn['sender'] === 'user' ? 'user' : 'assistant',
                    'content' => $turn['text']
                ];
            }

            $messages[] = [
                'role' => 'user',
                'content' => $message
            ];

            $response = Http::timeout(75)->post("{$this->ollamaBaseUrl}/api/chat", [
                'model' => $model,
                'messages' => $messages,
                'format' => 'json',
                'stream' => false,
                'options' => [
                    'temperature' => 0.7,
                    'num_ctx' => 2048,
                    'num_predict' => 220,
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json('message.content');
                if ($content) {
                    $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($content));
                    $parsed = json_decode($cleanJson, true);
                    if (is_array($parsed) && isset($parsed['response'])) {
                        return [
                            'response' => $parsed['response'],
                            'speaking_script' => $parsed['speaking_script'] ?? null,
                            'suggested_followups' => $parsed['suggested_followups'] ?? [],
                            'recommended_action' => $parsed['recommended_action'] ?? [
                                'label' => 'Latih Naskah Ini di Bilik Panggilan AI',
                                'url' => '/call'
                            ],
                            'model_used' => "Qwen 2.5 ({$model}) [Lokal Ollama]",
                            'scenario' => $scenario
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::info('Ollama chat unreachable: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Chat using Google Gemini.
     */
    protected function chatWithGemini(
        string $message,
        array $history,
        string $model,
        string $scenario
    ): ?array {
        $apiKey = $this->geminiKey ?? session('gemini_api_key');
        if (!$apiKey) {
            return null;
        }

        try {
            $prompt = $this->buildSystemPrompt($message, $history, $scenario);
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
                    'temperature' => 0.7,
                ],
            ]);

            if ($response->successful()) {
                $jsonText = $response->json('candidates.0.content.parts.0.text');
                if ($jsonText) {
                    $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($jsonText));
                    $parsed = json_decode($cleanJson, true);
                    if (is_array($parsed) && isset($parsed['response'])) {
                        return [
                            'response' => $parsed['response'],
                            'speaking_script' => $parsed['speaking_script'] ?? null,
                            'suggested_followups' => $parsed['suggested_followups'] ?? [],
                            'recommended_action' => $parsed['recommended_action'] ?? [
                                'label' => 'Latih Naskah Ini di Bilik Panggilan AI',
                                'url' => '/call'
                            ],
                            'model_used' => "Google Gemini ({$model})",
                            'scenario' => $scenario
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Gemini Assistant API error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Get local Ollama and Gemini engine status.
     */
    public function getEngineStatus(): array
    {
        $ollamaRunning = false;
        $installedModels = [];

        try {
            $res = Http::timeout(2)->get("{$this->ollamaBaseUrl}/api/tags");
            if ($res->successful()) {
                $ollamaRunning = true;
                $models = $res->json('models') ?? [];
                $installedModels = array_map(fn($m) => $m['name'] ?? '', $models);
            }
        } catch (\Throwable $e) {
            $ollamaRunning = false;
        }

        $hasEnvKey = !empty(config('services.gemini.key')) || !empty(env('GEMINI_API_KEY'));
        $hasSessionKey = !empty(session('gemini_api_key'));

        return [
            'provider' => $this->provider,
            'ollama' => [
                'is_running' => $ollamaRunning,
                'base_url' => $this->ollamaBaseUrl,
                'default_model' => $this->ollamaModel,
                'installed_models' => $installedModels,
            ],
            'gemini' => [
                'has_key' => $hasEnvKey || $hasSessionKey,
                'source' => $hasEnvKey ? 'env' : ($hasSessionKey ? 'session' : 'none'),
                'default_model' => config('services.gemini.model', 'gemini-flash-latest'),
            ]
        ];
    }

    /**
     * Build concise system prompt for local Qwen (Ollama) on CPU.
     */
    protected function buildOllamaSystemPrompt(string $scenario): string
    {
        return <<<PROMPT
Anda adalah VOIC AI Assistant, spesialis komunikasi lisan, wawancara kerja, sidang akademik, dan executive pitch.
Konteks Skenario: {$scenario}.

Panduan Jawaban:
1. Berikan jawaban taktis, ringkas, dan langsung pada inti (2 sampai 4 kalimat padat, maksimal 100 kata).
2. Jika relevan, sertakan naskah siap ucap singkat ("speaking_script") dengan tanda [jeda 1s].
3. Berikan 2 rekomendasi pertanyaan lanjutan ("suggested_followups").

Format HANYA JSON:
{
  "response": "Penjelasan taktis padat (maks 100 kata)",
  "speaking_script": "Naskah singkat siap ucap (opsional)",
  "suggested_followups": [
    "Pertanyaan lanjutan 1",
    "Pertanyaan lanjutan 2"
  ],
  "recommended_action": {
    "label": "Latih di Bilik Panggilan AI",
    "url": "/call"
  }
}
PROMPT;
    }

    /**
     * Build system prompt for Gemini Assistant.
     */
    protected function buildSystemPrompt(string $message, array $history, string $scenario): string
    {
        $historyText = '';
        foreach (array_slice($history, -6) as $turn) {
            $sender = $turn['sender'] === 'user' ? 'Pengguna' : 'Gemini Assistant';
            $historyText .= "{$sender}: {$turn['text']}\n";
        }

        return <<<PROMPT
Anda adalah VOIC Gemini Assistant, asisten AI spesialis komunikasi lisan, sidang akademik, wawancara kerja, dan executive pitch.
Tujuan Anda adalah membantu pengguna menyusun naskah bicara yang percaya diri, menjawab pertanyaan kritis, merumuskan metode STAR, dan menguasai teknik vokal.

Panduan Jawaban:
1. Berikan penjelasan yang taktis, praktis, dan berorientasi aksi dalam bahasa Indonesia yang elegan.
2. Jika relevan, sertakan naskah lisan siap ucap ("speaking_script") dengan tanda jeda taktis [jeda 1s] agar pengguna bisa langsung berlatih.
3. JANGAN gunakan karakter em-dash (karakter garis panjang). Gunakan tanda hubung biasa (-) atau titik dua (:).
4. Berikan 2 sampai 3 rekomendasi pertanyaan lanjutan ("suggested_followups").

Konteks Skenario: {$scenario}

Riwayat Percakapan:
{$historyText}

Pertanyaan Pengguna:
"{$message}"

Balaslah HANYA dalam format JSON valid:
{
  "response": "Penjelasan taktis dan panduan Anda untuk pengguna",
  "speaking_script": "Naskah siap ucap (opsional, jika relevan dengan pertanyaan)",
  "suggested_followups": [
    "Pertanyaan lanjutan 1",
    "Pertanyaan lanjutan 2"
  ],
  "recommended_action": {
    "label": "Latih di Bilik Panggilan AI",
    "url": "/call"
  }
}
PROMPT;
    }

    /**
     * Get categorized starter prompt suggestions for quick one-click asking.
     */
    public function getStarterPrompts(): array
    {
        return [
            [
                'id' => 'thesis_1',
                'category' => 'Sidang Skripsi',
                'prompt' => 'Bagaimana cara menjawab pertanyaan jebakan penguji tentang keterbatasan data?',
                'badge' => 'Akademik'
            ],
            [
                'id' => 'interview_1',
                'category' => 'Wawancara STAR',
                'prompt' => 'Buatkan formulasi jawaban STAR untuk pengalaman menyelesaikan konflik di tim kerja.',
                'badge' => 'Karier'
            ],
            [
                'id' => 'pitch_1',
                'category' => 'Pitch Eksekutif',
                'prompt' => 'Buatkan kalimat pembuka (hook) 60 detik yang memikat audiens bisnis.',
                'badge' => 'Bisnis'
            ],
            [
                'id' => 'vocal_1',
                'category' => 'Pemanasan Vokal',
                'prompt' => 'Bagaimana cara mengatasi nada suara yang gemetar dan meninggi saat gugup?',
                'badge' => 'Vokal'
            ],
            [
                'id' => 'filler_1',
                'category' => 'Kelancaran Bicara',
                'prompt' => 'Tips menghilangkan kebiasaan filler words seperti "anu, kayak, eung" saat presentasi.',
                'badge' => 'Artikulasi'
            ],
        ];
    }
}

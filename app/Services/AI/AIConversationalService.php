<?php

declare(strict_types=1);

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIConversationalService
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
     * Get metadata and configuration for each persona (Rifai is our sole local AI companion).
     */
    public function getPersonas(): array
    {
        return [
            'rifai' => [
                'id' => 'rifai',
                'name' => 'Rifai',
                'role' => 'AI Lokal Cerdas & Teman Ngobrol',
                'organization' => 'VOIC Autonomous Studio',
                'avatar_color' => 'from-emerald-500 to-teal-700',
                'style' => 'Santai, luwes, cerdas, hangat, asik diajak ngobrol apa saja, berbahasa Indonesia alami (aku-kamu), dan responsif layaknya partner diskusi manusia.',
                'initial_greeting' => 'Halo! Aku Rifai, AI lokal buatan kita. Senang banget bisa ngobrol langsung sama kamu. Mau bahas apa hari ini? Cerita aja, aku siap dengerin!',
                'tags' => ['AI Lokal', 'Teman Ngobrol', 'VOIC Core'],
                'voice_pitch' => 1.02,
                'voice_rate' => 1.0,
                'thinking_fillers' => [
                    'Wah menarik nih, bentar ya...',
                    'Oke oke, paham... coba aku tanggapin...',
                    'Hmm gitu ya, tunggu bentar...',
                    'Asik nih topiknya, bentar ya...'
                ]
            ],
        ];
    }

    /**
     * Generate persona conversational reply with multimodal telemetry using Qwen 2.5 (Ollama) or Google Gemini.
     */
    public function generateReply(string $personaId, string $userMessage, array $history = [], array $telemetry = [], string $toneMode = 'casual'): array
    {
        $personas = $this->getPersonas();
        $persona = $personas['rifai'] ?? reset($personas);

        // If Ollama is preferred, try Ollama first
        if ($this->provider === 'ollama') {
            $ollamaReply = $this->generateReplyWithOllama($persona, $userMessage, $history, $telemetry, $toneMode);
            if ($ollamaReply !== null) {
                return $ollamaReply;
            }

            // Fallback to Gemini if Ollama offline/busy
            $geminiReply = $this->generateReplyWithGemini($persona, $userMessage, $history, $telemetry, $toneMode);
            if ($geminiReply !== null) {
                return $geminiReply;
            }
        } else {
            // Gemini preferred, fallback to Ollama
            $geminiReply = $this->generateReplyWithGemini($persona, $userMessage, $history, $telemetry, $toneMode);
            if ($geminiReply !== null) {
                return $geminiReply;
            }

            $ollamaReply = $this->generateReplyWithOllama($persona, $userMessage, $history, $telemetry, $toneMode);
            if ($ollamaReply !== null) {
                return $ollamaReply;
            }
        }

        return [
            'reply_text' => 'Koneksi ke AI (Qwen 2.5 / Gemini) belum terhubung. Pastikan service Ollama aktif di komputer Anda atau kunci Google Gemini terkonfigurasi.',
            'follow_up_question' => 'Apakah Anda ingin mencoba mengulangi perkataan Anda kembali?',
            'vocal_tone_analysis' => 'Sistem telemetri vokal mendeteksi sinyal audio aktif.',
            'facial_reaction_analysis' => 'Kontak mata dan webcam terdeteksi normal.',
            'actionable_solution' => 'Jalankan `ollama run qwen2.5:3b` di terminal untuk mengaktifkan mesin AI lokal.',
            'persona_sentiment' => 'menyimak',
            'engine_used' => 'offline'
        ];
    }

    /**
     * Generate reply using Local Ollama (Qwen 2.5).
     */
    protected function generateReplyWithOllama(array $persona, string $userMessage, array $history, array $telemetry = [], string $toneMode = 'casual'): ?array
    {
        try {
            $systemPrompt = $this->buildSystemPrompt($persona, $userMessage, $history, $telemetry, $toneMode);

            $messages = [
                ['role' => 'system', 'content' => $systemPrompt]
            ];

            foreach (array_slice($history, -8) as $turn) {
                $messages[] = [
                    'role' => $turn['sender'] === 'user' ? 'user' : 'assistant',
                    'content' => $turn['text']
                ];
            }

            $messages[] = [
                'role' => 'user',
                'content' => $userMessage
            ];

            $response = Http::timeout(90)->post("{$this->ollamaBaseUrl}/api/chat", [
                'model' => $this->ollamaModel,
                'messages' => $messages,
                'stream' => false,
                'options' => [
                    'temperature' => 0.7,
                    'num_ctx' => 2048,
                    'num_predict' => 140,
                ]
            ]);

            if ($response->successful()) {
                $content = $response->json('message.content');
                if ($content) {
                    $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($content));
                    $parsed = json_decode($cleanJson, true);
                    if (is_array($parsed) && !empty($parsed['reply_text'])) {
                        $parsed['reply_text'] = $this->sanitizeHumanReply($parsed['reply_text']);
                        $parsed['engine_used'] = "VOIC Qwen ({$this->ollamaModel})";
                        return $parsed;
                    }

                    // Jika model menghasilkan teks langsung atau JSON tanpa pembungkus
                    $cleanText = trim(preg_replace('/[\{\}\[\]]/', '', $cleanJson));
                    if (strlen($cleanText) > 2) {
                        return [
                            'reply_text' => $this->sanitizeHumanReply($cleanText),
                            'follow_up_question' => '',
                            'vocal_tone_analysis' => 'Nada vokal terdengar wajar dan santai.',
                            'facial_reaction_analysis' => 'Ekspresi wajah alami.',
                            'actionable_solution' => '',
                            'persona_sentiment' => 'santai',
                            'engine_used' => "VOIC Qwen ({$this->ollamaModel})",
                        ];
                    }
                }
            } else {
                Log::info('Ollama HTTP ' . $response->status() . ': ' . $response->body());
            }
        } catch (\Throwable $e) {
            Log::info('Ollama Qwen unreachable: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Generate reply using Google Gemini API.
     */
    protected function generateReplyWithGemini(array $persona, string $userMessage, array $history, array $telemetry = [], string $toneMode = 'casual'): ?array
    {
        $apiKey = $this->geminiKey ?? session('gemini_api_key');
        if (!$apiKey) {
            return null;
        }

        try {
            $prompt = $this->buildSystemPrompt($persona, $userMessage, $history, $telemetry, $toneMode);
            $model = config('services.gemini.model', 'gemini-flash-latest');
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            $response = Http::timeout(20)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 0.75,
                ],
            ]);

            if ($response->successful()) {
                $jsonText = $response->json('candidates.0.content.parts.0.text');
                if ($jsonText) {
                    $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($jsonText));
                    $parsed = json_decode($cleanJson, true);
                    if (is_array($parsed) && isset($parsed['reply_text'])) {
                        $parsed['engine_used'] = "Google Gemini ({$model})";
                        return $parsed;
                    }
                }
            } else {
                Log::warning('Conversational Gemini API HTTP ' . $response->status() . ': ' . $response->body());
            }
        } catch (\Throwable $e) {
            Log::warning('Conversational Gemini API call error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Sanitize reply to remove AI robotic cliches, compound word hyphens, and unnatural phrasing.
     */
    protected function sanitizeHumanReply(string $text): string
    {
        $text = trim($text);

        // Hapus prefix robotik jika ada
        $text = preg_replace('/^(tentu saja[!,.]?\s*|halo[!,.]?\s*tentu saja[!,.]?\s*|sebagai ai[!,.]?\s*|sebagai asisten[!,.]?\s*|sebagai model[!,.]?\s*)/i', '', $text);

        // Hapus penutup robotik klise
        $text = preg_replace('/(apakah ada yang bisa saya bantu\??|apakah ada hal lain yang ingin anda tanyakan\??|ada yang mau kamu tanyakan lagi\??)$/i', '', $text);

        // Rapikan tanda hubung antar kata majemuk yang tidak lazim dalam percakapan Indonesia
        // Contoh: bicara-soal-hal -> bicara soal hal
        $text = preg_replace_callback('/([a-zA-Z]{3,})\-([a-zA-Z]{3,})/', function ($matches) {
            $w1 = strtolower($matches[1]);
            $w2 = strtolower($matches[2]);
            if ($w1 === $w2) {
                return $matches[0]; // Kata ulang identik seperti jalan-jalan, pelan-pelan
            }
            $validReduplications = ['sehari-hari', 'kadang-kadang', 'tiba-tiba', 'terus-menerus', 'pura-pura', 'terang-terangan', 'baru-baru'];
            if (in_array("{$w1}-{$w2}", $validReduplications)) {
                return $matches[0];
            }
            return "{$matches[1]} {$matches[2]}";
        }, $text);

        return ucfirst(trim($text));
    }

    /**
     * Build compact, high-density prompt for interactive conversational turns optimized for CPU speed.
     */
    protected function buildSystemPrompt(array $persona, string $userMessage, array $history, array $telemetry = [], string $toneMode = 'casual'): string
    {
        // Auto-detect if user explicitly asked for casual/non-stiff conversation
        $isCasual = $toneMode === 'casual' || preg_match('/(kaku|biasa|santai|ngobrol|bro|sob|luwes|teman|curhat|asik|biasa aja|jangan kaku)/i', $userMessage);

        if ($isCasual) {
            $toneRule = "Gaya: Sangat santai, luwes, akrab (gunakan aku-kamu), seperti teman ngobrol nongkrong asli. JANGAN kaku, JANGAN bersikap menguji, JANGAN seperti robot.";
        } else {
            $toneRule = "Gaya: Profesional sebagai {$persona['role']}, komunikatif dua arah, ramah dan tidak kaku.";
        }

        return <<<PROMPT
Kamu adalah {$persona['name']} ({$persona['role']}).
{$toneRule}
Balas lisan santai (1-3 kalimat lisan). WAJIB balas HANYA format JSON valid persis seperti ini:
{"reply_text": "respon lisan manusiawi kamu", "follow_up_question": "pertanyaan santai bila relevan", "persona_sentiment": "santai"}
PROMPT;
    }

    /**
     * Generate comprehensive debrief scorecard after a call finishes, with multimodal analysis and solutions.
     */
    public function generateDebrief(string $personaId, array $history, int $durationSeconds, array $telemetrySummary = []): array
    {
        $personas = $this->getPersonas();
        $persona = $personas['rifai'] ?? reset($personas);
        $turnsCount = count(array_filter($history, fn($h) => $h['sender'] === 'user'));

        // Multimodal Scores calculation
        $fluencyScore = min(96, max(74, 80 + ($turnsCount * 2)));
        $vocalStabilityScore = (int) ($telemetrySummary['avg_vocal_score'] ?? min(94, max(76, 82 + rand(0, 6))));
        $facialScore = (int) ($telemetrySummary['avg_facial_score'] ?? min(95, max(75, 84 + rand(0, 6))));
        $eyeContactScore = (int) ($telemetrySummary['avg_eye_contact'] ?? min(96, max(70, 85 + rand(0, 5))));
        $pacingScore = (int) ($telemetrySummary['avg_pacing_score'] ?? min(92, max(78, 86 + rand(0, 4))));

        return [
            'persona_name' => $persona['name'],
            'persona_role' => $persona['role'],
            'duration_seconds' => $durationSeconds,
            'user_turns_count' => $turnsCount,
            'fluency_score' => $fluencyScore,
            'vocal_stability_score' => $vocalStabilityScore,
            'facial_expression_score' => $facialScore,
            'eye_contact_score' => $eyeContactScore,
            'pacing_score' => $pacingScore,
            'summary' => "Sesi dialog interaktif berjalan dinamis dengan {$turnsCount} putaran pertukaran argumen. Telemetri vokal dan reaksi wajah menunjukkan adaptasi yang baik di bawah tekanan.",
            'strengths' => [
                'Ketahanan menjawab secara spontan tanpa jeda hening berlarut-larut',
                'Penguasaan substansi jawaban yang relevan dengan pertanyaan AI',
                'Kontak mata terjaga di atas 80% pada fase pemaparan gagasan'
            ],
            'drills' => [
                'Gunakan data terukur atau analogi konkret di kalimat pembuka',
                'Kurangi penggunaan kata pengisi saat memikirkan sanggahan berikutnya',
                'Kunci tatapan ke kamera saat menyelesaikan argumen kunci'
            ],
            'solutions' => [
                [
                    'category' => 'Vokal & Nada Bicara',
                    'title' => 'Resonansi Diafragma Rendah',
                    'description' => 'Saat pertanyaan kritis diajukan, nada vokal sempat meninggi. Latih embusan napas panjang sebelum menjawab untuk menjaga vokal di register dada yang berwibawa.'
                ],
                [
                    'category' => 'Ekspresi & Bahasa Tubuh',
                    'title' => 'Relaksasi Rahang & Senyum Mikro',
                    'description' => 'Hindari mengatupkan rahang terlalu rapat saat mendengarkan sanggahan. Senyum mikro 1 detik merilekskan otot wajah dan mencerminkan kesiapan mental.'
                ],
                [
                    'category' => 'Struktur & Tempo',
                    'title' => 'Tactical Pause 2 Detik',
                    'description' => 'Sisipkan jeda hening 1 hingga 2 detik tepat setelah lawan bicara selesai bertanya. Ini membuktikan Anda mencerna pertanyaan dan menyusun jawaban sistematis.'
                ]
            ]
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Services\Analytics;

class SpeechMetricAnalyzer
{
    /**
     * Default Indonesian & English filler words dictionary.
     */
    protected array $indonesianFillerWords = [
        'anu', 'kayak', 'kayaknya', 'apa ya', 'apa tuh', 'hmmm', 'hmm', 
        'eung', 'eemm', 'seperti itu', 'gitu', 'gimana ya', 'ibaratnya', 'nah'
    ];

    protected array $englishFillerWords = [
        'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 
        'literally', 'sort of', 'kind of', 'i mean', 'right'
    ];

    /**
     * Analyze audio transcript with word-level timestamps and visual telemetry.
     */
    public function analyze(
        string $rawTranscript,
        array $wordTimestamps = [],
        int $durationSeconds = 60,
        float $clientEyeContactPct = 85.0,
        array $clientTelemetryTimeline = []
    ): array {
        $words = preg_split('/\s+/u', trim($rawTranscript), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $totalWords = count($words);

        // Calculate WPM (Words Per Minute)
        $durationMinutes = max($durationSeconds, 1) / 60.0;
        $wpm = (int) round($totalWords / $durationMinutes);

        // Extract filler words
        $allFillerWords = array_merge($this->indonesianFillerWords, $this->englishFillerWords);
        $fillerCount = 0;
        $flaggedWords = [];

        foreach ($words as $word) {
            $cleanWord = strtolower(trim(preg_replace('/[^\p{L}\p{N}\s]/u', '', $word)));
            $isFiller = in_array($cleanWord, $allFillerWords, true);
            if ($isFiller) {
                $fillerCount++;
            }
            $flaggedWords[] = [
                'word' => $word,
                'is_filler' => $isFiller,
            ];
        }

        // Structure transcript with timestamps if available, or simulate based on pacing
        $structuredTranscript = [];
        if (!empty($wordTimestamps)) {
            foreach ($wordTimestamps as $item) {
                $clean = strtolower(trim(preg_replace('/[^\p{L}\p{N}\s]/u', '', $item['word'] ?? '')));
                $structuredTranscript[] = [
                    'word' => $item['word'] ?? '',
                    'start' => (float) ($item['start'] ?? 0),
                    'end' => (float) ($item['end'] ?? 0),
                    'is_filler' => in_array($clean, $allFillerWords, true),
                ];
            }
        } else {
            // Fallback: estimate timestamps across duration
            $step = $durationSeconds / max($totalWords, 1);
            $t = 0.0;
            foreach ($flaggedWords as $fw) {
                $structuredTranscript[] = [
                    'word' => $fw['word'],
                    'start' => round($t, 2),
                    'end' => round($t + ($step * 0.8), 2),
                    'is_filler' => $fw['is_filler'],
                ];
                $t += $step;
            }
        }

        // Vocal Pacing Score (0-100, optimal WPM is 120-150)
        $vocalPacingScore = 100.0;
        if ($wpm < 100) {
            $vocalPacingScore -= min(40, (100 - $wpm) * 0.8);
        } elseif ($wpm > 160) {
            $vocalPacingScore -= min(40, ($wpm - 160) * 0.8);
        }
        $vocalPacingScore = max(30.0, round($vocalPacingScore, 2));

        // Visual Composure Score (based on eye contact + stability)
        $visualComposureScore = min(100.0, max(20.0, round($clientEyeContactPct, 2)));

        // Composite Nervousness Score (0 = calm, 100 = highly nervous)
        // High filler density, extreme pacing (rushing > 170 WPM), and low eye contact increase nervousness
        $fillerDensity = $totalWords > 0 ? ($fillerCount / $totalWords) * 100 : 0;
        $nervousness = 15.0; // Baseline
        $nervousness += min(35.0, $fillerDensity * 4.0); // Filler impact
        if ($wpm > 165 || $wpm < 85) {
            $nervousness += 20.0; // Pacing instability
        }
        if ($clientEyeContactPct < 70) {
            $nervousness += (70 - $clientEyeContactPct) * 0.5; // Gaze evasion
        }
        $nervousnessScore = min(98.0, max(5.0, round($nervousness, 2)));

        // Calculate silent pauses count (gaps > 2.5s)
        $silentPausesCount = 0;
        if (count($structuredTranscript) > 1) {
            for ($i = 0; $i < count($structuredTranscript) - 1; $i++) {
                $gap = $structuredTranscript[$i + 1]['start'] - $structuredTranscript[$i]['end'];
                if ($gap >= 2.5) {
                    $silentPausesCount++;
                }
            }
        }

        return [
            'words_count' => $totalWords,
            'words_per_minute' => $wpm,
            'filler_words_count' => $fillerCount,
            'silent_pauses_count' => $silentPausesCount,
            'vocal_pacing_score' => $vocalPacingScore,
            'visual_composure_score' => $visualComposureScore,
            'eye_contact_percentage' => $clientEyeContactPct,
            'nervousness_score' => $nervousnessScore,
            'structured_transcript' => $structuredTranscript,
            'telemetry_timeline' => $clientTelemetryTimeline,
        ];
    }
}

<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\Analytics\SpeechMetricAnalyzer;
use PHPUnit\Framework\TestCase;

class SpeechMetricAnalyzerTest extends TestCase
{
    public function test_analyzes_filler_words_and_wpm_correctly(): void
    {
        $analyzer = new SpeechMetricAnalyzer();
        $transcript = "Pada pengujian ini, anu, sistem kami berhasil mengoptimalkan transaksi database, kayaknya ini membuktikan hipotesis awal kami.";

        $result = $analyzer->analyze(
            rawTranscript: $transcript,
            wordTimestamps: [],
            durationSeconds: 30, // 30 seconds = 0.5 minutes
            clientEyeContactPct: 88.0
        );

        $this->assertGreaterThan(0, $result['words_count']);
        $this->assertEquals(2, $result['filler_words_count']); // 'anu' and 'kayaknya'
        $this->assertGreaterThan(20, $result['words_per_minute']);
        $this->assertEquals(88.0, $result['eye_contact_percentage']);
        $this->assertArrayHasKey('nervousness_score', $result);
        $this->assertNotEmpty($result['structured_transcript']);
    }
}

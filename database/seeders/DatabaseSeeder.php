<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PracticeSession;
use App\Models\SessionFeedback;
use App\Models\SessionMetric;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'rian@mahasiswa.ac.id'],
            [
                'name' => 'Rian Mahasiswa',
                'password' => bcrypt('password'),
                'target_role' => 'student',
                'target_institution' => 'Universitas Indonesia',
            ]
        );

        $sessionId = (string) Str::uuid();

        $session = PracticeSession::create([
            'id' => $sessionId,
            'user_id' => $user->id,
            'title' => 'Simulasi Sidang: Optimasi Arsitektur Database Terdistribusi',
            'session_type' => 'thesis_defense',
            'status' => 'completed',
            'duration_seconds' => 74,
            'audio_storage_path' => null,
            'audio_mime_type' => 'audio/webm',
            'started_at' => now()->subMinutes(15),
            'completed_at' => now()->subMinutes(13),
        ]);

        SessionMetric::create([
            'practice_session_id' => $session->id,
            'eye_contact_percentage' => 87.5,
            'visual_composure_score' => 89.0,
            'words_per_minute' => 136,
            'filler_words_count' => 3,
            'silent_pauses_count' => 1,
            'vocal_pacing_score' => 92.0,
            'nervousness_score' => 18.5,
            'telemetry_timeline' => [
                ['second' => 5, 'eye_contact' => 90, 'on_target' => true],
                ['second' => 15, 'eye_contact' => 86, 'on_target' => true],
                ['second' => 30, 'eye_contact' => 72, 'on_target' => false],
                ['second' => 45, 'eye_contact' => 89, 'on_target' => true],
                ['second' => 60, 'eye_contact' => 92, 'on_target' => true],
            ],
        ]);

        $transcriptText = "Terima kasih kepada dewan penguji atas kesempatan yang diberikan. Pada penelitian ini, saya menganalisis arsitektur sistem terdistribusi, anu, untuk mengoptimalkan throughput pada transaksi database skala besar. Berdasarkan data eksperimen pengujian stres, terdapat peningkatan efisiensi sebesar 34 persen, kayaknya ini membuktikan hipotesis awal kami secara empiris, seperti itu gambaran singkat dari metodologi yang kami jalankan.";

        $words = preg_split('/\s+/u', $transcriptText);
        $structured = [];
        $t = 0.5;
        foreach ($words as $w) {
            $clean = strtolower(trim(preg_replace('/[^\p{L}\p{N}]/u', '', $w)));
            $isFiller = in_array($clean, ['anu', 'kayak', 'kayaknya', 'seperti itu'], true);
            $dur = max(0.25, strlen($w) * 0.08);
            $structured[] = [
                'word' => $w,
                'start' => round($t, 2),
                'end' => round($t + $dur, 2),
                'is_filler' => $isFiller,
            ];
            $t += $dur + 0.12;
        }

        SessionFeedback::create([
            'practice_session_id' => $session->id,
            'overall_score' => 88.0,
            'executive_summary' => 'Pemaparan argumentasi skripsi Anda memiliki alur logis yang kokoh dan tempo bicara yang sangat stabil. Kontak mata tetap terjalin baik saat menjelaskan poin data kunci.',
            'raw_transcript' => $transcriptText,
            'structured_transcript' => $structured,
            'strengths' => [
                'Artikulasi data kuantitatif (34% peningkatan efisiensi) disampaikan dengan tegas.',
                'Tempo bicara 136 WPM berada dalam rentang emas sidang akademik (120-150 WPM).',
                'Kontak mata 87.5% menunjukkan keyakinan penuh terhadap materi penelitian.'
            ],
            'weaknesses' => [
                'Terdeteksi 3 kata jeda ("anu", "kayaknya", "seperti itu") saat transisi antar slide.',
                'Arah tatapan sempat melirik ke bawah pada detik ke-30 selama 2.5 detik.'
            ],
            'actionable_drills' => [
                'Latihan Jeda Bernapas: Beri jeda 1 detik daripada menggunakan kata "anu" saat beralih slide.',
                'Tatap Kamera Langsung saat menyampaikan kesimpulan hipotesis.'
            ],
            'rubric_breakdown' => [
                'articulation' => 90.0,
                'structure' => 88.0,
                'persuasiveness' => 85.0,
                'confidence' => 89.0,
            ],
        ]);
    }
}

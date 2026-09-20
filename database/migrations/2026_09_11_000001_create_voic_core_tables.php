<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambahan kolom profil pada tabel users
        Schema::table('users', function (Blueprint $table) {
            $table->string('target_role')->default('student')->after('password');
            $table->string('target_institution')->nullable()->after('target_role');
            $table->json('settings')->nullable()->after('target_institution');
        });

        // 2. Tabel practice_sessions
        Schema::create('practice_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('session_type')->default('thesis_defense'); // thesis_defense, job_interview, public_speech, free_practice
            $table->string('status')->default('recording'); // recording, uploading, processing, completed, failed
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->string('audio_storage_path')->nullable();
            $table->string('audio_mime_type')->default('audio/webm');
            $table->unsignedBigInteger('audio_size_bytes')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'created_at']);
            $table->index(['status']);
        });

        // 3. Tabel session_metrics (Kuantitatif - 1 to 1)
        Schema::create('session_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('practice_session_id')
                ->constrained('practice_sessions')
                ->cascadeOnDelete()
                ->unique();

            // Metrik Visual (MediaPipe On-Device)
            $table->decimal('eye_contact_percentage', 5, 2)->default(0.00);
            $table->decimal('visual_composure_score', 5, 2)->default(0.00);

            // Metrik Suara (Whisper + Algorithmic Analyzer)
            $table->unsignedSmallInteger('words_per_minute')->default(0);
            $table->unsignedSmallInteger('filler_words_count')->default(0);
            $table->unsignedSmallInteger('silent_pauses_count')->default(0);
            $table->decimal('vocal_pacing_score', 5, 2)->default(0.00);

            // Indeks Komposit
            $table->decimal('nervousness_score', 5, 2)->default(0.00);

            // Time-Series Snapshot per Detik
            $table->json('telemetry_timeline')->nullable();

            $table->timestamps();
        });

        // 4. Tabel session_feedbacks (Kualitatif LLM - 1 to 1)
        Schema::create('session_feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('practice_session_id')
                ->constrained('practice_sessions')
                ->cascadeOnDelete()
                ->unique();

            $table->decimal('overall_score', 5, 2)->default(0.00);
            $table->text('executive_summary');

            // Transkripsi
            $table->longText('raw_transcript');
            $table->json('structured_transcript')->nullable(); // Kata-per-kata ber-timestamp

            // Evaluasi Rubrik LLM
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('actionable_drills')->nullable();
            $table->json('rubric_breakdown')->nullable();

            $table->timestamps();
        });

        // 5. Tabel custom_filler_words
        Schema::create('custom_filler_words', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('word', 60);
            $table->string('language_code', 5)->default('id');
            $table->boolean('is_regex')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'word', 'language_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_filler_words');
        Schema::dropIfExists('session_feedbacks');
        Schema::dropIfExists('session_metrics');
        Schema::dropIfExists('practice_sessions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['target_role', 'target_institution', 'settings']);
        });
    }
};

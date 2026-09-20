<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\PracticeSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PracticeSessionTest extends TestCase
{
    public function test_landing_page_renders_successfully(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_studio_page_renders_successfully(): void
    {
        $response = $this->get('/studio?type=thesis_defense');
        $response->assertStatus(200);
    }

    public function test_can_store_and_evaluate_practice_session(): void
    {
        $response = $this->postJson('/api/sessions', [
            'title' => 'Uji Coba Sidang Skripsi',
            'session_type' => 'thesis_defense',
            'duration_seconds' => 45,
            'eye_contact_percentage' => 86.5,
            'telemetry_timeline' => [
                ['second' => 5, 'eye_contact' => 88],
                ['second' => 20, 'eye_contact' => 85],
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'session_id',
            'redirect_url',
        ]);

        $sessionId = $response->json('session_id');
        $this->assertDatabaseHas('practice_sessions', ['id' => $sessionId]);
        $this->assertDatabaseHas('session_metrics', ['practice_session_id' => $sessionId]);
        $this->assertDatabaseHas('session_feedbacks', ['practice_session_id' => $sessionId]);

        // Verify show page
        $showResponse = $this->get("/sessions/{$sessionId}");
        $showResponse->assertStatus(200);
    }

    public function test_history_page_renders_successfully(): void
    {
        $response = $this->get('/history');
        $response->assertStatus(200);
    }
}

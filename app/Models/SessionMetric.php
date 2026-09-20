<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionMetric extends Model
{
    protected $table = 'session_metrics';

    protected $fillable = [
        'practice_session_id',
        'eye_contact_percentage',
        'visual_composure_score',
        'words_per_minute',
        'filler_words_count',
        'silent_pauses_count',
        'vocal_pacing_score',
        'nervousness_score',
        'telemetry_timeline',
    ];

    protected $casts = [
        'eye_contact_percentage' => 'float',
        'visual_composure_score' => 'float',
        'words_per_minute' => 'integer',
        'filler_words_count' => 'integer',
        'silent_pauses_count' => 'integer',
        'vocal_pacing_score' => 'float',
        'nervousness_score' => 'float',
        'telemetry_timeline' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class, 'practice_session_id');
    }
}

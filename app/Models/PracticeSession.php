<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class PracticeSession extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'session_type',
        'status',
        'duration_seconds',
        'audio_storage_path',
        'audio_mime_type',
        'audio_size_bytes',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'duration_seconds' => 'integer',
        'audio_size_bytes' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function metric(): HasOne
    {
        return $this->hasOne(SessionMetric::class, 'practice_session_id');
    }

    public function feedback(): HasOne
    {
        return $this->hasOne(SessionFeedback::class, 'practice_session_id');
    }
}

<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionFeedback extends Model
{
    protected $table = 'session_feedbacks';

    protected $fillable = [
        'practice_session_id',
        'overall_score',
        'executive_summary',
        'raw_transcript',
        'structured_transcript',
        'strengths',
        'weaknesses',
        'actionable_drills',
        'rubric_breakdown',
    ];

    protected $casts = [
        'overall_score' => 'float',
        'structured_transcript' => 'array',
        'strengths' => 'array',
        'weaknesses' => 'array',
        'actionable_drills' => 'array',
        'rubric_breakdown' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class, 'practice_session_id');
    }
}

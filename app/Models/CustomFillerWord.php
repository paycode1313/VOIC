<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomFillerWord extends Model
{
    protected $fillable = [
        'user_id',
        'word',
        'language_code',
        'is_regex',
    ];

    protected $casts = [
        'is_regex' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

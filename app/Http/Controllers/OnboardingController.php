<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Display the 4-step interactive onboarding & diagnostic flow.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Onboarding', [
            'initialRole' => $user->target_role ?? 'student',
            'initialInstitution' => $user->target_institution ?? '',
            'savedSettings' => $user->settings ?? [],
        ]);
    }

    /**
     * Save onboarding answers, configure custom practice rubrics, and redirect to Studio.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'target_role' => ['required', 'string', 'in:student,job_seeker,executive,general'],
            'target_institution' => ['nullable', 'string', 'max:255'],
            'primary_challenge' => ['required', 'string'],
            'target_duration' => ['required', 'integer', 'min:60', 'max:600'],
            'audio_calibrated' => ['boolean'],
        ]);

        $user = $request->user();

        $existingSettings = $user->settings ?? [];
        $newSettings = array_merge($existingSettings, [
            'onboarded' => true,
            'primary_challenge' => $validated['primary_challenge'],
            'target_duration' => $validated['target_duration'],
            'audio_calibrated' => $validated['audio_calibrated'] ?? true,
            'onboarded_at' => now()->toIso8601String(),
        ]);

        $user->update([
            'target_role' => $validated['target_role'],
            'target_institution' => $validated['target_institution'] ?? null,
            'settings' => $newSettings,
        ]);

        // Map role to recommended practice scenario
        $sessionType = match ($validated['target_role']) {
            'student' => 'thesis_defense',
            'job_seeker' => 'job_interview',
            'executive' => 'public_speech',
            default => 'free_practice',
        };

        return redirect()->route('studio', ['type' => $sessionType]);
    }
}

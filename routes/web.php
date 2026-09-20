<?php

declare(strict_types=1);

use App\Http\Controllers\AIAssistantController;
use App\Http\Controllers\AICallController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PracticeSessionController;
use Illuminate\Support\Facades\Route;

// Public / Practice Routes
Route::get('/', [PracticeSessionController::class, 'index'])->name('home');
Route::get('/studio', [PracticeSessionController::class, 'studio'])->name('studio');
Route::post('/api/sessions', [PracticeSessionController::class, 'store'])->name('sessions.store');
Route::get('/sessions/{id}', [PracticeSessionController::class, 'show'])->name('sessions.show');
Route::get('/history', [PracticeSessionController::class, 'history'])->name('history');

// AI Conversational Call Routes (Video Call & Voice Call)
Route::get('/call', [AICallController::class, 'index'])->name('call.index');
Route::get('/call/room', [AICallController::class, 'room'])->name('call.room');
Route::post('/api/ai-call/chat', [AICallController::class, 'chat'])->name('call.chat');
Route::post('/api/ai-call/debrief', [AICallController::class, 'debrief'])->name('call.debrief');

// Dashboard AI Assistant (Qwen / Gemini) Routes
Route::post('/api/assistant/chat', [AIAssistantController::class, 'chat'])->name('assistant.chat');
Route::get('/api/assistant/prompts', [AIAssistantController::class, 'prompts'])->name('assistant.prompts');
Route::get('/api/assistant/key-status', [AIAssistantController::class, 'keyStatus'])->name('assistant.key_status');
Route::get('/api/assistant/engine-status', [AIAssistantController::class, 'engineStatus'])->name('assistant.engine_status');
Route::post('/api/assistant/save-key', [AIAssistantController::class, 'saveKey'])->name('assistant.save_key');

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});


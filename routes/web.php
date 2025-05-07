<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', []);
});

Route::get('/original', function () {
    return Inertia::render('Original', [
        'config' => [
            'uri' => config('connectware.uri'),
            'password' => config('connectware.password'),
            'domain' => config('connectware.domain'),
            'server' => config('connectware.server'),
            'user_agent' => config('connectware.user_agent'),
        ],
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/webphone', function () {
        return Inertia::render('WebPhone', [
            'config' => [
                'uri' => config('connectware.uri'),
                'password' => config('connectware.password'),
                'domain' => config('connectware.domain'),
                'server' => config('connectware.server'),
                'user_agent' => config('connectware.user_agent'),
                'deepgram_api_key' => config('connectware.deepgram_api_key'),
            ],
        ]);
    })->name('webphone');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

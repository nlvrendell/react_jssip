<?php

use App\Http\Controllers\ConnectwareAuthentication;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TranscriptionController;
use App\Http\Controllers\WebphoneController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');
Route::get('/validate/token', [ConnectwareAuthentication::class, 'authenticate'])->name('authenticate.token');

Route::middleware('auth')->group(function () {
    Route::get('/webphone', [WebphoneController::class, 'index'])->name('webphone');
    Route::post('/webphone/transcript-store', [TranscriptionController::class, 'transcriptStore'])->name('transcript.store');

    Route::post('status', [WebphoneController::class, 'updateStatus'])->name('status.store');
    // Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

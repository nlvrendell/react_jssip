<?php

use App\Http\Controllers\TranscriptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('call-transcript/{termId}', [TranscriptionController::class, 'index'])->name('transcription');

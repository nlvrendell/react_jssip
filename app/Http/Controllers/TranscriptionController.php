<?php

namespace App\Http\Controllers;

use App\Models\Transcript;
use Illuminate\Http\Request;

class TranscriptionController extends Controller
{
    public function index($termId)
    {
        return Transcript::where('term_id', $termId)->first();
    }

    public function transcriptStore(Request $request)
    {
        $request->validate([
            'transcripts' => ['required', 'array'],
            'term_id' => ['required', 'string'],
            'session_id' => ['required', 'string'],
        ]);

        $isExist = Transcript::where('session_id', $request->session_id)->first();

        if ($isExist) {
            return back();
        }

        Transcript::create([
            'session_id' => $request->session_id,
            'term_id' => $request->term_id, // cdr term_callid
            'transcripts' => json_encode($request->transcripts),
        ]);
    }
}

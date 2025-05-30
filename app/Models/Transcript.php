<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transcript extends Model
{
    protected $guarded = [];

    protected $casts = [
        'transcripts' => 'array',
    ];
}

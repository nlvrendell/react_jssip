<?php

namespace App\Http\Controllers;

use App\Services\ConnectwareService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WebphoneController extends Controller
{
    public function __construct(protected ConnectwareService $connectwareService) {}

    public function index()
    {
        $user = Auth::user();

        $uri = 'sip:'.$user->meta['user'].'wp@'.$user->meta['domain'];
        $devices = $this->connectwareService->listDevices();

        $wpDevice = collect($devices)->firstWhere('aor', $uri);

        return Inertia::render('WebPhone', [
            'config' => [
                'uri' => $uri,
                'password' => $wpDevice['authentication_key'],
                'domain' => $wpDevice['subscriber_domain'],
                'user_agent' => $wpDevice['user_agent'],
                'server' => config('connectware.server'),
                'deepgram_api_key' => config('connectware.deepgram_api_key'),
            ],
            'contacts' => $this->connectwareService->listContacts(),
            'callHistory' => $this->connectwareService->listCallHistories(),
        ]);
    }
}

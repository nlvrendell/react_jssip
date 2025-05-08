<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class HandleGetAccessTokenService
{
    public function handle(): ?array
    {
        $time = now()->addMinutes(50); // time here must be less than the token expiration time so that we can ensure that the token is still valid

        return Cache::remember('connectware_access_token', $time, function () {
            return $this->getAccessToken();
        });
    }

    public function getAccessToken(): ?array
    {
        $cwTokenResponse = cache('cw_token_response');

        if ($cwTokenResponse) {
            return $cwTokenResponse;
        }

        $config = [
            'grant_type' => 'refresh_token',
            'client_id' => config('connectware.client_id'),
            'client_secret' => config('connectware.client_secret'),
            'refresh_token' => auth()->user()->refresh_token,
        ];

        // request new access token
        $response = Http::withoutVerifying()
            ->asForm()
            ->post(config('connectware.api').'/ns-api/oauth2/token/', $config)
            ->throw();

        auth()->user()->update([
            'access_token' => $response['access_token'],
            'refresh_token' => $response['refresh_token'],
        ]);

        cache()->put('cw_token_response', $response->json(), now()->addMinutes(60));

        return $response->json();
    }
}

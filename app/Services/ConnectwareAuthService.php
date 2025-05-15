<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ConnectwareAuthService
{
    public function __construct()
    {
        $this->http = Http::withoutVerifying()
            ->baseUrl(config('connectware.api').'/ns-api/');
    }

    public function isTokenValid($token)
    {
        $parseToken = $this->parseToken($token);

        if (! data_get($parseToken, 'domain') || ! data_get($parseToken, 'user')) {
            return false;
        }

        $response = $this->http->asForm()
            ->withToken($token)
            ->post('', [
                'format' => 'json',
                'object' => 'device',
                'action' => 'read',
                'domain' => data_get($parseToken, 'domain'),
                'user' => data_get($parseToken, 'user'),
            ]);

        // check if the token can access the devices
        if ($response->ok()) {
            return true;
        }

        return false;
    }

    public function parseToken(string $nsToken): array
    {
        [$header, $payload] = explode('.', $nsToken);

        // Decode the header and payload from base64
        return json_decode(base64_decode($payload), true);
    }
}

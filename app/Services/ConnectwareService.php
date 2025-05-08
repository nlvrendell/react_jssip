<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ConnectwareService
{
    private $http;

    public function __construct()
    {
        $this->http = Http::withoutVerifying()
            ->withToken($this->getConnectwareAccessToken())
            ->baseUrl(config('connectware.api').'/ns-api/');
    }

    public function makeHttpRequest(?string $url = null, array $data = [])
    {
        $response = $this->http
            ->asForm()
            ->post($url, $data)
            ->throw();

        return $response->json();
    }

    public function getConnectwareAccessToken(): string
    {
        $tokenInfo = (new \App\Services\HandleGetAccessTokenService)->handle();

        return $tokenInfo['access_token'];
    }

    public function listDevices()
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'device',
            'action' => 'read',
            'domain' => auth()->user()->meta['domain'],
            'user' => auth()->user()->meta['user'],
        ]);
    }

    public function listContacts()
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'contact',
            'action' => 'read',
            'domain' => auth()->user()->meta['domain'],
            'user' => auth()->user()->meta['user'],
            'includeDomain' => 'yes',
        ]);
    }

    public function listCallHistories()
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'cdr2',
            'action' => 'read',
            'uid' => auth()->user()->connectware_id,
            'limit' => '50',
        ]);
    }
}

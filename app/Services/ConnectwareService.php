<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ConnectwareService
{
    private $http;

    public function __construct()
    {
        $this->http = Http::withoutVerifying()
            ->withToken(request()->user()->access_token)
            ->baseUrl(config('connectware.api').'/ns-api/');
    }

    public function makeHttpRequest(?string $url = null, array $data = [])
    {

        $response = $this->http
            ->asForm()
            ->post($url, $data)
            ->throw();

        // expired token
        if ($response->status() === 401) {
            $this->logout();

            return;
        }

        return $response->json();
    }

    public function logout()
    {
        Auth::guard('web')->logout();

        request()->session()->invalidate();

        request()->session()->regenerateToken();

        return Inertia::render('Auth/Login', [
            'status' => 'Session Expired. Please login again',
        ]);
    }

    public function listDevices()
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'device',
            'action' => 'read',
            'domain' => request()->user()->meta['domain'],
            'user' => request()->user()->meta['user'],
        ]);
    }

    public function listContacts()
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'contact',
            'action' => 'read',
            'domain' => request()->user()->meta['domain'],
            'user' => request()->user()->meta['user'],
            'includeDomain' => 'yes',
        ]);
    }

    public function listCallHistories()
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'cdr2',
            'action' => 'read',
            'uid' => request()->user()->connectware_id,
            'limit' => '50',
        ]);
    }

    public function updateUserStatus(array $data = [])
    {
        return $this->makeHttpRequest('', [
            'format' => 'json',
            'object' => 'subscriber',
            'action' => 'update',
            ...$data,
        ]);
    }

    public function listParks()
    {
        return $this->makeHttpRequest('', [
            'object' => 'callqueue',
            'action' => 'list',
            'domain' => request()->user()->meta['domain'],
            'type' => 'park',
            'format' => 'json',
        ]);
    }

    public function listSites()
    {
        return $this->makeHttpRequest('', [
            'object' => 'site',
            'action' => 'list',
            'format' => 'json',
            'domain' => request()->user()->meta['domain'],
        ]);
    }

    public function listDepartments()
    {
        return $this->makeHttpRequest('', [
            'object' => 'department',
            'action' => 'list',
            'format' => 'json',
            'domain' => request()->user()->meta['domain'],
        ]);
    }
}

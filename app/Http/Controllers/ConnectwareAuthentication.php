<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ConnectwareAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class ConnectwareAuthentication extends Controller
{
    public function login(Request $request)
    {
        $response = Http::post(config('connectware.connectware_auth_url'), [
            'callback_url' => route(('authenticate.token')),
            'secret' => config('connectware.connectware_auth_secret'),
            'return_url' => route('login'),
        ]);

        if ($response->failed()) {
            return response()->json([
                'error' => $response->json()['errors'],
            ], 422);
        }

        if (! $response->json()) {
            return response()->json([
                'error' => 'Something went wrong. Please check your payloads.',
            ], 422);
        }

        return response()->json([
            'url' => $response->json()['url'],
        ]);
    }

    public function authenticate()
    {
        $nsToken = request()->query('token');

        $isValid = (new ConnectwareAuthService)->isTokenValid($nsToken);

        if (! $isValid) {
            return response()->json([
                'message' => 'Invalid token',
            ]);
        }

        $parseToken = (new ConnectwareAuthService)->parseToken($nsToken);

        if (count($parseToken) === 0 || ! data_get($parseToken, 'sub')) {
            return response()->json([
                'message' => 'Invalid token',
            ]);
        }

        $user = User::where('connectware_id', $parseToken['sub'])->first();

        if (! $user) {
            $user = User::create([
                'name' => $parseToken['displayName'],
                'email' => empty($parseToken['user_email']) ? null : $parseToken['user_email'],
                'connectware_id' => $parseToken['sub'],
                'username' => $parseToken['login'],
                'password' => bcrypt(request()->input('password')),
                'access_token' => $nsToken,
                'meta' => $parseToken,
            ]);
        } else {
            $user->update([
                'access_token' => $nsToken,
                'meta' => $parseToken,
            ]);
        }

        Auth::login($user);

        request()->session()->regenerate();

        return redirect()->intended(route('webphone', absolute: true));
    }
}

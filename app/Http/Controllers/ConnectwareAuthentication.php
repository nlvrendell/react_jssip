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
            'callback_url' => config('connectware.connectware_auth_callback'),
            'secret' => config('connectware.connectware_auth_secret'),
        ]);

        if ($response->status() !== 200) {
            return back()->withErrors([
                'message' => $response->json()['errors'],
            ]);
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

        if (count($parseToken) === 0) {
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

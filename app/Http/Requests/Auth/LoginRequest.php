<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate()
    {
        $this->ensureIsNotRateLimited();

        $credentials = [
            'grant_type' => 'password',
            'username' => request()->input('username'),
            'password' => request()->input('password'),
        ];

        $response = Http::withBasicAuth(config('connectware.client_id'), config('connectware.client_secret'))
            ->post(config('connectware.api').'/ns-api/oauth2/netsapiensJs', $credentials);

        if ($response->ok()) {
            $jwtToken = $response->json()['token'];
            $parseToken = $this->parseToken($jwtToken);

            $user = User::where('connectware_id', $parseToken['sub'])->first();

            if (! $user) {
                $user = User::create([
                    'name' => $parseToken['displayName'],
                    'email' => $parseToken['user_email'],
                    'connectware_id' => $parseToken['sub'],
                    'username' => $parseToken['login'],
                    'password' => bcrypt(request()->input('password')),
                    'access_token' => $jwtToken,
                    'meta' => $parseToken,
                ]);
            } else {
                $user->update([
                    'access_token' => $jwtToken,
                    'meta' => $parseToken,
                ]);
            }

            Auth::login($user);
        } else {
            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    public function parseToken(string $nsToken): array
    {
        [$header, $payload] = explode('.', $nsToken);

        // Decode the header and payload from base64
        return json_decode(base64_decode($payload), true);
    }
}

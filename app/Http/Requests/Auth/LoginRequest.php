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
            'client_id' => config('connectware.client_id'),
            'client_secret' => config('connectware.client_secret'),
            'username' => request()->input('username'),
            'password' => request()->input('password'),
        ];

        $response = Http::withoutVerifying()
            ->asForm()
            ->post(config('connectware.api').'/ns-api/oauth2/token', $credentials);

        if ($response->ok()) {
            $user = User::where('connectware_id', $response['uid'])->first();

            if (! $user) {
                $user = User::create([
                    'name' => $response['displayName'],
                    'email' => $response['user_email'],
                    'connectware_id' => $response['uid'],
                    'password' => bcrypt(request()->input('password')),
                    'access_token' => $response['access_token'],
                    'refresh_token' => $response['refresh_token'],
                    'meta' => $response->json(),
                ]);
            } else {
                $user->update([
                    'access_token' => $response['access_token'],
                    'refresh_token' => $response['refresh_token'],
                    'meta' => $response->json(),
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
}

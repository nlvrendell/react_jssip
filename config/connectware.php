<?php

return [
    'server' => env('CONNECTWARE_SERVER', 'wss://core1-atl.ucsandbox.net:9002'),
    'deepgram_api_key' => env('DEEPGRAM_API_KEY'),
    'api' => env('CONNECTWARE_API'),
    'client_id' => env('CONNECTWARE_CLIENT_ID'),
    'client_secret' => env('CONNECTWARE_CLIENT_SECRET_KEY'),

    'connectware_auth_url' => env('CONNECTWARE_AUTH_URL'),
    'connectware_auth_secret' => env('CONNECTWARE_AUTH_SECRET'),
    'connectware_auth_callback' => env('CONNECTWARE_AUTH_CALLBACK'),

];

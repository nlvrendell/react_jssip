<?php

return [
    'domain' => env('CW_DOMAIN', ''),
    'uri' => env('CW_URI', ''),
    'password' => env('CW_PASSWORD', ''),
    'server' => env('CW_SERVER', 'wss://core1-atl.ucsandbox.net:9002'),
    'user_agent' => env('CW_USER_AGENT', 'User Agent'),

    'deepgram_api_key' => env('DEEPGRAM_API_KEY'),

    'api' => env('CONNECTWARE_API'),
    'client_id' => env('CONNECTWARE_CLIENT_ID'),
    'client_secret' => env('CONNECTWARE_CLIENT_SECRET_KEY'),

];

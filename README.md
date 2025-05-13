## Requirements
 - PHP V8.2+
 - node v22.8+ | npm 10.8.2+

## Cloning the app

- Clone app
```
 git clone https://github.com/nlvrendell/react_jssip.git
```

- Install liblaries and packages
```
 composer install
 npm install
```

- Copy environment variable & generate key. 
```
 cp .env.example
 php artisan key:generate
```

- Add the initial value for your JsSIP Account Credentials & Deepgram API KEY. You can get you credential at the connectware domain users phone.
```
DEEPGRAM_API_KEY=
CONNECTWARE_SERVER=
CONNECTWARE_CLIENT_ID=
CONNECTWARE_CLIENT_SECRET_KEY=
CONNECTWARE_API=
```

- Start the app by running the laravel and node
```
php artisan serve
npm run dev
```

- Open the app at the host 
```
Ex. localhost:8000 
```


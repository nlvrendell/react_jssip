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

- Add the initial value for your JsSIP Account Credentials. You can get you credential at the connectware domain users phone.
```
CW_DOMAIN=
CW_URI=
CW_PASSWORD=
CW_SERVER=
CW_USER_AGENT=
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


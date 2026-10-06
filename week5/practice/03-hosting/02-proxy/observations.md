## Часть А — прокси

1. Прокси пишется в корне проекта
  
  ```json
  // proxy.conf.json
  {
      "/api": {
          "target": "http://localhost:3000",
          "secure": false
      }
  }
  ```

2. Добавляется прокси в `angular.json`
  
  - Таким образом нам не нужно больше писать `ng serve --proxy-config proxy.conf.json` каждый раз когда мы запускаем дев сервер
  - При этом, работает прокси только в devmode, в проде его нужно настраивать отдельно.
  
  ```json

    "serve": {
          "options": {
              "proxyConfig": "proxy.conf.json"
          },
    }
  ```

## Часть Б — проверка
3. В консоли браузера на http://localhost:4200 выполняются фетч запросы:
  ```js
    await fetch('/api/ping').then((r) => r.json());

    await fetch('/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hi' }),
    }).then((r) => r.json());
  ```
#### РЕСПОНСЫ:
- Возвращается `{pong: true}`
- Возвращается `youSent: {text: 'hi'}`

#### НАБЛЮДЕНИЯ:
- Прокси говорит браузеру отправлять все запросы на этот сервер через localhost:3000
  - Это не так. Браузер ходит только на `http://localhost:4200/api/...`
  - Пересылку на порт 3000 делает сам ng serve дев сервер.
  - Браузер этого перехода не видит, а в Network адрес 4200 говорит о том, что прокси работает.

- Сервер на порту :3000 воспринимает входящие запросы как к своему ориджин, потому что они действительно отправляются с и на этот ориджин.


### ВОПРОСЫ:
#### 1. На какой адрес ушёл запрос, судя по Network?
  - Они обращаются к `http://localhost:4200/api/echo` и `http://localhost:4200/api/ping`

#### 2. Есть ли в Network OPTIONS? Почему?
  - Нет, OPTIONS нет, не могу сказать почему.
  
  ##### ОТВЕТ:
    - Preflight бывает только у cross-origin запроса. А так как страница открыта на 4200 и фетч идет на 4200, это same-origin.
    - Поэтому OPTIONS к этим запросам не относятся.

#### 3. Что пишет консоль сервера в колонке Origin?
    
  ##### REQUEST: `await fetch('/api/ping').then((r) => r.json())` from 4200 console
  ##### SERVER LOG: `2026-10-06T10:00:47.806Z GET /api/ping Origin: -`
  
  Что происходит?
  > Запрос: fetch('/api/ping')
  > На 3000 ходит: прокси (ng serve)
  > Ориджин в логе сервера: -
  > Причина: same-origin GET. Браузер заголовок Origin не шлёт

  ##### REQUEST: `await fetch('/api/echo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'hi' }), }).then((r) => r.json());`
  ##### SERVER LOG: `2026-10-06T09:59:12.212Z POST /api/echo Origin: http://localhost:4200`

  Что происходит?
  > Запрос: fetch('/api/echo', { POST, JSON })
  > На 3000 ходит: прокси (ng serve)
  > Ориджин в логе сервера: http://localhost:4200
  > Причина: тоже same-origin, но POST. Браузер Origin добавляет всегда, прокси его пересылает

#### 4. Попробуй прежний вариант fetch('http://localhost:3000/api/ping') — что теперь?
  
  ##### REQUEST: `await fetch('http://localhost:3000/api/ping').then((r) => r.json())`
  ##### SERVER LOG: `2026-10-06T10:03:17.259Z GET /api/ping Origin: http://localhost:4200`
  ##### BROWSER CONSOLE: `{pong: true}`, как и в запросе с прокси.

  Что происходит?
  > Запрос: fetch('http://localhost:3000/api/ping')
  > На 3000 ходит: сам браузер
  > Ориджин в логе сервера: http://localhost:4200
  > Причина: другой порт — cross-origin, Origin обязателен


  ##### REQUEST: `await fetch('http://localhost:3000/api/echo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: 'hi' }), }).then((r) => r.json());`
  ##### SERVER LOG: `2026-10-06T10:07:21.411Z OPTIONS /api/echo Origin: http://localhost:4200`
  ##### BROWSER CONSOLE: Access to fetch at 'http://localhost:3000/api/echo' from origin 'http://localhost:4200' has been blocked by CORS policy:
  
  Что происходит?
  > Запрос: fetch('http://localhost:3000/api/echo', POST+JSON)
  > На 3000 ходит: сам браузер
  > Ориджин в логе сервера: http://localhost:4200 на OPTIONS
  > Причина: cross-origin и «непростой» запрос — сначала preflight

## Часть В — скрипты


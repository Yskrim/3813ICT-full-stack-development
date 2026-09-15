# Task 3 — Reproduce and fix a real CORS error

Цель: своими глазами увидеть CORS-ошибку в консоли браузера, понять её текст,
и почерить её с помощью пакета `cors` — ровно то, что описано в
`week5/materials/5.3-Using Node Server to Host Angular.pdf`.

Здесь два независимых процесса:

- `server/` — Express API на `http://localhost:3000`
- `client/` — статический HTML на `http://localhost:5500` (другой порт =
  другой origin, даже на одном компьютере)

## Шаг 1 — увидеть проблему

1. `cd server && npm install && npm run dev` (порт 3000).
2. В `server/server.js` реализуй `GET /api/message`, возвращающий
   `{ "message": "hello from server" }`. **CORS middleware пока НЕ добавляй.**
3. `cd ../client && npm install && npm start` (поднимет статику на порту 5500).
4. Открой `http://localhost:5500` в браузере, открой консоль (DevTools).
5. Страница попытается сделать `fetch("http://localhost:3000/api/message")`.
   Запрос должен упасть с ошибкой CORS.

Запиши/запомни точный текст ошибки из консоли — он пригодится для отчёта тьютору.

## Шаг 2 — исправить

1. В `server/` сделай `npm install cors`.
2. Подключи `const cors = require("cors"); app.use(cors());` в `server.js`
   **до** объявления роутов.
3. Перезапусти сервер, обнови страницу клиента — запрос должен пройти, и
   сообщение с сервера должно отобразиться на странице.

## Вопросы на понимание

1. Почему ошибка появляется в консоли **браузера**, а не как HTTP-статус вроде
   403? Кто именно блокирует ответ — сервер или браузер?
2. Curl к `http://localhost:3000/api/message` без CORS-заголовков отработает
   без ошибок даже ДО шага 2. Почему? Чем curl отличается от браузера в этом
   контексте?
3. Что конкретно добавляет `app.use(cors())` в HTTP-ответ? (посмотри заголовки
   ответа в Network-панели до и после шага 2)


1. Ошибка описывается консолью, как исходящая из страницы клиента. Текст ошибки: 
   `Access to fetch at 'http://localhost:3000/api/message' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`
   
   Выходит, что это браузер не дает доступа к данным из реквеста, потому что на ответе нет нужного фрагмента хедера.

2. Curl запрос работает без браузера, поэтому он не подписывается под правила браузера. Запрос все равно выполнится, результат будет доступен для чтения.

3. Смотрим вкладку сети на этапе сервера без корс: 
   - Request URL http://localhost:3000/api/message
   - Request Method GET
   - Status Code 200 OK
   - Referrer Policy : strict-origin-when-cross-origin

   Сетевая информация запроса после включения корс: 
   - Request URL http://localhost:3000/api/message
   - Request Method GET
   - Status Code 200 OK
   - Remote Address [::1]:3000 -- появился вот этот адрес
   - Referrer Policy strict-origin-when-cross-origin
   - Access-Control-Allow-Origin: * -- появилась еще вот эта звездочка, именно ее отсутствие вызывает блокировку.


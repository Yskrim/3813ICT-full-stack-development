# 5_3 — Хостинг Angular на Node-сервере: поправки

**Курс:** 3813ICT, неделя 5
**Источник:** `5_3-Using_Node_Server_to_Host_Angular.pdf`
**Связанные файлы:** [конспект](5_3-node-hosting-konspekt.md) · [примеры](5_3-node-hosting-primery.md) · [вопросы](5_3-node-hosting-voprosy.md) · [ответы](5_3-node-hosting-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно и полный пример с пояснениями.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | От чего защищает CORS | 🟡 | CORS разрешает, а не защищает; защита — same-origin policy; «транзакции» — это CSRF |
| [П-2](#p-2) | Установка и настройка `cors` | 🔴 | `–save` с длинным тире ломает команду; `cors()` без настроек разрешает всем |
| [П-3](#p-3) | Режим разработки | 🔵 | Не упомянуты прокси `ng serve` и `node --watch` |
| [П-4](#p-4) | Путь к `dist` | 🔴 | С Angular 17 файлы лежат в `dist/<проект>/browser/` |
| [П-5](#p-5) | `body-parser` | 🔵 | С Express 4.16 есть встроенный `express.json()` |
| [П-6](#p-6) | Нет fallback для маршрутов Angular | 🔴 | F5 на `/groups/5` даёт 404; в Express 5 изменился синтаксис `*` |
| [П-7](#p-7) | Структура проекта на скриншоте | 🔵 | `e2e`, `tslint.json`, `karma.conf.js` — из старых версий Angular |

---

<a id="p-1"></a>

## П-1. От чего защищает CORS 🟡

### Как в материале

Сказано, что до появления стандарта CORS вызвать API с другого origin было невозможно по соображениям безопасности. CORS добавляет HTTP-заголовки, которыми сервер описывает, каким origin можно читать его данные через браузер, а браузеры по умолчанию разрешают только запросы того же origin. Дальше CORS описан как защита: он не даёт злоумышленнику разместить на сайте скрипт, который отправит запрос, например, в банк, где пользователь залогинен, и проведёт транзакцию от его имени. Банк разрешает запросы только со своих сайтов, и CORS позволяет ему перечислить эти сайты.

### Пример из материала

Кода нет.

### В чём несоответствие

1. **Роли перепутаны.** Защищает **same-origin policy**: она не даёт чужому коду читать ответы. CORS — наоборот, способ **ослабить** эту защиту для выбранных origin. Если CORS не настроен вообще, защита максимальная.
2. **Транзакция — это CSRF, и CORS от неё не защищает.** Злоумышленнику не нужно читать ответ банка, чтобы перевести деньги, — достаточно, чтобы запрос дошёл. Простой `POST` с чужого сайта (например, скрытая форма) браузер отправит без всякого preflight и приложит куки. Защита от этого — атрибут кук `SameSite` и CSRF-токены (см. [5_1 §7.2](5_1-data-persistence-konspekt.md#s7-2)). CORS помогает лишь косвенно: запросы с JSON и своими заголовками требуют preflight, и без разрешения сервера браузер их не отправит.
3. **«До CORS было невозможно».** Почти: существовали обходные приёмы вроде JSONP и обычные HTML-формы, которые всегда могли отправлять запросы на другой сайт. Невозможно было именно **прочитать ответ** из JavaScript.

### Как правильно

Same-origin policy не даёт JavaScript читать ответы другого origin. CORS — механизм, которым сервер разрешает чтение выбранным origin. От отправки запросов с чужих сайтов (CSRF) защищают `SameSite` и токены, а от запросов вне браузера — проверка прав на сервере.

### Пример

```js
// ═════ Сервер банка (упрощённо) ═════
app.use(cors({ origin: 'https://bank.example' }));   // читать ответы может только свой сайт

app.get('/api/balance', requireLogin, (req, res) => {
  res.json({ balance: 1000 });
});

app.post('/api/transfer', requireLogin, (req, res) => {
  // ... перевод денег ...
  res.json({ ok: true });
});

// ═════ Страница злоумышленника evil.example ═════

// 1) Прочитать баланс НЕ получится: запрос уйдёт, но браузер не отдаст ответ,
//    потому что в Access-Control-Allow-Origin нет evil.example. Это работа same-origin policy.
fetch('https://bank.example/api/balance', { credentials: 'include' })
  .then((r) => r.json())      // ← сюда не дойдёт: ошибка CORS
  .then(console.log);

// 2) А простую форму браузер ОТПРАВИТ, приложив куки банка.
//    Ответ злоумышленник не увидит, но перевод может выполниться — это CSRF.
//    CORS здесь не участвует. Защита — SameSite=Lax/Strict у сессионной куки и CSRF-токен.
//    <form action="https://bank.example/api/transfer" method="POST">...</form>
```

---

<a id="p-2"></a>

## П-2. Установка и настройка `cors` 🔴

### Как в материале

Сказано, что существует npm-пакет с middleware для Express, который добавляет CORS-заголовки. Команда установки записана с флагом сохранения. После установки две строки в коде сервера разрешают CORS-запросы для всех origin. Упоминается, что настройками можно ограничить, кто получает доступ, и что документация есть на сайте npm.

### Пример из материала

```
npm install cors –save
```

```js
var cors = require('cors') //import the cors package.
app.use(cors()); // Add cors middleware to the express application
```

### В чём несоответствие

1. **Длинное тире вместо двух дефисов.** В команде стоит `–save` (типографское тире). npm не распознает это как флаг и попытается установить ещё один пакет с таким странным именем — команда завершится ошибкой. Флаги пишутся двумя обычными дефисами: `--save`.
2. **`--save` не нужен.** С npm 5 (2017 год) `npm install <пакет>` сам записывает зависимость в `package.json`.
3. **`cors()` без настроек разрешает всем origin** (`Access-Control-Allow-Origin: *`). Для учебного сервера на своём компьютере это допустимо, но привычка опасная: любой сайт сможет читать ответы API. Лучше сразу указать конкретный origin.
4. **`var`** — устаревший способ объявления; сейчас пишут `const`.

### Как правильно

```bash
npm install cors
```

И подключать с конкретным origin, до маршрутов.

### Пример

```js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',   // только Angular в режиме разработки
  // credentials: true,              // только если клиент отправляет куки (withCredentials: true)
}));

// Если origin несколько (например, 4200 и 4300):
// app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4300'] }));

app.use(express.json());
app.use('/api', require('./routes/groups'));   // маршруты ПОСЛЕ cors

app.listen(3000);
```

**Пояснения:**

- Порядок важен: если маршрут стоит раньше `cors`, его ответ уйдёт без заголовков.
- С `credentials: true` использовать `origin: '*'` нельзя — браузер отвергнет такой ответ.

---

<a id="p-3"></a>

## П-3. Режим разработки 🔵

### Как в материале

После подключения `cors` Angular-приложение с `localhost:4200` может обращаться к серверу на `localhost:3000`. Предлагается и дальше пользоваться удобным сервером Angular на 4200, а Node-сервер держать на 3000: Angular пересобирается при каждом сохранении. Для сервера рекомендуется nodemon — инструмент, который следит за кодом и перезапускает сервер при сохранении; вместо `node server.js` запускают `nodemon server.js`.

### Пример из материала

```bash
nodemon server.js
```

### В чём несоответствие

Совет рабочий, но упущены две современные возможности:

1. **Прокси `ng serve`.** Сервер разработки Angular может сам пересылать запросы на `/api` в Express. Тогда для браузера и страница, и API приходят с `localhost:4200` — CORS не нужен вообще, а Angular-код использует один и тот же адрес `/api` и при разработке, и при single origin.
2. **`node --watch`.** В Node.js 18.11 и новее есть встроенный режим перезапуска при изменении файлов — для простого сервера nodemon можно не устанавливать.

Кроме того, nodemon, если его используют, ставят как зависимость для разработки (`npm install -D nodemon`) и запускают через npm-скрипт, а не глобально.

### Как правильно

Для разработки — `ng serve` с прокси (или CORS) плюс автоперезапуск сервера через `node --watch` или nodemon из npm-скрипта.

### Пример

```json
// ═════ proxy.conf.json (корень Angular-проекта) ═════
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

```jsonc
// ═════ angular.json — чтобы не писать флаг каждый раз ═════
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

```jsonc
// ═════ server/package.json — скрипты сервера ═════
"scripts": {
  "start": "node server.js",
  "dev": "node --watch server.js"       // или "nodemon server.js", если nodemon в devDependencies
}
```

```ts
// ═════ Angular-сервис: один адрес для разработки и для single origin ═════
private readonly API = '/api/groups';   // не 'http://localhost:3000/api/groups'
```

**Пояснения:**

- С прокси запрос идёт так: браузер → `localhost:4200/api/groups` → сервер разработки Angular → `localhost:3000/api/groups`. Браузер видит только 4200.
- Прокси работает только в `ng serve`. В собранном приложении (single origin) адрес `/api` и так указывает на тот же сервер.

---

<a id="p-4"></a>

## П-4. Путь к `dist` 🔴

### Как в материале

Сказано, что команда `ng build` создаёт оптимизированную копию сайта в папке `/dist`, и эту папку можно сделать источником статических файлов для сервера. В коде сервера `express.static` указывает на `../dist/week5tut/`. На скриншоте структуры проекта папка `dist` лежит в корне Angular-проекта.

### Пример из материала

```js
app.use(express.static(path.join(__dirname, '../dist/week5tut/')));
```

### В чём несоответствие

С Angular 17 новые проекты собираются через application builder, и он кладёт файлы для браузера во вложенную папку: `dist/<проект>/browser/`. Если указать `dist/<проект>/`, `express.static` не найдёт там `index.html`, и на запрос к корню сервер ответит `Cannot GET /`. В старых проектах (до Angular 17) путь из материала был верным.

### Как правильно

Путь до папки, в которой после `ng build` реально лежит `index.html`. Для современных проектов — `dist/<проект>/browser`.

### Пример

```bash
# Проверить, где лежит index.html после сборки
ng build
ls dist/chat-app            # → browser/  (и, если включён SSR, ещё server/)
ls dist/chat-app/browser    # → index.html  main-*.js  styles-*.css ...
```

```js
// server/server.js
const path = require('path');

// ✅ Angular 17+
const CLIENT_DIR = path.join(__dirname, '../dist/chat-app/browser');

// ❌ Путь из материала для современных проектов: index.html здесь нет
// const CLIENT_DIR = path.join(__dirname, '../dist/chat-app/');

app.use(express.static(CLIENT_DIR));

// Самопроверка при запуске: сразу видно, если путь неверный
const fs = require('fs');
if (!fs.existsSync(path.join(CLIENT_DIR, 'index.html'))) {
  console.warn('index.html не найден в', CLIENT_DIR, '— выполни ng build или проверь путь');
}
```

---

<a id="p-5"></a>

## П-5. `body-parser` 🔵

### Как в материале

В коде сервера подключается отдельный пакет `body-parser`, создаётся его экземпляр, и `bodyParser.json()` монтируется как middleware для разбора JSON в теле запроса. Также создаётся HTTP-сервер через `require('http').Server(app)`, который потом передаётся в модуль запуска.

### Пример из материала

```js
const http = require('http').Server(app);
const bodyParser = require('body-parser');

app.use (bodyParser.json());
```

### В чём несоответствие

- С Express 4.16 разбор JSON встроен: `express.json()` делает то же, что `bodyParser.json()`, и отдельный пакет ставить не нужно. Аналогично `express.urlencoded()` заменяет `bodyParser.urlencoded()`.
- `require('http').Server(app)` для простого сервера не нужен: `app.listen(3000)` сам создаёт HTTP-сервер. Явный HTTP-сервер пригодится позже, на неделе 6: к нему подключают socket.io.

### Как правильно

`app.use(express.json())` вместо `body-parser`; `app.listen()` для обычного сервера.

### Пример

```js
const express = require('express');
const app = express();

app.use(express.json());                          // тело JSON → req.body
app.use(express.urlencoded({ extended: true }));  // тело HTML-формы → req.body (если нужны формы)

// Обычный сервер
app.listen(3000, () => console.log('http://localhost:3000'));

// Когда понадобится socket.io (неделя 6) — явный HTTP-сервер:
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);
// http.listen(3000);
```

---

<a id="p-6"></a>

## П-6. Нет fallback для маршрутов Angular 🔴

### Как в материале

Сказано, что приложение Angular — это одна страница `index.html`, и запрос к корню сайта возвращает её, то есть само приложение. Сервер раздаёт папку сборки через `express.static` и обрабатывает API-маршрут входа. Схема показывает запрос к корню и запрос к `/api/auth`.

### Пример из материала

```js
app.use(express.static(path.join(__dirname, '../dist/week5tut/')));
require('./routes/api-login.js')(app,path);
```

### В чём несоответствие

Не разобран случай, который сломается сразу: обновление страницы на маршруте Angular. Адрес `/groups/5` существует только в роутере Angular. При F5 браузер просит у сервера `GET /groups/5`, файла с таким именем в сборке нет, и Express отвечает `404 Cannot GET /groups/5`. То же при открытии такой ссылки в новой вкладке.

Нужен **fallback**: на любой `GET`, который не является API и не нашёлся среди файлов, отдавать `index.html`.

Второй подводный камень — синтаксис. Сейчас `npm install express` ставит Express 5, а в нём строка `'*'` в пути маршрута больше не работает: запись `app.get('*', ...)` падает с ошибкой при запуске. В Express 5 шаблон «любой путь» должен иметь имя: `'/{*splat}'` (фигурные скобки делают его необязательным, чтобы подходил и корень `/`).

### Как правильно

Порядок: API → статические файлы → fallback на `index.html`. Для неизвестных `/api/...` — JSON 404 до fallback, чтобы клиент не получил HTML вместо ошибки.

### Пример

```js
const express = require('express');
const path = require('path');

const app = express();
const CLIENT_DIR = path.join(__dirname, '../dist/chat-app/browser');

app.use(express.json());

// 1. API
app.use('/api', require('./routes/auth'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// 2. Файлы сборки
app.use(express.static(CLIENT_DIR));

// 3. Fallback — Express 5
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

// Для Express 4 было бы: app.get('*', ...)
// Вариант, который работает в любой версии — middleware в самом конце:
// app.use((req, res, next) => {
//   if (req.method !== 'GET') return next();
//   res.sendFile(path.join(CLIENT_DIR, 'index.html'));
// });

app.listen(3000);
```

**Пояснения:**

- Fallback обязательно последний: иначе он перехватит запросы к файлам и API.
- Проверка: открой `http://localhost:3000/groups/5` в новой вкладке — должна загрузиться страница, а не «Cannot GET».

---

<a id="p-7"></a>

## П-7. Структура проекта на скриншоте 🔵

### Как в материале

На скриншоте показан проект с сервером: в корне Angular-проекта папки `dist`, `e2e`, `node_modules`, `server`, `src` и файлы `.editorconfig`, `.gitignore`, `angular.json`, `browserslist`, `karma.conf.js`, `package.json`, `tsconfig.*.json`, `tslint.json`. Сказано, что это два проекта (сервер и фронтенд) со своими `package.json` и `node_modules`, что сборку Angular нужно использовать как источник для сервера, что после изменений Angular-кода нужно снова запускать `ng build`, и что папка сервера не обязана лежать внутри Angular-проекта — главное правильно указать путь к `dist`.

### Пример из материала

Кода нет (скриншот дерева файлов).

### В чём несоответствие

Сама идея (два проекта, свои зависимости, путь к `dist`) верна. Но дерево на скриншоте — из старых версий Angular, и в новом проекте такого не будет:

- `tslint.json` — TSLint объявлен устаревшим и убран из Angular давно; сейчас используют ESLint (добавляется отдельно).
- `e2e/` — папка для Protractor, который тоже удалён из Angular.
- `karma.conf.js` в новых проектах по умолчанию не создаётся, а в последних версиях Angular для тестов используются другие раннеры.
- `browserslist` сейчас называется `.browserslistrc` и создаётся не всегда.

Путаницы это не создаёт, пока не пытаешься найти эти файлы в своём проекте.

Также стоит добавить то, чего в материале нет: после изменений можно не запускать `ng build` каждый раз вручную, а держать `ng build --watch`.

### Как правильно

Ориентироваться на структуру своего проекта. Для Phase 2 удобно так:

### Пример

```
chat-app/
├── src/                          ← исходники Angular
├── angular.json
├── package.json                  ← зависимости Angular
├── tsconfig.json
├── .gitignore                    ← node_modules/, dist/
├── dist/chat-app/browser/        ← после ng build (в git не попадает)
└── server/
    ├── package.json              ← express, cors ...
    ├── server.js                 ← CLIENT_DIR = path.join(__dirname, '../dist/chat-app/browser')
    ├── routes/
    └── data/
```

```bash
# Два терминала при работе в режиме single origin:
ng build --watch                  # терминал 1: пересобирает Angular при сохранении
cd server && node --watch server.js   # терминал 2: перезапускает сервер при сохранении
```

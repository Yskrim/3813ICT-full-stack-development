# 5_3 — Хостинг Angular на Node-сервере: ответы

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_3-node-hosting-konspekt.md) · [поправки](5_3-node-hosting-popravki.md) · [примеры](5_3-node-hosting-primery.md) · [вопросы](5_3-node-hosting-voprosy.md)

---

## A. Origin и same-origin policy

<a id="a-1"></a>

### 1. Почему запрос блокируется

**Ответ:** страница загружена с `localhost:4200`, а API на `localhost:3000`. Порты разные — значит, это разные origin, и same-origin policy не даёт JavaScript читать ответ, пока сервер явно не разрешит это через CORS.

**Подробнее:** [Конспект §1.1](5_3-node-hosting-konspekt.md#s1-1) · [5_1: origin](5_1-data-persistence-konspekt.md#s2-2) · [← вопрос](5_3-node-hosting-voprosy.md#q-1)

<a id="a-2"></a>

### 2. Что именно блокирует браузер

**Ответ:** same-origin policy — правило браузера: JavaScript одного origin не может читать ответы на запросы к другому origin без разрешения сервера. Блокируется **чтение ответа**. Простой запрос до сервера доходит и обрабатывается, но браузер не отдаёт ответ коду. Запросы с preflight без разрешения вообще не отправляются.

**Подробнее:** [Конспект §1.2](5_3-node-hosting-konspekt.md#s1-2) · [Конспект §2.2](5_3-node-hosting-konspekt.md#s2-2) · [← вопрос](5_3-node-hosting-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Зачем нужна same-origin policy

**Ответ:** без неё любой сайт в соседней вкладке мог бы отправить запрос к твоей почте или банку (браузер приложил бы твои куки) и прочитать ответ — письма, баланс, личные данные.

**Подробнее:** [Конспект §1.2](5_3-node-hosting-konspekt.md#s1-2) · [← вопрос](5_3-node-hosting-voprosy.md#q-3)

<a id="a-4"></a>

### 4. Статус ошибки

**Ответ:** `status: 0`. Так браузер сообщает «ответа нет»: сервер не отвечает или ответ заблокирован CORS. Подробности — в консоли браузера.

**Подробнее:** [Конспект §1.2](5_3-node-hosting-konspekt.md#s1-2) · [Частые ошибки](5_3-node-hosting-primery.md#errors) · [← вопрос](5_3-node-hosting-voprosy.md#q-4)

---

## B. CORS

<a id="a-5"></a>

### 5. Что такое CORS

**Ответ:** стандарт, по которому сервер HTTP-заголовками сообщает браузеру, каким чужим origin можно читать его ответы. Главный заголовок — `Access-Control-Allow-Origin` (конкретный origin или `*`).

**Подробнее:** [Конспект §2.1](5_3-node-hosting-konspekt.md#s2-1) · [← вопрос](5_3-node-hosting-voprosy.md#q-5)

<a id="a-6"></a>

### 6. Почему в Postman работает

**Ответ:** CORS проверяет только браузер. Postman, curl и другие серверы same-origin policy не применяют и заголовки CORS игнорируют.

**Пояснение:** поэтому CORS не заменяет проверку прав на сервере — любой может отправить запрос не из браузера.

**Подробнее:** [Конспект §2.1](5_3-node-hosting-konspekt.md#s2-1) · [Конспект §2.3](5_3-node-hosting-konspekt.md#s2-3) · [← вопрос](5_3-node-hosting-voprosy.md#q-6)

<a id="a-7"></a>

### 7. Preflight

**Ответ:** простой запрос (`GET`, `HEAD`, `POST` с данными формы, без своих заголовков) браузер отправляет сразу и проверяет разрешение в ответе. Перед остальными (`PUT`, `PATCH`, `DELETE`, JSON, свои заголовки) он сначала отправляет `OPTIONS` — preflight — и шлёт настоящий запрос, только если сервер разрешил. `HttpClient` отправляет объекты как JSON, поэтому его `POST`, `PUT`, `PATCH` почти всегда идут с preflight.

**Подробнее:** [Конспект §2.2](5_3-node-hosting-konspekt.md#s2-2) · [Пример 1](5_3-node-hosting-primery.md#ex-1) · [← вопрос](5_3-node-hosting-voprosy.md#q-7)

<a id="a-8"></a>

### 8. CORS и банк

**Ответ:** неверно. CORS разрешает чтение ответов, а не защищает. Чтение ответов банка чужим сайтом запрещает same-origin policy. Перевод — это CSRF: запросу не нужно читать ответ, достаточно дойти до сервера с куками. От этого защищают `SameSite` у сессионной куки и CSRF-токены.

**Подробнее:** [Конспект §2.3](5_3-node-hosting-konspekt.md#s2-3) · [П-1](5_3-node-hosting-popravki.md#p-1) · [5_1 §7.2](5_1-data-persistence-konspekt.md#s7-2) · [← вопрос](5_3-node-hosting-voprosy.md#q-8)

<a id="a-9"></a>

### 9. Найди ошибки

**Ответ:**

1. `–save` — длинное тире вместо двух дефисов: npm не поймёт флаг. К тому же `--save` не нужен с npm 5. Правильно: `npm install cors`.
2. `cors` подключён **после** маршрута — ответ `/api/groups` уйдёт без CORS-заголовков. Middleware ставят до маршрутов.
3. `cors()` без настроек разрешает всем origin. Лучше `cors({ origin: 'http://localhost:4200' })`.

**Подробнее:** [Конспект §2.4](5_3-node-hosting-konspekt.md#s2-4) · [П-2](5_3-node-hosting-popravki.md#p-2) · [← вопрос](5_3-node-hosting-voprosy.md#q-9)

<a id="a-10"></a>

### 10. Куки и `*`

**Ответ:** браузер отвергает ответ на запрос с куками, если в `Access-Control-Allow-Origin` стоит `*`: отдавать данные пользователя «кому угодно» запрещено. Для кук нужен конкретный origin: `cors({ origin: 'http://localhost:4200', credentials: true })`.

**Подробнее:** [Конспект §2.4](5_3-node-hosting-konspekt.md#s2-4) · [← вопрос](5_3-node-hosting-voprosy.md#q-10)

---

## C. Режим разработки

<a id="a-11"></a>

### 11. Автоперезапуск сервера

**Ответ:** nodemon следит за файлами сервера и перезапускает его при сохранении, чтобы не делать это вручную. В Node.js 18.11+ есть встроенная замена: `node --watch server.js`.

**Подробнее:** [Конспект §2.5](5_3-node-hosting-konspekt.md#s2-5) · [П-3](5_3-node-hosting-popravki.md#p-3) · [← вопрос](5_3-node-hosting-voprosy.md#q-11)

<a id="a-12"></a>

### 12. Прокси

**Ответ:** сервер разработки Angular получает запросы на `/api/...` и сам пересылает их в Express на 3000, а ответ возвращает браузеру от своего имени. Браузер видит один origin (`localhost:4200`), поэтому CORS не нужен. В Angular используется относительный адрес `/api/...` — тот же, что и в собранном приложении.

**Подробнее:** [Конспект §2.5](5_3-node-hosting-konspekt.md#s2-5) · [Пример 2](5_3-node-hosting-primery.md#ex-2) · [← вопрос](5_3-node-hosting-voprosy.md#q-12)

---

## D. Single origin

<a id="a-13"></a>

### 13. `ng build`

**Ответ:** компилирует TypeScript, собирает и оптимизирует код в статические файлы. В Angular 17+ они, включая `index.html`, лежат в `dist/<проект>/browser/`.

**Подробнее:** [Конспект §3.2](5_3-node-hosting-konspekt.md#s3-2) · [П-4](5_3-node-hosting-popravki.md#p-4) · [← вопрос](5_3-node-hosting-voprosy.md#q-13)

<a id="a-14"></a>

### 14. `Cannot GET /`

**Ответ:**

1. приложение не собрано — не выполнен `ng build`;
2. путь в `express.static` указывает на `dist/<проект>/` без подпапки `browser`, и `index.html` там нет.

**Пояснение:** быстро проверить — вывести путь в консоль и посмотреть, есть ли в этой папке `index.html`.

**Подробнее:** [П-4](5_3-node-hosting-popravki.md#p-4) · [Частые ошибки](5_3-node-hosting-primery.md#errors) · [← вопрос](5_3-node-hosting-voprosy.md#q-14)

<a id="a-15"></a>

### 15. F5 на маршруте Angular

**Ответ:** `/groups/5` — маршрут роутера Angular, а не файл. При переходах внутри приложения сервер не участвует, а при F5 браузер просит у сервера `GET /groups/5`, и такого файла нет. Решение — fallback: последним обработчиком отдавать `index.html` на любой `GET`, который не попал в API и файлы. Angular загрузится и покажет нужную страницу.

**Подробнее:** [Конспект §3.5](5_3-node-hosting-konspekt.md#s3-5) · [П-6](5_3-node-hosting-popravki.md#p-6) · [Пример 3](5_3-node-hosting-primery.md#ex-3) · [← вопрос](5_3-node-hosting-voprosy.md#q-15)

<a id="a-16"></a>

### 16. Express 5 и `*`

**Ответ:** в Express 5 шаблон «любой путь» должен иметь имя; одиночная `*` вызывает ошибку разбора пути при запуске. Правильно: `app.get('/{*splat}', ...)` — фигурные скобки делают часть необязательной, поэтому подходит и `/`.

**Подробнее:** [Конспект §3.5](5_3-node-hosting-konspekt.md#s3-5) · [П-6](5_3-node-hosting-popravki.md#p-6) · [← вопрос](5_3-node-hosting-voprosy.md#q-16)

<a id="a-17"></a>

### 17. Порядок обработчиков

**Ответ:** API → `express.static` → fallback. Express проверяет обработчики по порядку, и fallback «ловит всё», поэтому он последний. `app.use('/api', ... 404 JSON)` перед fallback нужен, чтобы запрос к несуществующему API получил JSON-ошибку, а не `index.html` (иначе в Angular будет «Unexpected token '<'»).

**Подробнее:** [Конспект §3.3](5_3-node-hosting-konspekt.md#s3-3) · [Конспект §3.4](5_3-node-hosting-konspekt.md#s3-4) · [← вопрос](5_3-node-hosting-voprosy.md#q-17)

<a id="a-18"></a>

### 18. `__dirname`

**Ответ:** `__dirname` — папка текущего файла, она не меняется. `process.cwd()` — папка, из которой запустили `node`, и от неё считаются относительные пути вроде `'../dist'`. Поэтому путь строят от `__dirname`: сервер найдёт файлы, откуда бы его ни запустили. `path.join` склеивает части с правильными разделителями и понимает `..`.

**Подробнее:** [Конспект §3.6](5_3-node-hosting-konspekt.md#s3-6) · [← вопрос](5_3-node-hosting-voprosy.md#q-18)

<a id="a-19"></a>

### 19. `body-parser` и `http.Server`

**Ответ:** `bodyParser.json()` заменяет встроенный `express.json()` (с Express 4.16). Явный HTTP-сервер нужен, когда к нему подключают что-то ещё — например, socket.io на неделе 6; для обычного сервера хватает `app.listen()`.

**Подробнее:** [П-5](5_3-node-hosting-popravki.md#p-5) · [← вопрос](5_3-node-hosting-voprosy.md#q-19)

---

## E. Структура и выбор режима

<a id="a-20"></a>

### 20. Два `package.json`

**Ответ:** это два разных проекта с разными зависимостями: Angular-пакеты нужны для сборки клиента, `express` и `cors` — для сервера. В git не коммитят `node_modules/` (в обоих проектах) и `dist/`: всё это восстанавливается из исходников.

**Подробнее:** [Конспект §4](5_3-node-hosting-konspekt.md#s4) · [← вопрос](5_3-node-hosting-voprosy.md#q-20)

<a id="a-21"></a>

### 21. Какой режим когда

**Ответ:**

- **разработка** — `ng serve` + Express; адрес API `http://localhost:3000/api` с CORS или `/api` с прокси;
- **сдача и показ** — single origin: `ng build` + один Express; адрес API `/api`.

С прокси адрес `/api` одинаков в обоих режимах.

**Подробнее:** [Конспект §5](5_3-node-hosting-konspekt.md#s5) · [Схема выбора](5_3-node-hosting-primery.md#ex-0) · [← вопрос](5_3-node-hosting-voprosy.md#q-21)

<a id="a-22"></a>

### 22. Изменения не видны

**Ответ:** Express отдаёт содержимое `dist` — снимок кода на момент последней сборки. Нужно снова выполнить `ng build` или держать запущенным `ng build --watch`. Для быстрой разработки удобнее `ng serve` с прокси.

**Подробнее:** [Конспект §3.2](5_3-node-hosting-konspekt.md#s3-2) · [П-7](5_3-node-hosting-popravki.md#p-7) · [← вопрос](5_3-node-hosting-voprosy.md#q-22)

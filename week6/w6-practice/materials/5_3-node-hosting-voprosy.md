# 5_3 — Хостинг Angular на Node-сервере: вопросы для самопроверки

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_3-node-hosting-konspekt.md) · [поправки](5_3-node-hosting-popravki.md) · [примеры](5_3-node-hosting-primery.md) · [ответы](5_3-node-hosting-otvety.md)

**Как работать:** отвечай по памяти; если не знаешь — отметь «не знаю»; после каждого раздела сверяйся с ответами по ссылке «→ ответ»; ошибочные вопросы повтори через день.

---

## A. Origin и same-origin policy

<a id="q-1"></a>

### 1. Почему запрос блокируется?

Angular запущен через `ng serve`, Express — на порту 3000. Почему запрос из Angular к `http://localhost:3000/api/groups` блокируется браузером?

[→ ответ](5_3-node-hosting-otvety.md#a-1)

<a id="q-2"></a>

### 2. Что именно блокирует браузер?

Что такое same-origin policy? Что она блокирует — отправку запроса или чтение ответа? Доходит ли запрос до сервера?

[→ ответ](5_3-node-hosting-otvety.md#a-2)

<a id="q-3"></a>

### 3. Зачем нужна same-origin policy?

Приведи пример того, что могло бы случиться без неё.

[→ ответ](5_3-node-hosting-otvety.md#a-3)

<a id="q-4"></a>

### 4. Статус ошибки

Какой `status` будет у `HttpErrorResponse`, если ответ заблокирован CORS или сервер не запущен?

[→ ответ](5_3-node-hosting-otvety.md#a-4)

---

## B. CORS

<a id="q-5"></a>

### 5. Что такое CORS?

Определение одной фразой и главный заголовок.

[→ ответ](5_3-node-hosting-otvety.md#a-5)

<a id="q-6"></a>

### 6. Почему в Postman работает?

Запрос к API из Postman проходит, а из Angular в браузере — нет. Почему?

[→ ответ](5_3-node-hosting-otvety.md#a-6)

<a id="q-7"></a>

### 7. Preflight

Чем простой запрос отличается от запроса с preflight? Какие запросы Angular `HttpClient` почти всегда вызывают preflight и почему?

[→ ответ](5_3-node-hosting-otvety.md#a-7)

<a id="q-8"></a>

### 8. CORS и банк

Верно ли, что CORS защищает от сайта, который пытается от имени пользователя провести перевод в банке? Что защищает на самом деле?

[→ ответ](5_3-node-hosting-otvety.md#a-8)

<a id="q-9"></a>

### 9. Найди ошибки

```bash
npm install cors –save
```

```js
const app = express();
app.get('/api/groups', (req, res) => res.json(groups));
app.use(cors());
```

[→ ответ](5_3-node-hosting-otvety.md#a-9)

<a id="q-10"></a>

### 10. Куки и `*`

Почему не работает сочетание `withCredentials: true` на клиенте и `cors({ origin: '*', credentials: true })` на сервере?

[→ ответ](5_3-node-hosting-otvety.md#a-10)

---

## C. Режим разработки

<a id="q-11"></a>

### 11. Автоперезапуск сервера

Зачем нужен nodemon? Какая есть встроенная альтернатива в Node.js?

[→ ответ](5_3-node-hosting-otvety.md#a-11)

<a id="q-12"></a>

### 12. Прокси

Как работает прокси `ng serve`? Почему с ним не нужен CORS и какой адрес API используется в Angular-коде?

[→ ответ](5_3-node-hosting-otvety.md#a-12)

---

## D. Single origin

<a id="q-13"></a>

### 13. `ng build`

Что делает `ng build` и где в Angular 17+ окажется `index.html`?

[→ ответ](5_3-node-hosting-otvety.md#a-13)

<a id="q-14"></a>

### 14. `Cannot GET /`

Сервер запущен, но на `http://localhost:3000/` отвечает `Cannot GET /`. Назови две вероятные причины.

[→ ответ](5_3-node-hosting-otvety.md#a-14)

<a id="q-15"></a>

### 15. F5 на маршруте Angular

Внутри приложения переходы работают, но F5 на `/groups/5` даёт `Cannot GET /groups/5`. Почему и как исправить?

[→ ответ](5_3-node-hosting-otvety.md#a-15)

<a id="q-16"></a>

### 16. Express 5 и `*`

Почему `app.get('*', ...)` роняет сервер при запуске в Express 5 и как записать то же правильно?

[→ ответ](5_3-node-hosting-otvety.md#a-16)

<a id="q-17"></a>

### 17. Порядок обработчиков

В каком порядке в `server.js` должны идти маршруты API, `express.static` и fallback? Зачем перед fallback ставить `app.use('/api', ... 404 JSON)`?

[→ ответ](5_3-node-hosting-otvety.md#a-17)

<a id="q-18"></a>

### 18. `__dirname`

Чем `__dirname` отличается от `process.cwd()`? Почему путь к `dist` строят через `path.join(__dirname, ...)`?

[→ ответ](5_3-node-hosting-otvety.md#a-18)

<a id="q-19"></a>

### 19. `body-parser` и `http.Server`

Чем заменить `bodyParser.json()`? Когда действительно нужен явный `require('http').createServer(app)`?

[→ ответ](5_3-node-hosting-otvety.md#a-19)

---

## E. Структура и выбор режима

<a id="q-20"></a>

### 20. Два `package.json`

Почему у Angular-проекта и сервера разные `package.json`? Какие папки не коммитят в git?

[→ ответ](5_3-node-hosting-otvety.md#a-20)

<a id="q-21"></a>

### 21. Какой режим когда?

Какой режим использовать при разработке, а какой — при сдаче? Какой адрес API в Angular в каждом случае?

[→ ответ](5_3-node-hosting-otvety.md#a-21)

<a id="q-22"></a>

### 22. Изменения не видны

Ты поменял компонент Angular, но на `localhost:3000` всё по-старому. Почему и как это исправить?

[→ ответ](5_3-node-hosting-otvety.md#a-22)

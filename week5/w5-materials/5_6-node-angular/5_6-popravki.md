# 5_6 — Соединяем Node и Angular: поправки

**Курс:** 3813ICT, неделя 5
**Источник:** `5_6_Combine_Node_and_Angular_.pdf`
**Связанные файлы:** [конспект](5_6-node-angular-konspekt.md) · [примеры](5_6-node-angular-primery.md) · [вопросы](5_6-node-angular-voprosy.md) · [ответы](5_6-node-angular-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно и полный пример с пояснениями.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Общий `package.json` со скриншота | 🔵 | Angular 6; `@angular/http` давно удалён; `nodemon` в `dependencies` |
| [П-2](#p-2) | `server.js` | 🔴 | Путь без `browser`, `body-parser`, маршруты без `/api`, нет fallback |
| [П-3](#p-3) | Обработчик входа `postLogin` | 🔴 | Пароль в логе, глобальная `c`, `throw` в колбэке роняет сервер, путь от места запуска |
| [П-4](#p-4) | Обработчик `postLoginafter` | 🟡 | Дубли при каждом входе, ответ со всеми пользователями, доверие данным клиента |
| [П-5](#p-5) | `LoginComponent` | 🔴 | `null` в `setItem` не компилируется; пароль в `alert`; запросы в компоненте; вложенный `subscribe` |
| [П-6](#p-6) | Хранение и чтение пользователя | 🟡 | Четыре ключа вместо одной записи; компонент читает хранилище сам; новая вкладка — «не вошёл» |

---

<a id="p-1"></a>

## П-1. Общий `package.json` со скриншота 🔵

### Как в материале

Предлагается сначала создать Angular-проект, а внутри его папки — папку сервера с `server.js` и остальными файлами, чтобы отправлять на GitHub один репозиторий. По желанию сервер может использовать тот же `package.json`, тогда `npm install` запускается один раз для обоих проектов, а `express` и другие пакеты устанавливаются из корня Angular-проекта. На скриншоте `package.json` в `dependencies` видны пакеты Angular версии 6, включая `@angular/http`, а также `cors`, `express` и `nodemon`.

### Пример из материала

```json
"dependencies": {
  "@angular/animations": "^6.0.0",
  "@angular/common": "^6.0.0",
  "@angular/http": "^6.0.0",
  "cors": "^2.8.4",
  "express": "^4.16.3",
  "nodemon": "^1.18.4",
  "rxjs": "^6.0.0"
}
```

### В чём несоответствие

Идея одного репозитория и общего `package.json` рабочая. Но скриншот — из Angular 6 (2018 год):

1. **`@angular/http`** — старый HTTP-модуль, удалён из Angular в версии 8. Сейчас — `HttpClient` из `@angular/common/http` ([5_4](5_4-http-requests-konspekt.md#s4)).
2. **`nodemon` в `dependencies`.** Это инструмент разработки — он нужен только во время написания кода, поэтому место ему в `devDependencies` (`npm install -D nodemon`). Или вовсе не нужен: `node --watch` ([5_3 П-3](5_3-node-hosting-popravki.md#p-3)).
3. **Версии.** Сейчас `npm install express` поставит Express 5, у которого есть отличия (например, синтаксис `*` в маршрутах, [5_3 П-6](5_3-node-hosting-popravki.md#p-6)).

### Как правильно

Общий `package.json` — допустимо; инструменты разработки — в `devDependencies`; в README — как установить и запустить.

### Пример

```jsonc
// package.json в корне Angular-проекта (общий вариант)
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "server": "node --watch server/server.js",     // сервер с автоперезапуском
    "prod": "ng build && node server/server.js"      // собрать и запустить single origin
  },
  "dependencies": {
    "@angular/common": "^20.0.0",                   // HttpClient живёт здесь
    "@angular/core": "^20.0.0",
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "rxjs": "~7.8.0"
  },
  "devDependencies": {
    "@angular/cli": "^20.0.0"
    // "nodemon": "^3.1.0"   ← если используешь nodemon, то здесь
  }
}
```

(Номера версий — пример; в твоём проекте они будут те, что поставил CLI.)

---

<a id="p-2"></a>

## П-2. `server.js` 🔴

### Как в материале

Сервер строится на Express. Подключается `cors` для обращений с порта 4200 на порт 3000, `body-parser` для данных форм и JSON. Если хочется, чтобы свой Node-сервер отдавал Angular-страницу, нужно собрать `index.html` и указать правильный путь; на всякий случай стоит проверить `__dirname`. Сервер создаётся через `http.Server(app)` и слушает порт 3000. Маршруты `/login` и `/loginafter` подключаются из отдельных файлов.

### Пример из материала

```js
var cors = require('cors');
app.use(cors());

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/../dist/my-app'));
console.log(__dirname);

var http = require("http").Server(app);
var server = http.listen(3000, function() {
    console.log("Server listening on port: 3000");
});

app.post('/login', require('./router/postLogin'));
app.post('/loginafter', require('./router/postLoginafter'));
```

### В чём несоответствие

1. **Путь к `dist` без `browser`.** С Angular 17 `index.html` лежит в `dist/my-app/browser/` ([5_3 П-4](5_3-node-hosting-popravki.md#p-4)).
2. **Склейка пути строкой** `__dirname + '/../dist/...'` работает, но `path.join` надёжнее: правильные разделители для любой ОС.
3. **`body-parser`** не нужен — встроенные `express.json()` и `express.urlencoded()` ([5_3 П-5](5_3-node-hosting-popravki.md#p-5)).
4. **Маршруты без префикса `/api`.** У Angular тоже может быть маршрут `/login` (страница входа). Пока методы разные (`GET` страницы и `POST` API), они не пересекаются, но при добавлении fallback и новых маршрутов легко получить путаницу. Префикс `/api` чётко отделяет API от страниц и нужен для прокси.
5. **Нет fallback** — F5 на маршруте Angular даст `Cannot GET` ([5_3 П-6](5_3-node-hosting-popravki.md#p-6)).
6. **`cors()` для всех origin** — лучше указать конкретный ([5_3 П-2](5_3-node-hosting-popravki.md#p-2)).

### Как правильно

См. исправленный `server.js` в [конспекте §3](5_6-node-angular-konspekt.md#s3).

### Пример

```js
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const CLIENT_DIR = path.join(__dirname, '../dist/my-app/browser');

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));   // только если сервер принимает обычные HTML-формы

app.post('/api/login', require('./routes/login'));
app.patch('/api/users/:id/profile', require('./routes/update-profile'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use(express.static(CLIENT_DIR));
app.get('/{*splat}', (req, res) => res.sendFile(path.join(CLIENT_DIR, 'index.html')));

app.listen(3000, () => console.log('Server listening on port: 3000'));
```

---

<a id="p-3"></a>

## П-3. Обработчик входа `postLogin` 🔴

### Как в материале

Показан модуль, который экспортирует функцию `(req, res)`. Он берёт из тела имя и пароль, склеивает их и выводит в консоль, читает `users.json` (комментарий поясняет, что путь считается от места запуска `server.js`), при ошибке чтения выбрасывает её, выводит весь массив пользователей, ищет пользователя через `findIndex` по имени и паролю и отвечает `{ ok: false }` или `{ ok: true }`.

### Пример из материала

```js
var fs = require('fs');

module.exports = function(req, res) {
    var u = req.body.username;
    var p = req.body.pwd;
    c = u + p;
    console.log(c);
    fs.readFile('./server/data/users.json', 'utf8', function(err, data) {
        // the above path is with respect to where we run server.js
        if (err) throw err;
        let userArray = JSON.parse(data);
        console.log(userArray);
        let i = userArray.findIndex(user =>
            ((user.username == u) && (user.pwd == p)));
        if (i == -1) {
            res.send({ "ok": false });
        } else {
            console.log(userArray[i]);
            res.send({ "ok": true });
        }
    });
}
```

### В чём несоответствие

1. **Пароль в логе.** `console.log(u + p)` выводит имя и пароль в консоль сервера; `console.log(userArray)` — пароли всех пользователей. Логи часто хранятся и пересылаются — пароли в них не пишут никогда.
2. **`c = u + p` — глобальная переменная.** Без `let`/`const` присваивание создаёт глобальную переменную (а в строгом режиме — ошибку `ReferenceError`). Она общая для всех запросов.
3. **`throw err` внутри колбэка роняет весь сервер.** Исключение в асинхронном колбэке никто не перехватит: процесс Node завершится, и сервер перестанет работать для **всех** пользователей. Нужно ответить клиенту `500`.
4. **Путь от места запуска.** `'./server/data/users.json'` считается от `process.cwd()`; при запуске из папки `server` файл не найдётся ([конспект §4.3](5_6-node-angular-konspekt.md#s4-3)).
5. **`==` вместо `===`.** Нестрогое сравнение приводит типы; для проверки пароля нужно строгое.
6. **Ответ `200 { ok: false }`** при неверном входе. Так можно, но HTTP для этого предусматривает `401`; тогда `HttpClient` сам передаст неудачу в `error`, и клиент отличит «неверный пароль» от «сервер упал».
7. **Клиент не получает профиль.** Из-за этого в материале данные профиля берутся из формы ([П-5](#p-5)). Сервер должен вернуть найденного пользователя — без пароля.
8. Пароли хранятся открытым текстом — для учебного проекта допустимо, в реальном хранят хэш (например, bcrypt).

### Как правильно

Асинхронное чтение через `fs/promises` в `try/catch`, путь от `__dirname`, строгое сравнение, коды `400`/`401`/`500`, ответ с профилем без пароля, никаких паролей в логе.

### Пример

См. исправленный обработчик в [конспекте §4.1](5_6-node-angular-konspekt.md#s4-1). Здесь — как на это изменение реагирует клиент:

```ts
// ✅ С кодом 401 неудачный вход приходит в error, а не в next
this.http.post<{ ok: boolean; user: UserProfile }>('/api/login', { username, pwd }).subscribe({
  next: (res) => {
    // сюда попадаем только при успехе: res.user — профиль с сервера
  },
  error: (err: HttpErrorResponse) => {
    if (err.status === 401) { /* неверное имя или пароль */ }
    else if (err.status === 400) { /* не заполнены поля */ }
    else { /* 500 или 0: сервер не справился или недоступен */ }
  },
});

// ❌ Как в материале: неудача и успех оба в next, проверка data.ok,
//    а ошибки сети вообще не обрабатываются
```

---

<a id="p-4"></a>

## П-4. Обработчик `postLoginafter` 🟡

### Как в материале

Показан второй маршрут: из тела запроса собирается объект пользователя (id, имя, дата рождения, возраст), читается `extendedUsers.json`, объект добавляется в конец массива, массив превращается в строку и записывается в тот же файл, а клиенту отправляется весь массив. Сказано, что параметры `req` и `res` описывают, как получить данные от фронтенда и как ответить ему.

### Пример из материала

```js
module.exports = function(req, res) {
    let userobj = {
        "userid": req.body.userid,
        "username": req.body.username,
        "userbirthdate": req.body.userbirthdate,
        "userage": req.body.userage
    }
    let uArray = [];
    fs.readFile('server/data/extendedUsers.json', 'utf8', function(err, data) {
        if (err) throw err;
        uArray = JSON.parse(data);
        uArray.push(userobj);
        console.log(userobj);

        uArrayjson = JSON.stringify(uArray);
        fs.writeFile('server/data/extendedUsers.json', uArrayjson, 'utf-8', function(err) {
            if (err) throw err;
            res.send(uArray);
        });
    });
}
```

### В чём несоответствие

Схема «прочитать → изменить → записать» верная, но:

1. **Дубли.** Клиент вызывает этот маршрут после каждого входа, и `push` каждый раз добавляет **новую копию** пользователя. Через десять входов в файле десять одинаковых записей.
2. **Ответ со всеми пользователями.** Клиент получает весь массив — данные всех зарегистрированных людей. Отвечать нужно только тем, что нужно этому клиенту.
3. **Доверие данным клиента.** Сервер записывает любые `userid`, имя и возраст, которые прислали. Любой может отправить запрос с чужим `id` или произвольным возрастом. Данные нужно проверять, а личность — определять на сервере.
4. **`uArrayjson` без объявления** — глобальная переменная, как `c` в [П-3](#p-3).
5. **`throw err` в колбэках** роняет сервер ([П-3](#p-3)).
6. **Одновременные запросы.** Если два запроса одновременно прочитают файл, изменят и запишут, второй затрёт изменения первого. Для учебного проекта это редкость, но записи лучше выполнять по очереди ([пример 2](5_6-node-angular-primery.md#ex-2)).
7. **Два файла с данными одного пользователя** (`users.json` и `extendedUsers.json`) — источник рассинхронизации. Проще хранить профиль в одной записи.

### Как правильно

Обновлять **существующую** запись по `id` (`PATCH`), проверять данные, отвечать только обновлённым профилем без пароля, ловить ошибки.

### Пример

См. исправленный обработчик `update-profile.js` в [конспекте §4.2](5_6-node-angular-konspekt.md#s4-2) и очередь записи в [примере 2](5_6-node-angular-primery.md#ex-2).

```js
// Коротко, в чём разница:

// ❌ push — новая копия при каждом вызове
uArray.push(userobj);

// ✅ найти существующую запись и изменить только пришедшие поля
const user = users.find((u) => u.userid === id);
if (!user) return res.status(404).json({ error: 'User not found' });
if (userage !== undefined) user.userage = userage;

// ❌ ответ — весь массив
res.send(uArray);

// ✅ ответ — только этот профиль, без пароля
const { pwd: _omit, ...profile } = user;
res.json(profile);
```

---

<a id="p-5"></a>

## П-5. `LoginComponent` 🔴

### Как в материале

Показан компонент входа: адрес сервера и заголовки вынесены в константы; в классе два объекта — имя и пароль (заполнены по умолчанию реальным на вид email и паролем) и профиль (id, имя, дата рождения `null`, возраст 100). Метод `loginfunc()` отправляет `POST /login`, показывает `alert` с именем и паролем, при `data.ok` кладёт четыре поля профиля в sessionStorage, отправляет второй запрос `/loginafter` с профилем и переходит на `account`, иначе показывает `alert` об ошибке. Шаблон связывает поля с объектами через `[(ngModel)]`, кнопка вызывает `loginfunc()`.

### Пример из материала

```ts
userpwd: Userpwd = {username: 'k.su@griffith.edu.au', pwd: '666666'};
userobj: Userobj = {userid: 1 , username: this.userpwd.username, userbirthdate: null, userage: 100};

public loginfunc() {
  this.httpClient.post(BACKEND_URL + '/login', this.userpwd,  httpOptions)
    .subscribe((data: any) => {
      alert(JSON.stringify(this.userpwd));
      if (data.ok) {
        sessionStorage.setItem('userid', this.userobj.userid.toString());
        sessionStorage.setItem('username', this.userobj.username);
        sessionStorage.setItem('userbirthdate', this.userobj.userbirthdate);
        sessionStorage.setItem('userage', this.userobj.userage.toString());
        this.httpClient.post<Userobj[]>(BACKEND_URL + '/loginafter', this.userobj,  httpOptions)
          .subscribe((m: any) => {console.log(m[0]);});
        this.router.navigateByUrl('account');
      } else {
        alert('Sorry, uername or password is not valid');
      }
    });
}
```

### В чём несоответствие

1. **`setItem` с `null` не компилируется.** `userbirthdate` имеет значение `null`, а `setItem` принимает только `string`. В строгом режиме TypeScript — ошибка компиляции; в JavaScript в хранилище окажется строка `"null"` ([5_1 П-2](5_1-data-persistence-popravki.md#p-2)).
2. **Пароль в `alert`.** `alert(JSON.stringify(this.userpwd))` показывает пароль на экране.
3. **Учётные данные в коде.** Заполненные по умолчанию email и пароль попадают в репозиторий и в собранное приложение.
4. **Запросы прямо в компоненте.** Работа с сервером и хранилищем должна жить в сервисе ([5_2 §7](5_2-services-konspekt.md#s7)).
5. **Подписка внутри подписки.** Второй запрос отправляется из `next` первого; ошибки второго никто не обрабатывает. Если второй запрос действительно нужен — `switchMap` ([5_4, пример 2](5_4-http-requests-primery.md#ex-2)).
6. **Нет обработки ошибок.** Если сервер недоступен, `subscribe` без `error` молча ничего не сделает — пользователь не поймёт, что случилось.
7. **Профиль из формы, а не с сервера.** Дата рождения и возраст берутся из полей формы входа, а `userid` — вообще константа `1`. Данные пользователя должен присылать сервер.
8. **`data: any`** отключает проверку типов; **`httpOptions` с `Content-Type`** не нужен — `HttpClient` ставит его сам; неиспользуемые импорты (`ViewChild`, `NgForm`, `USERPWDS`).
9. **Кнопка без `<form>`** — вход не срабатывает по Enter; в standalone-компоненте для `[(ngModel)]` нужен `FormsModule` в `imports`.

### Как правильно

Сервис `AuthService` отправляет запрос, берёт профиль из ответа и сохраняет его одной JSON-записью; компонент с `<form (ngSubmit)>` вызывает сервис и обрабатывает `error`.

### Пример

См. исправленные `AuthService` и `LoginComponent` в [конспекте §5.2](5_6-node-angular-konspekt.md#s5-2). Ключевые отличия в одном месте:

```ts
// ✅ Поля пустые — никаких учётных данных в коде
username = '';
pwd = '';

// ✅ Компонент вызывает сервис и обрабатывает обе ветки
login(): void {
  this.auth.login(this.username, this.pwd).subscribe({
    next: () => this.router.navigateByUrl('/account'),
    error: (err: HttpErrorResponse) =>
      (this.error = err.status === 401 ? 'Неверное имя или пароль' : 'Не удалось войти'),
  });
}

// ✅ В сервисе: профиль из ответа сервера, одна JSON-запись
return this.http.post<LoginResponse>('/api/login', { username, pwd }).pipe(
  map((res) => res.user),
  tap((user) => sessionStorage.setItem('currentUser', JSON.stringify(user))),
);
```

---

<a id="p-6"></a>

## П-6. Хранение и чтение пользователя 🟡

### Как в материале

После входа четыре поля пользователя сохраняются в sessionStorage отдельными ключами. На другой странице (`Page2Component`) каждое поле класса читает свой ключ из sessionStorage, чтобы показать данные списком или таблицей.

### Пример из материала

```ts
export class Page2Component implements OnInit {
  userid = sessionStorage.getItem('userid');
  username = sessionStorage.getItem('username');
  birthdate = sessionStorage.getItem('userbirthdate');
  userage =  sessionStorage.getItem('userage');
  constructor() { }
  ngOnInit() {}
}
```

### В чём несоответствие

1. **Четыре ключа вместо одной записи.** Каждое значение хранится и читается отдельно, всё превращается в строки (`userage` — `"100"`, а не число), а при выходе нужно не забыть удалить все четыре. Проще и надёжнее — один ключ с JSON-объектом ([5_1 §3.4](5_1-data-persistence-konspekt.md#s3-4)).
2. **Компонент сам читает хранилище.** Каждая страница знает, как устроено хранение. Если изменится ключ или хранилище, придётся править все страницы. Это задача сервиса.
3. **Новая вкладка — «не вошёл».** sessionStorage у каждой вкладки свой ([5_1 §4](5_1-data-persistence-konspekt.md#s4)). Если открыть страницу аккаунта в новой вкладке или по ссылке, все поля будут `null`. Для учебного проекта это может быть приемлемо, но выбор должен быть осознанным: localStorage общий для вкладок и переживает закрытие браузера.
4. **Нет проверки входа.** Если пользователь не вошёл, страница покажет пустые поля вместо перенаправления на вход — для этого есть гарды ([5_1, пример 1](5_1-data-persistence-primery.md#ex-1)).

### Как правильно

Сервис хранит пользователя одной JSON-записью и отдаёт его сигналом; страницы читают сигнал; доступ закрывается гардом; тип хранилища выбирается под задачу.

### Пример

```ts
// ═════ Выбор хранилища — одно место в сервисе ═════
// sessionStorage: вход живёт в одной вкладке, закрыл вкладку — вышел
// localStorage:   вход общий для всех вкладок и переживает закрытие браузера
private readonly storage: Storage = sessionStorage;   // или localStorage

// ═════ Страница читает сервис, а не хранилище ═════
@Component({
  selector: 'app-account',
  template: `
    @if (auth.currentUser(); as user) {
      <p>{{ user.username }}, возраст: {{ user.userage ?? '—' }}</p>
    }
  `,
})
export class AccountComponent {
  protected auth = inject(AuthService);
}

// ═════ Доступ только после входа — гард ═════
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.currentUser() !== null || inject(Router).createUrlTree(['/login']);
};
// { path: 'account', component: AccountComponent, canActivate: [authGuard] }
```

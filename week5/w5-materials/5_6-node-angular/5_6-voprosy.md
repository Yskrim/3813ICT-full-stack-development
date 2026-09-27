# 5_6 — Соединяем Node и Angular: вопросы для самопроверки

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_6-node-angular-konspekt.md) · [поправки](5_6-node-angular-popravki.md) · [примеры](5_6-node-angular-primery.md) · [ответы](5_6-node-angular-otvety.md)

**Как работать:** отвечай по памяти; для кода — сначала найди проблему сам; если не знаешь — отметь «не знаю»; после каждого раздела сверяйся с ответами; ошибочные вопросы повтори через день.

---

## A. Структура проекта

<a id="q-1"></a>

### 1. Один репозиторий

Как объединить Angular-клиент и Node-сервер в один репозиторий и зачем это делать?

[→ ответ](5_6-node-angular-otvety.md#a-1)

<a id="q-2"></a>

### 2. Общий `package.json`

Какие плюсы и минусы у общего `package.json` для клиента и сервера? Куда ставить `nodemon`?

[→ ответ](5_6-node-angular-otvety.md#a-2)

<a id="q-3"></a>

### 3. Что устарело в `package.json`

В `dependencies` со скриншота материала есть `"@angular/http": "^6.0.0"` и `"nodemon": "^1.18.4"`. Что с ними не так?

[→ ответ](5_6-node-angular-otvety.md#a-3)

---

## B. Сервер

<a id="q-4"></a>

### 4. Проблемы `server.js`

```js
app.use(express.static(__dirname + '/../dist/my-app'));
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.post('/login', require('./router/postLogin'));
```

Назови четыре проблемы для современного проекта.

[→ ответ](5_6-node-angular-otvety.md#a-4)

<a id="q-5"></a>

### 5. Обработчик в отдельном файле

Что экспортирует модуль в записи `app.post('/login', require('./router/postLogin'))`? Чем этот приём отличается от `express.Router()`?

[→ ответ](5_6-node-angular-otvety.md#a-5)

<a id="q-6"></a>

### 6. `c = u + p`

```js
var u = req.body.username;
var p = req.body.pwd;
c = u + p;
console.log(c);
```

Назови две проблемы.

[→ ответ](5_6-node-angular-otvety.md#a-6)

<a id="q-7"></a>

### 7. `throw` в колбэке

Что произойдёт с сервером, если в `fs.readFile(..., function (err, data) { if (err) throw err; ... })` файл не прочитается? Как правильно?

[→ ответ](5_6-node-angular-otvety.md#a-7)

<a id="q-8"></a>

### 8. Путь к файлу данных

Путь `'./server/data/users.json'` считается от чего? Когда он сломается и как записать его надёжно?

[→ ответ](5_6-node-angular-otvety.md#a-8)

<a id="q-9"></a>

### 9. `200 { ok: false }` или `401`

Сервер при неверном пароле отвечает `200 { ok: false }`. Что изменится, если отвечать `401`? Как поменяется код клиента?

[→ ответ](5_6-node-angular-otvety.md#a-9)

<a id="q-10"></a>

### 10. Что вернуть при входе

Что сервер должен вернуть клиенту при успешном входе? Почему нельзя вернуть найденный объект пользователя как есть?

[→ ответ](5_6-node-angular-otvety.md#a-10)

<a id="q-11"></a>

### 11. Проблемы `postLoginafter`

Обработчик при каждом входе читает `extendedUsers.json`, делает `push` присланного объекта, записывает файл и отвечает всем массивом. Назови три проблемы.

[→ ответ](5_6-node-angular-otvety.md#a-11)

<a id="q-12"></a>

### 12. Одновременная запись

Два запроса одновременно выполняют «прочитать файл → изменить массив → записать файл». Что может случиться? Как этого избежать?

[→ ответ](5_6-node-angular-otvety.md#a-12)

---

## C. Клиент

<a id="q-13"></a>

### 13. Проблемы `LoginComponent`

В компоненте входа из материала: заполненные по умолчанию email и пароль, `alert(JSON.stringify(this.userpwd))`, запрос прямо в компоненте, второй запрос внутри `subscribe` первого, нет обработчика ошибок. Объясни, чем плох каждый пункт.

[→ ответ](5_6-node-angular-otvety.md#a-13)

<a id="q-14"></a>

### 14. `setItem` с `null`

```ts
userobj = { userid: 1, username: 'anna', userbirthdate: null, userage: 100 };
sessionStorage.setItem('userbirthdate', this.userobj.userbirthdate);
```

Что будет в TypeScript со строгими настройками? А в обычном JavaScript?

[→ ответ](5_6-node-angular-otvety.md#a-14)

<a id="q-15"></a>

### 15. Одна запись или четыре ключа

Почему лучше хранить пользователя одной JSON-записью, а не четырьмя ключами `userid`, `username`, `userbirthdate`, `userage`?

[→ ответ](5_6-node-angular-otvety.md#a-15)

<a id="q-16"></a>

### 16. Откуда брать профиль

В материале дата рождения и возраст берутся из полей формы входа, а `userid` — константа `1`. Почему профиль должен приходить с сервера?

[→ ответ](5_6-node-angular-otvety.md#a-16)

<a id="q-17"></a>

### 17. `httpOptions` с `Content-Type`

Нужен ли `const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }` для `post` с объектом?

[→ ответ](5_6-node-angular-otvety.md#a-17)

---

## D. Другая страница и весь поток

<a id="q-18"></a>

### 18. `Page2Component`

```ts
export class Page2Component {
  userid = sessionStorage.getItem('userid');
  userage = sessionStorage.getItem('userage');
}
```

Какие у этого подхода проблемы и как сделать лучше?

[→ ответ](5_6-node-angular-otvety.md#a-18)

<a id="q-19"></a>

### 19. Новая вкладка

Пользователь вошёл, а потом открыл страницу аккаунта в новой вкладке — и там он «не вошёл». Почему? Какие есть варианты?

[→ ответ](5_6-node-angular-otvety.md#a-19)

<a id="q-20"></a>

### 20. Весь поток

Опиши по шагам путь от нажатия «Войти» до показа страницы аккаунта в исправленной версии.

[→ ответ](5_6-node-angular-otvety.md#a-20)

<a id="q-21"></a>

### 21. Роль на сервере

Суперадмин создаёт пользователей. Почему сервер должен брать роль отправителя из своих данных, а не из того, что прислал клиент?

[→ ответ](5_6-node-angular-otvety.md#a-21)

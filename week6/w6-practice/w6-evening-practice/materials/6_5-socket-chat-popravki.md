# 6_5 — Чат на Socket.IO, Node и Angular: поправки

**Курс:** 3813ICT, неделя 6
**Источник:** `6_5-sockets-coding-example.pdf`
**Связанные файлы:** [конспект](6_5-socket-chat-konspekt.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: серверный код запущен с `socket.io` 4.8.3, `socket.io-client` 4.8.3 и Express 5 — отдельно исходная и исправленная версии, с настоящими клиентами. Результаты ниже — реальные.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Пакет для клиента | 🔴 | На клиенте нужен `socket.io-client`, а не `socket.io`; `–save` с длинным тире |
| [П-2](#p-2) | `listen.js` с параметром `app` | 🟡 | Работает только потому, что передан HTTP-сервер; `app.listen` ломает Socket.IO |
| [П-3](#p-3) | «io.emit — всем другим клиентам» | 🟡 | `io.emit` — всем, включая отправителя; без него — `socket.broadcast.emit` |
| [П-4](#p-4) | Настройка через `app.module.ts` | 🔵 | В standalone-проекте — `imports` компонента, `@for`, без `providers` для сервиса |
| [П-5](#p-5) | `ChatComponent` | 🔴 | Не компилируется (`onMessage`, `private chat()`, `null`) и не отписывается |
| [П-6](#p-6) | Стиль сервера | 🔵 | Документация v4 создаёт сервер через `new Server`; нет `disconnect` и проверки данных |

---

<a id="p-1"></a>

## П-1. Пакет для клиента 🔴

### Как в материале

В списке пакетов для клиента указаны `socket.io` и `bootstrap`, и команда установки на клиенте — `npm install socket.io bootstrap –save`. На сервере — `npm install express cors socket.io –save`. При этом код клиента импортирует функцию из `'socket.io-client'`. Приложение запускается командой `ng serve –open`.

### Пример из материала

```
npm install socket.io bootstrap –save
ng serve –open
```

### В чём несоответствие

1. **`socket.io` — серверный пакет.** Клиентская часть — отдельный пакет `socket.io-client`. Серверный пакет v4 не содержит `socket.io-client` в зависимостях (проверено: у `socket.io@4.8.3` зависимости — `accepts`, `base64id`, `cors`, `debug`, `engine.io`, `socket.io-adapter`, `socket.io-parser`). Поэтому после установки `socket.io` в Angular-проекте импорт `from 'socket.io-client'` не найдёт модуль, а в сборку ещё и попадёт ненужный серверный код.
2. **`–save` с длинным тире** вместо `--save`: npm воспримет это как имя пакета, и команда завершится ошибкой. Флаг к тому же не нужен — npm сохраняет зависимости сам с версии 5. То же с `ng serve –open` — правильно `ng serve --open` (или `ng serve -o`).

### Как правильно

```bash
# сервер
npm install express cors socket.io
# клиент (Angular)
npm install socket.io-client bootstrap
```

### Пример

```bash
cd server
npm init -y
npm install express cors socket.io

cd ../chat            # Angular-проект
npm install socket.io-client bootstrap
ng serve --open
```

```ts
// Клиент импортирует из socket.io-client
import { io, Socket } from 'socket.io-client';
```

**Источник:** [Socket.IO — Client Installation](https://socket.io/docs/v4/client-installation/) · [Socket.IO — Server Installation](https://socket.io/docs/v4/server-installation/)

---

<a id="p-2"></a>

## П-2. `listen.js` с параметром `app` 🟡

### Как в материале

Сервер разбит на три файла. В `listen.js` экспортируется функция `listen(app, PORT)`, которая вызывает `app.listen(PORT, ...)` и выводит время запуска. В `server.js` она вызывается как `server.listen(http, PORT)`, где `http` — HTTP-сервер, созданный из Express-приложения, к которому привязан Socket.IO.

### Пример из материала

```js
// listen.js
module.exports = {
    listen: function(app, PORT){
        app.listen(PORT,()=>{ /* ... */ });
    }
}

// server.js
const http = require('http').Server(app);
const io = require('socket.io')(http, { /* ... */ });
server.listen(http, PORT);
```

### В чём несоответствие

Код работает, потому что в функцию передан **HTTP-сервер** `http`, и вызывается `http.listen`. Но параметр назван `app`, и это ловушка: если, следуя названию, передать туда Express-приложение, `app.listen()` создаст **новый** HTTP-сервер, к которому Socket.IO не привязан. Клиенты не смогут подключиться, а HTTP-маршруты при этом будут работать — ошибку трудно понять.

Документация Socket.IO прямо предупреждает: при использовании с Express вызов `app.listen(3000)` не сработает, потому что создаёт новый HTTP-сервер.

Проверено запуском:

```
require('socket.io')(http) + http.listen   → подключился
new Server(httpServer) + httpServer.listen → подключился
new Server(httpServer) + app.listen        → ошибка подключения: xhr poll error
```

### Как правильно

Слушать тот HTTP-сервер, к которому привязан Socket.IO, и называть переменные так, чтобы это было видно.

### Пример

```js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);        // один сервер на всё
const io = new Server(httpServer);

// ✅
httpServer.listen(3000);

// ❌ создаст второй HTTP-сервер — Socket.IO на нём не работает
// app.listen(3000);
```

**Источник:** [Socket.IO — Server Initialization, раздел «With Express»](https://socket.io/docs/v4/server-initialization/)

---

<a id="p-3"></a>

## П-3. «io.emit — всем другим клиентам» 🟡

### Как в материале

Сказано, что при получении события подключения сокет начинает отвечать на события `message` и рассылает данные **всем другим** подключённым клиентам методом `io.emit`. В коде: `socket.on('message', (message) => { io.emit('message', message); })`.

### Пример из материала

```js
socket.on('message',(message)=>{
    io.emit('message', message);
})
```

### В чём несоответствие

`io.emit` отправляет событие **всем** подключённым клиентам, **включая отправителя**. Отправить всем, кроме отправителя, — это `socket.broadcast.emit`. Для чата из материала `io.emit` — правильный выбор: отправитель видит своё сообщение в ленте, пришедшим с сервера. Но формулировка «всем другим» приведёт к ошибке, когда понадобится именно рассылка без отправителя (например, уведомление «ben печатает…»).

Проверено тремя клиентами A, B, C (сообщения отправлял A):

```
io.emit           → A, B, C
socket.broadcast  → B, C
```

### Как правильно

| Вызов | Кто получит |
|---|---|
| `socket.emit(...)` | только этот клиент |
| `io.emit(...)` | все клиенты, включая отправителя |
| `socket.broadcast.emit(...)` | все, кроме отправителя |

### Пример

```js
io.on('connection', (socket) => {
  // Сообщение чата — всем, включая отправителя (он увидит его в ленте)
  socket.on('message', (text) => io.emit('message', text));

  // «Печатает…» — всем, кроме того, кто печатает
  socket.on('typing', (name) => socket.broadcast.emit('typing', name));

  // Приветствие — только новому клиенту
  socket.emit('message', 'Добро пожаловать в чат');
});
```

**Источник:** [Socket.IO — Emit cheatsheet](https://socket.io/docs/v4/emit-cheatsheet/) · [Socket.IO — Broadcasting events](https://socket.io/docs/v4/broadcasting-events/)

---

<a id="p-4"></a>

## П-4. Настройка через `app.module.ts` 🔵

### Как в материале

Предлагается импортировать `FormsModule` и `CommonModule` и добавить их в массив `imports` в `app.module.ts` (первый — для `[(ngModel)]`, второй — для структурных директив вроде `*ngFor`), а `SocketService` — в массив `providers`. В `chat.component.html` сообщения выводятся через `*ngFor`. Дополнительно в `app.component.html` предлагается оставить заголовок `Welcome to {{title}}` и `<router-outlet>`.

### Пример из материала

```ts
@NgModule({
  declarations: [AppComponent, ChatComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, CommonModule],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### В чём несоответствие

Это настройка для приложений на NgModule. Новые проекты Angular (с версии 19 — по умолчанию) создаются со standalone-компонентами, и файла `app.module.ts` в них нет:

1. `FormsModule` подключается в `imports` **самого компонента**, который использует `ngModel`.
2. `CommonModule` для списка не нужен: встроенный `@for` работает без импорта, а `*ngFor` в standalone-компоненте требует импорта `NgFor` ([5_5 П-7](5_5-templating-popravki.md#p-7)).
3. `SocketService` объявлен с `providedIn: 'root'` — добавлять его ещё и в `providers` не нужно: он уже зарегистрирован в корневом инжекторе ([5_2 §3.1](5_2-services-konspekt.md#s3-1)).
4. Маршруты задаются в `app.routes.ts` через `provideRouter`, а не в `AppRoutingModule`.

### Как правильно

Standalone-компонент с `imports: [FormsModule]`, `@for` в шаблоне, маршрут в `app.routes.ts`.

### Пример

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
export const routes: Routes = [{ path: '', component: ChatComponent }];

// src/app/chat/chat.component.ts
@Component({
  selector: 'app-chat',
  imports: [FormsModule],       // ngModel и ngSubmit; для @for импорт не нужен
  templateUrl: './chat.component.html',
})
export class ChatComponent { /* ... */ }

// SocketService: @Injectable({ providedIn: 'root' }) — и больше нигде не регистрируется
```

**Источник:** [Angular — Standalone components / imports](https://angular.dev/guide/components/importing) · [Angular — Control flow](https://angular.dev/guide/templates/control-flow) · [Angular — Dependency injection, providedIn](https://angular.dev/guide/di/creating-injectable-service)

---

<a id="p-5"></a>

## П-5. `ChatComponent` 🔴

### Как в материале

Компонент хранит текст поля (`messagecontent`), массив сообщений и `ioConnection`. В `ngOnInit` вызывает `initIoConnection()`: инициализирует сокет и подписывается на `onMessage()`, добавляя каждое сообщение в массив. Метод `chat()` проверяет, что текст есть, отправляет его через сервис и присваивает полю `null`. Шаблон вызывает `chat()` по клику и выводит сообщения через `*ngFor`.

### Пример из материала

```ts
ioConnection:any;

private initIoConnection(){
  this.socketService.initSocket();
  this.ioConnection = this.socketService.onMessage()
    .subscribe((message:string) => {
      this.messages.push(message);
    });
}
private chat(){
  if(this.messagecontent){
    this.socketService.send(this.messagecontent);
    this.messagecontent=null;
  }else{
    console.log("no message");
  }
}
```

```html
<button (click)="chat()" class="btn btn-primary"> Send </button>
...
<li *ngFor="let  m of messages">{{m}}</li>
```

### В чём несоответствие

1. **`onMessage()` не существует** — в `SocketService` из того же материала метод называется `getMessage()`. Ошибка компиляции.
2. **`private chat()` вызывается из шаблона.** Шаблону доступны только `public` и `protected` члены; с `private` компиляция шаблона падает ([5_2 П-6](5_2-services-popravki.md#p-6)).
3. **`this.messagecontent = null`** — поле объявлено как `string`, и в строгом режиме `null` ему не присвоить. Очищают пустой строкой.
4. **Подписка не отменяется, сокет не отключается.** `ioConnection` сохранён, но нигде не используется; функция отключения, которую возвращает `initSocket()`, тоже. Поток сообщений бесконечный, поэтому при каждом заходе на страницу чата добавляется подписка и слушатель — сообщения начинают дублироваться ([6_4 П-5, П-6](6_4-socket-observable-popravki.md#p-5)).
5. **Мелочи шаблона:** `<li>` вне `<ul>` и вне контейнера; кнопка внутри `<form>` без `(ngSubmit)` — Enter не отправляет сообщение единообразно с кнопкой.

### Как правильно

Метод с правильным именем, `protected chat()`, пустая строка вместо `null`, `takeUntilDestroyed` для подписки, форма с `(ngSubmit)`, список в `<ul>` через `@for`.

### Пример

См. исправленный компонент в [конспекте §6.2](6_5-socket-chat-konspekt.md#s6-2). Ключевые строки:

```ts
constructor() {
  this.socketService.initSocket();
  this.socketService.getMessages()                  // ✅ имя как в сервисе
    .pipe(takeUntilDestroyed())                     // ✅ отписка при уничтожении
    .subscribe((m) => this.messages.update((list) => [...list, m]));
}

protected chat(): void {                            // ✅ доступен шаблону
  const text = this.messagecontent.trim();
  if (!text) return;
  this.socketService.send(text);
  this.messagecontent = '';                         // ✅ не null
}
```

```html
<form (ngSubmit)="chat()">...</form>
<ul>
  @for (m of messages(); track $index) { <li>{{ m }}</li> }
</ul>
```

**Источник:** [Angular — takeUntilDestroyed](https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed) · [Angular — Binding dynamic text, properties and attributes (доступ шаблона к членам класса)](https://angular.dev/guide/templates/binding) · [TypeScript — strictNullChecks](https://www.typescriptlang.org/tsconfig/#strictNullChecks)

---

<a id="p-6"></a>

## П-6. Стиль сервера 🔵

### Как в материале

Сервер Socket.IO создаётся вызовом модуля как функции: `require('socket.io')(http, { cors: {...} })`. В обработчике подключения сервер слушает только `message` и сразу пересылает полученное всем.

### Пример из материала

```js
const io = require('socket.io')(http,{
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    }
});
```

### В чём несоответствие

1. **Стиль инициализации.** Вызов модуля как функции в v4 по-прежнему работает (проверено), но текущая документация Socket.IO создаёт сервер через класс: `const { Server } = require('socket.io'); const io = new Server(httpServer, options)`. Так же выглядят примеры для ES-модулей и TypeScript, и это единообразно с клиентским `import { io }`.
2. **Нет обработчика `disconnect`.** Сервер не узнаёт об уходе клиентов — пригодится для списка «кто в сети» и очистки данных.
3. **Нет проверки данных.** Сервер пересылает всем что угодно: объект, число, пустую строку, очень длинный текст. Сервер не должен доверять клиенту — проверка нужна до рассылки.
4. `app.use(cors())` без настроек разрешает всем origin ([5_3 П-2](5_3-node-hosting-popravki.md#p-2)); CORS для Socket.IO задаётся отдельно, в опциях сервера, — это в материале сделано верно.

### Как правильно

`new Server(httpServer, { cors })`, обработчики `message` с проверкой и `disconnect`.

### Пример

```js
const { Server } = require('socket.io');

const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:4200' },
});

io.on('connection', (socket) => {
  socket.on('message', (message) => {
    if (typeof message !== 'string') return;          // только строки
    const text = message.trim().slice(0, 1000);       // без пробелов по краям, не длиннее 1000
    if (!text) return;                                // пустые не рассылаем
    io.emit('message', text);
  });

  socket.on('disconnect', (reason) => {
    console.log(socket.id, 'отключился:', reason);
  });
});

// Проверено: '  Привет  ' → разослано 'Привет'; '   ' и 42 → не разосланы
```

**Источник:** [Socket.IO — Server Initialization](https://socket.io/docs/v4/server-initialization/) · [Socket.IO — Server API](https://socket.io/docs/v4/server-api/) · [Socket.IO — Handling CORS](https://socket.io/docs/v4/handling-cors/)

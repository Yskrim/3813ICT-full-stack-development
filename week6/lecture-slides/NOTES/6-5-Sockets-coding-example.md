# Sockets coding example — чат на Socket.IO / Node / Angular

Это лекция-инструкция: как собрать простейший realtime-чат. Код в слайдах — картинки, в самом PDF его нет, поэтому ниже я собрал рабочие файлы целиком. Плюс в инструкции есть одна прямая ошибка в команде npm и несколько устаревших шагов для современного Angular.

### Сценарий

Клиенты 1, 2 и 3 открывают соединение с Node-сервером. Когда клиент 1 отправляет данные, сервер ретранслирует их остальным подключённым клиентам. Этого достаточно для базового чата в реальном времени.

Порты: сервер на `http://localhost:3000`, Angular на `http://localhost:4200`. Раз порты разные — это разные origin, значит **CORS обязателен**, ровно как в week5.

### Ошибка в слайдах: на клиенте нужен другой пакет

В лекции дважды написано, что клиенту нужен `socket.io`:

    ```bash
    npm install socket.io bootstrap --save   # так НЕ надо на клиенте
    ```

`socket.io` — это **серверный** пакет. Браузерному клиенту нужен `socket.io-client`:

    ```bash
    # сервер
    npm install express cors socket.io

    # клиент (Angular)
    npm install socket.io-client bootstrap
    ```

Если поставить на клиент серверный пакет, он потянет за собой серверные зависимости и сборка Angular будет падать на попытках подключить модули Node. И держи мажорные версии клиента и сервера одинаковыми: клиент v2 с сервером v4 не соединится.

### Сервер: три файла

Лекция предлагает разбить сервер на `server.js`, `socket.js` и `listen.js`. Это не обязательно, но приучает не сваливать всё в один файл. Вот рабочий вариант.

`server.js` — точка входа, собирает express, http-сервер и socket.io:

    ```js
    const express = require('express');
    const cors = require('cors');
    const { createServer } = require('node:http');
    const { Server } = require('socket.io');

    const app = express();
    app.use(cors());                 // это для обычных HTTP-маршрутов
    app.use(express.json());

    const server = createServer(app);   // socket.io цепляется к http-серверу, НЕ к app

    const io = new Server(server, {
        cors: { origin: 'http://localhost:4200' }   // отдельный CORS для сокетов
    });

    require('./socket.js')(io);
    require('./listen.js')(server);
    ```

Обрати внимание: `app.use(cors())` и опция `cors` в `new Server(...)` — **разные** настройки. Первая про REST-маршруты, вторая про сокеты. Забыть вторую — классическая причина «в консоли ошибка CORS, хотя cors я подключил».

`socket.js` — вся логика событий:

    ```js
    module.exports = (io) => {
        io.on('connection', (socket) => {
            console.log('клиент подключился:', socket.id);

            socket.on('message', (message) => {
                io.emit('new-message', message);   // всем, включая отправителя
            });

            socket.on('disconnect', (reason) => {
                console.log('клиент ушёл:', socket.id, reason);
            });
        });
    };
    ```

`listen.js` — запуск:

    ```js
    const PORT = 3000;

    module.exports = (server) => {
        server.listen(PORT, () => console.log(`сервер слушает http://localhost:${PORT}`));
    };
    ```

### Неточность в слайде 3 про io.emit

В лекции написано, что сервер «broadcasting the data to all **other** connected clients using `io.emit`». Это не так: `io.emit` отправляет **всем, включая отправителя**. Всем, кроме отправителя, рассылает `socket.broadcast.emit`.

Практическая разница ровно одна, и от неё зависит, будут ли у тебя дубли сообщений:

- если компонент **не** добавляет своё сообщение в список сам, а ждёт ответа сервера, нужен `io.emit`;
- если компонент сразу дописывает своё сообщение локально (для мгновенного отклика), нужен `socket.broadcast.emit`, иначе автор увидит своё сообщение дважды.

### Клиент: шаги из лекции

    ```bash
    ng new chat
    npm install socket.io-client bootstrap
    ng generate component chat
    ng generate service services/socket
    ```

Bootstrap подключается строкой `"./node_modules/bootstrap/dist/css/bootstrap.min.css"` в массив `styles` файла `angular.json`.

Два шага из лекции для современного Angular делать **не нужно**:
  
  - **`CommonModule` в `app.module.ts`** — лишнее. `BrowserModule` уже реэкспортирует `CommonModule`, так что `*ngFor` работает и без этого. `CommonModule` импортируют только в отдельных feature-модулях или в standalone-компонентах.
  - **Сервис в массив `providers`** — не нужно и даже вредно. `ng generate service` создаёт сервис с `@Injectable({ providedIn: 'root' })`, то есть он уже зарегистрирован и существует в одном экземпляре. А вот если добавить сервис в `providers` **компонента**, у каждого экземпляра компонента появится свой сервис и, соответственно, своё соединение с сокетом — то есть N подключений вместо одного.
  
  Плюс, если проект создан на Angular 17 и новее, никакого `app.module.ts` может не быть вообще: компоненты standalone, и `FormsModule` импортируется прямо в компонент:
  
    ```ts
    @Component({
        selector: 'app-chat',
        standalone: true,
        imports: [CommonModule, FormsModule],   // здесь, а не в app.module
        templateUrl: './chat.component.html'
    })
    ```

`FormsModule` нужен именно для `[(ngModel)]` — без него шаблон не скомпилируется.

### Сервис для сокета

    ```ts
    import { Injectable } from '@angular/core';
    import { io, Socket } from 'socket.io-client';
    import { Observable, Subject } from 'rxjs';

    @Injectable({ providedIn: 'root' })
    export class SocketService {
        private socket!: Socket;
        private messages$ = new Subject<string>();
        private readonly url = 'http://localhost:3000';

        initSocket(): void {
            if (this.socket) return;              // защита от повторной инициализации
            this.socket = io(this.url);
            this.socket.on('new-message', (m: string) => this.messages$.next(m));
        }

        getMessages(): Observable<string> {
            return this.messages$.asObservable();
        }

        send(message: string): void {
            this.socket.emit('message', message);
        }
    }
    ```

Про `initSocket` важная поправка к слайду 9. Лекция говорит вызывать его при загрузке компонента, но если компонент пересоздаётся (ушёл на другой роут и вернулся), `initSocket` вызовется снова и откроет **второе** соединение. Отсюда проверка `if (this.socket) return`. Ещё чище — вообще не иметь `initSocket`, а подключаться в конструкторе сервиса: сервис в `root` создаётся один раз за жизнь приложения.

### Компонент

    ```ts
    export class ChatComponent implements OnInit, OnDestroy {
        messagecontent = '';
        messages: string[] = [];
        private sub?: Subscription;

        constructor(private socketService: SocketService) {}

        ngOnInit(): void {
            this.socketService.initSocket();
            this.sub = this.socketService.getMessages().subscribe((m) => this.messages.push(m));
        }

        sendMessage(): void {
            if (!this.messagecontent.trim()) return;
            this.socketService.send(this.messagecontent);
            this.messagecontent = '';          // очистить поле после отправки
        }

        ngOnDestroy(): void {
            this.sub?.unsubscribe();           // в слайдах этого нет, а нужно
        }
    }
    ```

Шаблон `chat.component.html`:

    ```html
    <h3>Чат</h3>

    <ul class="list-unstyled">
        <li *ngFor="let m of messages">{{ m }}</li>
    </ul>

    <form (ngSubmit)="sendMessage()">
        <input class="form-control" [(ngModel)]="messagecontent" name="messagecontent"
            placeholder="Новое сообщение" autocomplete="off">
        <button class="btn btn-primary mt-2" type="submit">Отправить</button>
    </form>
    ```

Мелочь, которая экономит время: `(ngSubmit)` вместо `(click)` на кнопке даёт бесплатную отправку по Enter. И атрибут `name` у input обязателен, когда используешь `ngModel` внутри формы, иначе Angular выбросит ошибку.

`app.component.html` по лекции оставляем почти пустым:

```html
<h1>Welcome to {{ title }}</h1>
<router-outlet></router-outlet>
```

### Порядок запуска и как отлаживать

  1. `node server.js` — в консоли должно появиться «сервер слушает».
  2. `ng serve --open` — открывается `localhost:4200`.
  3. Открой два окна браузера и проверь, что сообщение из одного появляется в другом.
  
Если не работает, смотри в такой последовательности. 
  - Консоль браузера: ошибка CORS означает, что не задан `origin` в опциях `new Server`. 
  - Вкладка Network, фильтр WS: если запросов на `/socket.io/` нет вообще — клиент не там ищет сервер (проверь URL и порт); если запросы есть, но соединение падает — почти всегда несовпадение мажорных версий клиента и сервера. 
  - Консоль сервера: если «клиент подключился» не печатается, значит до `io.on('connection')` дело не доходит. А если сообщения приходят дважды — ищи вторую подписку или второй `socket.on` (подробно это разобрано в заметках по 6.4).

### Проверь себя

1. Какой пакет ставится на клиент и какой на сервер?
2. Почему `socket.io` цепляется к `createServer(app)`, а не к самому `app`?
3. Чем отличается `app.use(cors())` от опции `cors` в `new Server(...)`?
4. Что будет, если добавить `SocketService` в `providers` компонента?
5. Когда для рассылки нужен `io.emit`, а когда `socket.broadcast.emit`?

<!-- Ответы: на клиент `socket.io-client`, на сервер `socket.io`. Потому что socket.io работает на уровне HTTP-сервера и перехватывает апгрейд соединения, а `app` — это только обработчик запросов Express. Первое разрешает кросс-доменные REST-запросы, второе — подключение сокетов; это независимые настройки. У каждого экземпляра компонента появится свой сервис и своё соединение с сервером вместо одного общего. `io.emit`, когда клиент рисует список только из ответов сервера; `socket.broadcast.emit`, когда клиент сразу добавляет своё сообщение локально. -->

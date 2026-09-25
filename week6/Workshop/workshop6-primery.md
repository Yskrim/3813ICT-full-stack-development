# Workshop 6 — Node и Sockets: примеры и разбор

**Источник:** `workshop6-updated.pdf`  
**Связанные материалы:** [план работы](workshop6-konspekt.md) · [вопросы](workshop6-voprosy.md) · [ответы](workshop6-otvety.md) · [поправки](workshop6-popravki.md)

## Пример 1. Серверный каркас

Сначала соберём минимальную форму сервера: HTTP server передаётся Socket.IO, а после подключения регистрируется обработчик сообщений.

```js
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:4200' },
});

io.on('connection', (socket) => {
  socket.on('message', (text) => {
    io.emit('new-message', text);
  });
});

httpServer.listen(3000);
```

Это компактный вариант для понимания связи. В workshop файлы разнесены по модулям (`server.js`, `sockets.js`, `listen.js`), а их экспорт/импорт нужно согласовать между собой. Современный API создаёт HTTP server явно; старые примеры могут использовать другие формы. ⚠ [П-5](workshop6-popravki.md#p-5)

## Пример 2. Клиентский сервис

```ts
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

export class SocketService {
  private socket: Socket = io('http://localhost:3000');

  send(text: string): void {
    this.socket.emit('message', text);
  }

  messages(): Observable<string> {
    return new Observable((observer) => {
      const handler = (text: string) => observer.next(text);
      this.socket.on('new-message', handler);
      return () => this.socket.off('new-message', handler);
    });
  }
}
```

Компонент подписывается, кладёт входящий текст в массив и отписывается при уничтожении. Подробнее о связи с Observable см. [материал 6.4](../materials/6_4-socket-observable-konspekt.md).

## Пример 3. Решаем, показывать ли сообщение отправителю

Если сервер использует `io.emit`, событие вернётся и отправителю. Если он уже добавляет отправленный текст в список локально, это может создать дубликат. Возможные решения: сервер рассылает только остальным через `socket.broadcast.emit`, либо отправитель ждёт серверную копию и не добавляет локально. ⚠ [П-6](workshop6-popravki.md#p-6)

## Пример 4. Две копии клиента

Открой приложение в двух независимых вкладках. В каждой вкладке создаётся собственное socket-соединение. Отправь текст из первой вкладки, затем проверь его появление во второй. Повтори в обратном направлении. Такой сценарий подтверждает базовый обмен, но не проверяет аутентификацию, приватность данных или восстановление после потери связи.

## Если не работает

1. Проверь, что сервер слушает порт `3000` и клиент использует тот же URL.
2. Проверь, что обе стороны используют одинаковые имена событий.
3. Убедись, что браузер установил клиентский пакет `socket.io-client`.
4. Проверь CORS origin, указанный в Socket.IO server options.
5. Посмотри ошибки в консоли сервера и браузера; отличай сетевой сбой от ошибки HTTP/конфигурации.

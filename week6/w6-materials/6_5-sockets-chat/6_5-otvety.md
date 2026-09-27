# 6_5 — Чат на Socket.IO, Node и Angular: ответы

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_5-socket-chat-konspekt.md) · [поправки](6_5-socket-chat-popravki.md) · [примеры](6_5-socket-chat-primery.md) · [вопросы](6_5-socket-chat-voprosy.md)

---

## A. Сервер

<a id="a-1"></a>

### 1. Пакеты

**Ответ:** сервер — `socket.io`, Angular — `socket.io-client`. Серверный пакет не содержит клиента: импорт `from 'socket.io-client'` не найдёт модуль, а в проект попадёт лишний серверный код.

**Подробнее:** [Конспект §2](6_5-socket-chat-konspekt.md#s2) · [П-1](6_5-socket-chat-popravki.md#p-1) · [← вопрос](6_5-socket-chat-voprosy.md#q-1)

<a id="a-2"></a>

### 2. Что не так

**Ответ:** HTTP-маршруты Express будут работать, а Socket.IO — нет: `app.listen` создаёт **новый** HTTP-сервер, к которому Socket.IO не привязан (проверено: клиент получает `xhr poll error`). Слушать нужно `httpServer.listen(3000)`.

**Подробнее:** [Конспект §3.1](6_5-socket-chat-konspekt.md#s3-1) · [П-2](6_5-socket-chat-popravki.md#p-2) · [← вопрос](6_5-socket-chat-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Кому уходит

**Ответ:** `io.emit` — всем, включая отправителя; `socket.broadcast.emit` — всем, кроме отправителя. Для сообщения чата — `io.emit`: отправитель тоже видит своё сообщение в ленте.

**Подробнее:** [П-3](6_5-socket-chat-popravki.md#p-3) · [← вопрос](6_5-socket-chat-voprosy.md#q-3)

<a id="a-4"></a>

### 4. Два вида CORS

**Ответ:** опция `cors` в `new Server` разрешает подключения Socket.IO с другого origin; пакет `cors` в Express — для обычных HTTP-маршрутов (`/api/...`). Это разные обработчики запросов, и каждому нужна своя настройка.

**Подробнее:** [Конспект §3.2](6_5-socket-chat-konspekt.md#s3-2) · [← вопрос](6_5-socket-chat-voprosy.md#q-4)

<a id="a-5"></a>

### 5. Доверие к клиенту

**Ответ:** клиент может прислать что угодно — чужое имя, неправильное время. Автора сервер берёт из данных подключения (`socket.handshake.auth`, в Phase 2 — из проверенной сессии), время — свои часы, `id` — свой счётчик или база.

**Подробнее:** [Пример 1](6_5-socket-chat-primery.md#ex-1) · [← вопрос](6_5-socket-chat-voprosy.md#q-5)

---

## B. Клиент

<a id="a-6"></a>

### 6. Найди три ошибки

**Ответ:**

1. `private chat()` вызывается из шаблона — нужен `protected` или `public`;
2. `messagecontent = null` при типе `string` — ошибка строгого режима, очищают пустой строкой;
3. `onMessage()` не существует — в сервисе метод называется `getMessage()`.

**Подробнее:** [Конспект §6.1](6_5-socket-chat-konspekt.md#s6-1) · [П-5](6_5-socket-chat-popravki.md#p-5) · [← вопрос](6_5-socket-chat-voprosy.md#q-6)

<a id="a-7"></a>

### 7. Дубли после переходов

**Ответ:** нет функции очистки в Observable (обработчик остаётся на сокете после отписки) и/или компонент не отписывается при уничтожении (нет `takeUntilDestroyed` или `toSignal`).

**Подробнее:** [6_4 П-5](6_4-socket-observable-popravki.md#p-5) · [6_4 П-6](6_4-socket-observable-popravki.md#p-6) · [← вопрос](6_5-socket-chat-voprosy.md#q-7)

<a id="a-8"></a>

### 8. Прокси

**Ответ:** в `proxy.conf.json` добавить запись `"/socket.io": { "target": "http://localhost:3000", "ws": true }` — `ws` включает проксирование WebSocket — и подключаться на клиенте без адреса: `io()`.

**Подробнее:** [Конспект §7](6_5-socket-chat-konspekt.md#s7) · [← вопрос](6_5-socket-chat-voprosy.md#q-8)

<a id="a-9"></a>

### 9. История и новые

**Ответ:** чтобы не потерять сообщения, которые придут, пока загружается история. Дубли убирают склейкой по `id` (например, через `Map`) и сортировкой по `id`.

**Подробнее:** [Пример 2](6_5-socket-chat-primery.md#ex-2) · [← вопрос](6_5-socket-chat-voprosy.md#q-9)

<a id="a-10"></a>

### 10. Отправка по Enter

**Ответ:** обработчик на форме `<form (ngSubmit)="chat()">` и кнопка `type="submit"` (нужен `FormsModule`); в `chat()` — `const text = this.messagecontent.trim(); if (!text) return;`, кнопку можно блокировать `[disabled]="!messagecontent.trim()"`.

**Подробнее:** [Конспект §6.2](6_5-socket-chat-konspekt.md#s6-2) · [← вопрос](6_5-socket-chat-voprosy.md#q-10)

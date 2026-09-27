# 6_5 — Чат на Socket.IO, Node и Angular: вопросы для самопроверки

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_5-socket-chat-konspekt.md) · [поправки](6_5-socket-chat-popravki.md) · [примеры](6_5-socket-chat-primery.md) · [ответы](6_5-socket-chat-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для кода сначала предскажи результат.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Сервер

<a id="q-1"></a>

### 1. Пакеты

Какой пакет Socket.IO ставят на сервер, а какой — в Angular-проект? Что будет, если в Angular-проект поставить `socket.io`?

[→ ответ](6_5-socket-chat-otvety.md#a-1)

<a id="q-2"></a>

### 2. Что не так?

```js
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: 'http://localhost:4200' } });
app.listen(3000);
```

Что будет работать, а что нет? Почему?

[→ ответ](6_5-socket-chat-otvety.md#a-2)

<a id="q-3"></a>

### 3. Кому уходит

Кто получит событие при `io.emit` и при `socket.broadcast.emit`? Что выбрать для сообщения чата?

[→ ответ](6_5-socket-chat-otvety.md#a-3)

<a id="q-4"></a>

### 4. Два вида CORS

Зачем в сервере два места с настройкой CORS — `new Server(httpServer, { cors })` и `app.use(cors(...))`?

[→ ответ](6_5-socket-chat-otvety.md#a-4)

<a id="q-5"></a>

### 5. Доверие к клиенту

Почему сервер не должен брать автора сообщения и время из данных, которые прислал клиент? Откуда их брать?

[→ ответ](6_5-socket-chat-otvety.md#a-5)

---

## B. Клиент

<a id="q-6"></a>

### 6. Найди три ошибки

```ts
private chat() {
  if (this.messagecontent) {
    this.socketService.send(this.messagecontent);
    this.messagecontent = null;
  }
}
// шаблон: <button (click)="chat()">Send</button>
// в ngOnInit: this.socketService.onMessage().subscribe(...)  — в сервисе метод getMessage()
```

[→ ответ](6_5-socket-chat-otvety.md#a-6)

<a id="q-7"></a>

### 7. Дубли после переходов

Пользователь трижды открыл и закрыл страницу чата, и теперь каждое сообщение появляется три раза. Назови две причины, которые нужно проверить.

[→ ответ](6_5-socket-chat-otvety.md#a-7)

<a id="q-8"></a>

### 8. Прокси

Как настроить прокси `ng serve`, чтобы Socket.IO работал через `localhost:4200`?

[→ ответ](6_5-socket-chat-otvety.md#a-8)

---

## C. Лента

<a id="q-9"></a>

### 9. История и новые

Почему в компоненте ленты сначала подписываются на сокет, а потом загружают историю? Как избежать дублей?

[→ ответ](6_5-socket-chat-otvety.md#a-9)

<a id="q-10"></a>

### 10. Отправка по Enter

Как сделать, чтобы сообщение отправлялось и по кнопке, и по Enter, а пустое не отправлялось?

[→ ответ](6_5-socket-chat-otvety.md#a-10)

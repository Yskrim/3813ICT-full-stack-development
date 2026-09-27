# 6_4 — Сокет и Observable в Angular: поправки

**Курс:** 3813ICT, неделя 6
**Источник:** `6_4-socket-and-observable.pdf`
**Связанные файлы:** [конспект](6_4-socket-observable-konspekt.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: код скомпилирован TypeScript 5.9 в строгом режиме с `socket.io-client` 4.8.3 и RxJS 7.8.2; поведение слушателей проверено запуском настоящего сервера Socket.IO. Сообщения об ошибках и результаты ниже — реальные.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | `import * as io from 'socket.io-client'` | 🔴 | В v4 так `io` не вызвать: «This expression is not callable» |
| [П-2](#p-2) | Имена событий не совпадают | 🟡 | `'new-messages'`, `'new-message'`, `'message'` — три разных события |
| [П-3](#p-3) | `private socket;` без типа | 🔴 | Ошибка строгого режима; тип `Socket` есть в пакете |
| [П-4](#p-4) | `Observable.create` из `'rxjs/Observable'` | 🔵 | Путь не существует с RxJS 6; `create` устарел |
| [П-5](#p-5) | Observable без функции очистки | 🔴 | Слушатели копятся — сообщения приходят по нескольку раз |
| [П-6](#p-6) | Подписка в компоненте без отписки | 🟡 | Нужна отписка при уничтожении — `takeUntilDestroyed` |
| [П-7](#p-7) | Операторы `.map(…)`, `.filter(…)` цепочкой | 🔵 | С RxJS 6 операторы передают в `pipe(...)` |

---

<a id="p-1"></a>

## П-1. `import * as io from 'socket.io-client'` 🔴

### Как в материале

Сказано, что клиентский сокет создаётся методом `io()`, а для этого сначала импортируется модуль `socket-io-client` записью `import * as io`. Затем в конструкторе вызывается `io(this.url)`.

### Пример из материала

```ts
import * as io from ‘socket.io-client’;

this.socket = io(this.url);
```

### В чём несоответствие

Запись `import * as io` импортирует **объект модуля** со всеми его экспортами, а не функцию. В Socket.IO v2 это работало, но в v3–v4 модуль экспортирует функцию `io` по имени, и вызов объекта модуля не компилируется:

```
error TS2349: This expression is not callable.
  Type 'typeof import(".../socket.io-client/build/esm/index")' has no call signatures.
```

Кроме того, в тексте пакет назван `socket-io-client` (через дефис), а кавычки — типографские.

Для сравнения: в 6_5 используется `import io from 'socket.io-client'` — такой импорт по умолчанию в v4 компилируется, но документация рекомендует именованный.

### Как правильно

```ts
import { io } from 'socket.io-client';
```

### Пример

```ts
import { io, Socket } from 'socket.io-client';   // функция io и тип Socket

const socket: Socket = io('http://localhost:3000');
socket.on('connect', () => console.log('подключено', socket.id));

// ❌ import * as io from 'socket.io-client';  → io(...) — «This expression is not callable»
```

**Источник:** [Socket.IO — Client API](https://socket.io/docs/v4/client-api/) · [Socket.IO — Client Installation](https://socket.io/docs/v4/client-installation/)

---

<a id="p-2"></a>

## П-2. Имена событий не совпадают 🟡

### Как в материале

В коде клиент слушает событие `'new-messages'`, а текст под ним говорит, что клиент слушает `'new-message'`. В примере с Observable используется `'new-message'`, в методах `getMessage` и `send` — `'message'`, и сказано, что код будет получать сообщения по событию `'message'`.

### Пример из материала

```ts
this.socket.on(‘new-messages’, m =>{alert(m);});
// ...
this.socket.on('new-message', (message) => { observer.next(message); });
// ...
this.socket.emit('message', message);
```

### В чём несоответствие

Для Socket.IO это **три разных события**. Событие доставляется только тому, кто слушает **ровно то же имя**, с учётом регистра и каждого символа. Если сервер отправляет `'message'`, а клиент слушает `'new-message'`, ошибки не будет — сообщения просто не придут. Эту ошибку трудно найти, потому что ничего не падает.

### Как правильно

Имена событий задать один раз — константами, общими для кода, — и использовать везде одинаково.

### Пример

```ts
// src/app/services/socket-events.ts — одно место для имён событий
export const EVENTS = {
  message: 'message',
  join: 'join',
} as const;

// Клиент
socket.emit(EVENTS.message, 'Привет');
socket.on(EVENTS.message, (m: string) => console.log(m));

// Сервер (server/socket.js) должен использовать те же строки:
// socket.on('message', (m) => io.emit('message', m));
```

**Источник:** [Socket.IO — Emitting events](https://socket.io/docs/v4/emitting-events/) · [Socket.IO — Listening to events](https://socket.io/docs/v4/listening-to-events/)

---

<a id="p-3"></a>

## П-3. `private socket;` без типа 🔴

### Как в материале

Сказано, что для инициализации сокета сервис должен хранить ссылку на него, и для этого создаётся приватное свойство класса `socket`. Метод `initSocket()` записывает в него результат `io(SERVER_URL)`.

### Пример из материала

```ts
private socket;

initSocket(){
    this.socket = io(SERVER_URL);
}
```

### В чём несоответствие

В строгом режиме (проект Angular) поле без типа и без начального значения — ошибка:

```
error TS7008: Member 'socket' implicitly has an 'any' type.
```

Даже в нестрогом режиме тип `any` отключает проверку: опечатку `this.socket.emitt(...)` компилятор не заметит. Пакет `socket.io-client` экспортирует тип `Socket`, и его стоит использовать. Поскольку сокет появляется только после `initSocket()`, поле объявляют необязательным (`?`) и учитывают это при обращении.

### Как правильно

```ts
private socket?: Socket;
```

### Пример

```ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;                  // до initSocket — undefined

  initSocket(): void {
    if (!this.socket) this.socket = io('http://localhost:3000');
  }

  send(message: string): void {
    this.socket?.emit('message', message);  // ?. — если сокета нет, ничего не произойдёт
  }
}
```

**Источник:** [Socket.IO — TypeScript](https://socket.io/docs/v4/typescript/) · [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig/#noImplicitAny)

---

<a id="p-4"></a>

## П-4. `Observable.create` из `'rxjs/Observable'` 🔵

### Как в материале

Сказано, что Observable создаётся через `Observable.create()` из модуля `'rxjs/Observable'`, и что `Observable.create()` и `new Observable` — одно и то же. Показаны оба варианта рядом.

### Пример из материала

```ts
getMessages(){
    return Observable.create((observer) => {
        this.socket.on('new-message', (message) => {
            observer.next(message);
        });
    });
}
```

### В чём несоответствие

1. **Путь `'rxjs/Observable'` не существует** с RxJS 6. Импорт даёт ошибку: `error TS2307: Cannot find module 'rxjs/Observable'`. Сейчас всё импортируется из `'rxjs'`.
2. **`Observable.create` объявлен устаревшим** в RxJS 7 и будет удалён. Он действительно делает то же, что `new Observable`, но возвращает нетипизированный Observable; используют `new Observable<T>(...)`.
3. Параметр `observer` и `message` без типов — ошибки строгого режима.

### Как правильно

```ts
import { Observable } from 'rxjs';
return new Observable<string>((subscriber) => { ... });
```

### Пример

```ts
import { Observable } from 'rxjs';           // ✅ единственный путь

getMessages(): Observable<string> {
  return new Observable<string>((subscriber) => {   // ✅ типизированный
    // ... (функция очистки — см. П-5)
  });
}

// ❌ import { Observable } from 'rxjs/Observable';  — нет такого модуля с RxJS 6
// ❌ Observable.create(...)                         — устарел в RxJS 7
```

**Источник:** [RxJS API — Observable](https://rxjs.dev/api/index/class/Observable) (метод `create` помечен deprecated) · [RxJS — Importing instructions](https://rxjs.dev/guide/importing)

---

<a id="p-5"></a>

## П-5. Observable без функции очистки 🔴

### Как в материале

Показано, как обернуть приём сообщений сокета в Observable: внутри `new Observable` на сокет вешается слушатель, который передаёт каждое сообщение через `observer.next`. Компонент подписывается и добавляет сообщения в список. Сказано, что этот код будет работать для получения сообщений.

### Пример из материала

```ts
getMessages() {
    return new Observable((observer) => {
        this.socket.on('new-message', (message) => {
            observer.next(message);
        });
    });
}
```

### В чём несоответствие

Функция внутри `new Observable` выполняется при **каждой** подписке и вешает на сокет **нового** слушателя. Чтобы при отписке его снять, она должна **вернуть функцию очистки** (teardown) — RxJS вызовет её при `unsubscribe()`. Здесь функции очистки нет, поэтому отписка останавливает доставку подписчику, но слушатель на сокете остаётся навсегда.

Проверено запуском: трижды подписались и отписались (как при трёх заходах на страницу чата) — без функции очистки на сокете **3** слушателя `message`, с функцией очистки — **0**. На практике это значит, что после нескольких переходов между страницами каждое сообщение обрабатывается несколько раз, а память не освобождается.

### Как правильно

Сохранить функцию-обработчик в переменную и вернуть функцию, которая снимает именно её через `socket.off(event, handler)`. Либо использовать `fromEvent`, который делает это сам.

### Пример

```ts
import { Observable, fromEvent } from 'rxjs';
import { Socket } from 'socket.io-client';

// Вариант 1: new Observable с функцией очистки
function messages$(socket: Socket): Observable<string> {
  return new Observable<string>((subscriber) => {
    const handler = (message: string) => subscriber.next(message);
    socket.on('message', handler);                 // подписка → слушатель
    return () => socket.off('message', handler);    // отписка → снять ЭТОГО слушателя
  });
}

// Вариант 2: fromEvent — работает с объектами, у которых есть on и off
function messagesFromEvent$(socket: Socket): Observable<string> {
  return fromEvent<string>(socket, 'message');
}

// ⚠ socket.off('message') без второго аргумента снимет ВСЕХ слушателей этого события,
//   в том числе чужих, — поэтому передаём конкретный handler
```

**Источник:** [RxJS — Observable, раздел «Disposing Observable Executions»](https://rxjs.dev/guide/observable) · [RxJS API — fromEvent](https://rxjs.dev/api/index/function/fromEvent) · [Socket.IO — Listening to events (socket.off)](https://socket.io/docs/v4/listening-to-events/)

---

<a id="p-6"></a>

## П-6. Подписка в компоненте без отписки 🟡

### Как в материале

Компонент подписывается на `getMessages()` и добавляет каждое сообщение в массив `messages`. Про отписку не сказано.

### Пример из материала

```ts
this.socketService.getMessages().subscribe(m => {
  this.messages.push(m);});
```

### В чём несоответствие

Поток сообщений сокета **бесконечен** — в отличие от HTTP-запроса, он сам не завершается. Если компонент уничтожен, а подписка осталась, колбэк продолжит вызываться и держать в памяти уничтоженный компонент. Даже с функцией очистки из [П-5](#p-5) она сработает, только если кто-то вызовет `unsubscribe()`.

В Angular для этого есть оператор `takeUntilDestroyed` из `@angular/core/rxjs-interop`: он завершает поток, когда уничтожается компонент (или сервис). В конструкторе его вызывают без аргументов; вне контекста внедрения передают `DestroyRef`.

Также `this.messages.push(m)` изменяет массив на месте; если список хранится в сигнале, нужен новый массив (`update`), иначе шаблон не узнает об изменении ([5_2 §6.3](5_2-services-konspekt.md#s6-3)).

### Как правильно

```ts
getMessages().pipe(takeUntilDestroyed()).subscribe(...)
```

### Пример

```ts
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../services/socket.service';

@Component({ selector: 'app-chat', template: `...` })
export class ChatComponent implements OnInit {
  private socketService = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  protected messages = signal<string[]>([]);

  // Вариант 1: в конструкторе — DestroyRef найдётся сам
  constructor() {
    this.socketService.initSocket();
    this.socketService.getMessages()
      .pipe(takeUntilDestroyed())
      .subscribe((m) => this.messages.update((list) => [...list, m]));
  }

  // Вариант 2: вне контекста внедрения (например, в ngOnInit) — передать DestroyRef явно
  ngOnInit(): void {
    // this.socketService.getMessages()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(...);
  }
}
```

**Источник:** [Angular — Unsubscribing with takeUntilDestroyed](https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed) · [Angular API — takeUntilDestroyed](https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed)

---

<a id="p-7"></a>

## П-7. Операторы `.map(…)`, `.filter(…)` цепочкой 🔵

### Как в материале

Объясняется, зачем оборачивать события в Observable: RxJS даёт набор операторов для преобразования данных. Операторы не меняют существующий Observable, а возвращают новый («чистая» операция). Приведены операторы `.map(…)`, `.filter(…)` и `.merge(…)`, которые «можно вызывать цепочкой (или через pipe с v5.5+)», и сказано, что операторов больше сотни.

### Пример из материала

Кода нет (названия `.map(…)`, `.filter(…)`, `.merge(…)` в тексте).

### В чём несоответствие

Описание «операторы возвращают новый Observable» — верное. Но запись через точку (`obs.map(...).filter(...)`) — стиль RxJS 5, где операторы добавлялись в прототип Observable. С RxJS 5.5 появились pipeable-операторы, а в RxJS 6 методы-операторы из прототипа **убраны**. Сейчас операторы импортируют как функции из `'rxjs'` и передают в `pipe(...)`. `merge` при этом — не оператор в цепочке, а функция, которая объединяет несколько Observable.

### Как правильно

```ts
source$.pipe(filter(...), map(...))
```

### Пример

```ts
import { filter, map, merge } from 'rxjs';

// ✅ RxJS 6+
const clean$ = messages$.pipe(
  filter((m: string) => m.trim().length > 0),
  map((m) => m.trim()),
);

// Объединение потоков — функция merge
const all$ = merge(chatMessages$, systemMessages$);

// ❌ RxJS 5 — в RxJS 6+ не работает:
// messages$.filter(...).map(...)
```

**Источник:** [RxJS — Operators](https://rxjs.dev/guide/operators) · [RxJS — Importing instructions](https://rxjs.dev/guide/importing) · [RxJS API — merge](https://rxjs.dev/api/index/function/merge)

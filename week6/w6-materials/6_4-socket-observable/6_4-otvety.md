# 6_4 — Сокет и Observable в Angular: ответы

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_4-socket-observable-konspekt.md) · [поправки](6_4-socket-observable-popravki.md) · [примеры](6_4-socket-observable-primery.md) · [вопросы](6_4-socket-observable-voprosy.md)

---

## A. Клиент и сервис

<a id="a-1"></a>

### 1. Импорт

**Ответ:** `import * as io` даёт объект модуля, а не функцию; в v4 его нельзя вызвать (`TS2349: This expression is not callable`). Правильно: `import { io, Socket } from 'socket.io-client'`.

**Подробнее:** [Конспект §1](6_4-socket-observable-konspekt.md#s1) · [П-1](6_4-socket-observable-popravki.md#p-1) · [← вопрос](6_4-socket-observable-voprosy.md#q-1)

<a id="a-2"></a>

### 2. Имена событий

**Ответ:** ничего — сообщения просто не придут, ошибки не будет. Защита: имена в одном месте (константы или карта событий) и типизированный сокет `Socket<ServerToClientEvents, ClientToServerEvents>`, тогда опечатку поймает компилятор.

**Подробнее:** [П-2](6_4-socket-observable-popravki.md#p-2) · [Пример 1](6_4-socket-observable-primery.md#ex-1) · [← вопрос](6_4-socket-observable-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Поле сокета

**Ответ:** поле без типа и без начального значения — неявный `any`, ошибка `TS7008`. Правильно: `private socket?: Socket;` (если создаётся позже) или сразу `private socket: Socket = io(url, { autoConnect: false })`.

**Подробнее:** [Конспект §2](6_4-socket-observable-konspekt.md#s2) · [П-3](6_4-socket-observable-popravki.md#p-3) · [← вопрос](6_4-socket-observable-voprosy.md#q-3)

<a id="a-4"></a>

### 4. Колбэк или Observable

**Ответ:** колбэк нельзя «выключить»: каждый вызов добавляет обработчик навсегда. Observable даёт отписку (и функцию очистки), а ещё операторы (`filter`, `map`, `scan`) и готовые механизмы Angular (`takeUntilDestroyed`, `toSignal`).

**Подробнее:** [Конспект §3](6_4-socket-observable-konspekt.md#s3) · [← вопрос](6_4-socket-observable-voprosy.md#q-4)

---

## B. Observable из сокета

<a id="a-5"></a>

### 5. Найди проблему

**Ответ:** функции очистки нет, поэтому отписка не снимает обработчик с сокета. После трёх заходов на сокете три обработчика, и каждое сообщение обрабатывается трижды (проверено запуском: 3 слушателя против 0 с функцией очистки).

**Подробнее:** [Конспект §5.2](6_4-socket-observable-konspekt.md#s5-2) · [П-5](6_4-socket-observable-popravki.md#p-5) · [← вопрос](6_4-socket-observable-voprosy.md#q-5)

<a id="a-6"></a>

### 6. Функция очистки

**Ответ:**

```ts
return new Observable<string>((subscriber) => {
  const handler = (m: string) => subscriber.next(m);
  this.socket.on('message', handler);
  return () => this.socket.off('message', handler);
});
```

`off('message')` без обработчика снимает **все** обработчики события — в том числе у других подписчиков.

**Подробнее:** [Конспект §5.2](6_4-socket-observable-konspekt.md#s5-2) · [← вопрос](6_4-socket-observable-voprosy.md#q-6)

<a id="a-7"></a>

### 7. Устаревшее

**Ответ:** пути `'rxjs/Observable'` нет с RxJS 6 (`TS2307`), а `Observable.create` объявлен устаревшим в RxJS 7; используют `import { Observable } from 'rxjs'` и `new Observable<T>(...)`.

**Подробнее:** [П-4](6_4-socket-observable-popravki.md#p-4) · [← вопрос](6_4-socket-observable-voprosy.md#q-7)

---

## C. Компонент и операторы

<a id="a-8"></a>

### 8. Отписка в компоненте

**Ответ:** `.pipe(takeUntilDestroyed())` — завершит поток при уничтожении компонента. Без аргументов — в контексте внедрения: в конструкторе или инициализаторе поля; в других местах передают `DestroyRef`. Альтернатива — `toSignal`.

**Подробнее:** [Конспект §5.4](6_4-socket-observable-konspekt.md#s5-4) · [П-6](6_4-socket-observable-popravki.md#p-6) · [← вопрос](6_4-socket-observable-voprosy.md#q-8)

<a id="a-9"></a>

### 9. Операторы

**Ответ:** `messages$.pipe(filter((m) => m.length > 0), map((m) => m.trim()))`. Нет — операторы возвращают новый Observable, исходный не меняется.

**Подробнее:** [Конспект §6](6_4-socket-observable-konspekt.md#s6) · [П-7](6_4-socket-observable-popravki.md#p-7) · [← вопрос](6_4-socket-observable-voprosy.md#q-9)

<a id="a-10"></a>

### 10. `scan` и `toSignal`

**Ответ:** `scan` накапливает поток в массив: к прежнему списку добавляет новое сообщение и оставляет последние 100, каждый раз возвращая новый массив. `toSignal` превращает поток в сигнал для шаблона и сам отписывается при уничтожении компонента.

**Подробнее:** [Пример 2](6_4-socket-observable-primery.md#ex-2) · [← вопрос](6_4-socket-observable-voprosy.md#q-10)

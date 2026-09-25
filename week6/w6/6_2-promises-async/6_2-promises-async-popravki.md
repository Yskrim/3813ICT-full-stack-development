# 6_2 — Promises и async-функции: поправки

**Курс:** 3813ICT, неделя 6
**Источник:** `6_2-promises_and_async_functions.pdf`
**Связанные файлы:** [конспект](6_2-promises-async-konspekt.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: поведение `await`, `Promise.all`, `from` и `defer` проверено запуском в Node.js с RxJS 7.8.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | «Колбэки then — это resolve и reject» | 🟡 | В `then` передают обработчики; `resolve`/`reject` принадлежат создателю промиса |
| [П-2](#p-2) | `response.body` как данные | 🔴 | `body` — поток; данные — через `response.json()` / `text()` |
| [П-3](#p-3) | Ошибки `fetch` не обработаны | 🔴 | `fetch` не отклоняется при 404/500 — нужно проверять `response.ok` |
| [П-4](#p-4) | Правила `await` | 🟡 | Есть top-level await; `await` работает с любым значением |
| [П-5](#p-5) | Пример `userExists` | 🟡 | Нет проверки ответа, email не закодирован, `await` вне `async` |
| [П-6](#p-6) | Promise ↔ Observable | 🔵 | `from(fetch())` запускает запрос сразу; `toPromise()` устарел |

---

<a id="p-1"></a>

## П-1. «Колбэки then — это resolve и reject» 🟡

### Как в материале

Сказано, что колбэки промису передаются через функцию `then`: первый колбэк — функция `resolve`, второй — функция `reject`, и иногда передаётся только `resolve`.

### Пример из материала

```ts
data.then(data => {
    console.log("Data received: " + data);
});
```

### В чём несоответствие

`resolve` и `reject` — функции, которые получает **исполнитель** внутри `new Promise((resolve, reject) => ...)`; ими промис переводят в выполненное или отклонённое состояние. В `then` передают другое — **обработчики** результата: `onFulfilled` (получит значение) и `onRejected` (получит причину ошибки). Путаница в названиях мешает понять, кто что вызывает: создатель промиса вызывает `resolve`, а JavaScript вызывает твой обработчик из `then`.

Кроме того, не упомянуты `catch` и `finally`, а в примерах ошибки не обрабатываются вовсе.

### Как правильно

`then(onFulfilled, onRejected)`; ошибки обычно ловят `catch`, общее завершение — `finally`.

### Пример

```ts
// Создатель промиса вызывает resolve/reject
const p = new Promise<string>((resolve, reject) => {
  setTimeout(() => (Math.random() > 0.5 ? resolve('ok') : reject(new Error('fail'))), 500);
});

// Потребитель передаёт обработчики
p.then(
  (value) => console.log('выполнен:', value),     // onFulfilled
  (reason) => console.error('отклонён:', reason), // onRejected (необязательный)
);

// Обычно так:
p.then((value) => console.log(value))
  .catch((err) => console.error(err))
  .finally(() => console.log('в любом случае'));
```

**Источник:** [MDN — Promise.prototype.then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) · [MDN — Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

---

<a id="p-2"></a>

## П-2. `response.body` как данные 🔴

### Как в материале

Сказано, что `fetch` проще `XMLHttpRequest` и основан на промисах, что он возвращает HTTP-объект `Response`, а не сырые данные, и что внутри `Response` есть свойство `body`, которое содержит данные тела. В примере выводится `response.body`.

### Пример из материала

```ts
let response = fetch("example.com");

response.then(response => {
    console.log("Data received: " + response.body);
});
```

### В чём несоответствие

1. **`response.body` — не данные, а поток** (`ReadableStream`). В консоли появится `Data received: [object ReadableStream]`. Чтобы получить содержимое, вызывают метод чтения тела: `response.json()`, `response.text()`, `response.blob()` — каждый возвращает Promise.
2. **Адрес без протокола.** `fetch("example.com")` — относительный адрес: браузер запросит `example.com` на текущем сайте, а не сайт example.com. Нужен полный адрес с `https://` или путь вида `/api/...`.

### Как правильно

```ts
const data = await (await fetch('/api/groups')).json();
```

### Пример

```ts
fetch('/api/groups')
  .then((response) => response.json())   // ✅ читаем тело как JSON (Promise)
  .then((groups) => console.log(groups));

// ❌ console.log(response.body) — выведет ReadableStream, а не данные
```

**Источник:** [MDN — Response.body](https://developer.mozilla.org/en-US/docs/Web/API/Response/body) · [MDN — Response.json()](https://developer.mozilla.org/en-US/docs/Web/API/Response/json)

---

<a id="p-3"></a>

## П-3. Ошибки `fetch` не обработаны 🔴

### Как в материале

`fetch` и цепочки промисов показаны без обработки ошибок: ответ сразу превращается в JSON, результат выводится в консоль.

### Пример из материала

```ts
fetch('http://example.com/movies.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        console.log(JSON.stringify(myJson));
    });
```

### В чём несоответствие

Промис `fetch` **отклоняется только при сбое самого запроса** — например, при сетевой ошибке или неправильном адресе. Если сервер ответил 404 или 500, промис **выполняется** как ни в чём не бывало. Код из материала попробует разобрать страницу ошибки как JSON и упадёт с непонятной ошибкой разбора — или, хуже, «успешно» выведет тело ошибки. Проверять статус нужно самому через `response.ok` (true для 200–299) или `response.status`. Кроме того, без `catch` любая ошибка станет «unhandled promise rejection».

`HttpClient` в Angular работает иначе: он сам считает 4xx/5xx ошибкой (5_4).

### Как правильно

Проверить `response.ok` до чтения тела и добавить `catch`.

### Пример

```ts
fetch('/api/movies')
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);   // 404, 500 → в catch
    }
    return response.json();
  })
  .then((movies) => console.log(movies))
  .catch((err) => console.error('Не удалось загрузить:', err));
```

**Источник:** [MDN — fetch()](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) — «A fetch() promise does not reject if the server responds with HTTP status codes that indicate errors» · [MDN — Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)

---

<a id="p-4"></a>

## П-4. Правила `await` 🟡

### Как в материале

Перечислены правила: `await` можно использовать только в функциях, объявленных с `async`; только для вызова функций, которые возвращают Promise; `await` выполняет `then()` у возвращённого промиса и заставляет вызов `then()` ждать, пока промис не выполнится.

### Пример из материала

```ts
const slow = await resolveAfter2Seconds();
const fast = await resolveAfter1Seconds();   // в коде функция названа resolveAfter1Second
```

### В чём несоответствие

1. **Не только в `async`-функциях.** На верхнем уровне **ES-модулей** `await` тоже работает (top-level await). В CommonJS-файлах Node.js (с `require`) — нет.
2. **Не только для Promise.** `await` можно применить к любому значению: не-Promise возвращается как есть (`await 42` → `42`). Работает и с любыми «thenable»-объектами. Практический смысл — конечно, в ожидании Promise.
3. **«Выполняет then()»** — объяснение механики запутанное. Точнее: `await` приостанавливает `async`-функцию до выполнения Promise и возвращает его значение; если Promise отклонён, `await` **бросает** исключение (его ловят `try/catch`). Пока функция на паузе, остальной код программы продолжает выполняться.
4. Не сказано, что `await` подряд выполняет операции последовательно, а независимые операции запускают параллельно через `Promise.all` (проверено: 0.3 с последовательно против 0.2 с параллельно для задержек 0.2 и 0.1 с).

Мелочь: на слайде с эквивалентной цепочкой функция названа `resolveAfter1Seconds`, а в коде — `resolveAfter1Second`.

### Как правильно

`await` приостанавливает `async`-функцию (или модуль) до выполнения значения-Promise и возвращает результат; отклонение превращается в исключение.

### Пример

```js
// ES-модуль (например, файл .mjs или проект с "type": "module")
const value = await 42;                     // 42 — не Promise, просто вернулось
const config = await fetch('/config.json').then((r) => r.json());   // top-level await

async function load() {
  try {
    const [users, groups] = await Promise.all([   // параллельно
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/groups').then((r) => r.json()),
    ]);
    return { users, groups };
  } catch (err) {                                  // отклонение → исключение
    console.error(err);
    return { users: [], groups: [] };
  }
}
```

**Источник:** [MDN — await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) (разделы про top-level await и non-promise values) · [MDN — Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

---

<a id="p-5"></a>

## П-5. Пример `userExists` 🟡

### Как в материале

Сказано, что `async`-функции могут возвращать только Promise, и в примере возвращаемое булево значение автоматически оборачивается в `Promise<boolean>`. Метод запрашивает адрес с email, разбирает JSON и возвращает `json.userExists == true`; ниже результат присваивается переменной через `await`.

### Пример из материала

```ts
async userExists(email: string): Promise<boolean> {
  const response = await fetch(`http://localhost:3000/user_exists/${email}`);
  const json = await response.json();
  return json.userExists == true;
}

success: boolean = await userExists("j.faichney@griffith.edu.au");
```

### В чём несоответствие

Главная мысль (возвращаемое значение оборачивается в Promise) верна. Но:

1. **Нет проверки `response.ok`** — при 404 или 500 код попробует разобрать страницу ошибки ([П-3](#p-3)).
2. **Email вставлен в адрес как есть.** Символы вроде `+`, `#`, `/` и пробела ломают путь; значение нужно кодировать через `encodeURIComponent`.
3. **`==` вместо `===`.** Нестрогое сравнение приводит типы; например, `1 == true` — истина.
4. **Последняя строка вне `async`-функции.** Запись вида `success: boolean = await ...` — это объявление поля класса; в инициализаторе поля `await` использовать нельзя. Её нужно поместить внутрь `async`-функции или метода.
5. Формулировка «могут возвращать **только** Promise» точнее звучит так: `async`-функция **всегда** возвращает Promise, что бы ни стояло после `return`.

### Как правильно

Проверять ответ, кодировать параметр, сравнивать строго, ждать результат внутри `async`-кода.

### Пример

```ts
async function userExists(email: string): Promise<boolean> {
  const response = await fetch(`/api/users/exists/${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const json: { userExists: boolean } = await response.json();
  return json.userExists === true;
}

async function checkEmail(email: string): Promise<void> {
  try {
    const success: boolean = await userExists(email);
    console.log(success ? 'занят' : 'свободен');
  } catch (err) {
    console.error('Проверка не удалась', err);
  }
}
```

**Источник:** [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) · [MDN — encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)

---

<a id="p-6"></a>

## П-6. Promise ↔ Observable 🔵

### Как в материале

Сказано, что в RxJS есть функция `from`, которая превращает в Observable многое, в первую очередь итерируемые объекты вроде массивов (каждый элемент по очереди передаётся наблюдателю), а также Promise. В примере промис от `fetch` превращается в Observable, и на него подписываются с обработчиками `next`, `error`, `complete`.

### Пример из материала

```ts
const data = from(fetch('/api/endpoint'));
data.subscribe({
    next(response) { console.log(response); },
    error(err) { console.error('Error: ' + err); },
    complete() { console.log('Completed'); }
});
```

### В чём несоответствие

Пример рабочий, но упущены две вещи, важные на практике:

1. **`from(fetch(...))` не ленивый.** Promise начинает работу в момент создания, поэтому запрос уходит **сразу** при вызове `from(fetch(...))`, даже если никто не подпишется, и повторная подписка не отправит запрос заново. Чтобы запрос выполнялся при подписке (как у обычных Observable), используют `defer(() => fetch(...))`. Проверено: после `from(...)` запрос уже запущен, после `defer(...)` — только когда на него подписались.
2. **Обратное преобразование.** Метод `observable.toPromise()` объявлен устаревшим в RxJS 7 и будет удалён в версии 8. Вместо него — функции `firstValueFrom` и `lastValueFrom`.

### Как правильно

`defer` для ленивого Observable из Promise; `firstValueFrom`/`lastValueFrom` для Promise из Observable.

### Пример

```ts
import { defer, firstValueFrom, lastValueFrom, from, interval, take } from 'rxjs';

const eager$ = from(fetch('/api/groups'));          // запрос уже ушёл
const lazy$ = defer(() => fetch('/api/groups'));    // уйдёт при каждой подписке

async function demo() {
  const response = await firstValueFrom(lazy$);     // первое значение → Promise
  const last = await lastValueFrom(interval(100).pipe(take(3)));  // 2 — последнее
  console.log(response.status, last);
}

// ❌ устарело: await observable.toPromise()
```

**Источник:** [RxJS — Conversion to Promises](https://rxjs.dev/deprecations/to-promise) · [RxJS API — defer](https://rxjs.dev/api/index/function/defer) · [RxJS API — from](https://rxjs.dev/api/index/function/from)

# 6_2 — Promises и async-функции: вопросы для самопроверки

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_2-promises-async-konspekt.md) · [поправки](6_2-promises-async-popravki.md) · [примеры](6_2-promises-async-primery.md) · [ответы](6_2-promises-async-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для кода сначала предскажи результат.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Promise

<a id="q-1"></a>

### 1. Promise и Observable

Назови три отличия Promise от Observable.

[→ ответ](6_2-promises-async-otvety.md#a-1)

<a id="q-2"></a>

### 2. Состояния

В каких состояниях бывает Promise? Кто и как переводит его из одного в другое?

[→ ответ](6_2-promises-async-otvety.md#a-2)

<a id="q-3"></a>

### 3. `then` и цепочки

Что получает обработчик `then`? Что возвращает сам `then` и что будет, если обработчик вернёт Promise?

[→ ответ](6_2-promises-async-otvety.md#a-3)

---

## B. fetch

<a id="q-4"></a>

### 4. Что выведет?

```js
fetch('/api/does-not-exist')
  .then((r) => console.log('then', r.status))
  .catch(() => console.log('catch'));
```

Сервер отвечает `404`.

[→ ответ](6_2-promises-async-otvety.md#a-4)

<a id="q-5"></a>

### 5. Найди ошибку

```js
fetch('/api/groups').then((response) => {
  console.log('Data received: ' + response.body);
});
```

[→ ответ](6_2-promises-async-otvety.md#a-5)

---

## C. async/await

<a id="q-6"></a>

### 6. Сколько секунд?

```js
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function a() { await wait(2000); await wait(1000); }
async function b() { await Promise.all([wait(2000), wait(1000)]); }
```

Сколько выполняется `a()` и `b()`? Когда что выбрать?

[→ ответ](6_2-promises-async-otvety.md#a-6)

<a id="q-7"></a>

### 7. Ошибка в `await`

Что делает `await`, если Promise отклонён? Как это обработать?

[→ ответ](6_2-promises-async-otvety.md#a-7)

<a id="q-8"></a>

### 8. Правила `await`

Верно ли, что `await` работает только в `async`-функциях и только с Promise?

[→ ответ](6_2-promises-async-otvety.md#a-8)

---

## D. Promise ↔ Observable

<a id="q-9"></a>

### 9. `from` и `defer`

Когда уйдёт запрос в каждом случае и сколько раз, если подписаться дважды?

```ts
const a$ = from(fetch('/api/groups'));
const b$ = defer(() => fetch('/api/groups'));
```

[→ ответ](6_2-promises-async-otvety.md#a-9)

<a id="q-10"></a>

### 10. Observable → Promise

Чем заменить устаревший `observable.toPromise()`? Чем отличаются два варианта?

[→ ответ](6_2-promises-async-otvety.md#a-10)

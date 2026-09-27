# 6_2 — Promises и async-функции: ответы

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_2-promises-async-konspekt.md) · [поправки](6_2-promises-async-popravki.md) · [примеры](6_2-promises-async-primery.md) · [вопросы](6_2-promises-async-voprosy.md)

---

## A. Promise

<a id="a-1"></a>

### 1. Promise и Observable

**Ответ:** Promise даёт одно значение (или ошибку), Observable — сколько угодно; Promise начинает работу сразу при создании, Observable — при подписке; Promise нельзя отменить, от Observable можно отписаться. Плюс Promise встроен в JavaScript, Observable — из RxJS.

**Подробнее:** [Конспект §1](6_2-promises-async-konspekt.md#s1) · [← вопрос](6_2-promises-async-voprosy.md#q-1)

<a id="a-2"></a>

### 2. Состояния

**Ответ:** pending (ожидание), fulfilled (выполнен), rejected (отклонён). Создатель промиса вызывает `resolve(value)` или `reject(reason)` в функции-исполнителе; перейти из pending можно только один раз.

**Подробнее:** [Конспект §2](6_2-promises-async-konspekt.md#s2) · [← вопрос](6_2-promises-async-voprosy.md#q-2)

<a id="a-3"></a>

### 3. `then` и цепочки

**Ответ:** обработчик `onFulfilled` получает один аргумент — значение (второй обработчик `onRejected` — причину ошибки). `then` возвращает новый Promise; если обработчик вернул Promise, следующий `then` дождётся его результата — так строятся цепочки.

**Подробнее:** [Конспект §3, §5](6_2-promises-async-konspekt.md#s3) · [П-1](6_2-promises-async-popravki.md#p-1) · [← вопрос](6_2-promises-async-voprosy.md#q-3)

---

## B. fetch

<a id="a-4"></a>

### 4. Что выведет

**Ответ:** `then 404`. `fetch` отклоняется только при сетевой ошибке; ответ 404 — это успешно полученный ответ. Статус проверяют через `response.ok` или `response.status`.

**Подробнее:** [Конспект §4](6_2-promises-async-konspekt.md#s4) · [П-3](6_2-promises-async-popravki.md#p-3) · [← вопрос](6_2-promises-async-voprosy.md#q-4)

<a id="a-5"></a>

### 5. Найди ошибку

**Ответ:** `response.body` — поток (`ReadableStream`), а не данные; выведется `[object ReadableStream]`. Данные — через `await response.json()` (или `.text()`), предварительно проверив `response.ok`.

**Подробнее:** [П-2](6_2-promises-async-popravki.md#p-2) · [← вопрос](6_2-promises-async-voprosy.md#q-5)

---

## C. async/await

<a id="a-6"></a>

### 6. Сколько секунд

**Ответ:** `a()` — 3 секунды (последовательно), `b()` — 2 секунды (параллельно, время самого долгого). `await` подряд — когда следующая операция зависит от предыдущей; `Promise.all` — когда операции независимы.

**Подробнее:** [Конспект §6.4](6_2-promises-async-konspekt.md#s6-4) · [← вопрос](6_2-promises-async-voprosy.md#q-6)

<a id="a-7"></a>

### 7. Ошибка в `await`

**Ответ:** бросает исключение с причиной отклонения. Ловят `try/catch` вокруг `await`; без него ошибка отклонит Promise, который вернула сама `async`-функция.

**Подробнее:** [Конспект §6.4](6_2-promises-async-konspekt.md#s6-4) · [Пример 1](6_2-promises-async-primery.md#ex-1) · [← вопрос](6_2-promises-async-voprosy.md#q-7)

<a id="a-8"></a>

### 8. Правила `await`

**Ответ:** нет. `await` работает и на верхнем уровне ES-модулей, и с любым значением: не-Promise просто возвращается (`await 42` → `42`).

**Подробнее:** [Конспект §6.3](6_2-promises-async-konspekt.md#s6-3) · [П-4](6_2-promises-async-popravki.md#p-4) · [← вопрос](6_2-promises-async-voprosy.md#q-8)

---

## D. Promise ↔ Observable

<a id="a-9"></a>

### 9. `from` и `defer`

**Ответ:** `from(fetch(...))` — запрос уходит сразу при создании, один раз; повторная подписка получит тот же результат. `defer(() => fetch(...))` — запрос уходит при подписке, при каждой новой подписке — заново: две подписки — два запроса.

**Подробнее:** [Конспект §8](6_2-promises-async-konspekt.md#s8) · [П-6](6_2-promises-async-popravki.md#p-6) · [← вопрос](6_2-promises-async-voprosy.md#q-9)

<a id="a-10"></a>

### 10. Observable → Promise

**Ответ:** `firstValueFrom(obs$)` — Promise с первым значением (после него — отписка); `lastValueFrom(obs$)` — Promise с последним значением после завершения потока. Для бесконечного потока `lastValueFrom` не завершится.

**Подробнее:** [Конспект §8](6_2-promises-async-konspekt.md#s8) · [Пример 2](6_2-promises-async-primery.md#ex-2) · [← вопрос](6_2-promises-async-voprosy.md#q-10)

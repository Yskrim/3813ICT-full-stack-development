# 6_2 — Promises and async functions: ответы

**Курс:** 3813ICT, неделя 6  
**Предыдущие темы:** [6.0 — Reactive Programming](6_0-reactive-programming-konspekt.md) · [6.1 — Observables](6_1-observables-konspekt.md)  
**Связанные файлы:** [конспект](6_2-promises-async-konspekt.md) · [поправки](6_2-promises-async-popravki.md) · [примеры](6_2-promises-async-primery.md) · [вопросы](6_2-promises-async-voprosy.md)

Вспомни нашу предыдущую модель: Observer получает уведомления, а Observable может выдать их несколько. Теперь сравним её с одним будущим результатом Promise и разберём HTTP-путь шаг за шагом.

## A. Promise и Observable

<a id="a-1"></a>

### 1. Что обещает Promise?

**Ответ:** состояния — `pending`, `fulfilled`, `rejected`. После fulfilled Promise не может перейти в rejected и наоборот.

**Почему:** одна операция имеет один итог — успех со значением либо отказ. Promise не представляет поток последующих значений.

**Подробнее:** [Конспект §2.1](6_2-promises-async-konspekt.md#s2-1) · [← вопрос](6_2-promises-async-voprosy.md#q-1)

<a id="a-2"></a>

### 2. «Одноразовый» Promise

**Ответ:** нет, завершённый Promise можно читать через новый `then()` или `await`; можно добавить несколько обработчиков.

**Почему:** единожды завершается сама операция. Она не запускается повторно от каждого `then`, но один и тот же итог доступен обработчикам.

**Подробнее:** [Конспект §2.1](6_2-promises-async-konspekt.md#s2-1) · [П-1](6_2-promises-async-popravki.md#p-1) · [← вопрос](6_2-promises-async-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Какой тип выбрать?

**Ответ:** Promise — для результата запроса пользователя (один итог или ошибка); Observable — для повторяющихся сообщений в реальном времени.

**Почему:** тип выбирают по форме данных: единичный итог операции или последовательность значений.

**Подробнее:** [Конспект §1](6_2-promises-async-konspekt.md#s1) · [6.1, §4](6_1-observables-konspekt.md#s4) · [← вопрос](6_2-promises-async-voprosy.md#q-3)

## B. `fetch` и Promise-цепочки

<a id="b-4"></a>

### 4. Что возвращает `fetch`?

**Ответ:** сначала `Response`, не массив. Нужно вызвать и дождаться `response.json()` (или `text()`, если тело — текст).

**Почему:** HTTP-ответ и содержимое тела — разные асинхронные этапы.

**Подробнее:** [Конспект §3.1](6_2-promises-async-konspekt.md#s3-1) · [П-3](6_2-promises-async-popravki.md#p-3) · [← вопрос](6_2-promises-async-voprosy.md#q-4)

<a id="b-5"></a>

### 5. Ответ 404

**Ответ:** обычно нет. Promise от `fetch()` fulfilled объектом Response и при HTTP 404. Проверь `response.ok` или `response.status`.

**Почему:** rejected Promise обычно обозначает сетевую/схемную проблему; HTTP-ошибочный статус всё равно является полученным ответом.

**Подробнее:** [Конспект §3.1](6_2-promises-async-konspekt.md#s3-1) · [П-3](6_2-promises-async-popravki.md#p-3) · [← вопрос](6_2-promises-async-voprosy.md#q-5)

<a id="b-6"></a>

### 6. Зачем `return response.json()`?

**Ответ:** чтобы Promise-цепочка дождалась разбора JSON и передала готовые данные следующему `then`.

**Почему:** `response.json()` возвращает Promise. Возвращая его, мы связываем следующий обработчик с его результатом.

**Подробнее:** [Конспект §3.2](6_2-promises-async-konspekt.md#s3-2) · [Пример 1](6_2-promises-async-primery.md#ex-1) · [← вопрос](6_2-promises-async-voprosy.md#q-6)

## C. async и await

<a id="c-7"></a>

### 7. Что именно приостанавливается?

**Ответ:** приостанавливается продолжение текущей async-функции; остальной JavaScript может выполняться.

**Почему:** `await` отдаёт управление, пока ждёт Promise, но не блокирует весь поток исполнения браузера.

**Подробнее:** [Конспект §4.1](6_2-promises-async-konspekt.md#s4-1) · [← вопрос](6_2-promises-async-voprosy.md#q-7)

<a id="c-8"></a>

### 8. `await` без Promise

**Ответ:** ошибки нет. `result` станет равен 42; вызов `example()` возвращает Promise, который fulfilled значением 42.

**Почему:** `await` принимает и обычное значение; `async`-функция всегда возвращает Promise.

**Подробнее:** [Конспект §4.1](6_2-promises-async-konspekt.md#s4-1) · [Конспект §4.2](6_2-promises-async-konspekt.md#s4-2) · [П-4](6_2-promises-async-popravki.md#p-4) · [← вопрос](6_2-promises-async-voprosy.md#q-8)

<a id="c-9"></a>

### 9. Ошибка из `await`

**Ответ:** `await` выбрасывает причину rejection как ошибку в этой точке. Перехвати её в `try/catch` вокруг `await`.

```js
try {
  const data = await loadData();
} catch (error) {
  console.error(error);
}
```

**Подробнее:** [Конспект §4.2](6_2-promises-async-konspekt.md#s4-2) · [← вопрос](6_2-promises-async-voprosy.md#q-9)

<a id="c-10"></a>

### 10. Последовательно или параллельно?

**Ответ:** `await Promise.all([firstRequest(), secondRequest()])` запускает обе независимые операции и ждёт их вместе.

**Почему:** оба Promise создаются до ожидания. Используй это, только если результаты не нужны друг другу для запуска.

**Подробнее:** [Конспект §4.2](6_2-promises-async-konspekt.md#s4-2) · [Пример 3](6_2-promises-async-primery.md#ex-3) · [← вопрос](6_2-promises-async-voprosy.md#q-10)

## D. Promise в Observable

<a id="d-11"></a>

### 11. Сколько будет `next`?

**Ответ:** один `next('готово')`, затем `complete()`.

**Почему:** Promise выдаёт один успешный итог; `from()` превращает его в Observable с одним значением.

**Подробнее:** [Конспект §5](6_2-promises-async-konspekt.md#s5) · [← вопрос](6_2-promises-async-voprosy.md#q-11)

<a id="d-12"></a>

### 12. Promise rejected

**Ответ:** Observable вызывает `error(error)`; отказ обрабатывает `error` callback.

**Почему:** при конверсии из Promise успешный итог становится `next`, а rejection — уведомлением ошибки.

**Подробнее:** [Конспект §5](6_2-promises-async-konspekt.md#s5) · [Пример 4](6_2-promises-async-primery.md#ex-4) · [← вопрос](6_2-promises-async-voprosy.md#q-12)

# 6_2 — Promises and async functions: вопросы для самопроверки

**Курс:** 3813ICT, неделя 6  
**Предыдущие темы:** [6.0 — Reactive Programming](6_0-reactive-programming-konspekt.md) · [6.1 — Observables](6_1-observables-konspekt.md)  
**Связанные файлы:** [конспект](6_2-promises-async-konspekt.md) · [поправки](6_2-promises-async-popravki.md) · [примеры](6_2-promises-async-primery.md) · [ответы](6_2-promises-async-otvety.md)

Как мы уже различали в 6.1, Observable может выдавать несколько значений. Здесь проверим, как Promise представляет итог одной операции и как читать асинхронный код без ошибок в статусах и типах результата.

## A. Promise и Observable

Для начала сравни назначение типов, не синтаксис: какой ответ ожидает задача?

<a id="q-1"></a>

### 1. Что обещает Promise?

Какие три состояния проходит Promise? Может ли он завершиться успешно, а затем перейти в rejected?

[→ ответ](6_2-promises-async-otvety.md#a-1)

<a id="q-2"></a>

### 2. «Одноразовый» Promise

Правда ли, что к завершённому Promise нельзя обращаться снова или добавлять другой `then()`? Что именно «одноразово» в Promise?

[→ ответ](6_2-promises-async-otvety.md#a-2)

<a id="q-3"></a>

### 3. Какой тип выбрать?

Выбираешь между одним ответом API «найден пользователь / ошибка» и потоком новых сообщений в реальном времени. Где естественнее Promise, а где Observable?

[→ ответ](6_2-promises-async-otvety.md#a-3)

## B. `fetch` и Promise-цепочки

Теперь проследи путь HTTP-ответа: сначала приходит Response, потом код отдельно разбирает тело.

<a id="q-4"></a>

### 4. Что возвращает `fetch`?

После `await fetch('/api/items')` в переменной `response` лежит готовый массив items? Что нужно сделать, чтобы прочитать JSON?

[→ ответ](6_2-promises-async-otvety.md#b-4)

<a id="q-5"></a>

### 5. Ответ 404

Отклонится ли Promise от `fetch()` автоматически, если сервер вернул HTTP 404? Как это проверить?

[→ ответ](6_2-promises-async-otvety.md#b-5)

<a id="q-6"></a>

### 6. Зачем `return response.json()`?

В цепочке `.then((response) => response.json()).then((data) => ...)` почему первый `then` возвращает Promise чтения тела?

[→ ответ](6_2-promises-async-otvety.md#b-6)

## C. async и await

Представь `await` как паузу в одной функции. Проверь, где она происходит и какой итог получает вызывающий код.

<a id="q-7"></a>

### 7. Что именно приостанавливается?

Когда функция выполняет `await fetch(...)`, останавливается ли весь JavaScript в браузере?

[→ ответ](6_2-promises-async-otvety.md#c-7)

<a id="q-8"></a>

### 8. `await` без Promise

```js
async function example() {
  const result = await 42;
  return result;
}
```

Будет ли ошибка? Какой тип возвращает `example()`?

[→ ответ](6_2-promises-async-otvety.md#c-8)

<a id="q-9"></a>

### 9. Ошибка из `await`

Если Promise rejected, что произойдёт в строке `const data = await loadData()`? Как перехватить ошибку?

[→ ответ](6_2-promises-async-otvety.md#c-9)

<a id="q-10"></a>

### 10. Последовательно или параллельно?

Два независимых запроса по очереди ожидаются через два `await`. Как запустить оба одновременно и дождаться обоих результатов?

[→ ответ](6_2-promises-async-otvety.md#c-10)

## D. Promise в Observable

Завершим переходом к знакомому RxJS: теперь ты должен уметь заранее сказать, сколько значений даст `from(promise)`.

<a id="q-11"></a>

### 11. Сколько будет `next`?

Если Promise fulfilled значением `'готово'`, сколько уведомлений `next` даст Observable, созданный через `from(promise)`? Что идёт после него?

[→ ответ](6_2-promises-async-otvety.md#d-11)

<a id="q-12"></a>

### 12. Promise rejected

Во что превратится rejected Promise при передаче в `from()`? Какой callback Observer сможет обработать отказ?

[→ ответ](6_2-promises-async-otvety.md#d-12)

# 6_1 — Observables: ответы

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_1-observables-konspekt.md) · [поправки](6_1-observables-popravki.md) · [примеры](6_1-observables-primery.md) · [вопросы](6_1-observables-voprosy.md)

---

## A. RxJS и типы

<a id="a-1"></a>

### 1. Части RxJS

**Ответ:** `Observable` — источник значений, на который подписываются; `Observer` — получатель с `next`, `error`, `complete`; `Subject` — Observable, который рассылает одно значение всем подписчикам и сам является Observer; `Subscription` — результат `subscribe()`, у неё есть `unsubscribe()`.

**Подробнее:** [Конспект §2](6_1-observables-konspekt.md#s2) · [← вопрос](6_1-observables-voprosy.md#q-1)

<a id="a-2"></a>

### 2. Generics

**Ответ:** функция работает с любым типом, сохраняя проверку: с массивом чисел `T = number`, и `fn` обязана принимать и возвращать число. Функция, возвращающая строку, вызовет ошибку компиляции.

**Подробнее:** [Конспект §3](6_1-observables-konspekt.md#s3) · [← вопрос](6_1-observables-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Контракт потока

**Ответ:** `next` — сколько угодно раз (ноль или больше), затем ровно одно из `error` или `complete` — или ни одного, если поток бесконечный. После `error` или `complete` значения не приходят.

**Подробнее:** [Конспект §4](6_1-observables-konspekt.md#s4) · [← вопрос](6_1-observables-voprosy.md#q-3)

---

## B. Subject

<a id="a-4"></a>

### 4. Что выведет

**Ответ:** `A 1`, `B 2`, `C 42`, `D 42`. Обычный Observable — unicast: каждая подписка запускает источник заново. Subject — multicast: одно значение уходит всем.

**Подробнее:** [Конспект §6.2](6_1-observables-konspekt.md#s6-2) · [П-2](6_1-observables-popravki.md#p-2) · [← вопрос](6_1-observables-voprosy.md#q-4)

<a id="a-5"></a>

### 5. Найди ошибку

**Ответ:** `subject.unsubscribe()` не принимает аргументов (ошибка компиляции) и закрывает весь Subject. Отписывают подписку: `const sub = subject.subscribe(observer); … sub.unsubscribe();`.

**Подробнее:** [Конспект §6.3](6_1-observables-konspekt.md#s6-3) · [П-3](6_1-observables-popravki.md#p-3) · [← вопрос](6_1-observables-voprosy.md#q-5)

<a id="a-6"></a>

### 6. Что выведет

**Ответ:** `A 1`, `B 1`, `B 2`, `B done`. После `a.unsubscribe()` A больше ничего не получает; после `complete()` значение 3 никто не получит.

**Подробнее:** [Конспект §6.3](6_1-observables-konspekt.md#s6-3) · [← вопрос](6_1-observables-voprosy.md#q-6)

<a id="a-7"></a>

### 7. Subject или BehaviorSubject

**Ответ:** выбранный канал — `BehaviorSubject` (или сигнал): это текущее значение, и новый подписчик должен сразу его получить. «Пришло сообщение» — `Subject`: это событие, опоздавшим подписчикам прошлые события не нужны.

**Подробнее:** [Конспект §7](6_1-observables-konspekt.md#s7) · [Пример 1](6_1-observables-primery.md#ex-1) · [← вопрос](6_1-observables-voprosy.md#q-7)

<a id="a-8"></a>

### 8. Только чтение наружу

**Ответ:** чтобы компоненты не могли вызвать `next()` и менять состояние в обход сервиса. Изменять можно только методами сервиса — так легче понять, откуда пришло изменение.

**Подробнее:** [Пример 1](6_1-observables-primery.md#ex-1) · [← вопрос](6_1-observables-voprosy.md#q-8)

---

## C. На практике

<a id="a-9"></a>

### 9. Два запроса вместо одного

**Ответ:** HTTP-Observable — unicast: каждая подписка запускает запрос заново. Один запрос даёт `pipe(shareReplay(1))`: источник запускается один раз, последний результат раздаётся всем подписчикам.

**Подробнее:** [Пример 2](6_1-observables-primery.md#ex-2) · [← вопрос](6_1-observables-voprosy.md#q-9)

<a id="a-10"></a>

### 10. Интерфейс Observer

**Ответ:** `interface Observer<T> { next: (value: T) => void; error: (err: any) => void; complete: () => void; }` — без поля `closed` (оно было в RxJS 6). Класс не нужен: в `subscribe` передают объект с нужными полями или одну функцию для `next`.

**Подробнее:** [Конспект §4–5](6_1-observables-konspekt.md#s4) · [П-1](6_1-observables-popravki.md#p-1) · [← вопрос](6_1-observables-voprosy.md#q-10)

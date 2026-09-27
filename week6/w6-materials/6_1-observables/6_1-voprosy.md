# 6_1 — Observables: вопросы для самопроверки

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_1-observables-konspekt.md) · [поправки](6_1-observables-popravki.md) · [примеры](6_1-observables-primery.md) · [ответы](6_1-observables-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для кода сначала предскажи результат.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. RxJS и типы

<a id="q-1"></a>

### 1. Части RxJS

Что такое `Observable`, `Observer`, `Subject` и `Subscription` — по одной фразе?

[→ ответ](6_1-observables-otvety.md#a-1)

<a id="q-2"></a>

### 2. Generics

Что даёт `<T>` в функции `mapAll<T>(array: T[], fn: (x: T) => T): T[]`? Что будет, если вызвать её с массивом чисел и функцией, возвращающей строку?

[→ ответ](6_1-observables-otvety.md#a-2)

<a id="q-3"></a>

### 3. Контракт потока

Сколько раз может быть вызван `next`, `error` и `complete`? Что происходит после `complete`?

[→ ответ](6_1-observables-otvety.md#a-3)

---

## B. Subject

<a id="q-4"></a>

### 4. Что выведет?

```ts
let runs = 0;
const cold$ = new Observable<number>((s) => { runs++; s.next(runs); });
cold$.subscribe((v) => console.log('A', v));
cold$.subscribe((v) => console.log('B', v));

const hot = new Subject<number>();
hot.subscribe((v) => console.log('C', v));
hot.subscribe((v) => console.log('D', v));
hot.next(42);
```

[→ ответ](6_1-observables-otvety.md#a-4)

<a id="q-5"></a>

### 5. Найди ошибку

```ts
const subject = new Subject<number>();
subject.subscribe(observer);
subject.next(5);
subject.unsubscribe(observer);
```

[→ ответ](6_1-observables-otvety.md#a-5)

<a id="q-6"></a>

### 6. Что выведет?

```ts
const s = new Subject<number>();
const a = s.subscribe((n) => console.log('A', n));
s.subscribe({ next: (n) => console.log('B', n), complete: () => console.log('B done') });
s.next(1); a.unsubscribe(); s.next(2); s.complete(); s.next(3);
```

[→ ответ](6_1-observables-otvety.md#a-6)

<a id="q-7"></a>

### 7. Subject или BehaviorSubject

Что использовать для «выбранного канала» и что — для «пришло сообщение»? Почему?

[→ ответ](6_1-observables-otvety.md#a-7)

<a id="q-8"></a>

### 8. Только чтение наружу

Зачем сервис отдаёт `subject.asObservable()`, а не сам Subject?

[→ ответ](6_1-observables-otvety.md#a-8)

---

## C. На практике

<a id="q-9"></a>

### 9. Два запроса вместо одного

На `groups$ = this.http.get(...)` подписаны список и счётчик — в Network видно два запроса. Почему? Как оставить один?

[→ ответ](6_1-observables-otvety.md#a-9)

<a id="q-10"></a>

### 10. Интерфейс Observer

Как выглядит интерфейс `Observer<T>` в RxJS 7? Нужно ли писать класс, чтобы подписаться?

[→ ответ](6_1-observables-otvety.md#a-10)

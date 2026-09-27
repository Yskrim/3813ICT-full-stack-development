# 6_1 — Observables: поправки

**Курс:** 3813ICT, неделя 6
**Источник:** `6_1_-_Observables.pdf`
**Связанные файлы:** [конспект](6_1-observables-konspekt.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: код скомпилирован TypeScript 5.9 в строгом режиме и запущен с RxJS 7.8. Сообщения об ошибках и вывод ниже — реальные.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Интерфейс Observer с полем `closed` | 🔵 | Так он выглядел в RxJS 6; в RxJS 7 — только `next`, `error`, `complete` |
| [П-2](#p-2) | Чем Subject отличается от Observable | 🟡 | Не «кто хранит список», а unicast и multicast; Subject — ещё и Observer |
| [П-3](#p-3) | `subject.unsubscribe(observer)` | 🔴 | Ошибка компиляции; этот метод закрывает весь Subject |
| [П-4](#p-4) | Функция `every` меняет массив | 🟡 | Лучше возвращать новый массив, как `map` |

---

<a id="p-1"></a>

## П-1. Интерфейс Observer с полем `closed` 🔵

### Как в материале

Показан код интерфейса Observer из RxJS с полями `closed`, `next`, `error` и `complete`, и дальше он разбирается как пример функций в роли типа.

### Пример из материала

```ts
interface Observer<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}
```

### В чём несоответствие

Так интерфейс выглядел в RxJS 6. В RxJS 7, которую использует Angular, у `Observer<T>` три поля — `next`, `error`, `complete`. Свойство `closed` есть у `Subscription` и `Subscriber` (отписана ли подписка), но не у интерфейса наблюдателя. На разбор «функций как типа» это не влияет, но при чтении документации и исходников RxJS 7 поля `closed` там не будет.

### Как правильно

```ts
interface Observer<T> {
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}
```

### Пример

```ts
import { Observer, Subscription, of } from 'rxjs';

const observer: Observer<number> = {
  next: (v) => console.log(v),
  error: (e) => console.error(e),
  complete: () => console.log('done'),
};

const subscription: Subscription = of(1, 2).subscribe(observer);
console.log(subscription.closed);   // true — closed есть у подписки, а не у наблюдателя
```

**Источник:** [RxJS API — Observer](https://rxjs.dev/api/index/interface/Observer) · [RxJS — Observer guide](https://rxjs.dev/guide/observer)

---

<a id="p-2"></a>

## П-2. Чем Subject отличается от Observable 🟡

### Как в материале

Сказано, что класс Subject — центральная часть RxJS, но сам методов не предоставляет: он подкласс Observable, который и даёт все методы. Разница объяснена так: Subject сам управляет своим списком наблюдателей, а Observable списком не управляет, и это должен делать подкласс.

### Пример из материала

Кода нет.

### В чём несоответствие

1. **Subject даёт свои методы.** Да, он подкласс Observable и наследует `subscribe` и `pipe`. Но он ещё и **Observer**: у него есть собственные `next`, `error`, `complete`, через которые значения отправляются подписчикам. Именно этим он и полезен.
2. **Главное отличие — не «кто хранит список».** Обычный Observable **unicast**: каждая подписка запускает функцию-источник заново, и у каждого подписчика своё выполнение. Subject **multicast**: выполнение одно, и одно значение получают все подписчики. Формулировка «подкласс должен сам вести список» уводит в сторону: чтобы сделать свой Observable, наследоваться не нужно — достаточно `new Observable(...)`.

### Как правильно

Observable — ленивый источник, каждая подписка — отдельное выполнение (unicast). Subject — Observable и Observer одновременно, рассылает одно значение всем подписчикам (multicast).

### Пример

```ts
import { Observable, Subject } from 'rxjs';

let runs = 0;
const cold$ = new Observable<number>((subscriber) => {
  runs++;                           // считаем запуски источника
  subscriber.next(runs);
});
cold$.subscribe((v) => console.log('A', v));   // A 1
cold$.subscribe((v) => console.log('B', v));   // B 2 — источник запустился второй раз

const subject = new Subject<number>();
subject.subscribe((v) => console.log('A', v));
subject.subscribe((v) => console.log('B', v));
subject.next(42);                              // A 42, B 42 — одно значение для всех
```

**Источник:** [RxJS — Subject](https://rxjs.dev/guide/subject) — там прямо сказано, что обычные Observable unicast, а Subject multicast, и что каждый Subject — это Observer с методами `next`, `error`, `complete`

---

<a id="p-3"></a>

## П-3. `subject.unsubscribe(observer)` 🔴

### Как в материале

Пример создаёт `NumberObserver` и `Subject<number>`, подписывает наблюдателя, отправляет 5 и 7 и последней строкой — с комментарием «удалить наблюдателя из списка» — вызывает `subject.unsubscribe(observer)`.

### Пример из материала

```ts
let observer = new NumberObserver();
let subject = new Subject<number>();
subject.subscribe(observer);
subject.next(5);
subject.next(7);

// Remove observer from the list of observers
subject.unsubscribe(observer);
```

### В чём несоответствие

1. **Ошибка компиляции.** `Subject.unsubscribe()` не принимает аргументов: `error TS2554: Expected 0 arguments, but got 1.`
2. **Метод делает другое.** `subject.unsubscribe()` не удаляет одного наблюдателя, а закрывает весь Subject: список очищается, а следующий `next` бросает ошибку `ObjectUnsubscribedError`.
3. **Отписывают подписку, а не наблюдателя.** `subscribe()` возвращает объект `Subscription`, и именно у него вызывают `unsubscribe()` — тогда уходит только этот подписчик.

Проверено запуском: после `sub.unsubscribe()` один подписчик перестаёт получать значения, остальные продолжают; после `subject.unsubscribe()` вызов `next` бросает `ObjectUnsubscribedError`.

### Как правильно

Сохранить `Subscription` из `subscribe()` и вызвать у неё `unsubscribe()`. Чтобы корректно завершить Subject для всех, используют `complete()`.

### Пример

```ts
import { Subject } from 'rxjs';

const subject = new Subject<number>();

const subA = subject.subscribe({
  next: (n) => console.log('A', n),
  complete: () => console.log('A complete'),
});
subject.subscribe({
  next: (n) => console.log('B', n),
  complete: () => console.log('B complete'),
});

subject.next(5);        // A 5, B 5
subA.unsubscribe();     // ✅ ушёл только A
subject.next(9);        // B 9
subject.complete();     // B complete — корректное завершение для всех
subject.next(11);       // игнорируется

// ❌ subject.unsubscribe(observer) — ошибка компиляции
// ⚠ subject.unsubscribe()       — закроет Subject; следующий next бросит ObjectUnsubscribedError
```

**Источник:** [RxJS — Subscription](https://rxjs.dev/guide/subscription) · [RxJS API — Subject](https://rxjs.dev/api/index/class/Subject)

---

<a id="p-4"></a>

## П-4. Функция `every` меняет массив 🟡

### Как в материале

Generics объясняются на функции `every`, которая принимает массив и функцию и заменяет каждый элемент массива результатом функции. Подчёркивается, что `number` заменён на `T`, а `<T>` после имени функции объявляет этот тип.

### Пример из материала

```ts
function every<T>(array: Array<T>, fn: (x: T) => T): void {
    for (let i = 0; i < array.length; i++) {
        array[i] = fn(array[i]);
    }
}
```

### В чём несоответствие

Как иллюстрация generics пример верен. Но функция **меняет переданный массив на месте**: после вызова исходные данные потеряны, и тот, кто передал массив, может не ожидать этого. В Angular это особенно заметно: сигналы и `@for` с `track` рассчитывают на новые массивы, а не на изменённые старые ([5_2 §6.3](5_2-services-konspekt.md#s6-3)). Встроенный `Array.prototype.map` делает то же преобразование, но возвращает **новый** массив.

### Как правильно

Возвращать новый массив; для преобразования элементов использовать `map`.

### Пример

```ts
function mapAll<T>(array: readonly T[], fn: (x: T) => T): T[] {
  return array.map(fn);            // readonly — компилятор не даст изменить исходный массив
}

const prices = [10, 20];
const withTax = mapAll(prices, (p) => p * 1.1);
console.log(prices);    // [10, 20] — исходные данные целы
console.log(withTax);   // [11, 22]
```

**Источник:** [MDN — Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) · [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

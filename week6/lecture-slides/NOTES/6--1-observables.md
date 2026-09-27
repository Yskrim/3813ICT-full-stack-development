# Observables

- ReactiveX, RxJS
- Observer, Subject
- Generics

ReactiveX что такое и с чем едят?

- стандарт исполнения observables
- RxJS = версия для JS, как раз ангулар его и юзает

Subject.

- выступает источником ивентов отправляемых в observers
- Основывается на "the Gang of Four Observer pattern":[https://en.wikipedia.org/wiki/Observer_pattern]

Структура такая:
Subject
-> observers[...]
-> subject.notifyObservers(changedValue)
-> observers[{1..changedValue},{2..changedValue},{3..changedValue}] == all observers get new value

### RxJS

- есть класс для subject
- есть класс для observer
- есть класс для observable

Observer interface

```ts
interface Observer<T> {
    closed?: boolean;
    next: (value: T) => void;
    error: (err: any) => void;
    complete: () => void;
}
```

Нахуя нам это говорят? а затем, чтобы мы сразу знали, чем в RxJS заменили Generics функции.

А кто такие эти Generics?
Щас все будет.

Вот пример:

```ts
function every<T>(array: Array<T>, fn: (x: T) => T): void {
    for (let i = 0; i < array.length; i++) {
        array[i] = fn(array[i]);
    }
}
```

- Короче я понял. Дженерики -- это вот эти фрагменты кода с <T>, куда пишется тип данных.
- Это для функций, которые принимают любой тип данных, и гарантируют, что все метки <T> будут одним и тем же типом.
- и вот эта функция, типо один и тот же конструктор для прогона коллбека.

### Observer interface

```ts
interface Observer<T> {
    closed?: boolean; // больше не обязателен в новом RxJS
    next: (value: T) => void;
    error: (err: any) => void;
    complete: () => void;
}
```

- next = переменная, хранит функцию, которая берет параметр типа <T> и ничего не возвращает. Тип здесь — это подпись функции, и такие типы можно писать где угодно, не только в интерфейсах.

- next, error, complete - это все коллбеки которые зовутся subject-ом

- в примере из начала файла, обзервер имеет только функцию changed.

- next - функция, зовется subject-ом, каждый раз при новом ивенте.
- error - функция, зовется при ошибке.
- complete - функция, зовется когда subject все передал и больше не передает значения.

Вот полный пример:

```ts
class NumberObserver implements Observer<number> {
    next(value: number): void {
        console.log("Next number: " + value);
    }
    error(err: any): void {
        console.log("Error: " + err);
    }
    complete(): void {
        console.log("We are finished!");
    }
}
```

### Subject

- класс Subject центральный в RxJS, у него много методов
- сам Subject прямо не дает эти методы.
- Subject это подкласс Observable, эти методы у него.

В чем различие?

- Subject управляет своим листом observers
- Observable не управляет листом observers, подкласс должен это делать.

Подписываться полным наблюдателем на практике почти никогда не нужно, потому что subscribe принимает `Partial<Observer<T>>` — то есть любой набор из этих трёх — или просто функцию:

```ts
subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription;
```

Поэтому в реальном коде ты будешь писать так, а не заводить класс NumberObserver:

```ts
subject.subscribe((value) => console.log(value)); // только next
subject.subscribe({ next: (v) => ..., error: (e) => ... }); // next + error
```

Subject одновременно и Observable, и Observer.

- Так и написано в документации самого RxJS:
  «Every Subject is an Observable and an Observer».
- Как Observable его можно слушать (subject.subscribe(...)),
- а как Observer — в него можно пихать значения (subject.next(...), subject.error(...), subject.complete(...)).

Отсюда и разница про список наблюдателей: Subject ведёт свой список подписчиков и раздаёт значения всем сразу, а Observable сам по себе только описывает, откуда значения берутся.

Правильный пример subject:

```ts
const observer = new NumberObserver();
const subject = new Subject<number>();
const subscription = subject.subscribe(observer); // subscription: Subscription
subject.next(5); // NumberObserver.next(5)
subject.next(7); // NumberObserver.next(7)
subscription.unsubscribe(); // отписался ТОЛЬКО этот наблюдатель
subject.next(9); // он этого уже не увидит, остальные — увидят
```

А когда поток закончился по-настоящему и надо сообщить об этом всем, зовут subject.complete() — тогда у каждого подписчика вызовется его complete.

- subject.unsubscribe() — это грубое «выключить рубильник», в прикладном коде почти не нужно.

Чего в лекции нет, но без этого понимание будет неправильным?

1. Контракт потока.
   У любого Observable есть строгая грамматика событий: - ноль или больше next, а - потом максимум одно завершающее событие — либо error, либо complete.
   После завершающего не приходит ничего и никогда, поток не возобновляется. То есть error — это не «ошибочка, поехали дальше», а конец жизни потока.
   То же самое после отписки: next больше не вызовется.

2. Ленивость и «холодность» Observable.
    - Чистый Observable ничего не делает, пока на него не подписались, и код-производитель выполняется заново для каждого подписчика.
    - Два подписчика на один Observable, делающий HTTP-запрос, — это два запроса.
    - Subject наоборот «горячий»: значение существует в момент вызова next и раздаётся всем текущим подписчикам одновременно, один раз.

3. Поздний подписчик у Subject теряет значения.
    - Это ты уже видел своими глазами в первом примере лекции: subject.changeValue('initial value') был вызван до подписок, поэтому observer1 его не получил.
    - С обычным Subject в RxJS ровно так же. Это не баг, это природа Subject: у него нет памяти.

4. Отсюда — зачем существует BehaviorSubject.
    - Он требует начальное значение и отдаёт текущее значение каждому, кто подписался, сразу в момент подписки.
    - Именно на нём в Angular делают хранение состояния в сервисах, и именно поэтому тебе это встретится сто раз:

    ```ts
    const state = new BehaviorSubject<string>("initial value");
    state.next("изменили до подписки");
    state.subscribe((v) => console.log(v)); // сразу напечатает 'изменили до подписки'
    ```

5. Утечки памяти — практическая часть.
    - Пока ты не отписался, Subject держит ссылку на твоего наблюдателя, и тот не соберётся сборщиком мусора.
    - В Angular это классический баг: компонент уничтожили, а подписка жива и продолжает работать с мёртвым компонентом. Отсюда привычка хранить Subscription и звать unsubscribe() в ngOnDestroy (или использовать async pipe, который делает это сам).
    - HTTP-запросы в этом смысле безопаснее, потому что они сами вызывают complete после ответа.

6. Observable против Promise.
    - Promise — одно значение, запускается сразу при создании, отменить нельзя.
    - Observable — от нуля до бесконечности значений, запускается при подписке, отменяется через unsubscribe.
    - Это следующая лекция (6.2-promises and async functions), но держать различие в голове стоит уже сейчас.


# Reactive programming

Зачем нужно?

- асинхронный код может быть сложнее синхронного
- проблема в том, что два event handlers могут менять вид независимо и поэтому дата будет непостоянная.
- реактив призван упростить асинк код и устранить эти проблемы.

### Imperative programming

- a = b + c
    - a будет постоянным, потому что он сохраняется в переменную.
    - изменения в "b" и "c" не изменят "а", пока не вычислить заново.

### Reactive programming

- a = b + c
    - выражение будет само обновляться если любой член изменится.

Binding = пример реактивного программирования

- ангулар связывает переменную и шаблон.
- изменение в переменной обновят html шаблон {{ a + b }}

### Observer pattern

- это паттерн софт дизайна
- переиспользуемый
- похож на алгоритм, но нужен для архитектуры, а не процесса.

- low coupling между компонентами (существуют независимо, получат дату или нет)
- publish/subscribe паттерн.
    1. Subscriber подписывается на изменения которые делает publisher.
    2. publisher добавляет Subscriber в лист
    3. При изменении, publisher отправляет message(broadcasts) каждому subscriber с описанием изменения.

Пример как всегда полное говно, ничего не показывает. Просто набор символов. Как это соотносится с курсом? как этот пример применять? Никого не ебет, смотрим и кушаем это говнище.

```ts
// example1

// class subj
class Subject {
    observers = [];
    value = "";
    subscribe(observer: Observer) {
        this.observers.push(observer);
    }
    changeValue(newValue) {
        console.log("subscriber: changeValue: " + newValue);
        this.value = newValue;
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].changed(this.value);
        }
    }
}

// class observ
class Observer {
    constructor(public name) {} // public parameters become members of the class
    changed(newValue) {
        console.log(`${this.name}:${newValue}`);
    }
}

let subject = new Subject();
subject.changeValue("initial value");
let observer1 = new Observer("observer1");
let observer2 = new Observer("observer2");
subject.subscribe(observer1);
subject.subscribe(observer2);
subject.changeValue("two observers now");
let observer3 = new Observer("observer3");
subject.subscribe(observer3);
subject.changeValue("a third observer");
```
И нихуя не понятно зачем такой пример нужен. Чето пытается показать как новый инстанс создается. Окей мы и так знали.
Сам subject уведомляет слушателей об изменениях, subject подписывается на обзерверы. Окей понял.


### interfaces

- их мы уже знаем, это лекала для обьекта. В проекте они есть.
- defines properties and methods on a class.

Observer interface:

```ts
// interface
interface Observer {
    changed(newValue); // no body, this method will be on every instance.
}

// classes
class Observer1 implements Observer {
    changed(newValue) {
        console.log("Observer1:" + newValue);
    }
}
class Observer2 implements Observer {
    changed(newValue) {
        console.log("Observer2 is doing something different:" + newValue);
    }
}
class Observer3 implements Observer {
    changed(newValue) {
        console.log("Observer is also different:" + newValue);
    }
}

let subject = new Subject();
subject.changeValue('initial value');
let observer1 = new Observer1();
let observer2 = new Observer2();
subject.subscribe(observer1);
subject.subscribe(observer2);
subject.changeValue("two observers now");
let observer3 = new Observer3();
subject.subscribe(observer3);
subject.changeValue("a third observer");
```
Короче по наблюдениям. 
- Метод интерфейса воплощается самим классом. 
- Из интерфейса можно сделать сколько угодно вариаций.
- Каждый обзервер по своему работает с данными обьекта.


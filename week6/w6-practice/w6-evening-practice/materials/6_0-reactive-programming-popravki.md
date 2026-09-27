# 6_0 — Реактивное программирование: поправки

**Курс:** 3813ICT, неделя 6
**Источник:** `6_0_-_Reactive_Programming.pdf`
**Связанные файлы:** [конспект](6_0-reactive-programming-konspekt.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: примеры кода из материала скомпилированы TypeScript 5.9 в строгом режиме (`--strict`), как в проекте Angular. Сообщения об ошибках ниже — реальный вывод компилятора.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Классы Subject и Observer без типов | 🔴 | В строгом режиме пять ошибок компиляции |
| [П-2](#p-2) | Нет отписки | 🟡 | Паттерн включает удаление наблюдателя; без него — утечки |
| [П-3](#p-3) | Реактивность в Angular — только привязки | 🔵 | Сейчас основной реактивный примитив Angular — сигналы |
| [П-4](#p-4) | «Класс должен объявить implements» | 🟡 | TypeScript проверяет совместимость по форме |
| [П-5](#p-5) | Пример Arithmetic | 🔴 | Длинное тире вместо минуса и параметры без типов |

---

<a id="p-1"></a>

## П-1. Классы Subject и Observer без типов 🔴

### Как в материале

Показан собственный класс `Subject` с массивом наблюдателей и строковым значением, методом `subscribe`, который добавляет наблюдателя, и методом `changeValue`, который меняет значение и уведомляет всех. Класс `Observer` принимает имя через `public`-параметр конструктора и выводит «имя: значение». Код компилировался командой `tsc` без флагов и запускался через Node.

### Пример из материала

```ts
class Subject {
    observers = [];
    value = "";
    subscribe(observer: Observer) {
        this.observers.push(observer);
    }
    changeValue(newValue) {
        this.value = newValue;
        for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].changed(this.value);
        }
    }
}

class Observer {
    constructor(public name) {}
    changed(newValue) {
        console.log(`${this.name}: ${newValue}`);
    }
}
```

### В чём несоответствие

Проект Angular создаётся со строгим режимом TypeScript (`"strict": true`). В нём этот код даёт пять ошибок:

```
error TS2345: Argument of type 'Observer' is not assignable to parameter of type 'never'.
error TS7006: Parameter 'newValue' implicitly has an 'any' type.
error TS2339: Property 'changed' does not exist on type 'never'.
error TS7006: Parameter 'name' implicitly has an 'any' type.
error TS7006: Parameter 'newValue' implicitly has an 'any' type.
```

- Пустой массив `observers = []` в поле класса получает тип `never[]` — «массив, в который ничего нельзя положить».
- Параметры без типа запрещены флагом `noImplicitAny`, который входит в `strict`.

Материал этого не показывает, потому что компилирует без строгого режима. Ещё мелочь: сообщение в `changeValue` начинается со слова «subscriber», хотя выводит его субъект.

### Как правильно

Указать тип элементов массива и типы всех параметров.

### Пример

```ts
class Subject {
  private observers: Observer[] = [];     // явный тип элементов
  private value = '';

  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  changeValue(newValue: string): void {   // тип параметра
    this.value = newValue;
    for (const observer of this.observers) {
      observer.changed(this.value);
    }
  }
}

class Observer {
  constructor(public name: string) {}     // тип параметра-поля
  changed(newValue: string): void {
    console.log(`${this.name}: ${newValue}`);
  }
}
```

**Источник:** [TypeScript — strict](https://www.typescriptlang.org/tsconfig/#strict) · [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig/#noImplicitAny)

---

<a id="p-2"></a>

## П-2. Нет отписки 🟡

### Как в материале

Паттерн описан так: подписчик регистрируется у издателя, издатель добавляет его в список и при изменении рассылает сообщения. В реализации `Subject` есть только `subscribe` и `changeValue`. При этом в следующем файле (6_1) на UML-схеме паттерна у субъекта есть и регистрация, и удаление наблюдателя.

### Пример из материала

```ts
subscribe(observer: Observer) {
    this.observers.push(observer);
}
```

### В чём несоответствие

В классическом описании паттерна субъект умеет не только добавлять, но и **удалять** наблюдателей. Без этого наблюдатель остаётся в списке навсегда: даже если объект больше не нужен (например, компонент Angular уничтожен), субъект продолжает его вызывать, а сборщик мусора не может его освободить. Это утечка памяти и лишние вызовы. В RxJS за это отвечает `Subscription.unsubscribe()` — к этой теме вернёмся в 6_1 и 6_4.

### Как правильно

`subscribe` возвращает способ отписаться: функцию или объект с методом `unsubscribe`.

### Пример

```ts
class Subject {
  private observers: Observer[] = [];

  subscribe(observer: Observer): () => void {
    this.observers.push(observer);
    // Возвращаем функцию, которая уберёт именно этого наблюдателя
    return () => {
      this.observers = this.observers.filter((o) => o !== observer);
    };
  }

  changeValue(newValue: string): void {
    for (const observer of this.observers) observer.changed(newValue);
  }
}

const subject = new Subject();
const unsubscribe = subject.subscribe(new Observer('a'));
subject.changeValue('1');   // a: 1
unsubscribe();
subject.changeValue('2');   // никто не получит
```

**Источник:** [RxJS — Subscription](https://rxjs.dev/guide/subscription) — современная реализация того же принципа

---

<a id="p-3"></a>

## П-3. Реактивность в Angular — только привязки 🔵

### Как в материале

Реактивное программирование объясняется на примере `a = b + c`: императивно значение вычисляется один раз, реактивно — обновляется при изменении `b` или `c`. Как пример реактивности в Angular приведена привязка в шаблоне `{{a + b}}`, которая сама обновляет HTML при изменении переменных.

### Пример из материала

```html
{{a + b}}
```

### В чём несоответствие

Пример с привязкой верен, но неполон. В современном Angular реактивность в коде (а не только в шаблоне) строится на **сигналах**: `signal` хранит значение, `computed` описывает значение через другие сигналы и пересчитывается сам. Это ровно определение реактивного `a = b + c` из того же слайда. Сигналы ты уже использовал в неделях 4–5.

### Как правильно

Реактивность в Angular: привязки в шаблоне и сигналы (`signal`, `computed`, `effect`) в коде; для потоков событий (запросы, сокеты) — Observable из RxJS.

### Пример

```ts
import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-sum',
  template: `
    <button (click)="b.update((v) => v + 1)">b + 1</button>
    <p>{{ b() }} + {{ c() }} = {{ a() }}</p>   <!-- обновится само -->
  `,
})
export class SumComponent {
  b = signal(2);
  c = signal(3);
  a = computed(() => this.b() + this.c());   // реактивное a = b + c
}
```

**Источник:** [Angular — Signals](https://angular.dev/guide/signals)

---

<a id="p-4"></a>

## П-4. «Класс должен объявить implements» 🟡

### Как в материале

Интерфейс описан как «класс без реализации», который определяет, какие методы должен иметь реализующий его класс. Сказано, что если класс указывает, что реализует интерфейс, он обязан предоставить все его методы, иначе будет ошибка. Все примеры используют `implements`.

### Пример из материала

```ts
class Observer1 implements Observer {
    changed(newValue) {
        console.log("Observer1: " + newValue);
    }
}
```

### В чём несоответствие

Сказанное верно, но создаёт впечатление, что без `implements` объект под интерфейс не подойдёт. В TypeScript совместимость **структурная**: объект подходит под интерфейс, если у него есть нужные поля и методы нужных типов, независимо от того, как он создан. `implements` — не условие совместимости, а проверка: компилятор сразу сообщит, если класс что-то забыл.

Это важно в Angular и RxJS: наблюдателя почти всегда передают обычным объектом `{ next: ... }`, без отдельного класса.

### Как правильно

Интерфейс задаёт форму; подходит любой объект этой формы. `implements` используют, чтобы компилятор проверил класс.

### Пример

```ts
interface Observer {
  changed(newValue: string): void;
}

class ClassObserver implements Observer {          // проверка при объявлении класса
  changed(v: string): void { console.log(v); }
}

const objectObserver: Observer = {                  // без класса и без implements
  changed: (v) => console.log('объект: ' + v),
};

function notify(o: Observer) { o.changed('hi'); }
notify(new ClassObserver());   // ✅
notify(objectObserver);        // ✅
```

**Источник:** [TypeScript Handbook — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)

---

<a id="p-5"></a>

## П-5. Пример Arithmetic 🔴

### Как в материале

Показан класс `Arithmetic`, реализующий два интерфейса — `Add` и `Subtract`, и ошибка компилятора, которая появляется, если метод `subtract` не написан.

### Пример из материала

```ts
interface Add {
    add(a, b);
}
interface Subtract {
    subtract(a, b);
}
class Arithmetic implements Add, Subtract {
    add(a, b) {
        return a + b;
    }
    subtract(a, b) {
        return a – b;
    }
}
```

### В чём несоответствие

1. В `a – b` стоит типографское тире `–` вместо знака минус `-`. Это синтаксическая ошибка; при копировании со слайда код не скомпилируется.
2. Параметры и возвращаемые значения без типов — ошибки `noImplicitAny` в строгом режиме (как в [П-1](#p-1)).
3. Без типов `add('1', 2)` вернул бы строку `'12'`, и компилятор бы этого не заметил.

### Как правильно

Обычный минус; типы параметров и результата в интерфейсах и классе.

### Пример

```ts
interface Add {
  add(a: number, b: number): number;
}
interface Subtract {
  subtract(a: number, b: number): number;
}

class Arithmetic implements Add, Subtract {
  add(a: number, b: number): number {
    return a + b;
  }
  subtract(a: number, b: number): number {
    return a - b;
  }
}

const calc = new Arithmetic();
calc.add(2, 3);      // 5
// calc.add('1', 2); // ❌ ошибка компиляции — строку передать нельзя
```

**Источник:** [TypeScript Handbook — Interfaces / Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) · [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig/#noImplicitAny)

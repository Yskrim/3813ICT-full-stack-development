# 6_0 — Реактивное программирование: вопросы для самопроверки

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_0-reactive-programming-konspekt.md) · [поправки](6_0-reactive-programming-popravki.md) · [примеры](6_0-reactive-programming-primery.md) · [ответы](6_0-reactive-programming-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для кода сначала предскажи результат.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Асинхронность и реактивность

<a id="q-1"></a>

### 1. Синхронно и асинхронно

Чем программа с обработчиками событий отличается от консольной программы, которая ждёт `readLine()`? Кто управляет ходом выполнения?

[→ ответ](6_0-reactive-programming-otvety.md#a-1)

<a id="q-2"></a>

### 2. Реактивное `a = b + c`

Что значит `a = b + c` императивно и реактивно? Как записать реактивный вариант в Angular?

[→ ответ](6_0-reactive-programming-otvety.md#a-2)

<a id="q-3"></a>

### 3. Зачем реактивность

Какую проблему асинхронного кода снимает реактивный подход? Приведи пример из чата.

[→ ответ](6_0-reactive-programming-otvety.md#a-3)

---

## B. Паттерн Observer

<a id="q-4"></a>

### 4. Роли

Что делают субъект и наблюдатель в паттерне Observer? Почему паттерн даёт слабую связанность?

[→ ответ](6_0-reactive-programming-otvety.md#a-4)

<a id="q-5"></a>

### 5. Observer и publish/subscribe

Чем классический Observer отличается от publish/subscribe? К чему ближе Socket.IO?

[→ ответ](6_0-reactive-programming-otvety.md#a-5)

<a id="q-6"></a>

### 6. Зачем отписка

Что случится, если у субъекта нет способа отписки, а наблюдатель — компонент, который уже уничтожен?

[→ ответ](6_0-reactive-programming-otvety.md#a-6)

---

## C. TypeScript

<a id="q-7"></a>

### 7. Найди ошибки (строгий режим)

```ts
class Subject {
  observers = [];
  subscribe(observer: Observer) { this.observers.push(observer); }
  changeValue(newValue) { /* ... */ }
}
```

[→ ответ](6_0-reactive-programming-otvety.md#a-7)

<a id="q-8"></a>

### 8. `public` в конструкторе

Что делает запись `constructor(public name: string) {}`?

[→ ответ](6_0-reactive-programming-otvety.md#a-8)

<a id="q-9"></a>

### 9. Нужен ли `implements`

Подойдёт ли объект `{ changed: (v: string) => console.log(v) }` туда, где ожидается интерфейс `Observer`, если он создан без класса и `implements`? Зачем тогда `implements`?

[→ ответ](6_0-reactive-programming-otvety.md#a-9)

<a id="q-10"></a>

### 10. Что выведет?

```ts
const bus = new EventBus<string>();   // из примера 1
const log: string[] = [];
const stop = bus.subscribe((e) => log.push('A:' + e));
bus.subscribe((e) => log.push('B:' + e));
bus.emit('1');
stop();
bus.emit('2');
console.log(log);
```

[→ ответ](6_0-reactive-programming-otvety.md#a-10)

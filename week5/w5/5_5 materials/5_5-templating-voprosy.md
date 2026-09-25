# 5_5 — Шаблоны Angular: директивы: вопросы для самопроверки

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_5-templating-konspekt.md) · [поправки](5_5-templating-popravki.md) · [примеры](5_5-templating-primery.md) · [ответы](5_5-templating-otvety.md)

**Как работать:** отвечай по памяти; для кода — сначала предскажи результат или напиши решение; если не знаешь — отметь «не знаю»; после каждого раздела сверяйся с ответами; ошибочные вопросы повтори через день.

---

## A. Директивы

<a id="q-1"></a>

### 1. Виды директив

Что такое директива? Назови три вида и приведи пример каждого.

[→ ответ](5_5-templating-otvety.md#a-1)

---

## B. Встроенный синтаксис управления

<a id="q-2"></a>

### 2. Найди ошибки

```html
@If (role == 'admin') {
  <p>Админ</p>
} @elseif (role == 'user') {
  <p>Пользователь</p>
}
```

[→ ответ](5_5-templating-otvety.md#a-2)

<a id="q-3"></a>

### 3. Зачем `track`

Что делает `track` в `@for`? Что будет, если его не написать? Что указать, если у элементов нет `id`?

[→ ответ](5_5-templating-otvety.md#a-3)

<a id="q-4"></a>

### 4. `@empty`

Что такое `@empty` и где его можно написать?

[→ ответ](5_5-templating-otvety.md#a-4)

<a id="q-5"></a>

### 5. Переменные `@for`

Какие встроенные переменные есть внутри `@for`? Выведи номер элемента, начиная с 1, и отметь последний элемент.

[→ ответ](5_5-templating-otvety.md#a-5)

<a id="q-6"></a>

### 6. `@if ... as`

Зачем нужна запись `@if (auth.currentUser(); as user) { ... }`?

[→ ответ](5_5-templating-otvety.md#a-6)

<a id="q-7"></a>

### 7. `@switch`

Как `@switch` сравнивает значения? Есть ли «проваливание» в следующий `@case`, как в JavaScript `switch`?

[→ ответ](5_5-templating-otvety.md#a-7)

<a id="q-8"></a>

### 8. `@let`

Для чего нужен `@let`? Приведи пример.

[→ ответ](5_5-templating-otvety.md#a-8)

---

## C. Старые структурные директивы

<a id="q-9"></a>

### 9. `<ng-template>`

Показывается ли содержимое `<ng-template>` само по себе? Когда оно появляется в DOM?

[→ ответ](5_5-templating-otvety.md#a-9)

<a id="q-10"></a>

### 10. `<ng-container>`

Зачем нужен `<ng-container>`? Почему нельзя поставить `*ngIf` и `*ngFor` на один элемент?

[→ ответ](5_5-templating-otvety.md#a-10)

<a id="q-11"></a>

### 11. Во что разворачивается звёздочка

Во что Angular превращает запись `<div *ngIf="show">Текст</div>`?

[→ ответ](5_5-templating-otvety.md#a-11)

<a id="q-12"></a>

### 12. Найди ошибку

```html
<div *ngIf="show; then option 1 else option2"></div>
<ng-template #option1><div>Да</div></ng-template>
<ng-template #option2><div>Нет</div></ng-template>
```

[→ ответ](5_5-templating-otvety.md#a-12)

<a id="q-13"></a>

### 13. Что покажется?

```html
<div [ngSwitch]="color">
  <span *ngSwitchCase="'red'">Красный</span>
  <span *ngSwitchCase="'gree'">Зелёный</span>
  <span *ngSwitchDefault>Другой</span>
</div>
```

Что покажется, если `color = 'green'`? Будет ли ошибка?

[→ ответ](5_5-templating-otvety.md#a-13)

<a id="q-14"></a>

### 14. `*ngFor` не работает

Скопировал пример с `*ngFor` в новый standalone-компонент — ошибка компиляции. Почему? Два способа исправить.

[→ ответ](5_5-templating-otvety.md#a-14)

<a id="q-15"></a>

### 15. Переведи на новый синтаксис

```html
<ul *ngIf="groups.length; else noGroups">
  <li *ngFor="let g of groups; let i = index">{{ i + 1 }}. {{ g.name }}</li>
</ul>
<ng-template #noGroups><p>Групп нет</p></ng-template>
```

[→ ответ](5_5-templating-otvety.md#a-15)

---

## D. Привязки

<a id="q-16"></a>

### 16. Четыре привязки

Назови четыре вида привязок, их скобки и направление передачи данных.

[→ ответ](5_5-templating-otvety.md#a-16)

<a id="q-17"></a>

### 17. Интерполяция или привязка свойства?

Будет ли кнопка активна в каждом случае?

```html
<button [disabled]="false">A</button>
<button disabled="{{ false }}">B</button>
```

[→ ответ](5_5-templating-otvety.md#a-17)

<a id="q-18"></a>

### 18. `[(ngModel)]`

Во что разворачивается `[(ngModel)]="name"`? Что нужно подключить, чтобы он работал? Почему его называют «банан в коробке»?

[→ ответ](5_5-templating-otvety.md#a-18)

---

## E. Атрибутные директивы

<a id="q-19"></a>

### 19. `ngClass` и `[class]`

Перепиши без `ngClass`: `<li [ngClass]="{ own: isOwn }">`. Почему такой вариант предпочтительнее?

[→ ответ](5_5-templating-otvety.md#a-19)

<a id="q-20"></a>

### 20. Создание директивы

Какой командой создать директиву `highlight`? Какой у неё будет селектор? Какие файл и класс появятся в проекте Angular 20+?

[→ ответ](5_5-templating-otvety.md#a-20)

<a id="q-21"></a>

### 21. Директива молчит

Написал директиву `appHighlight`, поставил атрибут на элемент — ничего не происходит, ошибок нет. Какая самая вероятная причина?

[→ ответ](5_5-templating-otvety.md#a-21)

<a id="q-22"></a>

### 22. Автофокус

Почему в директиве автофокуса `focus()` вызывают в `ngAfterViewInit`, а не в конструкторе?

[→ ответ](5_5-templating-otvety.md#a-22)

---

## F. Шаблонные переменные

<a id="q-23"></a>

### 23. Что лежит в переменной

Что такое шаблонная переменная? Что в ней окажется, если поставить её на `<input>`, на компонент и на `<ng-template>`?

[→ ответ](5_5-templating-otvety.md#a-23)

<a id="q-24"></a>

### 24. Область видимости

```html
@for (g of groups; track g.id) {
  <input #nameInput [value]="g.name">
}
<button (click)="save(nameInput.value)">Сохранить всё</button>
```

Скомпилируется ли это? Почему?

[→ ответ](5_5-templating-otvety.md#a-24)

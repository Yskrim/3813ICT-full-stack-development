# 5_5 — Шаблоны Angular: директивы: поправки

**Курс:** 3813ICT, неделя 5
**Источник:** `5_5-Angular_Templating.pdf`
**Связанные файлы:** [конспект](5_5-templating-konspekt.md) · [примеры](5_5-templating-primery.md) · [вопросы](5_5-templating-voprosy.md) · [ответы](5_5-templating-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно и полный пример с пояснениями.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Названия блоков control flow | 🔴 | `@if`, а не `@If`; `@else if`, а не `@elseif`; у `@for` обязателен `track` |
| [П-2](#p-2) | `then option 1` | 🔴 | Имя шаблона с пробелом не работает |
| [П-3](#p-3) | `ngSwitchCase` с `'gree'` | 🔴 | Опечатка — вариант никогда не совпадёт |
| [П-4](#p-4) | `ngClass`, `ngStyle` и импорт `FormsModule` | 🔵 | Рекомендуются привязки `[class]`/`[style]`; в строке импорта ошибки |
| [П-5](#p-5) | Команда создания директивы | 🔴 | `ng –g directive` — неверная команда; в Angular 20+ другие имена файлов |
| [П-6](#p-6) | Область видимости шаблонной переменной | 🟡 | Внутри `@if`/`@for`/`ng-template` — только в блоке; `ref-` устарел |
| [П-7](#p-7) | Импорт старых директив | 🔴 | В standalone-компоненте `*ngIf`/`*ngFor` без импорта не работают |
| [П-8](#p-8) | «`ng-template` отрисуется, когда будет готов» | 🟡 | Он не рисуется сам никогда — только по запросу директивы |

---

<a id="p-1"></a>

## П-1. Названия блоков control flow 🔴

### Как в материале

Сказано, что шаблоны Angular поддерживают блоки управления потоком, которые позволяют показывать, скрывать и повторять элементы, и что они заменяют структурные директивы прежних версий. Приведён пример с `@if` и `@else`. Затем перечислены варианты: `@If`, `@If / @else`, `@If / @elseif / @else`, `@for`, `@switch`, `@empty`, и дана ссылка на документацию.

### Пример из материала

```html
@if (name=='Allan') {
<p>Welcome Allan</p>
} @else {
<p> Welcome</p>
}
```

Список вариантов: `@If`, `@If / @else`, `@If / @elseif / @else`, `@for`, `@switch`, `@empty`.

### В чём несоответствие

1. **Регистр.** Блоки пишутся строчными буквами: `@if`. Запись `@If` Angular не распознает — это будет ошибка компиляции шаблона.
2. **`@elseif`** — такого блока нет. Ветка «иначе если» пишется двумя словами: `@else if`.
3. **`track` у `@for` обязателен.** Без него шаблон не скомпилируется. В списке это не упомянуто.
4. **`@empty` — не отдельный блок**, а часть `@for`: показывается, когда коллекция пуста. Сам по себе он не работает.
5. **У `@switch` есть `@case` и `@default`** — в списке их нет.
6. Не упомянуты `@let` (переменная в шаблоне, Angular 18.1+) и `@defer` (отложенная загрузка части шаблона).

Сам пример верный; `==` лучше заменить на `===`, как в обычном TypeScript.

### Как правильно

`@if` / `@else if` / `@else`; `@for (... ; track ...)` с необязательным `@empty`; `@switch` / `@case` / `@default`; `@let`.

### Пример

```html
<!-- @if с веткой else if -->
@if (role === 'superadmin') {
  <p>Полный доступ</p>
} @else if (role === 'groupadmin') {
  <p>Управление своими группами</p>
} @else {
  <p>Обычный пользователь</p>
}

<!-- @for: track обязателен, @empty — внутри -->
<ul>
  @for (group of groups; track group.id) {
    <li>{{ $index + 1 }}. {{ group.name }}</li>
  } @empty {
    <li>Групп нет</li>
  }
</ul>

<!-- @switch с @case и @default -->
@switch (status) {
  @case ('online') { <span class="dot green"></span> }
  @case ('away')   { <span class="dot yellow"></span> }
  @default         { <span class="dot grey"></span> }
}

<!-- @let -->
@let count = groups.length;
<p>Всего групп: {{ count }}</p>

<!-- ❌ Не скомпилируется -->
<!-- @If (x) { } -->
<!-- @if (a) { } @elseif (b) { } -->
<!-- @for (g of groups) { } — нет track -->
```

---

<a id="p-2"></a>

## П-2. `then option 1` 🔴

### Как в материале

Показан вариант `*ngIf` с `then` и `else`: элемент с директивой становится только её носителем и не показывает своего содержимого, а оба варианта вынесены в именованные `<ng-template>`.

### Пример из материала

```html
<div *ngIf="show; then option 1 else option2"></div>
<ng-template #option1><div> Some Text</div> </ng-template>
<ng-template #option2><div> Some Text</div> </ng-template>
```

### В чём несоответствие

В выражении `then option 1` имя шаблона записано с пробелом, а объявлен он как `#option1`. Микросинтаксис прочитает `option` как имя и споткнётся о лишнюю `1` — шаблон не скомпилируется. Кроме того, оба шаблона содержат одинаковый текст, поэтому на примере не видно, какая ветка сработала.

### Как правильно

Имя в `then` должно в точности совпадать с именем шаблона: `then option1`.

### Пример

```html
<!-- ✅ Старый синтаксис -->
<div *ngIf="show; then option1 else option2"></div>
<ng-template #option1><div>Show — true</div></ng-template>
<ng-template #option2><div>Show — false</div></ng-template>

<!-- ✅ То же на новом синтаксисе — без шаблонов и имён -->
@if (show) {
  <div>Show — true</div>
} @else {
  <div>Show — false</div>
}
```

---

<a id="p-3"></a>

## П-3. `ngSwitchCase` с `'gree'` 🔴

### Как в материале

Описаны `[ngSwitch]`, `*ngSwitchCase` и `*ngSwitchDefault` (в заголовке слайда — «ngSwicth»). Значение `ngSwitch` определяет, какой вариант показать; если ни один не совпал, срабатывает вариант по умолчанию. `[ngSwitch]` — атрибутная директива, которая управляет двумя структурными, поэтому она в квадратных скобках.

### Пример из материала

```html
<div [ngSwitch]=“item.color”>
<app-color-red *ngSwitchCase = “’red’”></app-color-red>
<app-color-green *ngSwitchCase = “’gree’”></app-color-green>
<app-color *ngSwitchDefault ></app-color>
</div>
```

### В чём несоответствие

1. **`'gree'` вместо `'green'`.** Для зелёного цвета вариант никогда не совпадёт, и покажется `<app-color>` по умолчанию. Ошибки при этом не будет — такую опечатку легко не заметить.
2. **Типографские кавычки** `“ ” ’` — при копировании шаблон не скомпилируется.
3. Опечатка в названии на слайде: `ngSwicth` вместо `ngSwitch`.

Объяснение роли `[ngSwitch]` верное.

### Как правильно

Строки сравнения писать точно; для однотипных значений удобно вынести их в тип, чтобы опечатку поймал компилятор.

### Пример

```ts
// Тип ограничивает возможные значения — опечатку в классе поймает TypeScript
type Color = 'red' | 'green' | 'blue';
item: { color: Color } = { color: 'green' };
```

```html
<!-- ✅ Старый синтаксис -->
<div [ngSwitch]="item.color">
  <app-color-red   *ngSwitchCase="'red'"></app-color-red>
  <app-color-green *ngSwitchCase="'green'"></app-color-green>
  <app-color       *ngSwitchDefault></app-color>
</div>

<!-- ✅ Новый синтаксис: при строгой проверке шаблонов Angular сравнит @case с типом Color -->
@switch (item.color) {
  @case ('red')   { <app-color-red /> }
  @case ('green') { <app-color-green /> }
  @default        { <app-color /> }
}
```

---

<a id="p-4"></a>

## П-4. `ngClass`, `ngStyle` и импорт `FormsModule` 🔵

### Как в материале

Атрибутные директивы описаны как способ менять внешний вид или поведение элемента. Перечислены встроенные: `[ngStyle]` (набор inline-стилей), `[ngClass]` (набор CSS-классов), `[(ngModel)]` (двусторонняя привязка). Объяснено, что `[ ]` — привязка из модели в представление, `( )` — обработчик события из представления, и что `[(ngModel)]` — сокращение `[ngModel]` + `(ngModelChange)`. В примечании сказано, что для «банана в коробке» в модуль нужно импортировать `FormsModule`, с примером строки импорта.

### Пример из материала

```ts
Import (FormsModule} from ‘@angular/forms’;
```

### В чём несоответствие

1. **Строка импорта с ошибками:** `Import` с заглавной, `(` вместо `{`, типографские кавычки. Правильно: `import { FormsModule } from '@angular/forms';`. И в standalone-компоненте `FormsModule` добавляют в `imports` самого компонента, а не модуля.
2. **`ngClass` и `ngStyle`** работают, но руководство Angular рекомендует вместо них встроенные привязки `[class]` и `[style]`: им не нужен импорт, они короче для одного класса или стиля и умеют принимать объект, как `ngClass`.

### Как правильно

Для классов и стилей — `[class.имя]`, `[class]`, `[style.свойство]`; для `ngModel` — `FormsModule` в `imports` компонента.

### Пример

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';        // ✅ правильная строка импорта

@Component({
  selector: 'app-message',
  imports: [FormsModule],                            // ✅ в imports компонента
  template: `
    <!-- ✅ Один класс по условию -->
    <li [class.own]="isOwn">…</li>

    <!-- ✅ Несколько классов объектом — как ngClass, но без импорта -->
    <li [class]="{ own: isOwn, unread: !read }">…</li>

    <!-- ✅ Стиль с единицей измерения -->
    <div [style.width.px]="progress"></div>

    <!-- То же через директивы (нужен импорт NgClass, NgStyle) -->
    <!-- <li [ngClass]="{ own: isOwn, unread: !read }">…</li> -->
    <!-- <div [ngStyle]="{ width: progress + 'px' }"></div> -->

    <input [(ngModel)]="draft">
  `,
})
export class MessageComponent {
  isOwn = true;
  read = false;
  progress = 40;
  draft = '';
}
```

---

<a id="p-5"></a>

## П-5. Команда создания директивы 🔴

### Как в материале

Сказано, что новую атрибутную директиву можно создать командой CLI, что CLI добавляет к имени директивы префикс `app`, чтобы она не конфликтовала с существующими HTML-атрибутами, и показан пример использования `<p appHighlight>`.

### Пример из материала

```
ng –g directive Highlight
```

```html
<p appHighlight>Highlight me!</p>
```

### В чём несоответствие

1. **Команда неверна.** `ng –g` — это не команда: подкоманда называется `generate` (сокращённо `g`) и пишется без дефиса, а `–` — к тому же длинное тире. Правильно: `ng generate directive highlight` или `ng g d highlight`.
2. **Имена файлов в Angular 20+.** В новых проектах CLI не добавляет суффикс `Directive`: создаётся `highlight.ts` с классом `Highlight`. В проектах, созданных раньше, — `highlight.directive.ts` и `HighlightDirective`. Селектор в обоих случаях `[appHighlight]`.
3. Не показано, что директиву нужно добавить в `imports` компонента, где она используется, и как вообще выглядит её код.

### Как правильно

```bash
ng g d highlight                       # → [appHighlight]
ng g d highlight --type=directive      # суффикс в проекте Angular 20+
```

### Пример

```ts
// ═════ src/app/directives/highlight.directive.ts ═════
import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'paint(true)',
    '(mouseleave)': 'paint(false)',
  },
})
export class HighlightDirective {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly color = input('', { alias: 'appHighlight' });

  paint(on: boolean): void {
    this.el.nativeElement.style.backgroundColor = on ? this.color() || '#fff3c4' : '';
  }
}

// ═════ Компонент, который её использует ═════
import { Component } from '@angular/core';
import { HighlightDirective } from '../directives/highlight.directive';

@Component({
  selector: 'app-demo',
  imports: [HighlightDirective],        // ← без этого атрибут appHighlight просто ничего не сделает
  template: `<p appHighlight>Highlight me!</p>`,
})
export class DemoComponent {}
```

**Пояснения:**

- Если директиву забыть добавить в `imports`, ошибки не будет: Angular воспримет `appHighlight` как обычный HTML-атрибут. Поэтому «директива не работает» — первым делом проверь `imports`.
- `host` в декораторе — рекомендуемый способ слушать события элемента; в старом коде для этого используют декоратор `@HostListener`.

---

<a id="p-6"></a>

## П-6. Область видимости шаблонной переменной 🟡

### Как в материале

Шаблонная переменная описана как ссылка на DOM-элемент в шаблоне. `#zipcode` объявляет переменную для поля ввода, и её значение передаётся в обработчик клика кнопки. Сказано, что область видимости переменной — весь шаблон и что в одном шаблоне переменную объявляют только один раз. Как альтернатива показан префикс `ref-` вместо `#`.

### Пример из материала

```html
<input type=‘text’ #zipcode/>
<button (click) = “location(zipcode.value)”>show</button>

<input type=‘text’ ref-zipcode/>
```

### В чём несоответствие

1. **«Видна во всём шаблоне» — не всегда.** Переменная, объявленная внутри `@if`, `@for` или `<ng-template>`, видна **только внутри этого блока**. В `@for` у каждой строки своя переменная с тем же именем — и это не нарушение правила «объявлять один раз», а отдельные области.
2. **`ref-`** — старая альтернативная форма, которой нет в актуальной документации Angular. Используй `#`.
3. На `<ng-template>` и компоненте переменная указывает не на DOM-элемент, а на шаблон или экземпляр компонента соответственно.
4. Типографские кавычки в примере.

### Как правильно

`#имя`; помнить, что внутри блоков у переменной своя область.

### Пример

```html
<!-- ✅ Переменная на верхнем уровне — видна во всём шаблоне -->
<input type="text" #zipcode>
<button (click)="location(zipcode.value)">show</button>

<!-- ✅ В @for у каждой строки своя переменная nameInput -->
@for (group of groups; track group.id) {
  <input #nameInput [value]="group.name">
  <button (click)="rename(group.id, nameInput.value)">Сохранить</button>
}

<!-- ❌ Снаружи блока переменная не видна -->
<!-- <button (click)="rename(1, nameInput.value)"></button>  ← ошибка компиляции -->
```

---

<a id="p-7"></a>

## П-7. Импорт старых директив 🔴

### Как в материале

Большая часть файла показывает старые структурные директивы (`*ngIf`, `*ngFor`, `[ngSwitch]`) с пометкой, что принципы у них те же, что у нового синтаксиса. В другом файле курса (5_4) в таблице модулей сказано, что для `NgIf` и `NgFor` нужен `CommonModule`, но в этом файле о подключении ничего не говорится.

### Пример из материала

```html
<li *ngFor="let item of items">{{item.name}}</li>
```

### В чём несоответствие

С Angular 19 компоненты по умолчанию standalone и сами перечисляют в `imports`, что используют в шаблоне. Если скопировать пример со `*ngFor` в новый компонент без импорта, Angular выдаст ошибку: директива `NgFor` использована, но не импортирована. Встроенным `@if`/`@for` импорт не нужен — ещё одна причина писать новые шаблоны на них.

### Как правильно

В новом коде — `@if`/`@for`/`@switch`. В старом коде со структурными директивами — `imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault]` или `imports: [CommonModule]`.

### Пример

```ts
import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

// Вариант 1: старые директивы — нужен импорт
@Component({
  selector: 'app-old-list',
  imports: [NgIf, NgFor],                 // или [CommonModule]
  template: `
    <ul *ngIf="items.length; else empty">
      <li *ngFor="let item of items">{{ item.name }}</li>
    </ul>
    <ng-template #empty><p>Пусто</p></ng-template>
  `,
})
export class OldListComponent {
  items = [{ id: 1, name: 'General' }];
}

// Вариант 2: новый синтаксис — импорт не нужен
@Component({
  selector: 'app-new-list',
  template: `
    <ul>
      @for (item of items; track item.id) {
        <li>{{ item.name }}</li>
      } @empty {
        <p>Пусто</p>
      }
    </ul>
  `,
})
export class NewListComponent {
  items = [{ id: 1, name: 'General' }];
}
```

---

<a id="p-8"></a>

## П-8. «`ng-template` отрисуется, когда будет готов» 🟡

### Как в материале

`<ng-template>` описан как элемент Angular для отрисовки HTML, без собственного визуального значения — «виртуальный контейнер, который не отрисуется, пока не будет готов». Уточняется, что его содержимое не показывается, если на него не нацелена структурная директива.

### Пример из материала

```html
<ng-template [ngIf]="isLoggedIn">
<div> Welcome back, friend. </div>
</ng-template>
```

### В чём несоответствие

Формулировка «не отрисуется, пока не будет готов» создаёт впечатление, что шаблон отрисуется сам, когда «дозреет». На деле `<ng-template>` **не отрисовывается сам никогда**. Его содержимое появляется в DOM только тогда, когда код явно создаёт из него представление: структурная директива (`ngIf`, `ngFor`), директива `ngTemplateOutlet` или код компонента. Вторая половина объяснения («показывается, только если на него нацелена директива») — верная и главная.

### Как правильно

`<ng-template>` — описание куска разметки «про запас». Он попадает в DOM только по явному запросу директивы или кода.

### Пример

```html
<!-- Этот шаблон НИКОГДА не появится: никто его не выводит -->
<ng-template>
  <p>Меня не видно</p>
</ng-template>

<!-- Выводит директива ngIf, когда условие истинно -->
<ng-template [ngIf]="isLoggedIn">
  <p>Welcome back, friend.</p>
</ng-template>

<!-- Выводит ngTemplateOutlet — можно вставить один шаблон в несколько мест -->
<ng-template #badge><span class="badge">new</span></ng-template>
<h3>Канал general <ng-container *ngTemplateOutlet="badge"></ng-container></h3>
<h3>Канал random  <ng-container *ngTemplateOutlet="badge"></ng-container></h3>
<!-- для ngTemplateOutlet нужен imports: [NgTemplateOutlet] -->
```

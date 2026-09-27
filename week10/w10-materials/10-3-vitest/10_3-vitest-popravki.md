# 10_3 — Модульные тесты Angular с Vitest: поправки

**Курс:** 3813ICT, недели 10–11
**Источник:** `10_3_-_Angular_Unit_Testing_with_Vitest.pdf` (20 слайдов)
**Связанные файлы:** [конспект](10_3-vitest-konspekt.md) · [примеры](10_3-vitest-primery.md) · [вопросы](10_3-vitest-voprosy.md) · [ответы](10_3-vitest-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала, в чём несоответствие, как правильно, пример и **источник**.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: экспорты `@angular/core/testing` проверены на Angular 21.2.24; поведение `innerText` — на jsdom 30.1 (среда Vitest по умолчанию). Код со скриншотов переписан дословно. Слайды 2–12 и 16 (Vitest, `providersFile`, структура теста, тест сервиса) соответствуют текущей документации; поправки касаются слайдов 12–19, где код остался от Jasmine/Karma.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | «declarations» и `compileComponents` | 🟡 | Standalone-компоненты — в `imports`; `compileComponents` с CLI не обязателен |
| [П-2](#p-2) | Обёртка `async(...)` и `AppComponent` | 🔴 | `async` удалена из `@angular/core/testing`; в Angular 20+ — `App`, `title` защищён |
| [П-3](#p-3) | Тест формы | 🔴 | `spyOn` Jasmine, `declarations` со standalone, `.then` без ожидания |
| [П-4](#p-4) | Компонент с поддельным сервисом | 🔴 | `UserService` не импортирован; `innerText` в jsdom — `undefined` |

---

<a id="p-1"></a>

## П-1. «declarations» и `compileComponents` 🟡

### Как в материале

Слайд 12: в `beforeEach` настраивается тестовый модуль «с declarations, imports и providers», после чего вызывается `compileComponents`. Код на слайде передаёт `App` в `imports` и вызывает `.compileComponents()`.

### Пример из материала

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [App]
  }).compileComponents();
});
```

### В чём несоответствие

Код верный. Неточен текст: для standalone-компонентов (по умолчанию с Angular 19) раздел `declarations` не используется — компонент передают в `imports`, и слайды 14 и 18 из-за этого ошибаются ([П-3](#p-3)). `compileComponents()` нужен, когда шаблоны и стили подгружаются во время выполнения; при запуске через Angular CLI они уже скомпилированы, и вызов безвреден, но не обязателен.

### Как правильно

`imports: [Component]`; `compileComponents()` можно оставить или опустить.

### Пример

```ts
beforeEach(() => {
  TestBed.configureTestingModule({ imports: [App] });     // standalone — в imports
});
```

**Источник:** [Angular — Testing components basics](https://angular.dev/guide/testing/components-basics) · [Angular API — TestBed.compileComponents](https://angular.dev/api/core/testing/TestBed#compileComponents)

---

<a id="p-2"></a>

## П-2. Обёртка `async(...)` и `AppComponent` 🔴

### Как в материале

Слайд 13: первый тест проверяет, что у экземпляра `AppComponent` поле `title` равно `'Angular Unit Testing'`; второй вызывает `detectChanges()` и проверяет текст `<h1>`. Оба теста обёрнуты в `async(() => ...)`.

### Пример из материала

```ts
it(`should have as title 'Angular Unit Testing'`, async(() => {
  const fixture = TestBed.createComponent(AppComponent);
  const app = fixture.debugElement.componentInstance;
  expect(app.title).toEqual('Angular Unit Testing');
}));
```

### В чём несоответствие

1. **`async` из `@angular/core/testing` удалена.** Её переименовали в `waitForAsync` (Angular 11), а старое имя затем убрали. Проверено на Angular 21: из `@angular/core/testing` экспортируются `waitForAsync` и `fakeAsync`, `async` — нет; импорт `{ async }` не скомпилируется. Для синхронного теста обёртка не нужна вовсе, для асинхронного — обычный `async`/`await`. Кроме того, `waitForAsync` и `fakeAsync` рассчитаны на zone.js, а новые приложения Angular по умолчанию работают без zone.js.
2. **`AppComponent`** — имя из проектов до Angular 20; сейчас CLI создаёт класс `App` (файл `app.ts`).
3. **`app.title`** — в новом проекте `title` объявлен как `protected readonly title = signal(...)`: из теста к нему не обратиться, и это сигнал, а не строка. Поэтому современный сгенерированный тест проверяет не поле, а отрисованный текст.

### Как правильно

Тест без обёртки; проверять то, что видит пользователь.

### Пример

```ts
it('отображает заголовок', () => {
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toContain('Hello');
});
```

**Источник:** [Angular API — waitForAsync](https://angular.dev/api/core/testing/waitForAsync) · [Angular — Testing](https://angular.dev/guide/testing)

---

<a id="p-3"></a>

## П-3. Тест формы 🔴

### Как в материале

Слайды 14–15: тест `ContactComponent` импортирует `TestBed`, `async`, `ComponentFixture`, `BrowserModule`, `By`, модули форм; в `beforeEach(async(...))` компонент объявлен в `declarations`, после `compileComponents().then(...)` создаётся fixture и находится `<form>`. Тесты вызывают `onSubmit`, ставят «jasmine spy» через `spyOn`, нажимают кнопку и проверяют, что метод не вызван, и проверяют невалидность пустой формы.

### Пример из материала

```ts
beforeEach(async(() => {
  TestBed.configureTestingModule({
    declarations: [ContactComponent],
    imports: [BrowserModule, FormsModule, ReactiveFormsModule]
  }).compileComponents().then(() => {
    fixture = TestBed.createComponent(ContactComponent);
    ...
  });
}));

it(`should call the onSubmit method`, async(() => {
  fixture.detectChanges();
  spyOn(comp, 'onSubmit');
  el = fixture.debugElement.query(By.css('button')).nativeElement;
  el.click();
  expect(comp.onSubmit).toHaveBeenCalledTimes(0);
}));
```

### В чём несоответствие

1. **`spyOn`** — глобальная функция Jasmine. В Vitest шпион создают `vi.spyOn(объект, 'метод')`; проверка — на возвращённом шпионе.
2. **`declarations` со standalone-компонентом** вызывает ошибку: такой компонент нельзя объявлять, его импортируют. Модули форм компонент подключает сам; `BrowserModule` в тестах не нужен.
3. **`.then(...)` без ожидания.** Без обёртки `async` функция `beforeEach` возвращает `undefined`, и Vitest не ждёт, пока создастся fixture; тест может начаться с `fixture === undefined`.
4. **`async(...)`** — см. [П-2](#p-2).

Сами идеи тестов (особенно «заблокированная кнопка не вызывает отправку») — хорошие.

### Как правильно

`imports: [ContactComponent]`, `await` в `beforeEach`, `vi.spyOn`.

### Пример

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({ imports: [ContactComponent] }).compileComponents();
  fixture = TestBed.createComponent(ContactComponent);
  comp = fixture.componentInstance;
  fixture.detectChanges();
});

it('заблокированная кнопка не вызывает onSubmit', () => {
  const spy = vi.spyOn(comp, 'onSubmit');
  (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')!.click();
  expect(spy).not.toHaveBeenCalled();
});
```

**Источник:** [Vitest — vi.spyOn](https://vitest.dev/api/vi.html#vi-spyon) · [Angular — Migrating from Karma to Vitest](https://angular.dev/guide/testing/migrating-to-vitest) · [Angular — Testing components basics](https://angular.dev/guide/testing/components-basics)

---

<a id="p-4"></a>

## П-4. Компонент с поддельным сервисом 🔴

### Как в материале

Слайды 17–19: `UserComponent` в конструкторе получает список пользователей из `UserService`; тест в `providers` заменяет `UserService` классом `UserServiceMock`, возвращающим одного пользователя; первый тест проверяет `comp.users.length`, второй — что `<p>` содержит `'user1'` через `el.innerText`.

### Пример из материала

```ts
import { UserComponent } from './user.component';
import { UserServiceMock } from '../../mocks/user.service.mock';

describe('ContactComponent', () => {
  ...
  providers: [
    { provide: UserService, useClass: UserServiceMock }
  ]
  ...
  it(`html should render one user`, async(() => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('p');
    expect(el.innerText).toContain('user1');
  }));
});
```

### В чём несоответствие

1. **`UserService` не импортирован** в файле теста, но используется в `providers` — ошибка компиляции.
2. **`innerText` в jsdom не реализован.** Vitest в Angular по умолчанию запускает тесты в jsdom, где `innerText` возвращает `undefined`. Проверено (jsdom 30.1): `innerText: undefined`, `textContent: "user1"`. Проверка `expect(undefined).toContain('user1')` упадёт.
3. **Форма подмены.** `getUsers()` возвращает массив синхронно, а сервис с HTTP возвращает Observable. Подмена должна повторять форму настоящего сервиса, иначе тест проверяет не тот код.
4. `async(...)`, `declarations`, `BrowserModule` — как в [П-3](#p-3); группа названа `ContactComponent`; `users` без типа.

Идея подмены через `{ provide, useClass }` — верная.

### Как правильно

Импортировать заменяемый сервис, возвращать Observable, проверять `textContent`.

### Пример

```ts
import { of } from 'rxjs';
import { UserService } from './user.service';     // ✅ импорт

await TestBed.configureTestingModule({
  imports: [UserComponent],
  providers: [{ provide: UserService, useValue: { getUsers: () => of([{ id: 1, name: 'user1' }]) } }],
}).compileComponents();

const fixture = TestBed.createComponent(UserComponent);
fixture.detectChanges();
expect(fixture.nativeElement.querySelector('p')?.textContent).toContain('user1');   // ✅ textContent
```

**Источник:** [jsdom — README («Unimplemented parts of the web platform»: layout, innerText)](https://github.com/jsdom/jsdom#unimplemented-parts-of-the-web-platform) · [Angular — Testing services](https://angular.dev/guide/testing/services) · [Angular — Dependency providers (useClass, useValue)](https://angular.dev/guide/di/dependency-injection-providers)

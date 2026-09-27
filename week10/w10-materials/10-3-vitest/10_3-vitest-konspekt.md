# 10_3 — Модульные тесты Angular с Vitest: конспект

**Курс:** 3813ICT, недели 10–11
**Источник:** `10_3_-_Angular_Unit_Testing_with_Vitest.pdf` (20 слайдов)
**Связанные файлы:** [поправки](10_3-vitest-popravki.md) · [примеры](10_3-vitest-primery.md) · [вопросы](10_3-vitest-voprosy.md) · [ответы](10_3-vitest-otvety.md) · назад: [10_2](10_2-mocha-konspekt.md) · дальше: [10_4 Тестируемый код](10_4-testable-code-konspekt.md)

> Значок **⚠** со ссылкой вида **П-N** ведёт в файл поправок. Там разобрано, где исходный материал курса расходится с официальной документацией, со ссылкой на источник.

> Проверка: экспорты `@angular/core/testing` проверены на Angular 21.2; поведение `innerText` — на jsdom 30 (среда Vitest по умолчанию). Код со скриншотов переписан дословно.

**Содержание**

1. [Vitest в Angular](#s1)
2. [Настройка: общие провайдеры](#s2)
3. [Из чего состоит тест](#s3)
4. [Экземпляр компонента и DOM](#s4)
5. [Тест формы](#s5)
6. [Тест сервиса](#s6)
7. [Компонент с поддельным сервисом](#s7)
8. [Ключевые факты](#s8)

---

<a id="s1"></a>

## 1. Vitest в Angular

В 10_2 мы тестировали сервер. Клиенту тоже нужны тесты: компоненты, сервисы, формы. В Angular для этого есть готовая инфраструктура, и с версии 21 она построена на **Vitest**.

**Vitest** — быстрый фреймворк тестирования для JavaScript и TypeScript; в Angular 21+ это стандартный инструмент для модульных тестов компонентов, сервисов, пайпов и директив. Материал описан уже для Vitest, поэтому основная часть — актуальная.

Как это работает при `ng test`:

1. Angular собирает тестовое окружение;
2. Vitest находит файлы `*.spec.ts` и `*.test.ts`;
3. `TestBed` создаёт компоненты и внедряет сервисы;
4. Vitest выполняет проверки;
5. результаты выводятся в терминал.

По умолчанию тесты выполняются в Node.js, а браузер **имитирует** библиотека **jsdom**. Это быстро, но jsdom — не настоящий браузер: часть браузерных возможностей в нём отсутствует ([§7](#s7)).

Материал упоминает, что раньше Angular использовал **Jasmine и Karma**. Общая схема тестов та же (`TestBed`, `describe`, `it`, `beforeEach`), но функции-помощники различаются — это важно, потому что часть кода в материале написана ещё для Jasmine ([§5](#s5)).

---

<a id="s2"></a>

## 2. Настройка: общие провайдеры

Каждый файл тестов в Angular **самостоятельный**: компонент тестируется отдельно от приложения, поэтому провайдеры из `app.config.ts` (маршрутизация, `HttpClient`) в тестах автоматически не появляются. Чтобы не повторять их в каждом файле, Angular позволяет задать общие настройки в `angular.json`:

- **`setupFiles`** — код, который выполняется перед тестами (глобальные подмены, полифилы);
- **`providersFile`** — провайдеры, которые добавляются в **каждый** тест.

Вот пример из материала:

```json
"test": {
  "builder": "@angular/build:unit-test",
  "options":{
    "providersFile":"src/test-providers.ts"
  }
}
```

```ts
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing'

export default [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
];
```

**Что в нём происходит.** Каждый тест получает пустую маршрутизацию и `HttpClient`, у которого `provideHttpClientTesting()` заменяет настоящую отправку запросов тестовым контроллером. Пример верный.

Стоит понимать следствие: раз `provideHttpClientTesting()` подключён для **всех** тестов, ни один тест не отправит настоящий HTTP-запрос. Запрос будет ждать ответа от `HttpTestingController` — это то, что нужно для модульных тестов ([§6](#s6)).

---

<a id="s3"></a>

## 3. Из чего состоит тест

Вот части типичного теста Angular с Vitest по материалу:

| Часть | Зачем |
|---|---|
| импорты | тестируемый компонент или сервис и утилиты тестирования |
| `describe()` | группирует тесты |
| `beforeEach()` | настраивает `TestBed` перед каждым тестом |
| создание fixture | `TestBed.createComponent(...)` создаёт компонент |
| `detectChanges()` | запускает отрисовку шаблона |
| `it()` | один тест |
| `expect()` | проверка |
| `vi` | подмены и шпионы Vitest (`vi.fn`, `vi.spyOn`) |

**`ComponentFixture<T>`** — обёртка вокруг созданного компонента: в ней экземпляр класса (`componentInstance`), отрисованный DOM (`nativeElement`), запуск обнаружения изменений (`detectChanges()`) и отладочные утилиты (`debugElement`). Через fixture тест работает и с классом, и с шаблоном.

Проверки Vitest строятся так: `expect(значение).matcher(ожидаемое)`. Вот пример из материала:

```ts
describe('add two numbers together',() =>{
      it("should be able to add two whole numbers",()=>{
          expect(adding.add(2,2)).toEqual(4);
      });
    it("should be able to add positive and negative numbers",()=>{
          expect(adding.add(2,-1)).toEqual(1);
      });
});
```

Частые проверки: `toBe` (строгое равенство), `toEqual` (глубокое), `toBeTruthy`, `toContain`, `toHaveBeenCalled`, `toThrow`.

И основной тест, который генерирует CLI, — из материала:

```ts
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
```

**Что в нём происходит.** В `beforeEach` тестовый модуль получает standalone-компонент `App` в `imports`; тест создаёт fixture и проверяет, что компонент создан. Пример верный и современный. Текст рядом упоминает «declarations» — для standalone-компонентов это устарело: их передают в `imports`. Вызов `compileComponents()` при запуске через Angular CLI не обязателен — шаблоны уже скомпилированы при сборке, но и не мешает. ⚠ [П-1](10_3-vitest-popravki.md#p-1)

---

<a id="s4"></a>

## 4. Экземпляр компонента и DOM

Тест может проверять класс компонента (значения полей) и отрисованный шаблон (что видит пользователь). Вот пример из материала:

```ts
it(`should have as title 'Angular Unit Testing'`, async(() => {
  const fixture = TestBed.createComponent(AppComponent);
  const app = fixture.debugElement.componentInstance;
  expect(app.title).toEqual('Angular Unit Testing');
}));

it('should render title in a h1 tag', async(() => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  const compiled = fixture.debugElement.nativeElement;
  expect(compiled.querySelector('h1').textContent).toContain('Welcome to Angular Unit Testing!');
}));
```

**Что в нём происходит.** Первый тест берёт экземпляр компонента и проверяет поле `title`. Второй запускает `detectChanges()`, чтобы шаблон отрисовался, находит `<h1>` и проверяет его текст. Разница между «классом» и «DOM» объяснена верно.

Но код написан для старой версии Angular: обёртки `async(...)` в `@angular/core/testing` больше нет (проверено на Angular 21: экспортируются только `waitForAsync` и `fakeAsync`), а в Vitest для синхронного теста обёртка не нужна вовсе. Класс корневого компонента в новых проектах называется `App`, а `title` в нём — `protected`-сигнал, к которому тест снаружи не обращается. ⚠ [П-2](10_3-vitest-popravki.md#p-2)

```ts
it('отображает заголовок в h1', () => {
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();                                    // отрисовать шаблон
  const el: HTMLElement = fixture.nativeElement;
  expect(el.querySelector('h1')?.textContent).toContain('Hello');
});
```

---

<a id="s5"></a>

## 5. Тест формы

Формы — частая цель тестов: верна ли проверка полей, заблокирована ли кнопка, вызывается ли отправка. Вот начало теста формы контактов из материала:

```ts
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let comp: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContactComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(ContactComponent);
      comp = fixture.componentInstance; // ContactComponent test instance
      de = fixture.debugElement.query(By.css('form'));
      el = de.nativeElement;
    });
  }));
```

И тесты:

```ts
it(`should set submitted to true`, async(() => {
  comp.onSubmit();
  expect(comp.submitted).toBeTruthy();
}));

it(`should call the onSubmit method`, async(() => {
  fixture.detectChanges();
  spyOn(comp, 'onSubmit');
  el = fixture.debugElement.query(By.css('button')).nativeElement;
  el.click();
  expect(comp.onSubmit).toHaveBeenCalledTimes(0);
}));

it(`form should be invalid`, async(() => {
  comp.contactForm.controls['email'].setValue('');
  comp.contactForm.controls['name'].setValue('');
  comp.contactForm.controls['text'].setValue('');
  expect(comp.contactForm.valid).toBeFalsy();
}));
```

**Что в нём происходит.** Тестовый модуль собирается с компонентом и модулями форм; после компиляции тест берёт fixture, экземпляр и элемент `<form>` через `By.css`. Второй тест вызывает `onSubmit` и проверяет флаг. Третий ставит **шпиона** на `onSubmit`, нажимает кнопку и проверяет, что метод **не** вызван: форма пустая, кнопка должна быть заблокирована. Четвёртый очищает поля и проверяет, что форма невалидна. Идеи тестов хорошие — особенно проверка, что заблокированная кнопка не отправляет форму.

Но это код Jasmine/Karma, который в Vitest не запустится: ⚠ [П-3](10_3-vitest-popravki.md#p-3)

- **`async(...)`** больше не существует ([§4](#s4));
- **`spyOn`** — глобальная функция Jasmine; в Vitest это **`vi.spyOn`**, и материал сам называет его «jasmine spy»;
- **`declarations: [ContactComponent]`** — standalone-компонент в `declarations` вызывает ошибку; его передают в `imports`, а `FormsModule`, `ReactiveFormsModule` компонент подключает сам. `BrowserModule` в тестах не нужен;
- **`.then(...)` без `await`** в `beforeEach` — без обёртки `async` Vitest не дождётся создания fixture, и тесты могут начаться раньше.

Вот исправленная версия:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let comp: ContactComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ContactComponent] }).compileComponents();
    fixture = TestBed.createComponent(ContactComponent);
    comp = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('пустая форма невалидна', () => {
    comp.contactForm.setValue({ email: '', name: '', text: '' });
    expect(comp.contactForm.valid).toBe(false);
  });

  it('кнопка отправки заблокирована, пока форма невалидна, и onSubmit не вызывается', () => {
    const submitSpy = vi.spyOn(comp, 'onSubmit');
    const button = el.querySelector<HTMLButtonElement>('button[type=submit]')!;
    expect(button.disabled).toBe(true);
    button.click();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('onSubmit ставит submitted', () => {
    comp.onSubmit();
    expect(comp.submitted).toBe(true);
  });
});
```

**Какая последовательность?**

1. **`beforeEach`** ждёт настройку модуля (`await`), создаёт компонент и отрисовывает шаблон.
2. **Тест «невалидна»** задаёт пустые значения всем полям и проверяет `valid`.
3. **Тест «кнопка»:**
   1. `vi.spyOn` оборачивает метод `onSubmit` шпионом, который запоминает вызовы;
   2. тест проверяет, что кнопка заблокирована;
   3. нажимает её — заблокированная кнопка не отправляет форму;
   4. шпион подтверждает, что `onSubmit` не вызывался.
4. **Тест «submitted»** вызывает метод напрямую и проверяет флаг.

---

<a id="s6"></a>

## 6. Тест сервиса

Сервис тестируют без компонента: `TestBed` создаёт его, а тест получает экземпляр через `TestBed.inject`. Вот пример из материала:

```ts
import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

**Что в нём происходит.** Тестовый модуль пустой: сервис с `providedIn: 'root'` Angular создаст сам. `TestBed.inject(Auth)` возвращает экземпляр, и тест проверяет, что он создан. Пример верный — именно такой файл генерирует CLI Angular 20+ (имя `Auth` без суффикса).

Проверка «создан» — только начало. Сервис с HTTP тестируют через **`HttpTestingController`**: тест вызывает метод сервиса, контроллер перехватывает запрос, проверяет адрес и метод и отдаёт подготовленный ответ. Так можно проверить и успешный ответ, и ошибку сервера — без сервера. Пример — в [примерах, пример 1](10_3-vitest-primery.md#ex-1).

---

<a id="s7"></a>

## 7. Компонент с поддельным сервисом

Компонент, который получает данные от сервиса, в модульном тесте не должен ходить на настоящий сервер. **Подмена** (mock) — объект, который заменяет настоящую зависимость и возвращает заранее подготовленные данные. Материал верно объясняет зачем: тест проверяет только компонент, а подготовленные данные легко сделать любыми, в том числе трудными для получения от настоящего сервиса. Важно лишь, чтобы подмена возвращала данные той же формы, что настоящий сервис.

Вот компонент и тест из материала:

```ts
import { UserService } from './user.service';

@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent {
  text = 'user page';
  users;

  constructor(private userService: UserService) {
    this.users = this.userService.getUsers();
  }
}
```

```ts
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserComponent } from './user.component';
import { UserServiceMock } from '../../mocks/user.service.mock';

describe('ContactComponent', () => {
  let comp: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserComponent
      ],
      providers: [
        { provide: UserService, useClass: UserServiceMock }
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(UserComponent);
      comp = fixture.componentInstance; // UserComponent test instance
    });
  }));

  it(`should have one user`, async(() => {
    expect(comp.users.length).toEqual(1);
  }));

  it(`html should render one user`, async(() => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('p');
    expect(el.innerText).toContain('user1');
  }));
});
```

**Что в нём происходит.** В провайдерах теста `UserService` заменён классом `UserServiceMock`, который возвращает одного пользователя. Первый тест проверяет, что компонент получил одного пользователя, второй — что он отрисован. Главная идея — **`{ provide: …, useClass: … }`** — верная: так в Angular подменяют зависимость через внедрение.

Но тест не запустится и не пройдёт: ⚠ [П-4](10_3-vitest-popravki.md#p-4)

- **`UserService` не импортирован** в файле теста, а используется в `providers` — ошибка компиляции;
- **`innerText` в jsdom не реализован** — проверено: `innerText` возвращает `undefined`, а `textContent` — `'user1'`. Проверка `toContain` на `undefined` упадёт. В тестах используют `textContent`;
- `async(...)`, `declarations`, `BrowserModule` — как в [§5](#s5); группа названа `ContactComponent`, хотя тестируется `UserComponent`;
- `users` без типа, и `getUsers()` синхронный — настоящий сервис с HTTP возвращает Observable, и подмена должна повторять эту форму.

Вот исправленная версия — сервис возвращает Observable, подмена — обычный объект через `useValue`:

```ts
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  getUsers(): Observable<User[]> { return this.http.get<User[]>('/api/users'); }
}

// user.component.ts
@Component({
  selector: 'app-user',
  template: `@for (u of users(); track u.id) { <p>{{ u.name }}</p> }`,
})
export class UserComponent {
  private userService = inject(UserService);
  protected users = toSignal(this.userService.getUsers(), { initialValue: [] });
}

// user.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserComponent } from './user.component';
import { UserService } from './user.service';

describe('UserComponent', () => {
  it('отображает пользователей из сервиса', async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [{ provide: UserService, useValue: { getUsers: () => of([{ id: 1, name: 'user1' }]) } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(UserComponent);
    fixture.detectChanges();
    const p: HTMLElement | null = fixture.nativeElement.querySelector('p');
    expect(p?.textContent).toContain('user1');          // textContent, не innerText
  });
});
```

**Какая последовательность?**

1. **Тестовый модуль** получает компонент в `imports` и вместо `UserService` — объект с методом `getUsers`, который возвращает `of([...])`.
2. **Компонент создаётся** — `inject(UserService)` отдаёт подмену; `toSignal` подписывается на `of(...)` и сразу получает массив.
3. **`detectChanges()`** отрисовывает `@for` — появляется `<p>user1</p>`.
4. **Проверка** читает `textContent` найденного `<p>`.

---

<a id="s8"></a>

## 8. Ключевые факты

**Vitest в Angular**

- С Angular 21 модульные тесты по умолчанию запускает Vitest; команда `ng test`; файлы `*.spec.ts`.
- По умолчанию среда — jsdom (имитация браузера в Node.js); `innerText` в ней не реализован — `textContent`.
- `providersFile` в `angular.json` добавляет провайдеры во все тесты; `setupFiles` — код перед тестами.

**Структура теста**

- `TestBed.configureTestingModule({ imports: [Component], providers: [...] })`; standalone-компоненты — в `imports`, не в `declarations`.
- `TestBed.createComponent` → fixture: `componentInstance`, `nativeElement`, `detectChanges()`.
- `TestBed.inject(Service)` — экземпляр сервиса.

**Jasmine → Vitest**

- Обёртки `async(...)` нет; для асинхронной настройки — `async`/`await` в `beforeEach`.
- `spyOn` → `vi.spyOn`; `jasmine.createSpy` → `vi.fn()`.

**Подмены**

- `{ provide: Service, useClass: Mock }` или `useValue: { ... }` заменяют зависимость.
- Подмена должна возвращать данные той же формы, что настоящий сервис (часто — Observable через `of(...)`).
- HTTP-сервис тестируют через `provideHttpClientTesting()` и `HttpTestingController`.

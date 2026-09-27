# 10_3 — Модульные тесты Angular с Vitest: вопросы для самопроверки

**Курс:** 3813ICT, недели 10–11
**Связанные файлы:** [конспект](10_3-vitest-konspekt.md) · [поправки](10_3-vitest-popravki.md) · [примеры](10_3-vitest-primery.md) · [ответы](10_3-vitest-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для кода сначала предскажи результат.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Vitest и настройка

<a id="q-1"></a>

### 1. Что происходит при `ng test`

Опиши по шагам, что делают Angular и Vitest при запуске `ng test`. В какой среде выполняются тесты по умолчанию?

[→ ответ](10_3-vitest-otvety.md#a-1)

<a id="q-2"></a>

### 2. `providersFile`

Зачем нужен `providersFile` в `angular.json`? Что изменится во всех тестах, если туда добавить `provideHttpClientTesting()`?

[→ ответ](10_3-vitest-otvety.md#a-2)

<a id="q-3"></a>

### 3. Fixture

Что такое `ComponentFixture` и что в нём есть? Зачем вызывать `detectChanges()` перед проверкой DOM?

[→ ответ](10_3-vitest-otvety.md#a-3)

---

## B. Код из Jasmine в Vitest

<a id="q-4"></a>

### 4. Найди ошибки

```ts
import { TestBed, async } from '@angular/core/testing';

beforeEach(async(() => {
  TestBed.configureTestingModule({ declarations: [ContactComponent] })
    .compileComponents()
    .then(() => { fixture = TestBed.createComponent(ContactComponent); });
}));
```

Назови три проблемы с Angular 21 и Vitest (`ContactComponent` — standalone).

[→ ответ](10_3-vitest-otvety.md#a-4)

<a id="q-5"></a>

### 5. Шпион

Как в Vitest проверить, что метод `onSubmit` компонента **не** вызвался после нажатия заблокированной кнопки?

[→ ответ](10_3-vitest-otvety.md#a-5)

<a id="q-6"></a>

### 6. Что покажет тест?

```ts
fixture.detectChanges();
const el = fixture.nativeElement.querySelector('p');   // <p>user1</p>
expect(el.innerText).toContain('user1');
```

Пройдёт ли тест в среде по умолчанию? Почему? Как исправить?

[→ ответ](10_3-vitest-otvety.md#a-6)

---

## C. Сервисы и подмены

<a id="q-7"></a>

### 7. Подмена зависимости

Как заменить `UserService` в тесте компонента? Чем `useClass` отличается от `useValue`? Какую форму должна повторять подмена?

[→ ответ](10_3-vitest-otvety.md#a-7)

<a id="q-8"></a>

### 8. `HttpTestingController`

Опиши по шагам тест метода `list()`, который делает `GET /api/products`. Зачем в `afterEach` вызывают `verify()`?

[→ ответ](10_3-vitest-otvety.md#a-8)

<a id="q-9"></a>

### 9. Ошибка сервера в тесте

Как в тесте сервиса получить ответ `409`, не запуская сервер?

[→ ответ](10_3-vitest-otvety.md#a-9)

<a id="q-10"></a>

### 10. Модульный или сквозной

Тест компонента с подменой `UserService` прошёл. Гарантирует ли это, что страница пользователей работает с настоящим сервером? Что проверит это?

[→ ответ](10_3-vitest-otvety.md#a-10)

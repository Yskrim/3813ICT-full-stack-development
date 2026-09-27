# 10_3 — Модульные тесты Angular с Vitest: ответы

**Курс:** 3813ICT, недели 10–11
**Связанные файлы:** [конспект](10_3-vitest-konspekt.md) · [поправки](10_3-vitest-popravki.md) · [примеры](10_3-vitest-primery.md) · [вопросы](10_3-vitest-voprosy.md)

---

## A. Vitest и настройка

<a id="a-1"></a>

### 1. Что происходит при `ng test`

**Ответ:** Angular собирает тестовое окружение; Vitest находит `*.spec.ts` и `*.test.ts`; `TestBed` создаёт компоненты и внедряет сервисы; Vitest выполняет проверки; результаты выводятся в терминал. По умолчанию — в Node.js с имитацией браузера jsdom.

**Подробнее:** [Конспект §1](10_3-vitest-konspekt.md#s1) · [← вопрос](10_3-vitest-voprosy.md#q-1)

<a id="a-2"></a>

### 2. `providersFile`

**Ответ:** он добавляет провайдеры во **все** тесты, чтобы не повторять их (маршрутизация, `HttpClient`) в каждом файле. С `provideHttpClientTesting()` ни один тест не отправит настоящий HTTP-запрос: все запросы будут ждать ответа от `HttpTestingController`.

**Подробнее:** [Конспект §2](10_3-vitest-konspekt.md#s2) · [← вопрос](10_3-vitest-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Fixture

**Ответ:** обёртка вокруг созданного компонента: экземпляр класса (`componentInstance`), DOM (`nativeElement`), `debugElement` и `detectChanges()`. Без `detectChanges()` шаблон не отрисован или не обновлён после изменения данных, и проверка DOM увидит старое состояние.

**Подробнее:** [Конспект §3](10_3-vitest-konspekt.md#s3) · [← вопрос](10_3-vitest-voprosy.md#q-3)

---

## B. Код из Jasmine в Vitest

<a id="a-4"></a>

### 4. Найди ошибки

**Ответ:**

1. `async` из `@angular/core/testing` удалена — импорт не скомпилируется;
2. standalone-компонент нельзя объявлять в `declarations` — его передают в `imports`;
3. `.then(...)` не ожидается: без обёртки `beforeEach` вернёт `undefined`, и тест может начаться до создания fixture.

```ts
beforeEach(async () => {
  await TestBed.configureTestingModule({ imports: [ContactComponent] }).compileComponents();
  fixture = TestBed.createComponent(ContactComponent);
});
```

**Подробнее:** [Конспект §5](10_3-vitest-konspekt.md#s5) · [П-2](10_3-vitest-popravki.md#p-2) · [П-3](10_3-vitest-popravki.md#p-3) · [← вопрос](10_3-vitest-voprosy.md#q-4)

<a id="a-5"></a>

### 5. Шпион

**Ответ:**

```ts
const spy = vi.spyOn(comp, 'onSubmit');
button.click();
expect(spy).not.toHaveBeenCalled();
```

`spyOn` без `vi.` — функция Jasmine, в Vitest её нет.

**Подробнее:** [Конспект §5](10_3-vitest-konspekt.md#s5) · [П-3](10_3-vitest-popravki.md#p-3) · [← вопрос](10_3-vitest-voprosy.md#q-5)

<a id="a-6"></a>

### 6. Что покажет тест

**Ответ:** упадёт: jsdom не реализует `innerText`, он возвращает `undefined`. Исправление — `el.textContent`.

**Подробнее:** [Конспект §7](10_3-vitest-konspekt.md#s7) · [П-4](10_3-vitest-popravki.md#p-4) · [← вопрос](10_3-vitest-voprosy.md#q-6)

---

## C. Сервисы и подмены

<a id="a-7"></a>

### 7. Подмена зависимости

**Ответ:** в `providers` теста: `{ provide: UserService, useClass: UserServiceMock }` или `{ provide: UserService, useValue: { getUsers: () => of([...]) } }`. `useClass` — Angular создаёт экземпляр указанного класса; `useValue` — используется готовый объект. Подмена должна повторять форму настоящего сервиса: если настоящий `getUsers()` возвращает Observable, подмена тоже возвращает Observable (`of(...)`).

**Подробнее:** [Конспект §7](10_3-vitest-konspekt.md#s7) · [← вопрос](10_3-vitest-voprosy.md#q-7)

<a id="a-8"></a>

### 8. `HttpTestingController`

**Ответ:** подключить `provideHttpClient()` и `provideHttpClientTesting()`; получить сервис и контроллер через `TestBed.inject`; подписаться на `list()`; `expectOne('/api/products')` находит запрос; проверить `req.request.method`; `req.flush([...])` отдаёт ответ; проверить, что подписчик получил данные. `verify()` проверяет, что не осталось неожиданных запросов.

**Подробнее:** [Пример 1](10_3-vitest-primery.md#ex-1) · [← вопрос](10_3-vitest-voprosy.md#q-8)

<a id="a-9"></a>

### 9. Ошибка сервера в тесте

**Ответ:** `req.flush({ error: 'duplicate' }, { status: 409, statusText: 'Conflict' })` — подписчик получит `HttpErrorResponse` со статусом `409` в `error`.

**Подробнее:** [Пример 1](10_3-vitest-primery.md#ex-1) · [← вопрос](10_3-vitest-voprosy.md#q-9)

<a id="a-10"></a>

### 10. Модульный или сквозной

**Ответ:** нет. Модульный тест проверяет только компонент: подмена может не совпасть с настоящим сервером (другой адрес, другая форма данных). Работу вместе с настоящим сервером проверяет сквозной тест (неделя 11) — или интеграционный тест API на сервере.

**Подробнее:** [Конспект §7](10_3-vitest-konspekt.md#s7) · [10_1 §3](10_1-testing-basics-konspekt.md#s3) · [← вопрос](10_3-vitest-voprosy.md#q-10)

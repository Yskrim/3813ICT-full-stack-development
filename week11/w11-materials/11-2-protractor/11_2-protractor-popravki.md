# 11_2 — Protractor: сквозные тесты Angular (устаревший подход): поправки

**Курс:** 3813ICT, недели 10–11
**Источник:** `11_2_-_Angular_e2e_Testing_with_Protractor_.pdf` (18 слайдов)
**Связанные файлы:** [конспект](11_2-protractor-konspekt.md) · [примеры](11_2-protractor-primery.md) · [вопросы](11_2-protractor-voprosy.md) · [ответы](11_2-protractor-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала, в чём несоответствие, как правильно, пример и **источник**.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: статус пакета получен из npm (`protractor@7.0.0`, пометка deprecated); код со скриншотов переписан дословно.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Protractor как текущий инструмент | 🔵 | Устарел в 2021, поддержка закончилась в 2023; `ng e2e` предлагает современные инструменты |
| [П-2](#p-2) | Команды без `await` | 🔵 | Работали на control flow Selenium, который удалён |
| [П-3](#p-3) | Page Object страницы входа | 🟡 | `any`, зашитые учётные данные, селекторы по классам оформления, зависимость тестов друг от друга |

---

<a id="p-1"></a>

## П-1. Protractor как текущий инструмент 🔵

### Как в материале

Слайды 2–4: Protractor — очень популярное решение для тестирования приложений Angular, со встроенной работой с элементами Angular и тестами в настоящих браузерах; альтернативы — Cypress и nightwatch.js. Проект по умолчанию содержит `e2e` и `protractor.conf.js`, в Angular CLI уже есть задача `ng e2e`. Ссылки на чтение — статьи про Angular 5.

### Пример из материала

```
ng e2e
```

### В чём несоответствие

Команда Angular объявила Protractor устаревшим (Angular 12, 2021) и завершила его поддержку летом 2023. В npm пакет помечен как устаревший:

```
protractor@7.0.0 deprecated: "Protractor is deprecated and will reach end-of-life by Summer 2023..."
```

Новые проекты Angular создаются без сквозных тестов; `ng e2e` без настроенного инструмента предлагает установить Cypress, Playwright, WebdriverIO, Nightwatch или Puppeteer. Сам курс в 11_3 говорит то же самое. Материал 11_2 полезен для чтения старого кода и идеи Page Object, но не для новых тестов.

### Как правильно

Новые сквозные тесты — на Cypress или Playwright через `ng e2e`.

### Пример

```bash
ng e2e                          # Angular предложит выбрать инструмент
# или сразу:
ng add @cypress/schematic       # Cypress (курс, 11_3)
npm init playwright@latest      # Playwright
```

**Источник:** [Angular — End to End Testing](https://angular.dev/tools/cli/end-to-end) · [Angular Blog — The State of End-to-End Testing with Angular](https://blog.angular.dev/the-state-of-end-to-end-testing-with-angular-d175f751cb9c)

---

<a id="p-2"></a>

## П-2. Команды без `await` 🔵

### Как в материале

Слайды 7, 11, 14, 16: тесты вызывают `page.navigateTo()`, `page.fillCredentials(...)` и сразу проверяют `expect(page.getPageTitleText()).toEqual(...)` — без `await`, хотя методы возвращают Promise.

### Пример из материала

```ts
it('when user browses to our app he should see the default "public" screen', () => {
  page.navigateTo();
  expect(page.getPageTitleText()).toEqual('Public');
});
```

### В чём несоответствие

Такой код работал только благодаря **control flow** (promise manager) Selenium WebDriver: команды без `await` ставились в очередь и выполнялись по порядку, а `expect` Jasmine в Protractor умел ждать Promise. Control flow был объявлен устаревшим и удалён в Selenium WebDriver 4; в Protractor 6–7 его отключали (`SELENIUM_PROMISE_MANAGER: false`) и переходили на `async`/`await`. Без этого команды выполняются в произвольном порядке, а `expect` сравнивает Promise со строкой.

Современные инструменты решают это по-своему: у Cypress своя очередь команд с автоматическим ожиданием, у Playwright — `await` и автоматическое ожидание элементов.

### Как правильно

В Protractor 7 — `async`/`await` на каждой команде; в новых тестах — Cypress или Playwright.

### Пример

```ts
// Protractor 7 без control flow
it('public page', async () => {
  await page.navigateTo();
  expect(await page.getPageTitleText()).toEqual('Public');
});

// То же на Cypress — ожидание встроено в команды
it('public page', () => {
  cy.visit('/');
  cy.get('app-root h1').should('have.text', 'Public');
});
```

**Источник:** [Protractor — async/await (control flow deprecation)](https://www.protractortest.org/#/async-await) · [Cypress — Retry-ability](https://docs.cypress.io/app/core-concepts/retry-ability)

---

<a id="p-3"></a>

## П-3. Page Object страницы входа 🟡

### Как в материале

Слайды 13–16: Page Object `LoginPage` хранит учётные данные `test`/`test`, метод `fillCredentials(credentias: any = this.credentials)` вводит их и нажимает `.btn-primary`, `getErrorMessage()` читает `.alert-danger`. Тест защищённой страницы сначала вызывает `publicPage.logOut()` — «must be logged out before trying access protected page».

### Пример из материала

```ts
fillCredentials(credentias: any = this.credentials) {
  element(by.css('[name="username"]')).sendKeys(credentias.username);
  element(by.css('[name="password"]')).sendKeys(credentias.password);
  element(by.css('.btn-primary')).click();
}
```

### В чём несоответствие

Шаблон Page Object применён правильно, но:

1. **`credentias: any`** — опечатка и отключённая проверка типов.
2. **Учётные данные зашиты** в Page Object. Тестовых пользователей лучше готовить перед тестами ([11_1, пример 2](11_1-e2e-basics-primery.md#ex-2)) и передавать явно.
3. **Селекторы по классам оформления** (`.btn-primary`, `.alert-danger`) ломаются при смене дизайна. Устойчивее — специальные атрибуты для тестов, например `data-cy` или `data-testid`.
4. **Тесты зависят от состояния предыдущих:** если прошлый тест оставил пользователя вошедшим, следующему приходится выходить. Каждый тест должен сам приводить приложение в нужное состояние (например, очищать хранилище в `beforeEach`).

### Как правильно

Типизированные параметры, данные из подготовки, селекторы `data-*`, независимые тесты.

### Пример

```ts
// cypress/support/pages/login.page.ts
export const loginPage = {
  visit: () => cy.visit('/login'),
  fill: (c: { username: string; password: string }) => {
    cy.get('[data-cy=username]').type(c.username);
    cy.get('[data-cy=password]').type(c.password);
    cy.get('[data-cy=submit]').click();
  },
  error: () => cy.get('[data-cy=login-error]'),
};

beforeEach(() => cy.clearAllSessionStorage());   // каждый тест с чистого состояния
```

**Источник:** [Cypress — Best Practices: Selecting Elements](https://docs.cypress.io/app/core-concepts/best-practices#Selecting-Elements) · [Playwright — Page object models](https://playwright.dev/docs/pom)

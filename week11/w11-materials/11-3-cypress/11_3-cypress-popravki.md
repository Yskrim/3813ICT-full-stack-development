# 11_3 — Cypress: сквозные тесты Angular: поправки

**Курс:** 3813ICT, недели 10–11
**Источник:** `11_3_-_Cypress_for_e2e_Testing_.pdf` (13 слайдов)
**Связанные файлы:** [конспект](11_3-cypress-konspekt.md) · [примеры](11_3-cypress-primery.md) · [вопросы](11_3-cypress-voprosy.md) · [ответы](11_3-cypress-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала, в чём несоответствие, как правильно, пример и **источник**.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: версии из npm — `cypress` 16.1.0, `@cypress/schematic` 6.0.0; код со скриншотов переписан дословно. Слайды 2–5 и 7–9 (история Protractor, установка, структура, первый тест, `cy.get`) соответствуют документации.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | «Jasmine Syntax» | 🟡 | Противоречие: Cypress использует Mocha и Chai, а не Jasmine |
| [П-2](#p-2) | «Обеим командам нужен ng serve» | 🟡 | `ng e2e` из схематика поднимает сервер сам |
| [П-3](#p-3) | Проверка `alert` через `cy.on` | 🔴 | Если `alert` не появится, тест всё равно зелёный |
| [П-4](#p-4) | Селекторы, данные и проверки | 🟡 | `input.first()`, реальные учётные данные, проверка sessionStorage |

---

<a id="p-1"></a>

## П-1. «Jasmine Syntax» 🟡

### Как в материале

Слайд 5: тесты построены на фреймворке Mocha, проверки пишутся на Chai. Слайд 6 «Cypress Basics — Jasmine Syntax»: файлы тестов используют синтаксис Jasmine; `describe()`, `beforeEach()` и `it()` — глобальные функции Jasmine.

### Пример из материала

```ts
describe('… Feature description …', () => {
  beforeEach(() => { /* Navigate to the page */ });
  it('… User interaction description …', () => { /* ... */ });
});
```

### В чём несоответствие

Слайды противоречат друг другу; верен слайд 5. В Cypress `describe`, `it`, `beforeEach` — из **Mocha** (выглядят как в Jasmine, но это другой фреймворк), а проверки — **Chai** и дополнения к нему: `should('equal', x)`, `expect(x).to.equal(y)`, `should('have.been.calledWith', ...)`. Проверки Jasmine (`toEqual`, `toBeTruthy`) в Cypress не работают, а у Mocha есть функции, которых нет в Jasmine (`context`, `specify`, `before`/`after`).

### Как правильно

Mocha для структуры, Chai для проверок.

### Пример

```ts
describe('Главная', () => {
  it('показывает заголовок', () => {
    cy.visit('/');
    cy.get('h1').should('have.text', 'Hello');          // Chai через should
    cy.title().then((t) => expect(t).to.equal('MyApp')); // Chai expect
    // expect(t).toEqual('MyApp')                        ❌ Jasmine — в Cypress нет
  });
});
```

**Источник:** [Cypress — Bundled Libraries (Mocha, Chai, Sinon)](https://docs.cypress.io/app/references/bundled-libraries) · [Cypress — Assertions](https://docs.cypress.io/app/references/assertions)

---

<a id="p-2"></a>

## П-2. «Обеим командам нужен ng serve» 🟡

### Как в материале

Слайд 8: `npx cypress run` запускает тесты без окна, `npx cypress open` — интерактивно; обе команды требуют, чтобы сервер разработки Angular был запущен через `ng serve`.

### Пример из материала

```
npx cypress run
npx cypress open
```

### В чём несоответствие

Для прямого запуска через `npx` это верно. Но `ng add @cypress/schematic` добавляет в `angular.json` цели `e2e` и `cypress-open` с настройкой `devServerTarget`: `ng e2e` сам запускает `ng serve`, прогоняет тесты и останавливает сервер. Это удобнее и одинаково работает у всех разработчиков и в CI. Сервер Express при этом нужно запустить отдельно, если тесты ходят на настоящий API.

### Как правильно

`ng e2e` / `ng run <проект>:cypress-open`; `npx cypress ...` — если фронтенд уже запущен.

### Пример

```bash
ng e2e                             # ng serve + cypress run + остановка
ng run chat-practice:cypress-open  # ng serve + интерактивный режим
```

**Источник:** [Cypress Angular Schematic — README (builders, devServerTarget)](https://github.com/cypress-io/cypress/tree/develop/npm/cypress-schematic) · [Cypress — Command Line](https://docs.cypress.io/app/references/command-line)

---

<a id="p-3"></a>

## П-3. Проверка `alert` через `cy.on` 🔴

### Как в материале

Слайд 12: тест вводит данные, нажимает кнопку и регистрирует обработчик `cy.on('window:alert', (str) => { expect(str).to.equal(...) })`, чтобы проверить текст сообщения.

### Пример из материала

```ts
cy.get('button').click();
cy.on('window:alert', (str) => {
  expect(str).to.equal(`email or password incorrect`);
})
```

### В чём несоответствие

Проверка находится **внутри** обработчика. Если `alert` не появится вовсе — сервер не ответил, код компонента изменили, кнопка не нажалась, — обработчик не вызовется, `expect` не выполнится, и тест завершится **успешно**. Это ложно зелёный тест: он проверяет текст, только если сообщение было, но не то, что оно было.

Документация Cypress для проверки `alert` использует заглушку: `cy.stub()` заменяет `window.alert`, а проверка `should('have.been.calledWith', ...)` падает, если вызова не было. Заглушку ставят до загрузки страницы — в `onBeforeLoad` у `cy.visit` — или до действия через `cy.window()`.

### Как правильно

`cy.stub(win, 'alert').as('alert')` + `cy.get('@alert').should('have.been.calledOnceWith', текст)`.

### Пример

```ts
cy.visit('/login', {
  onBeforeLoad(win) { cy.stub(win, 'alert').as('alert'); },
});
cy.get('[data-cy=submit]').click();
cy.get('@alert').should('have.been.calledOnceWith', 'email or password incorrect');   // упадёт без alert
```

**Источник:** [Cypress — cy.stub](https://docs.cypress.io/api/commands/stub) · [Cypress — Catalog of Events (window:alert)](https://docs.cypress.io/api/cypress-api/catalog-of-events)

---

<a id="p-4"></a>

## П-4. Селекторы, данные и проверки 🟡

### Как в материале

Слайд 12: тест находит поля через `cy.get('input').first()` и `.last()`, кнопку — через `cy.get('button')`; вводит адрес `k.su@griffith.edu.au` и пароли `123`/`666666`; во втором тесте проверяет адрес `/account` и значение `username` в sessionStorage через `cy.getAllSessionStorage()`. Группа тестов называется `Account`.

### Пример из материала

```ts
cy.get('input').first().type('k.su@griffith.edu.au');
cy.get('input').last().type('666666');
cy.get('button').click();
...
cy.getAllSessionStorage().then((result) => {
  expect(result['http://localhost:4200']['username']).to.deep.equal('k.su@griffith.edu.au')
})
```

### В чём несоответствие

1. **Хрупкие селекторы.** Порядок полей и «первая кнопка на странице» меняются при любой правке вёрстки. Документация Cypress рекомендует атрибуты `data-cy` — они нужны только тестам и не меняются вместе с дизайном. Материал сам ссылается на этот раздел лучших практик.
2. **Реальные учётные данные и данные сервера.** Тест полагается на пользователя, который уже есть в базе, и на реальный на вид адрес. Тестовых пользователей создают перед тестами ([11_1 П-2](11_1-e2e-basics-popravki.md#p-2)); для проверок только интерфейса ответ сервера подменяют `cy.intercept`.
3. **Проверка деталей реализации.** Ключ в sessionStorage пользователь не видит; при смене способа хранения тест упадёт, хотя всё работает. Сквозной тест проверяет видимый результат: адрес, текст на странице.
4. Название группы `Account` не соответствует содержимому (вход); кнопка вне `<form>` не срабатывает по Enter.

### Как правильно

`data-cy`, подготовленные данные, проверка видимого результата.

### Пример

```ts
cy.get('[data-cy=email]').type('e2e-user');
cy.get('[data-cy=password]').type('test-123');
cy.get('[data-cy=submit]').click();
cy.url().should('include', '/account');
cy.contains('e2e-user');
```

**Источник:** [Cypress — Best Practices: Selecting Elements](https://docs.cypress.io/app/core-concepts/best-practices#Selecting-Elements) · [Cypress — cy.intercept](https://docs.cypress.io/api/commands/intercept)

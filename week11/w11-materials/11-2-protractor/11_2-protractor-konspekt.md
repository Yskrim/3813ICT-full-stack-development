# 11_2 — Protractor: сквозные тесты Angular (устаревший подход): конспект

**Курс:** 3813ICT, недели 10–11
**Источник:** `11_2_-_Angular_e2e_Testing_with_Protractor_.pdf` (18 слайдов)
**Связанные файлы:** [поправки](11_2-protractor-popravki.md) · [примеры](11_2-protractor-primery.md) · [вопросы](11_2-protractor-voprosy.md) · [ответы](11_2-protractor-otvety.md) · назад: [11_1](11_1-e2e-basics-konspekt.md) · дальше: [11_3 Cypress](11_3-cypress-konspekt.md)

> Значок **⚠** со ссылкой вида **П-N** ведёт в файл поправок. Там разобрано, где исходный материал курса расходится с официальной документацией, со ссылкой на источник.

> **Важно.** Protractor официально устарел и больше не поддерживается (конец жизни — лето 2023; проверено: `npm view protractor` выводит предупреждение об устаревании). Этот файл нужен, чтобы читать старый код и понимать идеи, которые перешли в современные инструменты, — прежде всего **Page Object**. Новые тесты пишут на Cypress ([11_3](11_3-cypress-konspekt.md)) или Playwright.

**Содержание**

1. [Что такое Protractor и почему он устарел](#s1)
2. [Как он был устроен](#s2)
3. [API: browser, element, локаторы](#s3)
4. [Page Object](#s4)
5. [Сценарии входа на Protractor](#s5)
6. [Чем пользоваться сейчас](#s6)
7. [Ключевые факты](#s7)

---

<a id="s1"></a>

## 1. Что такое Protractor и почему он устарел

В 11_1 мы спланировали сквозные тесты на уровне сценариев. Теперь их нужно автоматизировать: инструмент должен открыть браузер, нажимать кнопки, вводить текст и проверять результат одинаково при каждом запуске.

**Protractor** — фреймворк сквозного тестирования от команды Angular, основанный на Selenium WebDriver. Много лет он был стандартом для Angular: умел работать с элементами Angular, запускал тесты в настоящих браузерах и был встроен в `ng e2e`.

Материал описывает Protractor как популярное текущее решение. Это устарело: команда Angular объявила его устаревшим в 2021 году, а поддержка закончилась летом 2023. В новых проектах Angular сквозные тесты по умолчанию не настроены, и `ng e2e` предлагает выбрать современный инструмент. ⚠ [П-1](11_2-protractor-popravki.md#p-1)

---

<a id="s2"></a>

## 2. Как он был устроен

- **Selenium WebDriver** — набор инструментов для автоматического управления браузером; Protractor отправлял через него команды браузеру.
- **Два файла:** тесты (`*.e2e-spec.ts` в папке `e2e`) и настройки (`protractor.conf.js`).
- **Jasmine** — синтаксис тестов (`describe`, `beforeEach`, `it`, `expect`), те же функции, что в старых модульных тестах Angular.
- **Запуск** — `ng e2e`.

Материал верно замечает, что переход между фреймворками тестов обходится недорого: разница часто — в написании проверок, например `toEqual()` в Jasmine и `to.equal()` в Mocha/Chai.

---

<a id="s3"></a>

## 3. API: browser, element, локаторы

Главные части API Protractor по материалу:

| Часть | Что делает | Пример |
|---|---|---|
| `browser` | управляет браузером: открыть адрес, узнать URL | `browser.get('/')` |
| `element(локатор)` | находит один элемент | `element(by.css('.pastebin')).getText()` |
| `element.all(локатор)` | находит все подходящие элементы | `element.all(by.css('li'))` |
| `by` | **локаторы** — способы найти элемент | `by.css('selector')` |

Вот пример из материала:

```ts
beforeEach(() => {browser.get('/');});

it('should display the name of the application',() => {
   expect(element(by.css('.pastebin')).getText()).toContain('Pastebin Application');
});
```

**Что в нём происходит.** Перед каждым тестом браузер открывает главную страницу; тест находит элемент по CSS-классу и проверяет его текст.

Такой код работал благодаря особому механизму Selenium — **control flow**: команды без `await` выполнялись по очереди автоматически, а `expect` умел ждать Promise. Этот механизм удалили из Selenium WebDriver 4; в последних версиях Protractor тесты нужно было писать с `async`/`await` на каждой команде. ⚠ [П-2](11_2-protractor-popravki.md#p-2)

---

<a id="s4"></a>

## 4. Page Object

Самая ценная идея этого файла — не сам Protractor, а шаблон **Page Object**, который работает и в современных инструментах.

**Page Object** — класс (или модуль), который описывает страницу приложения: как её открыть, где её элементы и какие действия на ней можно выполнить. Тест (spec) вызывает методы Page Object, а не ищет элементы сам.

Зачем: селекторы и повторяющиеся действия собраны в одном месте. Если изменится вёрстка страницы, правят один Page Object, а не десяток тестов. А тест читается как сценарий пользователя.

Вот Page Object публичной страницы и тест из материала:

```ts
import { browser, by, element } from 'protractor';

export class PublicPage {
  navigateTo() {
    return browser.get('/'); // we can navigate to '/' for get pblic page since this is the default
  }

  getPageTitleText() {
    return element(by.css('app-root h1')).getText();
  }

  logOut() {
    return element(by.css('a[href="/login"]')).click();
  }
}
```

```ts
import { PublicPage } from './public.po';

describe('protractor-tutorial - Public page', () => {
  let page: PublicPage;

  beforeEach(() => {
    page = new PublicPage();
  });

  it('when user browses to our app he should see the default "public" screen', () => {
    page.navigateTo();
    expect(page.getPageTitleText()).toEqual('Public');
  });
});
```

**Что в нём происходит.** Page Object знает, как открыть страницу, где заголовок и как выйти. Тест создаёт его перед каждым проверкой, открывает страницу и сравнивает заголовок. Материал советует раскладывать файлы `e2e` так же, как код приложения: `login/`, `protected/`, `public/`.

---

<a id="s5"></a>

## 5. Сценарии входа на Protractor

Материал автоматизирует сценарии входа из [11_1 §5](11_1-e2e-basics-konspekt.md#s5). Page Object страницы входа:

```ts
export class LoginPage {
  private credentials = {
    username: 'test',
    password: 'test'
  };

  navigateTo() {
    return browser.get('/login');
  }

  fillCredentials(credentias: any = this.credentials) {
    element(by.css('[name="username"]')).sendKeys(credentias.username);
    element(by.css('[name="password"]')).sendKeys(credentias.password);
    element(by.css('.btn-primary')).click();
  }

  getPageTitleText() {
    return element(by.css('app-root h2')).getText();
  }

  getErrorMessage() {
    return element(by.css('.alert-danger')).getText();
  }
}
```

И тесты страницы входа и защищённой страницы (фрагменты):

```ts
it('when user trying to login with wrong credentials he should stay on "login" page', () => {
  page.navigateTo();
  page.fillCredentials(wrongCredentias);
  expect(page.getPageTitleText()).toEqual('Login');
  expect(page.getErrorMessage()).toEqual('Username or password is incorrect');
});

it('when not authenticated user tries to access "protected" page he should redirect to "login" page', () => {
  publicPage.navigateTo();
  publicPage.logOut(); // must be logged out before trying access "protected" page
  page.navigateTo();
  expect(loginPage.getPageTitleText()).toEqual('Login');
});
```

**Что в нём происходит.** Тест входа открывает страницу, заполняет неверные данные и проверяет, что пользователь остался на странице входа и видит ошибку. Тест защищённой страницы сначала выходит из аккаунта, затем открывает `/protected` и проверяет, что оказался на странице входа. Сценарии и структура — хорошие; они почти один в один переносятся в Cypress ([примеры, пример 1](11_2-protractor-primery.md#ex-1)).

Недостатки, которые стоит не переносить в новые тесты: `credentias: any` (опечатка и отключённая проверка типов), учётные данные зашиты в Page Object, селекторы по классам оформления (`.btn-primary`, `.alert-danger`) ломаются при смене дизайна, а тесты зависят от состояния, оставленного предыдущими (нужен явный выход). ⚠ [П-3](11_2-protractor-popravki.md#p-3)

---

<a id="s6"></a>

## 6. Чем пользоваться сейчас

Angular CLI подключает сквозные тесты через `ng e2e` и предлагает на выбор: **Cypress**, **Playwright**, **WebdriverIO**, **Nightwatch**, **Puppeteer**. Курс продолжает с Cypress ([11_3](11_3-cypress-konspekt.md)).

Вот как части Protractor соответствуют Cypress и Playwright:

| Protractor | Cypress | Playwright |
|---|---|---|
| `browser.get('/login')` | `cy.visit('/login')` | `await page.goto('/login')` |
| `element(by.css(s))` | `cy.get(s)` | `page.locator(s)` |
| `.sendKeys('text')` | `.type('text')` | `await locator.fill('text')` |
| `.click()` | `.click()` | `await locator.click()` |
| `expect(el.getText()).toEqual(x)` | `cy.get(s).should('have.text', x)` | `await expect(locator).toHaveText(x)` |
| `browser.getCurrentUrl()` | `cy.url()` | `page.url()` / `await expect(page).toHaveURL(...)` |
| control flow (удалён) | очередь команд с автоматическим ожиданием | `async`/`await` с автоматическим ожиданием |

---

<a id="s7"></a>

## 7. Ключевые факты

- Protractor — сквозные тесты Angular на Selenium WebDriver; устарел, поддержка закончилась в 2023.
- В новых проектах `ng e2e` предлагает Cypress, Playwright, WebdriverIO, Nightwatch или Puppeteer.
- API Protractor: `browser`, `element`, `element.all`, локаторы `by`; старый код без `await` работал на удалённом control flow.
- Page Object — класс страницы с методами открыть, найти, действовать; тесты вызывают его методы. Шаблон актуален и сейчас.
- Файлы сквозных тестов раскладывают по страницам приложения.
- Селекторы по классам оформления и зашитые учётные данные — хрупкие; тесты не должны зависеть от состояния предыдущих.

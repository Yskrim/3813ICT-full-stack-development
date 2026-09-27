# 11_2 — Protractor: сквозные тесты Angular (устаревший подход): вопросы для самопроверки

**Курс:** 3813ICT, недели 10–11
**Связанные файлы:** [конспект](11_2-protractor-konspekt.md) · [поправки](11_2-protractor-popravki.md) · [примеры](11_2-protractor-primery.md) · [ответы](11_2-protractor-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Protractor

<a id="q-1"></a>

### 1. Статус Protractor

Стоит ли писать новые сквозные тесты Angular на Protractor? Что предлагает `ng e2e` в новом проекте?

[→ ответ](11_2-protractor-otvety.md#a-1)

<a id="q-2"></a>

### 2. Как он был устроен

На чём основан Protractor? Какие два файла нужны для его тестов и каким синтаксисом они пишутся?

[→ ответ](11_2-protractor-otvety.md#a-2)

<a id="q-3"></a>

### 3. API

Что делают `browser.get`, `element`, `element.all` и `by.css`?

[→ ответ](11_2-protractor-otvety.md#a-3)

<a id="q-4"></a>

### 4. Код без `await`

```ts
page.navigateTo();
expect(page.getPageTitleText()).toEqual('Public');
```

Почему этот код работал в старом Protractor и почему перестал?

[→ ответ](11_2-protractor-otvety.md#a-4)

---

## B. Page Object

<a id="q-5"></a>

### 5. Что такое Page Object

Что такое Page Object и какие две проблемы он решает?

[→ ответ](11_2-protractor-otvety.md#a-5)

<a id="q-6"></a>

### 6. Найди проблемы

```ts
export class LoginPage {
  private credentials = { username: 'test', password: 'test' };
  fillCredentials(credentias: any = this.credentials) {
    element(by.css('[name="username"]')).sendKeys(credentias.username);
    element(by.css('.btn-primary')).click();
  }
}
```

Назови три проблемы.

[→ ответ](11_2-protractor-otvety.md#a-6)

<a id="q-7"></a>

### 7. Зависимость тестов

Тест защищённой страницы начинается с `publicPage.logOut()`, «потому что пользователь должен выйти». Почему это признак плохой организации тестов? Как сделать лучше?

[→ ответ](11_2-protractor-otvety.md#a-7)

---

## C. Перенос в современные инструменты

<a id="q-8"></a>

### 8. Переведи на Cypress

```ts
browser.get('/login');
element(by.css('[name="username"]')).sendKeys('anna');
element(by.css('button')).click();
expect(browser.getCurrentUrl()).toContain('/channels');
```

[→ ответ](11_2-protractor-otvety.md#a-8)

<a id="q-9"></a>

### 9. Почему не нужен `await` в Cypress

Почему в Cypress команды пишут без `await`, а проверки не падают, если элемент появляется с задержкой?

[→ ответ](11_2-protractor-otvety.md#a-9)

<a id="q-10"></a>

### 10. Устойчивые селекторы

Чем `data-cy` / `data-testid` и `getByRole` лучше селекторов `.btn-primary` и `.alert-danger`?

[→ ответ](11_2-protractor-otvety.md#a-10)

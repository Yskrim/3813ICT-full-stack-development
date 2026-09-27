# 11_3 — Cypress: сквозные тесты Angular: конспект

**Курс:** 3813ICT, недели 10–11
**Источник:** `11_3_-_Cypress_for_e2e_Testing_.pdf` (13 слайдов)
**Связанные файлы:** [поправки](11_3-cypress-popravki.md) · [примеры](11_3-cypress-primery.md) · [вопросы](11_3-cypress-voprosy.md) · [ответы](11_3-cypress-otvety.md) · назад: [11_2](11_2-protractor-konspekt.md)

> Значок **⚠** со ссылкой вида **П-N** ведёт в файл поправок. Там разобрано, где исходный материал курса расходится с официальной документацией, со ссылкой на источник.

> Проверка: версии из npm — `cypress` 16.1, `@cypress/schematic` 6.0; код со скриншотов переписан дословно.

**Содержание**

1. [Почему Cypress](#s1)
2. [Установка и структура](#s2)
3. [Как пишутся тесты](#s3)
4. [Первый тест](#s4)
5. [Запуск](#s5)
6. [Тест страницы входа](#s6): [пример из материала](#s6-1) · [что с ним не так](#s6-2) · [исправленная версия](#s6-3)
7. [Ключевые факты](#s7)

---

<a id="s1"></a>

## 1. Почему Cypress

В 11_2 мы увидели, как сквозные тесты писали на Protractor и почему от него отказались. Материал объясняет ситуацию верно: до Angular 12 стандартом был Protractor на WebDriver; с Angular 12 он устарел, и в новых проектах сквозные тесты по умолчанию не настроены. Курс выбирает **Cypress**.

**Cypress** — фреймворк сквозного тестирования веб-приложений: он запускает браузер, выполняет в нём тесты, управляет страницей и показывает каждый шаг. Тест-раннер — открытый и бесплатный.

Чем он отличается:

- **не использует WebDriver** — Node.js-процесс запускает браузер, а тесты выполняются прямо в нём, рядом с приложением; поэтому Cypress видит DOM, сеть и хранилища напрямую;
- **сам ждёт** появления элементов и выполнения проверок — никаких `await` и ручных задержек;
- **хорошо документирован** — с ним можно написать полезные тесты с небольшими усилиями.

---

<a id="s2"></a>

## 2. Установка и структура

В Angular-проект Cypress проще всего добавить схематиком:

```bash
ng add @cypress/schematic
```

После установки в проекте появляется папка `cypress`:

| Что | Зачем |
|---|---|
| `tsconfig.json` | настройки TypeScript для файлов этой папки |
| `e2e/` | сквозные тесты — файлы `*.cy.ts` |
| `support/` | общий код: свои команды, действия перед каждым тестом |
| `fixtures/` | тестовые данные (JSON) |

В корне проекта появляется `cypress.config.ts` с настройками, например адресом приложения:

```ts
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',     // cy.visit('/login') откроет http://localhost:4200/login
  },
});
```

---

<a id="s3"></a>

## 3. Как пишутся тесты

Материал верно говорит, что тесты Cypress построены на фреймворке **Mocha**, а проверки пишутся на **Chai**. Но на следующем слайде называет синтаксис «Jasmine» — это противоречие: `describe`, `beforeEach`, `it` здесь — функции Mocha (они выглядят так же, как в Jasmine), а проверки — Chai (`should('equal', ...)`, `expect(...).to.equal(...)`), а не Jasmine (`toEqual`). ⚠ [П-1](11_3-cypress-popravki.md#p-1)

Общая схема теста из материала:

```ts
describe('… Feature description …', () => {
  beforeEach(() => {
    // Navigate to the page
  });

  it('… User interaction description …', () => {
    // Interact with the page
    // Assert something about the page content
  });
});
```

Две вещи отличают Cypress от обычного кода:

- **очередь команд.** `cy.visit`, `cy.get`, `cy.click` не выполняются сразу — они ставятся в очередь, и Cypress выполняет их по порядку. Поэтому нельзя написать `const el = cy.get(...)` и использовать `el` как элемент;
- **автоматическое повторение.** Команды поиска и проверки `should(...)` повторяются, пока условие не выполнится или не истечёт время (по умолчанию 4 секунды). Если элемент появляется после ответа сервера, тест просто подождёт.

---

<a id="s4"></a>

## 4. Первый тест

Материал начинает с минимального теста, который проверяет заголовок документа:

```ts
describe('Account', () => {
  beforeEach(() => {
    cy.visit('/account');
  });

  it('has the correct title', () => {
    cy.title().should('equal', 'MyApp');
  });
});
```

**Что в нём происходит.** Перед тестом Cypress открывает `/account` (относительно `baseUrl`); `cy.title()` берёт `<title>` страницы, а `should('equal', 'MyApp')` проверяет его, повторяя, пока не совпадёт. Пример верный.

Для поиска элементов используют **`cy.get(селектор)`**; материал ссылается на документацию и раздел лучших практик выбора элементов — к нему вернёмся в [§6](#s6).

---

<a id="s5"></a>

## 5. Запуск

У Cypress две команды:

- **`npx cypress run`** — без интерфейса: браузер работает «headless», окно не видно; для CI и быстрой проверки;
- **`npx cypress open`** — интерактивно: открывается окно, где выбирают браузер и тесты, видно каждый шаг; при изменении теста он перезапускается. Для разработки.

Материал говорит, что обеим командам нужен запущенный `ng serve`. Это верно для прямого запуска `npx cypress ...`. Но схематик добавляет в `angular.json` цели `e2e` и `cypress-open`, которые **сами** поднимают сервер разработки: `ng e2e` запускает `ng serve`, прогоняет тесты и останавливает сервер. ⚠ [П-2](11_3-cypress-popravki.md#p-2)

```bash
ng e2e                 # поднять ng serve + cypress run + остановить
ng run my-app:cypress-open    # поднять ng serve + cypress open
```

Для тестов, которые ходят на настоящий сервер Express, его нужно запустить отдельно (с тестовой базой, [11_1, пример 2](11_1-e2e-basics-primery.md#ex-2)).

---

<a id="s6"></a>

## 6. Тест страницы входа

<a id="s6-1"></a>

### 6.1 Пример из материала

Материал тестирует страницу входа из воркшопа недели 5. Шаблон и класс компонента:

```html
<div class="wrapper fadeInDown">
  <div id="formContent">
    <!-- Login Form -->
    <form>
      <input type="email" name="email" [(ngModel)]=" email" class="fadeIn second" placeholder="email">
      <input type="password" name="password" [(ngModel)]=" password" class="fadeIn third" placeholder="password">
    </form>
    <button (click)="submit()" class="fadeIn fourth"> submit</button>
  </div>
</div>
```

```ts
submit(){
  let user = {username:this.email, pwd: this.password};
  this.httpClient.post(BACKEND_URL + '/login', user,  httpOptions)
    .subscribe((data:any)=>{
      if (data.ok){
        alert("correct");
        sessionStorage.setItem('userid', data.userid.toString());
        sessionStorage.setItem('userlogin', data.ok.toString());
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('userbirthdate', data.userbirthdate);
        sessionStorage.setItem('userage', data.userage.toString());
        this.router.navigateByUrl("/account");
      }
      else { alert("email or password incorrect");}
    })
}
```

И тест `login.cy.ts`:

```ts
describe('Account', () => {
  beforeEach(() => {cy.visit('/login'); }); // open page http://localhost:4200/login
  // test invalid username or password
  it('invalid username or password', () => { // input a username and an invalid password
    cy.get('input').first().type('k.su@griffith.edu.au');
    cy.get('input').last().type('123');
    cy.get('button').click(); // click to submit
    cy.on('window:alert', (str) => {
      expect(str).to.equal(`email or password incorrect`); // chect the alert
    })
  });
  // test invalid username or password
  it('valid username and password', () => { // input a valid pair of a username and a password
    cy.get('input').first().type('k.su@griffith.edu.au');
    cy.get('input').last().type('666666');
    cy.get('button').click();

    cy.on('window:alert', (str) => {
      expect(str).to.equal(`correct`); // chect the alert
    })

    cy.url().should('include', '/account') // check the currer page url
    // check the sessional storage
    cy.getAllSessionStorage().then((result) => {
      expect(result['http://localhost:4200']['username']).to.deep.equal('k.su@griffith.edu.au')
    })
  });
});
```

**Что в нём происходит.** Перед каждым тестом открывается страница входа. Первый тест вводит адрес и неверный пароль, нажимает кнопку и проверяет текст `alert`. Второй вводит верный пароль и проверяет `alert` «correct», переход на `/account` и значение `username` в sessionStorage.

<a id="s6-2"></a>

### 6.2 Что с ним не так

Структура теста хорошая: два сценария из [11_1 §5](11_1-e2e-basics-konspekt.md#s5), проверка адреса. Но у него четыре проблемы.

1. **Проверка `alert` не может провалиться.** `expect` стоит **внутри** обработчика `window:alert`. Если `alert` не появится вовсе (сервер упал, код изменили), обработчик не вызовется, `expect` не выполнится — и тест станет зелёным. Надёжно — подменить `alert` заглушкой `cy.stub` и проверить, что её вызвали с нужным текстом. ⚠ [П-3](11_3-cypress-popravki.md#p-3)
2. **Хрупкие селекторы.** `cy.get('input').first()` / `.last()` сломаются, если в форме появится ещё одно поле; `cy.get('button')` — если на странице появится вторая кнопка. Документация Cypress советует атрибуты `data-cy`. ⚠ [П-4](11_3-cypress-popravki.md#p-4)
3. **Реальные учётные данные и данные сервера.** В тесте — настоящий на вид адрес преподавателя и пароль, а результат зависит от того, что сейчас лежит в базе сервера. Тестовые пользователи создаются перед тестами ([11_1 П-2](11_1-e2e-basics-popravki.md#p-2)).
4. **Проверка деталей реализации.** Проверка ключа `username` в sessionStorage привязывает сквозной тест к способу хранения; пользователь этого не видит. Лучше проверять видимый результат — имя в шапке. Группа названа `Account`, хотя тестируется вход.

<a id="s6-3"></a>

### 6.3 Исправленная версия

```html
<!-- login.component.html — атрибуты data-cy для тестов -->
<form (ngSubmit)="submit()">
  <input type="email" name="email" [(ngModel)]="email" data-cy="email" placeholder="email">
  <input type="password" name="password" [(ngModel)]="password" data-cy="password" placeholder="password">
  <button type="submit" data-cy="submit">submit</button>
</form>
```

```ts
// cypress/e2e/login.cy.ts
describe('Вход', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:3000/api/test/reset');   // тестовые пользователи (11_1, пример 2)
    cy.visit('/login', {
      onBeforeLoad(win) {
        cy.stub(win, 'alert').as('alert');                        // alert подменён заглушкой ДО загрузки страницы
      },
    });
  });

  it('неверный пароль — сообщение об ошибке и остаёмся на /login', () => {
    cy.get('[data-cy=email]').type('e2e-user');
    cy.get('[data-cy=password]').type('wrong');
    cy.get('[data-cy=submit]').click();

    cy.get('@alert').should('have.been.calledOnceWith', 'email or password incorrect');   // упадёт, если alert не было
    cy.url().should('include', '/login');
  });

  it('верный пароль — переход на /account и имя в интерфейсе', () => {
    cy.get('[data-cy=email]').type('e2e-user');
    cy.get('[data-cy=password]').type('test-123');
    cy.get('[data-cy=submit]').click();

    cy.get('@alert').should('have.been.calledOnceWith', 'correct');
    cy.url().should('include', '/account');
    cy.contains('e2e-user');                                      // видимый результат вместо sessionStorage
  });
});
```

**Какая последовательность?**

1. **`beforeEach`:**
   1. запрос `POST /api/test/reset` возвращает тестовую базу в известное состояние;
   2. `cy.visit` открывает `/login`, а в `onBeforeLoad` — ещё до запуска приложения — заменяет `window.alert` заглушкой с именем `@alert`.
2. **Тест «неверный пароль»:**
   1. поля находятся по `data-cy`, вводятся данные, нажимается кнопка;
   2. `cy.get('@alert').should('have.been.calledOnceWith', ...)` повторяет проверку, пока заглушку не вызовут с этим текстом, и **падает**, если за 4 секунды этого не случилось;
   3. адрес остался `/login`.
3. **Тест «верный пароль»** проверяет `alert` «correct», переход на `/account` и то, что имя пользователя видно на странице.

---

<a id="s7"></a>

## 7. Ключевые факты

**Cypress**

- Protractor устарел с Angular 12; новые проекты без сквозных тестов; курс использует Cypress.
- Cypress не использует WebDriver: тесты выполняются в браузере рядом с приложением.
- Установка — `ng add @cypress/schematic`; папка `cypress/` (`e2e`, `support`, `fixtures`), тесты `*.cy.ts`, настройки — `cypress.config.ts` (`baseUrl`).

**Тесты**

- Синтаксис — Mocha (`describe`, `it`, `beforeEach`) и Chai (`should`, `expect(...).to...`), не Jasmine.
- Команды `cy.*` ставятся в очередь; поиск и `should` повторяются до успеха или таймаута.
- `cy.visit`, `cy.get`, `.type`, `.click`, `cy.url()`, `cy.title()`, `cy.contains`.

**Запуск**

- `npx cypress run` — без окна; `npx cypress open` — интерактивно; обеим нужен запущенный фронтенд.
- `ng e2e` из схематика сам поднимает `ng serve`.

**Надёжные тесты**

- Селекторы — атрибуты `data-cy`, не порядок и не классы оформления.
- `alert` подменяют `cy.stub` и проверяют вызов; `expect` внутри `cy.on('window:alert')` не падает, если `alert` не было.
- Данные готовят перед тестом; проверяют видимый результат, а не детали хранения.

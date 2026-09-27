# 10_2 — Mocha: модульные и интеграционные тесты Node.js: поправки

**Курс:** 3813ICT, недели 10–11
**Источник:** `10_2_-_MoCha_for_Unit_and_Integration_NodeJS_Testing_.pdf` (16 слайдов)
**Связанные файлы:** [конспект](10_2-mocha-konspekt.md) · [примеры](10_2-mocha-primery.md) · [вопросы](10_2-mocha-voprosy.md) · [ответы](10_2-mocha-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала, в чём несоответствие, как правильно, пример и **источник**.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: код со скриншотов переписан дословно; тесты запущены с Mocha 12.0.2, Chai 6.2.2, chai-http 5 и supertest на Node.js 22. Вывод ниже — реальный.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Версия Mocha и скрипты | 🔵 | Mocha 6 → 12 (Node 20.19+); скрипт `test` запускает только интеграционные тесты |
| [П-2](#p-2) | `assert.equal` | 🟡 | Нестрогое `==`: `1` и `'1'` равны; нужен `node:assert/strict` |
| [П-3](#p-3) | Тесты умножения | 🟡 | `mul(2, 2) → 4` проходит и сложение; группа названа «Integration Tests» |
| [П-4](#p-4) | Асинхронный тест без `done` | 🔴 | Тест зелёный, а провал приписан хуку `after all` |
| [П-5](#p-5) | `chai.request(app)` | 🔴 | В chai-http 5 — `TypeError: chai.request is not a function` |
| [П-6](#p-6) | Данные теста и `require('../server.js')` | 🟡 | Вставка без очистки; тест работает с рабочей базой и запущенным сервером |

---

<a id="p-1"></a>

## П-1. Версия Mocha и скрипты 🔵

### Как в материале

Слайды 3–5: Mocha ставится как зависимость разработки (`npm install --save-dev mocha`), тесты лежат в `unitTest/test.js` и `integrationTest/test.js`, в `package.json` — Mocha `^6.2.0` и скрипты `"unitTest": "mocha ./unitTest/test.js"` и `"test": "mocha ./integrationTest/test.js"`; запуск — `npm run-script unitTest` и `npm run-script test`.

### Пример из материала

```json
"devDependencies": { "mocha": "^6.2.0" },
"scripts": {
  "unitTest": "mocha ./unitTest/test.js",
  "test": "mocha ./integrationTest/test.js"
}
```

### В чём несоответствие

1. **Mocha 6** (2019) давно не поддерживается; текущая версия — 12, и ей нужен Node.js `^20.19.0 || >=22.12.0`.
2. **Скрипт `test` запускает только интеграционные тесты.** `npm test` — общепринятая команда «запустить все тесты», и её же вызывают CI-системы; здесь модульные тесты при этом не выполнятся.
3. **Один файл `test.js` на папку** быстро разрастается; Mocha принимает шаблоны путей, поэтому удобнее файл на модуль: `unitTest/*.test.js`.

Совет ставить Mocha в зависимости разработки — верный.

### Как правильно

Актуальная версия; `test` — все тесты; отдельные скрипты по видам.

### Пример

```json
"devDependencies": { "mocha": "^12.0.0" },
"scripts": {
  "test": "mocha \"unitTest/**/*.test.js\" \"integrationTest/**/*.test.js\"",
  "test:unit": "mocha \"unitTest/**/*.test.js\"",
  "test:integration": "mocha \"integrationTest/**/*.test.js\""
}
```

**Источник:** [Mocha — Getting started, Command-line usage](https://mochajs.org/#getting-started) · [npm — scripts (npm test)](https://docs.npmjs.com/cli/using-npm/scripts)

---

<a id="p-2"></a>

## П-2. `assert.equal` 🟡

### Как в материале

Слайд 7: `assert.equal(value, expected, message)` — эквивалент `if (value == expected)`, не подходит для объектов, подходит для строк, целых и дробных чисел, булевых; `assert.deepStrictEqual` — для объектов и JSON со строгим сравнением.

### Пример из материала

```js
assert.equal([1,2,3].indexOf(4), -1);
```

### В чём несоответствие

Описание верное, и именно поэтому `assert.equal` опасен: сравнение `==` приводит типы. `assert.equal(1, '1')` и `assert.equal(0, false)` проходят — тест не заметит, что функция вернула строку вместо числа. Документация Node.js называет «legacy»-режим (`assert.equal`, `assert.deepEqual`) устаревшим и рекомендует **строгий режим**: `require('node:assert/strict')`, где `equal` работает как `strictEqual`, а `deepEqual` — как `deepStrictEqual`.

Не упомянуты и проверки ошибок: `assert.throws` (синхронная ошибка) и `assert.rejects` (отклонённый Promise).

### Как правильно

`node:assert/strict` для всех тестов.

### Пример

```js
const legacy = require('node:assert');
const assert = require('node:assert/strict');

legacy.equal(1, '1');                       // ✅ проходит — ошибка не замечена
assert.equal(1, '1');                        // ❌ AssertionError: Expected values to be strictly equal

assert.throws(() => JSON.parse('{'), SyntaxError);
await assert.rejects(fetchUser(999), /not found/);
```

**Источник:** [Node.js — assert, Strict assertion mode](https://nodejs.org/api/assert.html#strict-assertion-mode)

---

<a id="p-3"></a>

## П-3. Тесты умножения 🟡

### Как в материале

Слайды 9–11: функция умножения переписана как экспорт модуля; тест проверяет `mul(2, 0) → 0` и `mul(2, 2) → 4`, внешняя группа называется «Integration Tests for function multply»; вывод — `2 passing`.

### Пример из материала

```js
describe('Integration Tests for function multply', () => {
  ...
  it('should return 4 for 2,2', () => {
    assert.equal(mul(2, 2), 4);
  });
});
```

### В чём несоответствие

1. **Кейс не различает поведение.** `2 × 2 = 2 + 2 = 4` — функция сложения пройдёт этот тест. Хороший кейс выбирают так, чтобы неверная реализация его **провалила**: `mul(3, 4) = 12` (сложение даст 7).
2. **Мало кейсов:** нет отрицательных чисел и проверки неверного ввода, хотя текст слайда 10 сам говорит про «Incorrect Parameters, Null cases».
3. **«Integration Tests»** — это модульный тест одной функции; путаница в названиях мешает понять, что именно упало.

Совет переписать функцию так, чтобы её можно было экспортировать и протестировать, — верный.

### Как правильно

Кейсы, которые неверная реализация провалит; названия групп по сути.

### Пример

```js
describe('mul (модульный)', () => {
  it('3 × 4 = 12', () => assert.equal(mul(3, 4), 12));          // сложение даст 7
  it('-2 × 5 = -10', () => assert.equal(mul(-2, 5), -10));
  it('ноль даёт ноль', () => assert.equal(mul(7, 0), 0));
});
```

**Источник:** [Mocha — BDD interface (describe/it)](https://mochajs.org/#bdd)

---

<a id="p-4"></a>

## П-4. Асинхронный тест без `done` 🔴

### Как в материале

Слайд 13: тест маршрута `productFind` через модуль `http`: в `it` вызывается `http.get`, в колбэке проверяется `statusCode`, собирается тело и в событии `end` проверяется, что оно равно `'Hello Mocha'`.

### Пример из материала

```js
it('should return all products', function() {
  http.get('http://localhost:3000/productFind', function(response) {
    assert.equal(response.statusCode, 200);
    ...
    response.on('end', function() {
      assert.equal(body, 'Hello Mocha');
    });
  });
});
```

### В чём несоответствие

Функция теста не принимает `done`, не возвращает Promise и не `async`. Для Mocha это **синхронный** тест: он завершается сразу после вызова `http.get`, до ответа, и считается пройденным. Проверки выполняются позже, когда тест уже закончен. Проверено на Mocha 12 с заведомо неверной проверкой:

```
  ✔ material style: no done, wrong expectation
  1) "after all" hook for "material style: no done, wrong expectation":
      Uncaught AssertionError [ERR_ASSERTION]: 200 == 404
```

Тест зелёный; провал «перескочил» в хук. Без хуков ошибка может потеряться совсем. Это «ложно зелёный» тест — хуже, чем отсутствие теста.

Кроме того, маршрут списка товаров возвращает JSON-массив, а тест ждёт строку `'Hello Mocha'` — проверка скопирована из другого примера.

### Как правильно

`async`-тест с `await` (или `return` Promise, или `done`).

### Пример

```js
it('GET /api/products — 200 и массив', async () => {
  const res = await fetch('http://localhost:3000/api/products');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(await res.json()));
});
```

**Источник:** [Mocha — Asynchronous code (done, promises, async/await)](https://mochajs.org/#asynchronous-code)

---

<a id="p-5"></a>

## П-5. `chai.request(app)` 🔴

### Как в материале

Слайды 14–15: подключаются `chai` и `chai-http` через `require`, `chai.use(chaiHttp)`, `chai.should()`; запросы отправляются через `chai.request(app).get(...)` / `.post(...)` и завершаются `.end((err, res) => ...)`.

### Пример из материала

```js
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.request(app)
  .get('/productFind')
  .end((err, res) => { ... });
```

### В чём несоответствие

1. **В chai-http 5 `chai.request` нет.** Функция отправки запроса теперь экспортируется отдельно: `request.execute(app)`. Проверено (chai 6.2.2, chai-http 5): `TypeError: chai.request is not a function`.
2. **Chai 5+ и chai-http 5 — ES-модули.** Их подключают через `import` (в файлах `.mjs` или в проекте с `"type": "module"`). В Node.js 22 `require('chai')` тоже срабатывает, но chai-http отдаёт экспорт по умолчанию как `.default`.
3. **`.end((err, res) => ...)`** — колбэк-стиль; запрос chai-http — thenable, его можно ждать через `await`.

### Как правильно

`request.execute(app)` в ES-модуле или supertest.

### Пример

```js
// chai-http 5 (ES-модуль)
import * as chai from 'chai';
import chaiHttp, { request } from 'chai-http';
chai.use(chaiHttp);
chai.should();

it('GET /api/products', async () => {
  const res = await request.execute(app).get('/api/products');
  res.should.have.status(200);
});

// или supertest (CommonJS и ESM)
const res = await require('supertest')(app).get('/api/products').expect(200);
```

**Источник:** [chai-http — README (v5 usage)](https://github.com/chaijs/chai-http#readme) · [Chai — Guide](https://www.chaijs.com/guide/) · [supertest — README](https://github.com/ladjs/supertest#readme)

---

<a id="p-6"></a>

## П-6. Данные теста и `require('../server.js')` 🟡

### Как в материале

Слайд 12: в интеграционных тестах у каждой вложенной группы есть `before` и `after`: `before` готовит базу и зависимости, `after` возвращает всё в исходное состояние, чтобы один тест не влиял на другой. Слайды 14–15: тестовый файл подключает `../server.js`, хуки `before`/`after` только печатают сообщения, второй тест отправляет форму `{ name: 'Kaile', id: 3 }` на `/productInsert`.

### Пример из материала

```js
before(function() { console.log("before test"); });
after(function() { console.log("after test"); });
...
chai.request(app).post('/productInsert').type('form')
  .send({ 'name': 'Kaile', 'id': 3 })
```

### В чём несоответствие

1. **Пример противоречит собственному правилу.** Тест вставляет товар, но `after` ничего не удаляет. После каждого запуска в базе появляется ещё один «Kaile»; тесты, которые считают товары, начнут падать.
2. **Рабочая база.** `require('../server.js')` подключает тот же сервер и ту же базу, что и приложение; тесты портят реальные данные. Для тестов используют отдельную базу (`store_test`) и экспортируют приложение без `listen` (`app.js` отдельно от `server.js`).
3. **Проверяется только ответ.** Интеграционный тест должен проверять и состояние базы после запроса.
4. «indert» в названии теста — опечатка.

### Как правильно

Отдельная тестовая база, `before` готовит, `afterEach`/`after` очищают, проверка ответа и базы.

### Пример

```js
before(async () => { await connect('store_test'); });
afterEach(async () => { await getDb().collection('products').deleteMany({}); });
after(async () => { await close(); });

it('создаёт товар', async () => {
  await request(app).post('/api/products').send({ id: 101, name: 'Pen', description: '', price: 1, units: 5 }).expect(201);
  assert.ok(await getDb().collection('products').findOne({ id: 101 }));   // и база
});
```

**Источник:** [Mocha — Hooks](https://mochajs.org/#hooks) · [MongoDB Node.js Driver — Delete Documents](https://www.mongodb.com/docs/drivers/node/current/crud/delete/)

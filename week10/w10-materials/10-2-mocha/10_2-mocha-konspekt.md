# 10_2 — Mocha: модульные и интеграционные тесты Node.js: конспект

**Курс:** 3813ICT, недели 10–11
**Источник:** `10_2_-_MoCha_for_Unit_and_Integration_NodeJS_Testing_.pdf` (16 слайдов)
**Связанные файлы:** [поправки](10_2-mocha-popravki.md) · [примеры](10_2-mocha-primery.md) · [вопросы](10_2-mocha-voprosy.md) · [ответы](10_2-mocha-otvety.md) · назад: [10_1](10_1-testing-basics-konspekt.md) · дальше: [10_3 Vitest](10_3-vitest-konspekt.md)

> Значок **⚠** со ссылкой вида **П-N** ведёт в файл поправок. Там разобрано, где исходный материал курса расходится с официальной документацией, со ссылкой на источник.

> Проверка: примеры запущены с Mocha 12.0, Chai 6.2, chai-http 5 и supertest на Node.js 22. Результаты в тексте — реальный вывод.

**Содержание**

1. [Установка и запуск](#s1)
2. [Структура теста: describe, it, хуки](#s2)
3. [Проверки: assert](#s3)
4. [Модульный тест функции](#s4)
5. [Асинхронные тесты](#s5)
6. [Интеграционные тесты маршрутов](#s6): [пример из материала](#s6-1) · [что с ним не так](#s6-2) · [исправленная версия](#s6-3)
7. [Ключевые факты](#s7)

---

<a id="s1"></a>

## 1. Установка и запуск

В 10_1 мы разобрались, какие бывают тесты и как их планировать. Теперь — инструмент, который запускает их на сервере. Курс использует **Mocha**.

**Mocha** — фреймворк тестирования для Node.js: он находит файлы с тестами, запускает их, поддерживает асинхронный код и показывает отчёт. Проверки результатов Mocha не делает сам — для этого подключают **библиотеку проверок** (assertion library): встроенный модуль `node:assert` или Chai.

Материал верно советует ставить Mocha **в зависимости разработки** проекта, а не глобально: у каждого проекта будет своя версия, и обновление фреймворка не сломает тесты в других проектах.

```bash
npm install --save-dev mocha            # или: npm i -D mocha
```

Материал раскладывает тесты по двум папкам — `unitTest/` и `integrationTest/` — и добавляет скрипты в `package.json`:

```json
"devDependencies": {
  "mocha": "^6.2.0"
},
"scripts": {
  "unitTest": "mocha ./unitTest/test.js",
  "test": "mocha ./integrationTest/test.js"
}
```

Идея с двумя папками и скриптами верная. Но версия Mocha 6 устарела (сейчас 12, и ей нужен Node.js 20.19+ или 22.12+), а скрипт с именем `test` запускает **только интеграционные** тесты — неочевидно. Удобнее назвать скрипты по смыслу и оставить `test` для всех тестов. ⚠ [П-1](10_2-mocha-popravki.md#p-1)

```json
"scripts": {
  "test": "mocha \"unitTest/**/*.test.js\" \"integrationTest/**/*.test.js\"",
  "test:unit": "mocha \"unitTest/**/*.test.js\"",
  "test:integration": "mocha \"integrationTest/**/*.test.js\""
}
```

Запуск: `npm test`, `npm run test:unit`, `npm run test:integration` (`npm run` — короткая форма `npm run-script`).

---

<a id="s2"></a>

## 2. Структура теста: describe, it, хуки

Mocha задуман так, чтобы тест читался почти как текст на английском. Вот базовый файл из материала:

```js
var assert = require('assert'); //link in assertion library
describe('Tests for function one', () => {
   describe('Test Case 1 #fnOne()',() => {
      it('should return -1 when the value is not present', () => {
        assert.equal([1,2,3].indexOf(4), -1);
      });
   });
  describe('Test Case #fnOne()', () => {
    it('should return 3 as the value is present', () => {
       assert.equal([1,2,3,4,5].indexOf(4), 3);
    });
 });
});
```

**Что в нём происходит.** `describe` группирует тесты — внешний блок называет проверяемую функцию, вложенные — тест-кейсы. `it` — один тест: внутри вызывается проверяемый код и `assert` сравнивает результат с ожидаемым. Пример верный.

Три строительных блока Mocha:

- **`describe(название, функция)`** — группа тестов; группы можно вкладывать;
- **`it(название, функция)`** — один тест; если функция бросила исключение (например, не прошла проверка), тест упал;
- **хуки** — код подготовки и очистки:

| Хук | Когда выполняется |
|---|---|
| `before` | один раз перед всеми тестами группы |
| `after` | один раз после всех тестов группы |
| `beforeEach` | перед **каждым** тестом группы |
| `afterEach` | после **каждого** теста группы |

Хуки нужны интеграционным тестам: `before` готовит данные в базе, `after` их убирает, чтобы один тест не влиял на другой ([10_1 §5.2](10_1-testing-basics-konspekt.md#s5-2)).

---

<a id="s3"></a>

## 3. Проверки: assert

**Проверка** (assertion) — утверждение о результате, которое бросает исключение, если оно неверно. Материал использует встроенный модуль `assert` Node.js для модульных тестов и Chai для интеграционных. Вот таблица из материала:

| Проверка | Что делает (по материалу) |
|---|---|
| `assert.ok(value, message)` | проходит, если `value` истинно; `message` — описание причины провала |
| `assert.equal(value, expected, message)` | эквивалент `value == expected`; для строк, чисел, булевых; не для объектов |
| `assert.deepStrictEqual(value, expected)` | сравнивает объекты и JSON по всем ключам и значениям, строго: `{ a: 1 }` и `{ a: '1' }` не равны |
| `assert.fail(message)` | принудительно проваливает тест с сообщением |

Таблица верна, но `assert.equal` сравнивает **нестрого** (`==`): `assert.equal(1, '1')` пройдёт, и тест не заметит, что функция вернула строку вместо числа. Документация Node.js советует **строгий режим** — `node:assert/strict`, где `equal` и `deepEqual` сравнивают через `===` и строгую глубокую проверку. Кроме того, для ошибок есть `assert.throws` и `assert.rejects`, а для строк — `assert.match`. ⚠ [П-2](10_2-mocha-popravki.md#p-2)

```js
const assert = require('node:assert/strict');     // строгий режим

assert.equal(sum(1, 1), 2);                       // === (в строгом режиме)
assert.deepEqual(user, { name: 'anna', age: 25 }); // строгое глубокое сравнение
assert.throws(() => add(1, '1'), TypeError);      // ожидаем исключение
await assert.rejects(loadUser(999), /not found/); // ожидаем отклонённый Promise
assert.match(message, /required/);                // строка по шаблону
```

---

<a id="s4"></a>

## 4. Модульный тест функции

Чтобы протестировать функцию, её нужно **экспортировать** из модуля, где она определена. Материал показывает функцию умножения — сначала как анонимную, потом переписанную для экспорта:

```js
// index.js
module.exports = function(x, y) {
  return x * y;
}
```

И тест:

```js
var assert = require('assert');
var mul = require('../index');
describe('Integration Tests for function multply', () => {
  describe('Test Case 1 #mul()', () => {
    it('should return 0 when one of the inputs is 0', () => {
      assert.equal(mul(2, 0), 0);
    });
  });
  describe('Test Case 2 #mul()', () => {
    it('should return 4 for 2,2', () => {
      assert.equal(mul(2, 2), 4);
    });
  });
});
```

Запуск `npm run-script unitTest` выводит оба теста зелёными: `2 passing`.

**Что в нём происходит.** Тест подключает функцию из `../index`, вызывает её с двумя наборами чисел и проверяет результаты. Материал верно замечает главное: иногда код приходится **переписать**, чтобы его было удобно тестировать, — здесь функцию сделали экспортируемой.

Но сами тесты слабые. Кейс `mul(2, 2) → 4` не отличает умножение от **сложения**: функция `(x, y) => x + y` пройдёт его точно так же. Первый тест (`mul(2, 0) → 0`) функция сложения не пройдёт — но стоит заменить ноль, и снова не отличить. Кроме того, группа названа «Integration Tests», хотя это модульный тест. ⚠ [П-3](10_2-mocha-popravki.md#p-3)

Вот тесты, которые действительно проверяют умножение:

```js
// unitTest/mul.test.js
const assert = require('node:assert/strict');
const mul = require('../index');

describe('mul (модульный тест)', () => {
  it('умножает положительные: 3 × 4 = 12', () => assert.equal(mul(3, 4), 12));   // сложение дало бы 7
  it('ноль даёт ноль', () => assert.equal(mul(7, 0), 0));
  it('знаки: -2 × 5 = -10', () => assert.equal(mul(-2, 5), -10));
  it('коммутативность: mul(a, b) = mul(b, a)', () => assert.equal(mul(6, 9), mul(9, 6)));
});
```

---

<a id="s5"></a>

## 5. Асинхронные тесты

Серверный код почти весь асинхронный: запрос к базе, HTTP-запрос, чтение файла. У асинхронного теста одна главная опасность: **Mocha должен знать, когда тест закончился**. Если функция теста вернулась раньше, чем пришёл ответ, Mocha посчитает тест пройденным, а проверка выполнится уже потом — вне теста.

Сообщить Mocha о завершении можно двумя способами:

- **вернуть Promise** или сделать функцию теста `async` — Mocha дождётся его;
- **принять параметр `done`** и вызвать его, когда всё проверено (старый колбэк-стиль).

Вот тест маршрута из материала:

```js
describe('get/productFind', function() {
  it('should return all products', function() {
    http.get('http://localhost:3000/productFind', function(response) {
      // Assert the status code.
      assert.equal(response.statusCode, 200);

      var body = '';
      response.on('data', function(d) {body += d;});
      response.on('end', function() {
        // Let's wait until we read the response, and then assert the body
        assert.equal(body, 'Hello Mocha');
      });
    });
  });
});
```

**Что в нём происходит.** Тест отправляет GET-запрос, в колбэке проверяет код ответа, собирает тело и проверяет его. Задумка ясна.

Но у функции теста нет ни `done`, ни `await`, ни `return`: она запускает запрос и **сразу** завершается. Mocha отмечает тест как пройденный, не дождавшись ответа. Проверено на Mocha 12 — тест с заведомо неверной проверкой:

```
  ✔ material style: no done, wrong expectation
  1) "after all" hook for "material style: no done, wrong expectation":
      Uncaught AssertionError [ERR_ASSERTION]: 200 == 404
```

Тест **зелёный**, а провал приписан другому месту (хуку `after`). Если после теста ничего не выполняется, ошибка может и вовсе потеряться. Кроме того, маршрут `productFind` возвращает список товаров в JSON, а тест ждёт строку `'Hello Mocha'`. ⚠ [П-4](10_2-mocha-popravki.md#p-4)

Вот тот же тест, который действительно ждёт ответ:

```js
it('GET /api/products отвечает 200 и массивом', async () => {
  const res = await fetch('http://localhost:3000/api/products');   // await — Mocha ждёт
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(await res.json()));
});
```

---

<a id="s6"></a>

## 6. Интеграционные тесты маршрутов

<a id="s6-1"></a>

### 6.1 Пример из материала

Для тестов маршрутов материал подключает **Chai** (библиотека проверок со стилем `should`) и **chai-http** (дополнение, которое отправляет HTTP-запросы к приложению):

```js
let assert = require('assert');
let app = require('../server.js');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('Server test', function() {
  // The function passed to before() is called before running the test cases.
  before(function() {
    console.log("before test");
  });
  // The function passed to after() is called after running the test cases.
  after(function() {
    console.log("after test");
  });

  describe('/productFind', () => {
    it('it should GET all the products', (done) => {
      chai.request(app)
        .get('/productFind')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          // res.body.length.should.be.eql(2);
          done();
        });
    });
  });

  describe('/productInsert', () => {
    it('it should indert a doc', (done) => {
      chai.request(app).post('/productInsert').type('form')
        .send({ 'name': 'Kaile', 'id': 3 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('name');
          res.body.should.have.property('id');
          console.log(res.body);
          done();
        });
    });
  });
});
```

**Что в нём происходит.** Приложение подключается из `server.js`; `chai.request(app)` отправляет запрос прямо к нему. Первый тест проверяет, что список товаров отвечает `200` и массивом. Второй отправляет форму с новым товаром и проверяет, что в ответе есть поля `name` и `id`. Здесь `done` используется правильно — тест ждёт ответа.

<a id="s6-2"></a>

### 6.2 Что с ним не так

1. **`chai.request` больше нет.** В chai-http 5 API изменился: `chai.request(app)` заменён на функцию `request.execute(app)`, а сами Chai и chai-http стали ES-модулями. Проверено: `TypeError: chai.request is not a function`. ⚠ [П-5](10_2-mocha-popravki.md#p-5)
2. **Тест пишет в настоящую базу и не убирает за собой.** Второй тест вставляет товар «Kaile», а хуки `before` и `after` только печатают сообщения. После каждого запуска в базе остаётся ещё один тестовый товар — и материал сам на слайде 12 говорит, что `after` должен возвращать базу в исходное состояние. ⚠ [П-6](10_2-mocha-popravki.md#p-6)
3. **`require('../server.js')` запускает сервер.** Если `server.js` сам вызывает `listen` и подключается к рабочей базе, тесты работают с ней. Для тестов приложение экспортируют **без** `listen`, а базу берут отдельную, тестовую.
4. Форма (`type('form')`) вместо JSON — сервер из 9_2 разбирает оба формата, но API итогового проекта работает с JSON.

<a id="s6-3"></a>

### 6.3 Исправленная версия

Вот интеграционный тест на **supertest** — популярной библиотеке для HTTP-тестов Express, которая работает и в CommonJS, — с тестовой базой, подготовкой и очисткой данных:

```js
// ═════ server/app.js — приложение БЕЗ listen, чтобы его можно было тестировать ═════
const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/products', require('./routes/products'));      // маршруты из 9_3
app.use((err, req, res, next) => res.status(500).json({ error: 'Server error' }));
module.exports = app;

// ═════ server/server.js — запуск для работы ═════
// const app = require('./app');
// connect('store').then(() => app.listen(3000));

// ═════ server/integrationTest/products.test.js ═════
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { connect, getDb, close } = require('../db');

describe('API /api/products', () => {
  before(async () => {
    await connect('store_test');                              // ОТДЕЛЬНАЯ тестовая база
    await getDb().collection('products').createIndex({ id: 1 }, { unique: true });
  });

  afterEach(async () => {
    await getDb().collection('products').deleteMany({});      // каждый тест с чистой коллекции
  });

  after(async () => {
    await close();
  });

  describe('POST /', () => {
    it('создаёт товар и отвечает 201', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ id: 101, name: 'Pen', description: '', price: 1, units: 5 })
        .expect(201);

      assert.equal(res.body.name, 'Pen');
      const saved = await getDb().collection('products').findOne({ id: 101 });
      assert.ok(saved, 'товар должен быть в базе');          // проверяем и ответ, и базу
    });

    it('отвечает 409 на дубликат id', async () => {
      await getDb().collection('products').insertOne({ id: 101, name: 'Pen', description: '', price: 1, units: 5 });
      await request(app)
        .post('/api/products')
        .send({ id: 101, name: 'Other', description: '', price: 2, units: 1 })
        .expect(409);
      assert.equal(await getDb().collection('products').countDocuments({ id: 101 }), 1);
    });

    it('отвечает 400 без имени', async () => {
      const res = await request(app).post('/api/products').send({ id: 102, price: 1, units: 1 }).expect(400);
      assert.match(res.body.error, /name/);
    });
  });

  describe('GET /', () => {
    it('отвечает 200 и массивом', async () => {
      const res = await request(app).get('/api/products').expect(200);
      assert.ok(Array.isArray(res.body));
    });
  });
});
```

**Какая последовательность?**

1. **`before`** — один раз: подключение к **тестовой** базе `store_test` и уникальный индекс.
2. **Тест «создаёт товар»:**
   1. supertest отправляет `POST` прямо в приложение — без сети и без `listen`;
   2. `.expect(201)` проверяет код ответа;
   3. тест проверяет тело ответа и то, что товар действительно записан в базу.
3. **`afterEach`** очищает коллекцию — следующий тест начинается с пустой.
4. **Тест «дубликат»** сам готовит данные (вставляет товар) и проверяет, что второй не появился.
5. **Тест «без имени»** проверяет отказ `400` и текст ошибки.
6. **`after`** закрывает соединение — Mocha завершается.

Если нужен именно Chai со стилем `should`, в chai-http 5 запрос отправляется так (ES-модуль, проверено):

```js
// integrationTest/products.chai.test.mjs
import * as chai from 'chai';
import chaiHttp, { request } from 'chai-http';
import app from '../app.js';
chai.use(chaiHttp);
chai.should();

it('GET /api/products', async () => {
  const res = await request.execute(app).get('/api/products');
  res.should.have.status(200);
  res.body.should.be.an('array');
});
```

---

<a id="s7"></a>

## 7. Ключевые факты

**Mocha**

- Ставится в зависимости разработки: `npm i -D mocha`; Mocha 12 требует Node.js 20.19+ или 22.12+.
- `describe` группирует, `it` — один тест; хуки `before`/`after` (раз на группу), `beforeEach`/`afterEach` (на каждый тест).
- Скрипты называют по смыслу: `test` — все тесты, `test:unit`, `test:integration`.

**Проверки**

- `node:assert/strict`: `equal` — строгое `===`, `deepEqual` — строгое глубокое сравнение.
- `assert.throws` / `assert.rejects` — ожидаемые ошибки; `assert.match` — строка по шаблону.
- Кейсы должны различать поведение: `mul(2, 2) → 4` не отличает умножение от сложения.

**Асинхронность**

- Mocha ждёт тест, только если он вернул Promise, объявлен `async` или вызывает `done`.
- Асинхронная проверка без этого даёт ложно зелёный тест.

**Интеграционные тесты**

- Приложение экспортируют без `listen`; тестовая база отдельная.
- `before` / `afterEach` готовят и очищают данные; проверяют и ответ, и состояние базы.
- chai-http 5: `request.execute(app)` вместо `chai.request(app)`; альтернатива — supertest.

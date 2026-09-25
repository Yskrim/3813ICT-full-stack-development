# 9_3 — Пример: магазин на MongoDB, Node.js и Angular: поправки

**Курс:** 3813ICT, неделя 9
**Источник:** `9_3-_coding_example_24.pdf` (30 слайдов)
**Связанные файлы:** [конспект](9_3-crud-example-konspekt.md) · [примеры](9_3-crud-example-primery.md) · [вопросы](9_3-crud-example-voprosy.md) · [ответы](9_3-crud-example-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: код со скриншотов переписан дословно. Вызов колбэков и экспорты проверены запуском с драйвером `mongodb` 7.6; поведение `req.body` в `GET` — запуском Express 5.2; фрагменты Angular-классов — строгой компиляцией TypeScript 5.9. Результаты ниже — реальные.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Маршруты и расхождения текста с кодом | 🟡 | Глаголы в адресах, `POST` для всего; `/api/delete` против `/api/deleteitem`; неверные заголовки слайдов |
| [П-2](#p-2) | `server.js` | 🔴 | `dbName` не объявлен, `ObjectID` не импортирован — сервер не стартует |
| [П-3](#p-3) | Колбэки во всех маршрутах | 🔴 | Драйвер 5+ колбэки не вызывает — маршруты не отвечают никогда |
| [П-4](#p-4) | Маршрут добавления | 🔴 | Гонка «посчитать, потом вставить»; `insertedCount` не существует; дубликат со статусом 200 |
| [П-5](#p-5) | Счётчик товаров | 🔴 | В Express 5 `req.body` в `GET` — `undefined`; маршрут всегда отвечает 400 |
| [П-6](#p-6) | Проверка `id` при вводе | 🟡 | Подсказка — занятый максимум; запрос на каждое нажатие клавиши |
| [П-7](#p-7) | Обновление и удаление | 🟡 | Нет проверки `_id`; «успех» даже если документ не найден |
| [П-8](#p-8) | Сервис клиента | 🔵 | `post<any>`, параметры без типов, адрес повторяется семь раз |
| [П-9](#p-9) | Анимации и форма добавления | 🔵 | `@angular/animations` устарел; `number = null`; переключение вместо показа |

---

<a id="p-1"></a>

## П-1. Маршруты и расхождения текста с кодом 🟡

### Как в материале

Слайды 3–9 описывают семь маршрутов: `POST /api/add`, `GET /api/getlist`, `POST /api/getitem`, `POST /api/update`, `POST /api/delete`, `POST /api/checkvalidid`, `GET /api/prodcount`. В коде (слайды 20–25) удаление обрабатывает `/api/deleteitem`; слайд с кодом обновления озаглавлен «api-getlist.js», слайд с проверкой `id` — «api-prodcount.js».

### Пример из материала

```js
app.post('/api/getitem', ...)
app.post('/api/update', ...)
app.post('/api/deleteitem', ...)   // в тексте слайда — '/api/delete'
```

### В чём несоответствие

1. **Не REST:** действие закодировано глаголом в адресе, а чтение одного товара, изменение и удаление идут через `POST` с идентификатором в теле. В REST адрес называет ресурс, идентификатор — в адресе, действие — в методе ([9_2 П-3](9_2-mongodb-angular-popravki.md#p-3)).
2. **Текст и код расходятся:** клиент, написанный по тексту (`/api/delete`), получит `404` от кода (`/api/deleteitem`).
3. **Заголовки слайдов** не соответствуют коду на них — легко перепутать файлы при повторении.

### Как правильно

Один ресурс `/api/products` с методами и `_id` в адресе; специальные адреса (`count`, `check-id`) — раньше `/:id`.

### Пример

```js
router.get('/count', ...);           // было GET  /api/prodcount
router.get('/check-id/:id', ...);    // было POST /api/checkvalidid
router.get('/', ...);                // было GET  /api/getlist
router.get('/:id', ...);             // было POST /api/getitem
router.post('/', ...);               // было POST /api/add
router.put('/:id', ...);             // было POST /api/update
router.delete('/:id', ...);          // было POST /api/deleteitem
```

**Источник:** [Express — Routing (route parameters, order of routes)](https://expressjs.com/en/guide/routing.html) · [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)

---

<a id="p-2"></a>

## П-2. `server.js` 🔴

### Как в материале

Слайд 19: сервер подключает express, body-parser, cors, `MongoClient` и `ObjectID`; подключается к локальной MongoDB и, если соединение успешно, подключает маршруты и запускает HTTP-сервер.

### Пример из материала

```js
const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http').Server(app),
    { MongoClient, ObjectId} = require('mongodb'),
    client = new MongoClient('mongodb://localhost:27017');
...
cors = require('cors');
async function main() {
    await client.connect();
    const db = client.db(dbName);
    ...
    require('./routes/api-getitem.js')(db,app,ObjectID)
    ...
}
main();
```

### В чём несоответствие

1. **`dbName` не объявлен** — `ReferenceError: dbName is not defined` сразу после подключения.
2. **`ObjectID` не импортирован** — импортирован `ObjectId`, а передаётся `ObjectID` → ещё один `ReferenceError`. Экспорта `ObjectID` в драйвере больше нет вовсе (проверено: `require('mongodb').ObjectID` → `undefined`).
3. **`main()` без обработки ошибок** — если `mongod` не запущен, будет необработанное отклонение без понятного сообщения.
4. `cors = require('cors')` без объявления — глобальная переменная; `cors()` без настроек разрешает всем; `body-parser` не нужен (`express.json()`); `http.Server(app)` не нужен без Socket.IO.

Порядок «подключиться → подключить маршруты → слушать порт» при этом правильный.

### Как правильно

Объявить имя базы, импортировать `ObjectId`, обработать ошибку запуска.

### Пример

```js
const express = require('express');
const cors = require('cors');
const { connect, getDb } = require('./db');         // одно подключение (9_1, пример 2)

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use('/api/products', require('./routes/products'));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });

connect('store')                                     // имя базы — явно
  .then(() => getDb().collection('products').createIndex({ id: 1 }, { unique: true }))
  .then(() => app.listen(3000, () => console.log('http://localhost:3000')))
  .catch((err) => { console.error('Startup failed:', err.message); process.exit(1); });
```

**Источник:** [MongoDB Node.js Driver — Connection Guide](https://www.mongodb.com/docs/drivers/node/current/connect/) · [MDN — ReferenceError: "x" is not defined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_defined)

---

<a id="p-3"></a>

## П-3. Колбэки во всех маршрутах 🔴

### Как в материале

Слайды 20–25: все маршруты вызывают операции драйвера с колбэками — `find().count((err, count) => ...)`, `insertOne(product, (err, dbres) => ...)`, `find({}).toArray((err, data) => ...)`, `updateOne(filter, update, () => ...)`, `deleteOne(filter, (err, docs) => ...)` — и отправляют ответ клиенту внутри колбэка.

### Пример из материала

```js
app.get('/api/getlist',function(req,res){
  const collection = db.collection('products');
  collection.find({}).toArray((err,data)=>{
    res.send(data);
  })
})
```

### В чём несоответствие

Поддержка колбэков удалена из драйвера в версии 5.0. Методы игнорируют переданную функцию и возвращают Promise. Проверено с драйвером 7.6: колбэк не вызывается ни при успехе, ни при ошибке ([9_1 П-3](9_1-mongodb-node-popravki.md#p-3)).

Для маршрутов это значит: `res.send` внутри колбэка **не выполнится никогда**. Операция в базе может даже пройти (например, товар вставится), но клиент ответа не получит — запрос будет висеть до таймаута браузера. Код писался для драйвера 3.x.

Кроме того, все колбэки игнорируют `err`, а `if (err) throw err` внутри колбэка уронил бы процесс.

### Как правильно

`async`-обработчики с `await`; ошибки — через `try/catch` или обработчик ошибок Express 5.

### Пример

```js
router.get('/', async (req, res) => {
  const data = await col().find({}).toArray();     // ✅ Promise
  res.json(data);
});
// Express 5 сам передаёт исключения async-обработчиков в app.use((err, req, res, next) => ...)
```

**Источник:** [MongoDB Node.js Driver — Upgrade Guide (v5: callback support removed)](https://www.mongodb.com/docs/drivers/node/current/reference/upgrade/) · [Express 5 — Error handling (async handlers)](https://expressjs.com/en/guide/error-handling.html)

---

<a id="p-4"></a>

## П-4. Маршрут добавления 🔴

### Как в материале

Слайд 20: клиент присылает в теле объект из полей формы. Маршрут считает товары с таким же `id`; если их нет, вставляет документ и отправляет `{ num: insertedCount, err: null }`, иначе — `{ num: 0, err: "duplicate item" }`.

### Пример из материала

```js
product = req.body;
collection.find({'id':product.id}).count((err,count)=>{
  if (count== 0){
    collection.insertOne(product,(err,dbres)=>{
      if (err) throw err;
      let num = dbres.insertedCount;
      res.send({'num':num,err:null});
    })
  }else{
    res.send({num:0,err:"duplicate item"});
  }
});
```

### В чём несоответствие

1. **Гонка.** «Посчитать, потом вставить» — две отдельные операции. Два одновременных запроса с одним `id` оба получат `count == 0` и оба вставят товар. Гарантировать уникальность может только база — **уникальный индекс** по `id`; тогда вторая вставка завершится ошибкой `11000`.
2. **`insertedCount` у `insertOne` нет** — результат содержит `acknowledged` и `insertedId`. `num` всегда `undefined`, и клиент выводит «undefined new product (...) was added».
3. **`find().count()`** устарел ([8_2 П-11](../week8/8_2-mongodb-popravki.md#p-11)); для проверки существования — `countDocuments(filter, { limit: 1 })` или `findOne`.
4. **Дубликат со статусом `200`** — по смыслу это конфликт, `409`; клиенту приходится разбирать тело, чтобы понять, что произошла ошибка.
5. **Тело вставляется как есть** — без проверки полей и типов; `product` — глобальная переменная.

### Как правильно

Уникальный индекс + `insertOne` + ловить `11000` → `409`; проверять поля; отвечать `201` с созданным товаром.

### Пример

```js
// при запуске сервера
await getDb().collection('products').createIndex({ id: 1 }, { unique: true });

router.post('/', async (req, res) => {
  const id = req.body?.id;
  const fields = readFields(req.body);          // name, description, price, units — с проверкой
  if (!Number.isInteger(id) || id < 1 || !fields) return res.status(400).json({ error: 'Invalid product' });
  try {
    const { insertedId } = await col().insertOne({ id, ...fields });
    res.status(201).json({ _id: insertedId, id, ...fields });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      return res.status(409).json({ error: `Product ${id} already exists` });
    }
    throw err;
  }
});
```

**Источник:** [MongoDB — Unique Indexes](https://www.mongodb.com/docs/manual/core/index-unique/) · [MongoDB Node.js Driver — Insert Documents (InsertOneResult)](https://www.mongodb.com/docs/drivers/node/current/crud/insert/) · [MongoDB — db.collection.countDocuments()](https://www.mongodb.com/docs/manual/reference/method/db.collection.countDocuments/)

---

<a id="p-5"></a>

## П-5. Счётчик товаров 🔴

### Как в материале

Слайд 24: главная страница показывает количество товаров; маршрут `GET /api/prodcount` проверяет `if (!req.body)` и отвечает `400`, иначе считает товары и отправляет `{ count }`.

### Пример из материала

```js
app.get('/api/prodcount',function(req,res){
  if (!req.body) {
    return res.sendStatus(400)
  }
  const collection = db.collection('products');
  collection.find({}).count((err,count)=>{
    res.send({'count':count});
  });
});
```

### В чём несоответствие

У `GET`-запроса нет тела. В Express 4 с `body-parser` `req.body` был пустым объектом `{}`, и проверка проходила. В **Express 5** `req.body` равен `undefined`, если тело не разобрано, — поэтому проверка `if (!req.body)` срабатывает **всегда**, и маршрут отвечает `400` на каждый запрос. Проверено:

```
express 5.2.1 | GET without body → status 400
```

Главная страница никогда не покажет количество. Та же проверка в `POST`-маршрутах тоже ненадёжна: при запросе без `Content-Type: application/json` `req.body` будет `undefined`, а при пустом JSON — `{}`, который проходит проверку. Плюс колбэк `count` не вызывается ([П-3](#p-3)).

### Как правильно

В `GET` тело не проверяют; в `POST`/`PUT` проверяют конкретные поля, а не наличие `req.body`.

### Пример

```js
router.get('/count', async (req, res) => {
  res.json({ count: await col().countDocuments({}) });
});

// В POST — проверка полей, а не if (!req.body)
const { name } = req.body ?? {};
if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'name is required' });
```

**Источник:** [Express 5 — Migrating to Express 5 (req.body)](https://expressjs.com/en/guide/migrating-5.html) · [Express — req.body](https://expressjs.com/en/api.html#req.body)

---

<a id="p-6"></a>

## П-6. Проверка `id` при вводе 🟡

### Как в материале

Слайды 25 и 29: при каждом изменении поля `id` клиент вызывает `checkvalidid`; маршрут считает товары с этим `id` и, если номер занят, находит самый большой номер (сортировка по убыванию, `limit: 1`) и отправляет его как «рекомендацию следующего номера». Клиент показывает «Something above <topnum>».

### Пример из материала

```js
collection.find({}, {sort: {id: -1}, limit: 1}).toArray(function(err, items){
  res.send({success:0,topnum:items[0].id});
});
```

```html
<input type="number" [(ngModel)]="productid" (ngModelChange)="checkvalidid($event)" name="productid">
```

### В чём несоответствие

1. **Подсказка — занятый номер.** Отправляется максимальный **использованный** `id`, а не следующий свободный; клиенту приходится формулировать «что-то больше чем…». Сервер может сразу вернуть `max + 1`.
2. **Запрос на каждое изменение поля.** Ввод «123» — три запроса; ответы могут прийти не по порядку, и на экране окажется результат для «12». Нужны пауза перед запросом (`debounceTime`) и отмена прежнего (`switchMap`).
3. **Проверка при вводе — только подсказка.** Она не гарантирует уникальность: между проверкой и отправкой формы номер может занять другой пользователь. Гарантию даёт уникальный индекс ([П-4](#p-4)).

Приём «сортировка по убыванию + `limit: 1`» для максимума — верный.

### Как правильно

Сервер отвечает `{ available, nextId }`; клиент проверяет с паузой и отменой прежнего запроса.

### Пример

```js
router.get('/check-id/:id', async (req, res) => {
  const id = Number(req.params.id);
  const taken = (await col().countDocuments({ id }, { limit: 1 })) > 0;
  const [top] = await col().find({}, { sort: { id: -1 }, limit: 1, projection: { id: 1 } }).toArray();
  res.json({ available: !taken, nextId: (top?.id ?? 0) + 1 });
});
```

```ts
this.id$.pipe(
  debounceTime(400),
  distinctUntilChanged(),
  switchMap((id) => this.proddata.checkId(id)),
  takeUntilDestroyed(),
).subscribe(({ available, nextId }) => this.idHint.set(available ? '' : `Свободный ID: ${nextId}`));
```

**Источник:** [RxJS — debounceTime](https://rxjs.dev/api/operators/debounceTime) · [RxJS — switchMap](https://rxjs.dev/api/operators/switchMap) · [MongoDB Node.js Driver — Sort Results](https://www.mongodb.com/docs/drivers/node/current/crud/query/specify-documents-to-return/)

---

<a id="p-7"></a>

## П-7. Обновление и удаление 🟡

### Как в материале

Слайды 22–23: обновление превращает `product.objid` в `ObjectID` и выполняет `updateOne` с `$set` четырёх полей, затем отвечает `{ ok: objid }`; удаление превращает `productid` в `ObjectID`, выполняет `deleteOne` и отправляет клиенту заново загруженный список.

### Пример из материала

```js
var objectid = new ObjectID(product.objid);
collection.updateOne({_id:objectid},{$set:{name:product.name,description:product.description,price:product.price,units:product.units}},()=>{
  //Return a response to the client to let them know the delete was successful
  res.send({'ok':product.objid});
})
```

### В чём несоответствие

Хорошо, что сервер сам перечисляет изменяемые поля и не даёт менять `id` товара. Но:

1. **Нет проверки `_id`.** `new ObjectId('abc')` бросает исключение (`BSONError`); клиент получит `500` вместо понятного `400`.
2. **«Успех» без проверки результата.** Ответ отправляется, даже если документа с таким `_id` нет. Нужны `matchedCount` / `deletedCount` и `404`.
3. **Значения полей не проверяются** — `price: "дорого"` будет записан.
4. **Удаление возвращает весь список.** Это работает, но связывает маршрут удаления с экраном списка и увеличивает ответ; обычно отвечают `204`, а клиент убирает строку сам.
5. Комментарий «delete was successful» в коде обновления вводит в заблуждение; колбэки не вызываются ([П-3](#p-3)).

### Как правильно

Проверить `_id` и поля; отвечать по результату операции.

### Пример

```js
router.put('/:id', async (req, res) => {
  const _id = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null;
  const fields = readFields(req.body);
  if (!_id || !fields) return res.status(400).json({ error: 'Invalid id or product data' });
  const updated = await col().findOneAndUpdate({ _id }, { $set: fields }, { returnDocument: 'after' });
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const _id = ObjectId.isValid(req.params.id) ? new ObjectId(req.params.id) : null;
  if (!_id) return res.status(400).json({ error: 'Invalid id' });
  const { deletedCount } = await col().deleteOne({ _id });
  res.status(deletedCount ? 204 : 404).end();
});
```

**Источник:** [MongoDB Node.js Driver — Update Documents](https://www.mongodb.com/docs/drivers/node/current/crud/update/modify/) · [MongoDB Node.js Driver — Delete Documents](https://www.mongodb.com/docs/drivers/node/current/crud/delete/) · [BSON — ObjectId.isValid](https://mongodb.github.io/node-mongodb-native/Next/classes/BSON.ObjectId.html#isValid)

---

<a id="p-8"></a>

## П-8. Сервис клиента 🔵

### Как в материале

Слайд 26: `ProductdataService` отправляет запросы на все маршруты сервера и возвращает Observable, на которые подписываются компоненты; класс `Products` описывает форму товара.

### Пример из материала

```ts
add(product:Products){
  return this.http.post<any>('http://localhost:3000/api/add', product );
}
getitem(productID){
  return this.http.post<any>('http://localhost:3000/api/getitem', {'productid':productID} );
}
```

### В чём несоответствие

Возвращать Observable из сервиса — правильно. Но:

1. **`post<any>` / `get<any>`** отключают проверку типов ответа: опечатку `data.nmae` компилятор не заметит.
2. **Параметры без типа** (`productID`) — в строгом режиме ошибка `TS7006`.
3. **Полный адрес повторяется** в каждом методе; при смене порта или переходе на single origin придётся править семь строк. Удобнее одно поле с базовым адресом и прокси `ng serve` ([5_3 §2.5](../week5/5_3-node-hosting-konspekt.md#s2-5)).

### Как правильно

Интерфейс ответа для каждого метода, типизированные параметры, один базовый адрес.

### Пример

См. исправленный сервис в [конспекте §4](9_3-crud-example-konspekt.md#s4). Ключевые строки:

```ts
private readonly api = '/api/products';
get(_id: string): Observable<Product> { return this.http.get<Product>(`${this.api}/${_id}`); }
count(): Observable<{ count: number }> { return this.http.get<{ count: number }>(`${this.api}/count`); }
```

**Источник:** [Angular — Making requests (typed responses)](https://angular.dev/guide/http/making-requests) · [TypeScript — noImplicitAny](https://www.typescriptlang.org/tsconfig/#noImplicitAny)

---

<a id="p-9"></a>

## П-9. Анимации и форма добавления 🔵

### Как в материале

Слайды 28–29: форма добавления с `(submit)="addnewProduct($event)"` и `event.preventDefault()`; поля через `[(ngModel)]`; два триггера `@angular/animations` (`iderrorState`, `noticeState`) с состояниями `show`/`hide`, геттеры выбирают состояние по флагам. Числовые поля инициализированы `null`. Предлагается видео с советами по анимациям в Angular.

### Пример из материала

```ts
import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
...
productprice: number = null;
newprod: Products;
...
if (data.success == 0) {
  this.iderrormsg2 = " Something above " + data.topnum;
  this.iderrorshow = !this.iderrorshow;
}
```

### В чём несоответствие

1. **`@angular/animations` устарел** с Angular 20.2 (удаление планируется в v23). Для появления и исчезновения элементов Angular рекомендует `animate.enter` / `animate.leave` с обычным CSS: пакет, триггеры и провайдер анимаций не нужны, а сборка становится меньше. Кроме того, анимации пакета требуют `provideAnimations()` / `provideAnimationsAsync()` в конфигурации — в материале это не упомянуто.
2. **Строгий режим:**

   ```
   error TS2322: Type 'null' is not assignable to type 'number'.
   error TS2564: Property 'newprod' has no initializer and is not definitely assigned in the constructor.
   ```

3. **`iderrorshow = !this.iderrorshow`** — это переключение: при второй подряд ошибке предупреждение **исчезнет**. Нужно явно `true`.
4. **`(submit)` + `preventDefault()`** — с `FormsModule` для этого есть `(ngSubmit)`; `ComponentFactoryResolver` импортирован, но не используется (и устарел).
5. Состояние `display: 'none'` внутри анимации мешает плавному исчезновению; при `animate.leave` элемент просто убирают через `@if`.

### Как правильно

`@if` для показа, `animate.enter`/`animate.leave` для анимации, сигналы вместо пар «флаг + геттер», числа с начальным значением.

### Пример

```html
@if (idHint()) {
  <div class="alert alert-warning" animate.enter="fade-in" animate.leave="fade-out">{{ idHint() }}</div>
}
```

```css
.fade-in  { animation: fade 400ms ease-in; }
.fade-out { animation: fade 1000ms ease-out reverse; }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
```

```ts
protected idHint = signal('');                        // вместо флага, геттера и триггера
protected form: ProductInput = { id: 0, name: '', description: '', price: 0, units: 0 };   // без null
```

**Источник:** [Angular — Enter and leave animations (animate.enter / animate.leave)](https://angular.dev/guide/animations) · [Angular — Migrating to Native CSS Animations](https://angular.dev/guide/animations/migration) · [Angular API — @angular/animations (deprecated since v20.2)](https://angular.dev/api/animations/animateChild)

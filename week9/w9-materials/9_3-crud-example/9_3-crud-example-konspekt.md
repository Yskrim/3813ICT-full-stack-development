# 9_3 — Пример: магазин на MongoDB, Node.js и Angular: конспект

**Курс:** 3813ICT, неделя 9
**Источник:** `9_3-_coding_example_24.pdf` (30 слайдов)
**Связанные файлы:** [поправки](9_3-crud-example-popravki.md) · [примеры](9_3-crud-example-primery.md) · [вопросы](9_3-crud-example-voprosy.md) · [ответы](9_3-crud-example-otvety.md) · назад: [9_2](9_2-mongodb-angular-konspekt.md)

> Значок **⚠** со ссылкой вида **П-N** ведёт в файл поправок. Там разобрано, где исходный материал курса расходится с официальной документацией, со ссылкой на источник.

> Проверка: код со скриншотов переписан дословно. Поведение драйвера `mongodb` 7.6 (колбэки, экспорты) и Express 5 (`req.body` в GET) проверено запуском, фрагменты Angular-классов — строгой компиляцией TypeScript 5.9.

**Содержание**

1. [Что строим](#s1): [функции и данные](#s1-1) · [маршруты](#s1-2) · [интерфейс](#s1-3)
2. [Сервер: server.js](#s2)
3. [Маршруты сервера](#s3): [добавление](#s3-1) · [список](#s3-2) · [обновление и удаление](#s3-3) · [счётчик и проверка id](#s3-4) · [исправленные маршруты](#s3-5)
4. [Клиент: сервис](#s4)
5. [Клиент: список товаров](#s5)
6. [Клиент: форма добавления и анимации](#s6)
7. [Ключевые факты](#s7)

---

<a id="s1"></a>

## 1. Что строим

9_1 и 9_2 дали отдельные части: драйвер, маршруты, сервис, компоненты. Этот файл — сквозной пример **магазина**, где всё собрано вместе, плюс то, что делает приложение удобным: счётчик товаров, проверка номера товара при вводе и анимации сообщений. Пример ценен тем, что показывает весь путь от формы до базы. Но код в нём написан для драйвера MongoDB 3.x и в текущем виде не работает — поэтому разберём его внимательно и соберём рабочую версию.

<a id="s1-1"></a>

### 1.1 Функции и данные

Приложение должно уметь четыре вещи — полный CRUD:

1. добавить товар;
2. показать список всех товаров;
3. изменить товар;
4. удалить товар.

У товара пять полей: `id` (число), `name` (строка), `description` (строка), `price` (число), `units` (число — количество на складе). Кроме того, у каждого документа есть `_id`, который создаёт MongoDB. Номер `id` видит пользователь, а `_id` использует приложение, чтобы однозначно найти документ.

<a id="s1-2"></a>

### 1.2 Маршруты

Материал описывает семь маршрутов:

| Материал | Что делает | В стиле REST |
|---|---|---|
| `POST /api/add` | прочитать тело, проверить, что такого `id` нет, добавить, сообщить результат | `POST /api/products` |
| `GET /api/getlist` | вернуть все товары | `GET /api/products` |
| `POST /api/getitem` | найти один товар по данным из тела | `GET /api/products/:id` |
| `POST /api/update` | изменить товар по данным из тела | `PUT /api/products/:id` |
| `POST /api/delete` (в коде — `/api/deleteitem`) | удалить товар и вернуть обновлённый список | `DELETE /api/products/:id` |
| `POST /api/checkvalidid` | проверить, занят ли `id`, и подсказать следующий | `GET /api/products/check-id/:id` |
| `GET /api/prodcount` | вернуть количество товаров | `GET /api/products/count` |

Набор маршрутов продуман хорошо: у каждого одна задача. Но чтение, изменение и удаление идут через `POST`, действие закодировано глаголом в адресе, а текст и код местами расходятся: адрес удаления на слайде — `/api/delete`, в коде — `/api/deleteitem`; слайд с кодом обновления озаглавлен `api-getlist.js`, а слайд с проверкой `id` — `api-prodcount.js`. ⚠ [П-1](9_3-crud-example-popravki.md#p-1)

Во всех маршрутах REST адреса `count` и `check-id` должны стоять в роутере **раньше** `/:id`, иначе Express примет слово `count` за идентификатор.

<a id="s1-3"></a>

### 1.3 Интерфейс

Клиент — Angular с Bootstrap (установлен через `npm install bootstrap` и подключён в `angular.json`) и иконками Font Awesome (ссылка на CDN в `index.html`). Экраны:

- **главная** — название магазина и количество товаров;
- **добавление** — форма с полями товара; при вводе `id` сразу проверяется, не занят ли он;
- **список** — таблица товаров с кнопками «Изменить» и «Удалить»;
- **редактирование** — та же форма, но `id` изменить нельзя;
- **удаление** — с подтверждением; после удаления показывается обновлённый список.

Компоненты: `Home`, `AddProduct`, `ListProducts`, `UpdateProduct`; сервис `Proddata` для HTTP-запросов; класс `Products`, описывающий форму товара. Материал подчёркивает, что имена — на твой выбор.

---

<a id="s2"></a>

## 2. Сервер: server.js

Сервер разбит на модули: каждый маршрут — отдельный файл в папке `routes`, а `server.js` подключается к базе и подключает маршруты. Вот `server.js` из материала:

```js
// get dependencies
const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http').Server(app),
    { MongoClient, ObjectId} = require('mongodb'),
    client = new MongoClient('mongodb://localhost:27017');

// parse requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
cors = require('cors');
app.use(cors());

async function main() {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('colName');
    require('./routes/api-add.js')(db,app);
    require('./routes/api-prodcount.js')(db,app)
    require('./routes/api-validid.js')(db,app)
    require('./routes/api-getlist.js')(db,app)
    require('./routes/api-getitem.js')(db,app,ObjectID)
    require('./routes/api-update.js')(db,app,ObjectID)
    require('./routes/api-deleteitem.js')(db,app,ObjectID)

    require('./listen.js')(http)
}
main();
```

**Что в нём происходит.** Подключаются зависимости, настраивается разбор тела и CORS. Функция `main` подключается к MongoDB, получает базу и передаёт её каждому модулю маршрутов вместе с `app` (а некоторым — ещё и `ObjectID`), после чего запускает HTTP-сервер.

Подход правильный: **сначала подключение к базе, потом маршруты и сервер** — именно так рекомендуется ([9_1, пример 2](9_1-mongodb-node-primery.md#ex-2)), и это лучше, чем в 9_2. Но сервер не запустится вовсе: переменная `dbName` нигде не объявлена (`ReferenceError`), а в модули передаётся `ObjectID`, хотя импортирован `ObjectId` (ещё один `ReferenceError`; к тому же `ObjectID` в драйвере больше не существует). У `main()` нет обработки ошибок, `cors` — случайная глобальная переменная, `body-parser` не нужен. ⚠ [П-2](9_3-crud-example-popravki.md#p-2)

---

<a id="s3"></a>

## 3. Маршруты сервера

Все маршруты материала написаны одинаково: каждый модуль экспортирует функцию `(db, app)`, которая регистрирует обработчик, а операции драйвера вызываются **с колбэками**. Это главная проблема всего примера: поддержку колбэков убрали из драйвера в версии 5.0, и переданная функция просто не вызывается (проверено с драйвером 7.6). Каждый маршрут, который отвечает клиенту внутри колбэка, **не ответит никогда** — запрос будет висеть до таймаута браузера. ⚠ [П-3](9_3-crud-example-popravki.md#p-3)

Разберём маршруты по очереди, а потом соберём рабочие.

<a id="s3-1"></a>

### 3.1 Добавление

```js
module.exports = function(db,app){
  //Route to manage adding a product
  app.post('/api/add',function(req,res){

    if (!req.body) {
      return res.sendStatus(400)
    }
    product = req.body;
    const collection = db.collection('products');
    //check for duplicate id's
    collection.find({'id':product.id}).count((err,count)=>{
      if (count== 0){
        //if no duplicate
        collection.insertOne(product,(err,dbres)=>{
          if (err) throw err;
          let num = dbres.insertedCount;
          //send back to client number of items instered and no error message
          res.send({'num':num,err:null});
        })
      }else{
        //On Error send back error message
        res.send({num:0,err:"duplicate item"});
      }
    });
  });
}
```

**Что в нём происходит.** Маршрут берёт товар из тела, считает товары с таким же `id` и, если их нет, вставляет товар и отправляет клиенту количество вставленных; иначе отвечает сообщением о дубликате.

Кроме колбэков здесь три проблемы. ⚠ [П-4](9_3-crud-example-popravki.md#p-4)

- **Гонка:** «посчитать, потом вставить» — два запроса. Если два пользователя одновременно добавят товар с одним `id`, оба увидят `0` и оба вставят. Защита от дубликатов должна быть в базе — **уникальный индекс** по `id`, а маршрут ловит ошибку `11000`.
- **`insertOne` не возвращает `insertedCount`** — только `insertedId`. `num` будет `undefined`, и на клиенте появится сообщение «undefined new product (...) was added».
- `find().count()` устарел — есть `countDocuments`; `product` — случайная глобальная переменная; ошибка дубликата отправляется со статусом `200`, хотя по смыслу это `409`.

<a id="s3-2"></a>

### 3.2 Список

```js
module.exports = function(db,app){
  //Route to get list of all items from the database.
  app.get('/api/getlist',function(req,res){
    const collection = db.collection('products');
    collection.find({}).toArray((err,data)=>{
      res.send(data);
    })
  })
}
```

**Что в нём происходит.** Пустой фильтр `{}` находит все товары, `toArray` превращает курсор в массив, массив уходит клиенту. Идея верная — это ровно то, что нужно. Но колбэк `toArray` не будет вызван ([П-3](9_3-crud-example-popravki.md#p-3)); правильно — `await collection.find({}).toArray()`.

<a id="s3-3"></a>

### 3.3 Обновление и удаление

```js
module.exports = function(db,app,ObjectID){
  //Route to delete a single item
  var result;
  app.post('/api/update',function(req,res){
    if (!req.body) {
      return res.sendStatus(400)
    }
    product = req.body;
    var objectid = new ObjectID(product.objid);
    const collection = db.collection('products');
    collection.updateOne({_id:objectid},{$set:{name:product.name,description:product.description,price:product.price,units:product.units}},()=>{
      //Return a response to the client to let them know the delete was successful
      res.send({'ok':product.objid});
    })
  });
}
```

```js
module.exports = function(db,app,ObjectID){
  //Route to delete a single item
  app.post('/api/deleteitem',function(req,res){
    if (!req.body) {
      return res.sendStatus(400);
    }
    productID = req.body.productid;
    //create a new mongo Object ID from the passed in _id
    var objectid = new ObjectID(productID);
    const collection = db.collection('products');
    //Delete a single item based on its unique ID.
    collection.deleteOne({_id:objectid},(err,docs)=>{
      //get a new listing of all items in the database and return to client.
      collection.find({}).toArray((err,data)=>{
        res.send(data);
      });
    });
  })
}
```

**Что в нём происходит.** Обновление превращает строку `objid` из тела в `ObjectId` и меняет четыре поля документа с этим `_id` — правильно, что сервер сам перечисляет, какие поля менять, и что `id` товара не меняется. Удаление находит документ по `_id`, удаляет его и отправляет клиенту заново загруженный список.

Выбор полей верный. Помимо колбэков: неверная строка `_id` ломает `new ObjectID(...)` исключением — нужна проверка и ответ `400`; ответ «успешно» отправляется, даже если документ не найден — нужен `matchedCount` / `deletedCount` и `404`. Комментарии в коде обновления говорят про удаление. ⚠ [П-7](9_3-crud-example-popravki.md#p-7)

<a id="s3-4"></a>

### 3.4 Счётчик и проверка id

```js
module.exports = function(db,app){
  //Route to manage getting the number of products
  app.get('/api/prodcount',function(req,res){
    if (!req.body) {
      return res.sendStatus(400)
    }
    const collection = db.collection('products');
    collection.find({}).count((err,count)=>{
      res.send({'count':count});
    });
  });
}
```

```js
module.exports = function(db,app){
  //Route to manage adding a product
  app.post('/api/checkvalidid',function(req,res){
    if (!req.body) {
      return res.sendStatus(400)
    }
    product = req.body;
    const collection = db.collection('products');
    //check for duplicate id's
    collection.find({'id':product.id}).count((err,count)=>{
      if (count== 0){
        res.send({success:1,topnum:0});
      }else{
        //On Error send back highest used number.
        collection.find({}, {sort: {id: -1}, limit: 1}).toArray(function(err, items){
          res.send({success:0,topnum:items[0].id});
        });
      }
    });
  });
}
```

**Что в нём происходит.** Счётчик считает все товары. Проверка `id` считает товары с этим номером; если он свободен — `success: 1`, если занят — находит самый большой номер (сортировка по убыванию и `limit: 1`) и отправляет его как подсказку.

Приём «отсортировать по убыванию и взять один» для максимума — правильный ([8_2 §7.2](../week8/8_2-mongodb-konspekt.md#s7-2)). Но у маршрута счётчика есть ошибка, которую легко не заметить: это `GET`, а у `GET` нет тела. В Express 5 `req.body` в таком запросе — `undefined`, поэтому проверка `if (!req.body)` **всегда** отвечает `400`, и главная страница никогда не покажет количество. Проверено: Express 5.2, `GET /api/prodcount` → `400`. ⚠ [П-5](9_3-crud-example-popravki.md#p-5)

У проверки `id` подсказка — это **занятый** максимум, а не следующий свободный номер, и клиент вызывает её на каждое нажатие клавиши. ⚠ [П-6](9_3-crud-example-popravki.md#p-6)

<a id="s3-5"></a>

### 3.5 Исправленные маршруты

Вот все семь маршрутов в одном роутере — на `async`/`await`, с уникальным индексом, проверкой данных и правильными кодами:

```js
// ═════ server/routes/products.js ═════
const express = require('express');
const { ObjectId, MongoServerError } = require('mongodb');
const { getDb } = require('../db');                          // одно подключение (9_1, пример 2)

const router = express.Router();
const col = () => getDb().collection('products');
const toObjectId = (s) => (ObjectId.isValid(s) ? new ObjectId(s) : null);

// Сервер сам собирает и проверяет поля (id задаётся только при создании)
function readFields(body) {
  const { name, description = '', price, units } = body ?? {};
  if (typeof name !== 'string' || !name.trim()) return null;
  if (typeof price !== 'number' || price < 0) return null;
  if (!Number.isInteger(units) || units < 0) return null;
  return { name: name.trim(), description: String(description), price, units };
}

// Специальные адреса — ДО '/:id', иначе 'count' примут за идентификатор
router.get('/count', async (req, res) => {                  // было GET /api/prodcount
  res.json({ count: await col().countDocuments({}) });
});

router.get('/check-id/:id', async (req, res) => {           // было POST /api/checkvalidid
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'id must be a positive integer' });
  const taken = (await col().countDocuments({ id }, { limit: 1 })) > 0;
  const [top] = await col().find({}, { sort: { id: -1 }, limit: 1, projection: { id: 1 } }).toArray();
  res.json({ available: !taken, nextId: (top?.id ?? 0) + 1 });   // подсказка — следующий свободный
});

router.get('/', async (req, res) => {                       // было GET /api/getlist
  res.json(await col().find({}).sort({ id: 1 }).toArray());
});

router.get('/:id', async (req, res) => {                    // было POST /api/getitem
  const _id = toObjectId(req.params.id);
  const product = _id && (await col().findOne({ _id }));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

router.post('/', async (req, res) => {                      // было POST /api/add
  const id = req.body?.id;
  const fields = readFields(req.body);
  if (!Number.isInteger(id) || id < 1 || !fields) {
    return res.status(400).json({ error: 'id, name, price and units are required' });
  }
  try {
    const { insertedId } = await col().insertOne({ id, ...fields });
    res.status(201).json({ _id: insertedId, id, ...fields });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {   // уникальный индекс по id
      return res.status(409).json({ error: `Product ${id} already exists` });
    }
    throw err;
  }
});

router.put('/:id', async (req, res) => {                    // было POST /api/update
  const _id = toObjectId(req.params.id);
  const fields = readFields(req.body);
  if (!_id || !fields) return res.status(400).json({ error: 'Invalid id or product data' });
  const updated = await col().findOneAndUpdate({ _id }, { $set: fields }, { returnDocument: 'after' });
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {                 // было POST /api/deleteitem
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ error: 'Invalid id' });
  const { deletedCount } = await col().deleteOne({ _id });
  if (deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
  res.status(204).end();                                     // список клиент обновит сам
});

module.exports = router;

// ═════ server/server.js ═════
// const { connect, getDb } = require('./db');
// app.use(express.json());
// app.use('/api/products', require('./routes/products'));
// connect()
//   .then(() => getDb().collection('products').createIndex({ id: 1 }, { unique: true }))
//   .then(() => app.listen(3000));
```

**Какая последовательность?** (добавление товара с занятым `id`)

1. **Сервер при старте** подключается к базе и создаёт уникальный индекс по `id` (если он уже есть, ничего не меняется).
2. **Клиент отправляет `POST /api/products`** с товаром.
3. **Маршрут проверяет поля:** `id` — целое больше нуля, `name` — непустая строка, `price` и `units` — неотрицательные числа. Неверно — `400`.
4. **`insertOne`** пытается вставить документ; уникальный индекс не даёт второй документ с тем же `id`.
5. **Драйвер бросает `MongoServerError` с `code: 11000`** — маршрут отвечает `409` с понятным сообщением.
6. **Если `id` свободен** — `201` с товаром и его новым `_id`.

---

<a id="s4"></a>

## 4. Клиент: сервис

Все HTTP-запросы клиента — в сервисе `ProductdataService`. Вот он в материале:

```ts
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Products} from '../products';

@Injectable({
  providedIn: 'root'
})
export class ProductdataService {

  constructor(private http:HttpClient) {}
  add(product:Products){
    return this.http.post<any>('http://localhost:3000/api/add', product );
  }
  getlist(){
    return this.http.get<any>('http://localhost:3000/api/getlist');
  }
  getitem(productID){
    return this.http.post<any>('http://localhost:3000/api/getitem', {'productid':productID} );
  }
  updateitem(product:Products){
    return this.http.post<any>('http://localhost:3000/api/update', product );
  }
  deleteitem(productID){
    return this.http.post<any>('http://localhost:3000/api/deleteitem', {'productid':productID} );
  }
  checkvalidid(productID){
    return this.http.post<any>('http://localhost:3000/api/checkvalidid', {'id':productID} );
  }
  getproductcount(){
    return this.http.get<any>('http://localhost:3000/api/prodcount');
  }
}
```

**Что в нём происходит.** Каждый метод отправляет запрос на свой маршрут и **возвращает** Observable — компонент подписывается сам. Это правильный подход, лучше, чем в 9_2.

Слабые места: `post<any>` отключает проверку типов ответа, параметры `productID` без типа не компилируются в строгом режиме, а полный адрес `http://localhost:3000` повторяется семь раз. ⚠ [П-8](9_3-crud-example-popravki.md#p-8)

Исправленная версия под маршруты из [§3.5](#s3-5):

```ts
// src/app/services/productdata.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;
  id: number;
  name: string;
  description: string;
  price: number;
  units: number;
}
export type ProductInput = Omit<Product, '_id'>;

@Injectable({ providedIn: 'root' })
export class ProductdataService {
  private http = inject(HttpClient);
  private readonly api = '/api/products';                    // один адрес; прокси ng serve (5_3)

  list(): Observable<Product[]>                  { return this.http.get<Product[]>(this.api); }
  get(_id: string): Observable<Product>          { return this.http.get<Product>(`${this.api}/${_id}`); }
  add(p: ProductInput): Observable<Product>      { return this.http.post<Product>(this.api, p); }
  update(_id: string, p: ProductInput)           { return this.http.put<Product>(`${this.api}/${_id}`, p); }
  remove(_id: string): Observable<void>          { return this.http.delete<void>(`${this.api}/${_id}`); }
  count(): Observable<{ count: number }>         { return this.http.get<{ count: number }>(`${this.api}/count`); }
  checkId(id: number): Observable<{ available: boolean; nextId: number }> {
    return this.http.get<{ available: boolean; nextId: number }>(`${this.api}/check-id/${id}`);
  }
}
```

---

<a id="s5"></a>

## 5. Клиент: список товаров

При открытии список запрашивает товары и выводит их таблицей; у каждой строки ссылка «Edit» на `/update/<_id>` и кнопка «Delete». Вот компонент из материала:

```ts
export class ListProductsComponent implements OnInit {
  products: Products[] = [];
  constructor(private proddata:ProductdataService,private router:Router) {}
  ngOnInit() {
    this.proddata.getlist().subscribe((data)=>{
      this.products = data;
    })
  }

  deleteproduct(id){
    if (confirm("Are you sure you want to delete this item")){
      this.proddata.deleteitem(id).subscribe((data)=>{
        this.products = data;
      });
    }
  }
}
```

```html
<tr style="padding-top:20px;" *ngFor="let product of products">
  <td>{{product.id}}</td>
  <td>{{product.name}}</td>
  <td>{{product.description}}</td>
  <td>{{product.price}}</td>
  <td>{{product.units}}</td>
  <td><span class="btn btn-primary" [routerLink]="['/update',product._id]"><i class="fa fa-edit"></i> Edit</span>
      &nbsp;<span class="btn btn-primary" (click)="deleteproduct(product._id)"><i class="fa fa-trash"></i> Delete</span></td>
</tr>
```

**Что в нём происходит.** Компонент загружает список при открытии. Ссылка «Edit» передаёт `_id` в адресе — это правильно ([9_2 §5](9_2-mongodb-angular-konspekt.md#s5)). Удаление спрашивает подтверждение и заменяет список тем, что вернул сервер.

Логика верная; исправить стоит мелочи: `deleteproduct(id)` без типа параметра, `*ngFor` — старый синтаксис, кнопки сделаны `<span>` (с клавиатуры не нажать), а если удаление вернёт ошибку, пользователь ничего не узнает. С исправленным сервером (`204` без тела) строку убирают из списка сами:

```ts
protected remove(p: Product): void {
  if (!confirm(`Удалить «${p.name}»?`)) return;
  this.proddata.remove(p._id).subscribe({
    next: () => this.products.update((list) => list.filter((x) => x._id !== p._id)),
    error: () => this.error.set('Не удалось удалить'),
  });
}
```

---

<a id="s6"></a>

## 6. Клиент: форма добавления и анимации

Форма добавления связывает поля с классом через `[(ngModel)]`. При изменении `id` сразу вызывается проверка на сервере; если номер занят, под полем плавно появляется предупреждение с подсказкой. После успешного добавления внизу появляется сообщение, а поля очищаются. Вот фрагменты из материала:

```html
<form (submit)="addnewProduct($event)">
  <div class="form-group">
    <label for="productid">Product ID</label>
    <input type="number" class="form-control" id="productid" [(ngModel)]="productid"
           (ngModelChange)="checkvalidid($event)" name="productid" placeholder="ID">
    <div [@iderrorState]="stateName" class="alert alert-warning" id="iderrormsg" role="alert">
      {{iderrormsg}} {{iderrormsg2}}</div>
  </div>
  <!-- поля name, description, price, units — так же через [(ngModel)] -->
  <button type="submit" class="btn btn-primary"><i class="fa fa-plus-square"></i> Add New</button>
  <div [@noticeState]="noticeName" class="alert alert-warning" role="alert">{{newProductMessage}}</div>
</form>
```

```ts
import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
  animations: [
    trigger('iderrorState', [
      state('show', style({ opacity: 1, display: 'block' })),
      state('hide', style({ opacity: 0, display: 'none' })),
      transition('show => hide', animate('1000ms ease-out')),
      transition('hide => show', animate('400ms ease-in')),
    ]),
    // trigger('noticeState', [...]) — такой же
  ],
})
export class AddProductComponent implements OnInit {
  productname: string = "";
  productprice: number = null;
  productunits: number = null;
  productid: number = null;
  newprod: Products;
  newProductMessage = "";
  iderrorshow: boolean = false;
  noticeshow: boolean = false;
  ...
  get stateName() { return this.iderrorshow ? 'show' : 'hide'; }

  addnewProduct(event) {
    event.preventDefault();
    if (this.productid == null) {
      this.iderrorshow = !this.iderrorshow;
    } else {
      this.newprod = new Products("", this.productid, this.productname, this.productdesc, this.productprice, this.productunits);
      this.proddata.add(this.newprod).subscribe((data) => {
        this.noticeshow = true;
        if (data.err == null) {
          this.newProductMessage = data.num + " new product (" + this.productname + ") was added";
        } else {
          this.newProductMessage = data.err;
        }
        this.productid = null;
        this.productname = "";
        ...
      });
    }
  }

  checkvalidid(event) {
    this.noticeshow = false;
    this.proddata.checkvalidid(event).subscribe((data) => {
      if (data.success == 0) {
        this.iderrormsg2 = " Something above " + data.topnum;
        this.iderrorshow = !this.iderrorshow;
      } else {
        this.iderrorshow = false;
        this.iderrormsg2 = null;
      }
    });
  }
}
```

**Что в нём происходит.** Два «триггера» анимации описывают состояния `show` и `hide` и переходы между ними с длительностью. Геттеры `stateName` и `noticeName` выбирают состояние по флагам. `addnewProduct` отменяет стандартную отправку формы, собирает объект товара, отправляет его и по ответу показывает сообщение и очищает поля. `checkvalidid` вызывается при каждом изменении поля `id`.

Идея с мгновенной проверкой и плавными сообщениями — хорошая для удобства. Но код устарел и местами неверен:

- **Анимации.** Пакет `@angular/animations` объявлен устаревшим в Angular 20.2 (удаление планируется в v23). Для появления и исчезновения элементов теперь используют `animate.enter` / `animate.leave` и обычный CSS — без пакета, триггеров и `provideAnimations`. ⚠ [П-9](9_3-crud-example-popravki.md#p-9)
- **Запрос на каждое нажатие клавиши.** `(ngModelChange)="checkvalidid($event)"` отправляет запрос при каждом изменении поля: ввод «123» — три запроса, и ответы могут прийти не по порядку. Нужны пауза перед запросом и отмена прежнего. ⚠ [П-6](9_3-crud-example-popravki.md#p-6)
- **Строгий режим:** `productprice: number = null` — ошибка `TS2322`, `newprod: Products` без начального значения — `TS2564`. Кроме того, `iderrorshow = !this.iderrorshow` **переключает** предупреждение: при повторной ошибке оно исчезнет. `data.num` из-за [П-4](9_3-crud-example-popravki.md#p-4) — `undefined`. `ComponentFactoryResolver` импортирован, но не используется (и устарел).
- **Отправка формы:** `(submit)` + `event.preventDefault()`; с `FormsModule` используют `(ngSubmit)`.

Вот исправленная форма — с паузой перед проверкой `id` и анимацией через `animate.enter`/`animate.leave`:

```ts
// src/app/add-product/add-product.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { ProductInput, ProductdataService } from '../services/productdata.service';

@Component({
  selector: 'app-add-product',
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="add()">
      <label>Product ID
        <input type="number" name="id" [(ngModel)]="form.id" (ngModelChange)="id$.next($event)" required>
      </label>
      @if (idHint()) {
        <div class="alert alert-warning" animate.enter="fade-in" animate.leave="fade-out">{{ idHint() }}</div>
      }
      <label>Name <input name="name" [(ngModel)]="form.name" required></label>
      <label>Description <textarea name="description" [(ngModel)]="form.description"></textarea></label>
      <label>Price <input type="number" name="price" min="0" [(ngModel)]="form.price" required></label>
      <label>Units <input type="number" name="units" min="0" [(ngModel)]="form.units" required></label>
      <button type="submit" class="btn btn-primary">Add New</button>
      @if (notice()) {
        <div class="alert alert-info" animate.enter="fade-in" animate.leave="fade-out">{{ notice() }}</div>
      }
    </form>
  `,
  styles: `
    .fade-in  { animation: fade 400ms ease-in; }
    .fade-out { animation: fade 1000ms ease-out reverse; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  `,
})
export class AddProductComponent {
  private proddata = inject(ProductdataService);
  private readonly empty: ProductInput = { id: 0, name: '', description: '', price: 0, units: 0 };

  protected form: ProductInput = { ...this.empty };
  protected id$ = new Subject<number>();
  protected idHint = signal('');                   // пустая строка — предупреждения нет
  protected notice = signal('');

  constructor() {
    this.id$.pipe(
      filter((id) => Number.isInteger(id) && id > 0),
      debounceTime(400),                           // ждать паузу в наборе
      distinctUntilChanged(),
      switchMap((id) => this.proddata.checkId(id)),   // новый ввод отменяет прежний запрос
      takeUntilDestroyed(),
    ).subscribe(({ available, nextId }) =>
      this.idHint.set(available ? '' : `Этот ID занят. Свободный: ${nextId}`),
    );
  }

  protected add(): void {
    this.proddata.add({ ...this.form, name: this.form.name.trim() }).subscribe({
      next: (p) => {
        this.notice.set(`Товар «${p.name}» добавлен`);
        this.form = { ...this.empty };            // очистить поля
        this.idHint.set('');
      },
      error: (err: HttpErrorResponse) =>
        this.notice.set(err.status === 409 || err.status === 400 ? err.error.error : 'Не удалось добавить'),
    });
  }
}
```

**Какая последовательность?**

1. **Пользователь вводит ID** — каждое изменение уходит в `id$`.
   1. `filter` пропускает только положительные целые.
   2. `debounceTime(400)` ждёт паузу; пока пользователь печатает, запросов нет.
   3. `switchMap` отправляет `GET /api/products/check-id/<id>`; если ввод продолжится, прежний запрос отменится.
2. **Ответ сервера.**
   1. ID свободен — `idHint` пустой, блок предупреждения убирается с анимацией `fade-out`.
   2. ID занят — `idHint` получает текст с подсказкой `nextId`, блок появляется с анимацией `fade-in`.
3. **Отправка формы** — `ngSubmit` вызывает `add()`, уходит `POST /api/products`.
4. **Результат.**
   1. `201` — сообщение об успехе, поля очищаются.
   2. `409` или `400` — текст ошибки сервера в том же блоке сообщений.
5. **Анимации:** Angular добавляет класс из `animate.enter`, когда блок появляется в `@if`, и класс из `animate.leave` перед удалением, дожидаясь конца анимации.

---

<a id="s7"></a>

## 7. Ключевые факты

**Архитектура примера**

- Товар: `id` (номер для пользователя) и `_id` (идентификатор документа), `name`, `description`, `price`, `units`.
- Сначала подключение к базе, потом маршруты и `listen` — правильный порядок.
- Маршруты в модулях — хорошо; REST-адреса и методы вместо глаголов в пути и `POST` для всего; специальные адреса (`count`, `check-id`) — раньше `/:id`.

**Сервер**

- Колбэки в драйвере 5+ не вызываются: маршруты материала не отвечают никогда — только `async`/`await`.
- `dbName` и `ObjectID` в `server.js` — `ReferenceError`; экспорт драйвера — `ObjectId`.
- Уникальность `id` — уникальный индекс и ошибка `11000` → `409`; «посчитать, потом вставить» — гонка.
- `insertOne` возвращает `insertedId`, а не `insertedCount`; подсчёт — `countDocuments`.
- В Express 5 у `GET` без тела `req.body` — `undefined`; проверка `if (!req.body)` в `GET` всегда даёт `400`.
- Неверный `_id` — `400`; `matchedCount`/`deletedCount === 0` — `404`.

**Клиент**

- Сервис возвращает Observable с типами; один базовый адрес `/api/products`.
- `_id` передают в адресе (`/update/:id`); кнопки — `<button>`, ошибки показывают пользователю.
- Проверка при вводе — `debounceTime` + `switchMap`, а не запрос на каждую клавишу.
- `@angular/animations` устарел с Angular 20.2; появление и исчезновение — `animate.enter` / `animate.leave` и CSS.
- Строгий режим: числа не инициализируют `null`; поля класса — с начальным значением.

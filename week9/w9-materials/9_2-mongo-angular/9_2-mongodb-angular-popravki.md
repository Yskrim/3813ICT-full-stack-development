# 9_2 — MongoDB, Node.js и Angular: поправки

**Курс:** 3813ICT, неделя 9
**Источник:** `9_2_-_MongoDB_with_Node_and_Angular_24.pdf` (12 слайдов)
**Связанные файлы:** [конспект](9_2-mongodb-angular-konspekt.md) · [примеры](9_2-mongodb-angular-primery.md) · [вопросы](9_2-mongodb-angular-voprosy.md) · [ответы](9_2-mongodb-angular-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: код со скриншотов переписан дословно. Фрагменты Angular-классов скомпилированы TypeScript 5.9 в строгом режиме — сообщения об ошибках ниже реальные. Серверная часть сверена с драйвером `mongodb` 7.6 и Express 5.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Подключение и закрытие в каждом маршруте | 🔴 | Один запрос закрывает клиента посреди другого; сервер стартует без проверки базы |
| [П-2](#p-2) | Самоподписанный HTTPS | 🟡 | Браузер не доверяет сертификату; клиент ходит по `http://` |
| [П-3](#p-3) | Маршруты и `body-parser` | 🔵 | Глаголы в адресах, `POST` для изменения и удаления; `express.json()` |
| [П-4](#p-4) | Фильтр и изменения от клиента | 🔴 | `updateMany`/`deleteMany` с данными из тела — можно изменить или удалить всё |
| [П-5](#p-5) | `app.module.ts` и `HttpClientModule` | 🔵 | Standalone: `provideHttpClient()`, `provideRouter`, `imports` компонентов |
| [П-6](#p-6) | Сервис не совпадает с сервером | 🔴 | `PUT`/`DELETE` против `POST`; тело в `http.delete` не уходит; подписка в сервисе |
| [П-7](#p-7) | Компонент списка | 🔴 | TS2564, TS2790; `delete product._id` портит строку; список не обновляется |
| [П-8](#p-8) | Редактирование через localStorage | 🔴 | TS2345; обновление по всем полям старой версии вместо `_id` |

---

<a id="p-1"></a>

## П-1. Подключение и закрытие в каждом маршруте 🔴

### Как в материале

Слайды 2–4: сервер создаёт один `MongoClient`; если соединение с базой есть, Express начинает слушать порт 3000. Каждая функция модуля операций вызывает `await client.connect()`, выполняет операцию, отвечает клиенту и вызывает `client.close()`.

### Пример из материала

```js
exports.find = async function(req, res, client) {
    await client.connect();
    let db = client.db("dbName22"),
        myCol = db.collection("colName");
    const docs = await myCol.find({}).toArray();
    res.send(docs);
    client.close();
};
```

### В чём несоответствие

1. **Общий клиент закрывается посреди чужих запросов.** Все маршруты используют один объект `client`. Когда один запрос доходит до `client.close()`, второй, который в это время ещё выполняется, получает ошибку закрытого клиента. Под нагрузкой ошибки становятся случайными и трудно воспроизводимыми.
2. **Подключение на каждый запрос** медленное: `MongoClient` рассчитан на то, чтобы держать пул соединений всё время работы приложения.
3. **Текст расходится с кодом:** сервер начинает слушать порт, не проверив, доступна ли база.
4. **`result` в `update` не объявлена**, а `await` перед синхронными `client.db()` и `db.collection()` не нужен.

### Как правильно

Подключиться один раз при старте, запустить `listen` после подключения, закрывать клиента при остановке сервера.

### Пример

```js
// db.js — один клиент на весь сервер (подробно — 9_1, пример 2)
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
let db;
exports.connect = async () => { await client.connect(); db = client.db('dbName22'); };
exports.getDb = () => db;

// server.js
connect().then(() => app.listen(3000));     // сначала база, потом HTTP

// маршрут
router.get('/', async (req, res) => {
  res.json(await getDb().collection('products').find({}).toArray());   // без connect/close
});
```

**Источник:** [MongoDB Node.js Driver — Connection Pools](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/connection-pools/) · [MongoDB Node.js Driver — Connection Guide](https://www.mongodb.com/docs/drivers/node/current/connect/)

---

<a id="p-2"></a>

## П-2. Самоподписанный HTTPS 🟡

### Как в материале

Слайд 3: сервер запускается через `https.createServer` с ключом и сертификатом, которые предлагается сгенерировать `openssl` в терминале среды ELF; сервер слушает порт 3000.

### Пример из материала

```js
const https = require('https'),
    fs = require('fs'),
    options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    },
    PORT = 3000,
    httpsServer = https.createServer(options, app);
```

### В чём несоответствие

HTTPS в продакшене обязателен, и в среде ELF он может быть требованием курса. Но для локальной разработки у этого варианта два подвоха:

1. **Браузер не доверяет самоподписанному сертификату.** Запросы из Angular будут отклоняться, пока сертификат не принят вручную (открыть `https://localhost:3000` и подтвердить исключение).
2. **Протокол не совпадает с клиентом.** Сервис Angular в том же материале обращается к `http://localhost:3000/` — к HTTPS-серверу такой запрос не дойдёт.

### Как правильно

Локально — HTTP (или прокси `ng serve`, [5_3 §2.5](../week5/5_3-node-hosting-konspekt.md#s2-5)); если нужен HTTPS — один и тот же протокол на сервере и в клиенте и принятый браузером сертификат.

### Пример

```js
// Локальная разработка
app.listen(3000);                                   // http://localhost:3000

// Если HTTPS обязателен (например, в ELF):
// https.createServer({ key, cert }, app).listen(3000);
// и в Angular: private readonly url = 'https://localhost:3000/api/products';
// (сначала открыть https://localhost:3000 и принять сертификат в браузере)
```

**Источник:** [Node.js — https.createServer()](https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener) · [MDN — Mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)

---

<a id="p-3"></a>

## П-3. Маршруты и `body-parser` 🔵

### Как в материале

Слайды 2–3: зависимости сервера — Express, MongoDB, Body-Parser, Cors. Маршруты: `POST /productInsert`, `GET /productFind`, `POST /productUpdate`, `POST /productDelete`.

### Пример из материала

```js
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.post('/productUpdate', (req, res) => { products.update(req, res, client) });
app.post('/productDelete', (req, res) => {products.delete(req, res, client) });
```

### В чём несоответствие

1. **`body-parser`** не нужен: с Express 4.16 есть встроенные `express.json()` и `express.urlencoded()` ([5_3 П-5](../week5/5_3-node-hosting-popravki.md#p-5)).
2. **Не REST.** Действие закодировано глаголом в адресе, а изменение и удаление идут через `POST`. В REST адрес называет ресурс (`/api/products/:id`), а действие задаёт метод: `GET`, `POST`, `PUT`/`PATCH`, `DELETE` ([5_4 §7](../week5/5_4-http-requests-konspekt.md#s7)). Идентификатор — в адресе, а не в теле.
3. **Нет префикса `/api`** — его ждёт прокси `ng serve` и fallback для single origin ([5_3](../week5/5_3-node-hosting-konspekt.md#s3-3)).
4. `cors = require('cors')` без объявления — глобальная переменная; `cors()` без настроек разрешает всем origin.

### Как правильно

`express.json()`; маршруты `/api/products` и `/api/products/:id` с методами по смыслу.

### Пример

```js
app.use(express.json());
app.use('/api/products', router);

router.get('/', list);            // GET    /api/products
router.get('/:id', getOne);       // GET    /api/products/:id
router.post('/', create);         // POST   /api/products
router.put('/:id', update);       // PUT    /api/products/:id
router.delete('/:id', remove);    // DELETE /api/products/:id
```

**Источник:** [Express — express.json()](https://expressjs.com/en/api.html#express.json) · [Express — Routing](https://expressjs.com/en/guide/routing.html) · [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)

---

<a id="p-4"></a>

## П-4. Фильтр и изменения от клиента 🔴

### Как в материале

Слайд 4: функция `update` берёт из тела запроса `query` и `update` и выполняет `updateMany(queryJSON, { $set: updateJSON })`; функция `delete` берёт всё тело как фильтр, превращает `_id` в `ObjectId` и выполняет `deleteMany`; функция `insert` вставляет тело запроса как есть.

### Пример из материала

```js
let queryJSON = req.body.query;
let updateJSON = req.body.update;
result = await db.collection("colName").updateMany(queryJSON, {
    $set: updateJSON
});
...
let queryJSON = req.body;
queryJSON._id = new ObjectId(queryJSON._id);
let result = await myCol.deleteMany(queryJSON);
```

### В чём несоответствие

Сервер выполняет то, что прислал клиент, **без проверки**. Запрос к API может отправить кто угодно (Postman, curl, консоль браузера), поэтому:

1. **`updateMany` с фильтром от клиента** — отправив `{ "query": {}, "update": { "price": 0 } }`, можно обнулить цену **всем** товарам. Через `$set` можно записать любые поля, в том числе служебные.
2. **`deleteMany` с телом запроса** — фильтр целиком от клиента. `new ObjectId(undefined)` создаёт **новый** случайный `_id`, так что пустое тело ничего не удалит, но любое другое поле в теле (`{ "company": "X" }` вместе с существующим `_id` или без него) управляет тем, что удалится. А если `_id` — неверная строка, `new ObjectId(...)` бросит исключение.
3. **`insertOne(req.body)`** — в базу попадёт всё, что прислали: лишние поля, неверные типы, чужой `_id`.
4. `deleteMany` там, где удаляется один товар, — лишний риск; для одного документа — `deleteOne`.

### Как правильно

Сервер сам строит фильтр (только по `_id` из адреса) и документ (только разрешённые, проверенные поля).

### Пример

```js
function readProduct(body) {
  const { name, price, company } = body ?? {};
  if (typeof name !== 'string' || !name.trim() || typeof price !== 'number' || price < 0) return null;
  return { name: name.trim(), price, company: typeof company === 'string' ? company : '' };
}

router.put('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const product = readProduct(req.body);
  if (!product) return res.status(400).json({ error: 'Invalid product' });
  const updated = await col().findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },           // фильтр — сервера
    { $set: product },                              // только проверенные поля
    { returnDocument: 'after' },
  );
  if (!updated) return res.status(404).json({ error: 'Product not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const { deletedCount } = await col().deleteOne({ _id: new ObjectId(req.params.id) });
  res.status(deletedCount ? 204 : 404).end();
});
```

**Источник:** [OWASP — Injection Prevention (NoSQL)](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html) · [MongoDB Node.js Driver — Delete Documents](https://www.mongodb.com/docs/drivers/node/current/crud/delete/) · [MongoDB Node.js Driver — Update Documents](https://www.mongodb.com/docs/drivers/node/current/crud/update/modify/)

---

<a id="p-5"></a>

## П-5. `app.module.ts` и `HttpClientModule` 🔵

### Как в материале

Слайд 5: проект из трёх компонентов (`prod-add`, `prod-edit`, `prod-get`) и сервиса; в `app.module.ts` компоненты объявлены в `declarations`, а `HttpClientModule`, `BrowserModule`, `AppRoutingModule` и `FormsModule` — в `imports`.

### Пример из материала

```ts
@NgModule({
  declarations: [AppComponent, ProdAddComponent, ProdGetComponent, ProdEditComponent],
  imports: [HttpClientModule, BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### В чём несоответствие

Это структура приложений на NgModule. Новые проекты Angular (с версии 19 по умолчанию) — standalone: файла `app.module.ts` нет, `HttpClientModule` устарел с версии 18, маршруты подключаются через `provideRouter`, а директивы и модули — в `imports` тех компонентов, где используются ([5_4 П-1](../week5/5_4-http-requests-popravki.md#p-1)).

### Как правильно

`app.config.ts` с провайдерами; `imports` в компонентах.

### Пример

```ts
// src/app/app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()],
};

// src/app/app.component.ts
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],   // для <router-outlet>, routerLink, routerLinkActive
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

**Источник:** [Angular — Setting up HttpClient](https://angular.dev/guide/http/setup) · [Angular — Define routes](https://angular.dev/guide/routing/define-routes) · [Angular — Importing and using components](https://angular.dev/guide/components/importing)

---

<a id="p-6"></a>

## П-6. Сервис не совпадает с сервером 🔴

### Как в материале

Слайд 7: `ProdService` с адресом `http://localhost:3000/`; `productInsert` отправляет `POST` и сам подписывается; `productFind` возвращает `GET`; `productUpdate` отправляет `PUT` с `{query, update}`; `productDelete` вызывает `http.delete(url, prod)` и сам подписывается. В комментариях сказано, что методы возвращают promise.

### Пример из материала

```ts
url = 'http://localhost:3000/';
productUpdate(prodQuery, prodUpdate){
  const queryUpdate = {query: prodQuery, update: prodUpdate};
  return this.http.put(this.url + 'productUpdate', queryUpdate);
}
productDelete(prod) {
  this.http.delete(this.url + 'productDelete', prod)
    .subscribe(res => console.log('Done'));
}
```

### В чём несоответствие

1. **Методы не совпадают с сервером** из того же материала: сервер объявил `app.post('/productUpdate')` и `app.post('/productDelete')`, а сервис отправляет `PUT` и `DELETE`. Express ответит `404` — обновление и удаление не работают.
2. **`http.delete(url, prod)` — второй аргумент это опции** (заголовки, параметры), а не тело. `prod` на сервер не уйдёт; параметр без типа (`any`) скрывает ошибку от компилятора.
3. **Протокол:** сервер — HTTPS ([П-2](#p-2)), сервис — `http://`.
4. **Подписка внутри сервиса** в `productInsert` и `productDelete`: компонент не получает Observable и не может узнать, когда операция закончилась, обработать ошибку или обновить список ([5_4 П-4](../week5/5_4-http-requests-popravki.md#p-4)).
5. **Комментарии «returning a promise»** — методы возвращают Observable. Параметры без типов не компилируются в строгом режиме (`TS7006`).

### Как правильно

Сервис с типами, методами под REST-маршруты сервера и возвратом Observable из каждого метода.

### Пример

```ts
@Injectable({ providedIn: 'root' })
export class ProdService {
  private http = inject(HttpClient);
  private readonly url = '/api/products';

  getAll()                              { return this.http.get<ProdModel[]>(this.url); }
  getOne(id: string)                    { return this.http.get<ProdModel>(`${this.url}/${id}`); }
  create(p: ProdInput)                  { return this.http.post<ProdModel>(this.url, p); }
  update(id: string, p: ProdInput)      { return this.http.put<ProdModel>(`${this.url}/${id}`, p); }
  remove(id: string)                    { return this.http.delete<void>(`${this.url}/${id}`); }   // id в адресе
}
```

**Источник:** [Angular API — HttpClient.delete](https://angular.dev/api/common/http/HttpClient#delete) · [Angular — Making requests](https://angular.dev/guide/http/making-requests)

---

<a id="p-7"></a>

## П-7. Компонент списка 🔴

### Как в материале

Слайды 8–9: таблица товаров с `*ngFor`, заголовки в `<td>`; компонент загружает товары в `ngOnInit`; `deleteProduct` вызывает удаление в сервисе; `updateProduct` удаляет у товара `_id`, кладёт товар в localStorage и переходит на `prod-edit`. Модель `ProdModel` — интерфейс с обязательными `_id`, `name`, `price`, `company`.

### Пример из материала

```ts
export class ProdGetComponent implements OnInit {
  prods: ProdModel[];
  ...
  deleteProduct(product: ProdModel){
    this.prodService.productDelete({_id: product._id});
  }
  updateProduct(product: ProdModel){
    localStorage.removeItem('product');
    delete product._id;
    localStorage.setItem('product', JSON.stringify(product));
    this.router.navigate(['prod-edit']);
  }
}
```

### В чём несоответствие

Строгая компиляция:

```
error TS2564: Property 'prods' has no initializer and is not definitely assigned in the constructor.
error TS2790: The operand of a 'delete' operator must be optional.
```

1. **`prods` без начального значения** — до ответа сервера это `undefined`.
2. **`delete product._id`** — кроме ошибки компиляции, это удаляет `_id` у **того же объекта**, что показан в таблице. Вернувшись со страницы редактирования, эту строку уже не удалить — у неё нет `_id`.
3. **Список не обновляется после удаления** — сервис ничего не возвращает, компоненту не на что подписаться.
4. **Передача через localStorage** делает страницу редактирования зависимой от того, что было нажато раньше; открыть её по ссылке или после очистки хранилища нельзя. `_id` передают в адресе.
5. Заголовки таблицы в `<td>` вместо `<th>`; `*ngFor` без импорта в standalone-компоненте не работает ([5_5 П-7](../week5/5_5-templating-popravki.md#p-7)).

### Как правильно

Сигнал с начальным значением; удаление с подпиской и обновлением списка; ссылка на `/prod-edit/:id`.

### Пример

См. исправленный `ProdGetComponent` в [конспекте §5](9_2-mongodb-angular-konspekt.md#s5). Ключевые строки:

```ts
protected prods = signal<ProdModel[]>([]);                       // ✅ начальное значение

protected remove(prod: ProdModel): void {
  this.prodService.remove(prod._id).subscribe({
    next: () => this.prods.update((list) => list.filter((p) => p._id !== prod._id)),   // ✅ список обновлён
  });
}
```

```html
<a [routerLink]="['/prod-edit', prod._id]">Edit</a>              <!-- ✅ _id в адресе, объект не меняется -->
```

**Источник:** [TypeScript — strictPropertyInitialization](https://www.typescriptlang.org/tsconfig/#strictPropertyInitialization) · [TypeScript — delete operator checks (TS 4.0)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#operands-for-delete-must-be-optional) · [Angular — Read route state](https://angular.dev/guide/routing/read-route-state)

---

<a id="p-8"></a>

## П-8. Редактирование через localStorage 🔴

### Как в материале

Слайды 10–11: форма добавления с тремя полями `[(ngModel)]` и кнопкой `insertfunc()`; компонент редактирования читает товар из localStorage в два поля — `prodOrigin` и `prod`, а при сохранении вызывает `productUpdate(this.prodOrigin, this.prod)` и переходит на главную.

### Пример из материала

```ts
prodOrigin = JSON.parse(localStorage.getItem('product'));
prod = JSON.parse(localStorage.getItem('product'));

editfunc() {
  this.prodService.productUpdate(this.prodOrigin, this.prod).subscribe(data =>{
    console.log(data);
    this.router.navigate(['']);
  });
}
```

```html
<h3>Create Prodct</h3>
<br> Product Price:<br>
<input type="text" [(ngModel)]="prod.name"> <br> Product Price:<br>
```

### В чём несоответствие

1. **Строгая компиляция:**

   ```
   error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
   ```

   `getItem` возвращает `null`, если ключа нет. Тогда `prod` — `null`, и шаблон падает на `prod.name`.
2. **Фильтр по всем полям старой версии.** `prodOrigin` (имя, цена, компания без `_id`) уходит на сервер как фильтр `updateMany`. Если два товара совпадают по этим полям, изменятся **оба**; если товар успели изменить в другой вкладке — **ни одного**, и пользователь об этом не узнает.
3. **Форма:** первое поле подписано «Product Price», хотя это название; «Create Prodct»; кнопка без `<form>` не срабатывает по Enter.

### Как правильно

`_id` из адреса → загрузить товар с сервера → обновить по `_id`.

### Пример

См. исправленный `ProdEditComponent` в [конспекте §6](9_2-mongodb-angular-konspekt.md#s6). Ключевые строки:

```ts
this.id = this.route.snapshot.paramMap.get('id') ?? '';
this.prodService.getOne(this.id).subscribe(({ name, price, company }) => (this.form = { name, price, company }));

save(): void {
  this.prodService.update(this.id, this.form).subscribe(() => this.router.navigate(['/prod-get']));   // PUT /:id
}
```

**Источник:** [MDN — Storage.getItem()](https://developer.mozilla.org/en-US/docs/Web/API/Storage/getItem) · [Angular — Read route state](https://angular.dev/guide/routing/read-route-state) · [MongoDB Node.js Driver — Update Documents](https://www.mongodb.com/docs/drivers/node/current/crud/update/modify/)

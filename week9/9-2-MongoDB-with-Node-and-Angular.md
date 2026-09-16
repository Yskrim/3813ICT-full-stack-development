# MongoDB with Node and Angular

Лекция сшивает всё вместе: Express-маршруты поверх MongoDB и Angular-сервис, который к ним обращается. Код опять только на скриншотах, поэтому ниже рабочая версия обеих сторон. Основные поправки: `body-parser` больше не нужен, схема маршрутов из лекции нарушает REST, а в Angular 17+ `HttpClient` подключается иначе, чем в слайдах.

### Структура (слайды 2–4)

Серверные зависимости по лекции: Express, MongoDB, Body-Parser, CORS. Из них **`body-parser` ставить не нужно** — с Express 4.16 разбор JSON встроен и делается через `express.json()`. Отдельный пакет остался только для очень старых проектов.

Логика сервера в лекции описана верно: подключаемся к Mongo, и **только если соединение поднялось**, запускаем Express на порту 3000 и регистрируем маршруты под CRUD-операции. Именно такой порядок и правильный: нет смысла принимать запросы, если база недоступна.

Мелочь: в слайде 3 написано «start the https express server» — там обычный http, никакого TLS в примере нет.

### Рабочий сервер

```js
// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors({ origin: 'http://localhost:4200' }));   // Angular dev-server
app.use(express.json());                              // вместо body-parser

const client = new MongoClient('mongodb://localhost:27017');

async function start() {
    await client.connect();                 // ОДИН раз за жизнь приложения
    const db = client.db('shopdb');

    app.use('/api/products', require('./routes/products')(db));

    app.listen(3000, () => console.log('сервер слушает http://localhost:3000'));
}

start().catch((err) => {
    console.error('не смогли подключиться к базе:', err.message);
    process.exit(1);
});
```

```js
// routes/products.js
const { Router } = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
    const router = Router();
    const products = db.collection('products');

    // поля, которые клиенту разрешено присылать
    function pickFields(body) {
        return {
            name: String(body.name ?? '').trim(),
            description: String(body.description ?? '').trim(),
            price: Number(body.price),
            units: Number(body.units)
        };
    }

    router.get('/', async (req, res) => {
        try {
            res.json(await products.find({}).toArray());
        } catch (err) {
            res.status(500).json({ error: 'ошибка базы' });
        }
    });

    router.get('/:id', async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'некорректный id' });
        }
        const product = await products.findOne({ _id: new ObjectId(req.params.id) });
        if (!product) return res.status(404).json({ error: 'не найдено' });
        res.json(product);
    });

    router.post('/', async (req, res) => {
        const data = pickFields(req.body);
        if (!data.name || Number.isNaN(data.price)) {
            return res.status(400).json({ error: 'name обязателен, price должен быть числом' });
        }
        const result = await products.insertOne(data);
        res.status(201).json({ _id: result.insertedId, ...data });
    });

    router.put('/:id', async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'некорректный id' });
        }
        const result = await products.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: pickFields(req.body) }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'не найдено' });
        res.json({ ok: true });
    });

    router.delete('/:id', async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'некорректный id' });
        }
        const result = await products.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'не найдено' });
        res.json({ ok: true });
    });

    return router;
};
```

Две вещи в этом коде, которых в лекции нет, но которые обязательны в любом реальном сервере. Первая — **валидация и белый список полей**: `updateOne` с `{ $set: req.body }` позволяет клиенту записать в документ что угодно, включая мусорные поля. Поэтому данные просеиваются через `pickFields`. Вторая — **осмысленные коды ответов**: 400 на плохой запрос, 404 когда объекта нет, 500 на сбой базы, 201 на создание. Клиенту это нужно, чтобы отличать «я неправильно заполнил форму» от «сервер лежит». И наружу уходит только текст ошибки, а не объект исключения со стеком.

### Схема маршрутов: в лекции она не REST

В слайдах (и подробно в 9.3) почти все маршруты сделаны через POST: `/api/add`, `/api/getitem`, `/api/update`, `/api/delete`. Работать будет, но это плохая привычка, и в реальной работе такое не пройдёт код-ревью. Соответствие:

| В лекции | По-хорошему |
| --- | --- |
| `POST /api/add` | `POST /api/products` |
| `GET /api/getlist` | `GET /api/products` |
| `POST /api/getitem` | `GET /api/products/:id` |
| `POST /api/update` | `PUT /api/products/:id` |
| `POST /api/delete` | `DELETE /api/products/:id` |

Смысл в том, что действие выражается методом HTTP, а адрес называет ресурс. Тогда `GET` можно кешировать и повторять безопасно, `DELETE` идемпотентен, а по URL сразу понятно, с чем работаем. Если преподаватель в задании требует его схему — делай его, но понимай разницу.

### Angular: сервис и компоненты (слайды 5–12)

Структура из лекции: три компонента страниц — `prod-add`, `prod-edit`, `prod-get` — плюс `prod.service.ts` для запросов через `HttpClient`. Навбар в `app.component.html` с кнопками перехода. Это разумное разделение: компоненты отвечают за отображение, сервис — за общение с сервером.

Класс для формы данных стоит объявить сразу:

```ts
export interface Product {
    _id?: string;          // приходит от Mongo, при создании его нет
    name: string;
    description: string;
    price: number;
    units: number;
}
```

Сервис:

```ts
@Injectable({ providedIn: 'root' })
export class ProdService {
    private readonly base = 'http://localhost:3000/api/products';

    constructor(private http: HttpClient) {}

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.base);
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.base}/${id}`);
    }

    addProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(this.base, product);
    }

    updateProduct(id: string, product: Product): Observable<{ ok: boolean }> {
        return this.http.put<{ ok: boolean }>(`${this.base}/${id}`, product);
    }

    deleteProduct(id: string): Observable<{ ok: boolean }> {
        return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
    }
}
```

Обрати внимание на дженерики: `get<Product[]>` — это ровно то, о чём была тема из week6. TypeScript не может знать, что придёт с сервера, поэтому тип объявляешь ты, и это обещание, а не проверка: если сервер пришлёт другое, компилятор не спасёт.

Компонент со списком:

```ts
export class ProdGetComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    private sub?: Subscription;

    constructor(private prodService: ProdService) {}

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.sub = this.prodService.getProducts().subscribe({
            next: (list) => (this.products = list),
            error: (err) => console.error('не смогли загрузить:', err.message)
        });
    }

    deleteProduct(product: Product): void {
        if (!confirm(`Удалить ${product.name}?`)) return;
        this.prodService.deleteProduct(product._id!).subscribe(() => this.load());
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}
```

### Что важно знать про Angular-часть

**`HttpClient` надо подключить, иначе ничего не работает.** В Angular 17+ это делается в `app.config.ts`:

```ts
export const appConfig: ApplicationConfig = {
    providers: [provideRouter(routes), provideHttpClient()]
};
```

Если проект на старых модулях — `HttpClientModule` в `imports` у `AppModule`. Без этого при первом запросе прилетит `NullInjectorError: No provider for HttpClient`, и это самая частая ошибка на этом этапе.

**Запрос не уйдёт без подписки.** `HttpClient` возвращает **холодный** Observable: пока ты не вызвал `subscribe`, никакого HTTP-запроса не происходит. Именно поэтому `deleteProduct(...)` без `.subscribe()` молча ничего не делает — классическая ловушка, прямо следующая из темы 6.4. И наоборот, две подписки на один такой Observable дадут два запроса.

**Обработка ошибок.** `HttpClient` не отклоняет ответы с кодами 4xx и 5xx молча — они приходят в колбэк `error` как `HttpErrorResponse`. Обрабатывать нужно всегда, иначе ошибка сервера выглядит для пользователя как «кнопка не работает».

**Отписка.** Для HTTP это не так критично, как для сокетов, потому что ответ приходит один раз и поток завершается сам. Но привычку отписываться в `ngOnDestroy` лучше держать всегда — либо через `Subscription`, либо через `async` pipe в шаблоне, который делает это сам.

**Про CORS.** Angular на 4200, Node на 3000 — это разные origin, поэтому без `cors` на сервере запросы заблокирует браузер. Это тот же барьер, что в week5, и он никак не связан с MongoDB.

### Проверь себя

1. Почему `body-parser` из списка зависимостей можно вычеркнуть?
2. Что не так со схемой маршрутов `POST /api/getitem` и `POST /api/delete`?
3. Почему вызов `deleteProduct(id)` без `.subscribe()` не удаляет ничего?
4. Что означает `NullInjectorError: No provider for HttpClient` и как это лечится?
5. Зачем на сервере просеивать `req.body` через белый список полей?
6. Что даёт `get<Product[]>` и чего оно **не** даёт?

<!-- Ответы: с Express 4.16 разбор JSON встроен и делается через `express.json()`. Действие должно выражаться методом HTTP, а не словом в адресе: получение — это `GET /api/products/:id`, удаление — `DELETE /api/products/:id`. Потому что `HttpClient` возвращает холодный Observable, и запрос отправляется только при подписке. Это значит, что `HttpClient` не зарегистрирован: нужно добавить `provideHttpClient()` в провайдеры приложения (или `HttpClientModule` в старой схеме с модулями). Чтобы клиент не мог записать в документ произвольные или служебные поля. Даёт типизацию и автодополнение на стороне TypeScript, но не проверяет, что сервер действительно прислал такие данные. -->

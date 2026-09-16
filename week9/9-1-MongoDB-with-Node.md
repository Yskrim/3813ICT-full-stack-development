# MongoDB with NodeJS

Лекция про драйвер MongoDB для Node: подключение, CRUD, переход от колбэков к `async/await`. Код в слайдах — картинки, поэтому ниже я выписал рабочий вариант целиком. Важно: **колбэчный API, вокруг которого построена половина лекции, из драйвера удалён**, так что примеры оттуда просто не заработают. Об этом подробно ниже.

### Стартовая точка (слайд 2)

- запустить сервер MongoDB (см. заметки 8.2 — через `brew services`, а не через ручной `mongod --dbpath`);
- создать проект: `npm init`;
- поставить драйвер: `npm install mongodb` (флаг `--save` из слайда не нужен, он стоит по умолчанию с npm 5);
- убедиться, что `mongod` запущен.

Драйвер — это отдельная вещь от оболочки `mongosh`. Оболочка нужна тебе для ручных проверок, драйвер — коду приложения.

### Подключение (слайды 3–4)

Так подключение выглядит на актуальном драйвере:

```js
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'shopdb';

const client = new MongoClient(url);

await client.connect();
console.log('Connected successfully to server');

const db = client.db(dbName);
const collection = db.collection('products');
```

**Ошибка в слайде 4.** Там написано `db.connection(colName)`. Такого метода нет, правильно `db.collection(colName)`. Опечатка коварная: ошибка вылезет не при подключении, а строкой позже, в виде `db.connection is not a function`.

Ещё две вещи, которые в слайдах скорее всего есть на скриншотах и которые надо выкинуть: опции `useNewUrlParser` и `useUnifiedTopology`. Они были удалены из драйвера ещё в версии 4, в версии 6 их наличие выдаёт предупреждение об устаревании, а в 7 они удалены окончательно. Просто не пиши их.

### Колбэки: этой части лекции больше нет

Слайды 5–8 выстроены как драматургия: сначала методы с параметром `callback`, потом «callbackHell» из вложенных колбэков, потом спасение через промисы и `async/await`. Мысль правильная, но фактическая база устарела: слайд 8 утверждает, что драйвер предоставляет и колбэчную, и промисную версию почти всех операций. **Начиная с версии 5 драйвер стал Promise-only, поддержка колбэков вынесена в отдельный пакет `mongodb-legacy`.**

Что это значит практически: код в стиле `collection.insertOne(doc, (err, result) => {...})` на современном драйвере не работает вообще. Поэтому `callbackHell` из лекции не нужно ни писать, ни понимать — сразу пиши `await`. Кстати, ссылка на w3schools со слайда 9 показывает как раз колбэчные примеры, так что как источник она устарела; смотри официальную документацию драйвера.

### Рабочий CRUD на async/await

Вот полный скрипт, заменяющий примеры лекции:

```js
const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'shopdb';

async function main() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        console.log('подключились');

        const products = client.db(dbName).collection('products');

        // CREATE
        const inserted = await products.insertOne({ name: 'клавиатура', price: 50, units: 10 });
        console.log('вставили _id:', inserted.insertedId);

        await products.insertMany([
            { name: 'мышь', price: 20, units: 5 },
            { name: 'монитор', price: 300, units: 2 }
        ]);

        // READ
        const all = await products.find({}).toArray();          // find даёт КУРСОР
        console.log('всего товаров:', all.length);

        const cheap = await products.find({ price: { $lt: 100 } })
            .sort({ price: 1 })
            .limit(10)
            .toArray();
        console.log('дешёвые:', cheap.map((p) => p.name));

        const one = await products.findOne({ _id: inserted.insertedId });
        console.log('нашли по _id:', one.name);

        // UPDATE
        const updated = await products.updateOne(
            { _id: inserted.insertedId },
            { $set: { price: 60 } }
        );
        console.log('изменено документов:', updated.modifiedCount);

        // DELETE
        const deleted = await products.deleteOne({ _id: inserted.insertedId });
        console.log('удалено документов:', deleted.deletedCount);

        console.log('осталось:', await products.countDocuments());
    } catch (err) {
        console.error('ошибка работы с базой:', err.message);
    } finally {
        await client.close();   // закрывать соединение уместно В СКРИПТЕ, но не в сервере
    }
}

main();
```

### Что важно знать про этот код

**`find()` возвращает курсор, а не массив.** Данные появляются только после `toArray()` (или обхода курсора циклом `for await`). Если коллекция большая, `toArray()` затянет всё в память — тогда лучше идти курсором или ставить `limit`.

**Что возвращают операции записи.** Не документы, а отчёты: `insertOne` даёт `{ acknowledged, insertedId }`, `updateOne` — `matchedCount` и `modifiedCount`, `deleteOne` — `deletedCount`. Полезно различать `matchedCount: 0` (не нашли, кого обновлять) и `modifiedCount: 0` (нашли, но данные и так были такими) — это разные ситуации, и в API они дают разные ответы клиенту. Старое поле `result.ops`, которое встречается в древних примерах, из драйвера удалено.

**`_id` — это `ObjectId`, а не строка.** Когда id приходит из URL или из тела запроса, это строка, и искать по ней напрямую бесполезно — совпадений не будет. Нужно оборачивать:

```js
const { ObjectId } = require('mongodb');

if (!ObjectId.isValid(id)) {
    // иначе new ObjectId(id) бросит исключение и уронит маршрут
    return res.status(400).json({ error: 'некорректный id' });
}
await products.findOne({ _id: new ObjectId(id) });
```

**Один `MongoClient` на всё приложение.** Это главное отличие скрипта от сервера, и на нём спотыкаются, перенося код из этой лекции в следующую. Драйвер внутри держит пул соединений, поэтому подключаться нужно **один раз** при старте приложения и переиспользовать `client` во всех маршрутах. Подключаться и закрывать соединение на каждый HTTP-запрос — тяжёлая ошибка: это медленно и быстро упирается в лимиты. Соответственно `client.close()` в сервере вызывают только при остановке процесса.

### Связки с прошлым материалом

- **week6, промисы:** драйвер сегодня целиком промисный, так что `try/catch/finally` и `Promise.all` из 6.2 применяются здесь напрямую. Например, независимые запросы к базе можно и нужно запускать через `Promise.all`, а не тремя `await` подряд.
- **week6, Observable:** в Angular эти же данные придут как `Observable` из `HttpClient` — это будет в 9.2.
- **week8:** имена операторов и структура запросов те же, что в `mongosh`, разница только в том, что вызовы асинхронные.

### Проверь себя

1. Что не так со строкой `db.connection('products')`?
2. Почему пример с `callbackHell` из лекции не заработает на свежем драйвере?
3. Почему `find({})` нельзя сразу перебрать как массив?
4. Чем `matchedCount` отличается от `modifiedCount`?
5. Почему нельзя искать документ по `_id`, взяв строку прямо из URL?
6. Где место `client.connect()` в веб-сервере и где `client.close()`?

<!-- Ответы: метода `connection` нет, нужен `collection`. Потому что с версии 5 драйвер Promise-only, колбэки вынесены в пакет `mongodb-legacy`. Потому что `find` возвращает курсор, массив получается после `toArray()`. Первый — сколько документов подошло под фильтр, второй — сколько реально изменилось; ноль во втором при единице в первом означает, что данные уже были такими. Потому что `_id` имеет тип `ObjectId`, и строку надо обернуть в `new ObjectId(...)`, предварительно проверив её через `ObjectId.isValid`. `connect()` — один раз при старте приложения, `close()` — только при остановке процесса, а не после каждого запроса. -->

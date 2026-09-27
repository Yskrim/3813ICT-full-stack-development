# 9_1 — MongoDB и Node.js: поправки

**Курс:** 3813ICT, неделя 9
**Источник:** `9_1_-_MongoDB_with_Node_24.pdf` (9 слайдов)
**Связанные файлы:** [конспект](9_1-mongodb-node-konspekt.md) · [примеры](9_1-mongodb-node-primery.md) · [вопросы](9_1-mongodb-node-voprosy.md) · [ответы](9_1-mongodb-node-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: код со скриншотов переписан дословно. Поведение драйвера проверено запуском Node.js с пакетом `mongodb` 7.6 (без сервера `mongod`: проверялись вызов колбэков, разбор опций и экспорты) и строгой компиляцией TypeScript по типам драйвера. Результаты ниже — реальные.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Подготовка проекта | 🔵 | `–save` с длинным тире; `--save` не нужен; `/data` на macOS не создать |
| [П-2](#p-2) | `main().then(console.log(...))` и `funOrders` без `await` | 🔴 | Сообщение печатается сразу; соединение закрывается раньше операций |
| [П-3](#p-3) | Колбэки в методах драйвера | 🔴 | Убраны в драйвере 5.0 — колбэк не вызывается никогда |
| [П-4](#p-4) | `useNewUrlParser` и `mongodb.ObjectID` | 🔴 | `MongoParseError` при создании клиента; `ObjectID` — `undefined` |
| [П-5](#p-5) | `then(function(err, result))` | 🔴 | Результат попадает в `err`; последний шаг бросает документы как ошибку |
| [П-6](#p-6) | `awaitHeaven` | 🟡 | Необъявленная `result`; соединение не закрывается при ошибке |
| [П-7](#p-7) | Ссылка на W3Schools | 🔵 | Для драйвера — официальная документация MongoDB |

---

<a id="p-1"></a>

## П-1. Подготовка проекта 🔵

### Как в материале

Слайд 2: установить нужную версию MongoDB, создать Node-проект (`npm init`), установить драйвер командой `npm install mongodb –save` и запустить `mongod --dbpath=/data` с каталогом данных `/data`; на Windows сервер может уже работать как служба.

### Пример из материала

```
npm install mongodb –save
mongod --dbpath=/data
```

### В чём несоответствие

1. **`–save` с длинным тире** — npm воспримет его как имя ещё одного пакета, и установка завершится ошибкой. Флаг к тому же не нужен: с npm 5 зависимости сохраняются в `package.json` автоматически.
2. **`/data` на современных macOS не создать** — корень системного тома только для чтения. При установке через Homebrew каталог данных создаётся сам, а сервер запускается как служба ([8_2 П-1](../week8/8_2-mongodb-popravki.md#p-1)).
3. Не сказано про версию Node.js: драйвер `mongodb` 7.x требует Node.js 20.19 или новее.

### Как правильно

```bash
npm install mongodb
brew services start mongodb-community@8.0
```

### Пример

```bash
npm init -y
npm install mongodb
node -e "console.log(require('mongodb/package.json').version)"   # версия драйвера
node --version                                                  # не ниже 20.19

# Если нужен ручной запуск с своим каталогом — в папке проекта, не в корне диска:
mkdir -p ./data && mongod --dbpath ./data
```

**Источник:** [MongoDB Node.js Driver — Get Started](https://www.mongodb.com/docs/drivers/node/current/get-started/) · [MongoDB Node.js Driver — Compatibility](https://www.mongodb.com/docs/drivers/node/current/reference/compatibility/)

---

<a id="p-2"></a>

## П-2. `main().then(console.log(...))` и `funOrders` без `await` 🔴

### Как в материале

Слайды 3–4: `app.js` создаёт `MongoClient`, в асинхронной функции `main` подключается, получает базу через `client.db` и коллекцию, вызывает `funOrders(client, collection)` и возвращает `'done.'`. Затем `main().then(console.log("main...")).catch(console.error).finally(() => client.close())`. В тексте слайда 4 коллекция открывается методом `db.connection(colName)`.

### Пример из материала

```js
async function main() {
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('colName');
  funOrders(client,collection)
  return 'done.';
}

main()
  .then(console.log("main..."))
  .catch(console.error)
  .finally(() => client.close());
```

### В чём несоответствие

1. **`.then(console.log("main..."))`** — в `then` передан не обработчик, а **результат вызова** `console.log`, то есть `undefined`. `console.log` выполняется сразу при построении цепочки, поэтому «main...» печатается **до** подключения, а значение `'done.'` не выводится никогда. Нужна функция: `.then((r) => console.log(r))`.
2. **`funOrders` без `await`.** Функция запускает операции и сразу возвращается; `main` завершается, и `finally` закрывает клиента, пока операции ещё выполняются. Они падают с ошибкой о закрытом клиенте (или, в варианте с колбэками, просто не завершаются).
3. **`db.connection(colName)`** в тексте — такого метода нет, правильно `db.collection(colName)` (в коде на скриншоте верно).

### Как правильно

Передавать в `then` функцию; ждать все асинхронные операции через `await` до выхода из `main`.

### Пример

```js
async function main() {
  await client.connect();
  const collection = client.db('myProject').collection('colName');
  await funOrders(collection);              // ✅ ждём операции
  return 'done.';
}

main()
  .then((result) => console.log(result))    // ✅ функция-обработчик → 'done.'
  .catch(console.error)
  .finally(() => client.close());           // ✅ после всех операций

// ❌ .then(console.log('main...'))  — печатает сразу, в then попадает undefined
```

**Источник:** [MDN — Promise.prototype.then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) · [MongoDB Node.js Driver — Connection Guide](https://www.mongodb.com/docs/drivers/node/current/connect/)

---

<a id="p-3"></a>

## П-3. Колбэки в методах драйвера 🔴

### Как в материале

Слайды 5–7: операции `insertDocuments`, `findDocuments`, `updateDocument`, `removeDocument` принимают колбэк и вызывают `insertMany`, `find().toArray`, `updateOne`, `deleteOne` с функцией `function(err, result)`; модуль `funOrders` выполняет их по очереди, вкладывая вызовы друг в друга. Слайд 8 утверждает, что драйвер предоставляет и колбэк-, и промис-версию почти для всех операций.

### Пример из материала

```js
exports.insertDocuments = function(collection, docArray, callback) {
  collection.insertMany(docArray, function(err, result) {
    console.log("Inserted the following documents into the collection:");
    console.log(docArray);
    callback(result);
  });
}
```

### В чём несоответствие

Поддержка колбэков **удалена из драйвера в версии 5.0** (2023 год). Методы игнорируют переданную функцию и всегда возвращают Promise. Проверено с драйвером 7.6:

```
insertMany(docs, cb) returns Promise
promise rejected: MongoServerSelectionError | callback called: false
```

То есть колбэк не вызывается ни при успехе, ни при ошибке. Цепочка `funOrders` останавливается на первом шаге, `client.close()` не вызывается, процесс «висит». Утверждение слайда 8 о двух версиях API было верно только для драйверов 4.x и старше.

Даже в старых версиях этот код был ненадёжным: все колбэки игнорируют `err`.

### Как правильно

`async`/`await` (или `then`) для каждой операции.

### Пример

```js
exports.insertDocuments = async function (collection, docArray) {
  const result = await collection.insertMany(docArray);
  console.log('Inserted:', result.insertedCount);
  return result;
};

exports.findDocuments = async function (collection, query) {
  return collection.find(query).toArray();    // Promise с массивом
};
```

**Источник:** [MongoDB Node.js Driver — Upgrade Guide (v5: removal of callback support)](https://www.mongodb.com/docs/drivers/node/current/reference/upgrade/) · [MongoDB Node.js Driver — Promises](https://www.mongodb.com/docs/drivers/node/current/promises/)

---

<a id="p-4"></a>

## П-4. `useNewUrlParser` и `mongodb.ObjectID` 🔴

### Как в материале

Слайд 7 (all-in-one): подключение через `MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {...})`, а в начале модуля — `ObjectId = mongodb.ObjectID`.

### Пример из материала

```js
const MongoClient = require('mongodb').MongoClient,
    url = "mongodb://localhost:27017/",
    mongodb = require('mongodb'),
    ObjectId = mongodb.ObjectID;

MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    let db = client.db("dbName");
    let myCol = db.collection("colName");
    callbackHell(client, myCol);
});
```

### В чём несоответствие

Проверено с драйвером 7.6:

```
ObjectID export: undefined | ObjectId: function
useNewUrlParser: MongoParseError - option usenewurlparser is not supported
```

1. **`useNewUrlParser`** был флагом переходного периода драйвера 3.x; в 4.x стал ничего не делающим, а в современных версиях его нет — клиент с этой опцией **не создаётся**, выбрасывается `MongoParseError`.
2. **`mongodb.ObjectID`** (с заглавной `D`) больше не экспортируется — только `ObjectId`. `new ObjectId(...)` при `ObjectId = undefined` даст `TypeError`.
3. **Колбэк в `MongoClient.connect`** не вызывается ([П-3](#p-3)), и `throw err` в колбэке уронил бы процесс.

### Как правильно

```js
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
```

### Пример

```js
const { MongoClient, ObjectId } = require('mongodb');

async function main() {
  const client = new MongoClient('mongodb://localhost:27017');   // без устаревших опций
  try {
    await client.connect();
    const col = client.db('dbName').collection('colName');
    const doc = await col.findOne({ _id: new ObjectId('66f1c0a1b2c3d4e5f6a7b8c9') });
    console.log(doc);
  } finally {
    await client.close();
  }
}
main().catch(console.error);
```

**Источник:** [MongoDB Node.js Driver — Connection Options](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/) · [MongoDB Node.js Driver — Upgrade Guide](https://www.mongodb.com/docs/drivers/node/current/reference/upgrade/) · [BSON — ObjectId](https://www.mongodb.com/docs/manual/reference/method/ObjectId/)

---

<a id="p-5"></a>

## П-5. `then(function(err, result))` 🔴

### Как в материале

Слайд 8: `promiseWorld` заменяет колбэки цепочкой `then`; каждый обработчик объявлен как `function(err, result)`, последний проверяет `if (err) throw err`, выводит `result` и закрывает клиента.

### Пример из материала

```js
}).then(function(err, result) {
    console.log("Removed the documents with: ", queryJSONdel);
    return myCol.find({}).toArray();
}).then(function(err, result) {
    if (err) throw err;
    console.log(result);
    client.close();
});
```

### В чём несоответствие

1. **Обработчик `then` получает один аргумент — значение выполненного Promise.** Ошибки в `then` не передаются первым аргументом; для них есть второй обработчик `then` или `catch`. Поэтому в `function(err, result)` результат попадает в `err`, а `result` всегда `undefined`.
2. **Последний шаг ломается.** `err` здесь — массив найденных документов; непустой массив истинен, поэтому `if (err) throw err` **бросает массив документов как ошибку**. `console.log(result)` и `client.close()` не выполняются, а так как `catch` в цепочке нет, получается «unhandled rejection».
3. **Дублирование:** второй и третий шаги выполняют одно и то же `updateMany`.

### Как правильно

`then((result) => ...)`, одна обработка ошибок в `catch`, закрытие в `finally`.

### Пример

```js
const promiseWorld = (client, col) =>
  col.insertMany(docArray)
    .then(() => col.updateMany({ name: 'A' }, { $set: { name: 'A2' } }))
    .then(() => col.deleteMany({ _id: 3 }))
    .then(() => col.find({}).toArray())
    .then((docs) => console.log(docs))          // ✅ один аргумент — результат
    .catch((err) => console.error(err))         // ✅ ошибки любого шага
    .finally(() => client.close());
```

**Источник:** [MDN — Promise.prototype.then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) · [MDN — Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

---

<a id="p-6"></a>

## П-6. `awaitHeaven` 🟡

### Как в материале

Слайд 8: `awaitHeaven` — асинхронная функция, которая через `await` по очереди вставляет, обновляет, удаляет и ищет документы, выводит результат и закрывает клиента. Назван самым лаконичным и элегантным вариантом.

### Пример из материала

```js
const awaitHeaven = async function(client, myCol){
  result = await myCol.insertMany(docArray);
  ...
  result = await myCol.find({}).toArray();
  console.log(result);
  client.close();
};
```

### В чём несоответствие

Стиль выбран правильно, но:

1. **`result` не объявлена** — в строгом режиме (ES-модули, классы) это `ReferenceError`, в обычном — случайная глобальная переменная, общая для всех вызовов.
2. **Нет `try/finally`** — если любая операция бросит ошибку (например, дубликат `_id`), `client.close()` не выполнится, соединение останется открытым, а процесс не завершится.
3. `client.close()` возвращает Promise — его стоит ждать.
4. В данных документам дают поле `id` рядом с автоматическим `_id` ([8_2 П-6](../week8/8_2-mongodb-popravki.md#p-6)).

### Как правильно

Объявлять переменные; закрывать в `finally`.

### Пример

```js
const awaitHeaven = async function (client, col) {
  try {
    const inserted = await col.insertMany(docArray);
    const updated = await col.updateMany({ name: 'A' }, { $set: { name: 'A2' } });
    await col.deleteMany({ _id: 3 });
    const docs = await col.find({}).toArray();
    console.log(inserted.insertedCount, updated.modifiedCount, docs);
  } finally {
    await client.close();                  // закроется и при ошибке
  }
};
```

**Источник:** [MDN — async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) · [MDN — try...catch (finally)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

---

<a id="p-7"></a>

## П-7. Ссылка на W3Schools 🔵

### Как в материале

Слайд 9 предлагает урок W3Schools по Node.js и MongoDB как пример настройки драйвера и CRUD-операций.

### Пример из материала

Кода нет.

### В чём несоответствие

Сторонние уроки часто отстают от драйвера: в них встречаются колбэки, `useNewUrlParser` и другие вещи из [П-3](#p-3) и [П-4](#p-4), которые в драйвере 5+ не работают. Для учебного проекта надёжнее официальная документация драйвера — там примеры соответствуют текущей версии и есть отдельные страницы для каждой операции.

### Как правильно

Официальная документация MongoDB Node.js Driver и её раздел CRUD.

### Пример

```
https://www.mongodb.com/docs/drivers/node/current/            — главная страница драйвера
https://www.mongodb.com/docs/drivers/node/current/crud/       — операции CRUD
```

**Источник:** [MongoDB Node.js Driver — Documentation](https://www.mongodb.com/docs/drivers/node/current/)

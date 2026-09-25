# 8_2 — MongoDB: поправки

**Курс:** 3813ICT, неделя 8
**Источник:** `8_2_-_MongoDB.pdf` (41 слайд)
**Связанные файлы:** [конспект](8_2-mongodb-konspekt.md) · [примеры](8_2-mongodb-primery.md) · [вопросы](8_2-mongodb-voprosy.md) · [ответы](8_2-mongodb-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно, полный пример с пояснениями и **источник** — ссылка на официальную документацию.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

> Проверка: сверено с документацией MongoDB 8.0 и `mongosh`. Код со скриншотов переписан дословно. Скриншоты в исходнике сделаны на MongoDB 3.4.9 со старой оболочкой `mongo` (2018 год). Запустить `mongod` в среде проверки не удалось, поэтому поведение подтверждено документацией, а не запуском.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Установка на macOS | 🔵 | Формулы `mongodb` нет; официально — tap `mongodb/brew`; `sudo chown` не нужен |
| [П-2](#p-2) | Оболочка `mongo` | 🔵 | Удалена в MongoDB 6.0; только `mongosh` |
| [П-3](#p-3) | `use` «создаёт базу» | 🟡 | Только переключает; база появляется при первой записи |
| [П-4](#p-4) | Удаление базы на скриншоте | 🔴 | Опечатка `dropDatabse` без скобок — база не удалена |
| [П-5](#p-5) | Создание коллекции | 🔴 | В шпаргалке `createcollection` — ошибка регистра; явное создание обычно не нужно |
| [П-6](#p-6) | `id` и `_id`, заголовок `insertMany` | 🟡 | `id` — обычное поле; «несколько документов в коллекцию», а не наоборот |
| [П-7](#p-7) | `update()` и `remove()` | 🔵 | Устарели — `updateOne/Many`, `deleteOne/Many`; нюанс `findOneAndUpdate` |
| [П-8](#p-8) | Проекция | 🟡 | `_id` включается сам; несуществующие поля молча игнорируются |
| [П-9](#p-9) | Сравнение «строк, чисел, дат» | 🟡 | Сравниваются значения одного типа; строки — посимвольно |
| [П-10](#p-10) | `limit`, `skip`, пагинация | 🟡 | Без `sort` порядок не гарантирован; формула для страниц с нуля; большой `skip` медленный |
| [П-11](#p-11) | Шпаргалка курсора | 🔴 | `find().count` без скобок; `count()` устарел; `sort` без объекта |
| [П-12](#p-12) | Шпаргалка логических операторов | 🔴 | AND и OR перепутаны; `$not` записан неверно; лишняя скобка в `$nor` |
| [П-13](#p-13) | Поиск по вложенному документу | 🟡 | Нужно точное совпадение, включая порядок полей; обычно — точечная нотация |
| [П-14](#p-14) | «Вложенные документы → нужна SQL», «x2», ручные join | 🟡 | Встраивание — рекомендуемый подход; соединение — `$lookup` |

---

<a id="p-1"></a>

## П-1. Установка на macOS 🔵

### Как в материале

Слайд 4 предлагает установить MongoDB через Homebrew командой `brew install mongodb`, отдать текущему пользователю права на папки справочных страниц `man5` и `man7`, создать каталог `/data/db` и выдать права на запись, после чего запускать сервер командой `mongod`.

### Пример из материала

```
brew install mongodb

sudo chown -R $(whoami) /usr/local/share/man/man5
/usr/local/share/man/man7
And chmod u+w /usr/local/share/man/man5 /usr/local/share/man/man7

sudo chown -R `id –un` /data/db

mongod
```

### В чём несоответствие

1. **Формулы `mongodb` в основном репозитории Homebrew больше нет.** Официальный способ — репозиторий MongoDB (`brew tap mongodb/brew`) и формула с версией `mongodb-community@8.0`.
2. **Менять владельца системных папок не нужно.** Права на `man5`/`man7` к установке MongoDB не относятся; массовые `sudo chown -R` по системным каталогам могут сломать права других программ.
3. **`/data/db` на современных macOS не создать**: корень системного тома доступен только для чтения. Homebrew сам создаёт каталог данных (`/opt/homebrew/var/mongodb` на Apple Silicon, `/usr/local/var/mongodb` на Intel) и файл настроек.
4. **`id –un`** — длинное тире вместо дефиса, команда не сработает.
5. Запуск голым `mongod` без настроек ищет каталог `/data/db`; при установке через Homebrew сервер запускают как службу.

### Как правильно

Следовать официальной инструкции для своей версии и платформы; на macOS — tap `mongodb/brew` и `brew services`.

### Пример

```bash
xcode-select --install                         # инструменты командной строки (если ещё нет)
brew tap mongodb/brew
brew update
brew install mongodb-community@8.0

brew services start mongodb-community@8.0      # mongod как фоновая служба
brew services list                             # статус
mongosh                                        # подключение к localhost:27017

brew services stop mongodb-community@8.0       # остановить, когда не нужен
```

**Источник:** [MongoDB — Install MongoDB Community Edition on macOS](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/) · [MongoDB — Installation](https://www.mongodb.com/docs/manual/installation/)

---

<a id="p-2"></a>

## П-2. Оболочка `mongo` 🔵

### Как в материале

Слайды 6–7 показывают запуск сервера и клиента: текст говорит о `mongosh`, но на скриншотах — оболочка `mongo` и сервер версии 3.4.9. Слайд 8 ссылается на документацию «mongo shell», шпаргалка на слайде 35 предлагает `Mongo / mongosh` и подключение к удалённому серверу через `mongo –host <hostname/ip> --port <port no>`.

### Пример из материала

```
PS C:\Program Files\MongoDB\Server\3.4\bin> mongo
MongoDB shell version v3.4.9
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.9

mongo –host <hostname/ip> --port <port no>
```

### В чём несоответствие

1. Старая оболочка `mongo` объявлена устаревшей в MongoDB 5.0 и **удалена в 6.0**. С текущими версиями она не поставляется; её заменяет `mongosh`.
2. В шпаргалке `–host` записан с длинным тире — флаг не распознается.
3. Ссылка на документацию «mongo shell» ведёт на страницы старой оболочки; актуальная документация — раздел MongoDB Shell (`mongosh`).
4. Скриншоты MongoDB 3.4 выглядят иначе, чем вывод `mongosh`: например, приглашение `test>` вместо `MongoDB Enterprise >`, и ответы выводятся без кавычек у ключей.

### Как правильно

`mongosh` для подключения; строка подключения или флаги с двумя дефисами.

### Пример

```bash
mongosh                                         # localhost:27017
mongosh "mongodb://192.168.1.20:27017"          # другой сервер — строкой подключения
mongosh --host 192.168.1.20 --port 27017        # или флагами (два дефиса)
mongosh "mongodb+srv://cluster0.example.mongodb.net/" --username anton   # Atlas
```

**Источник:** [MongoDB — Compatibility Changes in MongoDB 6.0 («Legacy mongo Shell Removed»)](https://www.mongodb.com/docs/manual/release-notes/6.0-compatibility/) · [MongoDB Shell (mongosh)](https://www.mongodb.com/docs/mongodb-shell/) · [mongosh — Connect to a Deployment](https://www.mongodb.com/docs/mongodb-shell/connect/)

---

<a id="p-3"></a>

## П-3. `use` «создаёт базу» 🟡

### Как в материале

Слайд 10: чтобы создать базу, используют команду `use <DATABASE_NAME>`; она создаёт базу, если её нет, а если есть — делает её текущей.

### Пример из материала

```
MongoDB Enterprise > use test
switched to db test
```

### В чём несоответствие

`use` только переключает оболочку на базу с этим именем. На диске база появляется, когда в неё впервые что-то записывают: вставляют документ или создают коллекцию. До этого её нет в `show dbs`. Практическое следствие: опечатка в имени (`use bookstor`) не вызовет ошибки — ты просто окажешься в пустой «несуществующей» базе и будешь удивляться, куда пропали данные.

### Как правильно

`use` выбирает базу; создаёт её первая запись.

### Пример

```js
use bookStore
show dbs                                   // bookStore в списке нет
db.books.insertOne({ title: 'Learning Node.js' })
show dbs                                   // bookStore появилась
db                                         // проверка текущей базы
```

**Источник:** [mongosh — Run Commands («Create a New Database and Collection»)](https://www.mongodb.com/docs/mongodb-shell/run-commands/)

---

<a id="p-4"></a>

## П-4. Удаление базы на скриншоте 🔴

### Как в материале

Слайд 11: базу можно удалить, вызвав `use <DATABASE_NAME>`, а затем `db.dropDatabase()`. На скриншоте показано выполнение этих команд.

### Пример из материала

```
MongoDB Enterprise > use test
switched to db test
MongoDB Enterprise > db.dropDatabse
test.dropDatabse
```

### В чём несоответствие

На скриншоте опечатка — `dropDatabse` вместо `dropDatabase` — и нет скобок вызова. Оболочка воспринимает `db.<имя>` как обращение к **коллекции** с таким именем и выводит её полное имя: `test.dropDatabse`. Никакого удаления не произошло. Правильная команда отвечает `{ ok: 1, dropped: 'test' }`.

Кроме того, слайд не предупреждает, что `dropDatabase()` **необратимо** удаляет текущую базу со всеми коллекциями.

### Как правильно

`db.dropDatabase()` — со скобками и после проверки текущей базы.

### Пример

```js
use test
db                        // test — точно та база?
db.dropDatabase()         // { ok: 1, dropped: 'test' }

db.dropDatabse            // ❌ опечатка: не удаляет, а выводит «test.dropDatabse»
```

**Источник:** [MongoDB — db.dropDatabase()](https://www.mongodb.com/docs/manual/reference/method/db.dropDatabase/)

---

<a id="p-5"></a>

## П-5. Создание коллекции 🔴

### Как в материале

Слайд 12: коллекции похожи на таблицы и создаются командой `db.createCollection('<Collection Name>')`. В шпаргалке на слайде 35 та же команда записана как `db.createcollection(‘<collection name>’)`.

### Пример из материала

```
MongoDB Enterprise > db.createCollection('collectionName')
{ "ok" : 1 }

db.createcollection(‘<collection name>’)      // шпаргалка
```

### В чём несоответствие

1. **Регистр.** В JavaScript и `mongosh` имена чувствительны к регистру: `createcollection` — не метод, а обращение к коллекции с таким именем, и вызов завершится ошибкой вида `TypeError: db.createcollection is not a function`. Плюс типографские кавычки.
2. **Явное создание обычно не нужно.** MongoDB создаёт коллекцию сама при первой вставке. `createCollection` нужен, когда коллекции задают параметры: правила валидации, ограниченный размер (capped), time series и другие.

### Как правильно

Коллекция создаётся первой вставкой; `db.createCollection` (с заглавной `C`) — для коллекций с параметрами.

### Пример

```js
db.books.insertOne({ title: 'Learning Node.js' })   // коллекция books создана автоматически

db.createCollection('messages', {                    // явно — потому что есть параметры
  validator: { $jsonSchema: { bsonType: 'object', required: ['text'] } },
})
```

**Источник:** [MongoDB — db.createCollection()](https://www.mongodb.com/docs/manual/reference/method/db.createCollection/) · [MongoDB — Databases and Collections](https://www.mongodb.com/docs/manual/core/databases-and-collections/)

---

<a id="p-6"></a>

## П-6. `id` и `_id`, заголовок `insertMany` 🟡

### Как в материале

Слайд 9 показывает документ с полем `id: 1` как пример записи MongoDB. Во всех примерах вставки (слайды 14–15) документам даётся поле `id` вместе с автоматически создаваемым `_id`. Слайд 15 озаглавлен «Inserting Multiple Collections Into a Document».

### Пример из материала

```js
{
  id: 1,
  name: ‘the best of databases’,
  status: ‘active’,
  categories:[‘database’,’programming’]
}
```

### В чём несоответствие

1. **`id` — обычное поле.** Идентификатор документа в MongoDB — поле `_id`: оно обязательно, уникально в коллекции (по нему автоматически есть уникальный индекс) и неизменяемо. Поле `id` таких гарантий не даёт: можно вставить два документа с одинаковым `id`. Если нужен свой числовой идентификатор, его кладут прямо в `_id`.
2. **Заголовок перевёрнут:** `insertMany` вставляет несколько **документов** в **коллекцию**.
3. Типографские кавычки в примере документа — синтаксическая ошибка.

### Как правильно

Свой идентификатор — в `_id`; не заводить параллельное поле `id`.

### Пример

```js
db.books.insertOne({ _id: 1, title: 'Learning Node.js' })
db.books.insertOne({ _id: 1, title: 'Другая книга' })
// ❌ MongoServerError: E11000 duplicate key error ... dup key: { _id: 1 }

db.books.insertOne({ id: 1, title: 'A' })
db.books.insertOne({ id: 1, title: 'B' })   // ⚠ пройдёт: id ничем не защищён
```

**Источник:** [MongoDB — Documents, раздел «The _id Field»](https://www.mongodb.com/docs/manual/core/document/) · [MongoDB — db.collection.insertMany()](https://www.mongodb.com/docs/manual/reference/method/db.collection.insertMany/)

---

<a id="p-7"></a>

## П-7. `update()` и `remove()` 🔵

### Как в материале

Слайд 16: удаление — `db.<collection>.remove(<query>)`. Слайд 17: обновление — `db.<collection>.update(<query>,{$set:{field:value}})` или `findOneAndUpdate(filter,update,options)`, который обновляет один документ. Шпаргалка на слайде 38 повторяет `update` и три варианта `remove`.

### Пример из материала

```
db.<collection>.remove(<query>)
db.<collection>.update(<query>,{$set:{field:value}})
db.<collection>.findOneAndUpdate(filter,update,options)

db.<collection>.update(<query>,{$set:{<update>}}])       // шпаргалка — лишняя ]
db.<collection>.remove({})
db.<collection>.remove(<query>,{justOne:true})
```

### В чём несоответствие

1. **`update()` и `remove()` в `mongosh` объявлены устаревшими.** Их заменяют методы с явным количеством: `updateOne`/`updateMany`, `deleteOne`/`deleteMany`. У старых методов количество зависело от опций (`multi`, `justOne`), и это частый источник ошибок.
2. **`findOneAndUpdate` по умолчанию возвращает документ до изменения.** Чтобы получить новую версию, нужна опция `returnDocument: 'after'` (в `mongosh` также `returnNewDocument: true`). Материал этого не говорит.
3. В шпаргалке у `update` лишняя `]`.

### Как правильно

`updateOne`/`updateMany` с операторами обновления; `deleteOne`/`deleteMany`; `findOneAndUpdate` — когда нужен сам документ, с явным `returnDocument`.

### Пример

```js
db.books.updateOne({ _id: 4 }, { $set: { price: 45 } })
db.books.updateMany({ category: 'networking' }, { $inc: { stock: 1 } })
db.books.deleteOne({ _id: 2 })
db.books.deleteMany({ stock: 0 })

db.books.findOneAndUpdate({ _id: 4 }, { $set: { price: 44 } })
// → документ ДО изменения (price: 45)
db.books.findOneAndUpdate({ _id: 4 }, { $set: { price: 43 } }, { returnDocument: 'after' })
// → документ ПОСЛЕ изменения (price: 43)
```

**Источник:** [MongoDB — db.collection.update() (deprecated in mongosh)](https://www.mongodb.com/docs/manual/reference/method/db.collection.update/) · [MongoDB — db.collection.remove() (deprecated in mongosh)](https://www.mongodb.com/docs/manual/reference/method/db.collection.remove/) · [MongoDB — db.collection.findOneAndUpdate()](https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/) · [mongosh — Compatibility Changes with Legacy mongo Shell](https://www.mongodb.com/docs/mongodb-shell/reference/compatibility/)

---

<a id="p-8"></a>

## П-8. Проекция 🟡

### Как в материале

Слайд 18: `find` принимает запрос и проекцию; проекция — объект с полями, которые должны присутствовать, чтобы не передавать лишние данные. На скриншоте проекция `{id:1,data:1}`.

### Пример из материала

```
MongoDB Enterprise > db.collectionName.find({},{id:1,data:1})
{ "_id" : ObjectId("5b0cfa9071bfb59ce955dc01"), "id" : 1 }
{ "_id" : ObjectId("5b0d07fa28c6c4c14bf599f1"), "id" : 2 }
{ "_id" : ObjectId("5b0d07fa28c6c4c14bf599f2"), "id" : 3 }
```

### В чём несоответствие

Описание проекции верное, но пример показывает две вещи, которые материал не объясняет:

1. **`_id` включается по умолчанию** — в выводе он есть, хотя в проекции его нет. Убрать — `_id: 0`.
2. **Несуществующие поля молча игнорируются.** Поля `data` в документах нет (они содержат `test`), и ошибки не возникает. Опечатку в имени поля так легко не заметить.

Не сказано и правило: в одной проекции нельзя смешивать включение (`1`) и исключение (`0`) обычных полей — только `_id` можно исключить при включении других.

### Как правильно

Перечислять реальные поля; `_id: 0`, если он не нужен; не смешивать `1` и `0`.

### Пример

```js
db.books.find({}, { title: 1, price: 1, _id: 0 })   // ✅ только title и price
db.books.find({}, { stock: 0 })                      // ✅ всё, кроме stock
db.books.find({}, { title: 1, stock: 0 })
// ❌ MongoServerError: Cannot do exclusion on field stock in inclusion projection
```

**Источник:** [MongoDB — Project Fields to Return from Query](https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/)

---

<a id="p-9"></a>

## П-9. Сравнение «строк, чисел, дат» 🟡

### Как в материале

Слайды 21–22 описывают `$gt`, `$gte`, `$lt`, `$lte` и говорят, что их можно использовать со строками, числами и датами. На скриншотах условия по числовому полю `id`.

### Пример из материала

```
MongoDB Enterprise > db.collectionName.find({id:{$gt:2}})
{ "_id" : ObjectId("5b0d07fa28c6c4c14bf599f2"), "test" : "data", "id" : 3 }
```

### В чём несоответствие

Примеры верные, но утверждение про типы без оговорок вводит в заблуждение. Операторы сравнения в запросах сравнивают поле только со значением **того же типа** (type bracketing): если в поле число, а в запросе строка, документ не подойдёт — без ошибки. Строки сравниваются посимвольно, поэтому `'10' < '9'`. Типичная ошибка: цена пришла из формы строкой, сохранилась строкой — и фильтр `{ price: { $gt: 40 } }` её не находит.

### Как правильно

Хранить числа числами, даты — типом `Date`; сравнивать со значением того же типа.

### Пример

```js
db.items.insertMany([{ _id: 1, price: 45 }, { _id: 2, price: '45' }])

db.items.find({ price: { $gt: 40 } })     // только _id: 1 — строка '45' с числом не сравнивается
db.items.find({ price: { $gt: '40' } })   // только _id: 2

db.events.find({ sentAt: { $gte: new Date('2026-09-01') } })   // даты — тип Date, не строки
```

**Источник:** [MongoDB — Comparison Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query-comparison/) · [MongoDB — Comparison/Sort Order (BSON types)](https://www.mongodb.com/docs/manual/reference/bson-type-comparison-order/)

---

<a id="p-10"></a>

## П-10. `limit`, `skip`, пагинация 🟡

### Как в материале

Слайды 24–26: `limit(number)` ограничивает количество документов, `skip(number)` пропускает указанное число; пагинация строится из обоих: пропустить «размер страницы × номер страницы» и взять «размер страницы».

### Пример из материала

```
MongoDB Enterprise > db.collectionName.find({test:"data"}).limit(1)
MongoDB Enterprise > db.collectionName.find({test:"data"}).skip(2)

find().skip(no_documents_on_page*page_number)
.limit(no_documents_on_page)
```

### В чём несоответствие

1. **Без `sort` порядок не гарантирован.** «Первый документ» и «пропустить два» зависят от внутреннего порядка хранения, который меняется после обновлений и удалений. Страницы могут повторять и терять документы.
2. **Формула работает для нумерации с нуля.** Если первая страница — номер 1, то `skip(size * (page - 1))`, иначе первая страница пропускается.
3. **Большой `skip` медленный.** Серверу приходится пройти все пропускаемые документы, и чем дальше страница, тем дольше запрос. Для длинных лент используют пагинацию по ключу (range-based).
4. Сортировать нужно по уникальному полю или с добавлением `_id` — иначе порядок документов с одинаковыми значениями не определён.

### Как правильно

`sort` по уникальному ключу + `skip/limit` для небольших наборов; для лент — условие «после последнего показанного».

### Пример

```js
// Страницы с 1: вторая страница по 20
db.books.find().sort({ title: 1, _id: 1 }).skip(20 * (2 - 1)).limit(20)

// По ключу: следующие 20 сообщений старше последнего показанного
db.messages.find({ channelId: 2, sentAt: { $lt: lastShownSentAt } })
  .sort({ sentAt: -1 })
  .limit(20)
```

**Источник:** [MongoDB — cursor.skip() (Pagination Example, Using Range Queries)](https://www.mongodb.com/docs/manual/reference/method/cursor.skip/) · [MongoDB — cursor.sort() (Sort Consistency)](https://www.mongodb.com/docs/manual/reference/method/cursor.sort/)

---

<a id="p-11"></a>

## П-11. Шпаргалка курсора 🔴

### Как в материале

Слайд 39 — шпаргалка методов курсора: количество документов — `db.<collection>.find().count`, ограничение — `limit(<n>)`, пропуск — `skip(<n>)`, сортировка — `sort(<field:value>)` со значением 1 или -1.

### Пример из материала

```
db.<collection>.find().count
db.<collection>.find().sort(<field:value>)
```

### В чём несоответствие

1. **`count` без скобок** — не вызов метода, а сама функция: оболочка выведет её описание вместо числа.
2. **`count()` устарел.** В `mongosh` метод курсора `count()` объявлен устаревшим; для точного подсчёта по фильтру — `countDocuments(filter)`, для быстрой оценки размера коллекции — `estimatedDocumentCount()`.
3. **`sort` принимает объект:** `sort({ field: 1 })`, а не `sort(field:value)`.

### Как правильно

```js
db.books.countDocuments({ category: 'programming' })
db.books.find().sort({ price: -1 })
```

### Пример

```js
db.books.countDocuments({})                 // точное число всех документов
db.books.countDocuments({ stock: 0 })       // сколько книг нет на складе
db.books.estimatedDocumentCount()           // быстро, по метаданным коллекции

db.books.find().sort({ price: -1, _id: 1 }) // объект: поле → направление
```

**Источник:** [MongoDB — db.collection.countDocuments()](https://www.mongodb.com/docs/manual/reference/method/db.collection.countDocuments/) · [MongoDB — cursor.count() (deprecated in mongosh)](https://www.mongodb.com/docs/manual/reference/method/cursor.count/) · [MongoDB — cursor.sort()](https://www.mongodb.com/docs/manual/reference/method/cursor.sort/)

---

<a id="p-12"></a>

## П-12. Шпаргалка логических операторов 🔴

### Как в материале

Слайд 41 — таблица логических операторов: AND, OR, NOT, NOR с командами.

### Пример из материала

```
AND   db.<collection>.find({$or:[<expression1>,<expression2>]})
OR    db.<collection>.find({$and:[<expression1>,<expression2>]})
NOT   db.<collection>.find({$not:{<expression1>}})
NOR   db.<collection>.find({$nor:[<expression1>,<expression2>]}})
```

### В чём несоответствие

1. **AND и OR перепутаны:** `$or` — хотя бы одно условие, `$and` — все.
2. **`$not` не бывает на верхнем уровне.** Это оператор отрицания **другого оператора** для конкретного поля: `{ field: { $not: { $gt: 5 } } }`. Запись `find({ $not: {...} })` вызовет ошибку «unknown top level operator». Чтобы отрицать несколько условий целиком, используют `$nor`.
3. В строке `$nor` лишняя `}` — синтаксическая ошибка.

Слайд 23 с примерами `$or` при этом верен.

### Как правильно

```js
{ $and: [cond1, cond2] }            // все
{ $or: [cond1, cond2] }             // хотя бы одно
{ $nor: [cond1, cond2] }            // ни одно
{ field: { $not: { $gt: 5 } } }     // отрицание оператора поля
```

### Пример

```js
db.books.find({ $or: [{ category: 'programming' }, { price: { $lt: 40 } }] })
db.books.find({ $and: [{ price: { $gte: 40 } }, { price: { $lte: 60 } }] })   // то же: { price: { $gte: 40, $lte: 60 } }
db.books.find({ price: { $not: { $gt: 50 } } })   // цена не больше 50 (и документы без price)
db.books.find({ $nor: [{ category: 'programming' }, { stock: 0 }] })

// ❌ db.books.find({ $not: { price: { $gt: 50 } } })   — unknown top level operator: $not
```

**Источник:** [MongoDB — Logical Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query-logical/) · [MongoDB — $not](https://www.mongodb.com/docs/manual/reference/operator/query/not/)

---

<a id="p-13"></a>

## П-13. Поиск по вложенному документу 🟡

### Как в материале

Слайд 33: вложенные документы можно искать, передав в запрос подзапрос для поля. На скриншоте поиск `find({data:{"child":"data"}})` и поиск по ссылке `find({data:{"child":ObjectId(...)}})`.

### Пример из материала

```
MongoDB Enterprise > db.parent.find({data:{"child":"data"}})
{ "_id" : ObjectId("5b0e5a19be60db679ff7abb4"), "data" : { "child" : "data" }, "id" : 1 }
```

### В чём несоответствие

Запись `{ data: { child: "data" } }` — это сравнение **всего** вложенного документа, и оно требует точного совпадения: тех же полей, тех же значений и **того же порядка полей**. Если у `data` появится второе поле (`{ child: "data", age: 5 }`) или поля будут в другом порядке, документ не найдётся. Материал этого не говорит, и пример выглядит как «поиск по полю child».

Для условия по конкретному вложенному полю используют **точечную нотацию** — путь к полю в кавычках. Она работает независимо от остальных полей и позволяет применять операторы.

### Как правильно

`find({ 'data.child': 'data' })`.

### Пример

```js
db.parent.insertOne({ _id: 10, data: { child: 'data', age: 5 } })

db.parent.find({ data: { child: 'data' } })          // ⚠ не найдёт _id: 10 — у data есть ещё age
db.parent.find({ 'data.child': 'data' })              // ✅ найдёт
db.parent.find({ 'data.age': { $gte: 3 } })           // ✅ операторы по вложенному полю
db.parent.updateOne({ _id: 10 }, { $set: { 'data.age': 6 } })   // точечная нотация и в обновлениях
```

**Источник:** [MongoDB — Query on Embedded/Nested Documents](https://www.mongodb.com/docs/manual/tutorial/query-embedded-documents/)

---

<a id="p-14"></a>

## П-14. «Вложенные документы → нужна SQL», «x2», ручные join 🟡

### Как в материале

Слайд 30: если приходится часто использовать вложенные документы, приложению, вероятно, больше подходит реляционная база. Слайд 32: ссылка на документ другой коллекции через хранение его `_id`; на скриншоте ссылка указывает на документ той же коллекции `parent`. Слайд 34: соединение коллекций нужно выполнять вручную рекурсивной функцией в Node.js; это «x2-проблема», производительность «логарифмически» падает с ростом документов, поэтому для соединений следует использовать SQL-базу.

### Пример из материала

```
MongoDB Enterprise > db.parent.insertOne({"data":{"child":ObjectId("5b0e5a19be60db679ff7abb4")},"id":1})
```

### В чём несоответствие

1. **Встраивание — рекомендуемый подход**, а не признак того, что нужна SQL-база. Документация MongoDB прямо советует встраивать данные, которые читаются вместе; операция над одним документом ещё и атомарна ([8_1 §5.4](8_1-nosql-konspekt.md#s5-4)).
2. **Соединение коллекций есть на сервере** — стадия агрегации `$lookup` (с MongoDB 3.2). Рекурсивные функции в Node.js для этого не нужны.
3. **«x2-проблема», которая «логарифмически замедляется»** — внутренне противоречиво (квадратичный и логарифмический рост — противоположные вещи) и не подкреплено. Стоимость соединения зависит от объёма данных, индексов на поле соединения и формы запроса — как и в SQL.
4. Заголовок слайда 32 говорит о «других коллекциях», а пример ссылается на документ той же коллекции `parent` — ссылки возможны в обе стороны, но пример не иллюстрирует заголовок.

### Как правильно

Встраивать то, что читается вместе и ограничено; ссылаться на то, что растёт или нужно отдельно; соединять через `$lookup`. Выбор базы — по запросам и требованиям ([8_1 §4.4](8_1-nosql-konspekt.md#s4-4)), а не по наличию связей.

### Пример

```js
// Ссылки: книги ссылаются на авторов
db.authors.insertOne({ _id: 1, name: 'Anna Petrova' })
db.books.insertOne({ _id: 100, title: 'Node Internals', authorIds: [1] })

// Соединение на сервере: книга вместе с авторами
db.books.aggregate([
  { $match: { _id: 100 } },
  { $lookup: { from: 'authors', localField: 'authorIds', foreignField: '_id', as: 'authors' } },
])
// → { _id: 100, title: 'Node Internals', authorIds: [1], authors: [{ _id: 1, name: 'Anna Petrova' }] }

// Поле соединения в той коллекции, где ищут совпадения (foreignField), должно быть проиндексировано;
// для _id индекс есть всегда
```

**Источник:** [MongoDB — Embedded Data](https://www.mongodb.com/docs/manual/data-modeling/embedding/) · [MongoDB — Referenced Data](https://www.mongodb.com/docs/manual/data-modeling/referencing/) · [MongoDB — $lookup](https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/)

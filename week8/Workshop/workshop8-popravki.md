# Workshop 8 — каталог книг: поправки и уточнения к заданию

**Источник:** `Workshop 8.docx` (по фактическому формату это PDF на одну страницу)  
**Проверено:** 24 сентября 2026 года.  
**Связанные файлы:** [план работы](workshop8-konspekt.md) · [примеры](workshop8-primery.md) · [вопросы](workshop8-voprosy.md) · [ответы](workshop8-otvety.md)

<a id="p-1"></a>

## П-1. Задания 1–2 — запуск сервера и shell

**Исходник:** предлагает установить MongoDB, запустить `mongod`, затем открыть клиент командой `mongo`.  
**Статус:** оболочка устарела, детали установки зависят от версии и ОС.  
**Исправление:** запускай установленную службу или процесс согласно текущей официальной инструкции и подключайся через `mongosh`. Не копируй старые команды управления каталогами без проверки.

**Источники:** [MongoDB installation](https://www.mongodb.com/docs/manual/installation/) · [mongosh](https://www.mongodb.com/docs/mongodb-shell/)

<a id="p-2"></a>

## П-2. Задания 3–4 — создание базы и коллекции

`use bookStore` переключает контекст на имя базы; база появляется при создании коллекции или первой записи. MongoDB может создать коллекцию автоматически при первой вставке, но явный `db.createCollection('books')` подходит как учебный шаг.

**Источник:** [mongosh Run Commands](https://www.mongodb.com/docs/mongodb-shell/run-commands/)

<a id="p-3"></a>

## П-3. Задание 4 — старые команды и точность фильтра

Выполняй удаление через `deleteOne(filter)` и обновление через `updateOne(filter, {$set: ...})`. Это современные методы вместо старых `remove()` и `update()`. Перед изменением найди тот же фильтр через `find()`. Пустой фильтр в `deleteMany({})` удалит все книги.

**Источники:** [MongoDB CRUD](https://www.mongodb.com/docs/manual/crud/) · [mongosh compatibility](https://www.mongodb.com/docs/mongodb-shell/reference/compatibility/)

<a id="p-4"></a>

## П-4. Задание 4 — highest price, count и projection

- Максимум: `find().sort({ price: -1 }).limit(1)`. При равных максимальных значениях запрос ограничит ответ одной книгой.
- Количество: `countDocuments({})`, а не устаревающий `count()`.
- Только имя и цена: `find({}, { name: 1, price: 1, _id: 0 })`; `_id` нужно исключить явно.

**Источник:** [countDocuments](https://www.mongodb.com/docs/manual/reference/method/db.collection.countdocuments/)

<a id="p-5"></a>

## П-5. Имя файла

Файл с расширением `.docx` по фактическому содержимому является одностраничным PDF. В материалах он называется **Workshop 8** по содержанию, а не по расширению.

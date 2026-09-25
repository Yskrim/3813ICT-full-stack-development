# Workshop 8 — каталог книг: полный пример команд

**Источник:** `Workshop 8.docx` (фактически PDF-документ)  
**Связанные файлы:** [план работы](workshop8-konspekt.md) · [вопросы](workshop8-voprosy.md) · [ответы](workshop8-otvety.md) · [поправки](workshop8-popravki.md)

Этот комплект команд показывает все девять действий из задания в одном воспроизводимом порядке. Названия книг являются примерами реальных книжных названий; цену и описание используй как учебные значения. Для сдачи задание просит найти названия книг самостоятельно, поэтому проверь и запиши выбранные названия.

## 1. Выбрать базу и создать коллекцию

```js
use bookStore
db.createCollection('books')
```

## 2. Добавить шесть книг в четыре категории

```js
db.books.insertMany([
  {
    _id: 'book-01',
    name: 'JavaScript: The Good Parts',
    price: 45.00,
    description: 'JavaScript programming book (sample description)',
    category: 'programming'
  },
  {
    _id: 'book-02',
    name: 'Node.js Design Patterns',
    price: 70.00,
    description: 'Node.js application design book (sample description)',
    category: 'programming'
  },
  {
    _id: 'book-03',
    name: 'Computer Networking: A Top-Down Approach',
    price: 75.00,
    description: 'Computer networking book (sample description)',
    category: 'networking'
  },
  {
    _id: 'book-04',
    name: 'Learning Web Design',
    price: 48.00,
    description: 'Web design book (sample description)',
    category: 'webdesign'
  },
  {
    _id: 'book-05',
    name: 'Database Systems: The Complete Book',
    price: 64.00,
    description: 'Database systems book (sample description)',
    category: 'databases'
  },
  {
    _id: 'book-06',
    name: 'Modern Operating Systems',
    price: 91.00,
    description: 'Operating systems book (sample description)',
    category: 'Operating systems'
  }
])
```

Проверь вставку:

```js
db.books.find().toArray()
```

## 3. Удалить одну книгу

Сначала найди документ по `_id`, затем удали только его:

```js
db.books.find({ _id: 'book-06' })
db.books.deleteOne({ _id: 'book-06' })
```

## 4. Обновить цену одной книги

```js
db.books.updateOne(
  { _id: 'book-02' },
  { $set: { price: 74.99 } }
)
```

Подтверди результат:

```js
db.books.find({ _id: 'book-02' })
```

## 5. Показать все оставшиеся книги

```js
db.books.find().toArray()
```

После вставки шести и удаления одной записи ожидается пять документов.

## 6. Отсортировать по названию

```js
db.books.find().sort({ name: 1 }).toArray()
```

Значение `1` задаёт возрастающий порядок. Регистр и правила сортировки могут влиять на точный порядок строк.

## 7. Найти книги одной категории

```js
db.books.find({ category: 'programming' }).toArray()
```

## 8. Найти книгу с максимальной ценой

```js
db.books.find().sort({ price: -1 }).limit(1).toArray()
```

Для этих учебных данных максимум — `Node.js Design Patterns` с примерной ценой `74.99`: цену обновили, а книга за `91.00` уже удалена. Если меняешь набор или цены, пересчитай ожидаемый результат.

## 9. Посчитать книги

```js
db.books.countDocuments({})
```

Ожидаемое значение после указанных действий — `5`.

## 10. Показать только имя и цену

```js
db.books.find({}, { name: 1, price: 1, _id: 0 }).toArray()
```

`_id: 0` нужен потому, что MongoDB иначе включает `_id` в проекцию по умолчанию.

Передай преподавателю Word-документ с командами и фактическими результатами из своей базы. Не вставляй ожидаемый результат вместо собственного, если вносил изменения в данные.

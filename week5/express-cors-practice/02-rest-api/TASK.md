# Task 2 — REST API (CRUD)

Цель: реализовать полноценный REST API для ресурса `books` поверх массива в
памяти (без базы данных — она появится позже в курсе).

Структура книги:

```js
{ id: number, title: string, author: string, year: number }
```

## Требования

Роуты вынести в `routes/books.js` как функцию `module.exports = function(app) {...}`
(так же, как в `week3/Workshop/routes.js`) и подключить её в `server.js`
через `require("./routes/books.js")(app)`.

| Метод  | Путь            | Действие                                             | Код ответа |
|--------|-----------------|-------------------------------------------------------|-----------|
| GET    | `/api/books`    | вернуть все книги                                     | 200 |
| GET    | `/api/books/:id`| вернуть одну книгу по id                              | 200 / 404 |
| POST   | `/api/books`    | добавить книгу (тело: title, author, year)            | 201 |
| PUT    | `/api/books/:id`| обновить книгу целиком                                | 200 / 404 |
| DELETE | `/api/books/:id`| удалить книгу                                         | 204 / 404 |

Дополнительно:

- `app.use(express.json())` должен стоять до роутов — иначе `req.body` будет
  `undefined`.
- Если POST/PUT прислали неполные данные (нет `title`) — вернуть `400` с
  `{ "error": "title is required" }`.
- id генерировать как `Date.now()` или инкрементом счётчика — на выбор.

## Проверка

```bash
curl http://localhost:3000/api/books
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Dune","author":"Frank Herbert","year":1965}'
curl -X PUT http://localhost:3000/api/books/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Dune","author":"Frank Herbert","year":1965}'
curl -X DELETE http://localhost:3000/api/books/<id> -i
curl -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{}'  # ожидаем 400
```

## Вопрос на понимание

Почему при удалении хорошим тоном считается возвращать `204 No Content`, а не
`200` с телом ответа? И почему `POST`, создавший ресурс, обычно возвращает
`201`, а не `200`?

Все коды обозначают что-то конкретное, первая цифра означает категорию, последняя, что именно произошло. Это удобно для дебага, потому что сразу по коду понятно, какая операция выполнялась.

200 = GET === 'OK' -- операция выполнена 
201 = POST === 'Created' -- запись создана 
204 = DELETE === 'No Content' -- запись удалена

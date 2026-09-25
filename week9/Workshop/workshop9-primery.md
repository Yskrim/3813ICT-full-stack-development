# Workshop 9. План и примеры реализации

**Связанные файлы:** [конспект задания](workshop9-konspekt.md) · [вопросы](workshop9-voprosy.md) · [ответы](workshop9-otvety.md) · [заметки](workshop9-popravki.md)

## 1. Зафиксируй схему

Сначала договорись, какие свойства ожидает каждая часть приложения. Одна запись может выглядеть так:

```js
{
  id: 1001,                    // прикладной уникальный номер
  name: 'Notebook',
  description: 'A5, lined',
  price: 4.5,
  units: 20
}
```

MongoDB добавит `_id` типа ObjectId. Сохраняй различие: числовой `id` из задания и MongoDB `_id` не взаимозаменяемы.

## 2. Проверяй функции по одной

Удобная последовательность: добавить документ → прочитать его → изменить одно поле → удалить его. Для чтения по `_id` преобразуй URL-строку в `ObjectId`; для вывода списка заверши курсор через `toArray()`.

```js
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const products = client.db('workshop9').collection('products');
await products.createIndex({ id: 1 }, { unique: true });

const inserted = await products.insertOne({
  id: 1001, name: 'Notebook', description: 'A5, lined', price: 4.5, units: 20
});
const item = await products.findOne({ _id: inserted.insertedId });
console.log(item);
```

В приложении серверного типа подключай клиента один раз на старте и переиспользуй; не открывай и не закрывай соединение для каждого запроса.

## 3. Подключай маршруты постепенно

Сначала реализуй `GET /api/products`, затем `POST`, `PATCH /api/products/:id` и `DELETE /api/products/:id`. Проверяй каждый маршрут отдельно до того, как подключать Angular. Этот порядок помогает быстро понять, на каком слое появилась ошибка.

| Операция | Метод и путь | Ожидаемый итог |
|---|---|---|
| Список | `GET /api/products` | Массив документов |
| Создание | `POST /api/products` | `201` и новый документ |
| Изменение | `PATCH /api/products/:id` | Обновлённый статус/объект |
| Удаление | `DELETE /api/products/:id` | `204` или ясный JSON-ответ |

## 4. Затем подключи Angular

Создай сервис с методами `list`, `add`, `update`, `remove`. Компонент списка вызывает `list()` при инициализации; формы передают значения в `add()` или `update()`. После успешного удаления удали запись из массива либо запроси список повторно.

```ts
list() {
  return this.http.get<Product[]>('/api/products');
}

remove(id: string) {
  return this.http.delete<void>(`/api/products/${id}`);
}
```

Если редактируешь существующий товар, надёжнее передавать `_id` маршрутом и получать актуальные данные с сервера. `localStorage` может быть пустым или хранить устаревшую версию.

## 5. Подготовь короткую демонстрацию

Покажи полный цикл: список → добавление → изменение → удаление. Перед запуском проверь, что API и клиент используют одинаковый адрес и порты (или настроен proxy), а MongoDB подключена к отдельной учебной базе.

Это план, а не проверенный запуск твоего проекта. Для корректного результата адаптируй синтаксис к структуре и версиям пакетов в репозитории.

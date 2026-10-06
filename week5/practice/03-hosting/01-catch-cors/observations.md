### Часть А - простой запрос

|                 | fetch ping                                                                    |
| --------------- | ----------------------------------------------------------------------------- |
| browser console | {pong: true}                                                                  |
| network         | name:ping; status:304; type:fetch; initiator: VM465:1; Size:0.2kB; Time: 7ms; |
| server console  | "2026-10-04T08:47:20.337Z GET /api/ping Origin: -"                            |

Результат запроса через консоль зависит от того, на каком пути я нахожусь.

- Если я на `http://localhost:3000`, то выходит ошибка, потому что этот путь не добавлен в Экспресс.
- Если я на одном из путей, который описан в сервере, сначала выполняется он, потом выполняется мой запрос из консоли. Всего два запроса.
- Запрос `http://localhost:3000/api/health` доходит до сервера и получает статус 200.
- Запрос из консоли не доходит до сервера, подтягивается из кеша браузера, статус 304.

### Часть Б - запрос с preflight

1. Запрос из http://localhost:4200/ 
  
  REQUEST:
  ```js
    await fetch("http://localhost:3000/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "hi" }),
    }).then((r) => r.json());
  ```
  RESPONSE:
  - Возвращает Ошибку корс, ориджин не разрешается.
  - Все остальные методы тоже выдают ошибку, потому что им не с чем больше работать.

2. Запрос из http://localhost:3000/
  
  REQUEST:
  ```js
    await fetch("http://localhost:3000/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "hi" }),
    }).then((r) => r.json());
  ```

  RESPONSE:
  ```js
    {youSent: {…}}
    youSent : {text: 'hi'}
    [[Prototype]] : Object
  ```
  - Запрос выполняется, нет ошибки корс. Консоль отправляет респонс с содержимым запроса.

### Часть В

1. Запрос в консоли:
  ```bash
    curl http://localhost:3000/api/ping
    curl -X POST http://localhost:3000/api/echo -H "Content-Type: application/json" -d '{"text":"hi"}'
  ```

  Ответ в консоли:
  ```json
    {"pong":true}{"youSent":{"text":"hi"}}%  
  ```
  - Ошибки корс нет, потому что запрос выполнился не через браузер, а через консоль.
  - Нет проверки корс, потому что выполняется запрос не через браузер, а корс относится только к браузеру.

  Я идиот, в условии написано, что у эхо метод - ПОСТ, а я написал его как ГЕТ, понятно почему ошибка метода.

### Часть Г

- Добавил корс как в конспекте
  ```js
    app.use(cors({
        origin: 'http://localhost:4200'
    }));
  ```
  - Пока без заголовков и методов, просто пустил этот ориджин на сервер
  - corsOptions задает как раз допустимые заголовки и методы, для внешнего ориджина.
  - так же раньше уже делал подключение корса непосредственно на эндпонте, а не как мидлварь.

1. Запрос из части А от `http://localhost:4200`:
  
  REQUEST
  ```js
  await fetch('http://localhost:3000/api/ping').then((r) => r.json());
  ```
  
  RESPONSE:
  ```js
  {pong: true}
  ```
  - Корс теперь пропускает второй ориджин для всех запросов.
  - Запрос выполняется, потому что эндпоинт на сервере описан.

2. Запрос с preflight от `http://localhost:4200`:
  
  - preflight == предварительный запрос OPTIONS, который браузер шлет сам до настоящего запроса с методом. Так проверяется, может ли запрос вообще выполниться, прежде чем его отправить.

  REQUEST:
  ```js
    await fetch("http://localhost:3000/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "hi" }),
    }).then((r) => r.json());
  ```

  RESPONSE:
  ```js
    {youSent: {…}}
    youSent : {text: 'hi'}
    [[Prototype]] : Object 
  ```
  - Все работает, корс разрешает Ангулару делать запросы на сервер и читать ответы.
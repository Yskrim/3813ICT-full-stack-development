# 6_2 — Promises and async functions: примеры

**Курс:** 3813ICT, неделя 6  
**Предыдущие темы:** [6.0 — Reactive Programming](6_0-reactive-programming-konspekt.md) · [6.1 — Observables](6_1-observables-konspekt.md)  
**Связанные файлы:** [конспект](6_2-promises-async-konspekt.md) · [поправки](6_2-promises-async-popravki.md) · [вопросы](6_2-promises-async-voprosy.md) · [ответы](6_2-promises-async-otvety.md)

Как мы уже знаем из [6.1](6_1-observables-konspekt.md#s4), Observable подходит для последовательности значений. В этих примерах мы решаем другой сценарий: получить один результат, обработать возможную ошибку и, если нужно, передать итог в Observable.

<a id="ex-1"></a>

## Пример 1 — Получить JSON с `fetch` и Promise-цепочкой

Начнём с варианта через `.then()`. Здесь каждый шаг использует результат предыдущего: HTTP-ответ → проверка статуса → разобранный JSON → вывод.

```js
function loadMessages() {
  return fetch('/api/messages')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((messages) => {
      console.log('Сообщения:', messages);
      return messages;
    });
}

loadMessages().catch((error) => {
  console.error('Загрузка не удалась:', error);
});
```

Порядок работы:

1. `fetch()` возвращает Promise с HTTP `Response`.
2. Первый обработчик проверяет `response.ok`, потому что 404/500 сами по себе не вызывают rejection.
3. `response.json()` возвращает Promise; `return` связывает его с цепочкой.
4. Следующий обработчик получает уже разобранные сообщения.
5. `.catch()` обрабатывает ошибку сети, статуса или разбора JSON в месте вызова.

<a id="ex-2"></a>

## Пример 2 — Та же загрузка через `async`/`await`

Теперь выразим те же зависимости без вложенных callback-функций. Сравни оба примера: задача и проверки совпадают, меняется синтаксис.

```js
async function loadMessages() {
  try {
    const response = await fetch('/api/messages');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const messages = await response.json();
    console.log('Сообщения:', messages);
    return messages;
  } catch (error) {
    console.error('Загрузка не удалась:', error);
    throw error;
  }
}

loadMessages().catch(() => {
  // Здесь приложение может показать сообщение об ошибке в интерфейсе.
});
```

`await` приостанавливает только выполнение `loadMessages`. Ошибка от `fetch`, от проверки статуса или чтения JSON попадает в `catch`. Сама `loadMessages()` возвращает Promise, поэтому код, которому нужен результат, должен тоже его дождаться или подключить `.then()`.

<a id="ex-3"></a>

## Пример 3 — Последовательное и параллельное ожидание

Слайды показывают последовательные `await`. Это правильный подход, когда второй результат зависит от первого. Посмотрим также на независимые запросы, чтобы не ждать их без причины.

```js
async function loadDashboard() {
  // Профиль и настройки не зависят друг от друга: запускаем вместе.
  const [profile, settings] = await Promise.all([
    loadProfile(),
    loadSettings(),
  ]);

  // Каналы зависят от profile.id: этот запрос начинается после профиля.
  const channels = await loadChannels(profile.id);

  return { profile, settings, channels };
}
```

`Promise.all()` fulfilled, когда fulfilled все входные Promise; если один из них rejected, возвращаемый Promise также rejected. Здесь сначала параллельно получаем профиль и настройки, а потом запрашиваем каналы по id профиля.

<a id="ex-4"></a>

## Пример 4 — Преобразовать Promise в Observable

Наконец свяжем новую тему с Observable из [6.1](6_1-observables-konspekt.md#s4). Это полезно, если окружающий код проекта уже использует RxJS, но конкретный API возвращает Promise.

```ts
import { from } from 'rxjs';

const messagesPromise = fetch('/api/messages').then(async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
});

from(messagesPromise).subscribe({
  next(messages) {
    console.log('Сообщения:', messages);
  },
  error(error) {
    console.error('Ошибка загрузки:', error);
  },
  complete() {
    console.log('Promise выдал значение; Observable завершён');
  },
});
```

Promise передаёт в `from()` уже разобранный массив сообщений, поэтому Observable выдаёт массив одним `next`, а затем `complete`. Если fetch, проверка статуса или чтение JSON завершатся ошибкой, сработает `error`. В следующем материале о sockets Observable будет строиться прямо вокруг повторяющихся событий.

## Попробуй сам

Когда порядок шагов понятен, попробуй применить те же правила к своему API:

1. Замени `/api/messages` на действующий endpoint проекта.
2. Добавь обработку HTTP 404 отдельно от сетевой ошибки.
3. Верни массив сообщений из функции и отобрази, где вызывающий код должен дождаться Promise.
4. Передай Promise этого endpoint в `from()` и объясни, сколько `next` ожидаешь получить.

Код не запускался; указанный поток выполнения разобран по последовательности Promise-вызовов.

# 4.3 — Сообщения: страницы и перехватчик

**Тема:** HTTP-запросы (5_4)
**Место в теме:** третье из трёх, рабочий кусок Phase 2
**Время:** 70–90 минут
**Опирается на:** [4.2 — Группы через HttpClient](../02-group-crud/README.md), [2.3 — AuthService и гарды ролей](../../02-services/03-auth-guards/README.md)
**Дальше:** [5.1 — Разминка control flow](../../05-templates/01-control-flow/README.md). Лента отсюда получит нормальный вид в [5.2](../../05-templates/02-message-feed/README.md)

## Задача

У сообщений две особенности, которых нет у групп. Первая — их много: канал может накопить тысячи сообщений, и загружать их все разом нельзя. Поэтому сервер отдаёт их **страницами**: сначала самые новые, а по кнопке «Загрузить более старые» — следующую порцию. Номер страницы и размер порции передаются параметрами в адресе: `?page=2&limit=10`.

Вторая — у сообщения есть автор, и сервер должен знать, кто отправляет. Писать заголовок с пользователем в каждом запросе вручную утомительно и легко забыть. Для таких случаев есть **перехватчик** (interceptor): функция, через которую проходит каждый запрос приложения. Он сам добавит заголовок `x-user-id`, а если сервер ответит «не знаю тебя» (`401`), сам разлогинит пользователя.

Учти честно: `id` пользователя в заголовке легко подделать. Это учебная замена настоящей авторизации — механика перехватчика от этого не меняется.

## Зачем это задание

Постраничная загрузка и перехватчик понадобятся в Phase 2 почти наверняка: сообщений в канале много, а права на действия сервер должен проверять по пользователю. Заодно ты потренируешь `HttpParams` и неизменяемые объекты запроса.

## Что проверяет

1. Ты передаёшь параметры запроса через `HttpParams` (или объект) и помнишь про неизменяемость.
2. Ты склеиваешь порции данных в правильном порядке и понимаешь, когда данных больше нет.
3. Ты пишешь функциональный перехватчик: клонируешь запрос с заголовком и обрабатываешь ошибку.
4. Ты используешь `AuthService` из 2.3 вне компонентов.

## Старт

Код сервера дан целиком. Создай `server/routes/messages.js`:

```js
const express = require('express');
const router = express.Router();

const NAMES = { 1: 'super', 2: 'anna', 3: 'ben' };

// 45 тестовых сообщений в канале 1 (general); в остальных каналах пусто
let messages = Array.from({ length: 45 }, (_, i) => {
  const authorId = i % 3 === 0 ? 2 : 3;
  return {
    id: i + 1,
    channelId: 1,
    type: i % 10 === 0 ? 'system' : 'text',
    authorId,
    author: NAMES[authorId],
    text: i % 10 === 0 ? `${NAMES[authorId]} присоединился к каналу` : `Сообщение №${i + 1}`,
    sentAt: new Date(Date.now() - (45 - i) * 60_000).toISOString(),
  };
});
let nextId = 46;

// GET /api/channels/:channelId/messages?page=1&limit=10
// Страница 1 — самые НОВЫЕ сообщения; внутри страницы — от старых к новым
router.get('/:channelId/messages', (req, res) => {
  const channelId = Number(req.params.channelId);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const all = messages.filter((m) => m.channelId === channelId);
  const end = all.length - (page - 1) * limit;
  const start = Math.max(0, end - limit);
  res.json({ items: end > 0 ? all.slice(start, end) : [], total: all.length, page, limit });
});

// POST /api/channels/:channelId/messages — нужен заголовок x-user-id
router.post('/:channelId/messages', (req, res) => {
  const userId = Number(req.get('x-user-id'));
  if (!NAMES[userId]) return res.status(401).json({ error: 'Not logged in' });
  const text = (req.body?.text ?? '').trim();
  if (!text) return res.status(400).json({ error: 'Text is required' });
  const message = {
    id: nextId++,
    channelId: Number(req.params.channelId),
    type: 'text',
    authorId: userId,
    author: NAMES[userId],
    text,
    sentAt: new Date().toISOString(),
  };
  messages.push(message);
  res.status(201).json(message);
});

module.exports = router;
```

Подключение в `server.js` (до `/api` 404):

```js
app.use('/api/channels', require('./routes/messages'));
```

В Angular:

```bash
ng g s services/message
ng g interceptor interceptors/auth
ng g c components/channel-messages
```

Модели для клиента:

```ts
export interface Message {
  id: number;
  channelId: number;
  type: 'text' | 'system';
  authorId: number;
  author: string;
  text: string;
  sentAt: string;
}

export interface MessagePage {
  items: Message[];
  total: number;
  page: number;
  limit: number;
}
```

`ChannelMessagesComponent` размести на странице каналов из 2.2, под шапкой канала: он показывает сообщения **выбранного** канала.

## Новое в этом задании: перехватчик

Перехватчик — функция, через которую проходит каждый запрос `HttpClient`. Вот простейший, который только пишет в консоль, чтобы увидеть механику:

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const logInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('→', req.method, req.url);   // запрос уходит
  return next(req);                          // передать дальше — следующему перехватчику или на сервер
};

// app.config.ts
// provideHttpClient(withInterceptors([logInterceptor]))
```

Запрос (`req`) неизменяем: чтобы добавить заголовок, его клонируют — `req.clone({ setHeaders: { ... } })`. Внутри перехватчика работает `inject()`.

## Что сделать

**Часть А — `MessageService`**

1. `getPage(channelId, page, limit)` — запрос с параметрами `page` и `limit`.
2. `send(channelId, text)` — отправить сообщение.

**Часть Б — лента с порциями**

1. При выборе канала загружается страница 1 (10 сообщений).
2. Кнопка «Загрузить более старые» загружает следующую страницу и добавляет её **перед** уже показанными.
3. Когда загружено всё (`total`), кнопка исчезает.
4. При смене канала лента начинается заново.
5. Внизу — поле и кнопка «Отправить»; отправленное сообщение появляется в конце ленты.

Вид ленты пока простой — список строк «автор: текст». Красиво оформишь в 5.2.

**Часть В — перехватчик**

1. `authInterceptor` добавляет `x-user-id` с `id` текущего пользователя из `AuthService`, если пользователь вошёл.
2. При ответе `401` — выход из аккаунта и переход на `/login`; ошибка всё равно передаётся дальше.
3. Подключи его в `app.config.ts`.

**Часть Г — проверка**

1. Отправь сообщение от anna, потом от ben — автор правильный.
2. Временно убери перехватчик из `app.config.ts` и отправь сообщение. Что произошло? Верни.
3. В Network найди запрос страницы 2 — как выглядит адрес?

## Критерии готовности

- [ ] Страницы подгружаются в правильном порядке, без дублей, кнопка исчезает в конце
- [ ] Смена канала сбрасывает ленту; в пустом канале видно, что сообщений нет
- [ ] Заголовок `x-user-id` добавляется ко всем запросам вошедшего пользователя без правок в сервисах
- [ ] Без перехватчика отправка получает `401`, и приложение отправляет на вход
- [ ] Ты можешь ответить: почему `params.set('page', 2)` без присваивания не работает?
- [ ] Ты можешь ответить: почему заголовок добавляется через `clone`, а не изменением `req`?
- [ ] Ты можешь ответить: почему в перехватчике после обработки `401` ошибку нужно передать дальше?

## Материалы

- [Конспект 5_4 §8 — заголовки и параметры](../../materials/5_4-http-requests-konspekt.md#s8)
- [Поправка 5_4 П-5 — неизменяемые HttpHeaders и HttpParams](../../materials/5_4-http-requests-popravki.md#p-5)
- [Конспект 5_4 §9 — обработка ошибок](../../materials/5_4-http-requests-konspekt.md#s9)
- [Конспект 5_2 §4.2 — inject() в функциях](../../materials/5_2-services-konspekt.md#s4-2)

## Наводящие вопросы (если застрял)

- Как понять, что загружены все сообщения, зная `total` и сколько уже показано?
- Как добавить порцию **в начало** массива, получив новый массив?
- Как в компоненте узнать, что выбранный канал сменился? Проще всего передать id канала во входной параметр из страницы каналов и реагировать в `ngOnChanges` — так же, как черновик в [5_1, пример 2](../../materials/5_1-data-persistence-primery.md#ex-2).
- Какой оператор RxJS перехватывает ошибку, не прерывая её передачу дальше?

## Типичные ловушки

- Новая порция добавлена в конец — старые сообщения оказываются под новыми.
- При смене канала старые сообщения остаются в ленте.
- Перехватчик читает пользователя напрямую из хранилища, а не из `AuthService`.
- Перехватчик «глотает» ошибку `401` — компонент ждёт ответа вечно.

## Сверка после попытки

- [Примеры 5_4, пример 3 — перехватчик запросов](../../materials/5_4-http-requests-primery.md#ex-3)
- [Примеры 5_4, пример 1 — параметры запроса](../../materials/5_4-http-requests-primery.md#ex-1)

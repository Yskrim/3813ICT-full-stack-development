# 5_4 — HTTP-запросы: ответы

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_4-http-requests-konspekt.md) · [поправки](5_4-http-requests-popravki.md) · [примеры](5_4-http-requests-primery.md) · [вопросы](5_4-http-requests-voprosy.md)

---

## A. HTTP и HttpClient

<a id="a-1"></a>

### 1. Запрос и ответ

**Ответ:** запрос — метод, адрес (с параметрами после `?`), заголовки, тело. Ответ — код состояния, заголовки, тело (обычно JSON).

**Подробнее:** [Конспект §1.1](5_4-http-requests-konspekt.md#s1-1) · [← вопрос](5_4-http-requests-voprosy.md#q-1)

<a id="a-2"></a>

### 2. Коды состояния

**Ответ:** `1xx` информационные, `2xx` успех, `3xx` перенаправление, `4xx` ошибка клиента, `5xx` ошибка сервера. `201 Created` — ресурс создан; `204 No Content` — успех без тела. `401` — «не знаю, кто ты» (не вошёл или сессия истекла); `403` — «знаю, кто ты, но тебе нельзя».

**Подробнее:** [Конспект §1.1](5_4-http-requests-konspekt.md#s1-1) · [← вопрос](5_4-http-requests-voprosy.md#q-2)

<a id="a-3"></a>

### 3. Зачем HttpClient

**Ответ:**

1. сам превращает объекты в JSON и обратно;
2. считает `4xx`/`5xx` ошибкой и передаёт её в `error`;
3. возвращает Observable, с которым удобно работать через RxJS;
4. умеет параметры, заголовки, перехватчики, внедряется через DI и подменяется в тестах.

**Подробнее:** [Конспект §1.2](5_4-http-requests-konspekt.md#s1-2) · [← вопрос](5_4-http-requests-voprosy.md#q-3)

---

## B. NgModule

<a id="a-4"></a>

### 4. Поля `@NgModule`

**Ответ:** `declarations` — компоненты, директивы, пайпы модуля; `imports` — другие модули, чьи возможности нужны; `providers` — провайдеры сервисов (инструкции для инжектора); `bootstrap` — корневой компонент, который вставляется в `index.html`.

**Пояснение:** `providers` — не «откуда берутся данные», а «как создать зависимость».

**Подробнее:** [Конспект §2.1](5_4-http-requests-konspekt.md#s2-1) · [П-1](5_4-http-requests-popravki.md#p-1) · [← вопрос](5_4-http-requests-voprosy.md#q-4)

<a id="a-5"></a>

### 5. `import` и `imports`

**Ответ:** `import ... from` — возможность TypeScript: делает класс доступным в файле. `imports: [...]` в декораторе — сообщает Angular, что шаблоны этого модуля или компонента используют возможности модуля. Без первого TypeScript не знает имя, без второго Angular не применит директивы в шаблоне.

**Подробнее:** [Конспект §2.2](5_4-http-requests-konspekt.md#s2-2) · [← вопрос](5_4-http-requests-voprosy.md#q-5)

<a id="a-6"></a>

### 6. Замены модулей

**Ответ:** `HttpClientModule` → `provideHttpClient()` в `app.config.ts`; `BrowserModule` → `bootstrapApplication` в `main.ts`; `CommonModule` для `NgIf`/`NgFor` → встроенные `@if`/`@for`, которым импорт не нужен.

**Подробнее:** [Конспект §2.3](5_4-http-requests-konspekt.md#s2-3) · [П-1](5_4-http-requests-popravki.md#p-1) · [← вопрос](5_4-http-requests-voprosy.md#q-6)

---

## C. Observable

<a id="a-7"></a>

### 7. Что такое Observable

**Ответ:** объект, который выдаёт значения асинхронно, со временем, тем, кто на него подписался. Ответ сервера приходит не сразу, и метод не может вернуть данные немедленно — он возвращает Observable, а данные придут в `next`, когда сервер ответит. Страница при этом не замирает.

**Подробнее:** [Конспект §3.1](5_4-http-requests-konspekt.md#s3-1) · [← вопрос](5_4-http-requests-voprosy.md#q-7)

<a id="a-8"></a>

### 8. `next`, `error`, `complete`

**Ответ:** `next` — на каждое значение; `error` — при ошибке; `complete` — когда поток успешно закончился. Поток заканчивается **либо** `error`, **либо** `complete` — после `error` `complete` не придёт.

**Подробнее:** [Конспект §3.2](5_4-http-requests-konspekt.md#s3-2) · [Конспект §3.3](5_4-http-requests-konspekt.md#s3-3) · [← вопрос](5_4-http-requests-voprosy.md#q-8)

<a id="a-9"></a>

### 9. Что выведет код

**Ответ:** `start`, `a`, `b`, `done`, `end`. `of` выдаёт значения синхронно, сразу при подписке, поэтому они появляются до `end`. Без `subscribe` выведется только `start` и `end`: Observable ленивый и без подписки ничего не делает.

**Пояснение:** у HTTP-Observable значения приходят асинхронно — там `end` вывелся бы раньше данных.

**Подробнее:** [Конспект §3.3](5_4-http-requests-konspekt.md#s3-3) · [← вопрос](5_4-http-requests-voprosy.md#q-9)

<a id="a-10"></a>

### 10. Перепиши подписку

**Ответ:** устарела передача нескольких функций отдельными аргументами. Правильно — объект observer:

```ts
this.http.get<Group[]>('/api/groups').subscribe({
  next: (groups) => (this.groups = groups),
  error: (err) => (this.error = err.message),
});
```

**Подробнее:** [П-2](5_4-http-requests-popravki.md#p-2) · [← вопрос](5_4-http-requests-voprosy.md#q-10)

<a id="a-11"></a>

### 11. Особенности HTTP-Observable

**Ответ:** запрос уходит только при `subscribe()`. Две подписки — два запроса на сервер. Отписываться обычно не нужно: после ответа поток сам завершается. Отписка до ответа отменяет запрос; для долгих запросов подписку привязывают к жизни компонента через `takeUntilDestroyed`.

**Подробнее:** [Конспект §3.4](5_4-http-requests-konspekt.md#s3-4) · [Конспект §10.1](5_4-http-requests-konspekt.md#s10-1) · [← вопрос](5_4-http-requests-voprosy.md#q-11)

---

## D. Подключение и GET

<a id="a-12"></a>

### 12. Ошибки в настройке

**Ответ:**

1. `provideHttpClient();` — точка с запятой внутри массива, синтаксическая ошибка; нужна запятая или ничего;
2. `httpClient` — класс называется `HttpClient` с заглавной буквы.

```ts
providers: [provideRouter(routes), provideHttpClient()]
import { HttpClient } from '@angular/common/http';
```

**Подробнее:** [Конспект §4](5_4-http-requests-konspekt.md#s4) · [П-3](5_4-http-requests-popravki.md#p-3) · [← вопрос](5_4-http-requests-voprosy.md#q-12)

<a id="a-13"></a>

### 13. Забыл `provideHttpClient`

**Ответ:** при создании сервиса будет ошибка `NullInjectorError: No provider for HttpClient`: инжектор не знает, как создать `HttpClient`.

**Подробнее:** [Конспект §4](5_4-http-requests-konspekt.md#s4) · [← вопрос](5_4-http-requests-voprosy.md#q-13)

<a id="a-14"></a>

### 14. Ошибки в сервисе

**Ответ:**

1. `observable` — тип называется `Observable`;
2. `subscribe()` внутри сервиса возвращает `Subscription`, а не данные: вызывающий код ничего не получит;
3. нет типа ответа.

```ts
getPosts(): Observable<Post[]> {
  return this.http.get<Post[]>(this.url);
}
```

**Подробнее:** [Конспект §5.1](5_4-http-requests-konspekt.md#s5-1) · [П-4](5_4-http-requests-popravki.md#p-4) · [← вопрос](5_4-http-requests-voprosy.md#q-14)

<a id="a-15"></a>

### 15. Где подписываться

**Ответ:** сервис возвращает Observable, подписывается компонент. Так компонент сам решает, куда положить данные и как показать ошибку, а сервис остаётся переиспользуемым: разные компоненты могут по-разному использовать один метод и комбинировать его с другими запросами.

**Подробнее:** [Конспект §10.1](5_4-http-requests-konspekt.md#s10-1) · [П-4](5_4-http-requests-popravki.md#p-4) · [← вопрос](5_4-http-requests-voprosy.md#q-15)

<a id="a-16"></a>

### 16. `get<Post[]>`

**Ответ:** сообщает компилятору тип ответа: TypeScript подсказывает поля и ловит опечатки. Данные при этом **не проверяются**: если сервер пришлёт другое, ошибки не будет, а в полях окажется `undefined`.

**Подробнее:** [Конспект §5.2](5_4-http-requests-konspekt.md#s5-2) · [П-6](5_4-http-requests-popravki.md#p-6) · [← вопрос](5_4-http-requests-voprosy.md#q-16)

---

## E. POST, PUT, PATCH, DELETE

<a id="a-17"></a>

### 17. Тело POST

**Ответ:** второй аргумент (`b`) — тело; третий — options. На сервере тело окажется в `req.body`, если подключён `app.use(express.json())`.

**Подробнее:** [Конспект §6](5_4-http-requests-konspekt.md#s6) · [← вопрос](5_4-http-requests-voprosy.md#q-17)

<a id="a-18"></a>

### 18. PUT, PATCH, DELETE

**Ответ:** `PUT` заменяет ресурс целиком (поля, которых нет в теле, пропадут); `PATCH` меняет только переданные поля. `DELETE` обычно отвечает `204` без тела, поэтому пишут `http.delete<void>(url)`.

**Подробнее:** [Конспект §7](5_4-http-requests-konspekt.md#s7) · [← вопрос](5_4-http-requests-voprosy.md#q-18)

---

## F. Заголовки и параметры

<a id="a-19"></a>

### 19. Ошибки с заголовками

**Ответ:**

1. `，` — полноширинная запятая в импорте, синтаксическая ошибка;
2. `new Headers()` — класс Fetch API, а нужен `HttpHeaders`;
3. `append` у `HttpHeaders` возвращает новый объект — без присваивания заголовок потеряется;
4. `Content-Type: image/jpeg` для JSON-тела неверен, а для объекта его вообще не нужно указывать;
5. `Accept-Encoding` браузер задать не разрешает.

```ts
const headers = new HttpHeaders().set('x-request-source', 'chat-app');
this.http.post('/api/groups', { name: 'Study' }, { headers });
```

**Подробнее:** [Конспект §8](5_4-http-requests-konspekt.md#s8) · [П-5](5_4-http-requests-popravki.md#p-5) · [← вопрос](5_4-http-requests-voprosy.md#q-19)

<a id="a-20"></a>

### 20. Неизменяемые параметры

**Ответ:** выведется пустая строка. `HttpParams` неизменяем: `set` вернул новый объект, а исходный `params` остался пустым. Исправление — цепочка или присваивание:

```ts
const params = new HttpParams().set('page', 2);
// или: let params = new HttpParams(); params = params.set('page', 2);
console.log(params.toString());   // "page=2"
```

**Подробнее:** [Конспект §8](5_4-http-requests-konspekt.md#s8) · [← вопрос](5_4-http-requests-voprosy.md#q-20)

<a id="a-21"></a>

### 21. `Content-Type`

**Ответ:** для объекта — нет, `HttpClient` сам поставит `application/json`. Для `FormData` — тем более нет: браузер сам поставит `multipart/form-data` с нужной границей (boundary), а если задать заголовок вручную, сервер не разберёт тело.

**Подробнее:** [Конспект §8](5_4-http-requests-konspekt.md#s8) · [Пример 4](5_4-http-requests-primery.md#ex-4) · [← вопрос](5_4-http-requests-voprosy.md#q-21)

---

## G. Ошибки и практика

<a id="a-22"></a>

### 22. `HttpErrorResponse`

**Ответ:** `status` — код ответа; `error` — тело ответа с ошибкой от сервера (например, `{ error: 'Name is required' }`); `message` — общее описание от Angular. `status: 0` — ответа нет: сервер недоступен или ответ заблокирован CORS.

**Подробнее:** [Конспект §9](5_4-http-requests-konspekt.md#s9) · [← вопрос](5_4-http-requests-voprosy.md#q-22)

<a id="a-23"></a>

### 23. Индикатор не гаснет

**Ответ:** поток заканчивается либо `complete`, либо `error`. При ошибке `complete` не вызывается, и `loading` остаётся `true`. Исправление — `finalize`, который срабатывает в обоих случаях:

```ts
this.loading = true;
this.service.load()
  .pipe(finalize(() => (this.loading = false)))
  .subscribe({
    next: (data) => (this.data = data),
    error: (e) => (this.error = e.message),
  });
```

**Подробнее:** [Пример 1](5_4-http-requests-primery.md#ex-1) · [Конспект §3.2](5_4-http-requests-konspekt.md#s3-2) · [← вопрос](5_4-http-requests-voprosy.md#q-23)

<a id="a-24"></a>

### 24. Запрос, зависящий от другого

**Ответ:** оператор `switchMap`: он получает результат первого запроса и возвращает второй Observable. Получается одна подписка и один обработчик ошибок для обоих запросов; если первый упадёт, второй не отправится; отписка отменяет всю цепочку.

**Подробнее:** [Конспект §10.2](5_4-http-requests-konspekt.md#s10-2) · [Пример 2](5_4-http-requests-primery.md#ex-2) · [← вопрос](5_4-http-requests-voprosy.md#q-24)

<a id="a-25"></a>

### 25. Заголовок для всех запросов

**Ответ:** перехватчик (interceptor) — функция `HttpInterceptorFn`, которая клонирует запрос с нужным заголовком (`req.clone({ setHeaders: {...} })`) и передаёт его дальше. Подключается в `app.config.ts`: `provideHttpClient(withInterceptors([authInterceptor]))`.

**Подробнее:** [Пример 3](5_4-http-requests-primery.md#ex-3) · [← вопрос](5_4-http-requests-voprosy.md#q-25)

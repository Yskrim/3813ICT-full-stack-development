# 5_4 — HTTP-запросы: вопросы для самопроверки

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_4-http-requests-konspekt.md) · [поправки](5_4-http-requests-popravki.md) · [примеры](5_4-http-requests-primery.md) · [ответы](5_4-http-requests-otvety.md)

**Как работать:** отвечай по памяти; для кода — сначала предскажи результат; если не знаешь — отметь «не знаю»; после каждого раздела сверяйся с ответами; ошибочные вопросы повтори через день.

---

## A. HTTP и HttpClient

<a id="q-1"></a>

### 1. Запрос и ответ

Из каких частей состоит HTTP-запрос? А ответ?

[→ ответ](5_4-http-requests-otvety.md#a-1)

<a id="q-2"></a>

### 2. Коды состояния

Назови пять категорий кодов. Что означают `201`, `204`? Чем `401` отличается от `403`?

[→ ответ](5_4-http-requests-otvety.md#a-2)

<a id="q-3"></a>

### 3. Зачем HttpClient

Чем `HttpClient` удобнее «голых» XMLHttpRequest и fetch? Назови четыре вещи.

[→ ответ](5_4-http-requests-otvety.md#a-3)

---

## B. NgModule

<a id="q-4"></a>

### 4. Поля `@NgModule`

Что лежит в `declarations`, `imports`, `providers`, `bootstrap`?

[→ ответ](5_4-http-requests-otvety.md#a-4)

<a id="q-5"></a>

### 5. `import` и `imports`

Чем `import { FormsModule } from '@angular/forms'` отличается от `imports: [FormsModule]`? Зачем нужны оба?

[→ ответ](5_4-http-requests-otvety.md#a-5)

<a id="q-6"></a>

### 6. Замены модулей

Чем в standalone-приложении заменяют `HttpClientModule`, `BrowserModule` и `CommonModule` (для `NgIf`/`NgFor`)?

[→ ответ](5_4-http-requests-otvety.md#a-6)

---

## C. Observable

<a id="q-7"></a>

### 7. Что такое Observable

Что это и зачем `HttpClient` возвращает Observable, а не сами данные?

[→ ответ](5_4-http-requests-otvety.md#a-7)

<a id="q-8"></a>

### 8. `next`, `error`, `complete`

Когда вызывается каждый обработчик? Может ли после `error` прийти `complete`?

[→ ответ](5_4-http-requests-otvety.md#a-8)

<a id="q-9"></a>

### 9. Что выведет код?

```ts
const letters$ = of('a', 'b');
console.log('start');
letters$.subscribe({
  next: (x) => console.log(x),
  complete: () => console.log('done'),
});
console.log('end');
```

А что выведется, если убрать `subscribe`?

[→ ответ](5_4-http-requests-otvety.md#a-9)

<a id="q-10"></a>

### 10. Перепиши подписку

```ts
this.http.get<Group[]>('/api/groups').subscribe(
  (groups) => (this.groups = groups),
  (err) => (this.error = err.message),
);
```

Что здесь устарело? Перепиши.

[→ ответ](5_4-http-requests-otvety.md#a-10)

<a id="q-11"></a>

### 11. Особенности HTTP-Observable

Когда уходит запрос? Что будет, если подписаться на один и тот же Observable дважды? Нужно ли отписываться от HTTP-запросов?

[→ ответ](5_4-http-requests-otvety.md#a-11)

---

## D. Подключение и GET

<a id="q-12"></a>

### 12. Найди ошибки в настройке

```ts
// app.config.ts
providers: [provideRouter(routes), provideHttpClient();]

// data.service.ts
import { httpClient } from '@angular/common/http';
```

[→ ответ](5_4-http-requests-otvety.md#a-12)

<a id="q-13"></a>

### 13. Забыл `provideHttpClient`

Что произойдёт, если не добавить `provideHttpClient()` в `app.config.ts`, а в сервисе сделать `inject(HttpClient)`?

[→ ответ](5_4-http-requests-otvety.md#a-13)

<a id="q-14"></a>

### 14. Найди ошибки в сервисе

```ts
getNewData(): observable {
  return this.http.get(this.url).subscribe();
}
```

[→ ответ](5_4-http-requests-otvety.md#a-14)

<a id="q-15"></a>

### 15. Где подписываться

Где подписываться на HTTP-запрос — в сервисе или в компоненте? Почему?

[→ ответ](5_4-http-requests-otvety.md#a-15)

<a id="q-16"></a>

### 16. `get<Post[]>`

Что даёт запись `get<Post[]>(url)`? Проверяет ли Angular, что сервер действительно прислал массив постов?

[→ ответ](5_4-http-requests-otvety.md#a-16)

---

## E. POST, PUT, PATCH, DELETE

<a id="q-17"></a>

### 17. Тело POST

Какой аргумент `http.post<T>(a, b, c)` — тело запроса? Где его прочитает Express и что для этого нужно на сервере?

[→ ответ](5_4-http-requests-otvety.md#a-17)

<a id="q-18"></a>

### 18. PUT, PATCH, DELETE

Чем `PUT` отличается от `PATCH`? Какой код обычно возвращает `DELETE` и что поставить в `<T>`?

[→ ответ](5_4-http-requests-otvety.md#a-18)

---

## F. Заголовки и параметры

<a id="q-19"></a>

### 19. Найди ошибки

```ts
import { HttpHeaders，HttpParams } from '@angular/common/http';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'image/jpeg');
myHeaders.append('Accept-Encoding', 'gzip');

this.http.post('/api/groups', { name: 'Study' }, { headers: myHeaders });
```

[→ ответ](5_4-http-requests-otvety.md#a-19)

<a id="q-20"></a>

### 20. Что выведет?

```ts
const params = new HttpParams();
params.set('page', 2);
console.log(params.toString());
```

Почему? Как исправить?

[→ ответ](5_4-http-requests-otvety.md#a-20)

<a id="q-21"></a>

### 21. `Content-Type`

Нужно ли указывать `Content-Type`, когда отправляешь объект? А когда отправляешь `FormData` с файлом?

[→ ответ](5_4-http-requests-otvety.md#a-21)

---

## G. Ошибки и практика

<a id="q-22"></a>

### 22. `HttpErrorResponse`

Какие поля `HttpErrorResponse` самые полезные? Что означает `status: 0`?

[→ ответ](5_4-http-requests-otvety.md#a-22)

<a id="q-23"></a>

### 23. Индикатор не гаснет

```ts
this.loading = true;
this.service.load().subscribe({
  next: (data) => (this.data = data),
  error: (e) => (this.error = e.message),
  complete: () => (this.loading = false),
});
```

При ошибке сервера индикатор загрузки крутится бесконечно. Почему? Исправь.

[→ ответ](5_4-http-requests-otvety.md#a-23)

<a id="q-24"></a>

### 24. Запрос, зависящий от другого

Нужно войти, а потом загрузить группы пользователя по его `id`. Что использовать вместо подписки внутри подписки и почему?

[→ ответ](5_4-http-requests-otvety.md#a-24)

<a id="q-25"></a>

### 25. Заголовок для всех запросов

Как добавить один и тот же заголовок ко всем запросам приложения, не меняя каждый сервис?

[→ ответ](5_4-http-requests-otvety.md#a-25)

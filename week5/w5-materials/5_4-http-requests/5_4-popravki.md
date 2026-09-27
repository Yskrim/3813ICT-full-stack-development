# 5_4 — HTTP-запросы: поправки

**Курс:** 3813ICT, неделя 5
**Источник:** `5_4-HTTP_Requests.pdf`
**Связанные файлы:** [конспект](5_4-http-requests-konspekt.md) · [примеры](5_4-http-requests-primery.md) · [вопросы](5_4-http-requests-voprosy.md) · [ответы](5_4-http-requests-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно и полный пример с пояснениями.

**Обозначения:** 🔴 **ошибка** — код не заработает или поведение будет не тем; 🟡 **неточность** — формулировка вводит в заблуждение или недоговаривает важное; 🔵 **устарело** — сейчас делают иначе.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | `HttpClientModule` и таблица модулей | 🔵 | Модуль устарел (Angular 18); `providers` — не «откуда берутся данные» |
| [П-2](#p-2) | `subscribe` с тремя функциями | 🔵 | В RxJS 7 устарело — передают объект `{ next, error, complete }` |
| [П-3](#p-3) | Слайд настройки HttpClient | 🔴 | `httpClient` со строчной, незакрытая кавычка, `;` внутри массива, смешаны два подхода |
| [П-4](#p-4) | `getNewData()` в сервисе | 🔴 | `observable` со строчной; `subscribe` внутри сервиса возвращает `Subscription`, а не данные |
| [П-5](#p-5) | Пример с заголовками | 🔴 | Полноширинная запятая, `Headers` вместо `HttpHeaders`, игнорируемый `append`, запрещённый `Accept-Encoding` |
| [П-6](#p-6) | Интерфейс ответа | 🟡 | `get<T>` — не проверка данных; `postTitle` не объявлен |

---

<a id="p-1"></a>

## П-1. `HttpClientModule` и таблица модулей 🔵

### Как в материале

Файл начинается с раздела о NgModule с пометкой, что информация дана для исторического контекста, потому что сейчас используются standalone-компоненты. Описаны поля `@NgModule`: `declarations`, `imports`, `providers` (с пояснением «поставщики сервисов — откуда берутся данные») и `bootstrap`. Дальше — таблица часто используемых модулей, где `HttpClientModule` из `@angular/common/http` указан как модуль «для общения с сервером», а `CommonModule` — для `NgIf` и `NgFor`.

### Пример из материала

Кода нет (таблица).

### В чём несоответствие

1. **`HttpClientModule` устарел с Angular 18.** Вместо него в standalone-приложении вызывают `provideHttpClient()` в `app.config.ts`, а в приложении на модулях — тоже `provideHttpClient()`, но в `providers` модуля.
2. **`providers` — не «откуда берутся данные».** Провайдер — инструкция для инжектора, как создать зависимость (сервис). К источнику данных это отношения не имеет ([5_2 §2.1](5_2-services-konspekt.md#s2-1)).
3. **`CommonModule` для `NgIf`/`NgFor`** — верно для старого синтаксиса, но встроенные `@if`/`@for` импорта не требуют вовсе (см. [5_5](5_5-templating-konspekt.md#s2)).
4. **`BrowserModule`** в standalone-приложении не нужен: приложение запускается через `bootstrapApplication`.

### Как правильно

Для HTTP в современном приложении — `provideHttpClient()` в `app.config.ts`. Остальные модули из таблицы — по [таблице в конспекте](5_4-http-requests-konspekt.md#s2-3).

### Пример

```ts
// ═════ Было (NgModule) ═════
// @NgModule({
//   imports: [BrowserModule, HttpClientModule],   // HttpClientModule — устарел
//   bootstrap: [AppComponent],
// })
// export class AppModule {}

// ═════ Стало (standalone) — src/main.ts ═════
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig);  // вместо BrowserModule + bootstrap: [...]

// ═════ src/app/app.config.ts ═════
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],              // вместо HttpClientModule
};
```

---

<a id="p-2"></a>

## П-2. `subscribe` с тремя функциями 🔵

### Как в материале

После примера с объектом observer сказано, что на практике observer можно не создавать, а передать три функции (или первые две, или одну) прямо аргументами `subscribe()`. Этот же стиль используется в примере `POST`: в `subscribe` передаются функция успеха и функция ошибки.

### Пример из материала

```ts
myObservable.subscribe(
x => console.log(x), // NEXT
err=> console.log(err), // ERROR
() => console.log(‘Observer Complete’), // COMPLETE
);
```

### В чём несоответствие

В RxJS 7 (его использует Angular) передача нескольких функций отдельными аргументами объявлена **устаревшей**. Код пока работает, но редактор подчёркивает `subscribe` как deprecated, и в будущих версиях этот вариант уберут. Причина — такие вызовы трудно читать: по записи не видно, какая функция за что отвечает, а чтобы передать только `error`, приходилось писать `subscribe(undefined, err => ...)`.

Передавать **одну** функцию (только `next`) по-прежнему можно.

Кроме того, в строке с `complete` типографские кавычки — при копировании будет синтаксическая ошибка.

### Как правильно

Передавать объект с нужными полями: `next`, `error`, `complete`. Любое из них можно пропустить.

### Пример

```ts
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const numbers$ = of(3, 5, 7, 9);

// ✅ Объект observer — поля подписаны, видно, что есть что
numbers$.subscribe({
  next: (x) => console.log(x),
  error: (err) => console.error(err),
  complete: () => console.log('Observer Complete'),
});

// ✅ Только значения — одна функция (не устарело)
numbers$.subscribe((x) => console.log(x));

// ✅ Только ошибка — объект с одним полем (раньше: subscribe(undefined, err => ...))
this.http.get('/api/groups').subscribe({
  error: (err: HttpErrorResponse) => console.error(err.status),
});

// ❌ Устарело: несколько функций отдельными аргументами
// numbers$.subscribe(x => ..., err => ..., () => ...);
```

---

<a id="p-3"></a>

## П-3. Слайд настройки HttpClient 🔴

### Как в материале

Сказано, что `HttpClientModule` находится в пакете `@angular/common/http`. Для модуля нужно импортировать его в `app.module.ts`; также нужно импортировать `provideHttpClient` и добавить `provideHttpClient();` в массив `providers` в `app.config.ts`. В компоненте или сервисе нужно импортировать клиент и внедрить его через конструктор или функцию `inject`.

### Пример из материала

```ts
import {HttpClientModule} from ‘@angular/common/http
import { provideHttpClient } from '@angular/common/http';
// provideHttpClient(); — «добавить в массив providers файла app.config.ts»

import{httpClient} from ‘@angular/common/http’;
constructor (private http:HttpClient){}; or private http=inject(HttpClient);
```

### В чём несоответствие

1. **`httpClient` со строчной буквы.** Класс называется `HttpClient`; такого экспорта, как `httpClient`, в пакете нет — ошибка компиляции.
2. **Незакрытая кавычка** в первом импорте и типографские кавычки `‘ ’` — синтаксические ошибки.
3. **`provideHttpClient();` в массиве.** Точка с запятой внутри массива — синтаксическая ошибка: элементы массива разделяются запятыми.
4. **Смешаны два подхода.** Для standalone-приложения (с `app.config.ts`) `HttpClientModule` не нужен вовсе; для приложения на модулях не нужен `app.config.ts`. Делать и то, и другое не требуется.

### Как правильно

Standalone: только `provideHttpClient()` в `providers` файла `app.config.ts` и `inject(HttpClient)` там, где нужен клиент.

### Пример

```ts
// ═════ src/app/app.config.ts ═════
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),          // запятая, а не точка с запятой
  ],
};

// ═════ src/app/services/data.service.ts ═════
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';   // HttpClient — с заглавной H

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  // или: constructor(private http: HttpClient) {}
}
```

**Пояснения:**

- Если `provideHttpClient()` забыть, при создании сервиса будет ошибка `NullInjectorError: No provider for HttpClient`.
- `provideHttpClient` принимает опции: `provideHttpClient(withFetch())` переключает на Fetch API, `provideHttpClient(withInterceptors([...]))` подключает перехватчики (см. [пример 3](5_4-http-requests-primery.md#ex-3)).

---

<a id="p-4"></a>

## П-4. `getNewData()` в сервисе 🔴

### Как в материале

Показан пример базового `GET`: сервис `DataService` с пустым полем `url`, внедрённым через конструктор `HttpClient` и методом `getNewData()`, у которого тип возвращаемого значения записан как `observable`, а внутри вызывается `this.http.get(this.url).subscribe()` и возвращается результат.

### Пример из материала

```ts
export class DataService {
url = "";
constructor(private http: HttpClient) {}
getNewData():observable {
return this.http.get(this.url).subscribe();
}
```

### В чём несоответствие

1. **`observable` со строчной.** Тип называется `Observable` (он даже импортирован выше). Со строчной — ошибка «Cannot find name 'observable'».
2. **`subscribe()` внутри сервиса.** `subscribe()` возвращает `Subscription` — «квитанцию о подписке», а не данные и не Observable. Запрос уйдёт, но ответ никуда не попадёт: подписка пустая, и тот, кто вызвал `getNewData()`, данных не получит. Тип `Subscription` к тому же не совпадает с объявленным `Observable`.
3. **Нет типа данных.** `http.get(url)` без `<T>` возвращает `Observable<Object>`, и компилятор ничего не знает о форме ответа.
4. **Нет закрывающей скобки класса.**

Главная мысль: сервис **возвращает** Observable, а **подписывается** тот, кому нужны данные.

### Как правильно

```ts
getPosts(): Observable<Post[]> {
  return this.http.get<Post[]>(this.url);    // без subscribe
}
```

### Пример

```ts
// ═════ src/app/services/data.service.ts ═════
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: number;
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private readonly url = '/api/posts';

  // ✅ Возвращает Observable — подписку оставляем вызывающему
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.url);
  }

  // ❌ Как в материале: данные теряются, тип не тот
  // getNewData(): observable {
  //   return this.http.get(this.url).subscribe();
  // }
}

// ═════ Компонент — подписывается сам ═════
export class PostsComponent implements OnInit {
  private dataService = inject(DataService);
  posts: Post[] = [];

  ngOnInit(): void {
    this.dataService.getPosts().subscribe({
      next: (posts) => (this.posts = posts),
      error: () => console.error('Не удалось загрузить посты'),
    });
  }
}
```

---

<a id="p-5"></a>

## П-5. Пример с заголовками 🔴

### Как в материале

Сказано, что для запроса доступны расширенные опции, чтобы менять заголовки и параметры. Импортируются `HttpHeaders` и `HttpParams`. Затем создаётся пустой объект заголовков, в него добавляются `Content-Type: image/jpeg` (в комментарии — что обычно это `application/json`) и `Accept-Encoding: gzip`. Параметры создаются цепочкой `set` для `page` и `limit`, в комментарии показан вариант из строки. Заголовки и параметры собираются в объект options и передаются третьим аргументом в `post`.

### Пример из материала

```ts
import {HttpHeaders，HttpParams} from "@angular/common/http";
var myHeaders = new Headers(); // Currently empty
myHeaders.append('Content-Type', 'image/jpeg');
// Usually, it is: myHeaders.append('Content-Type', 'application/json');
myHeaders.append('Accept-Encoding', 'gzip');
const myParams = new HttpParams().set('page',"2").set('limit',"3");
// const myParams = new HttpParams({fromString: 'page=2&limit=3'});
const options = { headers: myHeaders, params: myParams};
this.httpClient.post(url, body, options);
```

### В чём несоответствие

1. **Полноширинная запятая** `，` (из китайской раскладки) в импорте — синтаксическая ошибка.
2. **`new Headers()` — это не `HttpHeaders`.** `Headers` — класс браузерного Fetch API. `HttpClient` ожидает `HttpHeaders` или обычный объект, и TypeScript не примет `Headers` в options.
3. **`append` без присваивания.** Даже с `HttpHeaders` код бы не сработал: `HttpHeaders` неизменяем, `append` возвращает **новый** объект, а исходный остаётся пустым. Результат нужно сохранять или собирать цепочкой.
4. **`Content-Type: image/jpeg` для JSON-тела** — сервер попытается разобрать тело как картинку. Для объекта `HttpClient` сам ставит `application/json`, указывать не нужно.
5. **`Accept-Encoding`** — заголовок, который браузер запрещает задавать из JavaScript (он управляет сжатием сам). Браузер его проигнорирует.
6. **`var`** — устаревший способ объявления.

Часть с `HttpParams` верна: `set` возвращает новый объект, и цепочка собирает оба параметра.

### Как правильно

`HttpHeaders` и `HttpParams` собирать цепочкой (или обычными объектами), `Content-Type` для JSON не указывать, запрещённые браузером заголовки не задавать.

### Пример

```ts
import { HttpHeaders, HttpParams } from '@angular/common/http';

// ✅ Цепочка: каждый set возвращает новый объект
const headers = new HttpHeaders()
  .set('x-request-source', 'chat-app');

const params = new HttpParams()
  .set('page', 2)
  .set('limit', 3);
// или из строки: new HttpParams({ fromString: 'page=2&limit=3' })

this.http.post<Group>('/api/groups', { name: 'Study' }, { headers, params });
// POST /api/groups?page=2&limit=3
// Content-Type: application/json  ← HttpClient поставил сам

// ✅ То же обычными объектами — чаще всего так проще
this.http.post<Group>('/api/groups', { name: 'Study' }, {
  headers: { 'x-request-source': 'chat-app' },
  params: { page: 2, limit: 3 },
});

// ❌ Почему append без присваивания ничего не делает
const h = new HttpHeaders();
h.append('x-a', '1');            // вернул НОВЫЙ объект, который мы выбросили
console.log(h.has('x-a'));       // false
const h2 = h.append('x-a', '1'); // ✅ сохранили результат
console.log(h2.has('x-a'));      // true
```

---

<a id="p-6"></a>

## П-6. Интерфейс ответа 🟡

### Как в материале

Интерфейс описан как способ задать форму объекта — «как класс, но без методов»; описание формы ответа упрощает работу с ним. В примере интерфейс `MyData` с полями `title` и `body` передаётся в `get<MyData>`, и в подписке значение `res.title` записывается в `this.postTitle`.

### Пример из материала

```ts
interface MyData {
title: string;
body: string;
};
constructor(private http: HttpClient) {}
getData() {
this.http.get<MyData>(this.url).subscribe(res => {
this.postTitle = res.title;
});
}
```

### В чём несоответствие

1. **`get<MyData>` не проверяет данные.** Это указание компилятору «считай, что ответ такой формы». Если сервер пришлёт другое, ошибки не будет: `res.title` окажется `undefined`. Интерфейсы существуют только при компиляции и в работающем коде исчезают. Поэтому интерфейс должен повторять то, что реально отдаёт сервер.
2. **`this.postTitle` не объявлен** — в классе нужно поле `postTitle = ''`, иначе ошибка компиляции.
3. Подписка здесь — прямо в методе с `http`, то есть по сути в компоненте. Лучше вынести запрос в сервис ([П-4](#p-4)).

### Как правильно

Описывать интерфейс по фактическому ответу сервера, объявлять поля класса, при сомнении проверять ответ в DevTools → Network → Response.

### Пример

```ts
// Интерфейс повторяет РЕАЛЬНЫЙ ответ сервера (смотри DevTools → Network → Response)
interface Post {
  id: number;
  title: string;
  body: string;
}

export class PostComponent implements OnInit {
  private http = inject(HttpClient);
  postTitle = '';                               // ✅ поле объявлено

  ngOnInit(): void {
    this.http.get<Post>('/api/posts/1').subscribe((post) => {
      this.postTitle = post.title;              // TypeScript знает поле title

      // Если сервер на самом деле прислал { heading: '...' },
      // post.title будет undefined — компилятор этого не увидит
    });
  }
}
```

# Angular Routing

Роутинг в Angular — это способ показывать разные «страницы» без перезагрузки сайта, меняя только кусок внутри одного приложения.

## 1. Два вида маршрутов (из лекции)

1. Server-side (Express и т.п.): браузер запрашивает URL → сервер отдаёт новый HTML.
2. Client-side (Angular SPA): страница загружается один раз → JavaScript сам смотрит URL и подставляет нужный компонент. Сервер заново не отдаёт целую страницу при каждом клике.

Поэтому один index.html и один корневой App, а «страницы» — это компоненты внутри него.

---

## 2. Идея в одной фразе

URL → таблица маршрутов → компонент → рисуется в

```
localhost:4200/home
        ↓
routes: { path: 'home', component: Home }
        ↓
<router-outlet> показывает Home
```

---

## 3. Три детали в моём проекте

1. Таблица маршрутов — app.routes.ts

`export const routes: Routes = [];` // пока пусто
Сюда пишут соответствия:

```ts
export const routes: Routes = [
	{ path: "home", component: Home },
	{ path: "about", component: About },
	{ path: "", redirectTo: "home", pathMatch: "full" }, // / → /home
];
```

`path: 'home'` = адрес /home (без ведущего / в записи).

1. Включение роутера — app.config.ts

provideRouter(routes)
Без этого Angular не знает про маршруты. Роутер следит за URL и решает, какой компонент показать.

1. Место на экране — в app.html:

Корень (App) — оболочка (шапка, меню). Меняется только то, что внутри outlet.

1. Как пользователь «ходит» по страницам

Не обычный `<a href="/home">` (тот просит сервер заново), а:

```ts
<a routerLink="/home">Home</a>
```

`routerLink` говорит роутеру Angular: смени URL и компонент, страницу не перезагружай.

В компоненте нужно импортировать `RouterLink` так же, как `RouterOutlet`.

1. Типичный порядок (как в курсе)

Создать страницу: ng generate component home
Добавить маршрут в app.routes.ts
В шаблоне корня — ссылки с routerLink и
Открыть localhost:4200/home — увидишь Home внутри outlet

1. Картина целиком
   index.html
   └── ← компонент App (всегда на экране)
   ├── меню с routerLink
   └──
   └── Home / About / ... ← меняется по URL

| Часть         | Зачем                          |
| ------------- | ------------------------------ |
| routes        | словарь URL → компонент        |
| provideRouter | включить роутер в приложении   |
| routerLink    | навигация без перезагрузки     |
| router-outlet | куда вставить текущую страницу |

Отличие от Express (из лекции):

- В Express маршрут ведёт к функции-контроллеру.
- В Angular маршрут ведёт сразу к компоненту страницы (шаблон + класс).

Сейчас у тебя роутер уже подключён, outlet есть, а routes пустой — поэтому «страниц» ещё нет. Как только добавишь { path: '...', component: ... }, /тот-path начнёт показывать этот компонент в outlet.

---

## Generating a New Page Component

`ng generate component home` from the app root dir
`ng g c home` == same thing

CLI создаёт папку вроде:

```
src/app/home/
  home.ts          ← класс компонента
  home.html        ← шаблон страницы
  home.css         ← стили
  home.spec.ts     ← тест
```

Имя `home` → селектор обычно `app-home`, класс `Home`.

CLI только **генерирует файлы компонента**. Сам по себе он **не появляется по адресу** `/home`.

Чтобы страница открывалась в браузере, нужно ещё:

1. Добавить маршрут в `app.routes.ts`
2. (Опционально) ссылку с `routerLink` в шаблоне

### **Полный цикл «создал → открыл в браузере»**

**1. Сгенерировать**

`ng g c home`

**2. Прописать маршрут** в `app.routes.ts`:

```ts
import { Routes } from "@angular/router";
import { Home } from "./home/home";
export const routes: Routes = [{ path: "home", component: Home }];
```

**3. Навигация** (в `app.html` или меню):

```ts
<a routerLink="/home">Home</a>
<router-outlet />
```

**4. Открыть** `http://localhost:4200/home` — `Home` отрисуется внутри `<router-outlet>`.

Без шага 2 адрес `/home` никуда не ведёт: компонента на диске нет в таблице роутера.

---

# Setting up the router

В лекции и в твоём проекте одна цель — вынести роутинг в отдельное место и подключить его к корню. Разница только в синтаксисе: PDF про NgModules, у тебя — standalone

### Зачем отдельная настройка роутера?

Чтобы не смешивать:

- корневой UI (App)
- и таблицу URL → компоненты

Роутер читает URL, находит запись в таблице и вставляет компонент в `<router-outlet>`.

### Вариант из лекции: генерация routing-модуля

Команда из PDF:
`ng generate module app-routing --flat --module=app`

- `app-routing` == имя модуля -> `app-routing.module.ts`
- `--flat` == файл сразу в src/app/, без папки
- `--module=app` == сразу импортировать этот модуль в AppModule

CLI создаёт что-то вроде:

```ts
// app-routing.module.ts
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = []; // сюда добавляют маршруты

@NgModule({
	imports: [RouterModule.forRoot(routes)], // «включить роутер + отдать ему routes»
	exports: [RouterModule], // чтобы в шаблонах работали routerLink / outlet
})
export class AppRoutingModule {}
```

И в корневом модуле:

```ts
@NgModule({
	imports: [
		// ...
		AppRoutingModule, // подключили роутинг ко всему приложению
	],
})
export class AppModule {}
```

### Добавление маршрута (одинаковый смысл в обоих стилях `import`)

Маршрут — объект: path + component.

```ts
import { Home } from "./home/home";
import { Test } from "./test/test";

const routes: Routes = [
	{ path: "home", component: Home },
	{ path: "test", component: Test },
	{ path: "", redirectTo: "home", pathMatch: "full" }, // открыли / → уйти на /home
];
```

| Поле              | Что значит                          |
| ----------------- | ----------------------------------- |
| path: 'home'      | URL /home                           |
| component: Home   | какой компонент показать            |
| redirectTo        | перенаправить на другой path        |
| pathMatch: 'full' | пустой path '' только для точного / |

# Passing data via Router Parameter

Идея

```
/users/42
   ↓
path: 'users/:id'   ← :id = «слот» под значение
   ↓
компонент читает id → 42
```

`:id` в маршруте — имя параметра. В URL на его месте любое значение.

### 1. Объявить маршрут с параметром

В app.routes.ts (у тебя) или в app-routing.module.ts (лекция):

```ts
const routes: Routes = [{ path: "users/:id", component: UserProfile }];
```

В PDF написано «semicolon», но в коде это двоеточие: users/:id.

| URL          | Что получит компонент |
| ------------ | --------------------- |
| `/users/5`   | id = '5'              |
| `/users/abc` | id = 'abc'            |

### 2. Передать параметр при навигации

#### Через шаблон — `[routerLink]`

Обычный `routerLink="/users"` — строка как есть.
С параметром нужна привязка (квадратные скобки), чтобы Angular вычислил выражение:

```ts
<a [routerLink]="['/users', user.id]">{{ user.username }} Profile </a>
```

Если `user.id === 42`, получится переход на `/users/42`.
Массив: `['/users', user.id]` → склеивается в путь с сегментами.

#### Через код

Сначала инжект Router:

```ts
import { Router } from '@angular/router';
constructor(private router: Router) {}
```

Два способа из лекции:

```ts
// строка целиком
this.router.navigateByUrl("/users/" + user.id);

// массив сегментов (удобнее)
this.router.navigate(["/users", user.id]);
```

### 3. Прочитать параметр в компоненте страницы

Нужен сервис `ActivatedRoute` — данные текущего маршрута (params, query params и т.д.).

```ts
import { ActivatedRoute } from '@angular/router';
constructor(private route: ActivatedRoute) {}
```

Два способа — как в лекции.

Snapshot — один раз при загрузке

```ts
ngOnInit() {
  this.userid = this.route.snapshot.params['id'];
  // или: this.route.snapshot.paramMap.get('id')
}
```

Плюс: просто.
Минус: если перейти с /users/1 на /users/2 без уничтожения компонента, ngOnInit может не вызваться снова — userid останется старым.

Observable (`paramMap`) — следить за изменениями

```ts
ngOnInit() {
  this.routesubscription = this.route.paramMap.subscribe(params => {
    this.userid = params.get('id');
  });
}
ngOnDestroy() {
  this.routesubscription.unsubscribe();
}
```

Каждый раз, когда меняется `:id` в URL, колбэк срабатывает снова.
`unsubscribe` в `ngOnDestroy` — чтобы не было утечки подписки (в лекции опечатка: `unsubscibe` → нужно `unsubscribe`).

Полный мини-пример

Маршрут:

```ts
{ path: 'users/:id', component: UserProfile }
```

Ссылка:

```ts
<a [routerLink]="['/users', 42]">User 42</a>
```

Компонент:

```ts
export class UserProfile implements OnInit {
	userid: string | null = null;
	constructor(private route: ActivatedRoute) {}
	ngOnInit() {
		this.userid = this.route.snapshot.params["id"]; // "42"
	}
}
```

Когда что выбирать

| Способ               | Когда                                                           |
| -------------------- | --------------------------------------------------------------- |
| `snapshot`           | страница открывается заново, id почти не меняется «на месте»    |
| `paramMap.subscribe` | один и тот же компонент, разные id подряд (/users/1 → /users/2) |

Связь с тем, что уже знаешь

`routerLink / navigate` → положить значение в URL
`path: 'users/:id'` → сказать роутеру: тут параметр
`ActivatedRoute` → вытащить параметр в компоненте

Без `:id` в `routes` URL `/users/42` просто не совпадёт с маршрутом.
Без чтения через `ActivatedRoute` параметр в адресной строке есть, но компонент его не видит.


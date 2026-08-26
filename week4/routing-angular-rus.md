# Angular routing - роутинг в Ангулар

Роутинг фундаментальный концепт для структуры приложения, поэтому важно понимать как он устроен.

Есть два вида роутинга:

1. серверный
2. клиентский

## Серверные роуты -- Server-side Routes
Серверные приложения - это код, иерархия файлов и директив к нему плохо подходит. К тому же, структура приложения слишком сложна и ее не желательно передавать браузеру.

Роуты (маршруты) стали использоваться как виртуальные ЮРЛ, которые не привязаны к директории и файлу.

Если раньше было `http://example.com/myApps/shoppingCart/addToCart.php`
То сейчас стало `http://example.com/addToCart`

Для того, чтобы эндпоинт работал, нужна таблица роутов, которая связывает виртуальные ЮРЛ с кодом.

| method | path             | action  | description                                   |
| ------ | ---------------- | ------- | --------------------------------------------- |
| GET    | /photos          | index   | displays a list of all photos                 |
| GET    | /photos/new      | new     | returns an HTML form for creating a new photo |
| POST   | /photos          | create  | create a new photo                            |
| GET    | /photos/:id      | show    | displays a specific photo                     |
| GET    | /photos/:id/edit | edit    | return HTML form for editing a photo          |
| PUT    | /photos/:id      | update  | update a specific photo                       |
| DELETE | /photos/:id      | destroy | delete a specific a photo                     |

## Клиентский роутинг -- Client-side Routes
клиентские приложения вроде ДЖС в браузере не могли использовать ЮРЛы для навигации.
ДЖС ивенты и функции использовались для интеракции с веб приложениями
ЮРЛ чаще всего использовался для смены страниц
Однако, роуты - более чистый способ навигации даже для одностраничных приложений.

## Ангулар роутинг -- Angular routes
Роуты в ангурале позволяют веб приложению создать такую таблицу, сопостовлять роуты с компонентами.
В ангуларе роутинг иной по сравнению с экспрессом. В экспрессе, все функции контроллеры связаны сверху вниз внутри функции роутера; здесь роуты состоят из URL/URI и связываются со своей функцией контроллером или моделью. В ангуларе, роуты связываются со страницей напрямую через компоненты этой страницы.

Каждый компонент страницы состоит из представления HTML (view), ng data модели, класса контроллера и функций.

В ангуларе, `src/app/app.component.html` выступает в роли родительского представления (view), в который все сгенерированные страницы загружаются при навигации.

## Генерация компонента новой страницы -- Generating a New Page Component
Новый компонент страницы можно сгенерировать командой angular CLI `ng generate component "pageName"`
Все сгенерированные страницы находятся в `src/app/componentName/`
Прежде чем их можно будет открыть, их адреса должны быть добавлены в роут для компонента страницы в `Angular router`.

## Настройка роутера Setting Up the Router
В ангуларе лучше всего загружать и настраивать роутер в отдельном модуле верхнего уровня, который посвящен роутингу и импортируется root модулем в `AppModule`
По конвенции, класс такого модуля будет называться `AppRoutingModule` и он будет принадлежать файлу `app-routing.module.ts`. Он может быть настроен, когда приложение ангулар генерируется или сгенерировать его командой `ng generate module app-routing --flat --module=app`.

## Добавление роута Adding a route
Роуты говорят роутеру, какой вид (view) отображать, когда пользователь кликает ссылку или переходит по URL в браузере.
Стандартный ангуал роутер собирает пары путей и компонентов. Все это собирается в объекте, который сохраняется в переменную типа `Routes`

```ts
import { ngModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TestComponent } from "./test/test.component"; // has to be imported explicitly

const routes: Routes = [{ path: "test", component: TestComponent }]; // массив объектов роутов класса Route предедается в переменную routes.

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
```

## Добавление `router-outlet` и `routerLink` Adding router-outlet and routerLin
`router-outlet`- это место на странице, куда ангулар подставляет нужный компонент в зависимости от текущего URL. Он говорит роутеру, где отображать маршрутизованные виды (routed views)
В примере `AppComponent` шаблона, `<a routerLink="/test"></a>` это гиперссылка, которая по клику загружает тестовый компонент в место, принадлежащее `<router-outlet>` тегу.

```html
<h1>{{ title }}</h1>
<nav>
	<a routerLink="/test">Test</a>
</nav>
<router-outlet></router-outlet>
```

Содержимое `<router-outlet>` заранее не известно, поэтому внутри него ничего не пишется. Ангурал при навигации динамически добавляет рядом или внутрь нужный компонент.

В этом примере: это постоянная оболочка приложения. При любом переходе на эту страницу, будет отображаться

```html
<h1>{{ title }}</h1>
<nav>
	<a routerLink="/test">Test</a>
</nav>
```

А `router-outlet` это своего рода дырка, в которую ангулар вложит компоненты или целую страницу.
Статичный HTML рендерится со страницей всегда, а содержимое `router-outlet` будет зависить от логики приложения.

## Программируемая навигация - Progromatic Navigation - navigate() & navigateByUrl()
Используя `routerLink` мы можем захардкодить роут в компонент, чтобы всегда переходить (navigate) на него. Мы можем переходить на роут программно используя `router property` свойство, доступное в любом компоненте класса, и вызывающее `navigate()` или `navigateByUrl()` методы.

`this.router.navigateByUrl('/account')` -- пример использования в конструкторе класса.

```ts
import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
	selector: "app-home",
	template: `
		<h2>Home page</h2>
		<button (click)="goToAccount()">Go to account</button>
	`,
})
export class HomeComponent {
	constructor(private router: Router) {}
	goToAccount() {
		this.router.navigateByUrl("/account");
	}
}
```

В этом примере, конструктор класса присваивает (injects) роутер и сохраняет его в поле класса, чтобы можно было вызывать переход (navigate)

```ts
import { Router } from "@angular/router";
export class HomeComponent {
	constructor(private router: Router) {}

	// .navigate() use
	goToAccount() {
		this.router.navigate(["/account"]);
	}

	// navigate() with jQuery Params
	goUserDetails(userId: number) {
		this.router.navigate(["/users", userId], {
			queryParams: { tab: "profile" },
		});
	}

	// navigateByUrl() use
	goToAccount() {
		this.router.navigateByUrl("/account");
	}

	// navigateByUrl() use with jQuery params
	goAccountSettings() {
		this.router.navigateByUrl("/account?tab=settings");
	}
}
```

### Отличия navigate() и navigateByUrl()
`navigate()`
- строит URL по правилам роутинга из сегментов ["/users", userId]
- удобнее когда нужно передать параметр через `extras` вроде `queryParams`, `state`, `relativeTo`

`navigateByUrl()`
- принимает готовый URL строкой или `UrlTree`
- удобно, когда URL уже сформирован как строка, например пришел из ссылки/редиректа.

## Importing Router Module -- Импортирование модуля роутера 
- Чтобы получить доступ к сервису роутинга, нам нужно сначала импортировать все, что нужно из библиотеки `@angular/router`.
- В конструкторе мы вставляем (inject) роутер, чтобы он был доступен в классе
- В методе класса, мы можем сослаться на (reference) `this.router` и `navigatebyUrl()` метод, чтобы роутить новый компонент.

В примере выше я уже импортировал `import { Router } from "@angular/router";`, чтобы получить доступ к функциям роутера.
В конструкторе так же передавал роутер как аргумент `constructor(private router: Router) {}`.
С помощью `navigateByUrl() / navigate()` присваивал классу маршрут.

## Passing data via Router Parameter -- Передача информации с помощью параметров роутера.
Всегда полезно передать параметры в компонент. `Router Parameters` позволяют передать переменную в компонент.

С `routerLink` мы можем передавать параметры в компонент, используя квадратные скобки []. Ангулар определит, что передается в виде выражения в JS, а не просто строкой, как в прошлом примере.

`<a [routerLink] = "['/users', user.id]"> {{ user.username }} Profile </a>` -- это создаст роут в компоненте, который будет сопоставляться с путем "/user" через единственный параметр.

Мы так же можем создавать линки программно, если требуется:
```ts 
// app.routes.ts
import { Routes } from '@angular/router';
import { UsersListComponent } from './users-list.component'; // кастомный компонент
import { UserProfileComponent } from './user-profile.component'; // кастомный компонент

export const routes: Routes = [ // маршруты компонентов
  { path: 'users', component: UsersListComponent },
  { path: 'user/:id', component: UserProfileComponent }
];
```

```ts
// users-list.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

// компонент представляет собой лист кнопок-ссылок на профили пользователей. 
// кнопка привязывается к обработчику клика, на клик вызывает функцию класса
// функция класса, передает URL в роутер и тот переадрессует на маршрут из функции, отображается компонент, соответствующий пользователю с его айди.
@Component({
  selector: 'app-users-list',
  template: `
    <h2>Users</h2>
    <ul>
      <li *ngFor="let user of users">
        <button (click)="goToUser(user)">
          {{ user.username }}
        </button>
      </li>
    </ul>
  `
})

export class UsersListComponent {
  users = [
    { id: 1, username: 'Anna' },
    { id: 2, username: 'Bob' }
  ];

  constructor(private router: Router) {}
  goToUser(user: { id: number; username: string }) {
    this.router.navigateByUrl('/user/' + user.id);  // если кликнули по Bob → URL станет /user/2
    // здесь мы передаем URL как конкатенацию строки и требуемого пути
  }

  goToUser(user: { id: number; username: string }) {
    this.router.navigate(['/user/', user.id]);  // если кликнули по Bob → URL станет /user/2
    // здесь мы передаем URL как массив компонентов строки.
  }
}
```
Это по-сути тот же вариант класса с привязкой к компоненту, только добавляется обработка клика и вызывается функция, которая кстати деструктурирует переданный в нее обьект и использует его пропсы для обработки события.

## Adding a Route with a Parameter -- добавление роута с параметром
В модуле роутинга для приложения, нам нужно создать роут, который сопостовляется с путем и параметром, который мы только что создали.

Сам параметр в этом разделе это `:id`. Я голову сломал, пытаясь его найти, лол.

`const routes: Routes = [{ path: 'users/:id', component: LoginComponent}]` -- опять же, это то же самое, что и определение роутов для самого роутера всего приложения, чтобы он мог соотнести пути и компоненты для этих путей. Такое я уже описал на линии [184].

```ts 
// app.routes.ts
import { Routes } from '@angular/router'; // import router functionallity
import { LoginComponent } from './login.component'; // кастомный компонент

export const routes: Routes = [{ path: 'users/:id', component: LoginComponent}];
```
Это массив обьектов, который передается в переменную и фидится в роутер; потом, при событии переадрессации, роутер определяет, какой компонент рендерить на этом роуте.

Короче, параметр этот стал понятен: мы передаем условный айди, получаем другой результат роутинга, хотя маршрут тот же. Это потому, что параметр определяет, какие данные будут отображаться. Теперь понял.

## Access Routing Parameters in a component -- доступ к параметрам роутинга компонента
У нас теперь есть роут, который относится к путю и параметру. Чтобы получить доступ к параметру внутри компонента, есть два пути:

### 1. Snapshot way -- чтение параметров из snapshot: 
- Легко получаем параметры, которые были переданы, когда компонент рендерился в первый раз. 
- Требуется импортировать `ActivatedRoute` модуль, чтобы получать параметры запросов.
- `ActivatedRoute` это сервис, который передается в каждый компонент в роуте, содержащий инфу для этого роута 
    
    - параметры роута=route params: 
        `/users/42` => `users/:id`
    
    - static data=статичная дата: 
        данные, которые ты заранее прописал прямо в настройке маршрута.
        `{ path: 'admin', component: AdminComponent, data: { role: 'admin' } }`

    - resolve data=дата из результатов запросов:
        данные, которые Angular загружает до открытия компонента.
        Например, сначала запросить пользователя с сервера, потом открыть страницу.

    - глобальные параметры запроса=global query params: 
        параметры после `?` в URL
        `/users/42?tab=posts&sort=asc` -- `tab` и `sort` - параметры запроса
    
    - global fragment:
        часть URL после `#`.
        Пример: `/docs#chapter2`
        Обычно используется для перехода к конкретному месту на странице.

Пример:

`app.routes.ts` - есть вот такой файл роутер:
- он определяет роут, в этом случае, к профилю юзера.
- отвечает за:
    - какой ЮРЛ -в- какой компонент
    - где параметр :id
    - какую static data прикрепить
    - какой resolver запустить перед открытием страницы.

- это конфиг, а не логика UI

```ts
// app.routes.ts
import { Routes } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';
import { userResolver } from './user.resolver';

export const routes: Routes = [
    {
        // обычный путь
        path: 'users/:id',
            component: UserProfileComponent,
        
        // static data — заранее прописано в роуте; определяет, что будет отображаться в компоненте статично
        data: {
            title: 'User Profile',
            role: 'member'
        },
        
        // resolve data — загрузится ДО открытия компонента
        resolve: {
            user: userResolver // а это функция, которая будет определять, что будет в компоненте динамично, то есть из запроса
        }
    }
];
```

`user.resolver.ts` - файл, который подготавливает данные до открытия компонента (не middleware потому что не фильтрует/меняет/проверяет запрос)
отвечает за:
    - поиск айди, 
    - отправку запроса на сервер/сервис, 
    - возврат данных.
- в итоге компонент открывается уже с готовыми данными в route.snapshot.data['user']

```ts
// user.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserService } from './user.service';

export const userResolver: ResolveFn<any> = (route) => {
    const id = route.paramMap.get('id')!; // берём :id из URL
    return inject(UserService).getUserById(id); // запрос на пользовательские данные на сервер
};
```

`users-list.component.ts` - страница со списком пользователей
отвечает за:
- показ списка
- обработку клика
- передачу в URL:
    1. id, 
    2. query params, 
    3. fragment

это "откуда" мы уходим

```ts
// users-list.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
    selector: 'app-users-list',
    template: `<button (click)="openUser(42)">Open user 42</button>`
})

export class UsersListComponent {
    constructor(private router: Router) {}

    openUser(id: number) {
        this.router.navigate(['/users', id], {
        queryParams: { tab: 'posts' },
        fragment: 'comments'
        });
        // получится: /users/42?tab=posts#comments
    }
}
```

`user-profile.component.ts` - страница профиля одного пользователя.
отвечает за чтение из роута: 
1. id, 
2. query params, 
3. fragment data

это "куда" мы приходим
```ts
//user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
    selector: 'app-user-profile',
    template: `
        <h2>{{ title }}</h2>
        <p>Role: {{ role }}</p>
        <p>User id: {{ userId }}</p>
        <p>Tab: {{ tab }}</p>
        <p>Fragment: {{ fragment }}</p>
        <pre>{{ user | json }}</pre>
    `
})

export class UserProfileComponent implements OnInit {
    // определяет типы и дефолтные значения свойствам обьекта (properties)
    userId: string | null = null;
    tab: string | null = null;
    fragment: string | null = null;
    title = '';
    role = '';
    user: any;

    // задает параметры этим свойствам обьекта (properties)
    // получает данные из резолвера и присваивает обьекту
    // затем ангулар собирает HTML из этого класса когда в App вызывается UserProfileComponent()
    // в него не требуется ничего передавать, потому что резолвер + user-profile.component.ts + роут -- сами собирают в снепшот дату для создания
    
    constructor(private route: ActivatedRoute) {} // ВОТ ТУТ ПЕРЕДАЕТСЯ ОБЪЕКТ СОДЕРЖАЩИЙ SNAPSHOT

    ngOnInit() {
        // именно это и есть snapshot -- параметры берутся только один раз, на момент открытия компонента.

        // route param: /users/:id
        this.userId = this.route.snapshot.paramMap.get('id'); // "42"
        
        // query param: ?tab=posts
        this.tab = this.route.snapshot.queryParamMap.get('tab'); // "posts"
        
        // fragment: #comments
        this.fragment = this.route.snapshot.fragment; // "comments"
        
        // static data из routes
        this.title = this.route.snapshot.data['title']; // "User Profile"
        this.role = this.route.snapshot.data['role'];   // "member"
        
        // resolve data (результат resolver)
        this.user = this.route.snapshot.data['user'];
    }
}
```

#### Зачем нужен `snapshot`?
- Snapshot нужен, чтобы на уже открытой странице прочитать, куда пришел юзер.

#### В чем польза?
- Без параметров роута, пришлось бы хранить айди пользователя где-то в сервисе или глобальной переменной. При переходе на профиль, пришлось бы надеяться, что айди еще там, потому что обновление страницы стирает из памяти непостоянные данные.
- Snapshot читает параметры один раз, потом можно их сохранить и переиспользовать.
- Параметры можно использовать на компоненте, положить в localStorage, закешировать, использовать в запросах, условиях, логах.
- Snapshot сам переменные не обновит, для этого нужен `subscribe`.

#### Что произошло в примере?
- Snapshot "сфотографировал" текущий URL и его данные и читает их один раз в момент вызова. Когда становится известен айди, работа происходит с ним, а не с роутером. 

#### Связь файлов в примере:
```
users-list.component.ts    
        │    <- navigate(...)
        ▼
    app.routes.ts    <- находит подходящий path
        │
        ├─ data: { title, role }    <- static data уже здесь
        └─ resolve: { user: ... }
                │
                ▼
        user.resolver.ts
                │  <- берёт :id, зовёт UserService
                ▼
        готовый user кладётся в route.data['user']
                │
                ▼
user-profile.component.ts   <- в ngOnInit читает route.snapshot.*
```
#### Последовательность выполнения
1. происходит клик в списке:
    - URL становится http://example.com/users/42?tab=posts#comments
    - профиль еще не открыт
    - запрошен переход

2. роутер смотрит app.routes.ts
    - находит:
        - path: 'users/:id' \\ берет из URL
        - component: UserProfileComponent \\ описан в routes относится к URL
        - data: { title, role } \\ статик
        - resolve { user: userResolver } \\ резолвер выполняет запрос данных на сервер
    - ангулар понимает значения:
        - id \\ из URL
        - static \\ уже известно
        - запускает резолвер перед рендером компонента \\ просит недостающие данные 

3. работает резолвер
    - берет id из URL
    - идёт в сервис/сервер
    - возвращает объект user

4. Когда навигация успешна, Angular создаёт/обновляет ActivatedRoute для этого роута.
    - создается `snapshot`:
        - paramMap \\ id: "42"
        - queryParamMap \\ tab: "posts"
        - fragment \\ "comments"
        - data.title \\ "User Profile"
        - data.role \\ "member"
        - data.user \\ объект от resolver
    - `snapshot` = “готовое состояние маршрута после матчинга + resolve”.

5. Создается компонент профиля
    - Ангулар вставляет его в `router-outlet`
    - В конструкторе внедряется доступ к маршруту `constructor(private route: ActivatedRoute) {}`; данные еще не записываются

6. `ngOnInit` читает `snapshot` в поля компонента
    - заполняются поля компонента.
    - ангулар рендерит шаблон компонента с этими значениями.

#### Цепочка чтения:
```
URL + routes + resolve <- данные в разных местах
        │
ActivatedRoute 
        └── snapshot: ActivatedRouteSnapshot  <- объект в находится в памяти Router как `ActivatedRoute.snapshot`
        │
this.userId / this.tab / this.user   <- запись полей компонента в шаблон
        │
шаблон {{ userId }}  <- рендер шаблона на странице
```

Все я все понял. Снепшот - это сборный обьект, который хранит в себе разные данные о юрл или роуте в одном месте перед рендером компонента.

---

### 2. Observable way -- подписка на изменения
Для улучшения производительности, ангулар переиспользует компоненты. Если у нас был компонент с деталями юзера и мы переходим от одного юзера к другому, следующий компонент может не быть перезагружен, что значит `ngOnInit` не вызовется - что проблемно.

Альтернатива снепшоту -- обзервабл. Он представляется как поток, позволяет 0 и более ивентам с коллбеками обработаться.

Мы можем инициировать обзервабл, и он, при перемещениях по маршрутам, со временем, даст доступ к большему числу параметров.
`Observable` работает по похожему принципу со `snapshot`, через `ActivatedRoute.paramMap` свойство.

1. Сначала импортируем `ActivatedRoute`
2. Inject `ActivatedRoute` модуль в конструктор
3. на `ngOnInit` подписываемся `subscribe` к `observable`

```ts 
export class UserProfileComponent implements OnInit {
    // определяет типы и дефолтные значения свойствам обьекта (properties)
    userId: string | null = null;
    tab: string | null = null;
    fragment: string | null = null;
    title = '';
    role = '';
    user: any;
    
    constructor(private route: ActivatedRoute) {} 

    ngOnInit(){
        this.route.paramMap.subscribe(
            params => {this.userid = params.get('id');}     // subscribe the parameter to change
        );
    }

    ngOnDestroy(){
        this.route.subscription.unsubscribe();
    }
}
```
Обзервер продолжит обновлять `userid` до тех пор, пока его не отпишет метод отписки `unsubscribe()`.
Референс на подписку можно сохранить в переменной.
На удаление компонента, обзервер нужно удалить, чтобы не случилось утечки памяти.

Я специально переиспользовал пример из пункта о снепшоте, чтобы не растягивать файл еще больше. Логика в принципе такая же, только теперь параметр всегда обновляется.

Как я понимаю, сначала параметр обновляется, observer отправил новый параметер, subscribe сохранил новое значение параметра, а затем рендерится новый компонент с правильными параметрами.
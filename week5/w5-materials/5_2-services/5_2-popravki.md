# 5_2 — Services: поправки

**Курс:** 3813ICT, неделя 5
**Источник:** `5_2-Services.pdf`
**Связанные файлы:** [конспект](5_2-services-konspekt.md) · [примеры](5_2-services-primery.md) · [вопросы](5_2-services-voprosy.md) · [ответы](5_2-services-otvety.md)

Каждая поправка устроена одинаково: как это подано в материале, пример кода из материала (если есть), в чём несоответствие, как правильно и полный пример с пояснениями.

**Обозначения:**

- 🔴 **Ошибка** — если сделать как в материале, код не заработает или поведение будет не тем, которого ждёшь.
- 🟡 **Неточность** — формулировка вводит в заблуждение или недоговаривает важное.
- 🔵 **Устарело** — раньше было верно, сейчас делают иначе.

## Сводка

| № | Тема | Тип | Коротко |
|---|---|---|---|
| [П-1](#p-1) | Когда создаётся сервис | 🟡 | Не при старте приложения, а при первом запросе; живёт до перезагрузки страницы |
| [П-2](#p-2) | «Angular не обеспечивает singleton» | 🟡 | Число экземпляров определяется тем, где сервис зарегистрирован |
| [П-3](#p-3) | `providedIn` как «модуль» | 🔵 | Привязка к модулю устарела; `'root'` — стандарт, плюс tree-shaking |
| [П-4](#p-4) | Имена файлов из CLI | 🔵 | С Angular 20 CLI по умолчанию создаёт `book.ts` и класс `Book` |
| [П-5](#p-5) | Синтаксис в примере с книгами | 🔴 | `books:Books[] = ...` — не объявление переменной; фрагмент не компилируется |
| [П-6](#p-6) | `private` у сервиса | 🟡 | `private`-поле недоступно шаблону |
| [П-7](#p-7) | Конструктор или `inject()` | 🔵 | Рекомендуется `inject()`; у него есть ограничение — контекст внедрения |
| [П-8](#p-8) | `DataService` без типов | 🔴 | Не компилируется со строгими настройками TypeScript |
| [П-9](#p-9) | `[(ngModel)]` без `FormsModule` | 🔴 | В standalone-компоненте нужен `imports: [FormsModule]` |
| [П-10](#p-10) | Пароли в сервисе и консоли | 🟡 | Пароли не хранят на клиенте и не выводят в консоль |
| [П-11](#p-11) | Web API и синхронный `getBooks()` | 🟡 | Данные с сервера приходят асинхронно — метод возвращает `Observable` |

---

<a id="p-1"></a>

## П-1. Когда создаётся сервис 🟡

### Как в материале

Сервис описан как singleton: у класса существует только один экземпляр. Дальше уточняется, что singleton-сервис — это класс, экземпляр которого создаётся один раз при старте приложения и существует всё время его работы, а все компоненты и сервисы пользуются этим одним экземпляром. Рядом схема: сервис в центре, вокруг — компоненты, которые к нему обращаются.

### Пример из материала

Кода нет.

### В чём несоответствие

- Сервис с `providedIn: 'root'` создаётся **лениво**: в момент первого запроса (первого `inject()` или первого компонента, у которого он в конструкторе), а не при старте. Если сервис ни разу не запросили, экземпляра нет, а благодаря tree-shaking (см. [П-3](#p-3)) его код может даже не попасть в сборку.
- «Всё время работы приложения» означает — пока открыта страница. Перезагрузка (F5) или закрытие вкладки уничтожают все экземпляры, и данные, которые сервис держал в памяти, пропадают.

Это важно по двум причинам. Код в конструкторе сервиса (например, начальная загрузка данных) выполнится не при запуске, а при первом использовании. И сервис сам по себе не сохраняет данные между загрузками страницы — для этого нужны хранилища из темы 5_1.

### Как правильно

Сервис с `providedIn: 'root'` создаётся при первом запросе, дальше переиспользуется всеми и живёт до закрытия или перезагрузки страницы.

### Пример

```ts
// ═════ src/app/services/book.service.ts ═════
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BookService {
  constructor() {
    console.log('BookService создан'); // когда появится эта строка?
  }
}

// ═════ src/app/app.routes.ts ═════
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { BookListComponent } from './pages/book-list/book-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },           // BookService НЕ использует
  { path: 'books', component: BookListComponent },  // использует: inject(BookService)
];

// Что увидишь в консоли:
// 1. Открыл /                   → ничего: сервис никому не нужен и не создан
// 2. Перешёл на /books          → "BookService создан": первый inject
// 3. Ушёл на / и снова на /books → ничего: экземпляр уже есть, его переиспользуют
// 4. F5 на /books               → "BookService создан" снова: страница перезагружена,
//                                  прежний экземпляр и все его данные исчезли
```

**Пояснения:**

- Шаг 3 показывает singleton: компонент `BookListComponent` создаётся заново при каждом переходе, а сервис — нет.
- Шаг 4 показывает границу жизни сервиса: F5 начинает всё с нуля.

---

<a id="p-2"></a>

## П-2. «Angular не обеспечивает singleton» 🟡

### Как в материале

Сказано, что сервис обычно проектируют как singleton, то есть с одним экземпляром, но Angular такое поведение не навязывает, хотя singleton-сервисы встречаются часто.

### Пример из материала

Кода нет.

### В чём несоответствие

Формулировка оставляет впечатление, что один экземпляр получится или не получится как повезёт. На деле количество экземпляров полностью определяется тем, **где сервис зарегистрирован**:

- `providedIn: 'root'` гарантирует ровно один экземпляр на всё приложение;
- отдельные экземпляры появляются, только если сервис явно указан в массиве `providers` компонента или маршрута.

Инжекторы в Angular образуют дерево: корневой, под ним инжекторы маршрутов и компонентов. Компонент ищет сервис, поднимаясь от своего инжектора к корню, и берёт первый найденный. Поэтому `providers` в компоненте — не случайность, а инструмент: так делают, когда каждому экземпляру компонента нужно своё независимое состояние.

### Как правильно

| Где зарегистрирован | Сколько экземпляров |
|---|---|
| `@Injectable({ providedIn: 'root' })` | один на всё приложение |
| `providers: [X]` в маршруте | один на маршрут и его дочерние маршруты |
| `providers: [X]` в компоненте | свой у каждого экземпляра компонента и его дочерних компонентов |

### Пример

```ts
// ═════ src/app/services/draft.service.ts ═════
import { Injectable } from '@angular/core';

// Без providedIn: сам по себе нигде не зарегистрирован,
// его подключают в providers там, где нужен
@Injectable()
export class DraftService {
  text = '';
}

// ═════ src/app/components/chat-window/chat-window.component.ts ═════
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DraftService } from '../../services/draft.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-window',
  imports: [FormsModule],
  providers: [DraftService],             // у КАЖДОГО <app-chat-window> свой DraftService
  template: `<textarea [(ngModel)]="draft.text"></textarea>`,
})
export class ChatWindowComponent {
  protected draft = inject(DraftService); // свой экземпляр этого окна
  private auth = inject(AuthService);     // не в providers → общий из корня
}

// ═════ Где-то в шаблоне страницы ═════
// <app-chat-window />   ← DraftService №1
// <app-chat-window />   ← DraftService №2: текст в окнах не смешивается

// ═════ src/app/app.routes.ts — уровень маршрута ═════
export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    providers: [AdminStatsService],       // один экземпляр на /admin и его дочерние маршруты
  },
];
```

**Пояснения:**

- `@Injectable()` без `providedIn` означает: «этот класс можно внедрять, но где его регистрировать, решит тот, кто подключает».
- Экземпляр из `providers` компонента уничтожается вместе с компонентом. Если закрыть окно чата, его черновик исчезнет.

---

<a id="p-3"></a>

## П-3. `providedIn` как «модуль, где объявлен сервис» 🔵

### Как в материале

Свойство `providedIn` названо важным: оно указывает, в каком модуле объявлен сервис. По умолчанию значение `'root'` означает, что сервис доступен во всём приложении и предоставляется корневым инжектором.

### Пример из материала

```ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor() { }
}
```

### В чём несоответствие

- Про `'root'` сказано верно.
- Формулировка «в каком модуле объявлен» пришла из времён NgModule. Когда-то в `providedIn` можно было указать класс модуля, но этот вариант, как и значение `'any'`, устарел (deprecated с Angular 15). Современные приложения строятся на standalone-компонентах без модулей.
- Из осмысленных значений остались `'root'` (стандарт) и `'platform'` (редкий случай, когда несколько Angular-приложений на одной странице делят сервис).
- Вместо модулей сервис регистрируют в `providers` маршрута или компонента, если нужен не общий экземпляр (см. [П-2](#p-2)).
- Не упомянута важная выгода `providedIn: 'root'` — **tree-shaking**: если сервис нигде не внедряется, сборщик выбрасывает его из итогового бандла.

### Как правильно

`providedIn: 'root'` регистрирует сервис в корневом инжекторе: один экземпляр, доступен везде, неиспользуемый сервис не попадает в сборку. Для отдельных экземпляров — `providers` в маршруте или компоненте.

### Пример

```ts
// ✅ Стандарт: общий сервис на всё приложение
@Injectable({ providedIn: 'root' })
export class GroupService {}

// ✅ Сервис без автоматической регистрации — подключают в providers там, где нужен
@Injectable()
export class DraftService {}

// ❌ Устарело: привязка к модулю и значение 'any'
// @Injectable({ providedIn: AppModule })
// @Injectable({ providedIn: 'any' })

// Tree-shaking на практике:
// если ни один компонент не делает inject(GroupService),
// класс GroupService не попадёт в собранный JavaScript
```

---

<a id="p-4"></a>

## П-4. Имена файлов, которые создаёт CLI 🔵

### Как в материале

Показано, что команда `ng generate service book` создаёт сервис с классом `BookService`, и приведён код, который получается по умолчанию. Предлагается складывать сервисы в отдельную папку командой `ng generate service services/book`.

### Пример из материала

```ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor() { }
}
```

### В чём несоответствие

С Angular 20 изменилось руководство по стилю, и CLI в **новых** проектах по умолчанию не добавляет суффиксы к компонентам, директивам, сервисам и пайпам. Команда `ng generate service book` в таком проекте создаст файл `book.ts` с классом `Book`, а не `book.service.ts` с классом `BookService`.

Для проектов, обновлённых со старых версий через `ng update`, миграция прописывает в `angular.json` настройки, которые сохраняют прежние имена с суффиксами.

Совет про папку `services` остаётся актуальным.

### Как правильно

| Проект | `ng g s book` создаёт |
|---|---|
| создан в Angular 20 или новее | `book.ts`, класс `Book` |
| создан раньше или обновлён через `ng update` | `book.service.ts`, класс `BookService` |

Проверить свой проект просто: корневой компонент в файле `app.ts` — суффиксов нет; в `app.component.ts` — есть.

### Пример

```bash
# Новый проект (Angular 20+): без суффикса
ng g s services/book
# → src/app/services/book.ts, export class Book

# Тот же проект, но с суффиксом для одного сервиса
ng g s services/book --type=service
# → src/app/services/book.service.ts, export class BookService
```

Чтобы суффикс добавлялся всегда, в `angular.json` в настройках проекта указывают значение по умолчанию для схемы сервиса:

```json
{
  "projects": {
    "chat-app": {
      "schematics": {
        "@schematics/angular:service": { "type": "service" }
      }
    }
  }
}
```

**Пояснения:**

- Без суффикса имя сервиса легко спутать с моделью данных: класс `Book` (сервис) и интерфейс `Book` (книга) в одном проекте конфликтуют. Если используешь стиль без суффиксов, называй сервис по действию: `BookStore`, `BookApi`.
- Главное — единообразие внутри одного проекта.

---

<a id="p-5"></a>

## П-5. Синтаксис в примере с книгами 🔴

### Как в материале

На двух слайдах показано, как использовать сервис в компоненте: через конструктор и через `inject()`. В обоих примерах есть класс компонента, который получает `BookService`, и метод `listBook()`, в котором результат `getBooks()` присваивается переменной с типом массива книг. Про конструктор сказано, что сервис объявлен как `private`, потому что используется только внутри класса.

### Пример из материала

```ts
import { BookService } from ‘../book.service’;
class BookComponent {
constructor(private bookService: BookService) {
}
listBook(){
books:Books[] = this.bookService.getBooks();
}
}
```

### В чём несоответствие

1. **`books:Books[] = ...` — не объявление переменной.** Внутри метода переменную объявляют через `const` или `let`. Без них TypeScript понимает `books:` как метку (label) JavaScript, после чего `Books[] = ...` — синтаксическая ошибка, и файл не скомпилируется.
2. **Тип `Books`** нигде не объявлен. Обычно модель одной книги называют в единственном числе — `Book`, а массив книг — `Book[]`.
3. **Результат теряется.** Даже с исправленным объявлением переменная живёт только внутри метода, и в шаблон список не попадёт. Нужно поле класса.
4. **Класс без `@Component` и `export`** — это не компонент: его нельзя подключить к маршруту или шаблону.
5. **Типографские кавычки** `‘ ’` в импорте дают `SyntaxError` при копировании.

Это иллюстрация идеи, а не рабочий код, но из-за п. 1 его легко скопировать и получить непонятную ошибку.

### Как правильно

Переменную внутри метода объявляют через `const`/`let` с типом `Book[]`; чтобы список попал в шаблон, его кладут в поле класса; класс оформляют как компонент.

### Пример

```ts
// ═════ src/app/services/book.service.ts ═════
import { Injectable } from '@angular/core';

export interface Book {           // модель одной книги
  id: number;
  title: string;
  author: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private books: Book[] = [
    { id: 1, title: 'Clean Code', author: 'Robert C. Martin' },
    { id: 2, title: 'Refactoring', author: 'Martin Fowler' },
  ];

  getBooks(): Book[] {
    return [...this.books];
  }
}

// ═════ src/app/pages/book-list/book-list.component.ts ═════
import { Component, OnInit, inject } from '@angular/core';
import { Book, BookService } from '../../services/book.service';

@Component({                       // без декоратора это не компонент
  selector: 'app-book-list',
  template: `
    <ul>
      @for (book of books; track book.id) {
        <li>{{ book.title }} — {{ book.author }}</li>
      }
    </ul>
  `,
})
export class BookListComponent implements OnInit {   // export — чтобы подключить к маршруту
  private bookService = inject(BookService);
  books: Book[] = [];              // поле класса — его видит шаблон

  ngOnInit(): void {
    this.listBooks();
  }

  listBooks(): void {
    // ✅ Локальная переменная: const + имя + тип
    const books: Book[] = this.bookService.getBooks();
    this.books = books;            // в поле класса → попадёт в шаблон

    // ❌ Как в материале: метка "books:" и синтаксическая ошибка
    // books:Books[] = this.bookService.getBooks();
  }
}
```

---

<a id="p-6"></a>

## П-6. `private` у сервиса и шаблон 🟡

### Как в материале

Про внедрение через конструктор сказано, что сервис объявлен как `private`, потому что его область видимости — только этот класс.

### Пример из материала

```ts
constructor(private bookService: BookService) {
}
```

### В чём несоответствие

Для кода класса это верно. Но у компонента есть ещё шаблон, и материал не говорит, что `private`-поле шаблону **недоступно**. Если шаблон обратится к такому сервису (например, `{{ bookService.count }}`), Angular при компиляции шаблона выдаст ошибку: свойство приватное и доступно только внутри класса.

Поэтому выбор модификатора зависит от того, нужен ли сервис шаблону. С Angular 14 шаблон может обращаться к `protected`-полям — это правильный выбор, когда сервис используется в шаблоне, но не должен быть виден другим классам.

### Как правильно

| Модификатор | Код класса | Шаблон | Другие классы |
|---|---|---|---|
| `private` | да | **нет** | нет |
| `protected` | да | да | нет (кроме наследников) |
| `public` | да | да | да |

Шаблон не использует сервис — `private`. Использует — `protected`.

### Пример

```ts
import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-header',
  template: `
    <span>{{ auth.currentUser()?.username }}</span>
    <button (click)="logout()">Выйти</button>
  `,
})
export class HeaderComponent {
  // Шаблон обращается к auth → protected.
  // С private здесь была бы ошибка компиляции шаблона
  protected auth = inject(AuthService);

  // Используется только в коде класса → private
  private logger = inject(LoggerService);

  logout(): void {
    this.logger.log('Пользователь вышел');
    this.auth.logout();
  }
}
```

---

<a id="p-7"></a>

## П-7. Конструктор или `inject()` 🔵

### Как в материале

Показаны два способа внедрить сервис в компонент: через параметр конструктора и через функцию `inject()` в поле класса. Они поданы как равноценные альтернативы, без рекомендации, какой выбрать, и без ограничений.

### Пример из материала

```ts
import { BookService } from ‘../book.service’;
import {inject} from '@angular/core';
class BookComponent {
private bookService = inject(BookService);
listBook(){
books:Books[] = this.bookService.getBooks();
}
}
```

### В чём несоответствие

1. **Нет рекомендации.** Современное руководство по стилю Angular рекомендует `inject()`: он короче, работает в функциях (гарды, фабрики) и не требует передавать зависимости через `super(...)` при наследовании. Конструктор остаётся рабочим, и его нужно уметь читать.
2. **Не сказано главное ограничение `inject()`.** Он работает только в **контексте внедрения** — пока Angular создаёт класс или сам вызывает функцию:
   - в инициализаторах полей класса;
   - в конструкторе;
   - в функциях, которые вызывает Angular: функциональных гардах, резолверах, фабриках провайдеров.

   В обычном методе, обработчике события, `setTimeout` или после `await` вызов `inject()` падает с ошибкой `NG0203` («inject() must be called from an injection context»).

### Как правильно

Внедрять через `inject()` в полях класса. Если зависимость нужна в методе — брать её из поля, а не вызывать `inject()` в самом методе.

### Пример

```ts
import { Component, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-book-list',
  template: `<button (click)="reload()">Обновить</button>`,
})
export class BookListComponent {
  // ✅ Поле класса — контекст внедрения
  private bookService = inject(BookService);

  // ✅ Конструктор — тоже контекст внедрения (эквивалентная старая запись)
  // constructor(private bookService: BookService) {}

  reload(): void {
    // ✅ Берём зависимость из поля
    this.bookService.getBooks();

    // ❌ NG0203: метод, вызванный по клику, — не контекст внедрения
    // const service = inject(BookService);
  }
}

// ✅ Функциональный гард: Angular вызывает его сам → inject() работает
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/login']);
};
```

---

<a id="p-8"></a>

## П-8. `DataService` без типов 🔴

### Как в материале

Показан сервис для управления данными: в нём объект `jsonItems`, метод `setItem`, который кладёт значение под ключом, и метод `getItem`, который достаёт значение по ключу. Сказано, что данные и методы такого сервиса удобно использовать и изменять из нескольких компонентов.

### Пример из материала

```ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  jsonItems = {};

  setItem(key, item) {
    this.jsonItems[key] = item;
  }

  getItem(key) {
    return this.jsonItems[key];
  }
}
```

### В чём несоответствие

В новых проектах Angular CLI в `tsconfig.json` включён строгий режим (`"strict": true`). В нём этот код не компилируется:

- параметры `key` и `item` без типа → ошибка «Parameter 'key' implicitly has an 'any' type» (TS7006);
- `jsonItems = {}` получает тип «пустой объект», и обращение `this.jsonItems[key]` даёт ошибку «Element implicitly has an 'any' type because expression … can't be used to index type '{}'» (TS7053).

Кроме того, поле `jsonItems` публичное: любой компонент может изменить его напрямую в обход методов, и тогда сервис теряет контроль над своими данными.

### Как правильно

- Указать типы параметров и возвращаемых значений.
- Объявить хранилище с типом «словарь»: `Record<string, string>` (или `Map<string, string>`).
- Закрыть данные (`private`) и отдавать наружу копию.
- Если данные должны сразу отображаться в других компонентах — хранить их в сигнале (см. [конспект §6.3](5_2-services-konspekt.md#s6-3)).

### Пример

```ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Record<string, string>: объект, у которого ключи и значения — строки.
  // private: менять данные можно только через методы ниже
  private items: Record<string, string> = {};

  setItem(key: string, value: string): void {
    this.items[key] = value;                 // типы известны → строгий режим доволен
  }

  getItem(key: string): string | undefined {
    return this.items[key];                  // undefined, если ключа нет — это видно по типу
  }

  getAll(): Record<string, string> {
    return { ...this.items };                // копия: снаружи не испортить внутренний объект
  }

  removeItem(key: string): void {
    delete this.items[key];
  }
}
```

**Пояснения:**

- `string | undefined` в типе результата заставляет вызывающий код учесть случай, когда ключа нет.
- Тот же сервис на `Map` выглядел бы так: `private items = new Map<string, string>()`, методы `set`, `get`, `delete`. `Map` удобнее, если ключи часто добавляются и удаляются.

---

<a id="p-9"></a>

## П-9. `[(ngModel)]` без `FormsModule` 🔴

### Как в материале

Показан `TestComponent` и его шаблон: два поля ввода с `[(ngModel)]` для имени и пароля и кнопка, которая сохраняет пару в сервис. Импорт `NgForm` в компоненте закомментирован, других импортов для форм нет. Компонент описан без массива `imports`.

### Пример из материала

```ts
import { Component, OnInit } from '@angular/core';
// import { NgForm } from '@angular/forms';
import {DataService} from '../data.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  username = '';
  password = '';
  constructor(private dataService: DataService) {
  }
  setItem(){
    this.dataService.setItem(this.username, this.password);
    console.log(this.dataService.jsonItems);
  }
  ngOnInit() {
  }
}
```

### В чём несоответствие

Пример написан для приложений на NgModule, где `FormsModule` подключали один раз в `app.module.ts`. С Angular 19 компоненты по умолчанию standalone: каждый сам перечисляет в `imports` то, что использует его шаблон. Без `FormsModule` в `imports` компилятор не знает директиву `ngModel` и выдаёт ошибку `NG8002`: «Can't bind to 'ngModel' since it isn't a known property of 'input'».

### Как правильно

Добавить `FormsModule` в `imports` компонента, шаблон которого использует `[(ngModel)]`.

### Пример

```ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';        // ← импорт модуля форм
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-test',
  imports: [FormsModule],                            // ← без этого NG8002 на [(ngModel)]
  templateUrl: './test.component.html',
})
export class TestComponent {
  private dataService = inject(DataService);

  key = '';
  value = '';

  setItem(): void {
    this.dataService.setItem(this.key, this.value);
  }
}
```

**Пояснения:**

- `imports` компонента работает как список «что можно использовать в моём шаблоне»: другие компоненты, директивы, пайпы, модули вроде `FormsModule`.
- Встроенный синтаксис `@if` и `@for` импортировать не нужно, а `ngModel`, `routerLink` и сторонние компоненты — нужно.

---

<a id="p-10"></a>

## П-10. Пароли в сервисе и в консоли 🟡

### Как в материале

Компонент из примера сохраняет в сервис пары «имя пользователя → пароль» из двух полей ввода и после каждого сохранения выводит всё содержимое сервиса в консоль. Сказано, что эти пары потом можно получить в других компонентах.

### Пример из материала

```ts
setItem(){
  this.dataService.setItem(this.username, this.password);
  console.log(this.dataService.jsonItems);
}
```

### В чём несоответствие

Пример учебный, но закрепляет опасную привычку:

- **Пароль в сервисе** — это пароль в памяти JavaScript, доступный любому скрипту на странице (в том числе при XSS, см. [5_1 П-11](5_1-data-persistence-popravki.md#p-11)). Пароль нужен только в момент логина: он уходит на сервер и больше нигде на клиенте не хранится.
- **Пароль в консоли** виден любому, кто откроет DevTools, и легко попадает в скриншоты и логи.

### Как правильно

Для демонстрации сервиса хранить нейтральные данные (ключ и значение, настройки). Пароль передавать только в запросе логина; после входа хранить данные пользователя без пароля.

### Пример

```ts
// ✅ Демонстрация сервиса — нейтральные данные
this.dataService.setItem('theme', 'dark');
console.log(this.dataService.getAll());      // { theme: 'dark' } — ничего секретного

// ✅ Логин: пароль только в теле запроса, в ответ — пользователь без пароля
login(username: string, password: string): Observable<User> {
  return this.http.post<User>('/api/login', { username, password }).pipe(
    tap((user) => this.currentUser.set(user)), // user: { id, username, role } — без password
  );
}

// ❌ Никогда
// this.dataService.setItem(username, password);
// console.log(password);
```

---

<a id="p-11"></a>

## П-11. Web API и синхронный `getBooks()` 🟡

### Как в материале

Необходимость сервисов объясняется через Web API: приложения получают данные с веб-сервера, сервер предоставляет маршруты, которые принимают параметры и возвращают результат (часто JSON). Пример — API со списком книг, нужным на нескольких страницах, поэтому `getBooks()` выносится в сервис. В примере использования результат `getBooks()` сразу присваивается переменной-массиву.

### Пример из материала

```ts
listBook(){
books:Books[] = this.bookService.getBooks();
}
```

### В чём несоответствие

Мотивация (Web API) и пример (мгновенный массив) не сходятся. Запрос к серверу идёт по сети и отвечает не сразу, поэтому метод, который действительно ходит в Web API, не может вернуть массив немедленно. В Angular он возвращает `Observable` — объект, который «выдаст данные позже». Компонент подписывается на него через `subscribe()` и получает массив, когда ответ придёт.

Если написать `const books = this.bookService.getBooks()` для такого метода, в переменной окажется `Observable`, а не массив книг. Это тема файла 5_4 (HttpClient), но важно заранее понимать, что пример из материала показывает только устройство сервиса, а не работу с настоящим API.

### Как правильно

- Сервис, который работает с данными в памяти, может возвращать значение сразу.
- Сервис, который ходит на сервер, возвращает `Observable<Book[]>`, а компонент подписывается на него.

### Пример

```ts
// ═════ src/app/app.config.ts ═════
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],          // без этого HttpClient не внедрится
};

// ═════ src/app/services/book.service.ts ═════
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  id: number;
  title: string;
  author: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);

  // Возвращает не массив, а Observable: данные придут, когда ответит сервер
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>('http://localhost:3000/api/books');
  }
}

// ═════ src/app/pages/book-list/book-list.component.ts ═════
import { Component, OnInit, inject } from '@angular/core';
import { Book, BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  template: `
    @if (error) {
      <p>{{ error }}</p>
    }
    <ul>
      @for (book of books; track book.id) {
        <li>{{ book.title }}</li>
      }
    </ul>
  `,
})
export class BookListComponent implements OnInit {
  private bookService = inject(BookService);
  books: Book[] = [];
  error = '';

  ngOnInit(): void {
    // ❌ const books = this.bookService.getBooks(); — это Observable, а не массив

    // ✅ Подписываемся и получаем массив, когда придёт ответ
    this.bookService.getBooks().subscribe({
      next: (books) => (this.books = books),
      error: () => (this.error = 'Не удалось загрузить книги'),
    });
  }
}
```

**Пояснения:**

- Запрос отправляется только в момент `subscribe()`; без подписки HttpClient ничего не делает.
- Подробно `HttpClient`, `Observable` и обработка ошибок — в файле 5_4.

# 5_2 — Services: вопросы для самопроверки

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_2-services-konspekt.md) · [поправки](5_2-services-popravki.md) · [примеры](5_2-services-primery.md) · [ответы](5_2-services-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для вопросов с кодом — сначала предскажи результат или напиши код, потом проверь.
2. Если не знаешь, так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под каждым вопросом). В ответе есть ссылка на место в конспекте, где тема разобрана подробнее.
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Зачем нужны сервисы

<a id="q-1"></a>

### 1. Какую проблему решают сервисы?

Что такое сервис одной фразой? Назови три задачи, которые он решает.

[→ ответ](5_2-services-otvety.md#a-1)

<a id="q-2"></a>

### 2. Web API

Что такое Web API и что нужно знать и сделать, чтобы к нему обратиться?

[→ ответ](5_2-services-otvety.md#a-2)

<a id="q-3"></a>

### 3. Что выносят в сервисы

Назови четыре вида кода или данных, которые обычно выносят в сервисы.

[→ ответ](5_2-services-otvety.md#a-3)

---

## B. Внедрение зависимостей

<a id="q-4"></a>

### 4. Зависимость и её внедрение

Что такое зависимость? Что такое внедрение зависимостей (DI) и кто в Angular этим занимается?

[→ ответ](5_2-services-otvety.md#a-4)

<a id="q-5"></a>

### 5. Почему не `new`?

Что сломается, если в каждом компоненте написать так? Назови три проблемы.

```ts
export class CatalogComponent {
  private bookService = new BookService();
}
```

[→ ответ](5_2-services-otvety.md#a-5)

<a id="q-6"></a>

### 6. Термины

Объясни одной фразой: инжектор, провайдер, токен.

[→ ответ](5_2-services-otvety.md#a-6)

<a id="q-7"></a>

### 7. Два компонента просят один сервис

`CatalogComponent`, а затем `SearchComponent` вызывают `inject(BookService)`. Опиши по шагам, что делает инжектор в каждом случае.

[→ ответ](5_2-services-otvety.md#a-7)

---

## C. Создание сервиса

<a id="q-8"></a>

### 8. `@Injectable` и `providedIn: 'root'`

Что делает декоратор `@Injectable`? Какие три вещи даёт `providedIn: 'root'`?

[→ ответ](5_2-services-otvety.md#a-8)

<a id="q-9"></a>

### 9. Что создаст CLI?

Какой файл и какой класс создаст команда `ng g s services/book`? От чего это зависит и как быстро проверить свой проект?

[→ ответ](5_2-services-otvety.md#a-9)

<a id="q-10"></a>

### 10. `@Injectable()` без `providedIn`

Что означает `@Injectable()` без `providedIn`? Что будет, если компонент попросит такой сервис, а он нигде не указан в `providers`?

[→ ответ](5_2-services-otvety.md#a-10)

---

## D. Внедрение в компонент

<a id="q-11"></a>

### 11. Перепиши на `inject()`

```ts
export class BookListComponent {
  constructor(private bookService: BookService, private router: Router) {}
}
```

[→ ответ](5_2-services-otvety.md#a-11)

<a id="q-12"></a>

### 12. `private` в параметре конструктора

Что делает слово `private` перед параметром конструктора? Запиши ту же конструкцию в развёрнутом виде.

[→ ответ](5_2-services-otvety.md#a-12)

<a id="q-13"></a>

### 13. Найди ошибку

```ts
export class GroupsComponent {
  onDelete(id: number): void {
    const groupService = inject(GroupService);
    groupService.remove(id).subscribe();
  }
}
```

Что произойдёт и как исправить?

[→ ответ](5_2-services-otvety.md#a-13)

<a id="q-14"></a>

### 14. Где работает `inject()`

Перечисли места, где `inject()` можно вызывать. Какой способ внедрения рекомендует современный Angular?

[→ ответ](5_2-services-otvety.md#a-14)

<a id="q-15"></a>

### 15. Сервис в шаблоне

```ts
@Component({
  selector: 'app-header',
  template: `<span>{{ auth.currentUser()?.username }}</span>`,
})
export class HeaderComponent {
  private auth = inject(AuthService);
}
```

Скомпилируется ли это? Какой модификатор выбрать и почему?

[→ ответ](5_2-services-otvety.md#a-15)

<a id="q-16"></a>

### 16. Найди ошибки

```ts
listBook(){
  books:Books[] = this.bookService.getBooks();
}
```

Назови, что здесь не так, и запиши правильно.

[→ ответ](5_2-services-otvety.md#a-16)

---

## E. Singleton и области видимости

<a id="q-17"></a>

### 17. Singleton

Что такое singleton? Почему это свойство важно для обмена данными между компонентами?

[→ ответ](5_2-services-otvety.md#a-17)

<a id="q-18"></a>

### 18. Когда появится строка в консоли?

```ts
@Injectable({ providedIn: 'root' })
export class BookService {
  constructor() {
    console.log('BookService создан');
  }
}
```

Маршрут `/` открывает `HomeComponent` (сервис не использует), `/books` — `BookListComponent` (использует). Что будет в консоли на каждом шаге:

- а) открыл `/`;
- б) перешёл на `/books`;
- в) вернулся на `/` и снова открыл `/books`;
- г) нажал F5 на `/books`.

[→ ответ](5_2-services-otvety.md#a-18)

<a id="q-19"></a>

### 19. Данные сервиса после F5

Что случится с данными, которые хранятся в полях сервиса, после перезагрузки страницы? Как сделать, чтобы они её пережили?

[→ ответ](5_2-services-otvety.md#a-19)

<a id="q-20"></a>

### 20. Сколько экземпляров?

`DraftService` указан в `providers` компонента `ChatWindowComponent`. На странице три окна чата. Внутри каждого окна есть `MessageBoxComponent`, который тоже делает `inject(DraftService)`.

- а) Сколько экземпляров `DraftService` существует?
- б) Какой экземпляр получит `MessageBoxComponent`?
- в) Что произойдёт с экземпляром, когда окно закроют?

[→ ответ](5_2-services-otvety.md#a-20)

<a id="q-21"></a>

### 21. Где регистрировать?

Когда сервис регистрируют через `providedIn: 'root'`, когда в `providers` маршрута, а когда в `providers` компонента?

[→ ответ](5_2-services-otvety.md#a-21)

---

## F. Общие данные в сервисе

<a id="q-22"></a>

### 22. Почему не компилируется?

```ts
@Injectable({ providedIn: 'root' })
export class DataService {
  jsonItems = {};

  setItem(key, item) {
    this.jsonItems[key] = item;
  }
}
```

Почему этот код не компилируется в новом Angular-проекте? Исправь.

[→ ответ](5_2-services-otvety.md#a-22)

<a id="q-23"></a>

### 23. NG8002

Standalone-компонент с `[(ngModel)]` в шаблоне выдаёт ошибку `NG8002: Can't bind to 'ngModel' since it isn't a known property of 'input'`. Почему и как исправить?

[→ ответ](5_2-services-otvety.md#a-23)

<a id="q-24"></a>

### 24. Закрытые данные

Зачем данные в сервисе делают `private`, а наружу отдают копию или сигнал через `asReadonly()`?

[→ ответ](5_2-services-otvety.md#a-24)

<a id="q-25"></a>

### 25. Почему второй компонент не обновляется?

```ts
private readonly items = signal<Record<string, string>>({});

setItem(key: string, value: string): void {
  const current = this.items();
  current[key] = value;
  this.items.set(current);
}
```

Компонент, который читает `items()` в шаблоне, не перерисовывается после `setItem`. Почему? Исправь.

[→ ответ](5_2-services-otvety.md#a-25)

<a id="q-26"></a>

### 26. Что окажется в переменной?

```ts
getBooks(): Observable<Book[]> {
  return this.http.get<Book[]>('/api/books');
}

// в компоненте
const books = this.bookService.getBooks();
```

Что лежит в `books`? Как правильно получить массив книг?

[→ ответ](5_2-services-otvety.md#a-26)

---

## G. Архитектура и практика

<a id="q-27"></a>

### 27. Разделение обязанностей

Назови правила разделения обязанностей между сервисами и компонентами. Почему `AuthService` не должен работать с localStorage напрямую?

[→ ответ](5_2-services-otvety.md#a-27)

<a id="q-28"></a>

### 28. Сервис или компонент?

Где разместить каждое:

- а) запрос списка каналов группы на сервер;
- б) подсветку активного пункта меню при наведении;
- в) проверку «может ли текущий пользователь удалить группу» для показа кнопки;
- г) черновик сообщения, свой в каждом окне чата;
- д) текущего вошедшего пользователя.

[→ ответ](5_2-services-otvety.md#a-28)

<a id="q-29"></a>

### 29. Экземпляр один?

Компоненты видят разные данные из одного сервиса. Как быстро проверить, сколько экземпляров сервиса создано, и какая обычно причина?

[→ ответ](5_2-services-otvety.md#a-29)

<a id="q-30"></a>

### 30. Подмена реализации

Что делает запись `{ provide: StorageService, useClass: MemoryStorageService }`? Зачем это нужно и почему такое невозможно, если сервис создавать через `new`?

[→ ответ](5_2-services-otvety.md#a-30)

# 5_1 — Data Persistence: вопросы для самопроверки

**Курс:** 3813ICT, неделя 5
**Связанные файлы:** [конспект](5_1-data-persistence-konspekt.md) · [поправки](5_1-data-persistence-popravki.md) · [примеры](5_1-data-persistence-primery.md) · [ответы](5_1-data-persistence-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для вопросов с кодом — сначала предскажи результат, потом проверь в консоли браузера.
2. Если не знаешь, так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под каждым вопросом). В ответе есть ссылка на место в конспекте, где тема разобрана подробнее.
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Общее

<a id="q-1"></a>

### 1. Что такое data persistence?

Что это такое и зачем оно нужно SPA на Angular? Что произойдёт с состоянием приложения при F5, если его нигде не хранить?

[→ ответ](5_1-data-persistence-otvety.md#a-1)

<a id="q-2"></a>

### 2. Четыре хранилища

Назови четыре клиентских хранилища. Какие из них относятся к Web Storage API?

[→ ответ](5_1-data-persistence-otvety.md#a-2)

---

## B. localStorage и sessionStorage

<a id="q-3"></a>

### 3. Методы

Какие методы и свойства есть у localStorage? Что вернёт `getItem` для ключа, которого нет?

[→ ответ](5_1-data-persistence-otvety.md#a-3)

<a id="q-4"></a>

### 4. Что выведет код?

```js
localStorage.setItem('user', { name: 'anna' });
console.log(localStorage.getItem('user'));
```

А что будет, если это TypeScript-файл?

[→ ответ](5_1-data-persistence-otvety.md#a-4)

<a id="q-5"></a>

### 5. Что выведет код?

```js
localStorage.setItem('muted', false);

if (localStorage.getItem('muted')) {
  console.log('звук выключен');
} else {
  console.log('звук включён');
}
```

[→ ответ](5_1-data-persistence-otvety.md#a-5)

<a id="q-6"></a>

### 6. Напиши код

Сохрани объект `user = { id: 2, username: 'anna', role: 'groupadmin' }` в localStorage и напиши функцию `readUser()`, которая безопасно его читает: возвращает `null`, если ключа нет или данные испорчены.

[→ ответ](5_1-data-persistence-otvety.md#a-6)

<a id="q-7"></a>

### 7. Origin

Из чего состоит origin? Один ли origin у каждой пары:

- а) `http://localhost:4200` и `http://localhost:3000`;
- б) `https://chat.com/groups` и `https://chat.com/admin`;
- в) `http://chat.com` и `https://chat.com`.

[→ ответ](5_1-data-persistence-otvety.md#a-7)

<a id="q-8"></a>

### 8. «Пропавший» логин

Ты залогинился в приложении на `localhost:4200` (`ng serve`), данные пользователя сохранены в localStorage. Потом открыл собранный билд, который отдаёт Express на `localhost:3000`, — и приложение считает тебя незалогиненным. Почему? Это баг в коде?

[→ ответ](5_1-data-persistence-otvety.md#a-8)

<a id="q-9"></a>

### 9. localStorage и sessionStorage

Назови два отличия localStorage от sessionStorage.

[→ ответ](5_1-data-persistence-otvety.md#a-9)

<a id="q-10"></a>

### 10. Где будет значение?

Во вкладке A выполнили `sessionStorage.setItem('x', '1')`. Что вернёт `sessionStorage.getItem('x')`:

- а) во вкладке A после F5;
- б) в новой вкладке, открытой вручную на тот же адрес;
- в) в дубликате вкладки A («Дублировать вкладку»);
- г) в новой вкладке после того, как вкладку A закрыли (браузер остался открыт)?

[→ ответ](5_1-data-persistence-otvety.md#a-10)

<a id="q-11"></a>

### 11. Синхронность

localStorage синхронный. Что это значит и какое из этого практическое следствие?

[→ ответ](5_1-data-persistence-otvety.md#a-11)

<a id="q-12"></a>

### 12. Проверка поддержки

Почему проверка `typeof(Storage) !== 'undefined'` из материала устарела? Какие реальные проблемы при работе с хранилищем стоит обрабатывать?

[→ ответ](5_1-data-persistence-otvety.md#a-12)

---

## C. Хуки жизненного цикла Angular

<a id="q-13"></a>

### 13. `ngOnInit` и `$(document).ready`

Верно ли, что `ngOnInit` делает то же самое, что `$(document).ready` в jQuery? В каком хуке работать с localStorage, а в каком — с элементом шаблона?

[→ ответ](5_1-data-persistence-otvety.md#a-13)

<a id="q-14"></a>

### 14. Найди ошибку

```ts
@Component({
  selector: 'app-chat-input',
  template: `<input #box>`,
})
export class ChatInputComponent implements OnInit {
  @ViewChild('box') box!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.box.nativeElement.focus();
  }
}
```

Что произойдёт и как исправить?

[→ ответ](5_1-data-persistence-otvety.md#a-14)

---

## D. Cookies

<a id="q-15"></a>

### 15. Зачем нужны куки

Какую проблему протокола HTTP решают куки?

[→ ответ](5_1-data-persistence-otvety.md#a-15)

<a id="q-16"></a>

### 16. Путь куки

Опиши путь куки от сервера к браузеру и обратно. Какие HTTP-заголовки в этом участвуют? Может ли куку создать не сервер?

[→ ответ](5_1-data-persistence-otvety.md#a-16)

<a id="q-17"></a>

### 17. Размер

Какой максимальный размер одной куки? Почему куки должны быть маленькими?

[→ ответ](5_1-data-persistence-otvety.md#a-17)

<a id="q-18"></a>

### 18. Применение

Назови три основных применения кук с примерами.

[→ ответ](5_1-data-persistence-otvety.md#a-18)

<a id="q-19"></a>

### 19. Сессионная и постоянная кука

Чем сессионная кука отличается от постоянной? Когда удаляется сессионная — при закрытии вкладки или браузера? Чем это отличается от sessionStorage?

[→ ответ](5_1-data-persistence-otvety.md#a-19)

<a id="q-20"></a>

### 20. Атрибуты

Объясни одной фразой каждый атрибут: `Expires`, `Max-Age`, `Secure`, `HttpOnly`, `Domain`, `Path`, `SameSite`.

[→ ответ](5_1-data-persistence-otvety.md#a-20)

<a id="q-21"></a>

### 21. Что будет с этой кукой сегодня?

```js
document.cookie = 'fruit=banana; expires=Fri, 31 Dec 2020 23:59:59 GMT';
```

[→ ответ](5_1-data-persistence-otvety.md#a-21)

<a id="q-22"></a>

### 22. Удаление

Как из JS удалить куку `theme`, созданную с `path=/`? В каких случаях удаление не сработает?

[→ ответ](5_1-data-persistence-otvety.md#a-22)

<a id="q-23"></a>

### 23. Чтение

Что возвращает `document.cookie` при чтении? Видны ли там куки с `HttpOnly`?

[→ ответ](5_1-data-persistence-otvety.md#a-23)

<a id="q-24"></a>

### 24. Куки и порты

Сервер на `localhost:3000` поставил куку `lang=ru` (без `HttpOnly`) и записал в localStorage `lang = 'ru'` на странице, отданной с 3000. Что из этого увидит страница на `localhost:4200`?

[→ ответ](5_1-data-persistence-otvety.md#a-24)

<a id="q-25"></a>

### 25. Express `maxAge`

Сколько проживёт кука?

```js
res.cookie('sid', id, { maxAge: 3600 });
```

[→ ответ](5_1-data-persistence-otvety.md#a-25)

<a id="q-26"></a>

### 26. `CookieService`

Встроен ли `CookieService` в Angular? Зачем передавать `path: '/'` при записи и удалении куки через него?

[→ ответ](5_1-data-persistence-otvety.md#a-26)

---

## E. IndexedDB

<a id="q-27"></a>

### 27. Отличия от localStorage

Назови три отличия IndexedDB от localStorage.

[→ ответ](5_1-data-persistence-otvety.md#a-27)

<a id="q-28"></a>

### 28. `upgrade`

Зачем в `openDB` функция `upgrade` и когда она вызывается? Что сделать, чтобы добавить в базу новое хранилище?

[→ ответ](5_1-data-persistence-otvety.md#a-28)

---

## F. Безопасность

<a id="q-29"></a>

### 29. Чужие сайты

Может ли другой сайт прочитать localStorage твоего сайта? Какая угроза для хранилищ реальна?

[→ ответ](5_1-data-persistence-otvety.md#a-29)

<a id="q-30"></a>

### 30. CSRF

Что такое CSRF? Почему он касается кук, но не localStorage? Какой атрибут куки от него защищает?

[→ ответ](5_1-data-persistence-otvety.md#a-30)

<a id="q-31"></a>

### 31. Самое защищённое место

Где безопаснее всего хранить токен сессии, чтобы его нельзя было украсть через JS? Почему не IndexedDB?

[→ ответ](5_1-data-persistence-otvety.md#a-31)

<a id="q-32"></a>

### 32. Подмена роли

Пользователь с ролью `user` открыл DevTools и поменял в localStorage свою роль на `superadmin`. Что должно и что не должно произойти в правильно сделанном приложении?

[→ ответ](5_1-data-persistence-otvety.md#a-32)

---

## G. Выбор хранилища и сценарии

<a id="q-33"></a>

### 33. Где хранить?

- а) залогиненный пользователь, который должен пережить закрытие браузера;
- б) черновик сообщения, нужный только в этой вкладке;
- в) идентификатор сессии, который сервер должен получать сам;
- г) офлайн-кэш из 5000 сообщений;
- д) пароль.

[→ ответ](5_1-data-persistence-otvety.md#a-33)

<a id="q-34"></a>

### 34. Сигнал и кука

```ts
readonly isLoggedIn = signal(this.cookieService.check('username'));
```

Кука `username` поставлена на сутки. Через сутки она истекла, а пользователь всё это время не закрывал вкладку. Что покажет интерфейс и почему?

[→ ответ](5_1-data-persistence-otvety.md#a-34)

<a id="q-35"></a>

### 35. Выкидывает после F5

В приложении сессия хранится в HttpOnly-куке, а состояние входа — в сигнале `isLoggedIn = signal(false)`, который становится `true` после логина. После каждого F5 гард отправляет пользователя на логин. Почему и как исправить?

[→ ответ](5_1-data-persistence-otvety.md#a-35)

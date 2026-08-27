# Data persistence

Позволяет хранить стейт приложения между разными сессиями

HTML 5 предоставляет разные варианты хранения данных сессии:

- Local storage
- Session storage
- Cookies
- IndexedDB

Все они клиентские, для серверов есть другие варианты вроде базы данных.

Local storage

- Хранит данные на клиентском девайсе без срока истекания
- Юзер сам может очистить через консоль
- нет гарантии, что данные останутся со временем
- Примерно 5мб памяти для одного домена/протокола (origin) разное для разных браузеров
- не предназначен для важной инфы, небезопасен!
- синхронный, каждая след операция только после предыдущей.

Методы

- Add = `localStorage.setitem(“key”,”value”);`
- Read = `const myvar = localStorage.getitem(“key”);`
- Edit = `localStorage.setitem(“key”,”value”);`
- Remove = `localStorage.removeitem(“key”);`
- Delete = `localStorage.clear();`

Файлы должны храниться в JSON, поэтому

- для каждой записи: `localStorage.setitem(“key”,JSON.stringify(value));`
- для каждого чтения: `JSON.parse(localStorage.getitem(“key”));`

```ts
import { Component, OnInit } from "@angular/core";
@Component({
	selector: "app-root",
	template: `
		<p>Имя: {{ name }}</p>
		<button (click)="save()">Save</button>
	`,
})

// сохраняем имя и читаем его из локалсторадж
export class App implements OnInit {
	name = "";
	ngOnInit() {
		if (typeof Storage !== "undefined") {
			this.name = JSON.parse(localStorage.getItem("user") ?? "{}") ?? "";
		}
	}
	save() {
		localStorage.setItem("user", JSON.stringify({ name: "Allan" }));
	}
}
```

## Session storage

API такой же, как у localStorage

- Записать / обновить - sessionStorage.setItem("key", "value")
- Прочитать - sessionStorage.getItem("key")
- Удалить один ключ - sessionStorage.removeItem("key")
- Очистить всё - sessionStorage.clear()

Разница не в API, а в сроке жизни:

- localStorage — живёт, пока пользователь сам не очистит (или пока браузер не решит вытеснить)
- sessionStorage — пока жива сессия вкладки (reload ок, новая вкладка = новая сессия)

Оба хранят только строки (key → value). Объекты — через JSON.stringify / JSON.parse.

## Cookies

HTTP stateless: после ответа сервер «забывает» клиента. Cookie — способ сказать: «запомни это и пришли мне обратно при следующем запросе».

Поток:

1. Сервер отвечает с заголовком Set-Cookie
2. Браузер сохраняет cookie
3. В следующих запросах браузер шлёт Cookie: name=value

Важно: cookie едут на сервер с каждым подходящим запросом.
local/session storage — только в браузере, сервер их сам не видит.

Поэтому сегодня:

- общее клиентское хранение → Web Storage / IndexedDB
- сессии, auth, tracking → часто всё ещё cookies (особенно HttpOnly)

Cookie attributes — это про scope и безопасность

| Атрибут         | Смысл                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Expires/Max-Age | Без даты = session cookie (до закрытия браузера). С датой = permanent |
| Secure          | Только по HTTPS                                                       |
| HttpOnly        | JS через document.cookie не видит cookie → защита от XSS-кражи токена |
| Domain          | Какие хосты получают cookie                                           |
| Path            | По каким URL cookie уходит                                            |

Типичные применения из лекции:

- Session management (логин)
- Personalisation (язык, тема)
- Tracking (аналитика)

```ts
import { Component, OnInit } from "@angular/core";
@Component({
	selector: "app-root",
	template: `
		<p>Fruit: {{ fruit }}</p>
		<button (click)="save()">Save cookie</button>
		<button (click)="clear()">Clear cookie</button>
	`,
})
export class App implements OnInit {
	fruit = "";
	ngOnInit() {
		this.fruit = this.getCookie("best_fruit") ?? "";
	}
	save() {
		// permanent cookie (живёт до указанной даты)
		document.cookie =
			"best_fruit=banana; expires=Fri, 31 Dec 2030 23:59:59 GMT; path=/";
		this.fruit = "banana";
	}
	clear() {
		// удаление: expires в прошлом
		document.cookie =
			"best_fruit=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
		this.fruit = "";
	}
	private getCookie(name: string): string | null {
		const match = document.cookie.match(
			new RegExp("(?:^|; )" + name + "=([^;]*)"),
		);
		return match ? decodeURIComponent(match[1]) : null;
	}
}
```

```ts
// session cookie — до закрытия браузера
document.cookie = "best_fruit=banana";

// permanent
document.cookie = "best_fruit=banana; expires=Fri, 31 Dec 2030 23:59:59 GMT";

// secure (только HTTPS)
document.cookie = "best_fruit=banana; Secure; path=/";
```

## IndexedDB

Это уже не «пара строк key-value», а клиентская NoSQL-база:

- много структурированных данных
- объекты по ключу
- изоляция по origin (как и у storage)
- асинхронный API

Для курса достаточно знать: существует, когда нужно много данных / offline / сложные структуры — смотрят сюда, а не в localStorage (лимит ~5MB).

```ts
import { Component, OnInit } from "@angular/core";

@Component({
	selector: "app-root",
	template: `
		<p>{{ message }}</p>
		<button (click)="save()">Save user</button>
		<button (click)="load()">Load user</button>
	`,
})
export class App implements OnInit {
	message = "";
	private db!: IDBDatabase; // Используем ! (postfix definite assignment assertion), потому что свойство db инициализируется асинхронно в ngOnInit(), и TypeScript иначе будет ругаться, что оно возможно не проинициализировано к моменту использования.

	ngOnInit() {
		// indexedDB — это встроенный веб-API браузера, импорт не требуется
		const request = indexedDB.open("MyAppDB", 1);

		// onupgradeneeded срабатывает в момент открытия БД, если база создаётся впервые или происходит обновление версии.
		request.onupgradeneeded = () => {
			const db = request.result; // здесь мы получаем доступ к временной "версии" БД, с которой можно работать (создавать stores и т.д.)
			
			if (!db.objectStoreNames.contains("users")) { // если objectStore для пользователей ещё не существует
				db.createObjectStore("users", { keyPath: "id" }); // создаём новый objectStore
				// Важно: после создания store здесь НЕ происходит новый запрос (request) — цепочка одна: onupgradeneeded → onsuccess!
				// Когда завершается функция onupgradeneeded и все асинхронные операции (создание store и т.д.), IndexedDB автоматически продолжает процесс открытия базы.
				// Только после этого сработает обработчик onsuccess, который сообщает, что база полностью готова. 
				// Повторный реквест не нужен: мы работаем с одним request-объектом, который проходит через этапы onupgradeneeded (если нужно), а затем — onsuccess.
				// В результате в onsuccess уже получаем готовую, обновлённую базу, и можем сохранять её в this.db.
			}
		};

		request.onsuccess = () => {
			this.db = request.result; // сохраняем в классе экземпляр БД (он всегда доступен здесь: если база только что создана или была ранее — result одинаково валиден).
			// Нет прямой "связи" с только что созданной базой после onupgradeneeded, потому что создание objectStore нужно завершить до успеха открытия — успех (onsuccess) гарантирует, что БД и все stores готовы и можно пользоваться this.db.
		};
	}

	save() {
		// Открываем транзакцию для записи в objectStore 'users'
		const tx = this.db.transaction("users", "readwrite");

		// записываем юзера с его айди и именем, возвращаем сообщение
		tx.objectStore("users").put({ id: 1, name: "Allan" });
		this.message = "Saved";
	}

	load() {
		// Открываем транзакцию для чтения из objectStore 'users'
		const tx = this.db.transaction("users", "readonly");
		// запрашиваем юзера из бд
		const req = tx.objectStore("users").get(1);

		req.onsuccess = () => {
            // логика использования полученных данных
			this.message = req.result ? `Hello, ${req.result.name}` : "No user found";
		};
	}
}
```

## Безопасность — главный вывод лекции

Не храни локально:

- пароли
- токены/секреты в plain text (особенно в localStorage — любой XSS их прочитает)
- чувствительные данные пользователя / БД

Почему:

- XSS на твоём сайте
- Вредоносные расширения
- Shared (общие) компьютеры
- Cookie ещё и уезжают на сервер (CSRF, утечки через неправильный Domain/Secure)

Практическое правило:

- UI-предпочтения (тема, черновик формы) → local/session storage ок
- auth session → обычно httpOnly + Secure cookie (сервер контролирует)
- большие offline-данные → IndexedDB

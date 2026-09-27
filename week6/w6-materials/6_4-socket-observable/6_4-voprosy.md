# 6_4 — Сокет и Observable в Angular: вопросы для самопроверки

**Курс:** 3813ICT, неделя 6
**Связанные файлы:** [конспект](6_4-socket-observable-konspekt.md) · [поправки](6_4-socket-observable-popravki.md) · [примеры](6_4-socket-observable-primery.md) · [ответы](6_4-socket-observable-otvety.md)

**Как работать:**

1. Отвечай по памяти, не открывая конспект. Для кода сначала предскажи результат.
2. Если не знаешь — так и отметь «не знаю»: это честнее и полезнее догадки.
3. После каждого раздела сверяйся с ответами (ссылка «→ ответ» под вопросом).
4. Вопросы, на которых ошибся, повтори через день.

---

## A. Клиент и сервис

<a id="q-1"></a>

### 1. Импорт

Почему `import * as io from 'socket.io-client'` не работает в v4, и как импортировать правильно?

[→ ответ](6_4-socket-observable-otvety.md#a-1)

<a id="q-2"></a>

### 2. Имена событий

Сервер отправляет `'message'`, клиент слушает `'new-message'`. Что увидит пользователь? Как защититься от таких ошибок?

[→ ответ](6_4-socket-observable-otvety.md#a-2)

<a id="q-3"></a>

### 3. Поле сокета

Почему `private socket;` не компилируется в строгом режиме? Как объявить поле правильно?

[→ ответ](6_4-socket-observable-otvety.md#a-3)

<a id="q-4"></a>

### 4. Колбэк или Observable

Почему метод `getMessage(next)` с колбэком хуже, чем метод, возвращающий Observable?

[→ ответ](6_4-socket-observable-otvety.md#a-4)

---

## B. Observable из сокета

<a id="q-5"></a>

### 5. Найди проблему

```ts
getMessages() {
  return new Observable<string>((observer) => {
    this.socket.on('message', (m: string) => observer.next(m));
  });
}
```

Что произойдёт после трёх переходов на страницу чата и обратно?

[→ ответ](6_4-socket-observable-otvety.md#a-5)

<a id="q-6"></a>

### 6. Функция очистки

Напиши правильную функцию очистки. Почему `socket.off('message')` без второго аргумента — плохой вариант?

[→ ответ](6_4-socket-observable-otvety.md#a-6)

<a id="q-7"></a>

### 7. Устаревшее

Что не так с `Observable.create(...)` из `'rxjs/Observable'`?

[→ ответ](6_4-socket-observable-otvety.md#a-7)

---

## C. Компонент и операторы

<a id="q-8"></a>

### 8. Отписка в компоненте

Как завершить подписку на поток сообщений при уничтожении компонента? Где можно вызвать `takeUntilDestroyed()` без аргументов?

[→ ответ](6_4-socket-observable-otvety.md#a-8)

<a id="q-9"></a>

### 9. Операторы

Перепиши на RxJS 6+: `messages$.filter(m => m.length > 0).map(m => m.trim())`. Меняют ли операторы исходный Observable?

[→ ответ](6_4-socket-observable-otvety.md#a-9)

<a id="q-10"></a>

### 10. `scan` и `toSignal`

Что делает `scan((list, m) => [...list, m].slice(-100), [])`? Зачем здесь `toSignal`?

[→ ответ](6_4-socket-observable-otvety.md#a-10)

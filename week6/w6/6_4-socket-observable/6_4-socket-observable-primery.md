# 6_4 — Socket и Observable: примеры и разбор

**Курс:** 3813ICT, неделя 6  
**Источник:** `6.4-socket-and-observable.pdf`  
**Связанные файлы:** [конспект](6_4-socket-observable-konspekt.md) · [вопросы](6_4-socket-observable-voprosy.md) · [ответы](6_4-socket-observable-otvety.md) · [поправки](6_4-socket-observable-popravki.md)

## Пример 1. Callback напрямую

Начнём с простого варианта из слайда 3: клиент слушает событие `new-message`, а callback получает полезную нагрузку.

```ts
socket.on('new-message', (message: string) => {
  alert(message);
});
```

Это подходит для короткого примера. Но если сетевые вызовы разбросаны по компонентам, их сложнее поддерживать и тестировать. Кроме того, нужно помнить, кто удалит обработчик при завершении компонента.

## Пример 2. Сервис отвечает за сетевое событие

Сервис скрывает детали Socket.IO, а компонент работает с сообщениями:

```ts
@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket = io(SERVER_URL);

  send(message: string): void {
    this.socket.emit('message', message);
  }

  getMessages(): Observable<string> {
    return new Observable<string>((observer) => {
      const onMessage = (message: string) => observer.next(message);
      this.socket.on('new-message', onMessage);
      return () => this.socket.off('new-message', onMessage);
    });
  }
}
```

В компоненте логика чтения остаётся близка к интерфейсу:

```ts
this.chatService.getMessages().subscribe((message) => {
  this.messages.push(message);
});
```

Сверь это с [6.3](6_3-sockets-konspekt.md#s5): `emit` и `on` передают события Socket.IO, а Observable — обёртка RxJS, которую сервис возвращает компоненту. Это два слоя одной программы.

## Пример 3. Фильтруем поток сообщений

Представим, что сервер иногда отправляет пустые строки. Мы можем преобразовать сообщения до того, как они попадут в массив интерфейса:

```ts
this.chatService.getMessages().pipe(
  map((message) => message.trim()),
  filter((message) => message.length > 0),
).subscribe((message) => this.messages.push(message));
```

Компонент получает только непустой очищенный текст. Операторы создают новый Observable, поэтому исходный поток не переписывается. Это та же композиционная идея, которую мы изучали в [6.1](6_1-observables-konspekt.md#s5).

## Пример 4. Что происходит при отписке

В этом коде `socket.on` добавляет обработчик, а функция, возвращённая конструктором Observable, задаёт уборку:

```ts
return new Observable((observer) => {
  const onMessage = (message: string) => observer.next(message);
  socket.on('new-message', onMessage);
  return () => socket.off('new-message', onMessage);
});
```

Путь выполнения:

1. Компонент вызывает `subscribe()`.
2. Observable устанавливает `onMessage` на сокет.
3. Каждое сокет-событие становится `next(message)`.
4. Компонент вызывает `unsubscribe()`.
5. Teardown снимает `onMessage`.

Обрати внимание: удаляется та же функция, которая была передана в `on`. Создание новой анонимной функции внутри `off()` не удалит прежний обработчик. Также отписка не должна неожиданно закрывать сокет, если он общий для приложения.

## Пример 5. Один сервер, несколько подписчиков

Если два компонента независимо вызывают `getMessages().subscribe()`, простая реализация выше ставит два обработчика на одно событие. Это может быть нормальным поведением, но означает, что событие обрабатывается дважды — по одному разу каждой подпиской. Если нужен общий разделяемый поток, можно добавить multicast/share-механизм RxJS; это уже отдельный проектный выбор.

## Самопроверка

1. Какую задачу решает сервис в этом примере?
2. Что превращает каждое событие сокета в `next` Observable?
3. Зачем Observable возвращает teardown-функцию?
4. Какое значение увидит подписчик после `trim()` и `filter()` для строки `'  hello  '`?
5. Почему две подписки могут привести к двум обработчикам сокета?

Ответы с рассуждениями — в [файле ответов](6_4-socket-observable-otvety.md).

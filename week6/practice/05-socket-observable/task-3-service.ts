// Задание 3 — сервис как в Angular: один слушатель на любое число подписчиков
// Конспект: 6-4-Socket-and-Observable.md (вариант с одним Subject в сервисе)
// Запуск: node 05-socket-observable/task-3-service.ts

import { Subject } from 'rxjs';
import type { Observable, Subscription } from 'rxjs';
import { FakeSocket } from './fake-socket.ts';

export type Message = { author: string; text: string };

// Это будущий @Injectable({ providedIn: 'root' })
export class SocketService {
    private socket: FakeSocket;
    private initialized = false;
    // TODO: приватный Subject<Message>

    constructor(socket: FakeSocket) {
        this.socket = socket;
    }

    initSocket(): void {
        // TODO: если уже инициализировано — выйти (иначе будет второе соединение)
        // TODO: навесить socket.on('new-message', ...) и толкать сообщения в Subject
    }

    getMessages(): Observable<Message> {
        // TODO: отдать наружу только право читать
        throw new Error('не реализовано');
    }

    send(text: string): void {
        // TODO: отправить событие 'message' на сервер
    }
}

// «компонент»: список сообщений
class ListComponent {
    handled = 0;
    private service: SocketService;
    private sub?: Subscription;

    constructor(service: SocketService) {
        this.service = service;
    }

    init(): void {
        // TODO: подписаться, печатать '[список]' и текст, увеличивать handled
    }

    destroy(): void {
        // TODO: отписаться
    }
}

// «компонент»: счётчик непрочитанных
class CounterComponent {
    handled = 0;
    private service: SocketService;
    private sub?: Subscription;

    constructor(service: SocketService) {
        this.service = service;
    }

    init(): void {
        // TODO: подписаться, печатать '[счётчик]' и текст, увеличивать handled
    }

    destroy(): void {
        // TODO: отписаться
    }
}

// ---------- проверка ----------

const socket = new FakeSocket();
const service = new SocketService(socket);
service.initSocket();

const list = new ListComponent(service);
const counter = new CounterComponent(service);

list.init();
counter.init();

console.log('слушателей на сокете:', socket.listenerCount('new-message'));

socket.serverSends('new-message', { author: 'anton', text: 'привет' });

service.initSocket();
console.log('повторный initSocket, слушателей:', socket.listenerCount('new-message'));

socket.serverSends('new-message', { author: 'bob', text: 'как дела' });

counter.destroy();
console.log('после destroy счётчика:');
socket.serverSends('new-message', { author: 'bob', text: 'ты тут?' });

console.log('обработано: список ' + list.handled + ', счётчик ' + counter.handled);

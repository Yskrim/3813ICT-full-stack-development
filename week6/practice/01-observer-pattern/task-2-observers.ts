// Задание 2 — три разные реализации одного интерфейса
// Конспект: 6-0-ReactiveProgramming.md (раздел про интерфейсы)
// Запуск: node 01-observer-pattern/task-2-observers.ts

export interface Observer<T> {
    next(value: T): void;
}

// Subject здесь уже готов — это инструмент, а не задание.
class Subject<T> {
    private observers: Observer<T>[] = [];

    subscribe(observer: Observer<T>): { unsubscribe(): void } {
        this.observers.push(observer);
        return {
            unsubscribe: () => {
                this.observers = this.observers.filter((o) => o !== observer);
            }
        };
    }

    next(value: T): void {
        for (const observer of this.observers) {
            observer.next(value);
        }
    }
}

type Message = { author: string; text: string };

const CURRENT_USER = 'anton';

// TODO: складывает сообщения в свой массив, умеет отдать их количество
class MessageListObserver implements Observer<Message> {
    next(message: Message): void {
        throw new Error('не реализовано');
    }
}

// TODO: считает только ЧУЖИЕ сообщения (author !== CURRENT_USER)
class UnreadCounterObserver implements Observer<Message> {
    next(message: Message): void {
        throw new Error('не реализовано');
    }
}

// TODO: печатает в формате [log] автор: текст
class LoggerObserver implements Observer<Message> {
    next(message: Message): void {
        throw new Error('не реализовано');
    }
}

// ---------- проверка ----------

const chat = new Subject<Message>();

const listObserver = new MessageListObserver();
const unreadObserver = new UnreadCounterObserver();

chat.subscribe(listObserver);
chat.subscribe(unreadObserver);
chat.subscribe(new LoggerObserver());

chat.next({ author: 'anton', text: 'привет' });
chat.next({ author: 'bob', text: 'как дела' });
chat.next({ author: 'bob', text: 'ты тут?' });

// TODO: подставь свои методы или поля, чтобы напечатать итоги
// console.log('сообщений в списке:', ...);
// console.log('непрочитанных (чужих):', ...);

// Задание 1 — типизированный Subject с отпиской
// Конспекты: 6-0-ReactiveProgramming.md, 6-1-observables.md
// Запуск: node 01-observer-pattern/task-1-subject.ts

export interface Observer<T> {
    next(value: T): void;
}

export interface Subscription {
    unsubscribe(): void;
}

export class Subject<T> {
    // TODO: приватный список наблюдателей

    subscribe(observer: Observer<T>): Subscription {
        // TODO: добавить наблюдателя в список и вернуть объект,
        // чей unsubscribe() убирает ИМЕННО его
        throw new Error('не реализовано');
    }

    next(value: T): void {
        // TODO: разослать значение всем текущим наблюдателям
        throw new Error('не реализовано');
    }
}

// ---------- проверка: сначала предскажи вывод, потом запускай ----------

type Message = { author: string; text: string };

const chat = new Subject<Message>();
const list: Message[] = [];

chat.next({ author: 'anton', text: 'до подписки' });

const listSub = chat.subscribe({ next: (m) => list.push(m) });
chat.next({ author: 'anton', text: 'привет' });

chat.subscribe({ next: () => console.log('счётчик: +1') });
chat.next({ author: 'bob', text: 'как дела' });

listSub.unsubscribe();
chat.next({ author: 'bob', text: 'этого списку уже не видно' });

console.log('в списке:', list.map((m) => m.text));

// Раскомментируй и убедись, что редактор подсвечивает ошибку типа:
// chat.next('просто строка');

// Задание 1 — типизированный Subject с отпиской
// Конспекты: 6-0-ReactiveProgramming.md, 6-1-observables.md
// Запуск: node 01-observer-pattern/task-1-subject.ts

export interface Observer<T> {
    next(value: T): void;
}

export interface Subscription {
    unsubscribe(): void;
}

export class Subject<T> implements Observer<T>{
    // TODO: приватный список наблюдателей
    private observers: Observer<T>[] = [];

    subscribe(observer: Observer<T>): Subscription {
        // TODO: добавить наблюдателя в список и вернуть объект,
        // чей unsubscribe() убирает ИМЕННО его
        this.observers.push(observer);

        return {
            unsubscribe: () => {
                // TODO: оставить в this.observers всех, КРОМЕ observer.
                this.observers.filter(o => o !== observer);
            }
        }
    }

    next(value: T): void {
        // TODO: разослать значение всем текущим наблюдателям
        for(const observer of this.observers){
            observer.next(value);
        }
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
chat.next({ author: 'bob', text: 'этот спискок уже не видно' });

console.log('в списке:', list.map((m) => m.text));

// Раскомментируй и убедись, что редактор подсвечивает ошибку типа:
// chat.next('просто строка');

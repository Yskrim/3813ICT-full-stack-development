// Задание 1 — три способа подписки и контракт потока
// Конспект: 6-1-observables.md (Observer interface, next/error/complete)
// Запуск: node 02-rxjs/task-1-contract.ts

import { Subject } from 'rxjs';
import type { Observer } from 'rxjs';

// TODO: класс-наблюдатель. Реализуй ВСЕ три метода интерфейса,
// печатай с префиксом [class], в complete — текст 'поток закрыт'
class MessageObserver implements Observer<string> {
    next(value: string): void {
        throw new Error('не реализовано');
    }
    error(err: unknown): void {
        throw new Error('не реализовано');
    }
    complete(): void {
        throw new Error('не реализовано');
    }
}

const messages$ = new Subject<string>();

// TODO: подписка 1 — одной функцией, печатать с префиксом [fn]

// TODO: подписка 2 — объектом с next и complete, префикс [obj],
// в complete печатать 'поток закрыт'

// TODO: подписка 3 — экземпляром MessageObserver

// TODO: отправить 'первое', затем complete(), затем ещё одно значение
// (второе значение не должно дойти ни до кого)

// TODO: подписаться на уже завершённый messages$ и напечатать
// '[late] подписался после complete → сразу complete'

// ---------- вторая часть: что делает error ----------

const errored$ = new Subject<string>();

// TODO: подписаться объектом с тремя колбэками, префикс [err]
// TODO: отправить 'до ошибки', затем error(new Error('сокет отвалился')),
// затем ещё один next — и посмотреть, доходит ли он и приходит ли complete

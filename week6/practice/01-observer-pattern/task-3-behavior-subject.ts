// Задание 3 — свой BehaviorSubject
// Конспект: 6-1-observables.md (Subject vs BehaviorSubject)
// Запуск: node 01-observer-pattern/task-3-behavior-subject.ts
//
// Требуется законченное задание 1: Subject импортируется оттуда.

import { Subject } from './task-1-subject.ts';
import type { Observer, Subscription } from './task-1-subject.ts';

export class BehaviorSubject<T> extends Subject<T> {
    // TODO: поле для текущего значения

    constructor(initial: T) {
        super();
        // TODO: запомнить начальное значение
    }

    getValue(): T {
        // TODO: вернуть текущее значение
        throw new Error('не реализовано');
    }

    subscribe(observer: Observer<T>): Subscription {
        // TODO: подписать через super.subscribe, а затем СРАЗУ отдать
        // новому наблюдателю текущее значение
        throw new Error('не реализовано');
    }

    next(value: T): void {
        // TODO: обновить текущее значение и переиспользовать рассылку из super
        throw new Error('не реализовано');
    }
}

// ---------- проверка: предскажи вывод до запуска ----------

const currentChannel = new BehaviorSubject<string>('general');

currentChannel.subscribe({ next: (c) => console.log('подписчик 1 получил:', c) });

currentChannel.next('random');

currentChannel.subscribe({ next: (c) => console.log('подписчик 2 получил:', c) });

console.log('getValue():', currentChannel.getValue());

currentChannel.next('dev');

// Задание 3 — отписка, утечка и правильное завершение
// Конспект: 6-1-observables.md (раздел «Ошибка в слайде: unsubscribe»)
// Запуск: node 02-rxjs/task-3-unsubscribe.ts

import { Subject } from 'rxjs';
import type { Subscription } from 'rxjs';

// ---------- часть 1: отписка одного подписчика не задевает остальных ----------

const stream$ = new Subject<string>();

// TODO: подписать [A], сохранив Subscription, и подписать [B]
// TODO: отправить 'первое' → должны напечатать оба
// TODO: отписать только [A], отправить 'второе' → печатает только [B]

// TODO: вызвать stream$.unsubscribe() — БЕЗ аргументов, это убивает сам Subject.
// Затем в try/catch отправить 'третье' и напечатать 'поймали:' и err.name

// ---------- часть 2: как завершать поток правильно ----------

// TODO: новый Subject, подписчик [C] с next и complete.
// Отправить 'перед завершением', вызвать complete(), затем отправить ещё одно значение.
// Убедиться, что исключения нет, а значение просто игнорируется.

// ---------- часть 3: аналог компонента Angular ----------

class FakeComponent {
    handled = 0;
    private source: Subject<string>;
    private sub?: Subscription;

    constructor(source: Subject<string>) {
        this.source = source;
    }

    init(): void {
        // аналог ngOnInit
        // TODO: подписаться и увеличивать handled на каждое сообщение
    }

    destroy(): void {
        // аналог ngOnDestroy
        // TODO: отписаться
    }
}

const feed$ = new Subject<string>();
const component = new FakeComponent(feed$);

component.init();
feed$.next('одно');
feed$.next('два');
console.log('компонент обработал до destroy:', component.handled);

component.destroy();
feed$.next('три');
console.log('компонент обработал после destroy:', component.handled);

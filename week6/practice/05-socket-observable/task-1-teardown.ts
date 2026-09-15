// Задание 1 — обёртка сокета в Observable с очисткой
// Конспект: 6-4-Socket-and-Observable.md (главная проблема кода из лекции)
// Запуск: node 05-socket-observable/task-1-teardown.ts

import { Observable } from 'rxjs';
import { FakeSocket } from './fake-socket.ts';

const socket = new FakeSocket();

function getMessages(): Observable<string> {
    // TODO: вернуть new Observable<string>((observer) => { ... })
    //   - сохранить обработчик в переменную
    //   - навесить его через socket.on('new-message', handler)
    //   - ВЕРНУТЬ функцию, которая снимает его через socket.off
    throw new Error('не реализовано');
}

// ---------- проверка ----------

let handled = 0;

console.log('слушателей до подписки:', socket.listenerCount('new-message'));

const sub = getMessages().subscribe((message) => {
    handled++;
    console.log('получено:', message);
});

console.log('слушателей во время подписки:', socket.listenerCount('new-message'));

socket.serverSends('new-message', 'привет');
socket.serverSends('new-message', 'как дела');

sub.unsubscribe();
console.log('слушателей после отписки:', socket.listenerCount('new-message'));

socket.serverSends('new-message', 'этого уже никто не обработает');

console.log('обработано сообщений:', handled);

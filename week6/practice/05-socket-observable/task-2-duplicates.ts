// Задание 2 — воспроизвести баг с дублирующимися сообщениями
// Конспект: 6-4-Socket-and-Observable.md
// Запуск: node 05-socket-observable/task-2-duplicates.ts

import { Observable } from 'rxjs';
import { FakeSocket } from './fake-socket.ts';

const socket = new FakeSocket();

function getMessages(): Observable<string> {
    // TODO: скопируй сюда свою рабочую версию из задания 1 (с teardown)
    throw new Error('не реализовано');
}

// ---------- проверка ----------

let handledTotal = 0;

// «компонент 1»: список сообщений
getMessages().subscribe((message) => {
    handledTotal++;
    console.log('[список]', message);
});

// «компонент 2»: счётчик непрочитанных
getMessages().subscribe((message) => {
    handledTotal++;
    console.log('[счётчик]', message);
});

console.log('слушателей при двух подписках:', socket.listenerCount('new-message'));

socket.serverSends('new-message', 'привет');

console.log('одно сообщение обработано раз:', handledTotal);

// TODO: объясни здесь, почему слушателей два, а не один,
// и почему это НЕ баг RxJS:
// →

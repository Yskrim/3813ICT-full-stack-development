// Задание 2 — сервис-хранилище состояния на BehaviorSubject
// Конспект: 6-1-Observables-explained.md (BehaviorSubject, asObservable)
// Запуск: node 02-rxjs/task-2-state-service.ts

import { BehaviorSubject } from 'rxjs';
import type { Observable } from 'rxjs';

export type Message = { author: string; text: string };

// Это будущий Angular-сервис: @Injectable({ providedIn: 'root' })
export class ChatStore {
    // TODO: приватный BehaviorSubject<Message[]> с начальным значением []

    getMessages(): Observable<Message[]> {
        // TODO: отдать наружу только право читать
        throw new Error('не реализовано');
    }

    getCurrent(): Message[] {
        // TODO: текущее значение без подписки
        throw new Error('не реализовано');
    }

    addMessage(message: Message): void {
        // TODO: разослать НОВЫЙ массив, не мутируя предыдущий
        throw new Error('не реализовано');
    }
}

// ---------- проверка ----------

const store = new ChatStore();
const oldReference = store.getCurrent();

store.getMessages().subscribe((list) => console.log('[список] сообщений:', list.length));

store.addMessage({ author: 'anton', text: 'привет' });
store.addMessage({ author: 'bob', text: 'как дела' });

store.getMessages().subscribe((list) => console.log('[сайдбар] сообщений:', list.length));

store.addMessage({ author: 'bob', text: 'ты тут?' });

console.log('старая ссылка не изменилась:', oldReference.length === 0);

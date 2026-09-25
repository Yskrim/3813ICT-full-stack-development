// Учебная замена socket.io-client с тем же интерфейсом (on / off / emit).
// Менять этот файл не нужно.
//
// Отличие от настоящего сокета одно: сообщения «от сервера» ты вызываешь сам
// через serverSends(...), потому что сети здесь нет. Плюс есть listenerCount(),
// которого у настоящего клиента нет — он нужен, чтобы увидеть утечку слушателей.

// any здесь осознанно: у настоящего socket.io-client обработчики тоже нетипизированы,
// типы появляются на границе — в твоём Observable<T>
type Handler = (...args: any[]) => void;

export class FakeSocket {
    private handlers = new Map<string, Handler[]>();

    on(event: string, handler: Handler): void {
        const list = this.handlers.get(event) ?? [];
        list.push(handler);
        this.handlers.set(event, list);
    }

    off(event: string, handler: Handler): void {
        const list = this.handlers.get(event) ?? [];
        this.handlers.set(event, list.filter((h) => h !== handler));
    }

    emit(event: string, ...args: any[]): void {
        console.log('  (на сервер ушло:', event, JSON.stringify(args) + ')');
    }

    listenerCount(event: string): number {
        return (this.handlers.get(event) ?? []).length;
    }

    // имитация сообщения, пришедшего с сервера
    serverSends(event: string, ...args: any[]): void {
        for (const handler of this.handlers.get(event) ?? []) {
            handler(...args);
        }
    }
}

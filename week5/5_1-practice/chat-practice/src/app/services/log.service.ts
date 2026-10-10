import { Injectable, signal } from '@angular/core';

export type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LogEntry {
    time: string;
    level: LogLevel;
    text: string;
}

@Injectable({ providedIn: 'root' })
export class LogService {
    private readonly _logs = signal<LogEntry[]>([]);
    readonly logs = this._logs.asReadonly();

    log(level: LogLevel, ...args: unknown[]): void {
        console[level](...args);

        const text: string = args.map((arg) => this.formatArg(arg)).join(' ');
        const time: string = new Date().toLocaleTimeString();
        this._logs.update((prev) => [...prev, { time, level, text }]);
    }

    clearLogs(): void {
        this._logs.set([]);
    }

    private formatArg(arg: unknown): string {
        if (arg instanceof Error) return `${arg.name}:${arg.message}`;
        if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg);
        return String(arg);
    }
}

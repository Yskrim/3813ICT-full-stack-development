import { Component, inject, afterRenderEffect, ElementRef, viewChild } from '@angular/core';
import { LogService } from '../log.service';

type LogLevel = 'log' | 'info' | 'warn' | 'error';

interface LogEntry {
    time: string;
    level: LogLevel;
    text: string;
}

@Component({
    imports: [],
    selector: 'app-console',
    styleUrl: './console.component.css',
    templateUrl: './console.component.html',
})
export class ConsoleComponent {
    private logService = inject(LogService);
    logs = this.logService.logs;

    private body = viewChild.required<ElementRef<HTMLElement>>('body');

    constructor() {
        afterRenderEffect(() => {
            this.logs(); // subscribe: re-run whenever a new entry arrives
            const el = this.body().nativeElement;
            el.scrollTo({ top: el.scrollHeight, behavior: 'auto' });
       
        });
    }

    clear(): void {
        this.logService.clearLogs();
    }
}

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class CounterService {
    id: string = Math.random().toString(36).slice(2, 6);
    count = signal(0);

    constructor(){ console.log("New counter created, id: ", this.id); }

    increment(): void { this.count.update(prev => prev + 1); }

    reset(): void { this.count.set(0); }
}

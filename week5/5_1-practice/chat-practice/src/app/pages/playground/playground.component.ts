import { Component, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreferencesService } from '../../services/preferences.service';
import { Preferences } from '../../services/preferences.service';
import { FormsModule } from '@angular/forms';
import { of, finalize, Observer, Observable, from, interval, take, throwError } from 'rxjs';
import { ConsoleComponent } from '../../console/console.component';
import { LogService, LogLevel } from '../../log.service';
@Component({
    imports: [FormsModule, ConsoleComponent],
    selector: 'app-playground',
    styleUrl: './playground.component.css',
    templateUrl: './playground.component.html',
})
export class PlaygroundComponent {
    private prefService = inject(PreferencesService);
    prefs = this.prefService.prefs.asReadonly();

    private logService = inject(LogService);
    private log(level: LogLevel, ...args: unknown[]): void {
        this.logService.log(level, ...args);
    }

    updatePrefs(changes: Partial<Preferences>) {
        this.prefService.update(changes);
    }

    constructor() {
        this.log('log', this.prefs());
    }

    jsonPrefs = computed(() => {
        return JSON.stringify(this.prefs());
    });

    /* ---------- observers practice 4-1 ----------- */

    // create an array of numbers
    nums = [11, 9, 200, 83, 54, 7];

    // create a stream that will be returning the values one by one
    private readonly number$: Observable<number> = from(this.nums);

    // method that triggers the stream
    subscribeNumbers(): void {
        // what to do with the values in the stream
        const observer: Observer<number> = {
            next: (num) => this.log('log', 'Now observing this num: ', num),
            error: (err) => this.log('log', 'Error: ', err),
            complete: () => this.log('log', 'Stream complete'),
        };

        // subscribe the stream => run the observable.
        this.number$.subscribe(observer);
    }

    /* ----------  ЧАСТЬ А ----------- */
    partA1(): void {
        // regular observer as a three method object
        this.log('log', 'start');
        of('a', 'b', 'c').subscribe({
            next: (x) => this.log('log', x),
            error: (err) => this.log('log', err),
            complete: () => this.log('log', 'stream complete'),
        });
        this.log('log', 'end');
    }

    partA2(): void {
        this.log('log', 'start');
        of('a', 'b', 'c');
        this.log('log', 'end');
    }

    /* ----------  ЧАСТЬ Б ----------- */
    partB1(): void {
        const interval$ = interval(500);

        const subscription = interval$.subscribe({
            next: (x) => this.log('log', x),
            error: (err) => this.log('error', err),
            complete: () => this.log('log', 'stream complete'),
        });

        setTimeout(() => {
            subscription.unsubscribe();
        }, 2000);
    }

    partB1_1(): void {
        const sub$ = interval(500).pipe(take(4)); // .pipe(take(n)) completes the stream, unlike setTimeout that just stops it. Here pipe streams the data and take 4 is a delimiter on when to stop the stream. Once it fulfills, pipe ends
        sub$.subscribe({
            next: (value) => this.log('log', value),
            complete: () => this.log('log', 'stream complete'),
        });
    }

    /* ----------  ЧАСТЬ В ----------- */
    partC1(): void {
        const err$ = throwError(() => new Error('Boom!'));

        err$.subscribe({
            next: (value) => this.log('log', value),
            error: (err) => this.log('log', err), // always executed on this stream
            complete: () => this.log('log', 'stream complete'), // never executed
        });
    }

    partC2(): void {
        const err$ = throwError(() => new Error('Boom!')).pipe(finalize(() => this.log('log', 'This stream is finalized')));

        err$.subscribe({
            next: (value) => this.log('log', value),
            error: (err) => this.log('log', err), // always executed on this stream, but then pipe is forwarding the stream to finalize which runs it's own callback.
            complete: () => this.log('log', 'stream complete'), // never executed
        });
    }

    /* ----------  ЧАСТЬ Г ----------- */

    private http = inject(HttpClient);

    partD1(): void {
        const http$ = this.http.get('/api/health');

        this.log('log', new Date().toISOString());
        http$.subscribe({
            next: (data) => this.log('log', data),
            error: (err) => this.log('warn', err),
            complete: () => this.log('info', 'request stream complete'),
        });
        this.log('log', new Date().toISOString());
    }

    partD2(): void {
        const http$ = this.http.get('/api/unknown');
        http$.subscribe({
            next: (data) => this.log('log', data),
            error: (err) => this.log('warn', err),
            complete: () => this.log('info', 'request stream complete'),
        });
    }

    partD3(): void {
        const http$ = this.http.get('/api/ping');
        http$.subscribe({
            next: (data) => this.log('log', data),
            error: (err) => this.log('warn', err),
            complete: () => this.log('info', 'request stream complete'),
        });
    }
}

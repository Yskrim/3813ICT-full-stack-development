import { Component, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PreferencesService } from '../../services/preferences.service';
import { Preferences } from '../../services/preferences.service';
import { FormsModule } from '@angular/forms';
import { of, finalize, Observer, Observable, from, interval, take, throwError } from 'rxjs';


// console.log('\n\nStart piped observer with finalize');
// of('a', 'b', 'c')
//   .pipe(finalize(() => console.log('stream is completed')))
//   .subscribe({ next: (x) => console.log(x) })
// console.log("end");


@Component({
	imports: [FormsModule],
	selector: 'app-playground',
	styleUrl: './playground.component.css',
	templateUrl: './playground.component.html',
})


export class PlaygroundComponent {
	private prefService = inject(PreferencesService);
	prefs = this.prefService.prefs.asReadonly();

	updatePrefs(changes: Partial<Preferences>) {
		this.prefService.update(changes);
	}

	constructor() {
		console.log(this.prefs())
	}

	jsonPrefs = computed(() => {
		return JSON.stringify(this.prefs());
	})


	/* ---------- observers practice 4-1 ----------- */

	// create an array of numbers
	nums = [11, 9, 200, 83, 54, 7];

	// create a stream that will be returning the values one by one
	private readonly number$: Observable<number> = from(this.nums)

	// method that triggers the stream
	subscribeNumbers(): void {

		// what to do with the values in the stream
		const observer: Observer<number> = {
			next: (num) => console.log("Now observing this num: ", num),
			error: (err) => console.log("Error: ", err),
			complete: () => console.log("Stream complete"),
		};

		// subscribe the stream => run the observable.
		this.number$.subscribe(observer);
	}

	/* ----------  ЧАСТЬ А ----------- */
	partA1(): void {
		// regular observer as a three method object
		console.log('start');
		of('a', 'b', 'c').subscribe({
			next: (x) => console.log(x),
			error: (err) => console.log(err),
			complete: () => console.log('stream complete')
		})
		console.log("end");
	}

	partA2(): void {
		console.log('start');
		of('a', 'b', 'c');
		console.log("end");
	}

	/* ----------  ЧАСТЬ Б ----------- */
	partB1(): void {
		const interval$ = interval(500);

		const subscription = interval$.subscribe({
			next: (x) => console.log(x),
			error: (err) => console.error(err),
			complete: () => console.log('stream complete')
		})

		setTimeout(() => {
			subscription.unsubscribe();
		}, 2000);
	}

	partB1_1(): void {
		const sub$ = interval(500).pipe(take(4)); // .pipe(take(n)) completes the stream, unlike setTimeout that just stops it. Here pipe streams the data and take 4 is a delimiter on when to stop the stream. Once it fulfills, pipe ends
		sub$.subscribe({
			next: (value) => console.log(value),
			complete: () => console.log('stream complete')
		})
	}


	/* ----------  ЧАСТЬ В ----------- */
	partC1(): void {
		const err$ = throwError(() => new Error('Boom!'));

		err$.subscribe({
			next: (value) => console.log(value),
			error: (err) => console.table(err), // always executed on this stream
			complete: () => console.log('stream complete') // never executed 
		})
	}

	partC2(): void {
		const err$ = throwError(() => new Error('Boom!')).pipe(finalize(() => console.log('This stream is finalized')))

		err$.subscribe({
			next: (value) => console.log(value),
			error: (err) => console.table(err), // always executed on this stream, but then pipe is forwarding the stream to finalize which runs it's own callback.
			complete: () => console.log('stream complete') // never executed
		})
	}

	/* ----------  ЧАСТЬ Г ----------- */

	private http = inject(HttpClient);


	partD1(): void {
		const http$ = this.http.get('/api/health')

		console.log(new Date().toISOString())
		http$.subscribe({
			next: (data) => console.table(data),
			error: (err) => console.warn(err),
			complete: () => console.info("request stream complete")
		})
		console.log(new Date().toISOString())
	}

	partD2(): void {
		const http$ = this.http.get('/api/unknown')
		http$.subscribe({
			next: (data) => console.table(data),
			error: (err) => console.warn(err),
			complete: () => console.info("request stream complete")
		})
	}

	partD3(): void {
		const http$ = this.http.get('/api/ping')
		http$.subscribe({
			next: (data) => console.log(data),
			error: (err) => console.warn(err),
			complete: () => console.info("request stream complete")
		})
	}
}

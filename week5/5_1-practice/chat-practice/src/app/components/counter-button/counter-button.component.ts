import { Component, inject } from '@angular/core';
import { CounterService } from '../../services/counter.service';

@Component({
  imports: [],
  selector: 'app-counter-button',
  styleUrl: './counter-button.component.css',
  templateUrl: './counter-button.component.html',
  providers: [CounterService]
})

export class CounterButtonComponent {
  counterService = inject(CounterService);
}

import { Component, inject } from '@angular/core';
import { CounterService } from '../../services/counter.service';

@Component({
  imports: [],
  selector: 'app-counter-display',
  styleUrl: './counter-display.component.css',
  templateUrl: './counter-display.component.html',
})
export class CounterDisplayComponent {
  counterService = inject(CounterService);
}

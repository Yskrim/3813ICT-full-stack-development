import { Component, inject } from '@angular/core';
import { CounterService } from '../../services/counter.service';
import { CounterButtonComponent } from '../../components/counter-button/counter-button.component';
import { CounterDisplayComponent } from '../../components/counter-display/counter-display.component';

@Component({
  imports: [CounterButtonComponent, CounterDisplayComponent],
  selector: 'app-services-lab',
  styleUrl: './services-lab.component.css',
  templateUrl: './services-lab.component.html',
})

export class ServicesLabComponent {
  private counterService = inject(CounterService);
}

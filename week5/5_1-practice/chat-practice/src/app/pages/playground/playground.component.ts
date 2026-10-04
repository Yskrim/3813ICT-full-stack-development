import { AfterViewInit, Component, inject } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import { Preferences } from '../../services/preferences.service';
import { FormsModule } from '@angular/forms';
import { Theme } from '../../services/preferences.service';

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
}

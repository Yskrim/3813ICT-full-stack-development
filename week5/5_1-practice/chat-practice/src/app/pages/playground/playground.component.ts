import { AfterViewInit, Component, inject } from '@angular/core';
import { PreferencesService } from '../../services/preferences.service';
import { Preferences } from '../../services/preferences.service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-playground',
  styleUrl: './playground.component.css',
  templateUrl: './playground.component.html',
})


export class PlaygroundComponent implements AfterViewInit {
  theme: 'light' | 'dark' = 'light';
  fontSize:number = 16;
  lastChannelId: number | null = null;

  private prefService = inject(PreferencesService);

  getPrefs(): void {
    const prefs: Preferences | null = this.prefService.get();
    
    this.theme = prefs?.theme ?? 'light';
    this.fontSize = prefs?.fontSize ?? 16;
    this.lastChannelId = prefs?.lastChannelId ?? null;
  }

  savePrefs(){
    const curPrefs: Preferences = {
      theme: this.theme,
      fontSize: this.fontSize,
      lastChannelId: this.lastChannelId,
    }

    this.prefService.update(curPrefs);
  }

  updatePrefs(changes: Partial<Preferences> ) {
    // first building a new object from current state, then overriding its values with spreading changes.  
    const newPrefs: Preferences = {
      theme: this.theme,
      fontSize: this.fontSize,
      lastChannelId: this.lastChannelId,
      ...changes,
    }

    // update class props with new prefs
    this.theme = newPrefs.theme;
    this.fontSize = newPrefs.fontSize;
    this.lastChannelId = newPrefs.lastChannelId;

    // pass new pref obj to the service
    this.prefService.update(newPrefs);
  }

  ngAfterViewInit(){
    this.getPrefs();
  }
}

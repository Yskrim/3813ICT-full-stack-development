import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

import { AuthService } from './services/auth.service';
import { PreferencesService } from './services/preferences.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  // theme + font size from preferences apply to the whole app
  host: {
    '[class.dark]': "prefs().theme === 'dark'",
    '[style.font-size.px]': 'prefs().fontSize',
  },
})
export class App {
  protected readonly title = signal('chat-practice');
  protected auth = inject(AuthService);
  protected prefs = inject(PreferencesService).prefs;
}

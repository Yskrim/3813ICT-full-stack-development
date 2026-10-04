import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark';

export interface Preferences {
    theme: Theme;
    fontSize: number;
    lastChannelId: number | null;
}

@Injectable({ providedIn: 'root' })

export class PreferencesService {
    private storage = inject(StorageService);
    key: string = 'uiPref';

    readonly prefs = signal<Preferences>({
        theme: 'light',
        fontSize: 16,
        lastChannelId: null,
    })

    constructor() {
        this.load();
    }

    private load(): void {
        // load data from StorageService stored under this key
        const curPrefs: Preferences | null = this.get();

        // if record exists
        if (curPrefs) {
            // update default values if those exist on the record
            this.prefs.set({
                theme: curPrefs.theme ?? 'light',
                fontSize: curPrefs.fontSize ?? 16,
                lastChannelId: curPrefs.lastChannelId ?? null
            });
        }

        // there is a chance that the record with this name exists in localStorage, but is incomplete
        // I'm checking if the record is even there and if it is ->
        // -> checking every of it's values and assign the value to class prop, but ->
        // -> if there isn't any I assign the default one
    }

    get(): Preferences | null {
        const curPrefs: Preferences | null = this.storage.get<Preferences>(this.key);
        return curPrefs as Preferences;
    }

    update(changes: Partial<Preferences>): void {
        // update prefs to new values
        this.prefs.update(prev => ({ ...prev, ... changes }));

        // pass new object to storageService
        this.storage.set(this.key, this.prefs());
    }

    reset(): void {
        // pass this key to clear the record in storage 
        this.storage.remove(this.key);
    }
}

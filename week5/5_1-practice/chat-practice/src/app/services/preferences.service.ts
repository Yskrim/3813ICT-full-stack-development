import { inject, Injectable, OnInit } from '@angular/core';
import { StorageService } from './storage.service';

export interface Preferences {
    theme: 'light' | 'dark';
    fontSize: number;
    lastChannelId: number | null;
}

@Injectable({ providedIn: 'root' })

export class PreferencesService implements Preferences, OnInit {
    key = 'uiPref'
    theme: 'light' | 'dark' = 'light';
    fontSize: number = 16;
    lastChannelId: number | null = null;

    private storage = inject(StorageService);

    load(): void {
        // load data from StorageService stored under this key
        const curPrefs: Preferences | null = this.get();

        // if record exists
        if (curPrefs) {
            // update default values if those exist on the record
            this.theme = curPrefs?.theme ?? 'light';
            this.fontSize = curPrefs?.fontSize ?? 16;
            this.lastChannelId = curPrefs?.lastChannelId ?? null;
        }

        
        // there is a chance that the record with this name exists in localStorage, but is incomplete
        // I'm checking if the record is even there and if it is ->
        // -> checking every of it's values and assign the value to class prop, but ->
        // -> if there isn't any I assign the default one
    }

    get(): Preferences | null {
        const curPrefs: Preferences | null = this.storage.get<Preferences>(this.key);
        return curPrefs;
    }

    update(prefs: Preferences): void {
        // create a new preferences object from current values of the class,
        const newPrefs: Preferences = { 
            theme: prefs.theme,
            fontSize: prefs.fontSize,
            lastChannelId: prefs.lastChannelId,
        }

        // pass new object to storageService
        this.storage.set(this.key, newPrefs);
    }

    reset(): void {
        // pass this key to clear the record in storage 
        this.storage.remove(this.key);
    }

    ngOnInit(){
        this.load();
    }
}

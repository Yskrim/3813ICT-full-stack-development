import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class StorageService {
    get<T>(key: string): T | null {
        try{
            const raw = localStorage.getItem(key);
            return raw === null ? null : (JSON.parse(raw) as T);
        } catch(err) {
            console.warn('Item not found: ', key, err);
            return null;
        }
    }

    set(key: string, value: unknown ): void {
        try{
            localStorage.setItem(key, JSON.stringify(value));
        } catch(err) {
            console.warn('Could not save item: ', key, err);
        }
    }

    remove(key: string): void{
        try{ 
            localStorage.removeItem(key);
        } catch(err) {
            console.warn('Item does not exist: ', key, err);
        }
    }
}

// No binding this service to the interface of Preference service, better represent type as a generic <T>. Compiler will substitude the generic with the type of the value passed at the moment of operation.

// Storing the whole object { theme, fontSize, lastChannelId }, not it's singular key:value pairs.
import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { User, Role } from './auth.service';

export interface SessionUser {
    id: number;
    username: string;
    role: Role;
}

@Injectable({ providedIn: 'root' })

export class SessionService {
    private sessionKey: string = 'user';
    readonly sessionUser = signal<SessionUser | null>(null);

    // DI
    private storage = inject(StorageService);

    constructor() {
        this.readSessionUser();

        // add an event listener for other windows
        window.addEventListener('storage', e => {
            if (e.key !== this.sessionKey && e.key !== null) return;
            this.readSessionUser();
        });
    }

    // set session key to user id idk?
    setSessionKey(key: string): void {
        this.sessionKey = key;
    }

    // read stored user from session
    readSessionUser(): void {
        try {
            const user: SessionUser | null = this.storage.get(this.sessionKey);
            this.sessionUser.set(user);
        } catch (err) {
            console.warn(err);
        }
    }

    writeSessionUser(user: User): void {
        const curUser: SessionUser | null = this.storage.get(this.sessionKey);

        if (!curUser) {
            this.storage.set(this.sessionKey, user as SessionUser);
            this.sessionUser.set(user);
        } else {
            console.warn("Need to logout before logging in");
        }
    }
}




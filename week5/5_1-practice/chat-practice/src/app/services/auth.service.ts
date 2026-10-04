import { Injectable, computed, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

export type Role = 'superadmin' | 'groupadmin' | 'user';

export interface User {
    id: number;
    username: string;
    password: string;
    role: Role;
}

export const TEST_USERS: User[] = [
    { id: 1, username: 'super', password: '123', role: 'superadmin' },
    { id: 2, username: 'alice', password: '123', role: 'groupadmin' },
    { id: 3, username: 'ben', password: '123', role: 'user' },
];

const USER_KEY = 'user';

@Injectable({ providedIn: "root" })

export class AuthService {
    private storage = inject(StorageService);
    private router = inject(Router);

    private readonly userState = signal<User | null>(this.storage.get<User>(USER_KEY))
    readonly currentUser = computed(() => this.userState());
    readonly isLoggedIn = computed(() => this.userState() !== null);

    constructor() {
        window.addEventListener('storage', (e) => {
            // check if only USER_KEY triggers the action
            if (e.key !== USER_KEY && e.key !== null) return
            this.userState.set(this.storage.get<User>(USER_KEY));
        })
    }

    // hasRole(...roles)
    hasRole(...roles: Role[]): boolean {
        const user = this.currentUser();
        if (!user) return false;
        if (roles.includes(user.role)) return true;
        return false;
    }

    loginAs(user: User): void {
        const match: User | undefined = TEST_USERS.find(u => u.username === user.username && u.password === user.password);

        if (match) {
            const { password, ...safeMatch } = match;
            this.storage.set(USER_KEY, safeMatch);
            this.userState.set(this.storage.get<User>(USER_KEY));
            this.router.navigateByUrl('/channels');
        } else {
            console.warn("Invalid credentials");
        }
    }

    logout(): void {
        // check if isLoggedIn
        if (!this.isLoggedIn) return

        this.storage.remove(USER_KEY);
        this.userState.set(null);
        this.router.navigateByUrl('/login');
    }
}


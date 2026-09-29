import { inject, Injectable, OnInit, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export type Role = 'superadmin' | 'groupadmin' | 'user';

export interface SessionUser {
    id: number;
    username: string;
    role: Role;
}

export const TEST_USERS: SessionUser[] = [
    { id: 1, username: 'super', role: 'superadmin' },
    { id: 2, username: 'anna', role: 'groupadmin' },
    { id: 3, username: 'ben', role: 'user' },
];

const KEY = 'User';

@Injectable({ providedIn: 'root' })

export class SessionService implements OnInit{ 
    readonly currentUser = signal<SessionUser | null>(null);
    protected isLoggedIn = computed(() => this.currentUser() !== null);
    
    // inject a storage service
    private storage = inject(StorageService);

    // add an event listener for other windows
    constructor(){
        window.addEventListener('storage', e =>{
            if(e.key !== KEY && e.key !== null) return;
            this.loadUser();
        });
    }

    login(username: string): void{
        try {
            // iterate through all users and find the one with matching username
            const matchingUser: SessionUser | undefined = TEST_USERS.find(u => u.username === username);
            
            if (matchingUser) {
                // save this user to sessionStorage (localStorage for now)
                this.storage.set('User', matchingUser);
                
                // save this user to this service
                this.currentUser.set(matchingUser);

                console.log(localStorage.getItem('User'));
            }
        } catch(err) {
            console.warn(err);
        }
    }

    logout(): void {
        // clear sessionStorage OR remove the key, doesn't matter
        try{
            this.storage.remove('User');
            console.log(localStorage.getItem('User'));
            this.loadUser();

        } catch(e) {
            console.log("No user was logged in");
        }
    }

    readUser(): SessionUser | null {
        try{
            const user = this.storage.get(KEY);
            return user ? user as SessionUser : null;
        } catch {
            return null;
        }
    }

    loadUser(){
        this.currentUser.set(this.readUser()); 
    }

    ngOnInit(){
        // on start, get the user from storage if stored else null
       this.loadUser();
    }
}




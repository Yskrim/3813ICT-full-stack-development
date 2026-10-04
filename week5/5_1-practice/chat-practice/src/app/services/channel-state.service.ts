import { computed, Injectable, signal, inject } from '@angular/core';
import { PreferencesService } from './preferences.service';

export interface Channel {
    id: number;
    name: string;
}

const CHANNELS: Channel[] = [
    { id: 1, name: 'general' },
    { id: 2, name: 'random' },
    { id: 3, name: 'homework' },
];

@Injectable(
    { providedIn: 'root' }
)

export class ChannelStateService {
    readonly channels = signal<Channel[]>(CHANNELS);
    readonly currentChId = signal<number | null>(null);
    
    currentChannel = computed(() => this.channels().find(c => c.id === this.currentChId()) ?? null);
    channelCount = computed(() => this.channels().length);
    private count = this.channelCount();

    private prefService = inject(PreferencesService);

    constructor(){
        this.currentChId.set(this.prefService.prefs().lastChannelId);
    }

    select(id: number): void {
        this.currentChId.set(id);
        this.prefService.update({ lastChannelId : id })
    }

    add(name: string): void {
        const trimmed = name.trim();
        if (!trimmed) {
            console.warn("Name cannot be empty")
            return
        }
        const match = this.channels().find(c => c.name === name);
        if (match) {
            console.warn("channel with this name already exists")
            return
        }
        
        this.count += 1;
        this.channels.update(prev => [...prev, { id: this.count, name: trimmed }]);
    }

    remove(id: number): void {
        // check
        const exists = this.channels().find(c => c.id === id)
        if(!exists){
            console.warn("Channel does not exist")
            return
        }

        // check if deleting current channel
        if(id === this.currentChId()){
            this.currentChId.set(null)
        }

        const newChannels: Channel[] = this.channels().filter(ch => ch.id !== id);
        this.channels.set(newChannels);
    }
}

// list of chats on the side
// name of selected chat is in the header above the messages

// single service stores real data 
// data lives in browser storage

// components have to renew on their own when data changes == signal

// next app boot will open the last openned channel == Storage service

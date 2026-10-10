import { Component, Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';

export interface Group {
    id: number;
    name: string;
}

export type Operation = 'load' | 'create' | 'rename' | 'delete' | null;

@Injectable({ providedIn: 'root' })
export class GroupService {
    private http = inject(HttpClient);
    readonly groupsState = signal<Group[]>([]);
    readonly isWaiting = signal<Operation>(null);
    readonly isError = signal<Operation>(null);
    readonly ErrorMessage = signal<string>('');

    load(): Observable<Group[]> {
        return this.http.get<Group[]>('/api/groups').pipe(tap((data) => this.groupsState.set(data as Group[])));
    }

    create(name: string): Observable<Group> {
        return this.http
            .post<Group>('/api/groups', { name })
            .pipe(tap((newGroup) => this.groupsState.update((prev) => [...prev, newGroup])));
    }

    rename(id: string, name: string): Observable<Group> {
        return this.http
            .patch<Group>(`/api/groups/${id}`, { name })
            .pipe(
                tap((updated) =>
                    this.groupsState.update((prev) => prev.map((group) => (group.id === Number(id) ? updated : group))),
                ),
            );
    }

    delete(id: string): Observable<Group> {
        return this.http
            .delete<Group>(`/api/groups/${id}`)
            .pipe(tap(() => this.groupsState.update((prev) => prev.filter((g) => g.id !== Number(id)))));
    }


}

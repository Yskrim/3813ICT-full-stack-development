import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';

interface Group {
    id: number;
    name: string;
}

type Operation = 'load' | 'create' | 'rename' | 'delete' | null;

@Component({
    imports: [FormsModule],
    selector: 'app-groups',
    styleUrl: './groups.component.css',
    templateUrl: './groups.component.html',
})
export class GroupsComponent {
    private groupService = inject(GroupService);

    readonly groups = this.groupService.groupsState;
    readonly isProcessing = signal<Operation>(null);
    readonly isError = signal<Operation>(null);
    readonly ErrorMessage = signal<string>('');

    createName: string = '';
    renameName: string = '';
    renameId: string = '';
    deleteId: string = '';

    constructor() {
        this.load();
    }

    load(): void {
        this.isProcessing.set('load');
        this.groupService
            .load()
            .pipe(finalize(() => this.isProcessing.set(null)))
            .subscribe({
                error: (err) => {
                    this.isError.set('load');
                    this.ErrorMessage.set(this.describeError(err));
                },
                complete: () => console.log('Request complete'),
            });
    }

    create(): void {
        this.isProcessing.set('create');
        this.groupService
            .create(this.createName)
            .pipe(
                finalize(() => {
                    this.isProcessing.set(null);
                    this.createName = '';
                }),
            )
            .subscribe({
                error: (err) => {
                    this.isError.set('create');
                    this.ErrorMessage.set(this.describeError(err));
                },
                complete: () => {
                    if (this.isError() === 'create') this.isError.set(null);
                    console.log('NEW GROUP HAS BEEN CREATED');
                },
            });
    }

    rename(): void {
        this.isProcessing.set('rename');
        this.groupService
            .rename(this.renameId, this.renameName)
            .pipe(
                finalize(() => {
                    this.isProcessing.set(null);
                    this.renameName = '';
                    this.renameId = '';
                }),
            )
            .subscribe({
                error: (err) => {
                    this.isError.set('rename');
                    this.ErrorMessage.set(this.describeError(err));
                },
                complete: () => {
                    if (this.isError() === 'rename') this.isError.set(null);
                    console.log(`GROUP ${this.renameId} UPDATED TO ${this.renameName}`);
                },
            });
    }

    delete(): void {
        this.isProcessing.set('delete');
        this.groupService
            .delete(this.deleteId)
            .pipe(
                finalize(() => {
                    this.isProcessing.set(null);
                    this.deleteId = '';
                }),
            )
            .subscribe({
                error: (err) => {
                    this.isError.set('delete');
                    this.ErrorMessage.set(this.describeError(err));
                },
                complete: () => {
                    if (this.isError() === 'delete') this.isError.set(null);
                    console.log(`GROUP ${this.deleteId} HAS BEEN DELETED`);
                },
            });
    }

    describeError(err: HttpErrorResponse): string {
        const msg = err.error?.error;
        if (err.status === 0) return `Server not available: ${msg}`;
        if (err.status === 401) return `Need to relogin: ${msg}`;
        if (err.status === 403) return `Access requires privileges: ${msg}`;
        if (err.status === 502) return `Server is not responding: ${msg}`;
        if (err.status === 404) return `Not found: ${msg}`;
        return msg ?? `Something went wrong: ${msg}`;
    }
}

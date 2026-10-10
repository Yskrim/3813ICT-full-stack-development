import { Routes } from '@angular/router';
// components
import { PlaygroundComponent } from './pages/playground/playground.component';
import { ServicesLabComponent } from './pages/services-lab/services-lab.component';
import { ChannelsComponent } from './pages/channels/channels.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { GroupsComponent } from './pages/groups/groups.component';
// guards
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
    { path: 'playground', component: PlaygroundComponent },
    { path: 'services-lab', component: ServicesLabComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['superadmin', 'groupadmin'] },
    },
    { path: '', pathMatch: 'full', redirectTo: 'channels' },
    { path: 'channels', component: ChannelsComponent, canActivate: [authGuard] },
    { path: 'groups', component: GroupsComponent, canActivate: [authGuard] },
];

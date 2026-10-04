import { Routes } from '@angular/router';
import { PlaygroundComponent } from './pages/playground/playground.component';
import { HeaderComponent } from './components/header/header.component';
import { ServicesLabComponent } from './pages/services-lab/services-lab.component';
import { ChannelsComponent } from './pages/channels/channels.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';


export const routes: Routes = [
    { path: 'playground', component: PlaygroundComponent },
    { path: '*', component: HeaderComponent },
    { path: 'services-lab', component: ServicesLabComponent },


    { path: 'login', component: LoginComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['superadmin', 'groupadmin'] }
    },
    { path: '', pathMatch: 'full', redirectTo: 'channels' },
    { path: 'channels', component: ChannelsComponent, canActivate: [authGuard] }
];


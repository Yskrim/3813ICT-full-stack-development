import { Routes } from '@angular/router';
import { PlaygroundComponent } from './pages/playground/playground.component';
import { HeaderComponent } from './components/header/header.component';

export const routes: Routes = [
    { path: 'playground', component: PlaygroundComponent },
    { path: '*', component: HeaderComponent },
];

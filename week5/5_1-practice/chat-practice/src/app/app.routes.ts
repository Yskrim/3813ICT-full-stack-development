import { Routes } from '@angular/router';
import { PlaygroundComponent } from './pages/playground/playground.component';
import { HeaderComponent } from './components/header/header.component';
import { ServicesLabComponent } from './pages/services-lab/services-lab.component';


export const routes: Routes = [
    { path: 'playground', component: PlaygroundComponent },
    { path: '*', component: HeaderComponent },
    { path: 'services-lab', component: ServicesLabComponent },
];


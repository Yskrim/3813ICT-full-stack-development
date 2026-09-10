import { Routes } from '@angular/router';
import { Home } from './home/home'
import { Profile } from './profile/profile';
import { Login } from './login/login';

export const routes: Routes = [
    { path: "", component: Home, title: "Home" },
    { path: "login", component: Login, title: "Login" },
    { path: "profile", component: Profile, title: "Profile" },
];

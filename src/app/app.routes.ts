import { Routes } from '@angular/router';
import { WeatherComponent } from './components/weather/weather';
import { WeatherLifeComponent } from './components/weather-life/weather-life';
import { LoginComponent } from './components/login/login.component';
import { PostFormComponent } from './components/post-form/post-form.component';
import { PostListComponent } from './components/post-list/post-list.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', component: WeatherComponent },
  { path: 'weather-life', component: WeatherLifeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'create-post', component: PostFormComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: '' }
];

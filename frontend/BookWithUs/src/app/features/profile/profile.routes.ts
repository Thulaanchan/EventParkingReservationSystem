import { Routes } from '@angular/router';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfilePageComponent
  }
];

export default PROFILE_ROUTES;

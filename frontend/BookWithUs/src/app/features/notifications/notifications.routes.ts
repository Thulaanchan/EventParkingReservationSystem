import { Routes } from '@angular/router';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';

export const notificationsRoutes: Routes = [
  {
    path: '',
    component: NotificationsPageComponent
  }
];

export const routes: Routes = notificationsRoutes;
export default notificationsRoutes;

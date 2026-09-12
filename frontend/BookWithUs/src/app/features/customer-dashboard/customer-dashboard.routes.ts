import { Routes } from '@angular/router';
import { CustomerDashboardPageComponent } from './pages/customer-dashboard-page/customer-dashboard-page.component';

export const CUSTOMER_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: CustomerDashboardPageComponent
  }
];

export default CUSTOMER_DASHBOARD_ROUTES;

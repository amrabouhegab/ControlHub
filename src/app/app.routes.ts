import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
        data: { title: 'Dashboard', crumb: 'Home · Overview' }
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.UsersPageComponent),
        data: { title: 'User Management', crumb: 'People · Users' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
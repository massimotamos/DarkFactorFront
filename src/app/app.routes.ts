import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'wizard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/wizard/wizard.component').then(m => m.WizardComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/history/history.component').then(m => m.HistoryComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals.component').then(m => m.GoalsComponent)
      },
      {
        path: 'vault',
        loadComponent: () =>
          import('./features/vault/vault.component').then(m => m.VaultComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(m => m.ReportsComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'users' },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/reports/user-reports/user-reports.component').then(m => m.UserReportsComponent)
          },
          {
            path: 'goals',
            loadComponent: () =>
              import('./features/reports/goal-reports/goal-reports.component').then(m => m.GoalReportsComponent)
          },
          {
            path: 'transactions',
            loadComponent: () =>
              import('./features/reports/transaction-reports/transaction-reports.component').then(m => m.TransactionReportsComponent)
          },
          {
            path: 'sip',
            loadComponent: () =>
              import('./features/reports/sip-reports/sip-reports.component').then(m => m.SipReportsComponent)
          },
          {
            path: 'nominations',
            loadComponent: () =>
              import('./features/reports/nomination-reports/nomination-reports.component').then(m => m.NominationReportsComponent)
          },
          {
            path: 'app-analytics',
            loadComponent: () =>
              import('./features/reports/app-analytics/app-analytics.component').then(m => m.AppAnalyticsComponent)
          }
        ]
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

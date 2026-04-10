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
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () =>
              import('./features/reports/overview/overview.component').then(m => m.ReportsOverviewComponent)
          },
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
          },
          {
            path: 'payment-gateway',
            loadComponent: () =>
              import('./features/reports/payment-gateway/payment-gateway.component').then(m => m.PaymentGatewayComponent)
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/reports/orders-delivery/orders-delivery.component').then(m => m.OrdersDeliveryComponent)
          },
          {
            path: 'gifts',
            loadComponent: () =>
              import('./features/reports/gifts/gifts.component').then(m => m.GiftsComponent)
          },
          {
            path: 'rate-alerts',
            loadComponent: () =>
              import('./features/reports/rate-alerts/rate-alerts.component').then(m => m.RateAlertsComponent)
          },
          {
            path: 'revenue',
            loadComponent: () =>
              import('./features/reports/revenue/revenue.component').then(m => m.RevenueComponent)
          },
          {
            path: 'bank-accounts',
            loadComponent: () =>
              import('./features/reports/bank-accounts/bank-accounts.component').then(m => m.BankAccountsComponent)
          },
          {
            path: 'geography',
            loadComponent: () =>
              import('./features/reports/geography/geography.component').then(m => m.GeographyComponent)
          },
          {
            path: 'security',
            loadComponent: () =>
              import('./features/reports/security/security.component').then(m => m.SecurityComponent)
          },
          {
            path: 'web-mobile',
            loadComponent: () =>
              import('./features/reports/web-mobile/web-mobile.component').then(m => m.WebMobileComponent)
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

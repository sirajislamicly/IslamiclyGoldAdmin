import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="space-y-6">
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Reports</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed analytics and data insights</p>
      </div>

      <!-- Report tabs -->
      <div class="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl w-fit overflow-x-auto animate-fade-in">
        @for (tab of tabs; track tab.route) {
          <a [routerLink]="tab.route"
             routerLinkActive="bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
             [routerLinkActiveOptions]="{ exact: true }"
             class="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg whitespace-nowrap transition-all duration-200">
            {{ tab.label }}
          </a>
        }
      </div>

      <router-outlet />
    </div>
  `
})
export class ReportsComponent {
  tabs = [
    { label: 'Users', route: '/reports/users' },
    { label: 'Goals', route: '/reports/goals' },
    { label: 'Transactions', route: '/reports/transactions' },
    { label: 'SIP', route: '/reports/sip' },
    { label: 'Nominations', route: '/reports/nominations' },
    { label: 'App Analytics', route: '/reports/app-analytics' }
  ];
}

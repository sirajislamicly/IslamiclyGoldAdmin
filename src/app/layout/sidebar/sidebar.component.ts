import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
        <span class="text-xl font-bold text-gold-600">🪙 Gold Admin</span>
      </div>
      <nav class="flex-1 py-4 px-3 space-y-1">
        <a *ngFor="let item of menu"
           [routerLink]="item.route"
           routerLinkActive="bg-gold-50 text-gold-700 dark:bg-slate-700"
           class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
          <span>{{ item.icon }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </a>
      </nav>
      <button (click)="logout()"
              class="m-3 flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 transition">
        <span>🚪</span><span class="font-medium">Logout</span>
      </button>
    </aside>
  `
})
export class SidebarComponent {
  private auth = inject(AuthService);

  menu: MenuItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Users', icon: '👥', route: '/users' },
    { label: 'Transactions', icon: '💰', route: '/transactions' },
    { label: 'Goals', icon: '🎯', route: '/goals' },
    { label: 'Vault', icon: '🏦', route: '/vault' },
    { label: 'Analytics', icon: '📈', route: '/analytics' },
    { label: 'Settings', icon: '⚙️', route: '/settings' }
  ];

  logout() { this.auth.logout(); }
}

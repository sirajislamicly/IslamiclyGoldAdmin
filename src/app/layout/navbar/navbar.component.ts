import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
      <h1 class="text-lg font-semibold text-slate-700 dark:text-slate-200">Welcome back</h1>
      <div class="flex items-center gap-4">
        <button (click)="toggleTheme()" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          {{ dark() ? '☀️' : '🌙' }}
        </button>
        <button class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          🔔
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-gold-500 text-white flex items-center justify-center font-semibold">
            {{ initials() }}
          </div>
          <div class="text-sm">
            <div class="font-medium text-slate-700 dark:text-slate-200">{{ auth.currentUser()?.name || 'Admin' }}</div>
            <div class="text-slate-500">{{ auth.currentUser()?.role || 'administrator' }}</div>
          </div>
        </div>
        <button (click)="logout()" class="ml-4 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg">
          Logout
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  dark = signal(document.documentElement.classList.contains('dark'));

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    this.dark.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  initials(): string {
    const name = this.auth.currentUser()?.name || 'A';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  logout() {
    this.auth.logout();
  }
}

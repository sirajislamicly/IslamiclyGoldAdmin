import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  template: `
    <header class="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between px-5 gap-4 z-10">

      <!-- Left: Breadcrumb placeholder -->
      <div class="flex items-center gap-3 min-w-0">
        <h2 class="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">Dashboard</h2>
      </div>

      <!-- Center: Search -->
      <app-search-bar class="flex-1 max-w-lg hidden md:block" />

      <!-- Right: Actions -->
      <div class="flex items-center gap-1.5">

        <!-- Cmd+K hint -->
        <button (click)="openSearch()"
                class="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mr-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span class="font-medium">Search</span>
          <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono font-bold text-slate-500">&#8984;K</kbd>
        </button>

        <!-- Theme Toggle -->
        <button (click)="toggleTheme()"
                class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 tooltip-wrapper">
          @if (dark()) {
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>
          } @else {
            <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>
          }
          <span class="tooltip">{{ dark() ? 'Light mode' : 'Dark mode' }}</span>
        </button>

        <!-- Notifications -->
        <button class="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 tooltip-wrapper">
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          <span class="tooltip">Notifications</span>
        </button>

        <!-- Divider -->
        <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <!-- User Avatar -->
        <button class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
            {{ initials() }}
          </div>
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300 hidden md:block">{{ auth.currentUser()?.name || 'Admin' }}</span>
          <svg class="w-3.5 h-3.5 text-slate-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>
    </header>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  dark = signal(document.documentElement.classList.contains('dark'));

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.openSearch();
    }
  }

  openSearch(): void {
    const searchInput = document.querySelector('app-search-bar input') as HTMLInputElement;
    searchInput?.focus();
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    this.dark.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  initials(): string {
    const name = this.auth.currentUser()?.name || 'A';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}

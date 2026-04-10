import { Component, Input, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ReportLink { label: string; route: string; icon: string; color: string; }

@Component({
  selector: 'app-report-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in mb-6">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-1.5 text-[12px] text-slate-400 mb-3">
        <a routerLink="/dashboard" class="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Home</a>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <a routerLink="/reports" class="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Reports</a>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-slate-600 dark:text-slate-300 font-medium">{{ title }}</span>
      </div>

      <!-- Title Row -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <!-- Icon Badge -->
          <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold transition-transform duration-300 hover:scale-110"
               [ngClass]="iconBgClass">
            {{ iconText }}
          </div>
          <div>
            <h1 class="text-[22px] font-bold text-slate-800 dark:text-white tracking-tight">{{ title }}</h1>
            <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{{ description }}</p>
          </div>
        </div>

        <!-- Quick Switcher -->
        <div class="relative">
          <button (click)="switcherOpen.set(!switcherOpen())"
                  class="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 text-slate-500 dark:text-slate-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"/></svg>
            Switch Report
          </button>
          @if (switcherOpen()) {
            <div class="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 py-1.5 max-h-[400px] overflow-y-auto animate-scale-in">
              @for (r of reports; track r.route) {
                <a [routerLink]="r.route"
                   (click)="switcherOpen.set(false)"
                   class="flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                   [ngClass]="r.label === title ? 'bg-gold-50 dark:bg-slate-700' : ''">
                  <span class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold" [ngClass]="r.color">{{ r.icon }}</span>
                  <span class="font-medium" [ngClass]="r.label === title ? 'text-gold-700 dark:text-gold-400' : 'text-slate-700 dark:text-slate-300'">{{ r.label }}</span>
                  <svg *ngIf="r.label === title" class="w-3.5 h-3.5 text-gold-500 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </a>
              }
            </div>
          }
        </div>
      </div>

      <!-- Divider -->
      <div class="mt-4 h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent dark:from-slate-700 dark:via-slate-700 dark:to-transparent"></div>
    </div>
  `
})
export class ReportHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() iconText = 'R';
  @Input() iconBgClass = 'bg-gold-50 text-gold-600';

  switcherOpen = signal(false);

  reports: ReportLink[] = [
    { label: 'User Reports', route: '/reports/users', icon: 'U', color: 'bg-blue-50 text-blue-600' },
    { label: 'Goal Reports', route: '/reports/goals', icon: 'G', color: 'bg-violet-50 text-violet-600' },
    { label: 'Transaction Reports', route: '/reports/transactions', icon: 'T', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'SIP Reports', route: '/reports/sip', icon: 'S', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Nomination Reports', route: '/reports/nominations', icon: 'N', color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Payment Gateway', route: '/reports/payment-gateway', icon: 'P', color: 'bg-blue-50 text-blue-600' },
    { label: 'Orders & Delivery', route: '/reports/orders', icon: 'O', color: 'bg-violet-50 text-violet-600' },
    { label: 'Gift Transactions', route: '/reports/gifts', icon: 'G', color: 'bg-pink-50 text-pink-600' },
    { label: 'Rate Alerts', route: '/reports/rate-alerts', icon: 'A', color: 'bg-amber-50 text-amber-600' },
    { label: 'Revenue & Commission', route: '/reports/revenue', icon: 'R', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Bank Accounts', route: '/reports/bank-accounts', icon: 'B', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'User Geography', route: '/reports/geography', icon: 'G', color: 'bg-teal-50 text-teal-600' },
    { label: 'Security & Sessions', route: '/reports/security', icon: 'S', color: 'bg-red-50 text-red-600' },
    { label: 'Web vs Mobile', route: '/reports/web-mobile', icon: 'W', color: 'bg-blue-50 text-blue-600' },
    { label: 'App Analytics', route: '/reports/app-analytics', icon: 'A', color: 'bg-green-50 text-green-600' },
  ];

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-report-header')) this.switcherOpen.set(false);
  }
}

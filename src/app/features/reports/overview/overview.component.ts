import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  bgGradient: string;
  stats: string;
}

@Component({
  selector: 'app-reports-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Reports</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a report to view detailed analytics and insights</p>
      </div>

      <!-- Report Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (r of reports; track r.route; let i = $index) {
          <a [routerLink]="r.route"
             class="group card p-0 overflow-hidden hover-glow-gold animate-fade-in-up cursor-pointer"
             [style.animation-delay.ms]="i * 50">
            <!-- Gradient Top Bar -->
            <div class="h-1.5" [ngClass]="r.bgGradient"></div>

            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <!-- Icon -->
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                     [ngClass]="r.color">
                  {{ r.icon }}
                </div>
                <!-- Arrow -->
                <svg class="w-5 h-5 text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:text-gold-500 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>

              <h3 class="text-[15px] font-bold text-slate-800 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{{ r.title }}</h3>
              <p class="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ r.description }}</p>

              <!-- Quick Stat -->
              <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/40">
                <span class="text-[11px] font-medium text-slate-400">{{ r.stats }}</span>
              </div>
            </div>
          </a>
        }
      </div>
    </div>
  `
})
export class ReportsOverviewComponent {
  reports: ReportCard[] = [
    { title: 'User Reports', description: 'Total users, KYC status breakdown, registration trends and user growth analytics', icon: 'U', route: '/reports/users', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', bgGradient: 'bg-gradient-to-r from-blue-500 to-blue-600', stats: '200+ users tracked' },
    { title: 'Goal Reports', description: 'Goal analytics by type, metal preference, progress tracking and completion rates', icon: 'G', route: '/reports/goals', color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', bgGradient: 'bg-gradient-to-r from-violet-500 to-violet-600', stats: '100+ active goals' },
    { title: 'Transaction Reports', description: 'Buy, sell, order and gift transaction analytics with volume and value breakdown', icon: 'T', route: '/reports/transactions', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', bgGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600', stats: '700+ transactions' },
    { title: 'SIP Reports', description: 'SIP plans, payment schedules, success rates and frequency analysis', icon: 'S', route: '/reports/sip', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', bgGradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600', stats: '150+ SIP plans' },
    { title: 'Nomination Reports', description: 'Nominee data, relationship breakdown and coverage analytics', icon: 'N', route: '/reports/nominations', color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', bgGradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600', stats: '80+ nominations' },
    { title: 'Payment Gateway', description: 'Payment success, failure rates and gateway-wise performance analytics', icon: 'P', route: '/reports/payment-gateway', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', bgGradient: 'bg-gradient-to-r from-blue-500 to-indigo-600', stats: '300+ payments' },
    { title: 'Orders & Delivery', description: 'Order status funnel, product-wise breakdown and shipping analytics', icon: 'O', route: '/reports/orders', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', bgGradient: 'bg-gradient-to-r from-purple-500 to-purple-600', stats: '200+ orders' },
    { title: 'Gift Transactions', description: 'Peer-to-peer gift analytics, claimed vs unclaimed and engagement stats', icon: 'G', route: '/reports/gifts', color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', bgGradient: 'bg-gradient-to-r from-pink-500 to-pink-600', stats: '80+ gifts sent' },
    { title: 'Rate Alerts', description: 'Price alert monitoring, notification status and user engagement', icon: 'A', route: '/reports/rate-alerts', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', bgGradient: 'bg-gradient-to-r from-amber-500 to-amber-600', stats: '60+ alerts active' },
    { title: 'Revenue & Commission', description: 'Buy/sell revenue, GST collected, spread analysis and monthly trends', icon: 'R', route: '/reports/revenue', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', bgGradient: 'bg-gradient-to-r from-emerald-500 to-teal-600', stats: 'Revenue dashboard' },
    { title: 'Bank Accounts', description: 'Customer bank accounts, UPI details and withdrawal tracking', icon: 'B', route: '/reports/bank-accounts', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', bgGradient: 'bg-gradient-to-r from-slate-500 to-slate-600', stats: '150+ accounts' },
    { title: 'User Geography', description: 'State-wise user distribution and regional transaction volume heatmap', icon: 'G', route: '/reports/geography', color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', bgGradient: 'bg-gradient-to-r from-teal-500 to-teal-600', stats: '12 states covered' },
    { title: 'Security & Sessions', description: 'OTP verification funnel, active sessions and authentication logs', icon: 'S', route: '/reports/security', color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', bgGradient: 'bg-gradient-to-r from-red-500 to-red-600', stats: 'Auth monitoring' },
    { title: 'Web vs Mobile', description: 'Platform-wise transaction split and volume comparison analytics', icon: 'W', route: '/reports/web-mobile', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', bgGradient: 'bg-gradient-to-r from-blue-500 to-violet-600', stats: 'Platform insights' },
    { title: 'App Analytics', description: 'Play Store and App Store downloads, ratings and review analytics', icon: 'A', route: '/reports/app-analytics', color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', bgGradient: 'bg-gradient-to-r from-green-500 to-green-600', stats: '77K+ downloads' },
  ];
}

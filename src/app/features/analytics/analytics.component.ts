import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ApiService } from '../../core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Analytics</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform performance, revenue trends, and user growth</p>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Revenue" [value]="fC(totalRevenue)" delta="+12%" icon="R" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Total Users" [value]="fN(totalUsers)" delta="+4.2%" icon="U" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Avg Transaction" [value]="fC(avgTxn)" delta="+6%" icon="A" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
        <app-kpi-card label="Active SIPs" [value]="fN(activeSIPs)" delta="+18%" icon="S" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Trend -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200">Revenue Trends</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">Monthly buy volume over 12 months</p>
            </div>
            <div class="flex gap-3 text-xs"><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></span> Revenue</span></div>
          </div>
          <div class="h-52 flex items-end gap-1.5">
            @for (v of revenue; track $index) {
              <div class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full bg-gradient-to-t from-emerald-600 to-emerald-300 rounded-t-md chart-bar chart-bar-animated" [style.height.%]="v"></div>
                <div class="text-[9px] text-slate-400 font-medium mt-1">{{ months[$index] }}</div>
              </div>
            }
          </div>
        </div>

        <!-- User Growth -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200">User Growth</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">New user registrations monthly</p>
            </div>
            <div class="flex gap-3 text-xs"><span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span> Users</span></div>
          </div>
          <div class="h-52 flex items-end gap-1.5">
            @for (v of users; track $index) {
              <div class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full bg-gradient-to-t from-blue-600 to-blue-300 rounded-t-md chart-bar chart-bar-animated" [style.height.%]="v"></div>
                <div class="text-[9px] text-slate-400 font-medium mt-1">{{ months[$index] }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Metal Trends (full width) -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-sm font-bold text-slate-700 dark:text-slate-200">Gold vs Silver Volume</h2>
              <p class="text-[11px] text-slate-400 mt-0.5">Monthly metal-wise buy volume comparison</p>
            </div>
            <div class="flex gap-4 text-xs">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></span> Gold</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full"></span> Silver</span>
            </div>
          </div>
          <div class="h-52 flex items-end gap-1">
            @for (b of metalBars; track $index) {
              <div class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full flex gap-[2px] items-end justify-center" style="height: 200px">
                  <div class="w-[44%] bg-gradient-to-t from-amber-600 to-amber-300 rounded-t-md chart-bar chart-bar-animated" [style.height.%]="b.gold"></div>
                  <div class="w-[44%] bg-gradient-to-t from-slate-500 to-slate-300 rounded-t-md chart-bar chart-bar-animated" [style.height.%]="b.silver"></div>
                </div>
                <div class="text-[9px] text-slate-400 font-medium mt-1">{{ months[$index] }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @for (s of quickStats; track s.label) {
          <div class="card p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{{ s.label }}</div>
                <div class="text-xl font-bold mt-1 counter-value" [ngClass]="s.color">{{ s.value }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" [ngClass]="s.iconBg">
                <span class="text-sm font-bold">{{ s.icon }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private api = inject(ApiService);
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  revenue: number[] = this.months.map(() => 0);
  users: number[] = this.months.map(() => 0);
  metalBars: { gold: number; silver: number }[] = this.months.map(() => ({ gold: 0, silver: 0 }));
  totalRevenue = 0; totalUsers = 0; avgTxn = 0; activeSIPs = 0;
  quickStats: { label: string; value: string; color: string; icon: string; iconBg: string }[] = [];

  ngOnInit(): void {
    forkJoin({
      kpis: this.api.dashboardKpis(),
      userGrowth: this.api.analyticsUserGrowth(),
      metalTrend: this.api.analyticsMetalTrend()
    }).subscribe(res => {
      const stats = res.kpis;
      this.totalRevenue = stats.totalBuyValue || 0;
      this.totalUsers = stats.totalUsers || 0;
      this.avgTxn = stats.totalBuyTransactions ? Math.round(stats.totalBuyValue / stats.totalBuyTransactions) : 0;
      this.activeSIPs = stats.activeSIPs || 0;

      // Scale user growth to 0-100
      const ugMax = Math.max(...(res.userGrowth || []).map((u: any) => u.newUsers || 0), 1);
      this.users = this.months.map((_, i) => {
        const row = (res.userGrowth || []).find((u: any) => u.monthNum === i + 1);
        return row ? ((row.newUsers || 0) / ugMax) * 100 : 0;
      });

      // Scale metal trend
      const mtMaxGold = Math.max(...(res.metalTrend || []).map((m: any) => m.goldVolume || 0), 1);
      const mtMaxSilver = Math.max(...(res.metalTrend || []).map((m: any) => m.silverVolume || 0), 1);
      this.metalBars = this.months.map((_, i) => {
        const row = (res.metalTrend || []).find((m: any) => m.monthNum === i + 1);
        return {
          gold: row ? ((row.goldVolume || 0) / mtMaxGold) * 100 : 0,
          silver: row ? ((row.silverVolume || 0) / mtMaxSilver) * 100 : 0
        };
      });
      // Revenue chart uses gold+silver combined
      const revMax = Math.max(...(res.metalTrend || []).map((m: any) => (m.goldVolume || 0) + (m.silverVolume || 0)), 1);
      this.revenue = this.months.map((_, i) => {
        const row = (res.metalTrend || []).find((m: any) => m.monthNum === i + 1);
        return row ? (((row.goldVolume || 0) + (row.silverVolume || 0)) / revMax) * 100 : 0;
      });

      this.quickStats = [
        { label: 'Gold Buys', value: this.fN(stats.goldBuys || 0), color: 'text-amber-600', icon: 'Au', iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
        { label: 'Silver Buys', value: this.fN(stats.silverBuys || 0), color: 'text-slate-600 dark:text-slate-300', icon: 'Ag', iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-700' },
        { label: 'SIP Success', value: this.fN(stats.sipSuccess || 0), color: 'text-emerald-600', icon: '+', iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' },
        { label: 'Pending KYC', value: this.fN(stats.pendingKyc || 0), color: 'text-amber-600', icon: 'K', iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
      ];
    });
  }
  fN(n: number) { return new Intl.NumberFormat('en-IN').format(n); }
  fC(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
}

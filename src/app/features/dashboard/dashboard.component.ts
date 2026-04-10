import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { DateRangeFilterComponent } from '../../shared/components/date-range-filter/date-range-filter.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { MockDataService } from '../../core/services/mock-data.service';

interface Activity { user: string; action: string; time: string; type: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, KpiCardComponent, DateRangeFilterComponent, SkeletonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="animate-fade-in">
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time overview of your gold investment platform</p>
        </div>
        <app-date-range-filter (rangeChange)="onDateChange($event)" />
      </div>

      <!-- Live Rates Banner -->
      <div class="card card-gradient-border relative overflow-hidden animate-fade-in-up">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-orange-500/5 dark:from-amber-500/10 dark:via-yellow-500/5 dark:to-orange-500/10"></div>
        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm shadow-amber-500/20">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.96-3.12 3.19z"/></svg>
            </div>
            <div>
              <div class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Live Market Rates</div>
              <div class="text-[11px] text-slate-400 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Updated every 5 mins
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-8">
            @for (rate of rateCards; track rate.label) {
              <div class="text-center">
                <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{{ rate.label }}</div>
                <div class="text-lg font-bold mt-0.5 counter-value" [ngClass]="rate.color">{{ rate.value }}/g</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Loading Skeletons -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <app-skeleton variant="card" />
          }
        </div>
        <app-skeleton variant="chart" />
      }

      <!-- KPI Grid -->
      @if (!loading()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Users" [value]="formatNum(stats.totalUsers)" delta="+4.2%" icon="U"
                      iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      sparklineColor="bg-blue-400" />
        <app-kpi-card label="Total Goals" [value]="formatNum(stats.totalGoals)" delta="+12%" icon="G"
                      iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                      sparklineColor="bg-violet-400" />
        <app-kpi-card label="Buy Transactions" [value]="formatNum(stats.totalBuyTransactions)" delta="+8.4%" icon="B"
                      iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Sell Transactions" [value]="formatNum(stats.totalSellTransactions)" delta="+3.1%" icon="S"
                      iconBgClass="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      sparklineColor="bg-orange-400" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Redeem Requests" [value]="formatNum(stats.totalRedeemRequests)" delta="+5.2%" icon="R"
                      iconBgClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                      sparklineColor="bg-indigo-400" />
        <app-kpi-card label="SIP Success" [value]="formatNum(stats.sipSuccess)" delta="+15.3%" icon="+"
                      iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      sparklineColor="bg-emerald-400" />
        <app-kpi-card label="SIP Failed" [value]="formatNum(stats.sipFailed)" delta="-2.1%" icon="!"
                      iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      sparklineColor="bg-red-400" />
        <app-kpi-card label="Nominations" [value]="formatNum(stats.nominationsCreated)" delta="+6.8%" icon="N"
                      iconBgClass="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                      sparklineColor="bg-cyan-400" />
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Transaction Volume Chart - 8 cols -->
        <div class="lg:col-span-8 card animate-fade-in-up">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h2 class="text-base font-bold text-slate-800 dark:text-white">Transaction Volume</h2>
              <p class="text-xs text-slate-400 mt-0.5">Gold vs Silver buy transactions trend</p>
            </div>
            <div class="flex gap-4 text-xs font-medium">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></span> Gold</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-gradient-to-r from-slate-300 to-slate-500 rounded-full"></span> Silver</span>
            </div>
          </div>
          <div class="h-56 flex items-end gap-1">
            @for (b of bars; track $index) {
              <div class="flex-1 flex flex-col items-center gap-0.5">
                <div class="w-full flex gap-[2px] items-end justify-center" style="height: 200px">
                  <div class="w-[44%] bg-gradient-to-t from-amber-600 to-amber-300 rounded-t-md chart-bar chart-bar-animated"
                       [style.height.%]="b.gold"></div>
                  <div class="w-[44%] bg-gradient-to-t from-slate-500 to-slate-300 rounded-t-md chart-bar chart-bar-animated"
                       [style.height.%]="b.silver"></div>
                </div>
                <div class="text-[10px] text-slate-400 font-medium mt-1">{{ months[$index] }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Quick Stats - 4 cols -->
        <div class="lg:col-span-4 space-y-4">
          <div class="card animate-fade-in-up p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Buy Volume</div>
                <div class="text-xl font-bold text-emerald-600 counter-value mt-0.5">{{ formatCurrency(stats.totalBuyValue) }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>
              </div>
            </div>
          </div>
          <div class="card animate-fade-in-up p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Sell Volume</div>
                <div class="text-xl font-bold text-red-600 counter-value mt-0.5">{{ formatCurrency(stats.totalSellValue) }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"/></svg>
              </div>
            </div>
          </div>
          <div class="card animate-fade-in-up p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Active KYC Users</div>
                <div class="text-xl font-bold text-blue-600 counter-value mt-0.5">{{ formatNum(stats.activeUsers) }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
          </div>
          <div class="card animate-fade-in-up p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Active SIPs</div>
                <div class="text-xl font-bold text-amber-600 counter-value mt-0.5">{{ formatNum(stats.activeSIPs) }}</div>
              </div>
              <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity - 5 cols -->
        <div class="lg:col-span-5 card animate-fade-in-up">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-800 dark:text-white">Recent Activity</h2>
            <a routerLink="/reports/transactions" class="text-xs text-gold-600 hover:text-gold-700 font-semibold transition-colors">View all</a>
          </div>
          <div class="space-y-1">
            @for (a of activity; track a.time; let i = $index) {
              <div class="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                     [ngClass]="a.type === 'buy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                                a.type === 'sell' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                                a.type === 'kyc' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                                'bg-amber-50 text-amber-600 dark:bg-amber-900/30'">
                  {{ a.user[0] }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-[13px] text-slate-700 dark:text-slate-200 truncate"><span class="font-semibold">{{ a.user }}</span> {{ a.action }}</div>
                  <div class="text-[11px] text-slate-400">{{ a.time }}</div>
                </div>
                <div class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                     [ngClass]="a.type === 'buy' ? 'bg-emerald-400' : a.type === 'sell' ? 'bg-red-400' : a.type === 'kyc' ? 'bg-blue-400' : 'bg-amber-400'"></div>
              </div>
            }
          </div>
        </div>

        <!-- Metal Donut - 7 cols -->
        <div class="lg:col-span-7 card animate-fade-in-up">
          <h2 class="text-base font-bold text-slate-800 dark:text-white mb-4">Buy Volume by Metal</h2>
          <div class="flex items-center gap-10">
            <div class="relative w-36 h-36 flex-shrink-0">
              <svg class="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-100 dark:text-slate-700"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="url(#goldGrad)" stroke-width="3"
                        [attr.stroke-dasharray]="goldPct + ' ' + (100 - goldPct)" stroke-dashoffset="0" stroke-linecap="round"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke="url(#silverGrad)" stroke-width="3"
                        [attr.stroke-dasharray]="silverPct + ' ' + (100 - silverPct)"
                        [attr.stroke-dashoffset]="-goldPct" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="goldGrad"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#d97706"/></linearGradient>
                  <linearGradient id="silverGrad"><stop stop-color="#94a3b8"/><stop offset="1" stop-color="#64748b"/></linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-[10px] text-slate-400 font-medium">Total</span>
                <span class="text-xl font-bold text-slate-800 dark:text-white counter-value">{{ formatNum(stats.totalBuyTransactions) }}</span>
              </div>
            </div>
            <div class="flex-1 space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Gold</span>
                    <span class="text-sm font-bold text-slate-800 dark:text-white">{{ goldPct.toFixed(1) }}%</span>
                  </div>
                  <div class="mt-1.5 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000" [style.width.%]="goldPct"></div>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1">{{ stats.goldBuys }} transactions</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-3 h-3 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full flex-shrink-0"></div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Silver</span>
                    <span class="text-sm font-bold text-slate-800 dark:text-white">{{ silverPct.toFixed(1) }}%</span>
                  </div>
                  <div class="mt-1.5 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-1000" [style.width.%]="silverPct"></div>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1">{{ stats.silverBuys }} transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  private mockData = inject(MockDataService);

  stats!: ReturnType<MockDataService['getDashboardStats']>;
  rateCards: { label: string; value: string; color: string }[] = [];

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  bars: { gold: number; silver: number }[] = [];
  goldPct = 0;
  silverPct = 0;

  activity: Activity[] = [
    { user: 'Swaroop K.', action: 'bought 1.96g silver', time: '2 min ago', type: 'buy' },
    { user: 'Jagdish D.', action: 'bought 500 INR gold', time: '14 min ago', type: 'buy' },
    { user: 'Mohd Irfan', action: 'sold 0.25g gold', time: '1 hr ago', type: 'sell' },
    { user: 'Sandeep K.', action: 'completed KYC', time: '2 hr ago', type: 'kyc' },
    { user: 'Ayesha N.', action: 'created goal "Marriage"', time: '3 hr ago', type: 'goal' },
    { user: 'Omar R.', action: 'ordered 10g Gold Coin', time: '5 hr ago', type: 'buy' },
    { user: 'Fatima S.', action: 'started SIP 481/week', time: '6 hr ago', type: 'buy' },
  ];

  ngOnInit(): void {
    // Simulate loading
    setTimeout(() => this.loading.set(false), 800);
    this.stats = this.mockData.getDashboardStats();
    const rates = this.mockData.getCurrentRates();
    this.rateCards = [
      { label: 'Gold Buy', value: rates.gBuy, color: 'text-amber-600' },
      { label: 'Gold Sell', value: rates.gSell, color: 'text-amber-500' },
      { label: 'Silver Buy', value: rates.sBuy, color: 'text-slate-600 dark:text-slate-300' },
      { label: 'Silver Sell', value: rates.sSell, color: 'text-slate-500' },
      { label: 'Gold GST', value: rates.gBuyGst, color: 'text-slate-400' },
    ];
    this.bars = this.months.map(() => ({ gold: 20 + Math.random() * 70, silver: 10 + Math.random() * 60 }));
    this.goldPct = (this.stats.goldBuys / this.stats.totalBuyTransactions) * 100;
    this.silverPct = (this.stats.silverBuys / this.stats.totalBuyTransactions) * 100;
  }

  onDateChange(range: { from: string; to: string }): void {}
  formatNum(n: number): string { return new Intl.NumberFormat('en-IN').format(n); }
  formatCurrency(n: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
}
